import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Login.css";

const API_URL = import.meta.env.VITE_API_URL || "https://blessfeed-backend.onrender.com";
const GOOGLE_LOGIN_URL = `${API_URL}/api/auth/google`;

export default function Login() {
  const navigate = useNavigate();

  // State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Derived State (Stored User)
  const savedToken = localStorage.getItem("token");
  const savedUser = localStorage.getItem("user"); // Consistently use 'user'

  // 🔥 Redirect if session is already active
  useEffect(() => {
    if (savedToken) {
      // If you want to skip the login screen entirely when a token exists:
      // navigate("/", { replace: true });
    }
  }, [savedToken, navigate]);

  const handleContinueAsUser = () => {
    navigate("/", { replace: true });
  };

  const validateEmail = (email) => {
    return String(email)
      .toLowerCase()
      .match(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
  };

  const handleLogin = async (e) => {
    if (e) e.preventDefault(); // Support form submission

    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
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

      // Store Auth Data
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", email); // Matches handleLogout in BlessFeed.jsx

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
    setLoading(true);
    window.location.href = GOOGLE_LOGIN_URL;
  };

  return (
    <div className="login-bg">
      <div className="login-card compact">
        <header className="login-header">
          <h2 className="brand">BLESSFEED</h2>
          <p className="tagline">A moment for yourself</p>
        </header>

        {/* ✅ AUTO LOGIN / SESSION RESUME */}
        {savedToken && savedUser && (
          <div className="session-resume">
            <button
              className="primary-btn resume-btn"
              onClick={handleContinueAsUser}
              disabled={loading}
            >
              Continue as {savedUser}
            </button>
            <div className="divider"><span>or sign in with another account</span></div>
          </div>
        )}

        <form className="login-form" onSubmit={handleLogin}>
          <div className="input-group">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              autoComplete="email"
              required
            />
          </div>

          <div className="input-group">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              autoComplete="current-password"
              required
            />
          </div>

          {error && <motion.p initial={{opacity:0}} animate={{opacity:1}} className="error-text">{error}</motion.p>}

          <button 
            type="submit" 
            className="login-submit-btn" 
            disabled={loading}
          >
            {loading ? "Aligning..." : "Continue"}
          </button>
        </form>

        <div className="divider"><span>or</span></div>

        <button
          className="google-btn"
          onClick={handleGoogleLogin}
          disabled={loading}
        >
          <img src="/google-icon.svg" alt="" className="btn-icon" />
          Continue with Google
        </button>
      </div>
    </div>
  );
}