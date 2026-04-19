// Import React state management
import React, { useState } from "react";

// Axios for API calls
import axios from "axios";

// Navigation after signup
import { useNavigate } from "react-router-dom";

const SignUp = () => {

  const navigate = useNavigate();

  // ======================================================
  // FORM STATE
  // ======================================================
  const [info, setInfo] = useState({
    FName: "",
    LName: "",
    Email: "",
    Password: "",
    PostalCode: "",
    PreferredPaymentMethod: "",   
    PreferredShoppingDay: "",     
    hasMembership: false,
    MembershipStore: "",
    Expiry: ""
  });

  // ======================================================
  // HANDLE INPUT CHANGES
  // ======================================================
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setInfo(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  // ======================================================
  // HANDLE SIGNUP SUBMISSION
  // ======================================================
  const handleSignUp = async (e) => {
    e.preventDefault();

    try {
      if (info.hasMembership && !info.MembershipStore) {
        alert("Please select your membership store.");
        return;
      }

      await axios.post("http://localhost:3000/signup", info);

      alert("Account created! Welcome to WholeSplit.");

      navigate("/login");

    } catch (err) {
      console.error(err);
      alert(
        "Error: " +
        (err.response?.data?.message || "Check backend error")
      );
    }
  };

  return (
    <div style={pageStyle}>

      {/* ======================================================
          SIGNUP CARD
      ====================================================== */}
      <div style={cardStyle}>

        {/* TITLE */}
        <h2 style={titleStyle}>
          Join WholeSplit
        </h2>

        <p style={subtitleStyle}>
          Create your account to start splitting with others
        </p>

        {/* FORM */}
        <form onSubmit={handleSignUp} style={formStyle}>

          <input name="FName" placeholder="First Name" onChange={handleChange} required style={inputStyle} />
          <input name="LName" placeholder="Last Name" onChange={handleChange} required style={inputStyle} />
          <input type="email" name="Email" placeholder="Email" onChange={handleChange} required style={inputStyle} />
          <input type="password" name="Password" placeholder="Password" onChange={handleChange} required style={inputStyle} />
          <input name="PostalCode" placeholder="Postal Code" onChange={handleChange} required style={inputStyle} />

          <div>
            <label style={labelStyle}>Preferred Payment Method</label>
            <select
              name="PreferredPaymentMethod"
              onChange={handleChange}
              required
              style={inputStyle}
            >
              <option value="">-- Select Payment Method --</option>
              <option value="Debit Card">Debit Card</option>
              <option value="Credit Card">Credit Card</option>
              <option value="Cash">Cash</option>
            </select>
          </div>

          <div>
            <label style={labelStyle}>Preferred Shopping Day</label>
            <select
              name="PreferredShoppingDay"
              onChange={handleChange}
              required
              style={inputStyle}
            >
              <option value="">-- Select Day --</option>
              <option value="Monday">Monday</option>
              <option value="Tuesday">Tuesday</option>
              <option value="Wednesday">Wednesday</option>
              <option value="Thursday">Thursday</option>
              <option value="Friday">Friday</option>
              <option value="Saturday">Saturday</option>
              <option value="Sunday">Sunday</option>
            </select>
          </div>

          {/* ======================================================
              MEMBERSHIP TOGGLE SECTION
          ====================================================== */}
          <label style={checkboxRow}>
            <input
              type="checkbox"
              name="hasMembership"
              checked={info.hasMembership}
              onChange={handleChange}
            />
            <span>I have a Wholesale Membership</span>
          </label>

          {/* CONDITIONAL MEMBERSHIP CARD */}
          {info.hasMembership && (
            <div style={membershipCard}>

              <label style={labelStyle}>
                Select Store:
              </label>

              <select
                name="MembershipStore"
                onChange={handleChange}
                required
                style={inputStyle}
              >
                <option value="">-- Select Store --</option>
                <option value="1">Costco</option>
                <option value="2">Sams Club</option>
              </select>

              <label style={labelStyle}>
                Membership Expiry:
              </label>

              <input
                name="Expiry"
                type="date"
                onChange={handleChange}
                required
                style={inputStyle}
              />
            </div>
          )}

          {/* SUBMIT BUTTON */}
          <button type="submit" style={btnStyle}>
            Create Account
          </button>

        </form>
      </div>
    </div>
  );
};

/* ======================================================
   STYLES (unified app design system)
====================================================== */

const pageStyle = {
  minHeight: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: "20px",
  fontFamily: "Segoe UI, sans-serif",
  backgroundColor: "#f5f7fa"
};

const cardStyle = {
  width: "100%",
  maxWidth: "450px",
  backgroundColor: "#fff",
  padding: "28px",
  borderRadius: "14px",
  boxShadow: "0 6px 18px rgba(0,0,0,0.08)"
};

const titleStyle = {
  marginBottom: "6px",
  color: "#2c3e50",
  textAlign: "center"
};

const subtitleStyle = {
  marginBottom: "20px",
  color: "#7f8c8d",
  textAlign: "center",
  fontSize: "0.95rem"
};

const formStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "12px"
};

const inputStyle = {
  padding: "12px",
  borderRadius: "8px",
  border: "1px solid #ddd",
  fontSize: "1rem",
  outline: "none"
};

const checkboxRow = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  marginTop: "10px",
  cursor: "pointer",
  fontSize: "0.95rem"
};

const membershipCard = {
  marginTop: "10px",
  padding: "14px",
  borderRadius: "10px",
  border: "1px solid #3498db",
  backgroundColor: "#f8fbff"
};

const labelStyle = {
  fontSize: "0.85rem",
  marginBottom: "5px",
  display: "block",
  color: "#2c3e50"
};

const btnStyle = {
  marginTop: "10px",
  backgroundColor: "#27ae60",
  color: "white",
  padding: "12px",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: "bold",
  fontSize: "1rem"
};

export default SignUp;