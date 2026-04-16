import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Feed from "./pages/Feed";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import CreatePost from "./pages/CreatePost";
import PickStore from "./pages/PickStore";
import Products from "./pages/ProductPage";
import Users from "./pages/users";
import JoinDetails from "./pages/JoinDetails";

/* ======================================================
   SIMPLE 404 PAGE
====================================================== */
const NotFound = () => (
  <div style={notFoundStyle}>
    <h2>404</h2>
    <p>Page not found</p>
  </div>
);

function App() {
  return (
    <BrowserRouter>

      {/* GLOBAL NAVBAR */}
      <Navbar />

      {/* GLOBAL PAGE WRAPPER */}
      <div style={appWrapperStyle}>

        <Routes>

          <Route path="/" element={<Feed />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/create-post" element={<CreatePost />} />
          <Route path="/create-group/:postId" element={<PickStore />} />
          <Route path="/join-details/:postId" element={<JoinDetails />} />
          <Route path="/products" element={<Products />} />
          <Route path="/users" element={<Users />} />

          {/* Fallback route */}
          <Route path="*" element={<NotFound />} />

        </Routes>

      </div>
    </BrowserRouter>
  );
}

/* ======================================================
   GLOBAL LAYOUT STYLES
====================================================== */

const appWrapperStyle = {
  maxWidth: "1100px",
  margin: "0 auto",
  padding: "20px",
  minHeight: "calc(100vh - 60px)",
  boxSizing: "border-box"
};

/* ======================================================
   404 STYLE
====================================================== */

const notFoundStyle = {
  textAlign: "center",
  padding: "80px 20px",
  color: "#7f8c8d",
  fontFamily: "Segoe UI, sans-serif"
};

export default App;