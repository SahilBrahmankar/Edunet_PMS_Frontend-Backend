import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Toast from "./Toast"; // Import the new Toast component

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const navigate = useNavigate();

  const handleSignIn = async (e) => {
    e.preventDefault();
    const response = await fetch("http://localhost:5001/api/signin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    if (response.ok) {
      localStorage.setItem("token", data.token);
      // Store the user's email in localStorage
      localStorage.setItem("userEmail", email);
      setToastMessage("✅ Signed in successfully!");
      setShowToast(true);
      
      // Navigate after showing toast
      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);
    } else {
      alert(data.message || "Invalid Credentials");
    }
  };

  return (
    <>
      {showToast && (
        <Toast 
          message={toastMessage} 
          type="success" 
          onClose={() => setShowToast(false)}
        />
      )}
      <form onSubmit={handleSignIn}>
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button type="submit">Sign In</button>
      </form>
    </>
  );
}