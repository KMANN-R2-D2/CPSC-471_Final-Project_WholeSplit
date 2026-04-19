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
    
  };

  return (
    <nav style={navStyle}>
      
      {/* LEFT SIDE */}
      <div style={leftSection}>
        <Link to="/" style={logoStyle}>WholeSplit</Link>

        <div style={linkGroup}>
          <Link to="/products" style={linkStyle} onMouseEnter={(e) => {
              e.target.style.background = "#1e293b";
              e.target.style.color = "#38bdf8";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "transparent";
              e.target.style.color = "#e2e8f0";
            }}>Products</Link>
          <Link to="/users" style={linkStyle} onMouseEnter={(e) => {
              e.target.style.background = "#1e293b";
              e.target.style.color = "#38bdf8";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "transparent";
              e.target.style.color = "#e2e8f0";
            }}>Community</Link>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div style={rightSection}>
        {user ? (
          <>
            <span style={welcomeText}>
              Hi, <strong>{user.FName}</strong>
            </span>

            <button onClick={handleSignOut} style={logoutBtnStyle} onMouseEnter={(e) => (e.target.style.background = "#dc2626")}
              onMouseLeave={(e) => (e.target.style.background = "#ef4444")}>
              Sign Out
            </button>
          </>
        ) : (
          <>
            <Link to="/login" style={linkStyle} onMouseEnter={(e) => {
                e.target.style.background = "#1e293b";
                e.target.style.color = "#38bdf8";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "transparent";
                e.target.style.color = "#e2e8f0";
              }}>Login</Link>

            <Link to="/signup" style={primaryBtn} onMouseEnter={(e) => (e.target.style.background = "#16a34a")}
              onMouseLeave={(e) => (e.target.style.background = "#22c55e")}>
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
  flexWrap: "wrap",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "14px 6%",
  background: "#0f172a",
  borderBottom: "1px solid #1e293b",
  boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
  position: "sticky",
  top: 0,
  zIndex: 1000
};

const leftSection = {
  display: "flex",
  alignItems: "center",
  gap: "28px",
  flexWrap: "wrap"
};

const rightSection = {
  marginLeft: "auto",
  display: "flex",
  alignItems: "center",
  gap: "14px",
  flexWrap: "wrap"
};

const logoStyle = {
  color: "#38bdf8",
  fontSize: "1.55rem",
  fontWeight: "700",
  textDecoration: "none",
  letterSpacing: "0.3px",
  padding: "4px 0"
};

const linkGroup = {
  display: "flex",
  gap: "18px",
  alignItems: "center"
};

const linkStyle = {
  color: "#e2e8f0",
  textDecoration: "none",
  fontSize: "0.95rem",
  padding: "8px 12px",
  borderRadius: "8px",
  transition: "0.2s ease"
};

const welcomeText = {
  color: "#cbd5e1",
  fontSize: "0.95rem"
};

const primaryBtn = {
  background: "#22c55e",
  color: "white",
  padding: "10px 16px",
  borderRadius: "8px",
  textDecoration: "none",
  fontWeight: "600",
  border: "none",
  transition: "0.2s ease"
};

const logoutBtnStyle = {
  background: "#ef4444",
  color: "white",
  border: "none",
  padding: "10px 16px",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: "600",
  transition: "0.2s ease"
};

export default Navbar;