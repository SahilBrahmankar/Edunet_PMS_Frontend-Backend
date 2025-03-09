const mongoose = require("mongoose");

const TaskSchema = new mongoose.Schema({
    projectId: {
      type: String, // Changed from ObjectId to String
      required: true
    },
    title: { type: String, required: true },
    description: String,
    tag: String,
    status: { 
      type: String, 
      enum: ["requested", "todo", "inProgress", "done"], 
      default: "requested" 
    }
  });
module.exports = mongoose.model("Task", TaskSchema);