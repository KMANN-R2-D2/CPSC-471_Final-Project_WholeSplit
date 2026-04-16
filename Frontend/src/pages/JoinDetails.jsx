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
        // Calculate limit: Initial - Claimed
        const remaining = currentPost.QuantityRequested - (currentPost.UnitsClaimed || 0);
        setMaxAvailable(remaining);
      }
    });
  }, [postId]);

  const handleConfirmJoin = async () => {
    try {
      await axios.post("http://localhost:3000/groups", {
        PostID: postId,
        ResponderUserID: user.UserID,
        StoreID: state.storeID,
        QuantityTaken: qty
      });
      navigate("/");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to join");
    }
  };

  return (
    <div style={{ padding: "40px", textAlign: "center", color: "#2c3e50" }}>
      <h1>Claim Your Units</h1>
      <p>Store: <b>{state?.storeName}</b></p>

      <div style={{ margin: "40px auto", maxWidth: "400px" }}>
        <h2 style={{ fontSize: "3rem", margin: "10px 0", color: "#3498db" }}>{qty}</h2>
        <p>Units out of {maxAvailable} available</p>
        
        {/* THE SLIDER BAR */}
        <input 
          type="range"
          min="1"
          max={maxAvailable}
          value={qty}
          onChange={(e) => setQty(parseInt(e.target.value))}
          style={{ width: "100%", height: "15px", cursor: "pointer" }}
        />

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "10px", color: "#7f8c8d" }}>
          <span>1</span>
          <span>{maxAvailable}</span>
        </div>
      </div>

      <button onClick={handleConfirmJoin} style={btnStyle}>
        Confirm Selection
      </button>
    </div>
  );
};

const btnStyle = { backgroundColor: "#27ae60", color: "white", padding: "15px 30px", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "1.1rem", fontWeight: "bold" };

export default JoinDetails;