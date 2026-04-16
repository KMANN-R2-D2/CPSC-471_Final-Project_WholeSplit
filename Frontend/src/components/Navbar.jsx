import React from "react";
import { Link, useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  
  // Check if a user is currently logged in
  const userString = localStorage.getItem("user");
  const user = userString ? JSON.parse(userString) : null;

  // Sign Out Function
  const handleSignOut = () => {
    localStorage.removeItem("user");
    alert("You have been signed out.");
    navigate("/login");
    window.location.reload();
  };

  return (
    <nav style={navStyle}>
      
      {/* LEFT SIDE */}
      <div style={leftSection}>
        <Link to="/" style={logoStyle}>WholeSplit</Link>

        <div style={linkGroup}>
          <Link to="/products" style={linkStyle}>Products</Link>
          <Link to="/users" style={linkStyle}>Community</Link>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div style={rightSection}>
        {user ? (
          <>
            <span style={welcomeText}>
              Hi, <strong>{user.FName}</strong>
            </span>

            <Link to="/create-post" style={primaryBtn}>
              ➕ New Split
            </Link>

            <button onClick={handleSignOut} style={logoutBtnStyle}>
              Sign Out
            </button>
          </>
        ) : (
          <>
            <Link to="/login" style={linkStyle}>Login</Link>

            <Link to="/signup" style={primaryBtn}>
              Sign Up
            </Link>
          </>
        )}
      </div>

    </nav>
  );
};

// --- STYLES ---

const navStyle = {
  display: "flex",
  flexWrap: "wrap", // allows mobile stacking
  alignItems: "center",
  padding: "12px 5%",
  background: "#2c3e50",
  gap: "10px"
};

const leftSection = {
  display: "flex",
  alignItems: "center",
  gap: "20px",
  flexWrap: "wrap"
};

const rightSection = {
  marginLeft: "auto",
  display: "flex",
  alignItems: "center",
  gap: "12px",
  flexWrap: "wrap"
};

const logoStyle = {
  color: "#3498db",
  fontSize: "1.6rem",
  fontWeight: "bold",
  textDecoration: "none"
};

const linkGroup = {
  display: "flex",
  gap: "15px"
};

const linkStyle = {
  color: "white",
  textDecoration: "none",
  fontSize: "1rem",
  padding: "8px 10px"
};

const welcomeText = {
  color: "#ecf0f1",
  fontSize: "0.95rem"
};

const primaryBtn = {
  background: "#27ae60",
  color: "white",
  padding: "10px 16px",
  borderRadius: "6px",
  textDecoration: "none",
  fontWeight: "bold"
};

const logoutBtnStyle = {
  background: "#e74c3c",
  color: "white",
  border: "none",
  padding: "10px 16px",
  borderRadius: "6px",
  cursor: "pointer",
  fontWeight: "bold"
};

export default Navbar;