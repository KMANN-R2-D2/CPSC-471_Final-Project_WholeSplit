import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

const JoinDetails = () => {
  const { postId } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  
  const [qty, setQty] = useState(1);
  const [maxAvailable, setMaxAvailable] = useState(1);
  const user = JSON.parse(localStorage.getItem("user"));

  // Fetch the current remaining amount to set the slider limit
  useEffect(() => {
    axios.get(`http://localhost:3000/posts`).then(res => {
      const currentPost = res.data.find(p => p.PostID === parseInt(postId));
      if (currentPost) {
        // MATCHING YOUR BACKEND NAMES: BulkAmount, QuantityRequested, OthersClaimed
        const totalTaken = Number(currentPost.QuantityRequested || 0) + Number(currentPost.OthersClaimed || 0);
        const remaining = Math.max(Number(currentPost.BulkAmount || 0) - totalTaken, 0);
        
        setMaxAvailable(remaining);
        // Set initial qty to 1, or 0 if nothing is left
        setQty(remaining > 0 ? 1 : 0);
      }
    });
  }, [postId]);

  const handleConfirmJoin = async () => {
  try {
    await axios.post("http://localhost:3000/groups", {
      PostID: Number(postId), // Ensure this is a number
      ResponderUserID: Number(user.UserID),
      StoreID: Number(state.storeID),
      QuantityTaken: Number(qty) // Ensure this is a number
    });
    navigate("/");
  } catch (err) {
    alert(err.response?.data?.message || "Failed to join");
  }
};

  return (
    <div style={{ padding: "40px", textAlign: "center", color: "#2c3e50", fontFamily: "Segoe UI" }}>
      <h1>Claim Your Units</h1>
      <p style={{ color: "#FFFFFF" }}>Store: <b>{state?.storeName}</b></p>

      <div style={{ margin: "40px auto", maxWidth: "400px" }}>
        <h2 style={{ fontSize: "3rem", margin: "10px 0", color: "#3498db" }}>{qty}</h2>
        <p style={{ color: "#FFFFFF" }}>Units out of <b>{maxAvailable}</b> remaining in this bulk pack</p>
        
        {/* THE SLIDER BAR */}
        <input 
          type="range"
          min="1"
          max={maxAvailable > 0 ? maxAvailable : 1}
          disabled={maxAvailable === 0}
          value={qty}
          onChange={(e) => setQty(parseInt(e.target.value))}
          style={{ width: "100%", height: "15px", cursor: maxAvailable > 0 ? "pointer" : "not-allowed" }}
        />

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "10px", color: "#7f8c8d" }}>
          <span>1</span>
          <span>{maxAvailable}</span>
        </div>
      </div>

      <button 
        onClick={handleConfirmJoin} 
        disabled={maxAvailable === 0}
        style={{
          ...btnStyle,
          backgroundColor: maxAvailable === 0 ? "#ccc" : "#27ae60",
          cursor: maxAvailable === 0 ? "not-allowed" : "pointer"
        }}
      >
        Confirm Selection
      </button>
    </div>
  );
};

const btnStyle = { color: "white", padding: "15px 30px", border: "none", borderRadius: "8px", fontSize: "1.1rem", fontWeight: "bold" };

export default JoinDetails;