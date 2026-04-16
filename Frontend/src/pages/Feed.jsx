import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const API = "http://localhost:3000";

export default function Feed() {
  const [posts, setPosts]     = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetches the data calculated by the SQL SUM/GROUP BY query in the backend
    axios.get("http://localhost:3000/posts").then((res) => setPosts(res.data));
  }, []);

  // Helper function to color-code statuses based on the logic in our /groups route
  const getStatusStyle = (status) => {
    switch (status) {
      case 'Full':
        return { backgroundColor: '#e8f4fd', color: '#1a73e8' }; // Blue for completed split
      case 'Fulfillment In Progress':
        return { backgroundColor: '#d4edda', color: '#155724' }; // Green for member-verified
      case 'Pending Member':
        return { backgroundColor: '#fff3cd', color: '#856404' }; // Yellow for waiting for card
      default:
        return { backgroundColor: '#f8d7da', color: '#721c24' }; // Red for Open/Default
    }
  };

  return (
    <div style={{ padding: "40px", fontFamily: "Segoe UI, Tahoma, sans-serif" }}>
      
      {/* HEADER SECTION */}
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
            // Logic: Calculate how much of the "offer" is still left
            const claimed = post.UnitsClaimed || 0;
            const remaining = Math.max(post.QuantityRequested - claimed, 0);
            const progressPercent = Math.min((claimed / post.QuantityRequested) * 100, 100);

            return (
              <tr key={post.PostID} style={{ backgroundColor: index % 2 === 0 ? "#fff" : "#fafafa", borderBottom: "1px solid #eee" }}>
                
                {/* 1. PRODUCT */}
                <td style={{ padding: "12px", fontWeight: "500" }}>{post.ProductName}</td>

                {/* 2. PROGRESS BAR (The "taken" vs "goal") */}
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

                {/* 3. REMAINING (Your "Deduction" Logic) */}
                <td style={{ padding: "12px" }}>
                  <b style={{ color: remaining === 0 ? "#7f8c8d" : "#c0392b" }}>
                    {remaining} units left
                  </b>
                </td>

                {/* 4. DATE */}
                <td style={{ padding: "12px", color: "#7f8c8d", fontSize: "14px" }}>
                  {new Date(post.DatePosted).toLocaleDateString()}
                </td>

                {/* 5. DYNAMIC STATUS LABEL */}
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

                {/* 6. JOIN ACTION (Hidden if full) */}
                <td style={{ padding: "12px" }}>
                  {remaining > 0 ? (
                    <Link to={`/create-group/${post.PostID}`}>
                      <button style={{ 
                        cursor: "pointer", 
                        padding: "6px 12px", 
                        backgroundColor: "#3498db", 
                        color: "white", 
                        border: "none", 
                        borderRadius: "4px" 
                      }}>
                        Join Split
                      </button>
                    </Link>
                  ) : (
                    <button disabled style={{ padding: "6px 12px", backgroundColor: "#ccc", color: "#666", border: "none", borderRadius: "4px" }}>
                      Closed
                    </button>
                  )}
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
