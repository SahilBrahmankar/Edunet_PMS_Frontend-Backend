const mongoose = require("mongoose");

const ProjectSchema = new mongoose.Schema({
  title: String,
  description: String,
  expanded: Boolean,
  taskCount: Number,
});

module.exports = mongoose.model("Project", ProjectSchema);
