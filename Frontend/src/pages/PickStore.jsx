// The following resources were used to create this file and in general the whole of the frontend:
// Ramesh Fadatare (Java Guides). (2024, February 13). Spring Boot React JS Full-Stack Project | Employee Management System.
// https://www.youtube.com/watch?v=KuM6OtuaYRs
// Lama Dev. (2022, September 18). React Node.js MySQL CRUD Tutorial for Beginners.
// https://www.youtube.com/watch?v=fPuLnzSjPLE

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate, Link } from "react-router-dom";

const API = "http://localhost:3000";
const DEMO_USER_ID = 113; // replace with real auth later

export default function PickStore() {
  const { postId }      = useParams();
  const navigate        = useNavigate();
  const [stores, setStores]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(null); // storeId being processed
  const [toast, setToast]     = useState(null);

  /**
   * FETCH STORES ON COMPONENT LOAD
   */
  useEffect(() => {
    axios
      .get("http://localhost:3000/stores")
      .then(res => setStores(res.data))
      .catch(err => console.error("Error fetching stores:", err));
  }, []);

  const handleStoreSelect = (storeId, storeName) => {
  // We need to know how many are left to set the slider max
  // You can pass the remaining units here if you have them in state, 
  // or just pass the store info and let JoinDetails handle the UI.
  navigate(`/join-details/${postId}`, { 
    state: { 
      storeID: storeId, 
      storeName: storeName 
    } 
  });
};
  

  return (
    <div
      style={{
        padding: "40px",
        fontFamily: "Segoe UI, Tahoma, sans-serif"
      }}
    >
      <h2 style={{ color: "#2c3e50" }}>
        Select a Location for Split #{postId}
      </h2>

      <p style={{ color: "#7f8c8d" }}>
        Choose a Costco to proceed to quantity selection.
      </p>

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginTop: "20px"
        }}
      >
        <thead>
          <tr
            style={{
              textAlign: "left",
              borderBottom: "2px solid #eee",
              color: "#666",
              backgroundColor: "#f2f2f2"
            }}
          >
            <th style={{ padding: "12px" }}>Store Name</th>
            <th style={{ padding: "12px" }}>City</th>
            <th style={{ padding: "12px" }}>Action</th>
          </tr>
        </thead>

        <tbody>
          {stores.map((store, index) => (
            <tr
              key={store.StoreID}
              style={{
                backgroundColor: index % 2 === 0 ? "#fff" : "#f9f9f9",
                borderBottom: "1px solid #eee"
              }}
            >
              <td style={{ padding: "12px", fontWeight: "600" }}>
                {store.Name}
              </td>
              <td style={{ padding: "12px" }}>
                {store.City}
              </td>
              <td style={{ padding: "12px" }}>
                <button
                  onClick={() => handleStoreSelect(store.StoreID, store.Name)}
                  style={{
                    backgroundColor: "#27ae60",
                    color: "white",
                    border: "none",
                    padding: "8px 20px",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontWeight: "bold"
                  }}
                >
                  Confirm Location
                </button>
              </td>
            </tr>
          ))}
        </div>
      )}

      {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}
    </div>
  );
}