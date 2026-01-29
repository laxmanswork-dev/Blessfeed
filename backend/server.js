import React, { useState, useEffect, useRef } from "react";
import { motion, useMotionValue, useTransform, AnimatePresence } from "framer-motion";
import { Zap, Users, Fingerprint, Wind, Home as HomeIcon, Compass, User, Send } from "lucide-react";
import { io } from "socket.io-client";
import { v4 as uuidv4 } from "uuid";

const BACKEND_URL = "http://localhost:5000";
const socket = io(BACKEND_URL, { transports: ["websocket"] });

const AuraCard = ({ icon: Icon, title, subtitle, children, activeColor, className = "", onClick, disabled }) => (
  <motion.div
    onClick={!disabled ? onClick : undefined}
    whileTap={!disabled ? { scale: 0.97 } : {}}
    className={`relative overflow-hidden rounded-[32px] p-5 bg-[#0A0A0A] border border-white/[0.06] backdrop-blur-3xl w-full flex flex-col transition-all duration-500 ${className} ${
      disabled ? "opacity-30 grayscale pointer-events-none" : "opacity-100 cursor-pointer hover:border-white/10"
    }`}
  >
    <motion.div
      className="absolute -top-16 -right-16 w-40 h-40 blur-[70px] rounded-full opacity-[0.12]"
      style={{ backgroundColor: activeColor }}
    />
    <div className="relative z-10 flex flex-col h-full">
      <div className="flex items-start gap-4 mb-4">
        <div className="flex items-center justify-center w-10 h-10 rounded-[14px] bg-white/[0.03] border border-white/[0.08] text-white/90 shrink-0">
          <Icon size={18} strokeWidth={1.5} />
        </div>
        <div className="flex flex-col pt-1">
          <h2 className="font-semibold text-white text-[14px] leading-none mb-1.5">{title}</h2>
          <p className="text-zinc-500 text-[9px] font-bold tracking-[0.05em] uppercase opacity-60 leading-none">{subtitle}</p>
        </div>
      </div>
      <div className="flex-1 flex flex-col justify-center w-full">
        {children}
      </div>
    </div>
  </motion.div>
);

