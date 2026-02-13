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

/* ---------------- 📊 MOOD GRAPH (IMPROVED) ---------------- */
const MoodGraph = ({ history = [] }) => {
  const weekData = useMemo(() => {
    const days = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const dateString = d.toISOString().split("T")[0];
      const dayEntries = Array.isArray(history) 
        ? history.filter(item => (item?.date?.startsWith(dateString) || item?.createdAt?.startsWith(dateString)))
        : [];
      const avgVal = dayEntries.length > 0 
        ? dayEntries.reduce((acc, curr) => acc + (curr.val || curr.intensity || 0), 0) / dayEntries.length 
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
    if (val < 41) return "#22c55e"; 
    if (val < 71) return "#6366f1"; 
    return "#f43f5e"; 
  };

  const getHeight = (val) => {
    const maxVal = 100;
    const minVisualHeight = 8;
    if (val === null) return minVisualHeight;
    // Increased visual scaling by 25%
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

  /* 2️⃣ AUTH GUARD */
  useEffect(() => {
    const token = getToken();
    if (!token) {
      navigate("/login", { replace: true });
    }
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
    if (displayIntensity < 35) return "#22c55e";
    if (displayIntensity < 65) return "#6366f1";
    return "#f43f5e";
  }, [displayIntensity]);

  const triggerDynamicHaptic = (value) => {
    if (!("vibrate" in navigator)) return;
    if (value < 35) navigator.vibrate(8);
    else if (value < 65) navigator.vibrate(15);
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
      transition: {
        opacity: { repeat: Infinity, duration: 4.5, ease: "easeInOut" },
        y: { duration: 1.2, ease: [0.16, 1, 0.3, 1] }
      }
    }
  };

  useEffect(() => {
    const loadSessions = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/session/my`, {
          headers: { Authorization: `Bearer ${getToken()}` }
        });
        const data = await res.json();
        if (Array.isArray(data)) setLocalHistory(data);
      } catch (err) {
        console.error("Failed to fetch sessions", err);
      }
    };
    loadSessions();
  }, [activeTab]);

  useEffect(() => {
    const GLOBAL_VOLUME = 0.3; 
    Object.keys(SOUND_MAP).forEach(key => {
      const audio = new Audio(SOUND_MAP[key]);
      audio.volume = GLOBAL_VOLUME;
      audio.preload = "auto";
      audioRefs.current[key] = audio;
    });
    return () => {
      Object.values(audioRefs.current).forEach(audio => { 
        audio.pause(); audio.currentTime = 0; audio.src = ""; audio.load();
      });
    };
  }, []);

  const playSound = (key, rate = 1.0) => {
    const sound = audioRefs.current[key];
    const now = Date.now();
    if (sound && (!lastPlayedRef.current[key] || now - lastPlayedRef.current[key] > 80)) {
      sound.playbackRate = rate;
      sound.currentTime = 0;
      sound.play().catch(() => {});
      lastPlayedRef.current[key] = now;
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
      timeout = setTimeout(() => {
        setBreathePhase(prev => (prev === "Inhale..." ? "Exhale..." : "Inhale..."));
      }, currentDuration);
    }
    return () => clearTimeout(timeout);
  }, [isBreathing, isPaused, breathePhase, intentConfig]);

  useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = io(BACKEND_URL, { reconnectionAttempts: 5, timeout: 10000, autoConnect: true });
    }
    const socket = socketRef.current;
    
    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => { setIsConnected(false); setSocketStatus("lost"); };
    const onPresence = (data) => setActiveUsers(data.count ?? 0);
    const onSyncStatus = (data) => setSocketStatus(data.status);
    const onBreatheStart = (data) => {
      setIntentMode(data.intentMode || "Steady");
      setIsBreathing(true); setIsPaused(false); setTimer(120); setBreathePhase("Inhale...");
      playSound("breathe");
    };
    const onBreathePause = (pauseState) => { setIsPaused(pauseState); playSound("slider"); };
    const onBreatheStop = () => { setIsBreathing(false); setIsPaused(false); };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("presence:sync", onPresence);
    socket.on("sync:status", onSyncStatus);
    socket.on("breathing:started", onBreatheStart);
    socket.on("breathing:paused", onBreathePause);
    socket.on("breathing:stopped", onBreatheStop);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("presence:sync", onPresence);
      socket.off("sync:status", onSyncStatus);
      socket.off("breathing:started", onBreatheStart);
      socket.off("breathing:paused", onBreathePause);
      socket.off("breathing:stopped", onBreatheStop);
    };
  }, []);

  useEffect(() => {
    if (!isBreathing || !currentSessionId) return;
    const interval = setInterval(async () => {
      try {
        await fetch(`${BACKEND_URL}/api/session/update`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
          body: JSON.stringify({ sessionId: currentSessionId, value: displayIntensity })
        });
      } catch (err) {}
    }, 5000);
    return () => clearInterval(interval);
  }, [displayIntensity, isBreathing, currentSessionId]);

  useEffect(() => {
    let interval = null;
    if (isBreathing && !isPaused && timer > 0) {
      interval = setInterval(() => setTimer(p => p - 1), 1000);
    } else if (timer === 0 && isBreathing) {
      stopBreathe();
    }
    return () => clearInterval(interval);
  }, [isBreathing, isPaused, timer]);

  const startBreathe = async () => {
    const newSessionId = uuidv4();
    setCurrentSessionId(newSessionId);
    try {
      await fetch(`${BACKEND_URL}/api/session/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ sessionId: newSessionId, intensity: displayIntensity })
      });
    } catch (err) {}
    triggerDynamicHaptic(displayIntensity); playSound("breathe");
    setIsBreathing(true); setIsPaused(false); setTimer(120); setBreathePhase("Inhale...");
    if (socketRef.current?.connected) {
      socketRef.current.emit("breathing:start", { intentMode, sessionId: newSessionId });
    }
  };

  const stopBreathe = async () => {
    if (socketRef.current?.connected) socketRef.current.emit("breathing:stop");
    try {
      await fetch(`${BACKEND_URL}/api/session/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ sessionId: currentSessionId, endIntensity: displayIntensity })
      });
    } catch (err) {}
    setCurrentSessionId(null); setShowSummary(true); setIsBreathing(false); setIsPaused(false);
  };

  const closeSummary = () => { setShowSummary(false); setTimer(120); setBreathePhase("Inhale..."); setActiveTab("home"); };

  const togglePause = () => {
    playSound("slider");
    const nextPauseState = !isPaused;
    setIsPaused(nextPauseState);
    if (socketRef.current?.connected) socketRef.current.emit("breathing:pause", nextPauseState);
  };

  const exportResonance = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#050505"; ctx.fillRect(0, 0, 800, 1000);
    const gradient = ctx.createRadialGradient(400, 300, 50, 400, 300, 400);
    gradient.addColorStop(0, currentAuraColor); gradient.addColorStop(1, "transparent");
    ctx.globalAlpha = 0.4; ctx.fillStyle = gradient; ctx.fillRect(0, 0, 800, 1000); ctx.globalAlpha = 1.0;
    ctx.fillStyle = "#FFFFFF"; ctx.font = "bold 40px Arial"; ctx.letterSpacing = "10px"; ctx.textAlign = "center";
    ctx.fillText("BLESSFEED", 400, 100);
    ctx.font = "300 120px Arial"; ctx.fillText(`${displayIntensity}%`, 400, 450);
    ctx.font = "bold 20px Arial"; ctx.fillStyle = "#666666"; ctx.fillText("YOUR REFLECTION", 400, 500);
    ctx.fillStyle = "#FFFFFF"; ctx.font = "300 80px Arial"; ctx.fillText(`${120 - timer}s`, 400, 650);
    const link = document.createElement('a'); link.download = 'reflection.png'; link.href = canvas.toDataURL(); link.click();
    playSound("intent");
  };

  const handleLogout = () => {
    socketRef.current?.disconnect(); localStorage.removeItem("token");
    localStorage.removeItem("user"); navigate("/login", { replace: true });
  };

  return (
    <div className="max-w-[390px] mx-auto min-h-screen bg-black text-white flex flex-col relative overflow-hidden font-sans">
      <style>{`
        input[type="range"]::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 24px; height: 24px; background: transparent; cursor: pointer; }
        input[type="range"]::-moz-range-thumb { width: 24px; height: 24px; background: transparent; border: none; cursor: pointer; }
      `}</style>

      <canvas ref={canvasRef} width="800" height="1000" className="hidden" />
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0 opacity-20"
        style={{ background: `radial-gradient(circle at 50% 0%, ${currentAuraColor} 0%, transparent 70%)` }} />

      <AnimatePresence>
        {showSummary && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[1100] bg-black/80 backdrop-blur-xl flex items-center justify-center p-8">
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
                <div className="space-y-3">
                  <button onClick={exportResonance} className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-black uppercase flex items-center justify-center gap-2"><Download size={14} /> Export</button>
                  <button onClick={closeSummary} className="w-full py-4 rounded-2xl bg-white text-black text-[10px] font-black uppercase">Home</button>
                </div>
              </motion.div>
          </motion.div>
        )}

        {(showSyncInsight || showIntentMenu) && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[1000] bg-black/60 backdrop-blur-md flex items-center justify-center p-8" onClick={() => { setShowSyncInsight(false); setShowIntentMenu(false); }}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-[280px] bg-[#0D0D0D] border border-white/10 rounded-[32px] p-8 text-center" onClick={(e) => e.stopPropagation()}>
              {showSyncInsight ? (
                <>
                  <Activity size={32} className="mx-auto mb-6 text-zinc-500" />
                  <h3 className="text-lg font-light mb-3">Rhythm Sync</h3>
                  <p className="text-zinc-500 text-[13px] leading-relaxed mb-8">{!isConnected ? "Session flowing locally." : "The orb is reflecting your unique rhythm in real-time."}</p>
                  <button onClick={() => setShowSyncInsight(false)} className="text-[10px] font-black uppercase text-white/40">Continue</button>
                </>
              ) : (
                <div className="space-y-2">
                  <Target size={32} className="mx-auto mb-6 text-zinc-500" />
                  {["Steady", "Release", "Focus"].map((mode) => (
                    <button key={mode} onClick={() => { setIntentMode(mode); setShowIntentMenu(false); playSound("intent"); if ("vibrate" in navigator) navigator.vibrate(10); }} className={`w-full py-4 rounded-2xl text-[10px] font-black tracking-widest uppercase transition-all ${intentMode === mode ? "bg-white text-black" : "bg-white/5 text-zinc-500"}`}>{mode}</button>
                  ))}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 relative z-10 overflow-y-auto">
        <AnimatePresence mode="wait">
          {activeTab === "home" && (
            <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pb-32">
              <section className="min-h-[45vh] flex flex-col items-center justify-center px-6 text-center pt-10 pb-2">
                <div className="flex flex-col items-center gap-1.5 w-full mb-8">
                  {isBreathing ? (
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-[11px] font-bold tracking-[0.4em] text-white/30 uppercase">{Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, "0")}</span>
                      <motion.h1 key={breathePhase} initial={{ opacity: 0, filter: "blur(4px)" }} animate={{ opacity: 1, filter: "blur(0px)" }} className="text-[34px] font-light italic text-white tracking-tight">{isPaused ? "Paused" : breathePhase}</motion.h1>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <span className="text-[15px] tracking-[0.6em] text-white/90 uppercase font-semibold mr-[-0.6em] mb-1.5">BLESSFEED</span>
                      <span className="text-[14px] font-light text-white/40">A moment for yourself</span>
                    </div>
                  )}
                </div>
                
                <div className="relative">
                  <AnimatePresence>
                    {isBreathing && isConnected && !isPaused && (
                      <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: [0.1, 0.3, 0.1], scale: [1, 1.2, 1] }} exit={{ opacity: 0 }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} className="absolute inset-0 rounded-full blur-[40px] z-0" style={{ backgroundColor: currentAuraColor }} />
                    )}
                  </AnimatePresence>
                  <motion.div 
                    animate={isBreathing && !isPaused 
                      ? { scale: breathePhase === "Inhale..." ? 1.4 : 1.0, boxShadow: breathePhase === "Inhale..." ? `0 0 100px -10px ${currentAuraColor}` : `0 0 60px -20px ${currentAuraColor}` } 
                      : { y: [0, -4, 0] }
                    } 
                    transition={{ 
                      duration: isBreathing ? (breathePhase === "Inhale..." ? intentConfig.inhaleMs/1000 : intentConfig.exhaleMs/1000) : 6, 
                      ease: isBreathing ? "linear" : "easeInOut", 
                      ...(!isBreathing && intentConfig.physics) 
                    }} 
                    className="w-44 h-44 rounded-full border border-white/10 relative z-10" 
                    style={{ background: `radial-gradient(circle at 50% 50%, ${currentAuraColor} 0%, ${currentAuraColor}cc 40%, transparent 100%)` }}
                  />
                  {!isBreathing && (
                    <motion.p variants={hintVariants} initial="initial" animate="animate" className="absolute -bottom-12 left-1/2 -translate-x-1/2 w-max text-[10px] uppercase tracking-[0.2em] font-bold text-white/90">
                      Tap to begin
                    </motion.p>
                  )}
                </div>
              </section>

              <main className="px-6 space-y-4">
                <AuraCard icon={Activity} title="Rhythm Sync" subtitle={syncStatus} activeColor={currentAuraColor} isSyncIndicator={true} isConnected={isConnected} isBreathing={isBreathing} breathePhase={breathePhase} onClick={() => { playSound("sync", 0.8); setShowSyncInsight(true); if ("vibrate" in navigator) navigator.vibrate(10); }} />

                <AuraCard icon={BarChart3} title="Your Reflection" subtitle={`${displayIntensity}%`} activeColor={currentAuraColor}>
                  <div className="mt-8 mb-4 px-1 relative flex items-center group">
                    <div className="relative w-full h-3 flex items-center">
                      <div className="absolute w-full h-full bg-white/10 rounded-full overflow-hidden">
                        <motion.div initial={false} animate={{ width: `${displayIntensity}%`, backgroundColor: currentAuraColor, boxShadow: `0 0 20px ${currentAuraColor}cc` }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="h-full rounded-full" />
                      </div>
                      <input type="range" min="0" max="100" value={displayIntensity} onChange={(e) => { 
                          const newVal = parseInt(e.target.value); setDisplayIntensity(newVal); 
                          if (newVal % 5 === 0 && !isBreathing) { playSound("resonance", 0.8 + (newVal / 250)); triggerDynamicHaptic(newVal); }
                        }} className="absolute w-full h-6 appearance-none bg-transparent cursor-pointer z-20 outline-none" 
                      />
                      <motion.div pointerEvents="none" initial={false} animate={{ left: `calc(${displayIntensity}% - 10px)` }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="absolute w-[20px] h-[20px] bg-white rounded-full z-10 shadow-[0_0_15px_rgba(255,255,255,0.6)] border-[0.5px] border-black/10" />
                    </div>
                  </div>
                  {!isBreathing && (
                    <motion.p variants={hintVariants} initial="initial" animate="animate" transition={{ delay: 0.2 }} className="text-[8px] uppercase tracking-widest text-white/40 text-center mt-2">Slide to tune</motion.p>
                  )}
                </AuraCard>
                
                <div className="grid grid-cols-2 gap-4">
                  <AuraCard icon={Wind} title="Breathe" subtitle={isBreathing ? "Active" : `${activeUsers} active`} activeColor={currentAuraColor}>
                    {!isBreathing ? (
                        <button onClick={startBreathe} className="w-full py-4 mt-8 rounded-2xl bg-white text-black text-[10px] font-black uppercase active:scale-[0.97] transition-transform">BEGIN</button>
                    ) : (
                      <div className="flex gap-2 mt-8">
                        <button onClick={togglePause} className="flex-1 py-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">{isPaused ? <Play size={16} fill="currentColor" /> : <Pause size={16} fill="currentColor" />}</button>
                        <button onClick={stopBreathe} className="flex-1 py-4 rounded-2xl bg-white/5 border border-white/10 text-[9px] font-bold uppercase">End</button>
                      </div>
                    )}
                  </AuraCard>
                  <AuraCard icon={Target} title="Focus" subtitle={intentMode} activeColor={currentAuraColor} onClick={() => { playSound("slider"); setShowIntentMenu(true); if ("vibrate" in navigator) navigator.vibrate(10); }}>
                      {!isBreathing && (
                        <motion.p variants={hintVariants} initial="initial" animate="animate" transition={{ delay: 0.4 }} className="text-[8px] uppercase tracking-widest text-white/40 text-center mt-auto">Set your path</motion.p>
                      )}
                  </AuraCard>
                </div>
              </main>
            </motion.div>
          )}

          {activeTab === "mood" && (
            <motion.div key="mood" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="pt-24 pb-32">
              <MoodGraph history={localHistory} />
            </motion.div>
          )}
          
          {activeTab === "profile" && (
            <motion.div key="profile" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="px-8 pt-24 pb-32 relative">
              <button onClick={handleLogout} className="absolute top-8 right-8 p-2 text-zinc-600 hover:text-red-400 transition-colors"><LogOut size={20} /></button>
              
              <div className="mb-10 text-center">
                <h2 className="text-xl font-light mb-1">Session History</h2>
                <p className="text-[8px] text-zinc-600 font-black uppercase tracking-[0.2em]">Past Resonance</p>
              </div>

              {/* ---------------- SESSION HISTORY LIST (IMPROVED) ---------------- */}
              <div className="space-y-3">
                {localHistory.length > 0 ? (
                  localHistory.map((h) => {
                    const sessionDate = new Date(h.createdAt || h.date);
                    const intensity = h.intensity || h.val || 0;
                    
                    // Dynamic Emotion Determination
                    let emotionLabel = "Steady";
                    let auraColor = "#6366f1";
                    
                    if (intensity <= 40) {
                      emotionLabel = "Calm";
                      auraColor = "#22c55e";
                    } else if (intensity > 70) {
                      emotionLabel = "Intense";
                      auraColor = "#f43f5e";
                    }

                    return (
                      <div key={h.id || h._id} className="p-5 bg-white/[0.02] border border-white/5 rounded-[24px] flex justify-between items-center group transition-all hover:bg-white/[0.04]">
                        <div className="flex flex-col gap-1.5">
                          <span className="text-[13px] text-white/80 font-medium">
                            {sessionDate.toLocaleDateString([], { month: 'short', day: 'numeric' })}
                          </span>
                          <span className="text-[10px] text-zinc-600 uppercase font-bold tracking-tight opacity-60">
                            {sessionDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <span className="text-[14px] font-light text-white">{intensity}%</span>
                              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: auraColor }} />
                            </div>
                            <p className="text-[9px] font-black uppercase tracking-[0.1em] mt-0.5" style={{ color: auraColor }}>
                              {emotionLabel}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="py-20 text-center">
                    <p className="text-zinc-600 text-[10px] uppercase font-bold tracking-widest">No sessions yet</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <nav className="fixed bottom-0 left-0 w-full z-[100] px-6 pb-8 pt-4">
        <div className="max-w-[340px] mx-auto bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[32px] p-2 flex justify-between items-center">
          {[
            { id: "home", icon: HomeIcon },
            { id: "mood", icon: BarChart3 },
            { id: "profile", icon: User }
          ].map((tab) => (
            <button key={tab.id} onClick={() => { setActiveTab(tab.id); playSound("slider"); }} className={`relative flex-1 flex flex-col items-center py-3 transition-all duration-500 ${activeTab === tab.id ? "text-white scale-110" : "text-zinc-600 hover:text-zinc-400"}`}>
              {activeTab === tab.id && (
                <motion.div layoutId="nav-active" className="absolute inset-0 bg-white/5 rounded-2xl -z-10" transition={{ type: "spring", bounce: 0.2, duration: 0.6 }} />
              )}
              <tab.icon size={20} strokeWidth={activeTab === tab.id ? 2 : 1.5} />
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}