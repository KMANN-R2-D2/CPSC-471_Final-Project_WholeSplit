import React, { useState, useEffect } from "react";
import axios from "axios";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [expandedEmail, setExpandedEmail] = useState(null);

  useEffect(() => {
    axios.get("http://localhost:3000/users")
      .then(res => setUsers(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div style={{ padding: "40px", backgroundColor: "#121212", minHeight: "100vh", color: "white", fontFamily: "Segoe UI" }}>
      <h2 style={{ color: "#3498db", marginBottom: "20px" }}>Community Members</h2>
      
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {users.map((u, index) => (
          <div key={index} style={{ border: "1px solid #333", borderRadius: "8px", backgroundColor: "#1e1e1e" }}>
            
            {/* NAME ROW */}
            <div 
              onClick={() => setExpandedEmail(expandedEmail === u.Email ? null : u.Email)}
              style={{ padding: "15px 20px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}
            >
              <span style={{ fontSize: "1.1rem", fontWeight: "bold" }}>
                {u.FName} {u.LName}
              </span>
              <span style={{ color: "#3498db", fontSize: "0.8rem" }}>
                {expandedEmail === u.Email ? "CLOSE ▲" : "VIEW PROFILE ▼"}
              </span>
            </div>

            {/* DROPDOWN DETAILS */}
            {expandedEmail === u.Email && (
              <div style={{ padding: "20px", backgroundColor: "#161616", borderTop: "1px solid #333" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                  
                  <div>
                    <label style={labelStyle}>Email</label>
                    <p style={dataStyle}>{u.Email}</p>
                  </div>

                  <div>
                    <label style={labelStyle}>Location</label>
                    <p style={dataStyle}>{u.PostalCode}</p>
                  </div>

            

<div>
  <label style={labelStyle}>Status</label>
  <p style={{ 
    margin: 0,
    fontSize: "1rem",
    // Logic: If MembershipID is truthy (not null), color it green
    color: u.MembershipID ? '#27ae60' : '#f39c12',
    fontWeight: "bold"
  }}>
    {u.MembershipID ? "Holder" : "Standard"}
  </p>
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

const labelStyle = { display: "block", fontSize: "0.7rem", color: "#666", textTransform: "uppercase", fontWeight: "bold", marginBottom: "5px" };
const dataStyle = { margin: 0, fontSize: "1rem", color: "#ddd" };

export default Users;