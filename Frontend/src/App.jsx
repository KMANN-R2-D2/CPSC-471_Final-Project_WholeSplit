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


function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <span className="navbar-brand">WholeSplit</span>
      </div>
    </nav>
  );
}

function App() {
  return (
    // 2. The Browser Router MUST be the outermost layer
    <BrowserRouter>
      
      
      <Navbar />

      <div className="container">
        <Routes>
          <Route path="/" element={<Feed />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/create-post" element={<CreatePost />} />
          <Route path="/create-group/:postId" element={<PickStore />} />
          <Route path="/join-details/:postId" element={<JoinDetails />} />
          <Route path="/products" element={<Products />} />
          <Route path="/users" element={<Users />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;