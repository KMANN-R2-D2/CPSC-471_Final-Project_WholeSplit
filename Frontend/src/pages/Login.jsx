// The following resources were used to create this file and in general the whole of the frontend:

// Code With Yousaf. (2023, March 12). Login Page using React + Node + MySQL | ReactJS, MySQL, NodeJS - Login Page Tutorial.
// https://www.youtube.com/watch?v=jwEbw0zJqiY

// Ramesh Fadatare (Java Guides). (2024, February 13). Spring Boot React JS Full-Stack Project | Employee Management System.
// https://www.youtube.com/watch?v=KuM6OtuaYRs

// Lama Dev. (2022, September 18). React Node.js MySQL CRUD Tutorial for Beginners.
// https://www.youtube.com/watch?v=fPuLnzSjPLE

// ======================================================
// Login.jsx
// Handles user authentication and session storage
// ======================================================

import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Login = () => {

  // ======================================================
  // FORM STATE (email + password)
  // ======================================================
  const [credentials, setCredentials] = useState({
    Email: "",
    Password: ""
  });

  const navigate = useNavigate();

  console.log("Login component rendered");

  // ======================================================
  // HANDLE INPUT CHANGE
  // Dynamically updates Email or Password field
  // ======================================================
  const handleChange = (e) => {
    setCredentials(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  // ======================================================
  // HANDLE LOGIN REQUEST
  // Sends credentials to backend and stores user session
  // ======================================================
  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        "http://localhost:3000/login",
        credentials
      );

      localStorage.setItem("user", JSON.stringify(res.data));

      alert(`Welcome back, ${res.data.FName}!`);

      navigate("/");
      window.location.reload();

    } catch (err) {
      console.error(err);
      alert("Login failed. Check your email/password.");
    }
  };

  return (
    <div style={pageStyle}>

      {/* ======================================================
          LOGIN CARD
      ====================================================== */}
      <div style={cardStyle}>

        {/* TITLE */}
        <h2 style={titleStyle}>
          WholeSplit Login
        </h2>

        {/* SUBTITLE */}
        <p style={subtitleStyle}>
          Sign in to continue splitting with your community
        </p>

        {/* FORM */}
        <form onSubmit={handleLogin} style={formStyle}>

          {/* EMAIL */}
          <input onFocus={(e) => e.target.style.border = "1px solid #3b82f6"}
onBlur={(e) => e.target.style.border = "1px solid #e5e7eb"}
            type="email"
            name="Email"
            placeholder="Email Address"
            onChange={handleChange}
            required
            style={inputStyle}
          />

          {/* PASSWORD */}
          <input onFocus={(e) => e.target.style.border = "1px solid #3b82f6"}
onBlur={(e) => e.target.style.border = "1px solid #e5e7eb"}
            type="password"
            name="Password"
            placeholder="Password"
            onChange={handleChange}
            required
            style={inputStyle}
          />

          {/* LOGIN BUTTON */}
          <button onMouseOver={(e) => e.target.style.transform = "scale(1.04)"}
onMouseOut={(e) => e.target.style.transform = "scale(1)"} type="submit" style={buttonStyle}>
            Login
          </button>

        </form>

      </div>
    </div>
  );
};

/* ======================================================
   STYLES (mobile-first app login design)
====================================================== */

// Page background (centers login card)
const pageStyle = {
  minHeight: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: "20px",
  fontFamily: "Inter, Segoe UI, sans-serif",
  background: "linear-gradient(135deg, #dbeafe, #f0fdf4)"
};

// Login card container
const cardStyle = {
  width: "100%",
  maxWidth: "420px",
  background: "rgba(255,255,255,0.9)",
  backdropFilter: "blur(10px)",
  padding: "32px",
  borderRadius: "20px",
  boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
  border: "1px solid rgba(255,255,255,0.3)",
  textAlign: "center"
};

// Title
const titleStyle = {
  marginBottom: "6px",
  fontSize: "1.8rem",
  fontWeight: "800",
  color: "#111827",
  letterSpacing: "-0.5px"
};

// Subtitle
const subtitleStyle = {
  marginBottom: "22px",
  color: "#6b7280",
  fontSize: "0.9rem"
};

// Form layout
const formStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "14px"
};

// Inputs
const inputStyle = {
  padding: "14px",
  borderRadius: "10px",
  border: "1px solid #e5e7eb",
  fontSize: "1rem",
  outline: "none",
  transition: "all 0.2s ease",
  backgroundColor: "#f9fafb"
};

// Login button
const buttonStyle = {
  marginTop: "12px",
  background: "linear-gradient(135deg, #3b82f6, #2563eb)",
  color: "white",
  padding: "14px",
  border: "none",
  borderRadius: "12px",
  fontWeight: "bold",
  cursor: "pointer",
  fontSize: "1rem",
  boxShadow: "0 10px 20px rgba(37,99,235,0.25)",
  transition: "all 0.2s ease"
};

export default Login;