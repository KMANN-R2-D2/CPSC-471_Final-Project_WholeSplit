// The following resources were used to create this file and in general the whole of the frontend:
// Ramesh Fadatare (Java Guides). (2024, February 13). Spring Boot React JS Full-Stack Project | Employee Management System.
// https://www.youtube.com/watch?v=KuM6OtuaYRs
// Lama Dev. (2022, September 18). React Node.js MySQL CRUD Tutorial for Beginners.
// https://www.youtube.com/watch?v=fPuLnzSjPLE

// Import React hooks for state and lifecycle management
import React, { useEffect, useState } from "react";

// Axios for backend API calls
import axios from "axios";

// React Router hooks for navigation and reading URL params
import { useParams, useNavigate } from "react-router-dom";

const PickStore = () => {

  // ======================================================
  // GET POST ID FROM URL
  // ======================================================
  const { postId } = useParams();

  // ======================================================
  // STORE LIST STATE
  // ======================================================
  const [stores, setStores] = useState([]);

  // Navigation hook
  const navigate = useNavigate();

  // ======================================================
  // FETCH STORES ON COMPONENT LOAD
  // ======================================================
  useEffect(() => {
    axios
      .get("http://localhost:3000/stores")
      .then(res => setStores(res.data))
      .catch(err => console.error("Error fetching stores:", err));
  }, []);

  // ======================================================
  // HANDLE STORE SELECTION
  // Pass selected store to next page
  // ======================================================
  const handleStoreSelect = (storeId, storeName) => {
    navigate(`/join-details/${postId}`, {
      state: {
        storeID: storeId,
        storeName: storeName
      }
    });
  };

  return (
    <div style={pageStyle}>

      {/* ======================================================
          PAGE HEADER
      ====================================================== */}
      <div style={headerStyle}>
        <h2 style={{ margin: 0, color: "#2c3e50" }}>
          Select a Location for Split #{postId}
        </h2>

        <p style={{ margin: "8px 0 0 0", color: "#7f8c8d" }}>
          Choose a Costco to proceed to quantity selection
        </p>
      </div>

      {/* ======================================================
          STORE LIST (CARD LAYOUT)
      ====================================================== */}
      <div style={listStyle}>

        {/* RENDER STORES */}
        {stores.map((store) => (
          <div
            key={store.StoreID}
            onClick={() =>
              handleStoreSelect(store.StoreID, store.Name)
            }
            onMouseOver={(e) => e.currentTarget.style.transform = "scale(1.03)"}
  onMouseOut={(e) => e.currentTarget.style.transform = "scale(1)"}
            style={cardStyle}
          >
            <h3 style={storeNameStyle}>
              {store.Name}
            </h3>

            <p style={cityStyle}>
              {store.City}
            </p>

            <div style={actionText}>
              Tap to select →
            </div>
          </div>
        ))}

        {/* ======================================================
            ADD NEW STORE OPTION
            (Fallback for missing locations)
        ====================================================== */}
        <div
          style={addStoreCardStyle}
          onClick={() => navigate("/add-store")}
        >
          <h3 style={{ margin: 0, color: "#2c3e50" }}>
            + Can’t find your store?
          </h3>

          <p style={{ margin: "6px 0 0 0", color: "#7f8c8d" }}>
            Tap here to request a new location
          </p>
        </div>

      </div>
    </div>
  );
};

/* ======================================================
   STYLES (mobile-first card UI)
====================================================== */

// Page wrapper
const pageStyle = {
  minHeight: "100vh",
  padding: "30px 20px",
  fontFamily: "Inter, Segoe UI, sans-serif",
  background: "linear-gradient(135deg, #dbeafe, #f0fdf4)"
};

// Header section
const headerStyle = {
  marginBottom: "24px",
  textAlign: "center"
};

// List container
const listStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "16px",
  maxWidth: "520px",
  margin: "0 auto"
};

// Store card
const cardStyle = {
  background: "rgba(255,255,255,0.9)",
  backdropFilter: "blur(8px)",
  border: "1px solid #e5e7eb",
  borderRadius: "16px",
  padding: "18px",
  cursor: "pointer",
  boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
  transition: "all 0.2s ease"
};

// Store name
const storeNameStyle = {
  margin: 0,
  fontSize: "1.2rem",
  fontWeight: "700",
  color: "#111827"
};

// City text
const cityStyle = {
  margin: "6px 0 0 0",
  color: "#6b7280",
  fontSize: "0.9rem"
};

// Action hint text
const actionText = {
  marginTop: "12px",
  fontSize: "13px",
  color: "#2563eb",
  fontWeight: "600"
};

// Special "Add store" card (visually different)
const addStoreCardStyle = {
  background: "rgba(255,255,255,0.6)",
  border: "2px dashed #3b82f6",
  borderRadius: "16px",
  padding: "20px",
  cursor: "pointer",
  textAlign: "center",
  backdropFilter: "blur(6px)",
  transition: "all 0.2s ease"
};

export default PickStore;