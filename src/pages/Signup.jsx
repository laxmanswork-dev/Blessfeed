import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Login.css";

// ✅ FORCE production backend
const API_URL = "https://blessfeed-backend.onrender.com";

export default function Signup() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!email || !password) {
      setError("Please enter email and password");
      return;
    }

    setError("");
    setLoading(true);

    try {
      await axios.post(
        `${API_URL}/api/auth/register`,
        { email, password },
        { headers: { "Content-Type": "application/json" } }
      );

      // ✅ go to login after success
      navigate("/login", { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Signup failed. Try a different email."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-bg">
      <div className="login-card">
        <h2 className="brand">BLESSFEED</h2>
        <p className="tagline">Create your space</p>

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

        <button onClick={handleSignup} disabled={loading}>
          {loading ? "Creating…" : "Get started"}
        </button>
      </div>
    </div>
  );
}
