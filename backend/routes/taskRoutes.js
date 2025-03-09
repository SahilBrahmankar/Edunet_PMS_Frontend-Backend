const express = require("express");
const mongoose = require("mongoose");
const Task = require("../models/Task");

const router = express.Router();
// Add these routes to taskRoutes.js

// Update a task
router.put("/:id", async (req, res) => {
  try {
    const { projectId, title, description, tag, status } = req.body;
    
    // Validate request body
    if (!projectId || !title) {
      return res.status(400).json({ message: "ProjectId and title are required" });
    }

    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      { projectId, title, description, tag, status },
      { new: true }
    );

    if (!updatedTask) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json(updatedTask);
  } catch (err) {
    console.error("Error updating task:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Delete a task
router.delete("/:id", async (req, res) => {
  try {
    const deletedTask = await Task.findByIdAndDelete(req.params.id);
    
    if (!deletedTask) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json({ message: "Task deleted successfully" });
  } catch (err) {
    console.error("Error deleting task:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});
// ✅ Create a new task
router.post("/", async (req, res) => {
  try {
    console.log("Received Task Data:", req.body);
    
    let { projectId, title, description, tag, status } = req.body;
    
    // Set default values if not provided
    status = status || "requested";
    tag = tag || `Task-${Date.now()}`;
    
    if (!projectId) {
      return res.status(400).json({ message: "projectId is required" });
    }
    
    // Skip ObjectId validation - just use the projectId as is
    // This allows using simple string IDs like 'p1', 'p2', etc.
    
    const newTask = new Task({ 
      projectId, // Use as-is without conversion
      title, 
      description: description || "", 
      tag, 
      status 
    });
    
    console.log("Saving task:", newTask);
    
    await newTask.save();
    
    res.status(201).json(newTask);
  } catch (err) {
    console.error("Error creating task:", err);
    res.status(500).json({ 
      message: "Internal Server Error", 
      error: err.message
    });
  }
});

module.exports = router;
