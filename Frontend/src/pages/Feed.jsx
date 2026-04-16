import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const Feed = () => {
  const [posts, setPosts] = useState([]);

  // ======================================================
  // FETCH FEED DATA FROM BACKEND
  // ======================================================
  useEffect(() => {
    axios.get("http://localhost:3000/posts")
      .then((res) => setPosts(res.data));
  }, []);

  // ======================================================
  // STATUS COLOR LOGIC
  // ======================================================
  const getStatusStyle = (status) => {
    switch (status) {
      case "Full":
        return { backgroundColor: "#e8f4fd", color: "#1a73e8" };
      case "Fulfillment In Progress":
        return { backgroundColor: "#d4edda", color: "#155724" };
      case "Pending Member":
        return { backgroundColor: "#fff3cd", color: "#856404" };
      default:
        return { backgroundColor: "#f8d7da", color: "#721c24" };
    }
  };

  return (
    <div style={pageStyle}>

      {/* ======================================================
          HEADER SECTION
      ====================================================== */}
      <div style={headerStyle}>
        <h1 style={{ margin: 0, color: "#2c3e50" }}>
          Community Split Feed
        </h1>

        <Link to="/create-post">
          <button style={newBtn}>
            + New Split Request
          </button>
        </Link>
      </div>

      {/* ======================================================
          FEED LIST (CARD LAYOUT)
      ====================================================== */}
      <div style={feedContainer}>

        {posts.map((post) => {
          const claimed = post.UnitsClaimed || 0;
          const remaining = Math.max(post.QuantityRequested - claimed, 0);
          const progressPercent = Math.min(
            (claimed / post.QuantityRequested) * 100,
            100
          );

          return (
            <div key={post.PostID} style={cardStyle}>

              {/* PRODUCT */}
              <h3 style={productTitle}>
                {post.ProductName}
              </h3>

              {/* STATUS */}
              <span style={{
                ...statusBadge,
                ...getStatusStyle(post.Status)
              }}>
                {post.Status}
              </span>

              {/* PROGRESS */}
              <div style={{ marginTop: "10px" }}>
                <div style={progressText}>
                  {claimed} / {post.QuantityRequested} claimed
                </div>

                <div style={progressBar}>
                  <div
                    style={{
                      width: `${progressPercent}%`,
                      backgroundColor:
                        progressPercent >= 100 ? "#27ae60" : "#3498db",
                      height: "100%",
                      borderRadius: "10px"
                    }}
                  />
                </div>
              </div>

              {/* INFO ROW */}
              <div style={infoRow}>
                <div>
                  <b>{remaining}</b> units left
                </div>

                <div style={{ color: "#7f8c8d", fontSize: "13px" }}>
                  {new Date(post.DatePosted).toLocaleDateString()}
                </div>
              </div>

              {/* ACTION */}
              <div style={{ marginTop: "12px" }}>
                {remaining > 0 ? (
                  <Link to={`/create-group/${post.PostID}`}>
                    <button style={joinBtn}>
                      Join Split
                    </button>
                  </Link>
                ) : (
                  <button style={closedBtn} disabled>
                    Closed
                  </button>
                )}
              </div>

            </div>
          );
        })}

      </div>
    </div>
  );
};

/* ======================================================
   STYLES
   Mobile-first card design (works on desktop too)
====================================================== */

const pageStyle = {
  padding: "20px",
  fontFamily: "Segoe UI, sans-serif"
};

const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  flexWrap: "wrap",
  borderBottom: "2px solid #3498db",
  paddingBottom: "12px",
  gap: "10px"
};

const newBtn = {
  backgroundColor: "#27ae60",
  color: "white",
  padding: "12px 18px",
  border: "none",
  borderRadius: "8px",
  fontWeight: "bold",
  cursor: "pointer"
};

const feedContainer = {
  marginTop: "20px",
  display: "flex",
  flexDirection: "column",
  gap: "15px"
};

const cardStyle = {
  backgroundColor: "#fff",
  border: "1px solid #eee",
  borderRadius: "12px",
  padding: "16px",
  boxShadow: "0 2px 6px rgba(0,0,0,0.05)"
};

const productTitle = {
  margin: "0 0 8px 0",
  color: "#2c3e50"
};

const statusBadge = {
  display: "inline-block",
  padding: "5px 10px",
  borderRadius: "15px",
  fontSize: "11px",
  fontWeight: "bold",
  textTransform: "uppercase"
};

const progressText = {
  fontSize: "12px",
  color: "#7f8c8d",
  marginBottom: "5px"
};

const progressBar = {
  background: "#eee",
  height: "8px",
  borderRadius: "10px",
  overflow: "hidden"
};

const infoRow = {
  marginTop: "10px",
  display: "flex",
  justifyContent: "space-between",
  fontSize: "14px"
};

const joinBtn = {
  width: "100%",
  padding: "12px",
  backgroundColor: "#3498db",
  color: "white",
  border: "none",
  borderRadius: "8px",
  fontWeight: "bold",
  cursor: "pointer"
};

const closedBtn = {
  width: "100%",
  padding: "12px",
  backgroundColor: "#ccc",
  color: "#666",
  border: "none",
  borderRadius: "8px"
};

export default Feed;