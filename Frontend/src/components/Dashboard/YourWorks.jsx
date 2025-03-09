import { FaPlus, FaCheckCircle, FaClock, FaExclamationCircle } from 'react-icons/fa';

export default function YourWorks({ isDarkMode }) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Your Tasks</h2>
        <div className="flex gap-4">
          <button className="bg-purple-600 hover:bg-purple-500 px-4 py-2 rounded-lg text-white flex items-center gap-2">
            <FaPlus /> Add Task
          </button>
          <select className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg px-4 py-2`}>
            <option>All Tasks</option>
            <option>Due Today</option>
            <option>Upcoming</option>
            <option>Completed</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-4 rounded-lg shadow-lg`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FaCheckCircle className="text-green-500" />
              <div>
                <h4 className="font-semibold">Update user authentication</h4>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Website Redesign Project</p>
              </div>
            </div>
            <span className="px-2 py-1 bg-red-500 text-white rounded text-sm">High Priority</span>
          </div>
        </div>

        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-4 rounded-lg shadow-lg`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FaClock className="text-yellow-500" />
              <div>
                <h4 className="font-semibold">Design system documentation</h4>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Design System Project</p>
              </div>
            </div>
            <span className="px-2 py-1 bg-yellow-500 text-white rounded text-sm">In Progress</span>
          </div>
        </div>

        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-4 rounded-lg shadow-lg`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FaExclamationCircle className="text-blue-500" />
              <div>
                <h4 className="font-semibold">API endpoint testing</h4>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>API Integration Project</p>
              </div>
            </div>
            <span className="px-2 py-1 bg-blue-500 text-white rounded text-sm">To Do</span>
          </div>
        </div>
      </div>
    </div>
  );
}