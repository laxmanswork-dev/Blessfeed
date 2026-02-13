import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Signup() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const API_URL = import.meta.env.VITE_API_URL;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validate = () => {
    if (!form.email.includes("@")) return "Invalid email format";
    if (form.password.length < 6) return "Password must be at least 6 characters";
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

      const res = await axios.post(
        `${API_URL}/api/auth/register`,
        form
      );

      // ✅ Store token + email
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("userEmail", form.email);

      // ✅ Redirect to protected home
      navigate("/home");

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#0a0f2c] to-black px-4">
      <div className="w-full max-w-md bg-black/40 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/10">

        <h1 className="text-3xl text-center tracking-widest text-white mb-2">
          BLESSFEED
        </h1>

        <p className="text-center text-gray-400 text-sm mb-6">
          A moment for yourself
        </p>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={form.email}
            onChange={handleChange}
            className="w-full mb-4 px-4 py-3 rounded-xl bg-white/5 text-white border border-white/10 focus:outline-none"
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Create Password"
            value={form.password}
            onChange={handleChange}
            className="w-full mb-6 px-4 py-3 rounded-xl bg-white/5 text-white border border-white/10 focus:outline-none"
            required
          />

          {error && (
            <p className="text-red-400 text-sm mb-4">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-black font-semibold py-3 rounded-xl hover:opacity-90 transition"
          >
            {loading ? "Creating Account..." : "GET STARTED"}
          </button>
        </form>

        <p className="text-sm text-gray-400 mt-4 text-center">
          Already a part of the flow?
          <span
            className="underline cursor-pointer ml-1 text-white"
            onClick={() => navigate("/login")}
          >
            Sign in
          </span>
        </p>

      </div>
    </div>
  );
}
