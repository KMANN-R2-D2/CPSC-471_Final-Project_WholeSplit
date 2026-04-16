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
  padding: "20px",
  fontFamily: "Segoe UI, sans-serif"
};

// Header section
const headerStyle = {
  marginBottom: "20px"
};

// List container
const listStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "12px"
};

// Store card
const cardStyle = {
  backgroundColor: "#fff",
  border: "1px solid #eee",
  borderRadius: "12px",
  padding: "16px",
  cursor: "pointer",
  boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
  transition: "0.2s ease"
};

// Store name
const storeNameStyle = {
  margin: 0,
  color: "#2c3e50"
};

// City text
const cityStyle = {
  margin: "6px 0 0 0",
  color: "#7f8c8d"
};

// Action hint text
const actionText = {
  marginTop: "10px",
  fontSize: "13px",
  color: "#3498db",
  fontWeight: "bold"
};

// Special "Add store" card (visually different)
const addStoreCardStyle = {
  backgroundColor: "#f9fbff",
  border: "2px dashed #3498db",
  borderRadius: "12px",
  padding: "16px",
  cursor: "pointer",
  textAlign: "center"
};

export default PickStore;