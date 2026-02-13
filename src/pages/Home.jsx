import React, { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Activity, Wind, Home as HomeIcon, BarChart3, User, Send, History, Target, Pause, Play, LogOut, CheckCircle2, Download } from "lucide-react";
import { io } from "socket.io-client";
import { v4 as uuidv4 } from "uuid";

const BACKEND_URL = "https://blessfeed-backend.onrender.com";

/* 1️⃣ AUTH HELPER */
const getToken = () => localStorage.getItem("token");

const SOUND_MAP = {
  sync: "https://assets.mixkit.co/active_storage/sfx/900/900-preview.mp3",
  slider: "https://assets.mixkit.co/active_storage/sfx/221/221-preview.mp3",
  resonance: "https://assets.mixkit.co/active_storage/sfx/234/234-preview.mp3", 
  breathe: "https://assets.mixkit.co/active_storage/sfx/216/216-preview.mp3",
  intent: "https://assets.mixkit.co/active_storage/sfx/211/211-preview.mp3",
  inhale: "https://cdn.freesound.org/previews/87/87397_1236523-lq.mp3",
  exhale: "https://cdn.freesound.org/previews/95/95275_1540842-lq.mp3"
};

/* ---------------- 📊 MOOD GRAPH ---------------- */
const MoodGraph = ({ history = [] }) => {
  const weekData = useMemo(() => {
    const days = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const dateString = d.toISOString().split("T")[0];
      const dayEntries = history.filter(item => (item?.createdAt?.startsWith(dateString)));
      const avgVal = dayEntries.length > 0 
        ? dayEntries.reduce((acc, curr) => acc + curr.intensity, 0) / dayEntries.length 
        : null;
      days.push({
        label: d.toLocaleDateString("en-US", { weekday: "short" }),
        val: avgVal, 
        isToday: i === 0,
      });
    }
    return days;
  }, [history]);

  const getBarColor = (val) => {
    if (val === null) return "rgba(255, 255, 255, 0.1)";
    if (val < 40) return "#22c55e"; 
    if (val < 70) return "#6366f1"; 
    return "#f43f5e"; 
  };

  const getHeight = (val) => {
    const maxVal = 100;
    const minVisualHeight = 8;
    if (val === null) return minVisualHeight;
    const normalized = (val / maxVal) * 100;
    return Math.min(Math.max(normalized * 1.25, minVisualHeight), 100);
  };

  return (
    <div className="w-full flex flex-col items-center justify-center px-6 text-center">
      <div className="mb-6">
        <h2 className="text-2xl font-light text-white mb-2">Weekly Reflection</h2>
        <p className="text-zinc-500 text-[10px] tracking-[0.2em] uppercase font-bold">Resonance History</p>
      </div>

      <div className="flex items-end justify-between w-full h-48 gap-2 mb-10 relative">
        {weekData.map((day, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-3 h-full justify-end">
            <div className="relative w-full flex justify-center items-end h-full">
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${getHeight(day.val)}%` }}
                transition={{ type: "spring", damping: 15, stiffness: 100, delay: i * 0.05 }}
                className="w-full max-w-[32px] rounded-t-lg relative z-10"
                style={{ 
                  backgroundColor: getBarColor(day.val),
                  boxShadow: day.val ? `0 0 20px ${getBarColor(day.val)}44` : "none"
                }}
              >
                {day.isToday && (
                  <motion.div 
                    animate={{ opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 blur-md rounded-t-lg bg-inherit -z-10"
                  />
                )}
              </motion.div>
            </div>
            <span className={`text-[9px] font-bold uppercase tracking-wider ${day.isToday ? "text-white" : "text-zinc-600"}`}>
              {day.label}
            </span>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-center gap-6">
        {[
          { color: "#22c55e", label: "Calm" },
          { color: "#6366f1", label: "Steady" },
          { color: "#f43f5e", label: "Intense" }
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.color }} />
            <span className="text-[8px] font-bold uppercase tracking-widest text-zinc-600">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ---------------- 🧊 AURA CARD ---------------- */
const AuraCard = ({ icon: Icon, title, subtitle, children, activeColor, className = "", onClick, disabled, isSyncIndicator, isConnected, isBreathing, breathePhase }) => (
  <div
    onClick={!disabled && onClick ? onClick : undefined}
    className={`relative overflow-hidden rounded-[32px] p-6 bg-[#0A0A0A] border border-white/[0.06] backdrop-blur-3xl w-full flex flex-col transition-all duration-700 ${className} ${
      disabled ? "opacity-30 grayscale pointer-events-none" : "opacity-100"
    } ${onClick ? "active:scale-[0.98] cursor-pointer" : ""}`}
  >
    <motion.div className="absolute -top-16 -right-16 w-40 h-40 blur-[70px] rounded-full opacity-[0.12]" style={{ backgroundColor: activeColor }} />
    <div className="relative z-10 flex flex-col h-full">
      <div className="flex items-center gap-3.5 mb-5">
        <div className="relative">
          <motion.div 
            animate={isSyncIndicator && isConnected ? { boxShadow: [`0 0 0px ${activeColor}00`, `0 0 15px ${activeColor}66`, `0 0 0px ${activeColor}00`] } : {}}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className={`flex items-center justify-center w-10 h-10 rounded-[12px] bg-white/[0.03] border border-white/[0.08] transition-opacity duration-1000 ${isSyncIndicator && !isConnected ? 'opacity-20' : 'opacity-100'}`}
          >
            <motion.div 
              animate={isSyncIndicator && isBreathing ? { 
                scale: breathePhase === "Inhale..." ? 1.2 : 0.9,
                opacity: breathePhase === "Inhale..." ? 1 : 0.4 
              } : {}} 
              transition={{ duration: 2, ease: "easeInOut" }}
            >
              <Icon size={18} strokeWidth={1.5} className={isSyncIndicator && isConnected ? "text-white" : "text-zinc-500"} />
            </motion.div>
          </motion.div>
        </div>
        <div>
          <h2 className="font-semibold text-white text-[15px] leading-none mb-1.5">{title}</h2>
          <p className="text-zinc-500 text-[10px] font-bold tracking-[0.08em] uppercase opacity-60">{subtitle}</p>
        </div>
      </div>
      <div className="flex-1 flex flex-col">{children}</div>
    </div>
  </div>
);

/* ---------------- 💎 MAIN APPLICATION ---------------- */
export default function BlessFeed() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = getToken();
    if (!token) navigate("/login", { replace: true });
  }, [navigate]);

  const [activeTab, setActiveTab] = useState("home");
  const [localHistory, setLocalHistory] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [isBreathing, setIsBreathing] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [timer, setTimer] = useState(120);
  const [breathePhase, setBreathePhase] = useState("Inhale...");
  const [activeUsers, setActiveUsers] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [displayIntensity, setDisplayIntensity] = useState(50);
  const [intentMode, setIntentMode] = useState("Steady");
  const [showIntentMenu, setShowIntentMenu] = useState(false);
  const [showSyncInsight, setShowSyncInsight] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [socketStatus, setSocketStatus] = useState("aligning");

  const socketRef = useRef(null);
  const audioRefs = useRef({});
  const lastPlayedRef = useRef({});
  const canvasRef = useRef(null);

  const intentConfig = useMemo(() => {
    switch(intentMode) {
      case "Release": return { inhaleMs: 3000, exhaleMs: 6000, physics: { damping: 35, stiffness: 30 }, pitchIn: 1.1, pitchOut: 0.7 };
      case "Focus": return { inhaleMs: 5000, exhaleMs: 2000, physics: { damping: 15, stiffness: 150 }, pitchIn: 0.8, pitchOut: 1.4 };
      default: return { inhaleMs: 4000, exhaleMs: 4000, physics: { damping: 20, stiffness: 80 }, pitchIn: 1.0, pitchOut: 1.0 };
    }
  }, [intentMode]);

  const currentAuraColor = useMemo(() => {
    if (displayIntensity < 40) return "#22c55e";
    if (displayIntensity < 70) return "#6366f1";
    return "#f43f5e";
  }, [displayIntensity]);

  const triggerDynamicHaptic = (value) => {
    if (!("vibrate" in navigator)) return;
    if (value < 40) navigator.vibrate(8);
    else if (value < 70) navigator.vibrate(15);
    else navigator.vibrate([25, 10, 25]);
  };

  const syncStatus = useMemo(() => {
    if (isBreathing && !isPaused) return isConnected ? "Syncing flow" : "Flowing internally";
    if (isPaused) return "Flow suspended";
    if (!isConnected) return "Awaiting rhythm";
    return socketStatus === "in_sync" ? "Rhythm ready" : "Finding flow";
  }, [isConnected, isBreathing, isPaused, socketStatus]);

  const hintVariants = {
    initial: { opacity: 0, y: 8 },
    animate: { 
      opacity: [0.15, 0.45, 0.15], 
      y: 0,
      transition: { opacity: { repeat: Infinity, duration: 4.5, ease: "easeInOut" }, y: { duration: 1.2, ease: [0.16, 1, 0.3, 1] } }
    }
  };

  useEffect(() => {
    const loadSessions = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/session/my`, { headers: { Authorization: `Bearer ${getToken()}` } });
        const data = await res.json();
        if (Array.isArray(data)) setLocalHistory(data);
      } catch (err) { console.error("Failed to fetch sessions", err); }
    };
    loadSessions();
  }, [activeTab]);

  useEffect(() => {
    const GLOBAL_VOLUME = 0.3; 
    Object.keys(SOUND_MAP).forEach(key => {
      const audio = new Audio(SOUND_MAP[key]);
      audio.volume = GLOBAL_VOLUME; audio.preload = "auto";
      audioRefs.current[key] = audio;
    });
    return () => { Object.values(audioRefs.current).forEach(audio => { audio.pause(); audio.src = ""; }); };
  }, []);

  const playSound = (key, rate = 1.0) => {
    const sound = audioRefs.current[key];
    const now = Date.now();
    if (sound && (!lastPlayedRef.current[key] || now - lastPlayedRef.current[key] > 80)) {
      sound.playbackRate = rate; sound.currentTime = 0;
      sound.play().catch(() => {}); lastPlayedRef.current[key] = now;
    }
  };

  useEffect(() => {
    let timeout = null;
    if (isBreathing && !isPaused) {
      const currentDuration = breathePhase === "Inhale..." ? intentConfig.inhaleMs : intentConfig.exhaleMs;
      if (breathePhase === "Inhale...") {
        playSound("inhale", intentConfig.pitchIn);
        if ("vibrate" in navigator) navigator.vibrate(10);
      } else {
        playSound("exhale", intentConfig.pitchOut);
      }
      timeout = setTimeout(() => { setBreathePhase(prev => (prev === "Inhale..." ? "Exhale..." : "Inhale...")); }, currentDuration);
    }
    return () => clearTimeout(timeout);
  }, [isBreathing, isPaused, breathePhase, intentConfig]);

  useEffect(() => {
    if (!socketRef.current) socketRef.current = io(BACKEND_URL, { reconnectionAttempts: 5, timeout: 10000 });
    const socket = socketRef.current;
    socket.on("connect", () => setIsConnected(true));
    socket.on("disconnect", () => setIsConnected(false));
    socket.on("presence:sync", (data) => setActiveUsers(data.count ?? 0));
    socket.on("sync:status", (data) => setSocketStatus(data.status));
    socket.on("breathing:started", (data) => {
      setIntentMode(data.intentMode || "Steady"); setIsBreathing(true); setTimer(120); setBreathePhase("Inhale...");
    });
    socket.on("breathing:paused", (pauseState) => setIsPaused(pauseState));
    socket.on("breathing:stopped", () => setIsBreathing(false));
    return () => { socket.off(); };
  }, []);

  const startBreathe = async () => {
    const newSessionId = uuidv4();
    setCurrentSessionId(newSessionId);
    triggerDynamicHaptic(displayIntensity); playSound("breathe");
    setIsBreathing(true); setIsPaused(false); setTimer(120); setBreathePhase("Inhale...");
    if (socketRef.current?.connected) socketRef.current.emit("breathing:start", { intentMode, sessionId: newSessionId });
  };

  const stopBreathe = async () => {
    if (socketRef.current?.connected) socketRef.current.emit("breathing:stop");
    try {
      await fetch(`${BACKEND_URL}/api/session/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ sessionId: currentSessionId, intensity: displayIntensity })
      });
    } catch (err) {}
    setCurrentSessionId(null); setShowSummary(true); setIsBreathing(false);
  };

  const closeSummary = () => { setShowSummary(false); setTimer(120); setActiveTab("home"); };
  const togglePause = () => {
    const nextPauseState = !isPaused;
    setIsPaused(nextPauseState);
    if (socketRef.current?.connected) socketRef.current.emit("breathing:pause", nextPauseState);
  };

  const handleLogout = () => {
    socketRef.current?.disconnect(); localStorage.removeItem("token"); navigate("/login", { replace: true });
  };

  return (
    <div className="max-w-[390px] mx-auto min-h-screen bg-black text-white flex flex-col relative overflow-hidden font-sans">
      <style>{`input[type="range"]::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 24px; height: 24px; background: transparent; cursor: pointer; }`}</style>

      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0 opacity-20"
        style={{ background: `radial-gradient(circle at 50% 0%, ${currentAuraColor} 0%, transparent 70%)` }} />

      <AnimatePresence>
        {showSummary && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[1100] bg-black/80 backdrop-blur-xl flex items-center justify-center p-8">
              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="w-full max-w-[320px] bg-[#0D0D0D] border border-white/10 rounded-[40px] p-8 text-center">
                <CheckCircle2 size={32} className="text-green-500 mx-auto mb-6" />
                <h3 className="text-xl font-light mb-1">Session Complete</h3>
                <div className="grid grid-cols-2 gap-3 my-8">
                  <div className="text-left p-4 bg-white/[0.03] rounded-2xl border border-white/5">
                    <p className="text-[8px] text-zinc-600 font-black uppercase mb-1">Time</p>
                    <p className="text-xl font-light">{120 - timer}s</p>
                  </div>
                  <div className="text-left p-4 bg-white/[0.03] rounded-2xl border border-white/5">
                    <p className="text-[8px] text-zinc-600 font-black uppercase mb-1">Res</p>
                    <p className="text-xl font-light">{displayIntensity}%</p>
                  </div>
                </div>
                <button onClick={closeSummary} className="w-full py-4 rounded-2xl bg-white text-black text-[10px] font-black uppercase">Home</button>
              </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 relative z-10 overflow-y-auto">
        <AnimatePresence mode="wait">
          {activeTab === "home" && (
            <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-32">
              <section className="min-h-[45vh] flex flex-col items-center justify-center px-6 text-center pt-10 pb-2">
                <div className="flex flex-col items-center gap-1.5 w-full mb-8">
                  {isBreathing ? (
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-[11px] font-bold tracking-[0.4em] text-white/30 uppercase">{Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, "0")}</span>
                      <motion.h1 key={breathePhase} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[34px] font-light italic text-white tracking-tight">{isPaused ? "Paused" : breathePhase}</motion.h1>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <span className="text-[15px] tracking-[0.6em] text-white/90 uppercase font-semibold mr-[-0.6em] mb-1.5">BLESSFEED</span>
                      <span className="text-[14px] font-light text-white/40">A moment for yourself</span>
                    </div>
                  )}
                </div>
                
                <div className="relative">
                  <motion.div 
                    animate={isBreathing && !isPaused ? { scale: breathePhase === "Inhale..." ? 1.4 : 1.0, boxShadow: `0 0 100px -10px ${currentAuraColor}` } : { y: [0, -4, 0] }} 
                    transition={{ duration: isBreathing ? (breathePhase === "Inhale..." ? intentConfig.inhaleMs/1000 : intentConfig.exhaleMs/1000) : 6, ease: "linear" }} 
                    className="w-44 h-44 rounded-full border border-white/10 relative z-10" 
                    style={{ background: `radial-gradient(circle at 50% 50%, ${currentAuraColor} 0%, ${currentAuraColor}cc 40%, transparent 100%)` }}
                  />
                </div>
              </section>

              <main className="px-6 space-y-4">
                <AuraCard icon={Activity} title="Rhythm Sync" subtitle={syncStatus} activeColor={currentAuraColor} isSyncIndicator={true} isConnected={isConnected} isBreathing={isBreathing} breathePhase={breathePhase} />
                
                <AuraCard icon={BarChart3} title="Your Reflection" subtitle={`${displayIntensity}%`} activeColor={currentAuraColor}>
                  <div className="mt-8 mb-4 px-1 relative flex items-center group">
                    <div className="relative w-full h-3 flex items-center">
                      <div className="absolute w-full h-full bg-white/10 rounded-full overflow-hidden">
                        <motion.div animate={{ width: `${displayIntensity}%`, backgroundColor: currentAuraColor }} className="h-full rounded-full" />
                      </div>
                      <input type="range" min="0" max="100" value={displayIntensity} 
                        onChange={(e) => { const newVal = parseInt(e.target.value); setDisplayIntensity(newVal); if (newVal % 5 === 0) { playSound("resonance", 0.8 + (newVal / 250)); triggerDynamicHaptic(newVal); } }} 
                        className="absolute w-full h-6 appearance-none bg-transparent cursor-pointer z-20 outline-none" />
                      <motion.div pointerEvents="none" animate={{ left: `calc(${displayIntensity}% - 10px)` }} className="absolute w-[20px] h-[20px] bg-white rounded-full z-10 shadow-[0_0_15px_rgba(255,255,255,0.6)]" />
                    </div>
                  </div>
                </AuraCard>

                <div className="grid grid-cols-2 gap-4">
                  <AuraCard icon={Wind} title="Breathe" subtitle={isBreathing ? "Active" : `${activeUsers} active`} activeColor={currentAuraColor}>
                    {!isBreathing ? (
                      <button onClick={startBreathe} className="w-full py-4 mt-8 rounded-2xl bg-white text-black text-[10px] font-black uppercase">BEGIN</button>
                    ) : (
                      <div className="flex gap-2 mt-8">
                        <button onClick={togglePause} className="flex-1 py-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">{isPaused ? <Play size={16} fill="currentColor" /> : <Pause size={16} fill="currentColor" />}</button>
                        <button onClick={stopBreathe} className="flex-1 py-4 rounded-2xl bg-white/5 border border-white/10 text-[9px] font-bold uppercase">End</button>
                      </div>
                    )}
                  </AuraCard>
                  <AuraCard icon={Target} title="Focus" subtitle={intentMode} activeColor={currentAuraColor} onClick={() => setShowIntentMenu(true)} />
                </div>
              </main>
            </motion.div>
          )}

          {activeTab === "mood" && (
            <motion.div key="mood" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="pt-24 pb-32">
              <MoodGraph history={localHistory} />
            </motion.div>
          )}
          
          {activeTab === "profile" && (
            <motion.div key="profile" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-8 pt-24 pb-32 relative">
              <button onClick={handleLogout} className="absolute top-8 right-8 p-2 text-zinc-600"><LogOut size={20} /></button>
              <div className="mb-10 text-center">
                <h2 className="text-xl font-light mb-1">Session History</h2>
                <p className="text-[8px] text-zinc-600 font-black uppercase tracking-[0.2em]">Past Resonance</p>
              </div>

              <div className="space-y-3">
                {localHistory.map((h) => {
                  const sessionDate = new Date(h.createdAt);
                  const intensity = h.intensity;
                  let emotionLabel = "Steady"; let auraColor = "#6366f1";
                  if (intensity < 40) { emotionLabel = "Calm"; auraColor = "#22c55e"; }
                  else if (intensity >= 70) { emotionLabel = "Intense"; auraColor = "#f43f5e"; }

                  return (
                    <div key={h._id} className="p-5 bg-white/[0.02] border border-white/5 rounded-[24px] flex justify-between items-center transition-all hover:bg-white/[0.04]">
                      <div className="flex flex-col gap-1.5">
                        <span className="text-[13px] text-white/80 font-medium">{sessionDate.toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                        <span className="text-[10px] text-zinc-600 uppercase font-bold tracking-tight opacity-60">{sessionDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <span className="text-[14px] font-light text-white">{intensity}%</span>
                          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: auraColor }} />
                        </div>
                        <p className="text-[9px] font-black uppercase tracking-[0.1em] mt-0.5" style={{ color: auraColor }}>{emotionLabel}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <nav className="fixed bottom-0 left-0 w-full z-[100] px-6 pb-8 pt-4">
        <div className="max-w-[340px] mx-auto bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[32px] p-2 flex justify-between">
          {[{ id: "home", icon: HomeIcon }, { id: "mood", icon: BarChart3 }, { id: "profile", icon: User }].map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`relative flex-1 flex flex-col items-center py-3 ${activeTab === tab.id ? "text-white" : "text-zinc-600"}`}>
              {activeTab === tab.id && <motion.div layoutId="nav-active" className="absolute inset-0 bg-white/5 rounded-2xl -z-10" />}
              <tab.icon size={20} />
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}