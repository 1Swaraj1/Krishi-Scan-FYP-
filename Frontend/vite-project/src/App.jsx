import { Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Dashboard from "./pages/Dashboard";
import DetectDisease from "./pages/DetectDisease";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/dashboard" element={<Dashboard/>} />
      <Route path="/detect" element={<DetectDisease/>} />
    </Routes>
  );
}

export default App;
