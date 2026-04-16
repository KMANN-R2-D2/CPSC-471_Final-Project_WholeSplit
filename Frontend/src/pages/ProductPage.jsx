// Import React hooks
import React, { useState, useEffect } from "react";

// Axios for API calls
import axios from "axios";

const Products = () => {

  // ======================================================
  // PRODUCT LIST STATE
  // ======================================================
  const [data, setData] = useState([]);

  // ======================================================
  // FETCH PRODUCTS ON LOAD
  // ======================================================
  useEffect(() => {
    axios
      .get("http://localhost:3000/products")
      .then(res => setData(res.data));
  }, []);

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
          PRODUCT GRID
      ====================================================== */}
      <div style={gridStyle}>

        {data.map(item => (
          <div key={item.ProductID} style={cardStyle}>

            {/* BRAND */}
            <div style={brandStyle}>
              {item.Brand}
            </div>

            {/* PRODUCT NAME */}
            <h3 style={nameStyle}>
              {item.ProductName}
            </h3>

            {/* SIZE */}
            <p style={sizeStyle}>
              Size: {item.Size}
            </p>

            {/* ID (subtle, not prominent) */}
            <div style={idStyle}>
              ID: {item.ProductID}
            </div>

          </div>
        ))}

      </div>
    </div>
  );
};

/* ======================================================
   STYLES (mobile-first product grid)
====================================================== */

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
  border: "1px solid #eee",
  cursor: "default"
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

export default Products;