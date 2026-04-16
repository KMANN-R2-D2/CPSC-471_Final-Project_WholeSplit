import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate, Link } from "react-router-dom";

const API = "http://localhost:3000";
const DEMO_USER_ID = 113; // replace with real auth later

export default function PickStore() {
  const { postId }      = useParams();
  const navigate        = useNavigate();
  const [stores, setStores]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(null); // storeId being processed
  const [toast, setToast]     = useState(null);

  useEffect(() => {
    axios.get(`${API}/stores`)
      .then(r => setStores(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleJoin = async (storeId) => {
    setJoining(storeId);
    try {
      const res = await axios.post(`${API}/groups`, {
        StoreID: storeId,
        CreatorUserID: DEMO_USER_ID,
        PostID: postId,
      });
      if (res.status === 200 || res.status === 201) {
        showToast("You've joined the split!");
        setTimeout(() => navigate("/"), 1500);
      }
    } catch (err) {
      console.error(err);
      showToast("Could not join — check your backend.", "error");
    } finally {
      setJoining(null);
    }
  };

  return (
    <div className="page fade-up">
      <Link to="/" className="back-link">← Back to splits</Link>

      <div className="page-header">
        <div>
          <h1>Choose a Location</h1>
          <p className="page-subtitle">
            Selecting a store for Split&nbsp;
            <span style={{ fontFamily: "'Playfair Display', serif", color: "var(--text-h)" }}>
              #{postId}
            </span>
          </p>
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading stores…</div>
      ) : stores.length === 0 ? (
        <div className="empty-state">
          <h3>No stores available</h3>
          <p>No participating locations found.</p>
        </div>
      ) : (
        <div className="store-grid">
          {stores.map(store => (
            <div className="store-card" key={store.StoreID}>
              <div>
                <div className="store-name">{store.Name}</div>
                <div className="store-city">{store.City}</div>
                {store.Street && (
                  <div style={{ fontSize: "0.82rem", color: "var(--text)", marginTop: 3 }}>{store.Street}</div>
                )}
              </div>
              <button
                className="btn btn-primary btn-sm"
                style={{ alignSelf: "flex-start", marginTop: 4 }}
                disabled={joining === store.StoreID}
                onClick={() => handleJoin(store.StoreID)}
              >
                {joining === store.StoreID ? "Joining…" : "Confirm Location"}
              </button>
            </div>
          ))}
        </div>
      )}

      {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}
    </div>
  );
}