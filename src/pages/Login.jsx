import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import "./Login.css";

const API_URL = "https://blessfeed-backend.onrender.com";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const savedUser = localStorage.getItem("user");
  const savedToken = localStorage.getItem("token");

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { data } = await axios.post(`${API_URL}/api/auth/login`, { email, password });
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", email);
      navigate("/", { replace: true });
    } catch (err) {
      setError("Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-bg">
      <div className="login-card">
        <header className="login-header">
          <h2 className="brand">BLESSFEED</h2>
          <p className="subtitle">A moment for yourself</p>
        </header>

        {savedToken && savedUser && (
          <div style={{ marginBottom: '24px' }}>
            <button className="login-submit-btn" onClick={() => navigate("/")}>
              Continue as {savedUser.split('@')[0]}
            </button>
            <div className="divider"><span>or sign in</span></div>
          </div>
        )}

        <form className="login-form" onSubmit={handleLogin}>
          <input type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} required />
          <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} required />
          {error && <p className="error-text">{error}</p>}
          <button type="submit" className="login-submit-btn" disabled={loading}>
            {loading ? "Aligning..." : "Sign In"}
          </button>
        </form>

        <div className="divider"><span>Social Sync</span></div>
        <button className="google-btn" onClick={() => window.location.href = `${API_URL}/api/auth/google`}>
          Continue with Google
        </button>

        <p className="auth-switch">
          New here? <Link to="/signup">Create account</Link>
        </p>
      </div>
    </div>
  );
}