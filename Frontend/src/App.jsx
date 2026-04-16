import { BrowserRouter, Routes, Route } from "react-router-dom";
import Feed from "./pages/Feed";
import PickStore from "./pages/PickStore";

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
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Feed />} />
        <Route path="/create-group/:postId" element={<PickStore />} />
      </Routes>
    </BrowserRouter>
  );
}
export default App;