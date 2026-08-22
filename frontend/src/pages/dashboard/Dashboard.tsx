import { Card, Col, Row, Skeleton, Typography, Space, Badge, Button } from "antd";
import { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTokens, useThemeStore } from "@/store/themeStore";
import {
  FireOutlined,
  CarOutlined,
  CheckCircleOutlined,
  TeamOutlined,
  ToolOutlined,
  HomeOutlined,
  CloudOutlined,
  ClockCircleOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  DashboardOutlined,
  ThunderboltOutlined,
  AlertOutlined,
  PictureOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined,
  EnvironmentOutlined,
  SoundOutlined
} from "@ant-design/icons";
import LiveMap from "@/components/map/LiveMap";
import { apiClient } from "@/api/client";
import { getMyTenantSettings } from "@/api/tenant";
import dayjs from "dayjs";
import Marquee from "react-fast-marquee";

const { Text } = Typography;

const containerVariants: any = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } }
};
const itemVariants: any = {
  hidden: { y: 15, opacity: 0 },
  show: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

/* ═══════════════ ALARM SOUND ENGINE (Web Audio API) ═══════════════ */

function createFireAlarm(audioCtx: AudioContext): OscillatorNode[] {
  // Classic two-tone fire siren: alternating between two frequencies
  const osc1 = audioCtx.createOscillator();
  const osc2 = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  gain.gain.value = 0.15;
  gain.connect(audioCtx.destination);

  osc1.type = 'sawtooth';
  osc2.type = 'square';
  osc2.frequency.value = 0; // modulator

  // Create the siren sweep
  const now = audioCtx.currentTime;
  const duration = 2; // 2 second cycle
  for (let i = 0; i < 30; i++) {
    const t = now + i * duration;
    osc1.frequency.setValueAtTime(600, t);
    osc1.frequency.linearRampToValueAtTime(900, t + duration / 2);
    osc1.frequency.linearRampToValueAtTime(600, t + duration);
  }

  osc1.connect(gain);
  osc1.start();
  return [osc1];
}

function createRescueAlarm(audioCtx: AudioContext): OscillatorNode[] {
  // Ambulance-style: rapid three-tone pulse
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  gain.gain.value = 0.12;
  gain.connect(audioCtx.destination);

  osc.type = 'sine';

  const now = audioCtx.currentTime;
  const cycleDuration = 1.5;
  for (let i = 0; i < 40; i++) {
    const t = now + i * cycleDuration;
    // Three quick beeps then pause
    osc.frequency.setValueAtTime(700, t);
    gain.gain.setValueAtTime(0.12, t);
    gain.gain.setValueAtTime(0, t + 0.15);
    osc.frequency.setValueAtTime(900, t + 0.25);
    gain.gain.setValueAtTime(0.12, t + 0.25);
    gain.gain.setValueAtTime(0, t + 0.4);
    osc.frequency.setValueAtTime(1100, t + 0.5);
    gain.gain.setValueAtTime(0.12, t + 0.5);
    gain.gain.setValueAtTime(0, t + 0.65);
    // silence for the rest
    gain.gain.setValueAtTime(0, t + 0.65);
    gain.gain.setValueAtTime(0, t + cycleDuration);
  }

  osc.connect(gain);
  osc.start();
  return [osc];
}

/* ═══════════════ CSS ANIMATIONS ═══════════════ */
const DASHBOARD_CSS = `
  @keyframes ember-float {
    0%   { transform: translateY(0) scale(1); opacity: 0.6; }
    50%  { transform: translateY(-50px) scale(1.2); opacity: 1; }
    100% { transform: translateY(-100px) scale(0.4); opacity: 0; }
  }
  @keyframes glow-fire {
    0%   { box-shadow: 0 0 6px rgba(239,68,68,0.25), inset 0 0 6px rgba(239,68,68,0.04); }
    50%  { box-shadow: 0 0 20px rgba(239,68,68,0.55), inset 0 0 12px rgba(239,68,68,0.08); }
    100% { box-shadow: 0 0 6px rgba(239,68,68,0.25), inset 0 0 6px rgba(239,68,68,0.04); }
  }
  @keyframes glow-blue {
    0%   { box-shadow: 0 0 6px rgba(59,130,246,0.25); }
    50%  { box-shadow: 0 0 20px rgba(59,130,246,0.55); }
    100% { box-shadow: 0 0 6px rgba(59,130,246,0.25); }
  }
  @keyframes glow-green {
    0%   { box-shadow: 0 0 4px rgba(16,185,129,0.25); }
    50%  { box-shadow: 0 0 16px rgba(16,185,129,0.5); }
    100% { box-shadow: 0 0 4px rgba(16,185,129,0.25); }
  }
  @keyframes radar-sweep {
    0%   { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  @keyframes live-dot {
    0%   { opacity: 1; transform: scale(1); }
    50%  { opacity: 0.3; transform: scale(0.6); }
    100% { opacity: 1; transform: scale(1); }
  }
  @keyframes scan-line {
    0%   { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
  @keyframes num-glow {
    0%   { text-shadow: 0 0 4px rgba(255,255,255,0.1); }
    50%  { text-shadow: 0 0 14px rgba(255,255,255,0.35); }
    100% { text-shadow: 0 0 4px rgba(255,255,255,0.1); }
  }
  @keyframes emergency-edge {
    0%   { box-shadow: inset 0 0 0 0 rgba(239,68,68,0); }
    50%  { box-shadow: inset 0 0 60px 10px rgba(239,68,68,0.45); }
    100% { box-shadow: inset 0 0 0 0 rgba(239,68,68,0); }
  }
  @keyframes feed-slide {
    0%   { opacity: 0; transform: translateX(20px); }
    100% { opacity: 1; transform: translateX(0); }
  }

  /* ─── FIRE EMERGENCY OVERLAY ─── */
  @keyframes fire-border-flash {
    0%   { border-color: rgba(239,68,68,0.2); box-shadow: inset 0 0 30px rgba(239,68,68,0), 0 0 15px rgba(239,68,68,0.2); }
    50%  { border-color: rgba(239,68,68,1); box-shadow: inset 0 0 80px rgba(239,68,68,0.3), 0 0 40px rgba(239,68,68,0.6); }
    100% { border-color: rgba(239,68,68,0.2); box-shadow: inset 0 0 30px rgba(239,68,68,0), 0 0 15px rgba(239,68,68,0.2); }
  }
  @keyframes fire-large-ember {
    0%   { transform: translateY(0) scale(1) rotate(0deg); opacity: 0.8; }
    40%  { transform: translateY(-120px) scale(1.5) rotate(45deg); opacity: 1; }
    100% { transform: translateY(-250px) scale(0.3) rotate(90deg); opacity: 0; }
  }
  @keyframes fire-icon-throb {
    0%   { transform: scale(1); filter: brightness(1); }
    50%  { transform: scale(1.3); filter: brightness(1.5); }
    100% { transform: scale(1); filter: brightness(1); }
  }

  /* ─── RESCUE EMERGENCY OVERLAY ─── */
  @keyframes rescue-strobe {
    0%   { border-color: rgba(59,130,246,0.2); box-shadow: inset 0 0 20px rgba(59,130,246,0), 0 0 10px rgba(59,130,246,0.2); }
    25%  { border-color: rgba(59,130,246,1); box-shadow: inset 0 0 60px rgba(59,130,246,0.25), 0 0 30px rgba(59,130,246,0.5); }
    50%  { border-color: rgba(239,68,68,0.2); box-shadow: inset 0 0 60px rgba(239,68,68,0.2), 0 0 30px rgba(239,68,68,0.4); }
    75%  { border-color: rgba(59,130,246,1); box-shadow: inset 0 0 60px rgba(59,130,246,0.25), 0 0 30px rgba(59,130,246,0.5); }
    100% { border-color: rgba(59,130,246,0.2); box-shadow: inset 0 0 20px rgba(59,130,246,0), 0 0 10px rgba(59,130,246,0.2); }
  }
  @keyframes rescue-rotate {
    0%   { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .kpi-fire  { animation: glow-fire 3s ease-in-out infinite; }
  .kpi-blue  { animation: glow-blue 3s ease-in-out infinite; }
  .kpi-green { animation: glow-green 3s ease-in-out infinite; }
  .num-glow  { animation: num-glow 2.5s ease-in-out infinite; }
  .dot-live  { animation: live-dot 1s ease-in-out infinite; }
  .scan-bar  { background: linear-gradient(90deg, transparent 0%, rgba(239,68,68,0.12) 50%, transparent 100%); background-size: 200% 100%; animation: scan-line 4s linear infinite; }
  .feed-item { animation: feed-slide 0.4s ease-out; }

  .alert-overlay-fire {
    animation: fire-border-flash 1.5s ease-in-out infinite;
    border: 3px solid rgba(239,68,68,0.5);
  }
  .alert-overlay-rescue {
    animation: rescue-strobe 1.2s ease-in-out infinite;
    border: 3px solid rgba(59,130,246,0.5);
  }
  .fire-ember-large {
    animation: fire-large-ember 2.5s ease-out infinite;
  }
  .fire-icon-pulse {
    animation: fire-icon-throb 0.8s ease-in-out infinite;
  }
  .rescue-beacon {
    animation: rescue-rotate 2s linear infinite;
  }
`;

function Ember({ delay, left }: { delay: number; left: string }) {
  return (
    <div style={{
      position: 'absolute', bottom: 0, left,
      width: 3, height: 3, borderRadius: '50%',
      background: 'radial-gradient(circle, #ff6b35, #ef4444)',
      animation: `ember-float ${2 + Math.random() * 2}s ease-out infinite`,
      animationDelay: `${delay}s`,
      pointerEvents: 'none', zIndex: 0, opacity: 0.6
    }} />
  );
}

/* ─── Large floating fire particles for emergency ─── */
function FireParticle({ i }: { i: number }) {
  return (
    <div className="fire-ember-large" style={{
      position: 'absolute',
      bottom: `${Math.random() * 20}%`,
      left: `${10 + i * 12}%`,
      width: 6 + Math.random() * 8,
      height: 6 + Math.random() * 8,
      borderRadius: '50%',
      background: `radial-gradient(circle, ${Math.random() > 0.5 ? '#ff4500' : '#ff6b35'}, rgba(239,68,68,0.3))`,
      animationDelay: `${i * 0.4}s`,
      pointerEvents: 'none',
      zIndex: 9999,
      filter: 'blur(1px)'
    }} />
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hasEmergency, setHasEmergency] = useState(false);
  const [clockBlink, setClockBlink] = useState(false);
  const [recentIncidents, setRecentIncidents] = useState<any[]>([]);
  const [pendingFire, setPendingFire] = useState<any[]>([]);
  const [pendingRescue, setPendingRescue] = useState<any[]>([]);
  const [alarmMuted, setAlarmMuted] = useState(false);
  const { isSidebarHidden } = useThemeStore();
  const tokens = useTokens();

  const audioCtxRef = useRef<AudioContext | null>(null);
  const activeOscRef = useRef<OscillatorNode[]>([]);
  const knownIdsRef = useRef<Set<string>>(new Set());
  const alarmMutedRef = useRef(false);

  // Keep ref in sync
  useEffect(() => { alarmMutedRef.current = alarmMuted; }, [alarmMuted]);

  /* ── Stop all alarm sounds ── */
  const stopAlarms = useCallback(() => {
    activeOscRef.current.forEach(o => { try { o.stop(); } catch {} });
    activeOscRef.current = [];
  }, []);

  /* ── Play alarm based on type ── */
  const playAlarm = useCallback((type: 'fire' | 'rescue') => {
    if (alarmMutedRef.current) return;
    stopAlarms();
    if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
      audioCtxRef.current = new AudioContext();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    const ctx = audioCtxRef.current;
    const oscs = type === 'fire' ? createFireAlarm(ctx) : createRescueAlarm(ctx);
    activeOscRef.current = oscs;
  }, [stopAlarms]);

  /* ── Fullscreen ── */
  useEffect(() => {
    const h = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", h);
    return () => document.removeEventListener("fullscreenchange", h);
  }, []);

  /* ── Clock ── */
  useEffect(() => {
    const t = setInterval(() => { setCurrentTime(new Date()); setClockBlink(p => !p); }, 1000);
    return () => clearInterval(t);
  }, []);

  /* ── CSS injection ── */
  useEffect(() => {
    const s = document.createElement('style');
    s.innerHTML = DASHBOARD_CSS;
    document.head.appendChild(s);
    return () => { document.head.removeChild(s); };
  }, []);

  /* ── Cleanup audio on unmount ── */
  useEffect(() => {
    return () => {
      stopAlarms();
      if (audioCtxRef.current) {
        try { audioCtxRef.current.close(); } catch {}
      }
    };
  }, [stopAlarms]);

  /* ─── DATA FETCH with polling every 10s ─── */
  const fetchAllStats = useCallback(async () => {
    try {
      const [incidentsRes, armadaRes, relawanRes, poskoRes, settingsRes] = await Promise.all([
        apiClient.get("/insiden/?limit=1000").catch(() => ({ data: [] })),
        apiClient.get("/armada").catch(() => ({ data: [] })),
        apiClient.get("/relawan/relawan").catch(() => ({ data: [] })),
        apiClient.get("/stations").catch(() => ({ data: [] })),
        getMyTenantSettings().catch(() => null)
      ]);

      const incidents = incidentsRes.data || [];
      const now = dayjs();
      const startOfThisMonth = now.startOf('month');
      const startOfLastMonth = now.subtract(1, 'month').startOf('month');
      const endOfLastMonth = now.subtract(1, 'month').endOf('month');
      const startOfThisYear = now.startOf('year');

      const kebakaranThisMonth = incidents.filter((i: any) => i.jenis_insiden === 'pemadaman' && dayjs(i.waktu_lapor).isAfter(startOfThisMonth)).length;
      const kebakaranLastMonth = incidents.filter((i: any) => i.jenis_insiden === 'pemadaman' && dayjs(i.waktu_lapor).isAfter(startOfLastMonth) && dayjs(i.waktu_lapor).isBefore(endOfLastMonth)).length;
      const kebakaranHariIni = incidents.filter((i: any) => i.jenis_insiden === 'pemadaman' && dayjs(i.waktu_lapor).isAfter(dayjs().startOf('day'))).length;
      const kebakaranThisYear = incidents.filter((i: any) => i.jenis_insiden === 'pemadaman' && dayjs(i.waktu_lapor).isAfter(startOfThisYear)).length;
      let kebakaranTrend = 0;
      if (kebakaranLastMonth > 0) kebakaranTrend = ((kebakaranThisMonth - kebakaranLastMonth) / kebakaranLastMonth) * 100;

      const penyelamatanThisMonth = incidents.filter((r: any) => r.jenis_insiden === 'penyelamatan' && dayjs(r.waktu_lapor).isAfter(startOfThisMonth)).length;
      const penyelamatanLastMonth = incidents.filter((r: any) => r.jenis_insiden === 'penyelamatan' && dayjs(r.waktu_lapor).isAfter(startOfLastMonth) && dayjs(r.waktu_lapor).isBefore(endOfLastMonth)).length;
      const penyelamatanHariIni = incidents.filter((r: any) => r.jenis_insiden === 'penyelamatan' && dayjs(r.waktu_lapor).isAfter(dayjs().startOf('day'))).length;
      const penyelamatanThisYear = incidents.filter((i: any) => i.jenis_insiden === 'penyelamatan' && dayjs(i.waktu_lapor).isAfter(startOfThisYear)).length;
      let penyelamatanTrend = 0;
      if (penyelamatanLastMonth > 0) penyelamatanTrend = ((penyelamatanThisMonth - penyelamatanLastMonth) / penyelamatanLastMonth) * 100;

      const validRI = incidents.filter((i: any) => dayjs(i.waktu_lapor).isAfter(startOfThisMonth) && i.waktu_lapor && i.waktu_tiba);
      let totalRM = 0;
      validRI.forEach((i: any) => { totalRM += dayjs(i.waktu_tiba).diff(dayjs(i.waktu_lapor), 'minute'); });
      const avgResponseTime = validRI.length > 0 ? (totalRM / validRI.length).toFixed(1) : 0;

      const armada = armadaRes.data || [];
      const armadaReady = armada.filter((a: any) => a.status_operasional?.toLowerCase() === 'beroperasi' || a.status_operasional?.toLowerCase() === 'ready').length;
      const armadaPemeliharaan = armada.filter((a: any) => a.status_operasional?.toLowerCase() === 'pemeliharaan').length;
      const totalPosko = (poskoRes.data || []).length;
      const totalRelawan = (relawanRes.data || []).length;
      const dashboardSettings = settingsRes || {};

      // Recent feed
      const sorted = [...incidents].sort((a: any, b: any) => dayjs(b.waktu_lapor).unix() - dayjs(a.waktu_lapor).unix());
      setRecentIncidents(sorted.slice(0, 8));

      // Detect pending (menunggu) incidents that haven't been dispatched
      const firePending = incidents.filter((i: any) => i.status === 'menunggu' && i.jenis_insiden === 'pemadaman');
      const rescuePending = incidents.filter((i: any) => i.status === 'menunggu' && i.jenis_insiden === 'penyelamatan');
      setPendingFire(firePending);
      setPendingRescue(rescuePending);

      // Check for NEW incidents (not seen before) → trigger alarm
      const allPendingIds = [...firePending, ...rescuePending].map((i: any) => i.id);
      const newIds = allPendingIds.filter(id => !knownIdsRef.current.has(id));

      if (newIds.length > 0) {
        // Determine which type to alarm (fire takes priority)
        const hasNewFire = firePending.some((i: any) => newIds.includes(i.id));
        playAlarm(hasNewFire ? 'fire' : 'rescue');
      }

      // Update known IDs
      knownIdsRef.current = new Set(allPendingIds);

      // If no more pending → stop alarms
      if (firePending.length === 0 && rescuePending.length === 0) {
        stopAlarms();
      }

      setStats({ kebakaranHariIni, kebakaranThisMonth, kebakaranThisYear, kebakaranTrend, penyelamatanHariIni, penyelamatanThisMonth, penyelamatanThisYear, penyelamatanTrend, avgResponseTime, armadaReady, armadaPemeliharaan, totalPosko, totalRelawan, dashboardSettings });
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }, [playAlarm, stopAlarms]);

  useEffect(() => {
    fetchAllStats();
    // Poll every 10 seconds to detect new incidents
    const interval = setInterval(fetchAllStats, 10000);
    return () => clearInterval(interval);
  }, [fetchAllStats]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(() => {});
    else document.exitFullscreen?.();
  };

  const handleMuteToggle = () => {
    if (!alarmMuted) {
      stopAlarms();
      setAlarmMuted(true);
    } else {
      setAlarmMuted(false);
      // Re-trigger if there are still pending
      if (pendingFire.length > 0) playAlarm('fire');
      else if (pendingRescue.length > 0) playAlarm('rescue');
    }
  };

  if (loading || !stats) return (
    <div style={{ padding: 24, display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
      <Skeleton active paragraph={{ rows: 10 }} />
    </div>
  );

  const hasFireAlert = pendingFire.length > 0;
  const hasRescueAlert = pendingRescue.length > 0;
  const hasAnyAlert = hasFireAlert || hasRescueAlert;

  // Choose overlay class
  let overlayClass = '';
  if (hasFireAlert) overlayClass = 'alert-overlay-fire';
  else if (hasRescueAlert) overlayClass = 'alert-overlay-rescue';

  const TrendTag = ({ value }: { value: number }) => (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 11, fontWeight: 700, color: value > 0 ? '#ef4444' : value < 0 ? '#10b981' : tokens.textMuted }}>
      {value > 0 ? <ArrowUpOutlined /> : value < 0 ? <ArrowDownOutlined /> : null}
      {Math.abs(value).toFixed(0)}% <span style={{ color: tokens.textMuted, fontWeight: 400 }}>vs bln lalu</span>
    </span>
  );

  const statusColor = (s: string) => {
    if (s === 'menunggu') return '#ef4444';
    if (s === 'berangkat') return '#3b82f6';
    if (s === 'penanganan') return '#f59e0b';
    if (s === 'selesai') return '#10b981';
    return tokens.textMuted;
  };

  return (
    <>
      <motion.div
        variants={containerVariants} initial="hidden" animate="show"
        className={overlayClass}
        style={{
          display: "flex", flexDirection: "column", gap: 10,
          height: isFullscreen ? '100vh' : 'calc(100vh - 100px)',
          overflow: 'hidden', position: 'relative',
          paddingBottom: 36,
          borderRadius: 12,
          transition: 'border-color 0.3s, box-shadow 0.3s'
        }}
      >
        {/* Ember particles (background) */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0 }}>
          {[...Array(10)].map((_, i) => <Ember key={i} delay={i * 0.9} left={`${5 + i * 9}%`} />)}
        </div>

        {/* ═══ FIRE EMERGENCY: Large floating fire particles ═══ */}
        <AnimatePresence>
          {hasFireAlert && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 2, overflow: 'hidden' }}
            >
              {[...Array(8)].map((_, i) => <FireParticle key={i} i={i} />)}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ═══ RESCUE EMERGENCY: Blue/red rotating beacons ═══ */}
        <AnimatePresence>
          {hasRescueAlert && !hasFireAlert && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 2, overflow: 'hidden' }}
            >
              {/* Rotating beacon lights in corners */}
              {[
                { top: 10, left: 10 },
                { top: 10, right: 10 },
                { bottom: 50, left: 10 },
                { bottom: 50, right: 10 },
              ].map((pos, i) => (
                <div key={i} className="rescue-beacon" style={{
                  position: 'absolute', ...pos,
                  width: 40, height: 40, borderRadius: '50%',
                  background: `conic-gradient(from 0deg, ${i % 2 === 0 ? 'rgba(59,130,246,0.5)' : 'rgba(239,68,68,0.5)'}, transparent 30%, transparent 70%, ${i % 2 === 0 ? 'rgba(59,130,246,0.5)' : 'rgba(239,68,68,0.5)'})`,
                  animationDelay: `${i * 0.3}s`,
                  filter: 'blur(4px)'
                }} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ═══ ALERT BANNER (shown when any incident is pending) ═══ */}
        <AnimatePresence>
          {hasAnyAlert && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              style={{
                background: hasFireAlert
                  ? 'linear-gradient(90deg, rgba(239,68,68,0.2), rgba(239,68,68,0.05), rgba(239,68,68,0.2))'
                  : 'linear-gradient(90deg, rgba(59,130,246,0.2), rgba(59,130,246,0.05), rgba(59,130,246,0.2))',
                borderRadius: 12, padding: '8px 16px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
                zIndex: 10, flexShrink: 0,
                border: hasFireAlert ? '1px solid rgba(239,68,68,0.4)' : '1px solid rgba(59,130,246,0.4)',
                overflow: 'hidden'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div className={hasFireAlert ? 'fire-icon-pulse' : ''} style={{ fontSize: 28 }}>
                  {hasFireAlert ? <FireOutlined style={{ color: '#ef4444' }} /> : <CarOutlined style={{ color: '#3b82f6' }} />}
                </div>
                <div>
                  <Text style={{ color: '#fff', fontWeight: 800, fontSize: 14 }}>
                    {hasFireAlert
                      ? `🔥 ${pendingFire.length} LAPORAN KEBAKARAN MENUNGGU DISPATCH!`
                      : `🚑 ${pendingRescue.length} OPERASI PENYELAMATAN MENUNGGU DISPATCH!`}
                  </Text>
                  <div style={{ color: hasFireAlert ? '#fca5a5' : '#93c5fd', fontSize: 11 }}>
                    {hasFireAlert
                      ? pendingFire.map((i: any) => i.alamat || i.objek).join(' • ')
                      : pendingRescue.map((i: any) => i.alamat || i.objek).join(' • ')}
                  </div>
                </div>
              </div>
              <Button
                type="text"
                icon={<SoundOutlined />}
                onClick={handleMuteToggle}
                style={{
                  color: alarmMuted ? tokens.textMuted : '#fff',
                  background: alarmMuted ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.1)',
                  borderRadius: 8, fontWeight: 700, fontSize: 12
                }}
              >
                {alarmMuted ? 'UNMUTE' : 'MUTE'}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ═══ ROW 1: HEADER ═══ */}
        <motion.div variants={itemVariants} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8, zIndex: 3, flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: `linear-gradient(135deg, ${tokens.primary}, #ef4444)`,
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: `0 4px 16px ${tokens.primary}60`, position: 'relative', overflow: 'hidden'
            }}>
              <DashboardOutlined style={{ fontSize: 22, color: "#fff", zIndex: 1 }} />
              <div style={{ position: 'absolute', width: '100%', height: '100%', background: 'conic-gradient(from 0deg, transparent 0%, transparent 70%, rgba(255,255,255,0.12) 100%)', animation: 'radar-sweep 3s linear infinite' }} />
            </div>
            <div>
              <h2 style={{ margin: 0, color: tokens.textPrimary, fontSize: 22, fontWeight: 800, letterSpacing: "-0.5px", lineHeight: 1.1 }}>COMMAND CENTER</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div className="dot-live" style={{ width: 7, height: 7, borderRadius: '50%', background: hasAnyAlert ? '#ef4444' : '#10b981' }} />
                <Text style={{ color: hasAnyAlert ? '#ef4444' : '#10b981', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>
                  {hasAnyAlert ? 'DARURAT — DISPATCH DIPERLUKAN' : 'SIAGA OPERASI'}
                </Text>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 14, background: 'rgba(10,10,10,0.6)', backdropFilter: 'blur(12px)', padding: '8px 16px', borderRadius: 12, border: `1px solid ${tokens.border}`, position: 'relative', overflow: 'hidden' }}>
            <div className="scan-bar" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} />
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1 }}>
              <Text style={{ fontSize: 9, color: tokens.textMuted, fontWeight: 700, textTransform: 'uppercase' }}>WAKTU</Text>
              <Text style={{ fontSize: 20, fontWeight: 800, color: tokens.textPrimary, fontFamily: 'monospace', letterSpacing: '2px' }}>
                {dayjs(currentTime).format('HH')}<span style={{ opacity: clockBlink ? 1 : 0.2, transition: 'opacity 0.3s' }}>:</span>{dayjs(currentTime).format('mm')}<span style={{ opacity: clockBlink ? 1 : 0.2, transition: 'opacity 0.3s' }}>:</span>{dayjs(currentTime).format('ss')}
              </Text>
              <Text style={{ fontSize: 10, color: tokens.primary, fontWeight: 600 }}>{dayjs(currentTime).format('DD MMM YYYY')}</Text>
            </div>
            <div style={{ width: 1, height: 32, background: tokens.border, zIndex: 1 }} />
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1 }}>
              <Text style={{ fontSize: 9, color: tokens.textMuted, fontWeight: 700, textTransform: 'uppercase' }}>CUACA</Text>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <CloudOutlined style={{ color: tokens.info, fontSize: 14 }} />
                <Text style={{ fontSize: 14, fontWeight: 700, color: tokens.textPrimary }}>28°C</Text>
              </div>
              <Text style={{ fontSize: 10, color: tokens.success, fontWeight: 600 }}>Aman</Text>
            </div>
            <div style={{ width: 1, height: 32, background: tokens.border, zIndex: 1 }} />
            <Button type="text" icon={isFullscreen ? <FullscreenExitOutlined style={{ fontSize: 16, color: tokens.textPrimary }} /> : <FullscreenOutlined style={{ fontSize: 16, color: tokens.textPrimary }} />} onClick={toggleFullscreen} style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.05)', zIndex: 1 }} />
          </div>
        </motion.div>

        {/* ═══ ROW 2: KPI + Mini KPI ═══ */}
        <div style={{ display: 'flex', gap: 10, zIndex: 3, flexShrink: 0, flexWrap: 'wrap' }}>
          {/* 🔥 Kebakaran */}
          <motion.div variants={itemVariants} whileHover={{ y: -3 }} style={{ flex: '1 1 220px', minWidth: 200 }}>
            <Card className="kpi-fire" bordered={false} style={{ border: '1px solid rgba(239,68,68,0.35)', borderRadius: 16, background: 'linear-gradient(135deg, rgba(239,68,68,0.1) 0%, rgba(12,12,12,0.7) 100%)', backdropFilter: 'blur(14px)', position: 'relative', overflow: 'hidden', padding: 0 }} styles={{ body: { padding: '14px 16px' } }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ color: tokens.textMuted, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px' }}>🔥 Kebakaran</div>
                  <div className="num-glow" style={{ color: tokens.textPrimary, fontWeight: 900, fontSize: 38, lineHeight: 1, marginTop: 2 }}>{stats.kebakaranThisMonth}</div>
                  <div style={{ color: tokens.textMuted, fontSize: 10 }}>bulan ini</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3 }}>
                  <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ repeat: Infinity, duration: 1.5 }} style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(239,68,68,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FireOutlined style={{ fontSize: 18, color: '#ef4444' }} />
                  </motion.div>
                  <Badge count={`Hari ini: ${stats.kebakaranHariIni}`} style={{ backgroundColor: '#ef4444', fontSize: 9, fontWeight: 700 }} />
                  <Badge count={`Thn ini: ${stats.kebakaranThisYear}`} style={{ backgroundColor: '#991b1b', fontSize: 9, fontWeight: 700 }} />
                </div>
              </div>
              <div style={{ marginTop: 4 }}><TrendTag value={stats.kebakaranTrend} /></div>
            </Card>
          </motion.div>

          {/* 🚑 Penyelamatan */}
          <motion.div variants={itemVariants} whileHover={{ y: -3 }} style={{ flex: '1 1 220px', minWidth: 200 }}>
            <Card className="kpi-blue" bordered={false} style={{ border: '1px solid rgba(59,130,246,0.35)', borderRadius: 16, background: 'linear-gradient(135deg, rgba(59,130,246,0.1) 0%, rgba(12,12,12,0.7) 100%)', backdropFilter: 'blur(14px)', position: 'relative', overflow: 'hidden', padding: 0 }} styles={{ body: { padding: '14px 16px' } }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ color: tokens.textMuted, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px' }}>🚑 Penyelamatan</div>
                  <div className="num-glow" style={{ color: tokens.textPrimary, fontWeight: 900, fontSize: 38, lineHeight: 1, marginTop: 2 }}>{stats.penyelamatanThisMonth}</div>
                  <div style={{ color: tokens.textMuted, fontSize: 10 }}>bulan ini</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3 }}>
                  <motion.div animate={{ rotate: [0, -8, 8, 0] }} transition={{ repeat: Infinity, duration: 2 }} style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(59,130,246,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CarOutlined style={{ fontSize: 18, color: '#3b82f6' }} />
                  </motion.div>
                  <Badge count={`Hari ini: ${stats.penyelamatanHariIni}`} style={{ backgroundColor: '#3b82f6', fontSize: 9, fontWeight: 700 }} />
                  <Badge count={`Thn ini: ${stats.penyelamatanThisYear}`} style={{ backgroundColor: '#1e40af', fontSize: 9, fontWeight: 700 }} />
                </div>
              </div>
              <div style={{ marginTop: 4 }}><TrendTag value={stats.penyelamatanTrend} /></div>
            </Card>
          </motion.div>

          {/* ⚡ Response Time */}
          <motion.div variants={itemVariants} whileHover={{ y: -3 }} style={{ flex: '1 1 220px', minWidth: 200 }}>
            <Card className="kpi-green" bordered={false} style={{ border: '1px solid rgba(16,185,129,0.4)', borderRadius: 16, background: 'linear-gradient(135deg, rgba(16,185,129,0.12) 0%, rgba(12,12,12,0.8) 100%)', backdropFilter: 'blur(14px)', padding: 0 }} styles={{ body: { padding: '14px 16px' } }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ color: '#10b981', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px' }}>⚡ Response Time</div>
                  <div className="num-glow" style={{ color: tokens.textPrimary, fontWeight: 900, fontSize: 38, lineHeight: 1, marginTop: 2, display: 'flex', alignItems: 'baseline', gap: 6 }}>
                    <ThunderboltOutlined style={{ color: '#10b981', fontSize: 22 }} />
                    {stats.avgResponseTime}
                    <span style={{ fontSize: 14, fontWeight: 600, color: tokens.textMuted }}>mnt</span>
                  </div>
                  <div style={{ color: tokens.textMuted, fontSize: 10 }}>rata-rata bulan ini</div>
                </div>
                <div style={{ fontSize: 10, color: Number(stats.avgResponseTime) <= 15 ? '#10b981' : '#ef4444', fontWeight: 700, padding: '3px 8px', borderRadius: 6, background: Number(stats.avgResponseTime) <= 15 ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)', alignSelf: 'flex-start' }}>
                  {Number(stats.avgResponseTime) <= 15 ? '✓ OK' : '✗ OVER'}
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Mini KPIs */}
          {[
            { label: "Armada Siaga", val: stats.armadaReady, icon: <CheckCircleOutlined style={{ color: '#10b981', fontSize: 16 }} />, bg: 'rgba(16,185,129,0.12)' },
            { label: "Pemeliharaan", val: stats.armadaPemeliharaan, icon: <ToolOutlined style={{ color: '#f59e0b', fontSize: 16 }} />, bg: 'rgba(245,158,11,0.12)' },
            { label: "Posko", val: stats.totalPosko, icon: <HomeOutlined style={{ color: '#3b82f6', fontSize: 16 }} />, bg: 'rgba(59,130,246,0.12)' },
            { label: "Relawan", val: stats.totalRelawan, icon: <TeamOutlined style={{ color: '#8b5cf6', fontSize: 16 }} />, bg: 'rgba(139,92,246,0.12)' },
          ].map((m, i) => (
            <motion.div key={i} variants={itemVariants} whileHover={{ y: -2 }} style={{ flex: '1 1 100px', minWidth: 90 }}>
              <Card bordered={false} style={{ border: `1px solid ${tokens.border}`, borderRadius: 14, background: 'rgba(12,12,12,0.5)', padding: 0 }} styles={{ body: { padding: '12px 14px' } }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ background: m.bg, padding: 8, borderRadius: 8, display: 'flex' }}>{m.icon}</div>
                  <div>
                    <div style={{ color: tokens.textMuted, fontSize: 9, fontWeight: 700, textTransform: 'uppercase' }}>{m.label}</div>
                    <div style={{ color: tokens.textPrimary, fontWeight: 800, fontSize: 20, lineHeight: 1 }}>{m.val}</div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* ═══ ROW 3: MAP + SIDEBAR (fills remaining) ═══ */}
        <div style={{ display: 'flex', gap: 12, flex: 1, minHeight: 0, zIndex: 3 }}>
          <motion.div variants={itemVariants} style={{ flex: '1 1 65%', minWidth: 0, minHeight: 0 }}>
            <div style={{ height: '100%', borderRadius: 14, overflow: 'hidden' }}>
              <LiveMap onEmergencyChange={setHasEmergency} />
            </div>
          </motion.div>

          <motion.div variants={itemVariants} style={{ flex: '0 0 30%', maxWidth: 360, display: 'flex', flexDirection: 'column', gap: 10, minHeight: 0 }}>
            {/* Video CCTV */}
            <Card bordered={false} style={{ border: `1px solid ${tokens.border}`, borderRadius: 14, background: 'rgba(12,12,12,0.6)', flex: '0 0 auto', overflow: 'hidden' }} styles={{ body: { padding: 5 } }}>
              <div style={{ width: '100%', aspectRatio: '16/9', borderRadius: 10, overflow: 'hidden', background: '#000', position: 'relative' }}>
                <iframe
                  width="100%" height="100%"
                  src={(stats.dashboardSettings?.dashboard_video_url || "https://www.youtube.com/embed/jfKfPfyJRdk?autoplay=1&mute=1").replace('watch?v=', 'embed/').replace('youtu.be/', 'www.youtube.com/embed/')}
                  title="CCTV" frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
                />
                <div style={{ position: 'absolute', top: 5, left: 5, background: 'rgba(239,68,68,0.9)', color: '#fff', padding: '1px 7px', borderRadius: 4, fontSize: 9, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 3, zIndex: 2 }}>
                  <div className="dot-live" style={{ width: 5, height: 5, borderRadius: '50%', background: '#fff' }} /> LIVE
                </div>
              </div>
            </Card>

            {/* Live Incident Feed */}
            <Card bordered={false} style={{ border: '1px solid rgba(239,68,68,0.2)', borderRadius: 14, background: 'rgba(12,12,12,0.6)', flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }} styles={{ body: { padding: 0, display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 } }}>
              <div style={{ padding: '8px 12px', borderBottom: `1px solid ${tokens.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div className="dot-live" style={{ width: 6, height: 6, borderRadius: '50%', background: '#ef4444' }} />
                  <Text style={{ fontSize: 11, fontWeight: 800, color: tokens.textPrimary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Feed Insiden Terkini</Text>
                </div>
                <Text style={{ fontSize: 10, color: tokens.textMuted }}>{recentIncidents.length} terbaru</Text>
              </div>
              <div style={{ flex: 1, overflowY: 'auto', padding: '4px 0' }}>
                {recentIncidents.map((inc: any, idx: number) => (
                  <div key={inc.id || idx} className="feed-item" style={{
                    padding: '6px 12px', borderBottom: `1px solid rgba(255,255,255,0.03)`,
                    display: 'flex', alignItems: 'center', gap: 8,
                    background: inc.status === 'menunggu' ? 'rgba(239,68,68,0.06)' : 'transparent',
                  }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                      background: inc.jenis_insiden === 'pemadaman' ? 'rgba(239,68,68,0.15)' : 'rgba(59,130,246,0.15)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      {inc.jenis_insiden === 'pemadaman'
                        ? <FireOutlined style={{ fontSize: 13, color: '#ef4444' }} />
                        : <CarOutlined style={{ fontSize: 13, color: '#3b82f6' }} />}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <Text style={{ fontSize: 11, fontWeight: 700, color: tokens.textPrimary }} ellipsis>{inc.objek || inc.kategori}</Text>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <EnvironmentOutlined style={{ fontSize: 9, color: tokens.textMuted }} />
                        <Text style={{ fontSize: 9, color: tokens.textMuted }} ellipsis>{inc.alamat}</Text>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: 9, fontWeight: 700, color: statusColor(inc.status), textTransform: 'uppercase' }}>{inc.status === 'menunggu' ? '● AKTIF' : inc.status?.toUpperCase()}</div>
                      <div style={{ fontSize: 9, color: tokens.textMuted }}>{dayjs(inc.waktu_lapor).format('DD/MM HH:mm')}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        </div>

        {/* ═══ RUNNING TEXT (fixed bottom) ═══ */}
        <motion.div variants={itemVariants} style={{
          position: 'fixed', bottom: 0,
          left: (isFullscreen || isSidebarHidden) ? 0 : 260, right: 0,
          background: 'rgba(5,5,5,0.92)', backdropFilter: 'blur(12px)',
          borderTop: hasAnyAlert ? '2px solid rgba(239,68,68,0.6)' : '1px solid rgba(239,68,68,0.25)',
          padding: '5px 0', zIndex: 1000, display: 'flex', alignItems: 'center'
        }}>
          <div style={{ background: hasAnyAlert ? 'linear-gradient(135deg, #ef4444, #dc2626)' : 'linear-gradient(135deg, #ef4444, #dc2626)', color: '#fff', padding: '3px 12px', fontWeight: 800, fontSize: 10, letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: 5, borderRight: '2px solid rgba(239,68,68,0.4)' }}>
            <AlertOutlined className="dot-live" /> SIAGA
          </div>
          <div style={{ flex: 1, overflow: 'hidden', paddingLeft: 10 }}>
            <Marquee speed={45} gradient={false} style={{ color: tokens.textPrimary, fontFamily: 'monospace', fontSize: 12 }}>
              {stats.dashboardSettings?.dashboard_running_text ? (
                <span style={{ marginRight: 40 }}>{stats.dashboardSettings.dashboard_running_text}</span>
              ) : (
                <>
                  {hasAnyAlert && <span style={{ marginRight: 50, color: '#ef4444', fontWeight: 800 }}>⚠️ PERHATIAN: {pendingFire.length + pendingRescue.length} INSIDEN MENUNGGU DISPATCH! &nbsp;|&nbsp; </span>}
                  <span style={{ marginRight: 50 }}><span style={{ color: '#ef4444' }}>■</span> <b>KEBAKARAN 2026:</b> {stats.kebakaranThisYear} kasus &nbsp;|&nbsp; <b>PENYELAMATAN:</b> {stats.penyelamatanThisYear} operasi &nbsp;|&nbsp; <b>RESPON:</b> {stats.avgResponseTime} mnt</span>
                  <span style={{ marginRight: 50 }}><span style={{ color: tokens.primary }}>■</span> <b>BMKG:</b> Peringatan Dini Cuaca Ekstrem di perairan barat.</span>
                  <span style={{ marginRight: 50 }}><span style={{ color: tokens.success }}>■</span> <b>STATUS:</b> Seluruh Posko dalam keadaan aman terkendali.</span>
                </>
              )}
            </Marquee>
          </div>
        </motion.div>
      </motion.div>
    </>
  );
}
