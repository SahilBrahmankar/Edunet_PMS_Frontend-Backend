import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { FaGithub } from "react-icons/fa";
import { FaCheckCircle } from "react-icons/fa";

export default function HomePage() {
  const [modalType, setModalType] = useState(null);
  const navigate = useNavigate();

  // ✅ Add functions inside HomePage.jsx, before return statement
  const handleSignUp = async (e) => {
    e.preventDefault();
    const name = e.target.name.value;
    const email = e.target.email.value;
    const password = e.target.password.value;
    const confirmPassword = e.target.confirmPassword.value;

    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    const response = await fetch("http://localhost:5001/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    if (response.ok) {
      alert("🎉 Account created successfully!");
      setModalType("signin"); // ✅ Switch to Sign In modal
    } else {
      alert("Sign Up Failed");
    }
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;

    const response = await fetch("http://localhost:5001/api/signin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (response.ok) {
      const data = await response.json();
      localStorage.setItem("token", "user-authenticated");
      localStorage.setItem("userEmail", email);
      localStorage.setItem("isAuthenticated", "true");
      setModalType(null);
      navigate("/dashboard");
    } else {
      alert("Invalid Credentials");
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    const name = e.target.name.value;
    const email = e.target.email.value;
    const newPassword = e.target.newPassword.value;
    const confirmPassword = e.target.confirmPassword.value;

    if (newPassword !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    const response = await fetch("http://localhost:5001/api/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, newPassword }),
    });

    if (response.ok) {
      alert("🔑 Password reset successfully!");
      setModalType("signin"); // ✅ Switch to Sign In modal
    } else {
      alert("Password reset failed");
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-black to-gray-800 text-white">
      <nav className="fixed top-0 w-full flex justify-between items-center px-6 py-4 bg-black/80 backdrop-blur-md z-10">
        <h1 className="text-2xl font-bold">
          <span className="text-purple-500">Projex</span>
        </h1>
        <div className="space-x-6">
          <a href="#features" className="hover:text-gray-400">Features</a>
          <a href="#benefits" className="hover:text-gray-400">Benefits</a>
          <a href="#team" className="hover:text-gray-400">Team</a>
          <Button variant="secondary" onClick={() => setModalType("signin")} className="bg-purple-600 hover:bg-purple-500">
            Sign In
          </Button>
        </div>
      </nav>

      <section className="flex flex-col md:flex-row items-center justify-between min-h-screen px-6">
        <div className="w-full md:w-1/2 text-center md:text-left">
          <h2 className="text-6xl font-bold">
            Power Your Projects with <span className="text-purple-500">Projex</span>
          </h2>
          <p className="text-gray-300 mt-4 max-w-2xl">
            Take control of your projects and stay on top of your goals with our
            intuitive project management app. Say goodbye to chaos and hello to
            streamlined efficiency.
          </p>
          <Button variant="secondary" onClick={() => setModalType("signin")} className="mt-6 bg-purple-600 hover:bg-purple-500">
            Get Started
          </Button>
        </div>
        <div className="w-full md:w-1/2 flex justify-center">
          <img 
            src="1.png"  
            alt="Curved Image" className="rounded-lg"
          />
        </div>
      </section>

      {modalType && (
  <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-6xl transition-opacity duration-500 opacity-100 z-50">
    
    <div className="absolute inset-0 bg-black/60 backdrop-blur-8xl transition-opacity duration-500 opacity-100"></div>

    <div className="bg-gray-800 p-9 rounded-lg shadow-lg w-96 transition-transform duration-500 transform scale-100">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">
          {modalType === "signin" ? "Sign In" : modalType === "signup" ? "Create Account" : "Forgot Password"}
        </h2>
        <button onClick={() => setModalType(null)} className="text-gray-400 hover:text-white">×</button>
      </div>

      {modalType === "signin" && (
        <form onSubmit={handleSignIn}> {/* ✅ Added function */}
          <button onClick={() => window.location.href="http://localhost:5001/auth/github"} type="button" className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg mb-4 flex items-center justify-center gap-2">
            <FaGithub className="text-xl" /> Sign In with GitHub
          </button>
          <div className="flex items-center my-4">
            <hr className="flex-grow border-gray-600" />
            <span className="mx-2 text-gray-400">or</span>
            <hr className="flex-grow border-gray-600" />
          </div>
          <input type="text" name="email" placeholder="Email/Username" className="w-full p-2 mb-4 rounded bg-gray-700 text-white" required />
          <input type="password" name="password" placeholder="Password" className="w-full p-2 mb-4 rounded bg-gray-700 text-white" required />
          <button type="submit" className="w-full bg-purple-600 hover:bg-purple-500 py-2 rounded-lg">Sign In</button>
          <div className="text-center mt-4 text-sm">
            <button className="text-purple-400 hover:underline" onClick={() => setModalType("forgotpass")}>Forgot Password?</button>
            <br />
            Don't have an account? <button className="text-purple-400 hover:underline" onClick={() => setModalType("signup")}>Create Account</button>
          </div>
        </form>
      )}

      {modalType === "signup" && (
        <form onSubmit={handleSignUp}> {/* ✅ Added function */}
          <button onClick={() => window.location.href="http://localhost:5001/auth/github"} type="button" className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg mb-4 flex items-center justify-center gap-2">
            <FaGithub className="text-xl" /> Sign Up with GitHub
          </button>
          <div className="flex items-center my-4">
            <hr className="flex-grow border-gray-600" />
            <span className="mx-2 text-gray-400">or</span>
            <hr className="flex-grow border-gray-600" />
          </div>
          <input type="text" name="name" placeholder="Name" className="w-full p-2 mb-4 rounded bg-gray-700 text-white" required />
          <input type="text" name="email" placeholder="Email/username" className="w-full p-2 mb-4 rounded bg-gray-700 text-white" required />
          <input type="password" name="password" placeholder="Create Password" className="w-full p-2 mb-4 rounded bg-gray-700 text-white" required />
          <input type="password" name="confirmPassword" placeholder="Confirm Password" className="w-full p-2 mb-4 rounded bg-gray-700 text-white" required />
          <button type="submit" className="w-full bg-purple-600 hover:bg-purple-500 py-2 rounded-lg">Sign Up</button>
          <div className="text-center mt-4 text-sm">
            Already have an account? <button className="text-purple-400 hover:underline" onClick={() => setModalType("signin")}>Sign In</button>
          </div>
        </form>
      )}

      {modalType === "forgotpass" && (
        <form onSubmit={handleResetPassword}> {/* ✅ Added function */}
          <input type="text" name="name" placeholder="Name" className="w-full p-2 mb-4 rounded bg-gray-700 text-white" required />
          <input type="text" name="email" placeholder="Email/username" className="w-full p-2 mb-4 rounded bg-gray-700 text-white" required />
          <input type="password" name="newPassword" placeholder="New Password" className="w-full p-2 mb-4 rounded bg-gray-700 text-white" required />
          <input type="password" name="confirmPassword" placeholder="Confirm Password" className="w-full p-2 mb-4 rounded bg-gray-700 text-white" required />
          <button type="submit" className="w-full bg-purple-600 hover:bg-purple-500 py-2 rounded-lg">Reset Password</button>
          <div className="text-center mt-4 text-sm">
            <button className="text-purple-400 hover:underline" onClick={() => setModalType("signin")}>Go to Login Page</button>
          </div>
        </form>
      )}
    </div>
  </div>
)}

      {/* Features Section */}
      <section id="features" className="py-20 px-6 bg-gray-800 text-center">
        <h3 className="text-3xl font-bold">Features</h3>
        <p className="text-gray-400 mt-2">Explore what makes Projex unique.</p>
        <div className="grid md:grid-cols-3 gap-6 mt-8">
          <div className="p-6 bg-gray-900 rounded-lg shadow-lg">
            <FaCheckCircle className="text-purple-500 text-4xl mx-auto" />
            <h4 className="text-xl font-semibold mt-4">Task Management</h4>
            <p className="text-gray-400">
              Easily create, assign, and track tasks.
            </p>
          </div>
          <div className="p-6 bg-gray-900 rounded-lg shadow-lg">
            <FaCheckCircle className="text-purple-500 text-4xl mx-auto" />
            <h4 className="text-xl font-semibold mt-4">Collaboration</h4>
            <p className="text-gray-400">
              Seamlessly work with your team in real-time.
            </p>
          </div>
          <div className="p-6 bg-gray-900 rounded-lg shadow-lg">
            <FaCheckCircle className="text-purple-500 text-4xl mx-auto" />
            <h4 className="text-xl font-semibold mt-4">Analytics</h4>
            <p className="text-gray-400">
              Gain insights with powerful reporting tools.
            </p>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-20 px-6 text-center">
        <h3 className="text-3xl font-bold">Benefits</h3>
        <p className="text-gray-400 mt-2">
          Why choose Projex for your projects?
        </p>
        <ul className="mt-6 space-y-4">
          <li className="flex items-center justify-center space-x-2">
            <FaCheckCircle className="text-purple-500" />
            <span>Increased efficiency and productivity</span>
          </li>
          <li className="flex items-center justify-center space-x-2">
            <FaCheckCircle className="text-purple-500" />
            <span>Better team collaboration</span>
          </li>
          <li className="flex items-center justify-center space-x-2">
            <FaCheckCircle className="text-purple-500" />
            <span>Detailed project tracking</span>
          </li>
        </ul>
      </section>

      {/* <section id="team" className="py-20 px-6 bg-gray-900 text-center">
        <h3 className="text-3xl font-bold text-white">Meet Our Team</h3>
        <p className="text-gray-400 mt-2">The minds behind Projex.</p>
        < Team Section */}
     <div className="flex justify-center mt-8">
          <div className="p-6 bg-gray-800 rounded-lg shadow-lg w-80">
            <h4 className="text-xl font-semibold text-white">
              Jayesh Gokul Bhoi
            </h4>
            <p className="text-gray-400">Founder & Developer</p>
          </div>
        </div>
     

      <footer className="bg-gray-800 text-gray-400 text-center py-3 mt-10">
        <p>Projex © 2025. All rights reserved.</p>
      </footer>
    </div>
  );
}