// The following resources were used to create this file and in general the whole of the frontend:

// Ramesh Fadatare (Java Guides). (n.d.). Spring Boot React JS Full-Stack Project | Employee Management System | Spring Boot React JS Course.
// https://www.youtube.com/watch?v=KuM6OtuaYRs

// Lama Dev. (2022, September 18). React Node.js MySQL CRUD Tutorial for Beginners.
// https://www.youtube.com/watch?v=fPuLnzSjPLE

// Import React core library
import React, { useState, useEffect } from "react";

// Axios is used for making HTTP requests to the backend API
import axios from "axios";

// useNavigate allows programmatic navigation between pages (React Router)
import { useNavigate } from "react-router-dom";

const CreatePost = () => {

  // Hook used to redirect user after actions (e.g., login or submit)
  const navigate = useNavigate();

  // Stores list of products fetched from backend
  // Needed for dropdown selection
  const [products, setProducts] = useState([]);

  // Retrieve user data from localStorage (persistent login storage)
  const userString = localStorage.getItem("user");

  // Safely parse user JSON or set null if not found
  const user = userString ? JSON.parse(userString) : null;

  // Form state for creating a new split post
  const [formData, setFormData] = useState({
    UserID: user ? user.UserID : "",  // auto-fill from logged-in user
    ProductID: "",                    // selected product
    QuantityRequested: ""            // quantity input
  });

  /**
   * AUTH + DATA FETCHING LOGIC
   * Runs when component loads or when user/navigation changes
   */
  useEffect(() => {

    // If user is NOT logged in → redirect to login page
    if (!user) {
      alert("Please login first!");
      navigate("/login");
    } 
    else {
      // If user exists → fetch product list from backend API
      axios.get("http://localhost:3000/products")
        .then((res) => setProducts(res.data)) // store products in state
        .catch(err => console.error("Could not fetch products", err));
    }
  }, [user, navigate]);

  /**
   * Handles form input changes dynamically
   * Updates correct field based on input name attribute
   */
  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  /**
   * Handles form submission
   * Sends POST request to backend to create a new split post
   */
  const handleSubmit = async (e) => {
    e.preventDefault(); // prevent page reload

    try {
      // Ensure numeric fields are properly converted before sending to backend
      const payload = {
        ...formData,
        UserID: Number(formData.UserID),
        ProductID: Number(formData.ProductID)
      };

      // Send data to backend API
      await axios.post("http://localhost:3000/posts", payload);

      alert("Split Request Published to Feed!");

      // Redirect user back to homepage after success
      navigate("/");
    } 
    catch (err) {
      console.error(err);
      alert("Failed to create post. Make sure you are logged in correctly.");
    }
  };

  /**
   * SAFETY CHECK
   * Prevents rendering UI if user is not logged in
   * (avoids crashes like undefined map errors or blank screens)
   */
  if (!user) return null;

  return (
    <div
      style={{
        padding: "40px",
        fontFamily: "Segoe UI",
        maxWidth: "500px",
        margin: "auto"
      }}
    >
      {/* Page title */}
      <h2
        style={{
          color: "#2c3e50",
          borderBottom: "2px solid #3498db",
          paddingBottom: "10px"
        }}
      >
        Create New Split Request
      </h2>

      {/* FORM START */}
      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "15px",
          marginTop: "20px"
        }}
      >
        
        {/* Product dropdown */}
        <label>Select Product:</label>
        <select
          name="ProductID"
          onChange={handleChange}
          required
          style={{ padding: "10px" }}
        >
          <option value="">-- Choose an Item --</option>

          {/* Dynamically generate options from backend data */}
          {products.map(p => (
            <option key={p.ProductID} value={p.ProductID}>
              {p.Brand} - {p.ProductName}
            </option>
          ))}
        </select>

        {/* Quantity input */}
        <label>Quantity You Need (Whole Numbers):</label>
        <input
          type="number"
          name="QuantityRequested"
          placeholder="e.g. 1"
          min="1"
          onChange={handleChange}
          required
          style={{ padding: "10px" }}
        />

        {/* Submit button */}
        <button
          type="submit"
          style={{
            backgroundColor: "#3498db",
            color: "white",
            border: "none",
            padding: "12px",
            cursor: "pointer",
            borderRadius: "4px",
            fontWeight: "bold"
          }}
        >
          Publish to Feed
        </button>
      </form>
      {/* FORM END */}
    </div>
  );
};

// Export component so it can be used in other parts of the app
export default CreatePost;