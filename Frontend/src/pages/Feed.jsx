import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const Feed = () => {
  const [posts, setPosts] = useState([]);

  // 1. Get user info once at the top of the component
  const user = JSON.parse(localStorage.getItem("user"));
  const isAdmin = user?.Role === "Admin";

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = () => {
    axios.get("http://localhost:3000/posts").then((res) => setPosts(res.data));
  };

  // 2. Added Delete Function
  const handleDelete = async (postId) => {
    if (window.confirm("Are you sure you want to delete this split request?")) {
      try {
        await axios.delete(`http://localhost:3000/posts/${postId}`);
        fetchPosts(); // Refresh the list
      } catch (err) {
        alert("Failed to delete post");
        console.error(err);
      }
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Full':
        return { backgroundColor: '#e8f4fd', color: '#1a73e8' };
      case 'Fulfillment In Progress':
        return { backgroundColor: '#d4edda', color: '#155724' };
      case 'Pending Member':
        return { backgroundColor: '#fff3cd', color: '#856404' };
      default:
        return { backgroundColor: '#f8d7da', color: '#721c24' };
    }
  };

  return (
    <div style={{ padding: "40px", fontFamily: "Segoe UI, Tahoma, sans-serif" }}>
      
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "2px solid #3498db", paddingBottom: "10px" }}>
        <h1 style={{ color: "#2c3e50", margin: 0 }}>Community Split Feed</h1>
        <Link to="/create-post">
          <button style={{ backgroundColor: "#27ae60", color: "white", padding: "10px 20px", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}>
            + New Split Request
          </button>
        </Link>
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "20px", textAlign: "left" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid #ddd", color: "#7f8c8d", backgroundColor: "#f2f2f2" }}>
            <th style={{ padding: "12px" }}>Product Name</th>
            <th style={{ padding: "12px" }}>Progress</th>
            <th style={{ padding: "12px" }}>Remaining</th>
            <th style={{ padding: "12px" }}>Date Posted</th>
            <th style={{ padding: "12px" }}>Status</th>
            <th style={{ padding: "12px" }}>Action</th>
          </tr>
        </thead>

        <tbody>
          {posts.map((post, index) => {
            const claimed = post.UnitsClaimed || 0;
            const remaining = Math.max(post.QuantityRequested - claimed, 0);
            const progressPercent = Math.min((claimed / post.QuantityRequested) * 100, 100);

            return (
              <tr key={post.PostID} style={{ backgroundColor: index % 2 === 0 ? "#fff" : "#fafafa", borderBottom: "1px solid #eee" }}>
                
                <td style={{ padding: "12px", fontWeight: "500" }}>{post.ProductName}</td>

                <td style={{ padding: "12px", minWidth: "160px" }}>
                  <div style={{ fontSize: "11px", marginBottom: "4px", color: "#7f8c8d" }}>
                    {claimed} / {post.QuantityRequested} Claimed
                  </div>
                  <div style={{ background: "#eee", borderRadius: "10px", height: "8px", width: "100%" }}>
                    <div style={{ 
                      width: `${progressPercent}%`, 
                      background: progressPercent >= 100 ? "#27ae60" : "#3498db", 
                      height: "100%", 
                      borderRadius: "10px",
                      transition: "width 0.6s ease-in-out"
                    }}></div>
                  </div>
                </td>

                <td style={{ padding: "12px" }}>
                  <b style={{ color: remaining === 0 ? "#7f8c8d" : "#c0392b" }}>
                    {remaining} units left
                  </b>
                </td>

                <td style={{ padding: "12px", color: "#7f8c8d", fontSize: "14px" }}>
                  {new Date(post.DatePosted).toLocaleDateString()}
                </td>

                <td style={{ padding: "12px" }}>
                  <span style={{
                    padding: "5px 10px",
                    borderRadius: "15px",
                    fontSize: "11px",
                    fontWeight: "bold",
                    textTransform: "uppercase",
                    ...getStatusStyle(post.Status)
                  }}>
                    {post.Status}
                  </span>
                </td>

                {/* INTEGRATED ACTION COLUMN */}
                <td style={{ padding: "12px" }}>
                  <div style={{ display: "flex", gap: "10px" }}>
                    {/* Admin Delete Button */}
                    {isAdmin && (
                      <button 
                        onClick={() => handleDelete(post.PostID)}
                        style={{ backgroundColor: "#e74c3c", color: "white", border: "none", padding: "6px 12px", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}
                      >
                        Delete
                      </button>
                    )}

                    {/* User Join/Closed logic */}
                    {remaining > 0 ? (
                      <Link to={`/create-group/${post.PostID}`}>
                        <button style={{ cursor: "pointer", padding: "6px 12px", backgroundColor: "#3498db", color: "white", border: "none", borderRadius: "4px" }}>
                          Join Split
                        </button>
                      </Link>
                    ) : (
                      !isAdmin && (
                        <button disabled style={{ padding: "6px 12px", backgroundColor: "#ccc", color: "#666", border: "none", borderRadius: "4px" }}>
                          Closed
                        </button>
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

export default Feed;