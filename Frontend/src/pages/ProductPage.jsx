// ======================================================
// IMPORTS
// ======================================================
import React, { useState, useEffect } from "react";
import axios from "axios";

// ======================================================
// COMPONENT
// ======================================================
const ProductPage = () => {

  // ======================================================
  // STATE MANAGEMENT
  // ======================================================
  const [products, setProducts] = useState([]);

  const [newProduct, setNewProduct] = useState({
    ProductName: "",
    Brand: "",
    BulkSize: "",
    BulkAmount: ""
  });

  // ======================================================
  // USER + ROLE CHECK
  // ======================================================
  const user = JSON.parse(localStorage.getItem("user"));
  const isAdmin = user?.Role === "Admin";

  // ======================================================
  // FETCH PRODUCTS ON LOAD
  // ======================================================
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await axios.get("http://localhost:3000/products");
      setProducts(res.data);
    } catch (err) {
      console.error("Error fetching products:", err);
    }
  };

  // ======================================================
  // ADD PRODUCT (ADMIN ONLY)
  // ======================================================
  const handleAdd = async (e) => {
    e.preventDefault();

    try {
      await axios.post("http://localhost:3000/products", newProduct);

      // Reset form
      setNewProduct({
        ProductName: "",
        Brand: "",
        BulkSize: "",
        BulkAmount: ""
      });

      // Refresh list
      fetchProducts();
    } catch (err) {
      console.error(err);
      alert("Error adding product.");
    }
  };

  // ======================================================
  // DELETE PRODUCT (ADMIN ONLY)
  // ======================================================
  const handleDelete = async (id) => {

    const confirmDelete = window.confirm("Are you sure you want to delete this product?");
    if (!confirmDelete) return;

    try {
      await axios.delete(`http://localhost:3000/products/${id}`);

      // Refresh list
      fetchProducts();
    } catch (err) {
      const msg = err.response?.data?.message || "Delete failed";
      alert(msg);
    }
  };

  // ======================================================
  // RENDER
  // ======================================================
  return (
    <div style={pageStyle}>

      {/* ======================================================
          PAGE HEADER
      ====================================================== */}
      <h1 style={titleStyle}>
        Inventory Catalogue
      </h1>

      <p style={subtitleStyle}>
        Browse available products for splitting
      </p>

      {/* ======================================================
          ADMIN ADD FORM
      ====================================================== */}
      {isAdmin && (
        <form onSubmit={handleAdd} style={formStyle}>

          <h3>Add New Product</h3>

          <input
            type="text"
            placeholder="Product Name"
            value={newProduct.ProductName}
            onChange={e => setNewProduct({ ...newProduct, ProductName: e.target.value })}
            required
            style={inputStyle}
          />

          <input
            type="text"
            placeholder="Brand"
            value={newProduct.Brand}
            onChange={e => setNewProduct({ ...newProduct, Brand: e.target.value })}
            required
            style={inputStyle}
          />

          <input
            type="number"
            placeholder="Bulk Size"
            value={newProduct.BulkSize}
            onChange={e => setNewProduct({ ...newProduct, BulkSize: e.target.value })}
            required
            style={inputStyle}
          />

          <input
            type="number"
            placeholder="Bulk Amount"
            value={newProduct.BulkAmount}
            onChange={e => setNewProduct({ ...newProduct, BulkAmount: e.target.value })}
            required
            style={inputStyle}
          />

          <button type="submit" style={addButtonStyle}>
            Add Product
          </button>

        </form>
      )}

      {/* ======================================================
          PRODUCT GRID (YOUR UI STYLE)
      ====================================================== */}
      <div style={gridStyle}>

        {products.map(item => (
          <div key={item.ProductID} style={cardStyle}>

            {/* BRAND */}
            <div style={brandStyle}>
              {item.Brand}
            </div>

            {/* PRODUCT NAME */}
            <h3 style={nameStyle}>
              {item.ProductName}
            </h3>

            {/* BULK SIZE */}
            <p style={sizeStyle}>
              Bulk Size: {item.BulkSize}
            </p>

            {/* BULK AMOUNT */}
            <p style={sizeStyle}>
              Bulk Amount: {item.BulkAmount}
            </p>

            {/* PRICE */}
            {item.Price && (
              <p style={{ ...sizeStyle, color: "#27ae60", fontWeight: "bold" }}>
                ${Number(item.Price).toFixed(2)} · ${(item.Price / item.BulkAmount).toFixed(2)}/unit
              </p>
            )}

            {/* ID */}
            <div style={idStyle}>
              ID: {item.ProductID}
            </div>

            {/* ADMIN ACTIONS */}
            {isAdmin && (
              <button
                onClick={() => handleDelete(item.ProductID)}
                style={deleteButtonStyle}
              >
                Delete
              </button>
            )}

          </div>
        ))}

      </div>
    </div>
  );
};

// ======================================================
// STYLES
// ======================================================

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

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: "12px"
};

const cardStyle = {
  backgroundColor: "#fff",
  borderRadius: "12px",
  padding: "14px",
  boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
  border: "1px solid #eee"
};

const brandStyle = {
  fontSize: "12px",
  color: "#3498db",
  fontWeight: "bold",
  marginBottom: "6px"
};

const nameStyle = {
  margin: "0",
  fontSize: "1rem",
  color: "#2c3e50"
};

const sizeStyle = {
  marginTop: "8px",
  color: "#7f8c8d",
  fontSize: "14px"
};

const idStyle = {
  marginTop: "10px",
  fontSize: "11px",
  color: "#bdc3c7"
};

const formStyle = {
  marginBottom: "30px",
  padding: "20px",
  background: "#f9f9f9",
  borderRadius: "8px",
  border: "1px solid #ddd"
};

const inputStyle = {
  padding: "8px",
  marginRight: "10px",
  borderRadius: "4px",
  border: "1px solid #ddd",
  width: "150px"
};

const addButtonStyle = {
  backgroundColor: "#27ae60",
  color: "white",
  padding: "10px 15px",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
  fontWeight: "bold"
};

const deleteButtonStyle = {
  marginTop: "10px",
  backgroundColor: "#e74c3c",
  color: "white",
  border: "none",
  padding: "6px 10px",
  borderRadius: "4px",
  cursor: "pointer"
};

export default ProductPage;