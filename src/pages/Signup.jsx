import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Login.css";

const API_URL = import.meta.env.VITE_API_URL;

export default function Signup() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validate = () => {
    if (!form.email.includes("@")) return "Invalid email format";
    if (form.password.length < 6) return "Password must be 6+ characters";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);

      const { data } = await axios.post(
        `${API_URL}/api/auth/register`,
        form,
        { timeout: 10000 }
      );

      localStorage.setItem("token", data.token);
      navigate("/feed");

    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Account creation failed. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <h1 className="brand">BLESSFEED</h1>

      <form onSubmit={handleSubmit} className="auth-form">
        <input
          type="email"
          name="email"
          placeholder="Email Address"
          value={form.email}
          onChange={handleChange}
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Create Password"
          value={form.password}
          onChange={handleChange}
          required
        />

        {error && <p className="error-text">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="primary-btn"
        >
          {loading ? "Creating Account..." : "GET STARTED"}
        </button>
      </form>

      <p className="switch-text">
        Already a part of the flow?
        <span onClick={() => navigate("/login")}>
          {" "}Sign in
        </span>
      </p>
    </div>
  );
}
