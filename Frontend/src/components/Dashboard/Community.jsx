import { FaUsers, FaComments, FaChartLine } from 'react-icons/fa';

export default function Community({ isDarkMode }) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Community Hub</h2>
        <button className="bg-purple-600 hover:bg-purple-500 px-4 py-2 rounded-lg text-white flex items-center gap-2">
          <FaUsers /> Join New Group
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Active Discussions */}
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg shadow-lg`}>
          <h3 className="text-xl font-semibold mb-4">Active Discussions</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center">
                <FaComments className="text-white" />
              </div>
              <div>
                <h4 className="font-semibold">Best practices for API design</h4>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>23 participants • Active now</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                <FaChartLine className="text-white" />
              </div>
              <div>
                <h4 className="font-semibold">Project management tips</h4>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>15 participants • 2h ago</p>
              </div>
            </div>
          </div>
        </div>

        {/* Team Members */}
        <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} p-6 rounded-lg shadow-lg`}>
          <h3 className="text-xl font-semibold mb-4">Active Team Members</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-green-500"></div>
                <div>
                  <h4 className="font-semibold">Sarah Johnson</h4>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Lead Designer</p>
                </div>
              </div>
              <span className="w-3 h-3 bg-green-500 rounded-full"></span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-500"></div>
                <div>
                  <h4 className="font-semibold">Mike Chen</h4>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Developer</p>
                </div>
              </div>
              <span className="w-3 h-3 bg-green-500 rounded-full"></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}