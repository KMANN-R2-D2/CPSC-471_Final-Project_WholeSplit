// The following resources were used to create this file and in general the whole of the frontend:

// Code With Yousaf. (2023, March 12). Login Page using React + Node + MySQL | ReactJS, MySQL, NodeJS - Login Page Tutorial.
// https://www.youtube.com/watch?v=jwEbw0zJqiY

// Ramesh Fadatare (Java Guides). (2024, February 13). Spring Boot React JS Full-Stack Project | Employee Management System.
// https://www.youtube.com/watch?v=KuM6OtuaYRs

// Lama Dev. (2022, September 18). React Node.js MySQL CRUD Tutorial for Beginners.
// https://www.youtube.com/watch?v=fPuLnzSjPLE

// Import React and useState hook for managing form input state
import React, { useState } from "react";

// Axios is used to send HTTP requests to backend (login request)
import axios from "axios";

// useNavigate allows redirecting user after successful login
import { useNavigate } from "react-router-dom";

const Login = () => {

  // State to store user input for email and password
  const [credentials, setCredentials] = useState({
    Email: "",
    Password: ""
  });

  // Hook used for navigation after login success
  const navigate = useNavigate();

  // Debug log to confirm component renders correctly in browser console
  console.log("Login component rendered");

  /**
   * Handles input changes for both email and password fields
   * Uses "name" attribute to dynamically update correct field
   */
  const handleChange = (e) => {
    setCredentials((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  /**
   * Handles login form submission
   * Sends credentials to backend /login route
   */
  const handleLogin = async (e) => {
    e.preventDefault(); // prevent page reload

    try {
      // Send login request to backend API
      const res = await axios.post(
        "http://localhost:3000/login",
        credentials
      );

      // Store returned user data in localStorage for session persistence
      localStorage.setItem("user", JSON.stringify(res.data));

      // Welcome message using first name from backend response
      alert(`Welcome back, ${res.data.FName}!`);

      // Redirect user to homepage
      navigate("/");

      // Force page refresh so navbar / auth state updates immediately
      window.location.reload();
    } 
    catch (err) {
      console.error(err);
      alert("Login failed. Check your email/password.");
    }
  };

  return (
    <div
      style={{
        padding: "100px",
        textAlign: "center",
        fontFamily: "Segoe UI"
      }}
    >

      {/* Login form container */}
      <div
        style={{
          maxWidth: "400px",
          margin: "auto",
          border: "1px solid #ddd",
          padding: "30px",
          borderRadius: "8px",
          boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
        }}
      >
        {/* Page title */}
        <h2 style={{ color: "#2c3e50" }}>
          WholeSplit Login
        </h2>

        {/* LOGIN FORM */}
        <form
          onSubmit={handleLogin}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "15px",
            marginTop: "20px"
          }}
        >

          {/* Email input field */}
          <input
            type="email"
            name="Email"
            placeholder="Email Address"
            onChange={handleChange}
            required
            style={{
              padding: "12px",
              borderRadius: "4px",
              border: "1px solid #ccc"
            }}
          />

          {/* Password input field */}
          <input
            type="password"
            name="Password"
            placeholder="Password"
            onChange={handleChange}
            required
            style={{
              padding: "12px",
              borderRadius: "4px",
              border: "1px solid #ccc"
            }}
          />

          {/* Submit button */}
          <button
            type="submit"
            style={{
              backgroundColor: "#3498db",
              color: "white",
              padding: "12px",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontWeight: "bold"
            }}
          >
            Login
          </button>

        </form>
        {/* END FORM */}
      </div>
    </div>
  );
};

// Export component so it can be used in routing
export default Login;