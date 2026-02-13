import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function LoginSuccess() {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const email = params.get("email");

    if (token) {
      localStorage.setItem("token", token);

      if (email) {
        localStorage.setItem("userEmail", email);
      }

      navigate("/", { replace: true }); // ✅ go to protected home
    } else {
      navigate("/login", { replace: true }); // fallback safety
    }
  }, [navigate]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "black",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "white"
      }}
    >
      Signing you in…
    </div>
  );
}
