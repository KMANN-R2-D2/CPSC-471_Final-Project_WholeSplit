import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const SignUp = () => {
  const navigate = useNavigate();
  
  const [info, setInfo] = useState({
    FName: "",
    LName: "",
    Email: "",
    Password: "",
    PostalCode: "",
    hasMembership: false,
    MembershipStore: "", // This will now hold the Store ID from the dropdown
    Expiry: ""
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setInfo((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    try {
      // Logic check: If they checked 'hasMembership', ensure a store is selected
      if (info.hasMembership && !info.MembershipStore) {
        alert("Please select your membership store.");
        return;
      }

      await axios.post("http://localhost:3000/signup", info);
      alert("Account created! Welcome to WholeSplit.");
      navigate("/login");
    } catch (err) {
      console.error(err);
      alert("Error: " + (err.response?.data?.message || "Check backend terminal for SQL error"));
    }
  };

  return (
    <div style={{ padding: "40px", fontFamily: "Segoe UI", maxWidth: "450px", margin: "auto" }}>
      <div style={{ border: "1px solid #ddd", padding: "30px", borderRadius: "8px", boxShadow: "0 4px 10px rgba(0,0,0,0.1)", backgroundColor: "#1a1a1a", color: "white" }}>
        <h2 style={{ color: "#3498db", textAlign: "center" }}>Join WholeSplit</h2>
        
        <form onSubmit={handleSignUp} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <input name="FName" placeholder="First Name" onChange={handleChange} required style={inputStyle} />
          <input name="LName" placeholder="Last Name" onChange={handleChange} required style={inputStyle} />
          <input type="email" name="Email" placeholder="Email" onChange={handleChange} required style={inputStyle} />
          <input type="password" name="Password" placeholder="Password" onChange={handleChange} required style={inputStyle} />
          <input name="PostalCode" placeholder="Postal Code" onChange={handleChange} required style={inputStyle} />

          <label style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "10px", cursor: "pointer" }}>
            <input type="checkbox" name="hasMembership" checked={info.hasMembership} onChange={handleChange} />
            I have a Wholesale Membership
          </label>

          {info.hasMembership && (
            <div style={{ padding: "15px", backgroundColor: "#2c3e50", borderRadius: "5px", border: "1px solid #3498db" }}>
              <label style={{ fontSize: "0.8rem", display: "block", marginBottom: "5px" }}>Select Store:</label>
              <select 
                name="MembershipStore" 
                onChange={handleChange} 
                required 
                style={{ ...inputStyle, width: "100%" }}
              >
                <option value="">-- Select Store --</option>
                <option value="1">Costco</option>
                <option value="2">Sams Club</option>
              </select>
              
              <label style={{ fontSize: "0.8rem", display: "block", margin: "10px 0 5px 0" }}>Membership Expiry:</label>
              <input name="Expiry" type="date" onChange={handleChange} required style={{ ...inputStyle, width: "100%" }} />
            </div>
          )}

          <button type="submit" style={btnStyle}>Create Account</button>
        </form>
      </div>
    </div>
  );
};

const inputStyle = { padding: "10px", borderRadius: "4px", border: "1px solid #444", backgroundColor: "#333", color: "white" };
const btnStyle = { backgroundColor: "#27ae60", color: "white", padding: "12px", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold", marginTop: "10px" };

export default SignUp;