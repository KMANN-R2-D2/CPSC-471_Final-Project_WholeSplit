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

          <input onFocus={(e) => e.target.style.border = "1px solid #3b82f6"}
onBlur={(e) => e.target.style.border = "1px solid #e5e7eb"} name="FName" placeholder="First Name" onChange={handleChange} required style={inputStyle} />
          <input onFocus={(e) => e.target.style.border = "1px solid #3b82f6"}
onBlur={(e) => e.target.style.border = "1px solid #e5e7eb"} name="LName" placeholder="Last Name" onChange={handleChange} required style={inputStyle} />
          <input onFocus={(e) => e.target.style.border = "1px solid #3b82f6"}
onBlur={(e) => e.target.style.border = "1px solid #e5e7eb"} type="email" name="Email" placeholder="Email" onChange={handleChange} required style={inputStyle} />
          <input onFocus={(e) => e.target.style.border = "1px solid #3b82f6"}
onBlur={(e) => e.target.style.border = "1px solid #e5e7eb"} type="password" name="Password" placeholder="Password" onChange={handleChange} required style={inputStyle} />
          <input onFocus={(e) => e.target.style.border = "1px solid #3b82f6"}
onBlur={(e) => e.target.style.border = "1px solid #e5e7eb"} name="PostalCode" placeholder="Postal Code" onChange={handleChange} required style={inputStyle} />

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
            <input onFocus={(e) => e.target.style.border = "1px solid #3b82f6"}
onBlur={(e) => e.target.style.border = "1px solid #e5e7eb"}
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

              <input onFocus={(e) => e.target.style.border = "1px solid #3b82f6"}
onBlur={(e) => e.target.style.border = "1px solid #e5e7eb"}
                name="Expiry"
                type="date"
                onChange={handleChange}
                required
                style={inputStyle}
              />
            </div>
          )}

          {/* SUBMIT BUTTON */}
          <button onMouseOver={(e) => e.target.style.transform = "scale(1.04)"}
            onMouseOut={(e) => e.target.style.transform = "scale(1)"} type="submit" style={btnStyle}>
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
  fontFamily: "Inter, Segoe UI, sans-serif",
  background: "linear-gradient(135deg, #dbeafe, #f0fdf4)"
};

const cardStyle = {
  width: "100%",
  maxWidth: "460px",
  background: "rgba(255,255,255,0.9)",
  backdropFilter: "blur(10px)",
  padding: "32px",
  borderRadius: "20px",
  boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
  border: "1px solid rgba(255,255,255,0.3)"
};

const titleStyle = {
  marginBottom: "6px",
  fontSize: "1.8rem",
  fontWeight: "800",
  color: "#111827",
  textAlign: "center"
};

const subtitleStyle = {
  marginBottom: "22px",
  color: "#6b7280",
  textAlign: "center",
  fontSize: "0.9rem"
};

const formStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "14px"
};

const inputStyle = {
  padding: "14px",
  borderRadius: "10px",
  border: "1px solid #e5e7eb",
  fontSize: "1rem",
  outline: "none",
  backgroundColor: "#f9fafb",
  transition: "all 0.2s ease"
};

const checkboxRow = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  marginTop: "10px",
  cursor: "pointer",
  fontSize: "0.9rem",
  color: "#374151"
};

const membershipCard = {
  marginTop: "10px",
  padding: "16px",
  borderRadius: "14px",
  border: "1px solid #3b82f6",
  background: "linear-gradient(135deg, #eff6ff, #f0fdf4)"
};

const labelStyle = {
  fontSize: "0.8rem",
  marginBottom: "4px",
  display: "block",
  color: "#374151",
  fontWeight: "600"
};

const btnStyle = {
  marginTop: "14px",
  background: "linear-gradient(135deg, #22c55e, #16a34a)",
  color: "white",
  padding: "14px",
  border: "none",
  borderRadius: "12px",
  cursor: "pointer",
  fontWeight: "bold",
  fontSize: "1rem",
  boxShadow: "0 10px 20px rgba(34,197,94,0.25)",
  transition: "all 0.2s ease"
};

export default SignUp;