export default function BlessFeed() {
  const [activeUsers, setActiveUsers] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [circleActive, setCircleActive] = useState(false);
  const [isBreathing, setIsBreathing] = useState(false);
  const [breathePhase, setBreathePhase] = useState("");
  const [thought, setThought] = useState("");
  const [isReleased, setIsReleased] = useState(false);
  const [localHistory, setLocalHistory] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("bless_history")) || [];
    } catch { return []; }
  });

  const intensity = useMotionValue(50);
  const auraColor = useTransform(intensity, [0, 50, 100], ["#22c55e", "#6366f1", "#f43f5e"]);
  const breathingRef = useRef(false);

  useEffect(() => {
    socket.on("connect", () => setIsConnected(true));
    socket.on("disconnect", () => setIsConnected(false));
    socket.on("presence:sync", (data) => setActiveUsers(data.count ?? 0));
    socket.on("presence:pulse", () => {
      setCircleActive(true);
      setTimeout(() => setCircleActive(false), 2000);
    });
    return () => { socket.off(); };
  }, []);

  const startBreathe = () => {
    if (breathingRef.current) return;
    breathingRef.current = true;
    setIsBreathing(true);
    let cycle = 0;
    const runCycle = () => {
      if (cycle >= 3) { setIsBreathing(false); setBreathePhase(""); breathingRef.current = false; return; }
      setBreathePhase("Inhale...");
      setTimeout(() => {
        setBreathePhase("Exhale...");
        setTimeout(() => { cycle++; runCycle(); }, 6000);
      }, 4000);
    };
    runCycle();
  };

  return (
    <div className="max-w-[390px] mx-auto min-h-screen bg-black text-white flex flex-col overflow-x-hidden relative font-sans antialiased">
      
      {/* Background Glow */}
      <motion.div
        animate={{ opacity: [0.1, 0.2, 0.1] }}
        transition={{ duration: 4, repeat: Infinity }}
        style={{ background: useTransform(auraColor, (c) => `radial-gradient(circle at 50% 0%, ${c}33 0%, transparent 70%)`) }}
        className="fixed top-0 left-0 w-full h-full pointer-events-none z-0"
      />

      {/* RECALIBRATED HERO SECTION */}
      <section className="relative flex flex-col items-center justify-center pt-24 pb-8 z-10 w-full min-h-[48vh]">
        
        {/* Branding Pill */}
        <div className="absolute top-12 left-1/2 -translate-x-1/2">
           <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.08]">
            <div className={`w-1.5 h-1.5 rounded-full ${isConnected ? "bg-green-500 shadow-[0_0_8px_#22c55e]" : "bg-zinc-700"}`} />
            <span className="text-[8px] tracking-[0.6em] text-white/50 uppercase font-black ml-[0.8em]">BLESSFEED</span>
          </div>
        </div>

        {/* Dynamic Typography */}
        <div className="text-center z-10 mb-10 select-none">
          <AnimatePresence mode="wait">
            {isBreathing ? (
              <motion.h1 
                key={breathePhase} 
                initial={{ opacity: 0, y: 8 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -8 }}
                className="text-[32px] font-extralight italic text-white tracking-tight"
              >
                {breathePhase}
              </motion.h1>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center">
                <h1 className="text-[26px] font-extralight text-zinc-400 leading-[1.15] tracking-tight">
                  A moment for <br/>
                  <span className="italic text-white font-medium">yourself</span>
                </h1>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* ORB WRAPPER - Corrected with -mt-4 for visual equilibrium */}
        <div className="relative flex items-center justify-center w-full -mt-4">
            <motion.div
              animate={isBreathing ? (breathePhase === "Inhale..." ? { scale: 1.35 } : { scale: 0.9 }) : { scale: [1, 1.05, 1] }}
              transition={{ duration: 4, repeat: isBreathing ? 0 : Infinity, ease: "easeInOut" }}
              className="w-40 h-40 rounded-full"
              style={{
                  background: useTransform(auraColor, (c) => `radial-gradient(circle at 35% 35%, #fff 0%, ${c} 45%, #000 100%)`),
                  boxShadow: useTransform(auraColor, (c) => `0 0 80px -20px ${c}`),
              }}
            />
        </div>
      </section>

      {/* MAIN CARDS */}
      <main className="px-6 pb-32 space-y-4 z-10 relative">
        <AuraCard icon={Fingerprint} title="Resonance" subtitle="Intensity" activeColor={auraColor} disabled={isBreathing}>
          <input type="range" className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white mt-2" onChange={(e) => intensity.set(Number(e.target.value))} />
        </AuraCard>

        <div className="grid grid-cols-2 gap-4 items-stretch">
          <AuraCard icon={Wind} title="Breathe" subtitle="Guided" activeColor={auraColor} className="min-h-[175px]" disabled={isBreathing}>
            <button onClick={startBreathe} className="w-full py-4 mt-auto rounded-2xl bg-white text-black text-[10px] font-black tracking-widest uppercase shadow-xl shadow-black/20">BEGIN</button>
          </AuraCard>

          <AuraCard 
            icon={Users} 
            title="Circle" 
            subtitle={`${activeUsers} Souls`} 
            activeColor={auraColor} 
            className="min-h-[175px]"
            onClick={() => { socket.emit("circle:tap"); setCircleActive(true); setTimeout(() => setCircleActive(false), 1000); }}
          >
            <div className="flex -space-x-3 mt-auto justify-start mb-1">
              {[0, 1, 2].map((i) => (
                <motion.div 
                  key={i} 
                  animate={circleActive ? { scale: [1, 1.25, 1], y: [0, -5, 0] } : {}}
                  transition={{ delay: i * 0.1 }}
                  className="w-10 h-10 rounded-full bg-zinc-900 border-2 border-black" 
                />
              ))}
            </div>
          </AuraCard>
        </div>

        <AuraCard icon={Zap} title="The Feed" subtitle="Private Release" activeColor={auraColor} disabled={isBreathing}>
          {!isReleased ? (
            <div className="relative w-full mt-2">
              <input value={thought} onChange={(e) => setThought(e.target.value)} placeholder="Release..." className="w-full bg-[#111] border border-white/[0.05] rounded-2xl py-4 pl-4 pr-12 text-[13px] focus:outline-none focus:border-white/10" />
              <button 
                onClick={() => { 
                  if (!thought.trim()) return;
                  setIsReleased(true); 
                  const newEntry = { id: uuidv4(), time: new Date().toLocaleTimeString(), val: Math.round(intensity.get()) };
                  const updated = [newEntry, ...localHistory].slice(0, 10);
                  setLocalHistory(updated);
                  localStorage.setItem("bless_history", JSON.stringify(updated));
                  setTimeout(() => {setThought(""); setIsReleased(false)}, 2500);
                }} 
                className="absolute right-1.5 top-1.5 w-11 h-11 bg-white text-black rounded-xl flex items-center justify-center"
              >
                <Send size={16} />
              </button>
            </div>
          ) : (
            <div className="py-4 text-center text-[10px] uppercase tracking-[0.3em] text-zinc-600 font-bold animate-pulse">Released</div>
          )}
        </AuraCard>
      </main>

      <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 px-8 h-16 bg-[#0D0D0D]/95 border border-white/[0.08] rounded-full flex items-center gap-12 backdrop-blur-2xl z-50 shadow-2xl">
        <HomeIcon size={20} className="text-white" />
        <Compass size={20} className="text-zinc-700" />
        <User size={20} className="text-zinc-700" />
      </nav>
    </div>
  );
}