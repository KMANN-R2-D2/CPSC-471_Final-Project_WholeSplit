import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import Users from "./pages/users";

function App(){
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<h1>Home</h1>} />
          <Route path="/users" element={<Users />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;