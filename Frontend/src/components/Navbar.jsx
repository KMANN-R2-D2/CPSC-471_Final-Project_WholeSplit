import React from "react";
import { Link, useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  
  // 1. Check if a user is currently logged in
  const userString = localStorage.getItem("user");
  const user = userString ? JSON.parse(userString) : null;

  // 2. The Sign Out Function
  const handleSignOut = () => {
    localStorage.removeItem("user"); // Wipe the session
    alert("You have been signed out.");
    
    // Redirect to login and force a reload to clear all states
    navigate("/login");
    window.location.reload(); 
  };

  return (

    // Inside the return of Navbar.jsx
<nav style={navStyle}>
  <Link to="/" style={logoStyle}>WholeSplit</Link>
  
  <div style={{ marginLeft: "20px", display: "flex", gap: "15px" }}>
    <Link to="/products" style={linkStyle}>Products</Link>
    <Link to="/users" style={linkStyle}>Community</Link>
  </div>

  <div style={{ marginLeft: "auto", display: "flex", gap: "20px", alignItems: "center" }}>
        {user ? (
          <>
            <span style={{ color: "#ecf0f1" }}>Welcome, <strong>{user.FName}</strong></span>
            <Link to="/create-post" style={linkStyle}>➕ New Split</Link>
            <button onClick={handleSignOut} style={logoutBtnStyle}>Sign Out</button>
          </>
        ) : (
          <>
            <Link to="/login" style={linkStyle}>Login</Link>
            <Link to="/signup" style={signupBtnStyle}>Sign Up</Link>
          </>
        )}
      </div>
      
    </nav>
  );
};

// --- Quick Styles ---
const navStyle = { display: "flex", padding: "15px 5%", background: "#2c3e50", alignItems: "center", boxShadow: "0 2px 5px rgba(0,0,0,0.2)" };
const logoStyle = { color: "#3498db", fontSize: "1.5rem", fontWeight: "bold", textDecoration: "none" };
const linkStyle = { color: "white", textDecoration: "none", fontSize: "0.9rem" };
const logoutBtnStyle = { background: "#e74c3c", color: "white", border: "none", padding: "8px 15px", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" };
const signupBtnStyle = { background: "#27ae60", color: "white", padding: "8px 15px", borderRadius: "4px", textDecoration: "none", fontSize: "0.9rem" };

export default Navbar;