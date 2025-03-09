const express = require("express");
const Project = require("../models/Project");

const router = express.Router();
// Add these routes to projectRoutes.js

// Update a project
router.put("/:id", async (req, res) => {
  try {
    const { title, description } = req.body;
    
    // Validate request body
    if (!title || !description) {
      return res.status(400).json({ message: "Title and description are required" });
    }

    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      { title, description },
      { new: true }
    );

    if (!updatedProject) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.json(updatedProject);
  } catch (err) {
    console.error("Error updating project:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Delete a project
router.delete("/:id", async (req, res) => {
  try {
    const deletedProject = await Project.findByIdAndDelete(req.params.id);
    
    if (!deletedProject) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.json({ message: "Project deleted successfully" });
  } catch (err) {
    console.error("Error deleting project:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});
// Fetch all projects
router.post("/", async (req, res) => {
  try {
    const { title, description } = req.body;
    
    // Validate request body
    if (!title || !description) {
      return res.status(400).json({ message: "Title and description are required" });
    }

    const newProject = new Project({ title, description, expanded: true, taskCount: 0 });
    await newProject.save();

    res.status(201).json(newProject);  // ✅ Make sure response is JSON
  } catch (err) {
    console.error("Error creating project:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});


module.exports = router;
