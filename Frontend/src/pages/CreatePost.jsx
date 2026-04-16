import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const CreatePost = () => {
  const navigate = useNavigate();

  // 1. ADD: State for products (this was missing, causing the "products.map" crash)
  const [products, setProducts] = useState([]);

  // 2. SAFETY: Safely parse user or redirect if missing
  const userString = localStorage.getItem("user");
  const user = userString ? JSON.parse(userString) : null;

  const [formData, setFormData] = useState({
    UserID: user ? user.UserID : "", 
    ProductID: "",
    QuantityRequested: ""
  });

  // 3. ADD: Auth Guard - If no user is logged in, send them to login
  useEffect(() => {
    if (!user) {
      alert("Please login first!");
      navigate("/login");
    } else {
      // Fetch products only if we have a user
      axios.get("http://localhost:3000/products")
        .then((res) => setProducts(res.data))
        .catch(err => console.error("Could not fetch products", err));
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Ensure IDs are numbers before sending
      const payload = {
        ...formData,
        UserID: Number(formData.UserID),
        ProductID: Number(formData.ProductID)
      };
      
      await axios.post("http://localhost:3000/posts", payload);
      alert("Split Request Published to Feed!");
      navigate("/"); 
    } catch (err) {
      console.error(err);
      alert("Failed to create post. Make sure you are logged in correctly.");
    }
  };

  // 4. ADD: Early return if no user (prevents white screen while navigating)
  if (!user) return null;

  return (
    <div style={{ padding: "40px", fontFamily: "Segoe UI", maxWidth: "500px", margin: "auto" }}>
      <h2 style={{ color: "#2c3e50", borderBottom: "2px solid #3498db", paddingBottom: "10px" }}>
        Create New Split Request
      </h2>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px", marginTop: "20px" }}>
        
        <label>Select Product:</label>
        <select name="ProductID" onChange={handleChange} required style={{ padding: "10px" }}>
          <option value="">-- Choose an Item --</option>
          {products.map(p => (
            <option key={p.ProductID} value={p.ProductID}>
              {p.Brand} - {p.ProductName}
            </option>
          ))}
        </select>

        <label>Quantity You Need (Whole Numbers):</label>
        <input 
          type="number"  // Changed to number to match your INT requirement
          name="QuantityRequested" 
          placeholder="e.g. 1" 
          min="1"
          onChange={handleChange} 
          required 
          style={{ padding: "10px" }}
        />

        <button type="submit" style={{ 
          backgroundColor: "#3498db", 
          color: "white", 
          border: "none", 
          padding: "12px", 
          cursor: "pointer",
          borderRadius: "4px",
          fontWeight: "bold"
        }}>
          Publish to Feed
        </button>
      </form>
    </div>
  );
};

export default CreatePost;