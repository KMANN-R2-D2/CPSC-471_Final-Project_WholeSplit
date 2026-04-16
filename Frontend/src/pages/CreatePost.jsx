import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const CreatePost = () => {
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({
    UserID: 113, // Hardcoded for demo, or use a dropdown to pick a user
    ProductID: "",
    QuantityRequested: ""
  });
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch products so the user can choose what to split
    axios.get("http://localhost:3000/products").then((res) => setProducts(res.data));
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:3000/posts", formData);
      alert("Split Request Published to Feed!");
      navigate("/"); // Go back to the feed to see the new post
    } catch (err) {
      console.error(err);
      alert("Failed to create post.");
    }
  };

  return (
    <div style={{ padding: "40px", fontFamily: "Segoe UI", maxWidth: "500px" }}>
      <h2 style={{ color: "#2c3e50", borderBottom: "2px solid #3498db" }}>Create New Split Request</h2>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px", marginTop: "20px" }}>
        
        <label>Select Product:</label>
        <select name="ProductID" onChange={handleChange} required style={{ padding: "10px" }}>
          <option value="">-- Choose an Item --</option>
          {products.map(p => (
            <option key={p.ProductID} value={p.ProductID}>{p.Brand} - {p.ProductName}</option>
          ))}
        </select>

        <label>Quantity You Need (e.g., '1 of 2'):</label>
        <input 
          type="text" 
          name="QuantityRequested" 
          placeholder="e.g. 1 Jar" 
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