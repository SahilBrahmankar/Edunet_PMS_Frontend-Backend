const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Set up multer for file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf' || file.mimetype === 'text/csv') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and CSV files are allowed'), false);
    }
  }
});

// Project Upload Schema
const ProjectUploadSchema = new mongoose.Schema({
  name: String,
  description: String,
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  uploadType: {
    type: String,
    enum: ['github', 'pdf', 'csv'],
    required: true
  },
  githubUrl: String,
  filePath: String,
  fileName: String,
  fileType: String,
  uploadDate: {
    type: Date,
    default: Date.now
  }
});

const ProjectUpload = mongoose.model('ProjectUpload', ProjectUploadSchema);

// GitHub URL upload route
router.post('/github', async (req, res) => {
  try {
    const { url, name, description } = req.body;
    
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    if (!url) {
      return res.status(400).json({ message: 'GitHub URL is required' });
    }
    
    const newProject = new ProjectUpload({
      name: name || 'GitHub Project',
      description: description || '',
      userId: req.user._id,
      uploadType: 'github',
      githubUrl: url
    });
    
    await newProject.save();
    res.status(201).json({ 
      success: true, 
      message: 'GitHub project added successfully',
      project: newProject
    });
  } catch (error) {
    console.error('Error adding GitHub project:', error);
    res.status(500).json({ message: 'Failed to add GitHub project' });
  }
});

// File upload route (PDF and CSV)
router.post('/file', upload.single('file'), async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    const { name, description } = req.body;
    const fileType = path.extname(req.file.originalname).toLowerCase().substring(1);
    
    const newProject = new ProjectUpload({
      name: name || req.file.originalname,
      description: description || '',
      userId: req.user._id,
      uploadType: fileType === 'pdf' ? 'pdf' : 'csv',
      filePath: req.file.path,
      fileName: req.file.originalname,
      fileType: fileType
    });
    
    await newProject.save();
    res.status(201).json({ 
      success: true, 
      message: 'File uploaded successfully',
      project: newProject
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ message: 'Failed to upload file' });
  }
});

// Get all uploads for the current user
router.get('/', async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const uploads = await ProjectUpload.find({ userId: req.user._id })
      .sort({ uploadDate: -1 });
    
    res.json(uploads);
  } catch (error) {
    console.error('Error fetching uploads:', error);
    res.status(500).json({ message: 'Failed to fetch uploads' });
  }
});

// Download/serve a file
router.get('/file/:id', async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const upload = await ProjectUpload.findOne({ 
      _id: req.params.id,
      userId: req.user._id
    });
    
    if (!upload) {
      return res.status(404).json({ message: 'File not found' });
    }
    
    if (upload.uploadType === 'github') {
      return res.redirect(upload.githubUrl);
    }
    
    if (!upload.filePath) {
      return res.status(404).json({ message: 'File not found' });
    }
    
    res.download(upload.filePath, upload.fileName);
  } catch (error) {
    console.error('Error downloading file:', error);
    res.status(500).json({ message: 'Failed to download file' });
  }
});

// Delete an upload
router.delete('/:id', async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const upload = await ProjectUpload.findOne({ 
      _id: req.params.id,
      userId: req.user._id
    });
    
    if (!upload) {
      return res.status(404).json({ message: 'Upload not found' });
    }
    
    // Delete file if it exists
    if (upload.filePath && fs.existsSync(upload.filePath)) {
      fs.unlinkSync(upload.filePath);
    }
    
    await ProjectUpload.deleteOne({ _id: req.params.id });
    
    res.json({ success: true, message: 'Upload deleted successfully' });
  } catch (error) {
    console.error('Error deleting upload:', error);
    res.status(500).json({ message: 'Failed to delete upload' });
  }
});

module.exports = router;