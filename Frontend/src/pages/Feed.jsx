// The following resources were used to create this file and in general the whole of the frontend:

// Ramesh Fadatare (Java Guides). (2024, February 13). Spring Boot React JS Full-Stack Project | Employee Management System.
// https://www.youtube.com/watch?v=KuM6OtuaYRs

// Lama Dev. (2022, September 18). React Node.js MySQL CRUD Tutorial for Beginners.
// https://www.youtube.com/watch?v=fPuLnzSjPLE

// Import React hooks for state management and lifecycle handling
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

const Feed = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const user = JSON.parse(localStorage.getItem("user"));
  const isAdmin = user?.Role === "Admin";

  useEffect(() => { fetchPosts(); }, []);

  const fetchPosts = async () => {
    try {
      const res = await axios.get("http://localhost:3000/posts");
      setPosts(res.data);
    } catch (err) { console.error("Error fetching posts:", err); }
  };

  const handleDelete = async (postId) => {
    if (window.confirm("Are you sure you want to delete this split request?")) {
      try {
        await axios.delete(`http://localhost:3000/posts/${postId}`);
        fetchPosts();
      } catch (err) { alert("Failed to delete post"); }
    }
  };
  const handleJoinClick = (postId) => {
  if (!user) {
    alert("You must be logged in to join a split.");
    navigate("/login");
    return;
  }

  navigate(`/create-group/${postId}`);
};

  const handleLeave = async (postId) => {
    if (!user) return;
    if (window.confirm("Do you want to leave this split?")) {
      try {
        await axios.post("http://localhost:3000/leave-split", { UserID: user.UserID, PostID: postId });
        fetchPosts();
      } catch (err) { alert("Failed to leave split"); }
    }
  };

  // Admin removes a specific participant from a post
  const handleRemoveParticipant = async (postId) => {
    const userIdToRemove = window.prompt("Enter the UserID of the participant to remove:");
    if (!userIdToRemove) return;
    if (!window.confirm(`Remove user ${userIdToRemove} from this split?`)) return;
    try {
      await axios.delete("http://localhost:3000/admin/remove-participant", {
        data: { UserID: Number(userIdToRemove), PostID: postId }
      });
      alert("Participant removed.");
      fetchPosts();
    } catch (err) {
      alert("Failed to remove participant: " + (err.response?.data?.message || err.message));
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
        case "Open":
            return { backgroundColor: "#e8f4fd", color: "#1a73e8" };
        case "Member Required":
            return { backgroundColor: "#fff3cd", color: "#856404" };
        case "Member Joined":
            return { backgroundColor: "#d4edda", color: "#155724" };
        case "Full - Member In":
            return { backgroundColor: "#d4edda", color: "#155724" };
        case "Full - No Member":
            return { backgroundColor: "#f8d7da", color: "#721c24" };
        case "Completed":
            return { backgroundColor: "#e2e3e5", color: "#383d41" };
        default:
            return { backgroundColor: "#f2f2f2", color: "#555" };
    }
  };

  return (
    <div style={pageStyle}>
      <div style={headerStyle}>
        <h1 style={{ margin: 0, color: "#2c3e50" }}>Community Split Feed</h1>
        {/* Only show New Split Request button to regular users */}
        {!isAdmin && (
          <Link to="/create-post">
            <button style={newBtn}>+ New Split Request</button>
          </Link>
        )}
      </div>

      <table style={tableStyle}>
        <thead>
          <tr style={tableHeader}>
            <th>Product</th>
            <th>Progress</th>
            <th>Remaining</th>
            <th>Date</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {posts.map((post, index) => {
            const claimed = post.TotalClaimed || 0;
            const remaining = post.UnitsRemaining ?? Math.max(post.BulkAmount - claimed, 0);
            const progressPercent = Math.min(post.BulkAmount > 0 ? (claimed / post.BulkAmount) * 100 : 0, 100);
            const participantIds = post.ParticipantUserIDs
              ? post.ParticipantUserIDs.split(",").map(Number)
              : [];
            const isParticipant = user && participantIds.includes(Number(user.UserID));

            return (
              <tr key={post.PostID} style={rowStyle(index)}>
                <td style={cellBold}>{post.ProductName}</td>

                <td style={{ padding: "12px", minWidth: "160px" }}>
                  <div style={progressText}>{claimed} / {post.BulkAmount} claimed</div>
                  <div style={progressBar}>
                    <div style={{
                      width: `${progressPercent}%`,
                      backgroundColor: progressPercent >= 100 ? "#27ae60" : "#3498db",
                      height: "100%", borderRadius: "10px", transition: "width 0.6s ease"
                    }} />
                  </div>
                </td>

                <td style={cell}>
                  <b style={{ color: remaining === 0 ? "#7f8c8d" : "#c0392b" }}>
                    {remaining} units left
                  </b>
                </td>

                <td style={dateCell}>{new Date(post.DatePosted).toLocaleDateString()}</td>

                <td style={cell}>
                  <span style={{ ...statusBadge, ...getStatusStyle(post.Status) }}>
                    {post.Status}
                  </span>
                </td>

                <td style={cell}>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>

                    {/* ADMIN ACTIONS — Delete post + Remove a participant */}
                    {isAdmin && (
                      <>
                        <button onClick={() => handleDelete(post.PostID)} style={deleteBtn}>
                          Delete Post
                        </button>
                        <button onClick={() => handleRemoveParticipant(post.PostID)} style={removeBtn}>
                          Remove User
                        </button>
                      </>
                    )}

                    {/* USER ACTIONS — Join or Leave. Hidden from admins entirely */}
                    {!isAdmin && (
                      isParticipant ? (
                        <button onClick={() => handleLeave(post.PostID)} style={leaveBtn}>
                          Leave Split
                        </button>
                      ) : remaining > 0 ? (
                        <button
    onClick={() => handleJoinClick(post.PostID)}
    style={{
      cursor: "pointer",
      padding: "6px 12px",
      backgroundColor: "#3498db",
      color: "white",
      border: "none",
      borderRadius: "4px"
    }}
  >
    Join Split
  </button>
                      ) : (
                        <button style={closedBtn} disabled>Closed</button>
                      )
                    )}

                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

// ── STYLES ────────────────────────────────────────────────────────────────────
const pageStyle  = { padding: "20px", fontFamily: "Segoe UI, sans-serif" };
const headerStyle = { display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "2px solid #3498db", paddingBottom: "12px", marginBottom: "10px" };
const newBtn     = { backgroundColor: "#27ae60", color: "white", padding: "10px 18px", border: "none", borderRadius: "6px", fontWeight: "bold", cursor: "pointer" };
const tableStyle = { width: "100%", borderCollapse: "collapse", marginTop: "10px" };
const tableHeader = { textAlign: "left", backgroundColor: "#f2f2f2", borderBottom: "1px solid #ddd" };
const rowStyle   = (i) => ({ backgroundColor: i % 2 === 0 ? "#fff" : "#fafafa", borderBottom: "1px solid #eee" });
const cell       = { padding: "12px" };
const cellBold   = { padding: "12px", fontWeight: "500" };
const dateCell   = { padding: "12px", color: "#7f8c8d", fontSize: "14px" };
const statusBadge = { padding: "5px 10px", borderRadius: "15px", fontSize: "11px", fontWeight: "bold", textTransform: "uppercase" };
const progressText = { fontSize: "11px", color: "#7f8c8d", marginBottom: "4px" };
const progressBar  = { background: "#eee", height: "8px", borderRadius: "10px", overflow: "hidden" };
const joinBtn    = { padding: "6px 12px", backgroundColor: "#3498db", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" };
const deleteBtn  = { backgroundColor: "#e74c3c", color: "white", border: "none", padding: "6px 12px", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" };
const removeBtn  = { backgroundColor: "#8e44ad", color: "white", border: "none", padding: "6px 12px", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" };
const leaveBtn   = { padding: "6px 12px", backgroundColor: "#f39c12", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" };
const closedBtn  = { padding: "6px 12px", backgroundColor: "#ccc", color: "#666", border: "none", borderRadius: "4px" };

export default Feed;