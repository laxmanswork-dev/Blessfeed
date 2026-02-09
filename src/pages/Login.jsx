// Login.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
      setError("Login failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-bg">
      <div className="login-card">
        <h2 className="brand">BLESSFEED</h2>
        <p className="tagline">A moment for yourself</p>

        {savedToken && savedUser && (
          <div className="resume-section">
            <button className="primary-btn" onClick={() => navigate("/")}>
              Continue as {savedUser}
            </button>
            <div className="divider"><span>or sign in</span></div>
          </div>
        )}

        <form onSubmit={handleLogin}>
          <input 
            type="email" 
            placeholder="Email" 
            onChange={(e) => setEmail(e.target.value)} 
            required 
          />
          <input 
            type="password" 
            placeholder="Password" 
            onChange={(e) => setPassword(e.target.value)} 
            required 
          />
          {error && <p className="error-text">{error}</p>}
          <button type="submit" className="login-submit-btn" disabled={loading}>
            {loading ? "Aligning..." : "Continue"}
          </button>
        </form>

        <div className="divider"><span>or</span></div>

        <button className="google-btn" onClick={() => window.location.href = `${API_URL}/api/auth/google`}>
          Continue with Google
        </button>
      </div>
    </div>
  );
}