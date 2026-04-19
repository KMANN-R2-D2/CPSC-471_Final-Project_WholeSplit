import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

const JoinDetails = () => {
  const { postId } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();

  const [qty, setQty] = useState(1);
  const [maxAvailable, setMaxAvailable] = useState(1);
  const [postData, setPostData] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [alreadyJoined, setAlreadyJoined] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));

  // Preview: what would this user pay if they take `qty` units
  const previewShare = postData
    ? ((qty / postData.BulkAmount) * postData.Price).toFixed(2)
    : "0.00";

  const loadPost = () => {
    axios.get(`http://localhost:3000/posts/${postId}`).then(res => {
      const { post, participants } = res.data;
      setPostData(post);
      setParticipants(participants);
      const remaining = post.UnitsRemaining ?? (post.BulkAmount - (post.TotalClaimed || 0));
      setMaxAvailable(Math.max(remaining, 1));

      const alreadyIn = participants.some(p =>
        String(p.UserID) === String(user?.UserID)
      );
      setAlreadyJoined(alreadyIn);
    }).catch(err => {
      console.error("Failed to load post:", err);
      navigate("/");
    });
  };

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    loadPost();
  }, [postId]);

  const handleConfirmJoin = async () => {
    try {
      const res = await axios.post(`http://localhost:3000/posts/${postId}/join`, {
        UserID: user.UserID,
        QuantityRequested: qty,
      });
      alert(`Joined! Your share: $${((qty / postData.BulkAmount) * postData.Price).toFixed(2)}`);
      navigate("/");
    } catch (err) {
      if (err.response?.status === 409) {
        setAlreadyJoined(true);
      } else {
        alert("Error: " + (err.response?.data?.message || err.message));
      }
    }
  };

  const handleLeave = async () => {
    if (!window.confirm("Leave this split?")) return;
    try {
      await axios.post("http://localhost:3000/leave-split", {
        UserID: user.UserID,
        PostID: parseInt(postId),
      });
      alert("You have left the split.");
      navigate("/");
    } catch (err) {
      alert("Error: " + (err.response?.data?.message || err.message));
    }
  };

  if (!postData) return <div style={pageStyle}><p>Loading...</p></div>;

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>

        {/* PRODUCT INFO */}
        <h1 style={titleStyle}>{postData.ProductName}</h1>
        <p style={subtitleStyle}>
          Store: <b>{state?.storeName || postData.StoreName}</b>
        </p>

        {/* PRICE BREAKDOWN BOX */}
        <div style={breakdownBox}>
          <div style={breakdownRow}>
            <span>Total Pack Price</span>
            <span><b>${Number(postData.Price).toFixed(2)}</b></span>
          </div>
          <div style={breakdownRow}>
            <span>Pack Size</span>
            <span><b>{postData.BulkAmount} units</b></span>
          </div>
          <div style={breakdownRow}>
            <span>Cost Per Unit</span>
            <span><b>${Number(postData.CostPerUnit).toFixed(2)}</b></span>
          </div>
          <div style={{ ...breakdownRow, borderTop: "1px solid #ddd", paddingTop: 8, marginTop: 4 }}>
            <span>Units Remaining</span>
            <span><b style={{ color: "#e74c3c" }}>{postData.UnitsRemaining}</b></span>
          </div>
        </div>

        {/* CURRENT PARTICIPANTS TABLE */}
        {participants.length > 0 && (
          <>
            <h3 style={sectionTitle}>Current Participants</h3>
            <table style={tableStyle}>
              <thead>
                <tr style={tableHeader}>
                  <th style={th}>Name</th>
                  <th style={th}>Units</th>
                  <th style={th}>Their Share</th>
                </tr>
              </thead>
              <tbody>
                {participants.map((p, i) => (
                  <tr key={i} style={i % 2 === 0 ? rowEven : rowOdd}>
                    <td style={td}>
                      {p.FName} {p.LName}
                      {p.MembershipID && (
                        <span style={memberBadge}> ★ Member</span>
                      )}
                    </td>
                    <td style={td}>{p.QuantityRequested}</td>
                    <td style={td}><b>${Number(p.CalculatedShareCost).toFixed(2)}</b></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        {/* YOUR SELECTION */}
        {!alreadyJoined && (
          <>
            <h3 style={sectionTitle}>Your Selection</h3>
            <div style={qtyDisplay}>{qty}</div>
            <p style={infoText}>
              units → your share would be{" "}
              <b style={{ color: "#27ae60", fontSize: "1.1rem" }}>${previewShare}</b>
            </p>

            <input
              type="range"
              min="1"
              max={maxAvailable}
              value={qty}
              onChange={(e) => setQty(parseInt(e.target.value))}
              style={sliderStyle}
            />
            <div style={rangeRow}>
              <span>1</span>
              <span>{maxAvailable}</span>
            </div>

            <button onClick={handleConfirmJoin} style={btnStyle}>
              Confirm — Pay ${previewShare}
            </button>
          </>
        )}

        {/* ALREADY JOINED */}
        {alreadyJoined && (
          <div style={{ marginTop: 25 }}>
            <p style={{ color: "#e67e22", fontWeight: "bold" }}>
              You have already joined this split.
            </p>
            <button onClick={handleLeave}
              style={{ ...btnStyle, backgroundColor: "#e74c3c" }}>
              Leave This Split
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

// ─── STYLES ──────────────────────────────────────────────────────────────────

const pageStyle = {
  minHeight: "100vh", display: "flex", justifyContent: "center",
  alignItems: "flex-start", padding: "30px 20px",
  fontFamily: "Segoe UI, sans-serif", backgroundColor: "#f5f7fa"
};
const cardStyle = {
  width: "100%", maxWidth: "520px", backgroundColor: "#fff",
  padding: "28px", borderRadius: "14px",
  boxShadow: "0 6px 18px rgba(0,0,0,0.08)"
};
const titleStyle = { marginBottom: 6, color: "#2c3e50", textAlign: "center" };
const subtitleStyle = { color: "#7f8c8d", marginBottom: 20, textAlign: "center" };
const breakdownBox = {
  backgroundColor: "#f8fbff", border: "1px solid #d6eaf8",
  borderRadius: 10, padding: "14px 18px", marginBottom: 20
};
const breakdownRow = {
  display: "flex", justifyContent: "space-between",
  fontSize: "0.95rem", marginBottom: 6, color: "#2c3e50"
};
const sectionTitle = { color: "#2c3e50", marginBottom: 10, marginTop: 20 };
const tableStyle = { width: "100%", borderCollapse: "collapse", marginBottom: 10 };
const tableHeader = { backgroundColor: "#f2f2f2" };
const th = { padding: "8px 10px", textAlign: "left", fontSize: "0.85rem", color: "#7f8c8d" };
const td = { padding: "8px 10px", fontSize: "0.9rem", color: "#2c3e50" };
const rowEven = { backgroundColor: "#fff" };
const rowOdd  = { backgroundColor: "#fafafa" };
const memberBadge = { color: "#27ae60", fontSize: "0.75rem", fontWeight: "bold" };
const qtyDisplay = {
  fontSize: "3rem", fontWeight: "bold", color: "#3498db",
  margin: "10px 0", textAlign: "center"
};
const infoText = { color: "#7f8c8d", marginBottom: 10, textAlign: "center" };
const sliderStyle = { width: "100%", height: 10, cursor: "pointer", marginTop: 10 };
const rangeRow = {
  display: "flex", justifyContent: "space-between",
  marginTop: 10, fontSize: 14, color: "#7f8c8d"
};
const btnStyle = {
  marginTop: 20, width: "100%", backgroundColor: "#27ae60",
  color: "white", padding: 14, border: "none", borderRadius: 10,
  cursor: "pointer", fontSize: "1rem", fontWeight: "bold"
};

export default JoinDetails;