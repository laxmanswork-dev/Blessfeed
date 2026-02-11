import { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import "./Login.css";

const API_URL = import.meta.env.VITE_API_URL;
const SOUND_PATH = "/mnt/data/46268990-alien-robot-246019.mp3";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Preload Interaction Sound
  const [clickAudio] = useState(new Audio(SOUND_PATH));

  useEffect(() => {
    clickAudio.load();
    clickAudio.volume = 0.3;
  }, [clickAudio]);

  const playClick = useCallback(() => {
    clickAudio.currentTime = 0;
    clickAudio.play().catch(() => {}); // Prevents errors if sound is blocked
  }, [clickAudio]);

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    playClick();
    setLoading(true);
    setError("");
    try {
      const { data } = await axios.post(`${API_URL}/api/auth/login`, { email, password });
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", email);
      navigate("/", { replace: true });
    } catch (err) {
      setError("The rhythm seems mismatched. Please try again.");
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

        <form className="login-form" onSubmit={handleLogin}>
          <input 
            type="email" 
            placeholder="Email Address" 
            value={email}
            onChange={(e) => setEmail(e.target.value)} 
            required 
          />
          {error && <p className="error-text">{error}</p>}
          <input 
            type="password" 
            placeholder="Password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)} 
            required 
          />
          <button type="submit" className="login-submit-btn" disabled={loading}>
            {loading ? "ALIGNING..." : "SIGN IN"}
          </button>
        </form>

        <div className="divider"><span>OR</span></div>
        <button className="google-btn" onClick={() => { playClick(); window.location.href = `${API_URL}/api/auth/google`; }}>
          Continue with Google
        </button>

        <p className="auth-switch">
          Seeking a new beginning?{" "}
          <Link to="/signup" onClick={playClick}>Join now</Link>
        </p>
      </div>
    </div>
  );
}