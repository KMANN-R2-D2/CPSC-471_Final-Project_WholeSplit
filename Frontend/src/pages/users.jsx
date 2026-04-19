import React, { useState, useEffect } from "react";
import axios from "axios";

const Users = () => {

  // ======================================================
  // STATE: user list
  // ======================================================
  const [users, setUsers] = useState([]);

  // ======================================================
  // STATE: expanded profile
  // stores currently opened user email
  // ======================================================
  const [expandedEmail, setExpandedEmail] = useState(null);

  // ======================================================
  // FETCH USERS ON LOAD
  // ======================================================
  useEffect(() => {
    axios.get("http://localhost:3000/users")
      .then(res => setUsers(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div style={pageStyle}>

      {/* ======================================================
          PAGE TITLE
      ====================================================== */}
      <h2 style={titleStyle}>
        Community Members
      </h2>

      <p style={subtitleStyle}>
        Tap a user to view their profile
      </p>

      {/* ======================================================
          USER LIST (CARD STYLE)
      ====================================================== */}
      <div style={listStyle}>

        {users.map((u, index) => (
          <div onMouseOver={(e) => e.currentTarget.style.transform = "scale(1.02)"}
  onMouseOut={(e) => e.currentTarget.style.transform = "scale(1)"} key={index} style={cardStyle}>

            {/* ======================================================
                CLICKABLE HEADER ROW
            ====================================================== */}
            <div
              onClick={() =>
                setExpandedEmail(
                  expandedEmail === u.Email ? null : u.Email
                )
              }
              style={headerRow}
            >

              <div>
                <div style={nameStyle}>
                  {u.FName} {u.LName}
                </div>

                <div style={emailPreview}>
                  {u.Email}
                </div>
              </div>

              <div style={toggleText}>
                {expandedEmail === u.Email
                  ? "Hide ▲"
                  : "View ▼"}
              </div>

            </div>

            {/* ======================================================
                EXPANDED PROFILE SECTION
            ====================================================== */}
            {expandedEmail === u.Email && (
              <div style={expandedBox}>

                {/* EMAIL */}
                <div style={infoBlock}>
                  <div style={labelStyle}>Email</div>
                  <div style={valueStyle}>{u.Email}</div>
                </div>

                {/* LOCATION */}
                <div style={infoBlock}>
                  <div style={labelStyle}>Location</div>
                  <div style={valueStyle}>{u.PostalCode}</div>
                </div>

                {/* STATUS */}
                <div style={infoBlock}>
                  <div style={labelStyle}>Status</div>
                  <div
                    style={{
                      ...valueStyle,
                      fontWeight: "bold",
                      color: u.MembershipID
                        ? "#27ae60"
                        : "#f39c12"
                    }}
                  >
                    {u.MembershipID ? "Member" : "Standard"}
                  </div>
                </div>

              </div>
            )}

          </div>
        ))}

      </div>
    </div>
  );
};

/* ======================================================
   STYLES (unified light app system)
====================================================== */

const pageStyle = {
  minHeight: "100vh",
  padding: "30px 20px",
  fontFamily: "Inter, Segoe UI, sans-serif",
  background: "linear-gradient(135deg, #dbeafe, #f0fdf4)"
};

const titleStyle = {
  margin: 0,
  fontSize: "2rem",
  fontWeight: "800",
  color: "#111827",
  textAlign: "center"
};

const subtitleStyle = {
  marginTop: "6px",
  marginBottom: "24px",
  color: "#6b7280",
  textAlign: "center"
};

const listStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "16px",
  maxWidth: "600px",
  margin: "0 auto"
};

const cardStyle = {
  background: "rgba(255,255,255,0.9)",
  backdropFilter: "blur(8px)",
  borderRadius: "16px",
  border: "1px solid #e5e7eb",
  boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
  overflow: "hidden",
  transition: "all 0.2s ease"
};

const headerRow = {
  padding: "16px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  cursor: "pointer"
};

const nameStyle = {
  fontWeight: "700",
  fontSize: "1rem",
  color: "#111827"

};

const emailPreview = {
  fontSize: "0.8rem",
  color: "#6b7280",
  marginTop: "2px"
};

const toggleText = {
  fontSize: "0.8rem",
  color: "#2563eb",
  fontWeight: "600"
};

const expandedBox = {
  padding: "16px",
  borderTop: "1px solid #e5e7eb",
  background: "linear-gradient(135deg, #eff6ff, #f0fdf4)",
  display: "flex",
  flexDirection: "column",
  gap: "12px"
};

const infoBlock = {
  display: "flex",
  flexDirection: "column"
};

const labelStyle = {
  fontSize: "10px",
  color: "#6b7280",
  textTransform: "uppercase",
  fontWeight: "700",
  letterSpacing: "0.5px"

};

const valueStyle = {
  fontSize: "14px",
  color: "#111827",
  marginTop: "4px"
};

export default Users;