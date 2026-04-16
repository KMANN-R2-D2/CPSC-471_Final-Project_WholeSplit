import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

const JoinDetails = () => {
  const { postId } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();

  // ======================================================
  // STATE: quantity user wants to claim
  // ======================================================
  const [qty, setQty] = useState(1);

  // ======================================================
  // STATE: maximum available units
  // ======================================================
  const [maxAvailable, setMaxAvailable] = useState(1);

  // ======================================================
  // USER DATA FROM LOCAL STORAGE
  // ======================================================
  const user = JSON.parse(localStorage.getItem("user"));

  // ======================================================
  // FETCH CURRENT POST DATA
  // Used to calculate remaining available units
  // ======================================================
  useEffect(() => {
    axios.get("http://localhost:3000/posts").then(res => {
      const currentPost = res.data.find(
        p => p.PostID === parseInt(postId)
      );

      if (currentPost) {
        const remaining =
          currentPost.QuantityRequested -
          (currentPost.UnitsClaimed || 0);

        setMaxAvailable(remaining);

        // Ensure qty never exceeds available
        setQty(Math.min(1, remaining));
      }
    });
  }, [postId]);

  // ======================================================
  // HANDLE CONFIRMATION
  // Sends join request to backend
  // ======================================================
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
    <div style={pageStyle}>

      {/* ======================================================
          MAIN CARD CONTAINER
      ====================================================== */}
      <div style={cardStyle}>

        {/* TITLE */}
        <h1 style={titleStyle}>
          Claim Your Units
        </h1>

        {/* STORE INFO */}
        <p style={subtitleStyle}>
          Store: <b>{state?.storeName}</b>
        </p>

        {/* ======================================================
            QUANTITY DISPLAY
        ====================================================== */}
        <div style={qtyDisplay}>
          {qty}
        </div>

        <p style={infoText}>
          Units out of <b>{maxAvailable}</b> available
        </p>

        {/* ======================================================
            SLIDER CONTROL
        ====================================================== */}
        <input
          type="range"
          min="1"
          max={maxAvailable}
          value={qty}
          onChange={(e) => setQty(parseInt(e.target.value))}
          style={sliderStyle}
        />

        {/* RANGE LABELS */}
        <div style={rangeRow}>
          <span>1</span>
          <span>{maxAvailable}</span>
        </div>

        {/* ======================================================
            CONFIRM BUTTON
        ====================================================== */}
        <button onClick={handleConfirmJoin} style={btnStyle}>
          Confirm Selection
        </button>

      </div>
    </div>
  );
};

/* ======================================================
   STYLES (Mobile-first card layout)
====================================================== */

const pageStyle = {
  minHeight: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: "20px",
  fontFamily: "Segoe UI, sans-serif",
  backgroundColor: "#f5f7fa"
};

const cardStyle = {
  width: "100%",
  maxWidth: "450px",
  backgroundColor: "#fff",
  padding: "24px",
  borderRadius: "14px",
  boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
  textAlign: "center"
};

const titleStyle = {
  marginBottom: "10px",
  color: "#2c3e50"
};

const subtitleStyle = {
  color: "#7f8c8d",
  marginBottom: "25px"
};

const qtyDisplay = {
  fontSize: "3rem",
  fontWeight: "bold",
  color: "#3498db",
  margin: "10px 0"
};

const infoText = {
  color: "#7f8c8d",
  marginBottom: "20px"
};

const sliderStyle = {
  width: "100%",
  height: "10px",
  cursor: "pointer",
  marginTop: "10px"
};

const rangeRow = {
  display: "flex",
  justifyContent: "space-between",
  marginTop: "10px",
  fontSize: "14px",
  color: "#7f8c8d"
};

const btnStyle = {
  marginTop: "25px",
  width: "100%",
  backgroundColor: "#27ae60",
  color: "white",
  padding: "14px",
  border: "none",
  borderRadius: "10px",
  cursor: "pointer",
  fontSize: "1rem",
  fontWeight: "bold"
};

export default JoinDetails;