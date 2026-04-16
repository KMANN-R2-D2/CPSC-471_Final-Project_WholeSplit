import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const API = "http://localhost:3000";

export default function Feed() {
  const [posts, setPosts]     = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API}/posts`)
      .then(r => setPosts(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">Loading splits…</div>;

  return (
    <div className="page fade-up">
      <div className="page-header">
        <div>
          <h1>Community Splits</h1>
          <p className="page-subtitle">{posts.length} open bulk-buy opportunities near you</p>
        </div>
      </div>

      {posts.length === 0 ? (
        <div className="empty-state">
          <h3>No open splits right now</h3>
          <p>Check back soon — new posts appear as members share bulk finds.</p>
        </div>
      ) : (
        <div className="ws-table-wrap">
          <table className="ws-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Posted by</th>
                <th>Qty</th>
                <th>Date</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {posts.map(post => (
                <tr key={post.PostID}>
                  <td style={{ fontWeight: 600 }}>{post.ProductName}</td>
                  <td>{post.FName}</td>
                  <td>{post.QuantityRequested ?? post.QuantityRequired}</td>
                  <td style={{ color: "var(--text)" }}>
                    {new Date(post.DatePosted).toLocaleDateString("en-CA", {
                      month: "short", day: "numeric", year: "numeric"
                    })}
                  </td>
                  <td>
                    <span className={`badge ${post.Status === "Open" ? "badge-green" : "badge-amber"}`}>
                      {post.Status}
                    </span>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <Link to={`/create-group/${post.PostID}`}>
                      <button className="btn btn-primary btn-sm">Join Split →</button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}