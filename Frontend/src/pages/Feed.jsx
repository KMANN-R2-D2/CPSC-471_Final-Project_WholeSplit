import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const Feed = () => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:3000/posts").then(res => setPosts(res.data));
  }, []);

  // Helper to give us that "File Explorer" alternating row look
  const getRowColor = (index) => (index % 2 === 0 ? "#ffffff" : "#f9f9f9");

  return (
    <div style={{ padding: "40px", fontFamily: "Segoe UI, Tahoma, sans-serif" }}>
      <h1 style={{ color: "#2c3e50", borderBottom: "2px solid #3498db", paddingBottom: "10px" }}>
        Community Split Feed
      </h1>
      
      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "20px", textAlign: "left" }}>
        <thead>
        <tr style={{ borderBottom: "1px solid #ddd", color: "#7f8c8d", backgroundColor: "#f2f2f2" }}>
            <th style={{ padding: "12px" }}>Product Name</th>
            <th style={{ padding: "12px" }}>Quantity</th>
            <th style={{ padding: "12px" }}>Date Posted</th>
            <th style={{ padding: "12px" }}>Status</th>
            <th style={{ padding: "12px" }}>Action</th>
        </tr>
        </thead>
        <tbody>
        {posts.map((post, index) => (
            <tr key={post.PostID} style={{ backgroundColor: index % 2 === 0 ? "#fff" : "#fafafa" }}>
            <td style={{ padding: "12px" }}>{post.ProductName}</td>
            <td style={{ padding: "12px" }}>{post.QuantityRequired}</td>
            <td style={{ padding: "12px" }}>{new Date(post.DatePosted).toLocaleDateString()}</td>
            <td style={{ padding: "12px" }}>
                <span style={{ 
                padding: "4px 8px", 
                borderRadius: "12px", 
                fontSize: "12px",
                backgroundColor: post.Status === 'Open' ? '#d4edda' : '#f8d7da' 
                }}>
                {post.Status}
                </span>
            </td>
            <td style={{ padding: "12px" }}>
                <Link to={`/create-group/${post.PostID}`}>
                    <button>Join Split</button>
                </Link>
            </td>
            </tr>
        ))}
        </tbody>

<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
  <h1 style={{ color: "#2c3e50" }}>Community Split Feed</h1>
  <Link to="/create-post">
    <button style={{ 
      backgroundColor: "#27ae60", 
      color: "white", 
      padding: "10px 20px", 
      border: "none", 
      borderRadius: "4px", 
      cursor: "pointer" 
    }}>
      + New Split Request
    </button>
  </Link>
</div>
      </table>
    </div>
  );
};
export default Feed;