import { BrowserRouter, Routes, Route } from "react-router-dom";
import Feed from "./pages/Feed";
import PickStore from "./pages/PickStore";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Feed />} />
        <Route path="/create-group/:postId" element={<PickStore />} />
      </Routes>
    </BrowserRouter>
  );
}
export default App;