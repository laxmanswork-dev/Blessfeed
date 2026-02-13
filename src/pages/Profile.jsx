import { useNavigate } from "react-router-dom";
import { LogOut, User } from "lucide-react";

export default function Profile() {
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const email = localStorage.getItem("userEmail");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userEmail");
    navigate("/login", { replace: true });
  };

  if (!token) {
    navigate("/login", { replace: true });
    return null;
  }

  return (
    <div className="min-h-screen bg-black text-white px-6 pt-24 pb-32">
      
      {/* User Card */}
      <div className="bg-white/[0.04] border border-white/[0.08] rounded-3xl p-6 mb-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
            <User size={20} />
          </div>
          <div>
            <p className="text-xs text-zinc-500 uppercase tracking-widest">
              Signed in as
            </p>
            <p className="text-sm font-medium">
              {email || "Authenticated User"}
            </p>
          </div>
        </div>
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 font-bold tracking-widest uppercase text-xs active:scale-95"
      >
        <LogOut size={16} />
        Logout
      </button>
    </div>
  );
}
