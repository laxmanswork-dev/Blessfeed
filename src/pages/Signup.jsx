import { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import "./Login.css";

const API_URL = "https://blessfeed-backend.onrender.com";
const SOUND_PATH = "/mnt/data/46268990-alien-robot-246019.mp3";

export default function Signup() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [clickAudio] = useState(new Audio(SOUND_PATH));

  useEffect(() => {
    clickAudio.load();
    clickAudio.volume = 0.3;
  }, [clickAudio]);

  const playClick = useCallback(() => {
    clickAudio.currentTime = 0;
    clickAudio.play().catch(() => {});
  }, [clickAudio]);

  const handleSignup = async (e) => {
    if (e) e.preventDefault();
    playClick();
    if (password.length < 6) return setError("A longer path is required for security.");
    setLoading(true);
    try {
      await axios.post(`${API_URL}/api/auth/register`, { email, password });
      navigate("/login", { replace: true });
    } catch (err) {
      setError("This email has already begun its journey here.");
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
          {error && <p className="error-text">{error}</p>}
          <input 
            type="password" 
            placeholder="Create Password" 
            onChange={(e) => setPassword(e.target.value)} 
            required 
          />
          <button type="submit" className="login-submit-btn" disabled={loading}>
            {loading ? "PREPARING..." : "GET STARTED"}
          </button>
        </form>

        <div className="divider"><span>OR</span></div>
        <button className="google-btn" onClick={() => { playClick(); window.location.href = `${API_URL}/api/auth/google`; }}>
          Continue with Google
        </button>

        <p className="auth-switch">
          Already a part of the flow?{" "}
          <Link to="/login" onClick={playClick}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}