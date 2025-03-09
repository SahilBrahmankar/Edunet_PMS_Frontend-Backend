import { useState, useEffect, useContext } from 'react';
import { FaGithub, FaFileUpload, FaFilePdf, FaFileCsv, FaTrash, FaExternalLinkAlt, FaDownload } from 'react-icons/fa';
import axios from 'axios';

export default function UploadProject() {
  const [githubUrl, setGithubUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadType, setUploadType] = useState('github'); // github, csv, pdf
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [popupType, setPopupType] = useState('success'); // success or error

  // API base URL
  const API_URL = 'http://localhost:5001/api';

  // Show popup notification
  const showNotification = (message, type = 'success') => {
    setPopupMessage(message);
    setPopupType(type);
    setShowPopup(true);
    setTimeout(() => setShowPopup(false), 3000); // Hide after 3 seconds
  };
  
  // Fetch uploads when component mounts
  useEffect(() => {
    fetchUploads();
  }, []);

  // Function to fetch user's uploads
  const fetchUploads = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/uploads`, {
        withCredentials: true
      });
      setUploads(response.data);
    } catch (err) {
      console.error('Error fetching uploads:', err);
      showNotification('Failed to load your projects', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handle GitHub URL submission
  const handleGithubSubmit = async (e) => {
    e.preventDefault();
    if (!githubUrl) {
      showNotification('Please enter a GitHub URL', 'error');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(`${API_URL}/uploads/github`, {
        url: githubUrl,
        name: projectName || 'GitHub Project',
        description: projectDescription
      }, {
        withCredentials: true
      });

      showNotification('GitHub project added successfully!');
      setGithubUrl('');
      setProjectName('');
      setProjectDescription('');
      fetchUploads();
    } catch (err) {
      console.error('Error adding GitHub project:', err);
      showNotification(err.response?.data?.message || 'Failed to add GitHub project', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handle file selection
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
  };

  // Handle file submission
  const handleFileSubmit = async () => {
    if (!selectedFile) {
      showNotification('Please select a file', 'error');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('name', projectName || selectedFile.name);
    formData.append('description', projectDescription);

    try {
      setLoading(true);
      const response = await axios.post(`${API_URL}/uploads/file`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        withCredentials: true
      });

      showNotification('File uploaded successfully!');
      setSelectedFile(null);
      setProjectName('');
      setProjectDescription('');
      document.getElementById('file-upload').value = '';
      fetchUploads();
    } catch (err) {
      console.error('Error uploading file:', err);
      showNotification(err.response?.data?.message || 'Failed to upload file', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handle project deletion
  const handleDeleteProject = async (id) => {
    if (!window.confirm('Are you sure you want to delete this project?')) {
      return;
    }

    try {
      setLoading(true);
      await axios.delete(`${API_URL}/uploads/${id}`, {
        withCredentials: true
      });
      
      showNotification('Project deleted successfully!');
      fetchUploads();
    } catch (err) {
      console.error('Error deleting project:', err);
      showNotification('Failed to delete project', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Function to format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get file icon based on type and theme
  const getFileIcon = (type) => {
    switch (type) {
      case 'github':
        return <FaGithub />;
      case 'pdf':
        return <FaFilePdf className="text-red-500" />;
      case 'csv':
        return <FaFileCsv className="text-green-500" />;
      default:
        return <FaFileUpload />;
    }
  };

  return (
    <div className="p-6 light:bg-white dark:bg-gray-900 light:text-gray-800 dark:text-white min-h-screen">
      <h2 className="text-2xl font-bold mb-6">Upload Project</h2>

      {/* Popup Notification */}
      {showPopup && (
        <div className={`fixed top-4 right-4 ${popupType === 'success' ? 'bg-green-600' : 'bg-red-600'} text-white p-3 rounded shadow-lg z-50 animate-fade-in-right`}>
          <div className="flex justify-between items-center">
            <span>{popupMessage}</span>
            <button onClick={() => setShowPopup(false)} className="ml-4">×</button>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {/* Project Name and Description - Common for both upload types */}
        <div className="light:bg-gray-100 dark:bg-gray-800 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-4">Project Details</h3>
          <div className="space-y-4">
            <div>
              <label htmlFor="project-name" className="block mb-1">Project Name</label>
              <input
                id="project-name"
                type="text"
                placeholder="Enter project name"
                className="w-full p-2 rounded bg-gray-700 dark:bg-gray-700 text-white dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                onChange={(e) => setProjectName(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="project-description" className="block mb-1">Description (Optional)</label>
              <textarea
                id="project-description"
                placeholder="Enter project description"
                className="w-full p-2 rounded bg-gray-700 dark:bg-gray-700 text-white dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
                rows="3"
              ></textarea>
            </div>
          </div>
        </div>

        {/* GitHub URL Upload */}
        <div className="light:bg-gray-100 dark:bg-gray-800 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <FaGithub /> GitHub Repository
          </h3>
          <form onSubmit={handleGithubSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Enter GitHub Repository URL"
              className="w-full p-2 rounded bg-gray-700 dark:bg-gray-700 text-white dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
            />

            <button
              type="submit"
              className="bg-purple-600 hover:bg-purple-500 px-4 py-2 rounded text-white"
              disabled={loading}
            >
              {loading ? 'Importing...' : 'Import from GitHub'}
            </button>
          </form>
        </div>

        {/* File Upload Section */}
        <div className="light:bg-gray-100 dark:bg-gray-800 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-4">File Upload</h3>
          
          <div className="space-y-4">
            <div className="flex gap-4">
              <button
                onClick={() => setUploadType('csv')}
                className={`flex-1 p-4 rounded-lg border-2 ${
                  uploadType === 'csv' ? 'border-purple-500' : 'light:border-gray-300 dark:border-gray-700'
                } hover:border-purple-500 transition-colors light:bg-white dark:bg-gray-900 light:text-gray-800 dark:text-white`}
              >
                <FaFileCsv className="text-3xl mx-auto mb-2" />
                <p>CSV File</p>
              </button>
              
              <button
                onClick={() => setUploadType('pdf')}
                className={`flex-1 p-4 rounded-lg border-2 ${
                  uploadType === 'pdf' ? 'border-purple-500' : 'light:border-gray-300 dark:border-gray-700'
                } hover:border-purple-500 transition-colors light:bg-white dark:bg-gray-900 light:text-gray-800 dark:text-white`}
              >
                <FaFilePdf className="text-3xl mx-auto mb-2" />
                <p>PDF Report</p>
              </button>
            </div>

            <div className="relative">
              <input
                type="file"
                accept={uploadType === 'csv' ? '.csv' : '.pdf'}
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer flex items-center justify-center gap-2 w-full p-4 border-2 border-dashed light:border-gray-300 dark:border-gray-600 rounded-lg hover:border-purple-500 transition-colors light:bg-white dark:bg-gray-900 light:text-gray-800 dark:text-white"
              >
                <FaFileUpload className="text-xl" />
                {selectedFile ? selectedFile.name : 'Choose a file'}
              </label>
            </div>

            {selectedFile && (
              <button
                className="w-full bg-purple-600 hover:bg-purple-500 px-4 py-2 rounded text-white"
                onClick={handleFileSubmit}
                disabled={loading}
              >
                {loading ? 'Uploading...' : 'Upload File'}
              </button>
            )}
          </div>
        </div>

        {/* Uploaded Projects Section */}
        <div className="light:bg-gray-100 dark:bg-gray-800 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-4">Your Projects</h3>
          
          {loading && <p className="light:text-gray-500 dark:text-gray-400">Loading your projects...</p>}
          
          {!loading && uploads.length === 0 && (
            <p className="light:text-gray-500 dark:text-gray-400">You haven't uploaded any projects yet.</p>
          )}
          
          {uploads.length > 0 && (
            <div className="space-y-4">
              {uploads.map(upload => (
                <div key={upload._id} className="light:bg-white dark:bg-gray-900 p-4 rounded-lg flex items-center justify-between shadow">
                  <div className="flex items-center space-x-4">
                    <div className="text-2xl">
                      {getFileIcon(upload.uploadType)}
                    </div>
                    <div>
                      <h4 className="font-semibold">{upload.name}</h4>
                      <p className="text-sm light:text-gray-500 dark:text-gray-400">
                        {upload.description || 'No description'} • 
                        {upload.uploadType.toUpperCase()} • 
                        {formatDate(upload.uploadDate)}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    {upload.uploadType === 'github' ? (
                      <a 
                        href={upload.githubUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-2 light:bg-gray-200 dark:bg-gray-700 hover:light:bg-gray-300 hover:dark:bg-gray-600 rounded"
                        title="Open GitHub repository"
                      >
                        <FaExternalLinkAlt />
                      </a>
                    ) : (
                      <a 
                        href={`${API_URL}/uploads/file/${upload._id}`} 
                        className="p-2 light:bg-gray-200 dark:bg-gray-700 hover:light:bg-gray-300 hover:dark:bg-gray-600 rounded"
                        title="Download file"
                      >
                        <FaDownload />
                      </a>
                    )}
                    <button 
                      onClick={() => handleDeleteProject(upload._id)}
                      className="p-2 light:bg-red-100 dark:bg-red-700 hover:light:bg-red-200 hover:dark:bg-red-600 light:text-red-700 dark:text-white rounded"
                      title="Delete project"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* CSS for animation */}
      <style jsx>{`
        @keyframes fadeInRight {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-fade-in-right {
          animation: fadeInRight 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}