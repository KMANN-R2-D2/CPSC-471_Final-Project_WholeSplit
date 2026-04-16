import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

const PickStore = () => {
  const { postId } = useParams();
  const [stores, setStores] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Ensure this matches your backend port (3000)
    axios.get("http://localhost:3000/stores").then(res => setStores(res.data));
  }, []);

  const handleJoin = async (storeId) => {
  try {
    // 1. Send data to backend
    const res = await axios.post("http://localhost:3000/groups", {
      StoreID: storeId,
      ResponderUserID: 113, // hardcoded for demo; replace with actual logged-in user ID in production
      PostID: postId
    });

    // 2. VISUAL FEEDBACK: This runs only if the backend succeeds
    if (res.status === 200) {
      alert("Success! You've joined the split.");
      navigate("/"); // This physically moves the user back to the main list
    }
  } catch (err) {
    console.error("Group creation failed:", err);
    alert("Error: Could not join split. Check your backend terminal.");
  }
};

  return (
    <div style={{ padding: "40px", fontFamily: "Segoe UI" }}>
      <h2 style={{ color: "#2c3e50" }}>Select a Location for Split #{postId}</h2>
      <p style={{ color: "#7f8c8d" }}>Choose a Costco to finalize this group.</p>
      
      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "20px" }}>
        <thead>
          <tr style={{ textAlign: "left", borderBottom: "2px solid #eee", color: "#666" }}>
            <th style={{ padding: "10px" }}>Store Name</th>
            <th style={{ padding: "10px" }}>City</th>
            <th style={{ padding: "10px" }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {stores.map((store, index) => (
            <tr key={store.StoreID} style={{ backgroundColor: index % 2 === 0 ? "#fff" : "#f9f9f9", borderBottom: "1px solid #eee" }}>
              <td style={{ padding: "10px", fontWeight: "600" }}>{store.Name}</td>
              <td style={{ padding: "10px" }}>{store.City}</td>
              <td style={{ padding: "10px" }}>
                <button 
                  onClick={() => Number(handleJoin(store.StoreID))}
                  style={{ backgroundColor: "#27ae60", color: "white", border: "none", padding: "5px 15px", borderRadius: "4px", cursor: "pointer" }}
                >
                  Confirm Location
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PickStore;