import { BrowserRouter, Routes, Route } from "react-router-dom";
import Feed from "./pages/Feed";
import PickStore from "./pages/PickStore";
import CreatePost from "./pages/CreatePost";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Feed />} />
        <Route path="/create-group/:postId" element={<PickStore />} />
        <Route path="/create-post" element={<CreatePost />} />
      </Routes>
    </BrowserRouter>
  );
}
export default App;