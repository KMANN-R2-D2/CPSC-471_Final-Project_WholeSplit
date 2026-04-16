// The following resources were used to create this file and in general the whole of the frontend:

// Ramesh Fadatare (Java Guides). (2024, February 13). Spring Boot React JS Full-Stack Project | Employee Management System.
// https://www.youtube.com/watch?v=KuM6OtuaYRs

// Lama Dev. (2022, September 18). React Node.js MySQL CRUD Tutorial for Beginners.
// https://www.youtube.com/watch?v=fPuLnzSjPLE

// Import React hooks for state management and lifecycle handling
import React, { useEffect, useState } from "react";

// Axios is used to make HTTP requests to backend API
import axios from "axios";

// useParams extracts route parameters (e.g. postId from URL)
// useNavigate allows programmatic navigation after actions
import { useParams, useNavigate } from "react-router-dom";

const PickStore = () => {

  // Extract postId from URL (used to link store selection to a specific post)
  const { postId } = useParams();

  // Stores list of available stores fetched from backend
  const [stores, setStores] = useState([]);

  // Hook used to redirect user after successful join
  const navigate = useNavigate();

  /**
   * FETCH STORES ON COMPONENT LOAD
   * Runs once when page loads
   * Retrieves all store locations from backend
   */
  useEffect(() => {
    axios
      .get("http://localhost:3000/stores")
      .then(res => setStores(res.data));
  }, []);

  /**
   * HANDLE JOIN GROUP ACTION
   * Called when user selects a store to join a split group
   */
  const handleJoin = async (storeId) => {

    // Retrieve logged-in user from localStorage
    const user = JSON.parse(localStorage.getItem("user"));

    // Extract user ID safely
    const currentUserID = user ? user.UserID : null;

    // Prevent action if user is not logged in
    if (!currentUserID) {
      alert("You must be logged in to join a split!");
      return;
    }

    try {
      /**
       * Send request to backend to create group
       * Includes:
       * - selected store
       * - current logged-in user
       * - post being joined
       */
      await axios.post("http://localhost:3000/groups", {
        StoreID: storeId,
        ResponderUserID: currentUserID,
        PostID: postId
      });

      alert("Success!");

      // Redirect user back to homepage after successful join
      navigate("/");
    } 
    catch (err) {
      // Handles backend errors (e.g. not a member, server issues, etc.)
      alert(err.response?.data || "Error joining split");
    }
  };

  return (
    <div
      style={{
        padding: "40px",
        fontFamily: "Segoe UI"
      }}
    >

      {/* Page title showing which post is being joined */}
      <h2 style={{ color: "#2c3e50" }}>
        Select a Location for Split #{postId}
      </h2>

      {/* Subtext explaining user action */}
      <p style={{ color: "#7f8c8d" }}>
        Choose a Costco to finalize this group.
      </p>

      {/* TABLE OF STORES */}
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginTop: "20px"
        }}
      >
        <thead>
          <tr
            style={{
              textAlign: "left",
              borderBottom: "2px solid #eee",
              color: "#666"
            }}
          >
            <th style={{ padding: "10px" }}>Store Name</th>
            <th style={{ padding: "10px" }}>City</th>
            <th style={{ padding: "10px" }}>Action</th>
          </tr>
        </thead>

        <tbody>
          {/* Render list of stores dynamically */}
          {stores.map((store, index) => (
            <tr
              key={store.StoreID}
              style={{
                backgroundColor:
                  index % 2 === 0 ? "#fff" : "#f9f9f9",
                borderBottom: "1px solid #eee"
              }}
            >

              {/* Store name */}
              <td style={{ padding: "10px", fontWeight: "600" }}>
                {store.Name}
              </td>

              {/* Store city */}
              <td style={{ padding: "10px" }}>
                {store.City}
              </td>

              {/* Action button */}
              <td style={{ padding: "10px" }}>
                <button

                  
                  onClick={() => handleJoin(store.StoreID)}

                  style={{
                    backgroundColor: "#27ae60",
                    color: "white",
                    border: "none",
                    padding: "5px 15px",
                    borderRadius: "4px",
                    cursor: "pointer"
                  }}
                >
                  Confirm Location
                </button>
              </td>

            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Export component so it can be used in routing
export default PickStore;