import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setLoading(true);

      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/login`,
        { email, password }
      );

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("userEmail", email);

      // ✅ Correct route
      navigate("/");

    } catch (err) {
      alert(err.response?.data?.message || "Login failed");
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

        <input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-4 px-4 py-3 rounded-xl bg-white/5 text-white border border-white/10 focus:outline-none"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-6 px-4 py-3 rounded-xl bg-white/5 text-white border border-white/10 focus:outline-none"
        />

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-white text-black font-semibold py-3 rounded-xl hover:opacity-90 transition"
        >
          {loading ? "Signing In..." : "SIGN IN"}
        </button>

        <p className="text-sm text-gray-400 mt-4 text-center">
          Seeking a new beginning?
          <span
            className="underline cursor-pointer ml-1 text-white"
            onClick={() => navigate("/signup")}
          >
            Join now
          </span>
        </p>

      </div>
    </div>
  );
};

export default Login;
