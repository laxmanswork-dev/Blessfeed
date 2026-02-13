import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Feed from "./pages/Feed";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import LoginSuccess from "./pages/LoginSuccess";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <Routes>
      {/* ===== DEFAULT REDIRECT ===== */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* ===== PUBLIC ROUTES ===== */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/login-success" element={<LoginSuccess />} />

      {/* ===== PROTECTED ROUTES ===== */}
      <Route
        path="/home"
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }
      />

      <Route
        path="/feed"
        element={
          <ProtectedRoute>
            <Feed />
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />

      {/* ===== CATCH ALL ===== */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
