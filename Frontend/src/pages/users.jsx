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
          <div key={index} style={cardStyle}>

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
  padding: "20px",
  fontFamily: "Segoe UI, sans-serif",
  backgroundColor: "#f5f7fa",
  minHeight: "100vh"
};

const titleStyle = {
  margin: "0",
  color: "#2c3e50"
};

const subtitleStyle = {
  marginTop: "6px",
  marginBottom: "20px",
  color: "#7f8c8d"
};

const listStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "12px"
};

const cardStyle = {
  backgroundColor: "#fff",
  borderRadius: "12px",
  border: "1px solid #eee",
  boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
  overflow: "hidden"
};

const headerRow = {
  padding: "14px 16px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  cursor: "pointer"
};

const nameStyle = {
  fontWeight: "bold",
  color: "#2c3e50"
};

const emailPreview = {
  fontSize: "12px",
  color: "#7f8c8d",
  marginTop: "2px"
};

const toggleText = {
  fontSize: "12px",
  color: "#3498db",
  fontWeight: "bold"
};

const expandedBox = {
  padding: "14px 16px",
  borderTop: "1px solid #eee",
  backgroundColor: "#f8fbff",
  display: "flex",
  flexDirection: "column",
  gap: "12px"
};

const infoBlock = {
  display: "flex",
  flexDirection: "column"
};

const labelStyle = {
  fontSize: "11px",
  color: "#7f8c8d",
  textTransform: "uppercase",
  fontWeight: "bold"
};

const valueStyle = {
  fontSize: "14px",
  color: "#2c3e50",
  marginTop: "4px"
};

export default Users;