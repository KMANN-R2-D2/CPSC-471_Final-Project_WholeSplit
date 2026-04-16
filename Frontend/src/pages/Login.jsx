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
          <input
            type="email"
            name="Email"
            placeholder="Email Address"
            onChange={handleChange}
            required
            style={inputStyle}
          />

          {/* PASSWORD */}
          <input
            type="password"
            name="Password"
            placeholder="Password"
            onChange={handleChange}
            required
            style={inputStyle}
          />

          {/* LOGIN BUTTON */}
          <button type="submit" style={buttonStyle}>
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
  fontFamily: "Segoe UI, sans-serif",
  backgroundColor: "#f5f7fa"
};

// Login card container
const cardStyle = {
  width: "100%",
  maxWidth: "420px",
  backgroundColor: "#fff",
  padding: "28px",
  borderRadius: "14px",
  boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
  textAlign: "center"
};

// Title
const titleStyle = {
  marginBottom: "8px",
  color: "#2c3e50"
};

// Subtitle
const subtitleStyle = {
  marginBottom: "20px",
  color: "#7f8c8d",
  fontSize: "0.95rem"
};

// Form layout
const formStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "14px"
};

// Inputs
const inputStyle = {
  padding: "12px",
  borderRadius: "8px",
  border: "1px solid #ddd",
  fontSize: "1rem",
  outline: "none"
};

// Login button
const buttonStyle = {
  marginTop: "10px",
  backgroundColor: "#3498db",
  color: "white",
  padding: "12px",
  border: "none",
  borderRadius: "8px",
  fontWeight: "bold",
  cursor: "pointer",
  fontSize: "1rem"
};

export default Login;