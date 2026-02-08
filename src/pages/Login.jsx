import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Login.css";

// ✅ Render ENV first, fallback for local
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please enter email and password");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await axios.post(
        `${API_URL}/api/auth/login`,
        { email, password },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: false
        }
      );

      // ✅ store token
      localStorage.setItem("token", res.data.token);

      // ✅ move to home
      navigate("/");
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
        "Login failed. Check email or password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-bg">
      <div className="login-card">
        <h2 className="brand">BLESSFEED</h2>
        <p className="tagline">A moment for yourself</p>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && <p className="error">{error}</p>}

        <button onClick={handleLogin} disabled={loading}>
          {loading ? "Signing in…" : "Continue"}
        </button>
      </div>
    </div>
  );
}
