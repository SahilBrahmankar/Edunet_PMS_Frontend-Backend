import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { FaPlus, FaEdit, FaTrash, FaTasks, FaChevronDown, FaChevronRight } from 'react-icons/fa';

const initialProjects = [];

const initialColumns = {
  requested: {
    title: 'REQUESTED',
    items: []
  },
  todo: {
    title: 'TO DO',
    items: []
  },
  inProgress: {
    title: 'IN PROGRESS',
    items: []
  },
  done: {
    title: 'DONE',
    items: []
  }
};

export default function ProjectBoard({ updateStats, isDarkMode }) {
  const [projects, setProjects] = useState(initialProjects);
  const [columns, setColumns] = useState(initialColumns);
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [showEditProjectModal, setShowEditProjectModal] = useState(false);
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [showEditTaskModal, setShowEditTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [editingProject, setEditingProject] = useState(null);
  const [newProject, setNewProject] = useState({ title: '', description: '' });
  const [newTask, setNewTask] = useState({ title: '', description: '', projectId: '' });
  const [activeProject, setActiveProject] = useState(null);
  const [viewMode, setViewMode] = useState('all'); // 'all' or 'project'
  const [currentProjectId, setCurrentProjectId] = useState(null);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  // Load data from localStorage and then from server
  useEffect(() => {
    // First try to load from localStorage
    const loadFromLocalStorage = () => {
      try {
        const savedProjects = localStorage.getItem('projects');
        const savedColumns = localStorage.getItem('columns');
        const savedViewMode = localStorage.getItem('viewMode');
        const savedCurrentProjectId = localStorage.getItem('currentProjectId');
        
        if (savedProjects) {
          setProjects(JSON.parse(savedProjects));
        }
        
        if (savedColumns) {
          setColumns(JSON.parse(savedColumns));
        }
        
        if (savedViewMode) {
          setViewMode(savedViewMode);
        }
        
        if (savedCurrentProjectId) {
          setCurrentProjectId(savedCurrentProjectId);
          const savedActiveProject = JSON.parse(savedProjects).find(
            p => (p._id || p.id) === savedCurrentProjectId
          );
          if (savedActiveProject) {
            setActiveProject(savedActiveProject);
          }
        }
        
        // If we have data in localStorage, mark as loaded
        if (savedProjects && savedColumns) {
          setIsDataLoaded(true);
          return true;
        }
        return false;
      } catch (error) {
        console.error("Error loading data from localStorage:", error);
        return false;
      }
    };

    // If localStorage doesn't have data, fetch from API
    const fetchFromServer = () => {
      // Fetch projects
      fetch("http://localhost:5001/api/projects")
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            const projectsWithExpanded = data.map(project => ({
              ...project,
              expanded: false
            }));
            setProjects(projectsWithExpanded);
            localStorage.setItem('projects', JSON.stringify(projectsWithExpanded));
          }
        })
        .catch(err => console.error("Error fetching projects:", err));

      // Fetch tasks
      fetch("http://localhost:5001/api/tasks")
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            const groupedTasks = {
              requested: { title: "REQUESTED", items: [] },
              todo: { title: "TO DO", items: [] },
              inProgress: { title: "IN PROGRESS", items: [] },
              done: { title: "DONE", items: [] }
            };
      
            data.forEach(task => {
              // Ensure the status is valid
              const status = task.status && groupedTasks[task.status] ? task.status : "requested";
              groupedTasks[status].items.push(task);
            });
      
            setColumns(groupedTasks);
            localStorage.setItem('columns', JSON.stringify(groupedTasks));
          }
        })
        .catch(err => console.error("Error fetching tasks:", err));
      
      setIsDataLoaded(true);
    };

    // First try localStorage, if that fails, fetch from server
    const hasLocalData = loadFromLocalStorage();
    if (!hasLocalData) {
      fetchFromServer();
    }
  }, []);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    if (isDataLoaded) {
      localStorage.setItem('projects', JSON.stringify(projects));
      localStorage.setItem('columns', JSON.stringify(columns));
      localStorage.setItem('viewMode', viewMode);
      if (currentProjectId) {
        localStorage.setItem('currentProjectId', currentProjectId);
      } else {
        localStorage.removeItem('currentProjectId');
      }
    }
  }, [projects, columns, viewMode, currentProjectId, isDataLoaded]);

  // Filter tasks based on view mode
  const getFilteredColumns = () => {
    if (viewMode === 'all') {
      return columns;
    } else {
      const filteredColumns = {};
      Object.entries(columns).forEach(([columnId, column]) => {
        filteredColumns[columnId] = {
          ...column,
          items: column.items.filter(item => item.projectId === currentProjectId)
        };
      });
      return filteredColumns;
    }
  };

  const filteredColumns = getFilteredColumns();

  const onDragEnd = async (result) => {
    if (!result.destination) return;
    const { source, destination } = result;
  
    const sourceColumn = columns[source.droppableId];
    const destColumn = columns[destination.droppableId];
  
    const sourceItems = [...sourceColumn.items];
    const destItems = destination.droppableId !== source.droppableId ? [...destColumn.items] : sourceItems;
  
    const [movedItem] = sourceItems.splice(source.index, 1);
    
    // Update status if the column changed
    if (source.droppableId !== destination.droppableId) {
      movedItem.status = destination.droppableId;
      
      // Update status in the backend
      try {
        const res = await fetch(`http://localhost:5001/api/tasks/${movedItem._id || movedItem.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...movedItem,
            status: destination.droppableId
          }),
        });
        
        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`Error updating task status: ${errorText}`);
        }
      } catch (error) {
        console.error("Error updating task status:", error);
        // Continue with UI update even if backend fails
      }
    }
    
    destItems.splice(destination.index, 0, movedItem);
  
    const newColumns = {
      ...columns,
      [source.droppableId]: { ...sourceColumn, items: sourceItems },
      [destination.droppableId]: { ...destColumn, items: destItems }
    };

    setColumns(newColumns);
  };

  const handleAddProject = async () => {
    if (!newProject.title.trim()) return;

    try {
      const res = await fetch("http://localhost:5001/api/projects", { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProject),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Error ${res.status}: ${errorText}`);
      }

      const data = await res.json();
      
      // Add expanded flag to the new project
      const newProjectWithExpanded = {
        ...data,
        expanded: false
      };
      
      const updatedProjects = [...projects, newProjectWithExpanded];
      setProjects(updatedProjects);
      setNewProject({ title: "", description: "" });
      setShowNewProjectModal(false);
    } catch (error) {
      console.error("Error adding project:", error);
      alert("Failed to add project. Check the console for details.");
    }
  };

  const handleUpdateProject = async () => {
    if (!editingProject.title.trim()) return;
    
    try {
      const projectId = editingProject._id || editingProject.id;
      const res = await fetch(`http://localhost:5001/api/projects/${projectId}`, { 
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editingProject.title,
          description: editingProject.description
        }),
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Error ${res.status}: ${errorText}`);
      }
      
      const updatedProjects = projects.map(project => 
        (project._id || project.id) === (editingProject._id || editingProject.id) ? editingProject : project
      );
      setProjects(updatedProjects);
      setShowEditProjectModal(false);
      
      // Update active project if we're currently viewing it
      if (currentProjectId === (editingProject._id || editingProject.id)) {
        setActiveProject(editingProject);
      }
      
      setEditingProject(null);
    } catch (error) {
      console.error("Error updating project:", error);
      alert("Failed to update project. Check the console for details.");
    }
  };

  const handleDeleteProject = async (projectId) => {
    try {
      const res = await fetch(`http://localhost:5001/api/projects/${projectId}`, { 
        method: "DELETE" 
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Error ${res.status}: ${errorText}`);
      }
      
      const updatedProjects = projects.filter(project => (project._id || project.id) !== projectId);
      setProjects(updatedProjects);
    
      // Remove all tasks for this project
      const newColumns = {};
      Object.entries(columns).forEach(([columnId, column]) => {
        newColumns[columnId] = {
          ...column,
          items: column.items.filter(item => item.projectId !== projectId),
        };
      });
    
      setColumns(newColumns);
      
      // If we're viewing the deleted project, go back to all projects view
      if (currentProjectId === projectId) {
        viewAllProjects();
      }
    } catch (error) {
      console.error("Error deleting project:", error);
      alert("Failed to delete project. Check the console for details.");
    }
  };

  const handleAddTask = async () => {
    if (!newTask.title.trim() || !newTask.projectId) {
      alert("Please enter a task title and select a valid project.");
      return;
    }

    try {
      console.log("📤 Sending task data:", newTask);

      // Find the project
      const project = projects.find(p => (p._id || p.id) === newTask.projectId);
      
      // Calculate next task number for this project
      const projectTasks = Object.values(columns)
        .flatMap(col => col.items)
        .filter(task => task.projectId === newTask.projectId);
      
      const nextTaskNum = projectTasks.length + 1;
      
      const taskData = {
        projectId: newTask.projectId.trim(),
        title: newTask.title,
        description: newTask.description,
        tag: `Task-${nextTaskNum}`,
        status: "requested",
      };

      const res = await fetch("http://localhost:5001/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(taskData),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Error ${res.status}: ${errorText}`);
      }

      const data = await res.json();
      console.log("✅ Task added successfully:", data);

      // Update the columns
      const updatedColumns = {
        ...columns,
        requested: {
          ...columns.requested,
          items: [...columns.requested.items, data],
        },
      };
      setColumns(updatedColumns);

      // Update project task count
      const updatedProjects = projects.map(p => 
        (p._id || p.id) === newTask.projectId
          ? {...p, taskCount: (p.taskCount || 0) + 1}
          : p
      );
      setProjects(updatedProjects);

      // Reset form and close modal
      setNewTask({ title: "", description: "", projectId: "" });
      setShowNewTaskModal(false);
    } catch (error) {
      console.error("❌ Error adding task:", error);
      alert(`Failed to add task. ${error.message}`);
    }
  };

  const handleEditTask = (task) => {
    setEditingTask({...task});
    setShowEditTaskModal(true);
  };
  
  const handleDeleteTask = async (taskId) => {
    try {
      const res = await fetch(`http://localhost:5001/api/tasks/${taskId}`, { 
        method: "DELETE" 
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Error ${res.status}: ${errorText}`);
      }
    
      // Remove the task from columns
      const newColumns = {};
      Object.entries(columns).forEach(([columnId, column]) => {
        newColumns[columnId] = {
          ...column,
          items: column.items.filter(item => (item._id || item.id) !== taskId),
        };
      });
    
      setColumns(newColumns);
    } catch (error) {
      console.error("Error deleting task:", error);
      alert("Failed to delete task. Check the console for details.");
    }
  };
  
  const handleUpdateTask = async () => {
    if (!editingTask.title.trim() || !editingTask.projectId) {
      alert("Task title and project are required.");
      return;
    }
    
    try {
      const res = await fetch(`http://localhost:5001/api/tasks/${editingTask._id || editingTask.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editingTask.title,
          description: editingTask.description,
          projectId: editingTask.projectId,
          tag: editingTask.tag,
          status: editingTask.status || "requested"
        }),
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Error ${res.status}: ${errorText}`);
      }
      
      // Update the task in columns
      const newColumns = {};
      Object.entries(columns).forEach(([columnId, column]) => {
        newColumns[columnId] = {
          ...column,
          items: column.items.map(item =>
            (item._id || item.id) === (editingTask._id || editingTask.id) ? editingTask : item
          )
        };
      });
      
      setColumns(newColumns);
      setShowEditTaskModal(false);
      setEditingTask(null);
    } catch (error) {
      console.error("Error updating task:", error);
      alert("Failed to update task. Check the console for details.");
    }
  };

  const toggleProjectExpansion = (projectId) => {
    const updatedProjects = projects.map(project => 
      (project._id || project.id) === projectId 
        ? { ...project, expanded: !project.expanded } 
        : project
    );
    setProjects(updatedProjects);
  };

  const viewProjectTasks = (projectId) => {
    setViewMode('project');
    setCurrentProjectId(projectId);
    const currentProject = projects.find(p => (p._id || p.id) === projectId);
    if (currentProject) {
      setActiveProject(currentProject);
    }
  };

  const viewAllProjects = () => {
    setViewMode('all');
    setCurrentProjectId(null);
    setActiveProject(null);
  };

  const countProjectTasks = (projectId) => {
    let count = 0;
    Object.values(columns).forEach(column => {
      count += column.items.filter(item => item.projectId === projectId).length;
    });
    return count;
  };

  const handleEditProject = (project) => {
    setEditingProject({...project});
    setShowEditProjectModal(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold">
            {viewMode === 'project' && activeProject 
              ? <>
                  <button 
                    onClick={viewAllProjects}
                    className="text-purple-500 hover:text-purple-400 mr-2"
                  >
                    Projects
                  </button> 
                  / {activeProject.title}
                </>
              : 'Projects Overview'
            }
          </h2>
        </div>
        <div className="flex gap-2">
          {viewMode === 'project' && activeProject && (
            <>
              <button
                onClick={() => {
                  setNewTask({ ...newTask, projectId: activeProject._id || activeProject.id });
                  setShowNewTaskModal(true);
                }}
                className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg text-white flex items-center gap-2"
              >
                <FaPlus /> New Task
              </button>
              <button
                onClick={() => handleEditProject(activeProject)}
                className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg text-white flex items-center gap-2"
              >
                <FaEdit /> Edit Project
              </button>
            </>
          )}
          <button
            onClick={() => setShowNewProjectModal(true)}
            className="bg-purple-600 hover:bg-purple-500 px-4 py-2 rounded-lg text-white flex items-center gap-2"
          >
            <FaPlus /> New Project
          </button>
        </div>
      </div>

      {viewMode === 'all' && (
        <div className={`mb-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-4`}>
          <h3 className="text-xl font-bold mb-4">All Projects</h3>
          <div className="space-y-4">
            {projects.map(project => (
              <div 
                key={project._id || project.id} 
                className={`${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'} p-4 rounded-lg cursor-pointer transition-colors`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => toggleProjectExpansion(project._id || project.id)}
                        className="text-purple-500"
                      >
                        {project.expanded ? <FaChevronDown /> : <FaChevronRight />}
                      </button>
                      <h4 
                        className="font-semibold text-lg hover:text-purple-500 transition-colors"
                        onClick={() => viewProjectTasks(project._id || project.id)}
                      >
                        {project.title}
                      </h4>
                      <span className="ml-2 text-xs bg-purple-500 px-2 py-1 rounded text-white">
                        {countProjectTasks(project._id || project.id)} tasks
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setNewTask({ ...newTask, projectId: project._id || project.id });
                        setShowNewTaskModal(true);
                      }}
                      className="text-blue-500 hover:text-blue-400 flex items-center gap-1 text-sm"
                    >
                      <FaPlus /> Task
                    </button>
                    <button
                      onClick={() => handleEditProject(project)}
                      className="text-blue-500 hover:text-blue-400"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDeleteProject(project._id || project.id)}
                      className="text-red-500 hover:text-red-400"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
                
                {project.expanded && (
                  <div className="mt-2 ml-7">
                    <p className="text-sm text-gray-400">{project.description}</p>
                    
                    {/* Project tasks summary */}
                    <div className="mt-4 grid grid-cols-4 gap-2">
                      {Object.entries(columns).map(([columnId, column]) => {
                        const columnTasks = column.items.filter(item => item.projectId === (project._id || project.id));
                        if (columnTasks.length === 0) return null;
                        
                        return (
                          <div key={columnId} className={`p-2 rounded-md ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-xs font-medium">{column.title}</span>
                              <span className="text-xs bg-gray-600 px-1 rounded">{columnTasks.length}</span>
                            </div>
                            <div className="space-y-1">
                              {columnTasks.slice(0, 2).map(task => (
                                <div 
                                  key={task._id || task.id} 
                                  className={`text-xs p-1 rounded ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}
                                >
                                  {task.title}
                                </div>
                              ))}
                              {columnTasks.length > 2 && (
                                <div className="text-xs text-purple-500">
                                  +{columnTasks.length - 2} more...
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    
                    <button 
                      onClick={() => viewProjectTasks(project._id || project.id)}
                      className="mt-4 text-purple-500 hover:text-purple-400 text-sm flex items-center gap-1"
                    >
                      <FaTasks /> View All Tasks
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {Object.entries(filteredColumns).map(([columnId, column]) => (
            <div key={columnId} className={isDarkMode ? "bg-gray-800 p-4 rounded-lg" : "bg-white p-4 rounded-lg shadow-lg"}>
              <h3 className="text-lg font-semibold mb-4 flex justify-between items-center">
                {column.title}
                <span className="text-sm bg-gray-700 px-2 py-1 rounded">{column.items.length}</span>
              </h3>
              <Droppable droppableId={columnId}>
                {(provided) => (
                  <div 
                    ref={provided.innerRef} 
                    {...provided.droppableProps} 
                    className="space-y-4 min-h-32"
                  >
                    {column.items.map((item, index) => (
                      <Draggable key={item._id || item.id} draggableId={item._id || item.id} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={isDarkMode ? "bg-gray-700 p-4 rounded-lg" : "bg-gray-50 p-4 rounded-lg shadow"}
                          >
                            <div className="flex justify-between items-start">
                              <h4 className="font-semibold">{item.title}</h4>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleEditTask(item)}
                                  className="text-blue-400 hover:text-blue-300"
                                >
                                  <FaEdit />
                                </button>
                                <button
                                  onClick={() => handleDeleteTask(item._id || item.id)}
                                  className="text-red-400 hover:text-red-300"
                                >
                                  <FaTrash />
                                </button>
                              </div>
                            </div>
                            <p className="text-sm text-gray-400 mt-2">{item.description}</p>
                            <div className="mt-4 flex justify-between items-center">
                              <span className="text-xs bg-purple-500 px-2 py-1 rounded text-white">{item.tag}</span>
                              {viewMode === 'all' && (
                                <span className="text-xs px-2 py-1 bg-blue-500 rounded text-white">
                                  {projects.find(p => (p._id || p.id) === item.projectId)?.title || 'Unknown'}
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>

      {/* New Project Modal */}
      {showNewProjectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={isDarkMode ? "bg-gray-800 p-6 rounded-lg w-96" : "bg-white p-6 rounded-lg w-96 shadow-lg"}>
            <h3 className="text-xl font-bold mb-4">Add New Project</h3>
            <input
              type="text"
              placeholder="Project Title"
              className={`w-full p-2 mb-4 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded`}
              value={newProject.title}
              onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
            />
            <textarea
              placeholder="Project Description"
              className={`w-full p-2 mb-4 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded`}
              value={newProject.description}
              onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowNewProjectModal(false)}
                className="px-4 py-2 bg-gray-600 rounded text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleAddProject}
                className="px-4 py-2 bg-purple-600 rounded text-white"
              >
                Add Project
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Project Modal */}
      {showEditProjectModal && editingProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={isDarkMode ? "bg-gray-800 p-6 rounded-lg w-96" : "bg-white p-6 rounded-lg w-96 shadow-lg"}>
            <h3 className="text-xl font-bold mb-4">Edit Project</h3>
            <input
              type="text"
              placeholder="Project Title"
              className={`w-full p-2 mb-4 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded`}
              value={editingProject.title}
              onChange={(e) => setEditingProject({ ...editingProject, title: e.target.value })}
            />
            <textarea
              placeholder="Project Description"
              className={`w-full p-2 mb-4 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded`}
              value={editingProject.description}
              onChange={(e) => setEditingProject({ ...editingProject, description: e.target.value })}
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowEditProjectModal(false)}
                className="px-4 py-2 bg-gray-600 rounded text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateProject}
                className="px-4 py-2 bg-purple-600 rounded text-white"
              >
                Update Project
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Task Modal */}
      {showNewTaskModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={isDarkMode ? "bg-gray-800 p-6 rounded-lg w-96" : "bg-white p-6 rounded-lg w-96 shadow-lg"}>
            <h3 className="text-xl font-bold mb-4">Add New Task</h3>
            <input
              type="text"
              placeholder="Task Title"
              className={`w-full p-2 mb-4 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded`}
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
            />
            <textarea
              placeholder="Task Description"
              className={`w-full p-2 mb-4 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded`}
              value={newTask.description}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
            />
            <select
              className={`w-full p-2 mb-4 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded`}
              value={newTask.projectId}
              onChange={(e) => setNewTask({ ...newTask, projectId: e.target.value })}
            >
              <option value="">Select Project</option>
              {projects.map(project => (
                <option key={project._id || project.id} value={project._id || project.id}>
                  {project.title}
                </option>
              ))}
            </select>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowNewTaskModal(false)}
                className="px-4 py-2 bg-gray-600 rounded text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleAddTask}
                className="px-4 py-2 bg-blue-600 rounded text-white"
              >
                Add Task
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Edit Task Modal */}
      {showEditTaskModal && editingTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={isDarkMode ? "bg-gray-800 p-6 rounded-lg w-96" : "bg-white p-6 rounded-lg w-96 shadow-lg"}>
            <h3 className="text-xl font-bold mb-4">Edit Task</h3>
            <input
              type="text"
              placeholder="Task Title"
              className={`w-full p-2 mb-4 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded`}
              value={editingTask.title}
              onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
            />
            <textarea
              placeholder="Task Description"
              className={`w-full p-2 mb-4 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded`}
              value={editingTask.description}
              onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
            />
            <select
              className={`w-full p-2 mb-4 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded`}
              value={editingTask.projectId}
              onChange={(e) => setEditingTask({ ...editingTask, projectId: e.target.value })}
            >
              {projects.map(project => (
                <option key={project.id} value={project.id}>{project.title}</option>
              ))}
            </select>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowEditTaskModal(false)}
                className="px-4 py-2 bg-gray-600 rounded text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateTask}
                className="px-4 py-2 bg-blue-600 rounded text-white"
              >
                Update Task
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}