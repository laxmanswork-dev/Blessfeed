import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import "./Login.css";

const API_URL = "https://blessfeed-backend.onrender.com";

export default function Signup() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSignup = async (e) => {
    if (e) e.preventDefault();

    // 1. Basic Validation
    if (!email || !password) {
      setError("Email and password are required");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password should be at least 6 characters");
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

      setIsSuccess(true);
      
      // Delay navigation so user sees the success state
      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 1500);

    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Signup failed. This email may already be in use."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-bg">
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }}
        className="login-card"
      >
        <header className="login-header">
          <h2 className="brand">BLESSFEED</h2>
          <p className="tagline">Create your space</p>
        </header>

        <AnimatePresence mode="wait">
          {!isSuccess ? (
            <motion.form 
              key="signup-form"
              exit={{ opacity: 0, scale: 0.95 }}
              onSubmit={handleSignup} 
              className="login-form"
            >
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                disabled={loading}
              />

              <input
                type="password"
                placeholder="Create Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                disabled={loading}
              />

              <input
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                disabled={loading}
              />

              {error && <p className="error-text">{error}</p>}

              <button type="submit" disabled={loading} className="login-submit-btn">
                {loading ? "Creating..." : "Get started"}
              </button>

              <p className="switch-auth">
                Already have an account? <Link to="/login">Sign in</Link>
              </p>
            </motion.form>
          ) : (
            <motion.div 
              key="success-message"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="success-state"
            >
              <div className="success-icon">✓</div>
              <p>Account created. Welcome.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}