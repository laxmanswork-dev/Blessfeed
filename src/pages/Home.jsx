import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, useMotionValue, useTransform, AnimatePresence } from "framer-motion";
import { Zap, Users, Fingerprint, Wind, Home as HomeIcon, Compass, User, Send, History } from "lucide-react";
import { io } from "socket.io-client";
import { v4 as uuidv4 } from "uuid";

const BACKEND_URL = "http://localhost:5000";

/* ---------------- AuraCard Component ---------------- */
const AuraCard = ({ icon: Icon, title, subtitle, children, activeColor, className = "", onClick, disabled }) => (
  <motion.div
    onClick={!disabled ? onClick : undefined}
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: disabled ? 0.3 : 1, y: 0 }}
    className={`relative overflow-hidden rounded-[32px] p-6 bg-[#0A0A0A] border border-white/[0.06] backdrop-blur-3xl w-full flex flex-col transition-all duration-500 ${className} ${
      disabled ? "grayscale pointer-events-none" : "cursor-pointer"
    }`}
  >
    <motion.div
      className="absolute -top-16 -right-16 w-40 h-40 blur-[70px] rounded-full opacity-[0.12]"
      style={{ backgroundColor: activeColor }}
    />
    <div className="relative z-10 flex flex-col h-full">
      <div className="flex items-center gap-3.5 mb-6">
        <div className="flex items-center justify-center w-10 h-10 rounded-[12px] bg-white/[0.03] border border-white/[0.08] text-white/90">
          <Icon size={18} strokeWidth={1.5} />
        </div>
        <div>
          <h2 className="font-semibold text-white text-[15px] leading-none mb-1.5">{title}</h2>
          <p className="text-zinc-500 text-[10px] font-bold tracking-[0.08em] uppercase opacity-60">{subtitle}</p>
        </div>
      </div>
      <div className="flex-1 flex items-center">{children}</div>
    </div>
  </motion.div>
);

