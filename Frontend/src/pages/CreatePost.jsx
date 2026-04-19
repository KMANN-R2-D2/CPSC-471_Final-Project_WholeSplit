// The following resources were used to create this file and in general the whole of the frontend:

// Ramesh Fadatare (Java Guides). (n.d.). Spring Boot React JS Full-Stack Project | Employee Management System | Spring Boot React JS Course.
// https://www.youtube.com/watch?v=KuM6OtuaYRs

// Lama Dev. (2022, September 18). React Node.js MySQL CRUD Tutorial for Beginners.
// https://www.youtube.com/watch?v=fPuLnzSjPLE

// Import React hooks for state management and lifecycle control
import React, { useState, useEffect } from "react";

// Axios is used to communicate with backend API
import axios from "axios";

// useNavigate allows redirecting users between pages
import { useNavigate } from "react-router-dom";

const CreatePost = () => {

  // ======================================================
  // NAVIGATION HOOK
  // ======================================================
  const navigate = useNavigate();

  // ======================================================
  // STATE: LIST OF PRODUCTS
  // Used to populate dropdown from backend API
  // ======================================================
  const [products, setProducts] = useState([]);

  const [stores, setStores] = useState([]);

  // ======================================================
  // USER AUTHENTICATION
  // Retrieve logged-in user from localStorage
  // ======================================================
  const userString = localStorage.getItem("user");
  const user = userString ? JSON.parse(userString) : null;

  // ======================================================
  // FORM STATE
  // Stores user input before submission
  // ======================================================
  const [formData, setFormData] = useState({
    UserID: user ? user.UserID : "",
    ProductID: "",
    StoreID: "",
    QuantityRequested: ""
  });

  // ======================================================
  // FETCH PRODUCTS ON PAGE LOAD
  // Also ensures user is logged in
  // ======================================================
  useEffect(() => {
    if (!user) {
      alert("Please login first!");
      navigate("/login");
    } else {
      axios.get("http://localhost:3000/products")
        .then(res => setProducts(res.data))
        .catch(err => console.error("Error fetching products:", err));

      axios.get("http://localhost:3000/stores")
        .then(res => setStores(res.data))
        .catch(err => console.error("Error fetching stores:", err));
    }
  }, [user, navigate]);

  // ======================================================
  // HANDLE INPUT CHANGES
  // Dynamically updates correct form field
  // ======================================================
  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  // ======================================================
  // HANDLE FORM SUBMISSION
  // Sends POST request to backend to create new split post
  // ======================================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Convert values to numbers before sending to backend
      const payload = {
        ...formData,
        UserID: Number(formData.UserID),
        ProductID: Number(formData.ProductID),
        StoreID: Number(formData.StoreID),
        QuantityRequested: Number(formData.QuantityRequested)
      };

      await axios.post("http://localhost:3000/create-post", payload);

      alert("Split Request Published to Feed!");

      // Redirect user to homepage after success
      navigate("/");
    } catch (err) {
      console.error("Error creating post:", err);
      alert("Error: " + (err.response?.data?.message || err.response?.data || err.message));
    }
  };

  // ======================================================
  // SAFETY CHECK
  // Prevent rendering if user is not logged in
  // ======================================================
  if (!user) return null;

  return (
    <div style={pageStyle}>

      {/* ======================================================
          MAIN CARD CONTAINER
          Centers content and improves visual structure
      ====================================================== */}
      <div style={cardStyle}>

        {/* PAGE TITLE */}
        <h2 style={titleStyle}>
          Create New Split Request
        </h2>

        {/* SUBTITLE */}
        <p style={subtitleStyle}>
          Choose a product and quantity to start a group split.
        </p>

        {/* ======================================================
            FORM START
        ====================================================== */}
        <form onSubmit={handleSubmit} style={formStyle}>

          {/* PRODUCT SELECT */}
          <div style={fieldGroup}>
            <label style={labelStyle}>Select Product</label>
            <select
              name="ProductID"
              onChange={handleChange}
              required
              style={inputStyle}
            >
              <option value="">Choose an item</option>

              {/* Dynamically render product options */}
              {products.map(p => (
                <option key={p.ProductID} value={p.ProductID}>
                  {p.Brand} - {p.ProductName}
                </option>
              ))}
            </select>
          </div>

          {/* STORE SELECT */}
          <div style={fieldGroup}>
            <label style={labelStyle}>Select Store</label>
            <select
              name="StoreID"
              onChange={handleChange}
              required
              style={inputStyle}
            >
              <option value="">Choose a store</option>
              {stores.map(s => (
                <option key={s.StoreID} value={s.StoreID}>
                  {s.Name} — {s.City}
                </option>
              ))}
            </select>
          </div>
          
          {/* QUANTITY INPUT */}
          <div style={fieldGroup}>
            <label style={labelStyle}>Quantity</label>
            <input
              type="number"
              name="QuantityRequested"
              min="1"
              placeholder="e.g. 1"
              onChange={handleChange}
              required
              style={inputStyle}
            />
          </div>

          {/* SUBMIT BUTTON */}
          <button type="submit" style={buttonStyle}>
            Publish to Feed
          </button>

        </form>
        {/* FORM END */}

      </div>
    </div>
  );
};

// ======================================================
// STYLES
// Mobile-first, responsive-friendly design
// ======================================================

// Page wrapper (centers content)
const pageStyle = {
  padding: "20px",
  fontFamily: "Segoe UI, sans-serif",
  display: "flex",
  justifyContent: "center",
  alignItems: "center"
};

// Main card container
const cardStyle = {
  width: "100%",
  maxWidth: "600px",
  backgroundColor: "#fff",
  padding: "20px",
  borderRadius: "12px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
};

// Title styling
const titleStyle = {
  marginBottom: "8px",
  color: "#2c3e50"
};

// Subtitle styling
const subtitleStyle = {
  marginBottom: "20px",
  color: "#7f8c8d",
  fontSize: "0.95rem"
};

// Form layout
const formStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "16px"
};

// Grouping label + input
const fieldGroup = {
  display: "flex",
  flexDirection: "column",
  gap: "6px"
};

// Label styling
const labelStyle = {
  fontWeight: "600",
  color: "#2c3e50"
};

// Input / select styling
const inputStyle = {
  padding: "12px",
  borderRadius: "8px",
  border: "1px solid #ddd",
  fontSize: "1rem"
};

// Primary action button
const buttonStyle = {
  marginTop: "10px",
  backgroundColor: "#3498db",
  color: "white",
  border: "none",
  padding: "14px",
  borderRadius: "8px",
  fontWeight: "bold",
  cursor: "pointer",
  fontSize: "1rem"
};

export default CreatePost;