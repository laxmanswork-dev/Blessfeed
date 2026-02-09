import { useState, useEffect } from "react";
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

  // Get saved data
  const savedUser = localStorage.getItem("user");
  const savedToken = localStorage.getItem("token");

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { data } = await axios.post(`${API_URL}/api/auth/login`, { 
        email, 
        password 
      });
      
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", email);
      
      // Navigate on success
      navigate("/", { replace: true });
    } catch (err) {
      console.error("Login error:", err);
      setError(err.response?.data?.message || "Login failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${API_URL}/api/auth/google`;
  };

  // The return must be inside the Login function scope
  return (
    <div className="login-bg">
      <div className="login-card">
        <header className="brand-header">
          <h1 className="brand">BLESSFEED</h1>
          <p className="tagline">A moment for yourself</p>
        </header>

        {savedToken && savedUser && (
          <div className="resume-section" style={{ marginBottom: '24px' }}>
            <button className="login-submit-btn" onClick={() => navigate("/")}>
              Continue as {savedUser.split('@')[0]}
            </button>
            <div className="divider"><span>OR SIGN IN</span></div>
          </div>
        )}

        <form className="login-form" onSubmit={handleLogin}>
          <input 
            type="email" 
            placeholder="Email address" 
            value={email}
            onChange={(e) => setEmail(e.target.value)} 
            required 
          />
          <input 
            type="password" 
            placeholder="Password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)} 
            required 
          />
          
          {error && <p className="error-text" style={{ color: '#ff6b6b', fontSize: '13px', textAlign: 'center', margin: '10px 0' }}>{error}</p>}
          
          <button type="submit" className="login-submit-btn" disabled={loading}>
            {loading ? "Aligning..." : "Sign In"}
          </button>
        </form>

        <div className="divider"><span>OR</span></div>

        <button 
          className="google-btn" 
          type="button"
          onClick={handleGoogleLogin}
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/smartlock/google.svg" width="18" alt="Google" />
          Continue with Google
        </button>
      </div>
    </div>
  );
}