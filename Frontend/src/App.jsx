import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./components/HomePage";
import Dashboard from "./components/Dashboard/Dashboard";
import Calendar from "./components/Dashboard/Calendar";
import YourWorks from "./components/Dashboard/YourWorks";
import Community from "./components/Dashboard/Community";
import Navbar from "./components/Navigation/Navbar";
import Sidebar from "./components/Navigation/Sidebar";
import SignIn from "./components/SignIn";
import SignUp from "./components/SignUp";
import ForgotPassword from "./components/ForgotPassword";
import Toast from "./components/Toast";

function App() {
  const [currentPage, setPage] = useState("home");

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success");

  const showNotification = (message, type = "success") => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
  };

  return (
    <Router> {/* ✅ Move <Router> to wrap everything */}
      <div className="App">
        {showToast && (
          <Toast
            message={toastMessage}
            type={toastType}
            onClose={() => setShowToast(false)}
          />
        )}

        <Routes>
          <Route path="/" element={<HomePage setPage={setPage} />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/forgotpassword" element={<ForgotPassword />} />
          <Route path="/dashboard" element={<Dashboard setPage={setPage} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
