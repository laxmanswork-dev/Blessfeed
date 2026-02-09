import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Login.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const GOOGLE_LOGIN_URL = `${API_URL}/api/auth/google`;

export default function Login() {
  const navigate = useNavigate();

  const savedToken = localStorage.getItem("token");
  const savedEmail = localStorage.getItem("userEmail");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // 🔥 AUTO LOGIN
  const handleContinueAsUser = () => {
    navigate("/", { replace: true });
  };

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

  const handleGoogleLogin = () => {
    window.location.href = GOOGLE_LOGIN_URL;
  };

  return (
    <div className="login-bg">
      <div className="login-card compact">

        <h2 className="brand">BLESSFEED</h2>
        <p className="tagline">A moment for yourself</p>

        {/* ✅ CONTINUE AS GOOGLE USER */}
        {savedToken && savedEmail && (
          <>
            <button
              className="primary-btn"
              onClick={handleContinueAsUser}
            >
              Continue as {savedEmail}
            </button>

            <div className="divider"><span>or</span></div>
          </>
        )}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
        />

        {error && <p className="error">{error}</p>}

        <button onClick={handleLogin} disabled={loading}>
          {loading ? "Signing in…" : "Continue"}
        </button>

        <div className="divider"><span>or</span></div>

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
