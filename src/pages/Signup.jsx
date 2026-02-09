import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import "./Login.css";

const API_URL = "https://blessfeed-backend.onrender.com";

export default function Signup() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignup = async (e) => {
    if (e) e.preventDefault();
    if (password.length < 6) return setError("Minimum 6 characters required.");
    
    setLoading(true);
    setError("");
    try {
      await axios.post(`${API_URL}/api/auth/register`, { email, password });
      navigate("/login", { replace: true });
    } catch (err) {
      setError("This email is already registered.");
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

        <form className="login-form" onSubmit={handleSignup}>
          <input 
            type="email" 
            placeholder="Email Address" 
            onChange={(e) => setEmail(e.target.value)} 
            required 
          />
          <input 
            type="password" 
            placeholder="Create Password" 
            onChange={(e) => setPassword(e.target.value)} 
            required 
          />
          {error && <p className="error-text">{error}</p>}
          <button type="submit" className="login-submit-btn" disabled={loading}>
            {loading ? "Preparing Space..." : "Get Started"}
          </button>
        </form>

        <div className="divider"><span>Social Connection</span></div>
        <button className="google-btn" onClick={() => window.location.href = `${API_URL}/api/auth/google`}>
          Continue with Google
        </button>

        <p className="auth-switch">
          Already a member? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}