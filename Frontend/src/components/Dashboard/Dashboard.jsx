import { useState, useEffect } from 'react';
import { FaPlus } from "react-icons/fa";
import { LineChart, Line, PieChart, Pie, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell } from 'recharts';
import UploadProject from './UploadProject';
import ProjectBoard from './ProjectBoard';
import YourWorks from './YourWorks';
import Community from './Community';
import Calendar from './Calendar';
import Navbar from '../Navigation/Navbar';
import Sidebar from '../Navigation/Sidebar';
import Toast from "../Toast";

export default function Dashboard({ setPage }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [userEmail, setUserEmail] = useState(""); 
  const [activeSection, setActiveSection] = useState('dashboard');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success");
  const [projectStats, setProjectStats] = useState({
    totalProjects: 12,
    totalTasks: 48,
    teamMembers: 8
  });

  const projectData = [
    { month: 'Jan', completed: 4, ongoing: 6 },
    { month: 'Feb', completed: 6, ongoing: 4 },
    { month: 'Mar', completed: 8, ongoing: 5 },
    { month: 'Apr', completed: 5, ongoing: 7 },
    { month: 'May', completed: 7, ongoing: 3 },
  ];

  const taskCompletionData = [
    { name: 'Completed', value: 63 },
    { name: 'In Progress', value: 27 },
    { name: 'Pending', value: 10 },
  ];

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658'];

  const getThemeColors = () => ({
    sidebar: isDarkMode ? 'bg-gray-800' : 'bg-white',
    navbar: isDarkMode ? 'bg-gray-800' : 'bg-white',
    content: isDarkMode ? 'bg-gray-900' : 'bg-gray-100',
    text: isDarkMode ? 'text-white' : 'text-gray-900',
    hoverBg: isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-200',
    cardBg: isDarkMode ? 'bg-gray-800' : 'bg-white',
    border: isDarkMode ? 'border-gray-700' : 'border-gray-200',
  });

  useEffect(() => {
    // Check auth status on mount
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      // First check localStorage for user email
      const storedEmail = localStorage.getItem("userEmail");
      if (storedEmail) {
        setUserEmail(storedEmail);
        
        // Show welcome toast on initial load
        setToastMessage(`Welcome back, ${storedEmail}!`);
        setToastType("success");
        setShowToast(true);
      }
      
      // Then try to verify with server
      const response = await fetch("http://localhost:5001/auth/user", {
        credentials: "include",
      });
      const data = await response.json();
      
      if (response.ok) {
        // Update email if different from localStorage
        if (data.email && data.email !== storedEmail) {
          setUserEmail(data.email);
          localStorage.setItem("userEmail", data.email);
        }
      } else {
        // If server check fails but we have localStorage email, keep user logged in
        if (!storedEmail) {
          setPage("home");
        }
      }
    } catch (error) {
      console.error("Auth check error:", error);
      // Only redirect if no localStorage email
      if (!localStorage.getItem("userEmail")) {
        setPage("home");
      }
    }
  };

  const handleLogout = async () => {
    try {
      const response = await fetch("http://localhost:5001/auth/logout", {
        method: "GET",
        credentials: "include",
      });
  
      if (response.ok) {
        localStorage.removeItem("isAuthenticated");
        localStorage.removeItem("userEmail");
        localStorage.removeItem("token");
        setPage("home"); // This will redirect to HomePage
      } else {
        console.error("Logout failed");
      }
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  const colors = getThemeColors();

  const updateStats = (type, value) => {
    setProjectStats(prev => ({
      ...prev,
      [type]: prev[type] + value
    }));
  };

  const DashboardContent = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={`${colors.cardBg} p-6 rounded-lg shadow-lg ${colors.text}`}>
          <h3 className="text-xl font-semibold">Total Projects</h3>
          <p className="text-3xl font-bold mt-2">{projectStats.totalProjects}</p>
          <p className={isDarkMode ? "text-gray-400" : "text-gray-600"}>
            {Math.floor(projectStats.totalProjects * 0.3)} in progress
          </p>
        </div>
        <div className={`${colors.cardBg} p-6 rounded-lg shadow-lg ${colors.text}`}>
          <h3 className="text-xl font-semibold">Total Tasks</h3>
          <p className="text-3xl font-bold mt-2">{projectStats.totalTasks}</p>
          <p className={isDarkMode ? "text-gray-400" : "text-gray-600"}>
            {Math.floor(projectStats.totalTasks * 0.4)} pending
          </p>
        </div>
        <div className={`${colors.cardBg} p-6 rounded-lg shadow-lg ${colors.text}`}>
          <h3 className="text-xl font-semibold">Team Members</h3>
          <p className="text-3xl font-bold mt-2">{projectStats.teamMembers}</p>
          <p className={isDarkMode ? "text-gray-400" : "text-gray-600"}>
            {Math.floor(projectStats.teamMembers * 0.5)} online
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className={`${colors.cardBg} p-6 rounded-lg shadow-lg ${colors.text}`}>
          <h3 className="text-xl font-semibold mb-4">Project Progress</h3>
          <LineChart width={500} height={300} data={projectData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" stroke={isDarkMode ? "#fff" : "#000"} />
            <YAxis stroke={isDarkMode ? "#fff" : "#000"} />
            <Tooltip contentStyle={{ backgroundColor: isDarkMode ? '#1f2937' : '#fff' }} />
            <Legend />
            <Line type="monotone" dataKey="completed" stroke="#8884d8" />
            <Line type="monotone" dataKey="ongoing" stroke="#82ca9d" />
          </LineChart>
        </div>

        <div className={`${colors.cardBg} p-6 rounded-lg shadow-lg ${colors.text}`}>
          <h3 className="text-xl font-semibold mb-4">Task Completion Status</h3>
          <div className="flex justify-center">
            <PieChart width={400} height={300}>
              <Pie
                data={taskCompletionData}
                cx={200}
                cy={150}
                innerRadius={60}
                outerRadius={100}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="value"
                label
              >
                {taskCompletionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: isDarkMode ? '#1f2937' : '#fff' }} />
              <Legend />
            </PieChart>
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <button 
          onClick={() => {
            setActiveSection('projects');
            updateStats('totalProjects', 1);
          }} 
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 px-4 py-2 rounded-lg text-white"
        >
          <FaPlus /> Create New Project
        </button>
        <button 
          onClick={() => updateStats('totalTasks', 1)}
          className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 px-4 py-2 rounded-lg text-white"
        >
          <FaPlus /> Add New Task
        </button>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <DashboardContent />;
      case 'projects':
        return <ProjectBoard updateStats={updateStats} isDarkMode={isDarkMode} />;
      case 'works':
        return <YourWorks isDarkMode={isDarkMode} />;
      case 'upload':
        return <UploadProject />;
      case 'community':
        return <Community isDarkMode={isDarkMode} updateStats={updateStats} />;
      case 'calendar':
        return <Calendar isDarkMode={isDarkMode} />;
      default:
        return <DashboardContent />;
    }
  };

  return (
    <div className={`min-h-screen ${colors.content} ${colors.text}`}>
      {showToast && (
        <Toast 
          message={toastMessage} 
          type={toastType} 
          onClose={() => setShowToast(false)}
        />
      )}
      <Navbar 
  colors={colors}
  sidebarOpen={sidebarOpen}
  setSidebarOpen={setSidebarOpen}
  isDarkMode={isDarkMode}
  userEmail={userEmail}
  setPage={setPage}
/>

      <div className="flex pt-16">
        <Sidebar 
          colors={colors}
          sidebarOpen={sidebarOpen}
          isDarkMode={isDarkMode} 
          setIsDarkMode={setIsDarkMode}
          activeSection={activeSection}
          setActiveSection={setActiveSection}
        />

        <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-16'}`}>
          <div className="p-6">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}