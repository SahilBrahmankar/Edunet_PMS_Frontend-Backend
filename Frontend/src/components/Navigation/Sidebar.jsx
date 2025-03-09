import { FaHome, FaBriefcase, FaTasks, FaUserFriends, FaCalendarAlt, FaMoon, FaSun, FaUpload } from 'react-icons/fa';

export default function Sidebar({ 
  colors, 
  sidebarOpen, 
  isDarkMode, 
  setIsDarkMode, 
  activeSection, 
  setActiveSection 
}) {
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <aside 
      className={`fixed left-0 top-16 bottom-0 transition-all duration-300 ease-in-out z-30 
      ${isDarkMode ? 'bg-gray-800' : 'bg-white border-r border-gray-200'} ${sidebarOpen ? 'w-64' : 'w-16'} flex flex-col`}
    >
      <nav className="p-4 space-y-4 flex-grow">
        <a 
          href="#" 
          onClick={() => setActiveSection('dashboard')}
          className={`flex items-center gap-3 p-2 rounded overflow-hidden transition-colors
            ${activeSection === 'dashboard' 
              ? 'bg-purple-500 text-white' 
              : isDarkMode 
                ? 'hover:bg-gray-700' 
                : 'hover:bg-gray-100'}`}
        >
          <FaHome /> {sidebarOpen && 'Dashboard'}
        </a>
        <a 
          href="#" 
          onClick={() => setActiveSection('projects')}
          className={`flex items-center gap-3 p-2 rounded overflow-hidden transition-colors
            ${activeSection === 'projects' 
              ? 'bg-purple-500 text-white' 
              : isDarkMode 
                ? 'hover:bg-gray-700' 
                : 'hover:bg-gray-100'}`}
        >
          <FaBriefcase /> {sidebarOpen && 'Projects'}
        </a>

        <a 
          href="#" 
          onClick={() => setActiveSection('works')}
          className={`flex items-center gap-3 p-2 rounded overflow-hidden transition-colors
            ${activeSection === 'works' 
              ? 'bg-purple-500 text-white' 
              : isDarkMode 
                ? 'hover:bg-gray-700' 
                : 'hover:bg-gray-100'}`}
        >
          <FaTasks /> {sidebarOpen && 'Your Works'}
        </a>

        <a 
          href="#" 
          onClick={() => setActiveSection('upload')}
          className={`flex items-center gap-3 p-2 rounded overflow-hidden transition-colors
            ${activeSection === 'upload' 
              ? 'bg-purple-500 text-white' 
              : isDarkMode 
                ? 'hover:bg-gray-700' 
                : 'hover:bg-gray-100'}`}
        >
          <FaUpload /> {sidebarOpen && 'Upload Project'}
        </a>

        <a 
          href="#" 
          onClick={() => setActiveSection('community')}
          className={`flex items-center gap-3 p-2 rounded overflow-hidden transition-colors
            ${activeSection === 'community' 
              ? 'bg-purple-500 text-white' 
              : isDarkMode 
                ? 'hover:bg-gray-700' 
                : 'hover:bg-gray-100'}`}
        >
          <FaUserFriends /> {sidebarOpen && 'Community'}
        </a>
        <a 
          href="#" 
          onClick={() => setActiveSection('calendar')}
          className={`flex items-center gap-3 p-2 rounded overflow-hidden transition-colors
            ${activeSection === 'calendar' 
              ? 'bg-purple-500 text-white' 
              : isDarkMode 
                ? 'hover:bg-gray-700' 
                : 'hover:bg-gray-100'}`}
        >
          <FaCalendarAlt /> {sidebarOpen && 'Calendar'}
        </a>
      </nav>

      {/* Theme Toggle */}
      <div className={`p-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <button
          onClick={toggleTheme}
          className={`flex items-center gap-4 w-full p-2 rounded transition-colors
            ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
        >
          {isDarkMode ? <FaSun className="text-yellow-500" /> : <FaMoon className="text-gray-600" />}
          {sidebarOpen && (isDarkMode ? 'Light Mode' : 'Dark Mode')}
        </button>
      </div>
    </aside>
  );
}