export default function BlessFeed() {
  const [activeTab, setActiveTab] = useState("home");
  const [activeUsers, setActiveUsers] = useState(0);
  const [circleActive, setCircleActive] = useState(false);
  const [isBreathing, setIsBreathing] = useState(false);
  const [breathePhase, setBreathePhase] = useState("");
  const [thought, setThought] = useState("");
  const [isReleased, setIsReleased] = useState(false);
  const [localHistory, setLocalHistory] = useState([]);

  // UseMemo prevents the socket from re-initializing on every render
  const socket = useMemo(() => io(BACKEND_URL), []);

  const intensity = useMotionValue(50);
  const auraColor = useTransform(intensity, [0, 50, 100], ["#22c55e", "#6366f1", "#f43f5e"]);
  const backgroundAura = useTransform(auraColor, (c) => `radial-gradient(circle at 50% 0%, ${c}22 0%, transparent 70%)`);
  const orbGradient = useTransform(auraColor, (c) => `radial-gradient(circle at 35% 30%, #FFFFFF 0%, ${c} 45%, #000000 100%)`);
  const orbShadow = useTransform(auraColor, (c) => `0 0 80px -20px ${c}`);

  // 1. Lifecycle & Socket Subscriptions
  useEffect(() => {
    socket.on("presence:sync", (data) => setActiveUsers(data.count ?? 0));
    socket.on("presence:pulse", () => {
      setCircleActive(true);
      setTimeout(() => setCircleActive(false), 2500);
    });

    try {
      const saved = localStorage.getItem("bless_history");
      if (saved) setLocalHistory(JSON.parse(saved));
    } catch (e) {
      console.error("Failed to parse history", e);
    }

    return () => {
      socket.off("presence:sync");
      socket.off("presence:pulse");
      socket.disconnect();
    };
  }, [socket]);

  // 2. Controlled Breathing Logic (State-driven for Clean Unmounting)
  useEffect(() => {
    let timer;
    if (isBreathing) {
      let cycle = 0;
      const runCycle = () => {
        if (cycle >= 3) {
          setIsBreathing(false);
          setBreathePhase("");
          return;
        }
        setBreathePhase("Inhale...");
        timer = setTimeout(() => {
          setBreathePhase("Exhale...");
          timer = setTimeout(() => {
            cycle++;
            runCycle();
          }, 8000);
        }, 4000);
      };
      runCycle();
    }
    return () => clearTimeout(timer);
  }, [isBreathing]);

  const handleSend = () => {
    if (!thought.trim() || isReleased) return;
    setIsReleased(true);
    
    const newEntry = { 
      id: uuidv4(), 
      val: Math.round(intensity.get()), 
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
    };

    const updated = [newEntry, ...localHistory].slice(0, 7);
    setLocalHistory(updated);
    localStorage.setItem("bless_history", JSON.stringify(updated));
    
    // Simulate server "sending" lag for feel
    setTimeout(() => { 
      setThought(""); 
      setIsReleased(false); 
    }, 2500);
  };

  return (
    <div className="max-w-[390px] mx-auto min-h-screen bg-black text-white flex flex-col overflow-x-hidden relative font-sans selection:bg-indigo-500/30">
      
      {/* Background Aura */}
      <motion.div
        style={{ background: backgroundAura }}
        className="fixed top-0 left-0 w-full h-full pointer-events-none z-0"
      />

      <AnimatePresence mode="wait">
        {activeTab === "home" && (
          <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col w-full">
            
            {/* Header & Orb */}
            <section className="h-[48vh] flex flex-col items-center justify-center z-10 px-6">
              <div className="text-center h-24 flex flex-col items-center justify-end">
                <AnimatePresence mode="wait">
                  {isBreathing ? (
                    <motion.h1 
                      key={breathePhase} 
                      initial={{ opacity: 0, scale: 0.9, y: 5 }} 
                      animate={{ opacity: 1, scale: 1, y: 0 }} 
                      exit={{ opacity: 0, scale: 1.1 }} 
                      className="text-[28px] font-light italic text-white"
                    >
                      {breathePhase}
                    </motion.h1>
                  ) : (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <div className="inline-block px-4 py-1.5 rounded-full bg-white/[0.02] border border-white/[0.07] mb-4">
                        <span className="text-[8px] tracking-[0.8em] text-white/30 uppercase font-black ml-[0.8em]">BLESSFEED</span>
                      </div>
                      <h1 className="text-[26px] font-extralight text-zinc-400">
                        A moment for <br/>
                        <span className="font-medium italic text-white">yourself</span>
                      </h1>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="mt-10">
                <motion.div
                  animate={isBreathing ? (breathePhase === "Inhale..." ? { scale: 1.45 } : { scale: 0.85 }) : { scale: [1, 1.05, 1] }}
                  transition={{ 
                    duration: isBreathing ? (breathePhase === "Inhale..." ? 4 : 8) : 6, 
                    ease: "easeInOut", 
                    repeat: isBreathing ? 0 : Infinity 
                  }}
                  className="w-44 h-44 rounded-full border border-white/5"
                  style={{
                    background: orbGradient,
                    boxShadow: orbShadow,
                  }}
                />
              </div>
            </section>

            {/* Cards Grid */}
            <main className="px-6 pb-40 space-y-4 z-10">
              <AuraCard icon={Fingerprint} title="Resonance" subtitle="Mood Intensity" activeColor={auraColor} disabled={isBreathing}>
                <input 
                  type="range" 
                  aria-label="Mood Intensity"
                  className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white" 
                  onChange={(e) => intensity.set(Number(e.target.value))} 
                />
              </AuraCard>

              <div className="grid grid-cols-2 gap-4">
                <AuraCard icon={Wind} title="Breathe" subtitle={`${activeUsers} Breathers`} activeColor={auraColor} className="h-[175px]" disabled={isBreathing}>
                  <motion.button 
                    whileTap={{ scale: 0.95 }} 
                    onClick={() => setIsBreathing(true)} 
                    className="w-full py-4 mt-auto rounded-2xl bg-white text-black text-[10px] font-black tracking-widest uppercase shadow-lg shadow-white/5"
                  >
                    BEGIN
                  </motion.button>
                </AuraCard>

                <AuraCard 
                  icon={Users} title="Circle" subtitle="Shared Pulse" activeColor={auraColor} className="h-[175px]" disabled={isBreathing} 
                  onClick={() => { setCircleActive(true); socket.emit("circle:tap"); setTimeout(() => setCircleActive(false), 2500); }}
                >
                  <div className="flex -space-x-4 mt-auto mb-2">
                    {[0, 1, 2].map((i) => (
                      <motion.div 
                        key={i} 
                        animate={circleActive ? { scale: [1, 1.3, 1], backgroundColor: ["#18181b", "#ffffff", "#18181b"] } : {}} 
                        transition={{ delay: i * 0.2 }} 
                        className="w-10 h-10 rounded-full bg-zinc-900 border-2 border-black shadow-inner" 
                      />
                    ))}
                  </div>
                </AuraCard>
              </div>

              <AuraCard icon={Zap} title="The Feed" subtitle="Zero-Data Vent" activeColor={auraColor} disabled={isBreathing}>
                {!isReleased ? (
                  <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="relative w-full">
                    <input 
                      value={thought} 
                      onChange={(e) => setThought(e.target.value)} 
                      placeholder="Release your pressure..." 
                      className="w-full bg-white/[0.03] border border-white/[0.08] rounded-2xl py-4 pl-5 pr-14 text-[13px] focus:outline-none focus:border-white/20 transition-colors" 
                    />
                    <button 
                      type="submit"
                      disabled={!thought.trim()}
                      className="absolute right-1.5 top-1.5 w-11 h-11 bg-white text-black rounded-xl flex items-center justify-center disabled:opacity-50"
                    >
                      <Send size={16} />
                    </button>
                  </form>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    className="w-full py-4 text-center text-zinc-500 italic text-[11px] tracking-[0.3em] uppercase"
                  >
                    Released
                  </motion.div>
                )}
              </AuraCard>
            </main>
          </motion.div>
        )}

        {activeTab === "explore" && (
          <motion.div key="explore" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col items-center justify-center p-12 text-center h-[80vh]">
             <h2 className="text-xl font-light text-zinc-400">You are breathing with <br/><span className="text-white font-medium italic">{activeUsers + 124} souls.</span></h2>
             <p className="text-[10px] uppercase tracking-[0.4em] text-zinc-600 mt-6">Collective Peace</p>
          </motion.div>
        )}

        {activeTab === "profile" && (
          <motion.div key="profile" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="p-8 pt-24 space-y-8">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-white/5 rounded-2xl border border-white/10"><History size={20} className="text-zinc-400" /></div>
              <h2 className="text-lg font-medium">Your Journey</h2>
            </div>
            {localHistory.length > 0 ? localHistory.map((item) => (
              <div key={item.id} className="flex justify-between items-center p-5 bg-[#0A0A0A] border border-white/5 rounded-3xl">
                <div className="flex items-center gap-4">
                  <div className="w-1.5 h-6 rounded-full" style={{ background: item.val > 60 ? "#f43f5e" : "#6366f1" }} />
                  <span className="text-sm text-zinc-400">{item.time}</span>
                </div>
                <span className="text-[10px] font-bold opacity-30 tracking-widest">{item.val}%</span>
              </div>
            )) : (
              <p className="text-zinc-600 italic text-sm text-center pt-10">No entries yet. Breathe and release.</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 px-10 h-16 bg-[#0F0F0F]/80 border border-white/[0.08] rounded-full flex items-center gap-12 backdrop-blur-xl z-50 shadow-2xl">
        <NavButton active={activeTab === "home"} onClick={() => setActiveTab("home")} icon={HomeIcon} />
        <NavButton active={activeTab === "explore"} onClick={() => setActiveTab("explore")} icon={Compass} />
        <NavButton active={activeTab === "profile"} onClick={() => setActiveTab("profile")} icon={User} />
      </nav>
    </div>
  );
}

const NavButton = ({ active, onClick, icon: Icon }) => (
  <button 
    onClick={onClick} 
    className={`${active ? "text-white" : "text-zinc-600"} transition-colors hover:text-white/80`}
  >
    <Icon size={20} />
  </button>
);