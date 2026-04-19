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
          <div key={item.ProductID} style={cardStyle} onMouseOver={(e) => e.currentTarget.style.transform = "scale(1.03)"}
  onMouseOut={(e) => e.currentTarget.style.transform = "scale(1)"}>

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
  minHeight: "100vh",
  padding: "30px 20px",
  fontFamily: "Inter, Segoe UI, sans-serif",
  background: "linear-gradient(135deg, #dbeafe, #f0fdf4)"
};

const titleStyle = {
  margin: 0,
  fontSize: "2rem",
  fontWeight: "800",
  color: "#111827",
  textAlign: "center"
};

const subtitleStyle = {
  marginTop: "6px",
  marginBottom: "24px",
  color: "#6b7280",
  textAlign: "center"
};

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "16px",
  maxWidth: "1000px",
  margin: "0 auto"
};

const cardStyle = {
  background: "rgba(255,255,255,0.9)",
  backdropFilter: "blur(8px)",
  borderRadius: "16px",
  padding: "16px",
  boxShadow: "0 12px 30px rgba(0,0,0,0.08)",
  border: "1px solid #e5e7eb",
  transition: "all 0.2s ease",
  cursor: "pointer"
};

const brandStyle = {
  fontSize: "11px",
  color: "#2563eb",
  fontWeight: "700",
  marginBottom: "6px",
  textTransform: "uppercase",
  letterSpacing: "0.5px"
};

const nameStyle = {
  margin: 0,
  fontSize: "1.1rem",
  fontWeight: "700",
  color: "#111827"
};

const sizeStyle = {
  marginTop: "8px",
  color: "#6b7280",
  fontSize: "0.85rem"
};

const idStyle = {
  marginTop: "10px",
  fontSize: "10px",
  color: "#9ca3af"
};

const formStyle = {
  marginBottom: "30px",
  padding: "20px",
  background: "rgba(255,255,255,0.9)",
  borderRadius: "16px",
  border: "1px solid #e5e7eb",
  boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
  display: "flex",
  flexWrap: "wrap",
  gap: "10px",
  justifyContent: "center"
};

const inputStyle = {
  padding: "10px",
  borderRadius: "8px",
  border: "1px solid #e5e7eb",
  fontSize: "0.9rem",
  outline: "none",
  backgroundColor: "#f9fafb"
};

const addButtonStyle = {
  background: "linear-gradient(135deg, #22c55e, #16a34a)",
  color: "white",
  padding: "10px 16px",
  border: "none",
  borderRadius: "10px",
  cursor: "pointer",
  fontWeight: "bold",
  boxShadow: "0 8px 18px rgba(34,197,94,0.25)"
};

const deleteButtonStyle = {
  marginTop: "12px",
  background: "linear-gradient(135deg, #ef4444, #dc2626)",
  color: "white",
  border: "none",
  padding: "8px 12px",
  borderRadius: "8px",
  cursor: "pointer",
  fontSize: "0.8rem",
  fontWeight: "600"
};

export default ProductPage;