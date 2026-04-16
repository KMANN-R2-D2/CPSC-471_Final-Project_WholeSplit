import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const JoinDetails = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [qty, setQty] = useState(1);
  const user = JSON.parse(localStorage.getItem("user"));

  const handleConfirmJoin = async () => {
    try {
      // Send the specific quantity the user wants
      await axios.post("http://localhost:3000/groups", {
        PostID: postId,
        ResponderUserID: user.UserID,
        QuantityTaken: qty 
      });
      navigate("/"); // Go back to feed to see the updated progress
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ padding: "40px", color: "white", textAlign: "center" }}>
      <h1>Final Step: Unit Split</h1>
      <p>How many units of this item are you claiming?</p>
      
      <div style={{ margin: "20px 0" }}>
        <input 
          type="number" 
          value={qty} 
          onChange={(e) => setQty(e.target.value)}
          style={{ padding: "10px", width: "60px", fontSize: "1.2rem" }}
          min="1"
        />
      </div>

      <button onClick={handleConfirmJoin} style={btnStyle}>Confirm & Join Split</button>
    </div>
  );
};

const btnStyle = { background: "#27ae60", color: "white", border: "none", padding: "10px 20px", borderRadius: "5px", cursor: "pointer" };

export default JoinDetails;