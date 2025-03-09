import { FaSearch, FaBell, FaSignOutAlt } from "react-icons/fa";
import { useState, useEffect } from "react";
import Toast from "../Toast"; // Import the Toast component

export default function Navbar({ colors, sidebarOpen, setSidebarOpen, isDarkMode, setPage, userEmail }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [notifications] = useState(3);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success");

  // Load user email from localStorage on component mount
  useEffect(() => {
    const email = localStorage.getItem("userEmail");
    if (email) {
      // We don't need to set userEmail here anymore since it's passed as a prop
      // Just keeping the effect to potentially handle other initializations
    }
  }, []);

  const handleLogout = async () => {
    try {
      const response = await fetch("http://localhost:5001/auth/logout", {
        method: "GET",
        credentials: "include",
      });

      if (response.ok) {
        // Clear all localStorage items
        localStorage.clear();
        
        // Show toast notification
        setToastMessage("🚪 Logged out successfully!");
        setToastType("success");
        setShowToast(true);

        // Immediate redirect to home
        window.location.href = "/";
      } else {
        throw new Error("Logout failed");
      }
    } catch (error) {
      console.error("Error during logout:", error);
      setToastMessage("Error during logout");
      setToastType("error");
      setShowToast(true);
    }
  };

  return (
    <>
      {showToast && (
        <Toast 
          message={toastMessage} 
          type={toastType} 
          onClose={() => setShowToast(false)}
        />
      )}
      <nav className={`${colors.navbar} fixed top-0 right-0 left-0 p-4 flex items-center justify-between shadow-md z-20 h-16`}>
        <div className="flex items-center gap-4">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-2xl focus:outline-none">
            ☰
          </button>
          <span className="text-xl font-bold text-purple-500">Projex</span>
          <div className="flex items-center gap-4 ml-8">
            <button onClick={() => setShowAboutModal(true)} className="hover:text-gray-400">About Us</button>
            <button onClick={() => setShowContactModal(true)} className="hover:text-gray-400">Contact Us</button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              className={`p-2 rounded-lg ${isDarkMode ? "bg-gray-700" : "bg-gray-100"} focus:outline-none w-48`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <FaSearch className="absolute right-3 top-3 text-gray-400" />
          </div>

          <div className="relative">
            <FaBell size={20} className="cursor-pointer" />
            {notifications > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {notifications}
              </span>
            )}
          </div>

          {userEmail ? (
            <span className="text-gray-300 font-medium">📧 {userEmail}</span>
          ) : (
            <span className="text-gray-300">Logged In</span>
          )}

          <button onClick={handleLogout} className="flex items-center gap-2 text-red-400 hover:text-red-300">
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </nav>
    </>
  );
}