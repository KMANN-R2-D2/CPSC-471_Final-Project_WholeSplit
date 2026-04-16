import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [credentials, setCredentials] = useState({ Email: "", Password: "" });
  const navigate = useNavigate();

  console.log("Login component rendered"); // Check your browser console for this!

  const handleChange = (e) => {
    setCredentials((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:3000/login", credentials);
      localStorage.setItem("user", JSON.stringify(res.data));
      alert(`Welcome back, ${res.data.FName}!`);
      navigate("/");
      window.location.reload(); // Refresh to update the Navbar state
    } catch (err) {
      console.error(err);
      alert("Login failed. Check your email/password.");
    }
  };

  return (
    <div style={{ padding: "100px", textAlign: "center", fontFamily: "Segoe UI" }}>
      <div style={{ maxWidth: "400px", margin: "auto", border: "1px solid #ddd", padding: "30px", borderRadius: "8px", boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}>
        <h2 style={{ color: "#2c3e50" }}>WholeSplit Login</h2>
        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "15px", marginTop: "20px" }}>
          <input 
            type="email" 
            name="Email" 
            placeholder="Email Address" 
            onChange={handleChange} 
            required 
            style={{ padding: "12px", borderRadius: "4px", border: "1px solid #ccc" }} 
          />
          <input 
            type="password" 
            name="Password" 
            placeholder="Password" 
            onChange={handleChange} 
            required 
            style={{ padding: "12px", borderRadius: "4px", border: "1px solid #ccc" }} 
          />
          <button type="submit" style={{ 
            backgroundColor: "#3498db", 
            color: "white", 
            padding: "12px", 
            border: "none", 
            borderRadius: "4px", 
            cursor: "pointer",
            fontWeight: "bold"
          }}>
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;