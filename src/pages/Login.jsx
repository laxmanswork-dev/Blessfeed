import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Login.css";

// ENV first, fallback for local
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// 🔥 GOOGLE LOGIN URL (redirect-based)
const GOOGLE_LOGIN_URL = `${API_URL}/api/auth/google`;

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const savedEmail = localStorage.getItem("userEmail");

  // ================= AUTO LOGIN =================
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/", { replace: true });
    }
  }, []);

  // ================= EMAIL LOGIN =================
  const handleLogin = async () => {
    if (!email || !password) {
      setError("Email and password are required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { data } = await axios.post(
        `${API_URL}/api/auth/login`,
        { email, password },
        { headers: { "Content-Type": "application/json" } }
      );

      localStorage.setItem("token", data.token);
      localStorage.setItem("userEmail", email);

      navigate("/", { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Login failed. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  // ================= GOOGLE LOGIN =================
  const handleGoogleLogin = () => {
    window.location.href = GOOGLE_LOGIN_URL;
  };

  // ================= CONTINUE AS USER =================
  const continueAsUser = () => {
    navigate("/", { replace: true });
  };

  return (
    <div className="login-bg">
      <div className="login-card">
        <h2 className="brand">BLESSFEED</h2>
        <p className="tagline">A moment for yourself</p>

        {/* CONTINUE AS PREVIOUS USER */}
        {savedEmail && (
          <button className="google-btn secondary" onClick={continueAsUser}>
            Continue as {savedEmail}
          </button>
        )}

        {savedEmail && (
          <div className="divider">
            <span>or</span>
          </div>
        )}

        {/* EMAIL */}
        <input
          type="email"
          placeholder="Email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
        />

        {/* PASSWORD */}
        <input
          type="password"
          placeholder="Password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
        />

        {error && <p className="error">{error}</p>}

        {/* EMAIL LOGIN */}
        <button onClick={handleLogin} disabled={loading}>
          {loading ? "Signing in…" : "Continue"}
        </button>

        {/* DIVIDER */}
        <div className="divider">
          <span>or</span>
        </div>

        {/* GOOGLE LOGIN */}
        <button
          className="google-btn"
          onClick={handleGoogleLogin}
          disabled={loading}
        >
          Continue with Google
        </button>
      </div>
    </div>
  );
}
