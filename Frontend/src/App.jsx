import { BrowserRouter, Routes, Route } from "react-router-dom";
import Feed from "./pages/Feed";
import PickStore from "./pages/PickStore";
import CreatePost from "./pages/CreatePost";
import Login from "./pages/Login";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Feed />} />
        <Route path="/create-group/:postId" element={<PickStore />} />
        <Route path="/create-post" element={<CreatePost />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}
export default App;