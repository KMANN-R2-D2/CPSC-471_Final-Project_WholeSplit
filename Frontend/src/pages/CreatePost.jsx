import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const CreatePost = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  
  // Track the specific product object to get its BulkAmount for the slider
  const [selectedProduct, setSelectedProduct] = useState(null);

  const userString = localStorage.getItem("user");
  const user = userString ? JSON.parse(userString) : null;

  const [formData, setFormData] = useState({
    UserID: user ? user.UserID : "",
    ProductID: "",
    QuantityRequested: 1 // This represents the creator's share
  });

  useEffect(() => {
    if (!user) {
      alert("Please login first!");
      navigate("/login");
    } else {
      axios.get("http://localhost:3000/products")
        .then((res) => setProducts(res.data))
        .catch(err => console.error("Could not fetch products", err));
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "ProductID") {
      // Find the product to get its BulkAmount
      const prod = products.find(p => p.ProductID === Number(value));
      setSelectedProduct(prod);
      // Reset quantity to 1 when product changes
      setFormData(prev => ({ ...prev, ProductID: value, QuantityRequested: 1 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        UserID: Number(formData.UserID),
        ProductID: Number(formData.ProductID),
        QuantityRequested: Number(formData.QuantityRequested)
      };

      await axios.post("http://localhost:3000/posts", payload);
      alert("Split Request Published!");
      navigate("/");
    } catch (err) {
      console.error(err);
      alert("Failed to create post.");
    }
  };

  if (!user) return null;

  return (
    <div style={{ padding: "40px", fontFamily: "Segoe UI", maxWidth: "500px", margin: "auto" }}>
      <h2 style={{ color: "#FFFFFF", borderBottom: "2px solid #3498db", paddingBottom: "10px" }}>
        Create New Split Request
      </h2>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px", marginTop: "20px" }}>
        
        <h3>Select Product:</h3>
        <select name="ProductID" onChange={handleChange} required style={{ padding: "10px" }}>
          <option value="">-- Choose an Item --</option>
          {products.map(p => (
            <option key={p.ProductID} value={p.ProductID}>
              {p.Brand} - {p.ProductName}
            </option>
          ))}
        </select>

        {/* Dynamic Slider Logic */}
        {selectedProduct && (
          <div style={{ padding: "15px", background: "#f8f9fa", borderRadius: "8px", border: "1px solid #" }}>
            <p style={{ margin: "0 0 10px 0" }}>
              Package Size: <b>{selectedProduct.BulkAmount} units</b>
            </p>
            
            <label>How many units do you want to keep?</label>
            <input
              type="range"
              name="QuantityRequested"
              min="1"
              max={selectedProduct.BulkAmount} // Caps at product's BulkAmount
              value={formData.QuantityRequested}
              onChange={handleChange}
              style={{ width: "100%", cursor: "pointer", margin: "10px 0" }}
            />
            
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px" }}>
              <span>I take: <b>{formData.QuantityRequested}</b></span>
              <span>Remaining for others: <b>{selectedProduct.BulkAmount - formData.QuantityRequested}</b></span>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={!selectedProduct}
          style={{
            backgroundColor: selectedProduct ? "#3498db" : "#3498db",
            color: "white",
            border: "none",
            padding: "12px",
            cursor: selectedProduct ? "pointer" : "not-allowed",
            borderRadius: "4px",
            fontWeight: "bold",
            marginTop: "10px"
          }}
        >
          Publish to Feed
        </button>
      </form>
    </div>
  );
};

export default CreatePost;