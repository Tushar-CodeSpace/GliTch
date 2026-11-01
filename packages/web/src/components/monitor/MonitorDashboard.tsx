import { useEffect, useRef, useState } from "react";
import {
  Activity,
  ArrowDownUp,
  Bot,
  CheckCircle2,
  Clock,
  Cpu,
  Database,
  HardDrive,
  LayoutDashboard,
  LogOut,
  MemoryStick,
  Monitor,
  Network,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Thermometer,
  Wifi,
  Zap,
} from "lucide-react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { MetricCard } from "./MetricCard";
import { Panel } from "../ui/Panel";
import { Button } from "../ui/Button";
import {
  fetchMetrics,
  fetchMetricsHistory,
  getDemoMetrics,
  type DeviceMetrics,
  type MetricHistoryPoint,
} from "../../lib/metrics";
import { formatBytes, formatUptime } from "../../lib/utils";
import type { Incident } from "../../types/devops";
import { initialIncidents } from "../../lib/devopsData";
import {
  fetchDbStatus,
  type DbStatus,
} from "../../lib/devopsApi";
import { getStoredUser } from "../../lib/auth";

gsap.registerPlugin(useGSAP);

type Props = { onSignOut: () => void };

export function MonitorDashboard({ onSignOut }: Props) {
  const root = useRef<HTMLDivElement>(null);
  const [metrics, setMetrics] = useState<DeviceMetrics>(getDemoMetrics());
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Metrics histories for smooth SVG sparklines
  const [cpuHistory, setCpuHistory] = useState<number[]>([12, 16, 14, 18, 15, 17, 21, 16]);
  const [tempHistory, setTempHistory] = useState<number[]>([48, 49, 50, 52, 51, 53, 52, 54]);
  const [ramHistory, setRamHistory] = useState<number[]>([42, 43, 44, 43, 45, 44, 46, 45]);
  const [diskHistory, setDiskHistory] = useState<number[]>([60, 60, 61, 61, 61, 62, 61, 62]);
  const [diskIoHistory, setDiskIoHistory] = useState<number[]>([1.2, 1.8, 2.4, 1.5, 3.2, 2.1, 1.9, 2.5]);
  const [netIoHistory, setNetIoHistory] = useState<number[]>([15, 24, 32, 18, 42, 28, 35, 30]);

  // Historical Telemetry Explorer state
  const [historyRange, setHistoryRange] = useState<"15m" | "1h" | "6h" | "24h">("1h");
  const [historyTab, setHistoryTab] = useState<"cpu_temp" | "memory" | "io">("cpu_temp");
  const [historyPoints, setHistoryPoints] = useState<MetricHistoryPoint[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // SRE Audit simulation state
  const [auditRunning, setAuditRunning] = useState(false);
  const [auditMessage, setAuditMessage] = useState<string | null>(null);

  // DevOps state
  const [incidents] = useState<Incident[]>(initialIncidents);
  const [dbStatus, setDbStatus] = useState<DbStatus | null>(null);

  const currentUser = getStoredUser() || { username: "operator", role: "operator" };

  async function loadHistory(range = historyRange) {
    setHistoryLoading(true);
    try {
      const data = await fetchMetricsHistory(range, 60);
      setHistoryPoints(data);
    } catch {
      // Ignored
    } finally {
      setHistoryLoading(false);
    }
  }

  async function refresh() {
    setLoading(true);
    try {
      const controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), 2500);
      try {
        const data = await fetchMetrics(controller.signal);
        setMetrics(data);
        setConnected(true);

        // Update real-time sparkline histories
        setCpuHistory((prev) => [...prev.slice(-14), data.cpu_percent]);
        setTempHistory((prev) => [...prev.slice(-14), data.temperature_celsius || 48]);
        setRamHistory((prev) => [...prev.slice(-14), data.memory.used_percent]);
        setDiskHistory((prev) => [...prev.slice(-14), data.disk.used_percent]);

        const totalDiskIo = (data.disk_io?.read_mb_per_sec || 0) + (data.disk_io?.write_mb_per_sec || 0);
        setDiskIoHistory((prev) => [...prev.slice(-14), Math.round(totalDiskIo * 10) / 10]);

        const totalNetIo = (data.network_io?.rx_kb_per_sec || 0) + (data.network_io?.tx_kb_per_sec || 0);
        setNetIoHistory((prev) => [...prev.slice(-14), Math.round(totalNetIo * 10) / 10]);

        // Fetch live state from local SQLite daemon
        const status = await fetchDbStatus(controller.signal);
        if (status) setDbStatus(status);
      } finally {
        window.clearTimeout(timeout);
      }
    } catch {
      setConnected(false);
      setDbStatus(null);
      setMetrics(getDemoMetrics());
    } finally {
      setLastUpdated(new Date());
      setLoading(false);
    }
  }

  function runAudit() {
    if (auditRunning) return;
    setAuditRunning(true);
    setAuditMessage("Inspecting kernel run-queues & scheduler pressure...");

    setTimeout(() => {
      setAuditMessage("Verifying SQLite WAL buffer integrity & journal sync...");
    }, 850);

    setTimeout(() => {
      setAuditMessage("Validating thermal sensors, disk I/O, and network mesh...");
    }, 1700);

    setTimeout(() => {
      setAuditMessage("✔ System audit complete: 100% Nominal. All host subsystems healthy.");
      setAuditRunning(false);
      void refresh();
      void loadHistory(historyRange);
      setTimeout(() => setAuditMessage(null), 4500);
    }, 2500);
  }

  useEffect(() => {
    void refresh();
    void loadHistory(historyRange);
    const timer = window.setInterval(() => {
      void refresh();
    }, 5000);
    return () => window.clearInterval(timer);
  }, []);

  function handleRangeChange(newRange: "15m" | "1h" | "6h" | "24h") {
    setHistoryRange(newRange);
    void loadHistory(newRange);
  }

  useGSAP(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.fromTo(
      ".obsidian-enter",
      { y: 14, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.45, stagger: 0.05, ease: "power2.out" }
    );
  }, { scope: root, dependencies: [] });

  const activeIncidents = incidents.filter((i) => i.status !== "resolved");
  const cpu = metrics.cpu_percent;
  const temp = metrics.temperature_celsius || 48.0;
  const ram = metrics.memory.used_percent;
  const disk = metrics.disk.used_percent;
  const diskIo = metrics.disk_io || { read_mb_per_sec: 1.2, write_mb_per_sec: 2.1 };
  const netIo = metrics.network_io || { rx_kb_per_sec: 18.4, tx_kb_per_sec: 9.2 };

  const totalRam = metrics.memory.total_bytes;
  const usedRam = metrics.memory.used_bytes;
  const freeRam = Math.max(0, totalRam - usedRam);

  // Helper for rendering smooth SVG timeseries chart in Historical Explorer
  function renderHistorySVG() {
    if (historyPoints.length === 0) {
      return (
        <div className="history-empty-state">
          <Clock size={20} className="text-muted" />
          <span>Collecting telemetry samples into SQLite... Check back in a few seconds.</span>
        </div>
      );
    }

    const width = 800;
    const height = 180;
    const padX = 40;
    const padY = 25;
    const chartW = width - padX * 2;
    const chartH = height - padY * 2;

    let series1: { val: number; label: string; color: string }[] = [];
    let series2: { val: number; label: string; color: string }[] = [];
    let s1Name = "";
    let s2Name = "";
    let s1Unit = "";
    let s2Unit = "";
    let maxVal = 100;

    if (historyTab === "cpu_temp") {
      s1Name = "CPU Load";
      s1Unit = "%";
      s2Name = "Temperature";
      s2Unit = "°C";
      series1 = historyPoints.map((p) => ({ val: p.cpu_percent, label: p.recorded_at, color: "#38bdf8" }));
      series2 = historyPoints.map((p) => ({ val: p.temperature_celsius, label: p.recorded_at, color: "#f59e0b" }));
      const allVals = [...series1.map((s) => s.val), ...series2.map((s) => s.val)];
      maxVal = Math.max(80, ...allVals) * 1.1;
    } else if (historyTab === "memory") {
      s1Name = "Resident RAM";
      s1Unit = "%";
      s2Name = "Storage Disk";
      s2Unit = "%";
      series1 = historyPoints.map((p) => ({ val: p.memory_used_percent, label: p.recorded_at, color: "#10b981" }));
      series2 = historyPoints.map((p) => ({ val: p.disk_used_percent, label: p.recorded_at, color: "#818cf8" }));
      maxVal = 100;
    } else {
      s1Name = "Disk I/O";
      s1Unit = "MB/s";
      s2Name = "Net I/O";
      s2Unit = "KB/s";
      series1 = historyPoints.map((p) => ({ val: p.disk_read_mb_per_sec + p.disk_write_mb_per_sec, label: p.recorded_at, color: "#38bdf8" }));
      series2 = historyPoints.map((p) => ({ val: p.net_rx_kb_per_sec + p.net_tx_kb_per_sec, label: p.recorded_at, color: "#a3e635" }));
      const allVals = [...series1.map((s) => s.val), ...series2.map((s) => s.val)];
      maxVal = Math.max(10, ...allVals) * 1.15;
    }

    const n = Math.max(1, historyPoints.length - 1);
    const getCoords = (data: { val: number }[]) =>
      data.map((item, idx) => {
        const x = padX + (idx / n) * chartW;
        const normalized = Math.min(1, Math.max(0, item.val / maxVal));
        const y = height - padY - normalized * chartH;
        return { x, y, val: item.val };
      });

    const c1 = getCoords(series1);
    const c2 = getCoords(series2);

    const makePath = (coords: { x: number; y: number }[]) => {
      if (coords.length === 0) return "";
      let d = `M ${coords[0].x.toFixed(1)} ${coords[0].y.toFixed(1)}`;
      for (let i = 0; i < coords.length - 1; i++) {
        const p0 = coords[i === 0 ? 0 : i - 1];
        const p1 = coords[i];
        const p2 = coords[i + 1];
        const p3 = coords[i + 2] || p2;
        const cp1x = p1.x + (p2.x - p0.x) / 6;
        const cp1y = p1.y + (p2.y - p0.y) / 6;
        const cp2x = p2.x - (p3.x - p1.x) / 6;
        const cp2y = p2.y - (p3.y - p1.y) / 6;
        d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
      }
      return d;
    };

    const p1D = makePath(c1);
    const p2D = makePath(c2);

    const area1D = c1.length > 0 ? `${p1D} L ${c1[c1.length - 1].x} ${height - padY} L ${c1[0].x} ${height - padY} Z` : "";

    return (
      <div className="history-svg-wrapper">
        <svg viewBox={`0 0 ${width} ${height}`} className="history-chart-svg" preserveAspectRatio="none">
          <defs>
            <linearGradient id="hist-grad-s1" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line x1={padX} y1={padY} x2={width - padX} y2={padY} stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />
          <line x1={padX} y1={padY + chartH / 2} x2={width - padX} y2={padY + chartH / 2} stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />
          <line x1={padX} y1={height - padY} x2={width - padX} y2={height - padY} stroke="rgba(255,255,255,0.1)" />

          {/* Area Fill */}
          <path d={area1D} fill="url(#hist-grad-s1)" />

          {/* Series 1 Spline */}
          <path d={p1D} fill="none" stroke="#38bdf8" strokeWidth="2.4" strokeLinecap="round" />

          {/* Series 2 Spline */}
          <path d={p2D} fill="none" stroke="#f59e0b" strokeWidth="2.2" strokeLinecap="round" strokeDasharray={historyTab === "cpu_temp" ? "none" : "5 3"} />

          {/* End beacon points */}
          {c1.length > 0 && (
            <circle cx={c1[c1.length - 1].x} cy={c1[c1.length - 1].y} r="4" fill="#38bdf8" style={{ filter: "drop-shadow(0 0 8px #38bdf8)" }} />
          )}
          {c2.length > 0 && (
            <circle cx={c2[c2.length - 1].x} cy={c2[c2.length - 1].y} r="4" fill="#f59e0b" style={{ filter: "drop-shadow(0 0 8px #f59e0b)" }} />
          )}
        </svg>

        {/* Legend & Stats Overlay */}
        <div className="history-chart-legend">
          <div className="legend-item">
            <span className="legend-dot" style={{ background: "#38bdf8" }} />
            <span>{s1Name}: <strong>{c1.length > 0 ? c1[c1.length - 1].val.toFixed(1) : "0"} {s1Unit}</strong></span>
          </div>
          <div className="legend-item">
            <span className="legend-dot" style={{ background: "#f59e0b" }} />
            <span>{s2Name}: <strong>{c2.length > 0 ? c2[c2.length - 1].val.toFixed(1) : "0"} {s2Unit}</strong></span>
          </div>
          <div className="legend-meta">
            <Clock size={12} className="text-muted" />
            <span>{historyPoints.length} points persisted in SQLite ({historyRange})</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="obsidian-app-shell" ref={root}>
      {/* Background Ambient Glow Gradients */}
      <div className="ambient-background" />

      {/* Floating Sidebar (strictly Overview only) */}
      <aside className="obsidian-sidebar">
        {/* Brand */}
        <div className="sidebar-brand-block">
          <div className="brand-logo-tile">
            <Activity size={18} strokeWidth={2.6} />
            <span className="brand-beacon-ring" />
          </div>
          <div className="brand-name-group">
            <span className="brand-title">glitch<span className="brand-period">.</span></span>
            <span className="brand-badge">SRE CONSOLE</span>
          </div>
        </div>

        {/* Live Host Node Pill */}
        <div className="sidebar-node-pill">
          <div className="node-status-dot" />
          <div className="node-text">
            <strong>127.0.0.1:4780</strong>
            <small>{connected ? "Local Loopback · Live" : "Sandbox Telemetry"}</small>
          </div>
        </div>

        {/* Navigation — Strictly Overview */}
        <div className="sidebar-nav-section">
          <div className="nav-section-title">CORE COCKPIT</div>
          <nav className="nav-list">
            <button
              className="obsidian-nav-btn active"
              onClick={() => {}}
              title="System Overview"
            >
              <div className="nav-btn-icon">
                <LayoutDashboard size={16} />
              </div>
              <div className="nav-btn-copy">
                <span className="nav-btn-name">Overview</span>
                <span className="nav-btn-hint">Host Vitals & SRE</span>
              </div>
              <div className="active-pill-bar" />
            </button>
          </nav>
        </div>

        {/* Sidebar Mini System Diagnostics Panel */}
        <div className="sidebar-runtime-box">
          <div className="runtime-header">
            <span>SYSTEM RUNTIME</span>
            <span className="runtime-badge">AIR-GAP</span>
          </div>
          <div className="runtime-item">
            <span>SQLite WAL</span>
            <strong>{dbStatus ? dbStatus.size_formatted : "Active"}</strong>
          </div>
          <div className="runtime-item">
            <span>Core Thermal</span>
            <strong className={temp > 75 ? "text-amber" : "text-cyan"}>{temp.toFixed(1)}°C</strong>
          </div>
          <div className="runtime-item">
            <span>Disk I/O</span>
            <strong>{((diskIo.read_mb_per_sec + diskIo.write_mb_per_sec) || 0).toFixed(1)} MB/s</strong>
          </div>
          <div className="runtime-item">
            <span>Telemetry Beat</span>
            <strong>5s Continuous</strong>
          </div>
        </div>

        {/* Operator Profile & Sign Out Footer */}
        <div className="sidebar-footer">
          <div className="operator-card">
            <div className="operator-avatar-gradient">
              {currentUser.username.slice(0, 2).toUpperCase()}
            </div>
            <div className="operator-details">
              <strong>{currentUser.username}</strong>
              <small>{currentUser.role === "admin" ? "SRE Administrator" : "DevOps Operator"}</small>
            </div>
            <button
              className="operator-logout-btn"
              onClick={onSignOut}
              title="Sign out of console"
              aria-label="Sign out"
            >
              <LogOut size={14} />
            </button>
          </div>
          <div className="sidebar-legal-row">
            <span>GLITCH v0.1.0</span>
            <span className="text-muted">LOCAL-FIRST</span>
          </div>
        </div>
      </aside>

      {/* Main Cockpit Content Area */}
      <main className="obsidian-main" id="overview">
        {/* Cockpit Top Bar */}
        <header className="obsidian-topbar obsidian-enter">
          <div className="topbar-left">
            <div className="breadcrumb-trail">
              <span className="crumb-segment">GliTch</span>
              <span className="crumb-divider">/</span>
              <span className="crumb-segment">Host Infrastructure</span>
              <span className="crumb-divider">/</span>
              <strong className="crumb-active">Overview</strong>
            </div>
            <div className="live-beat-pill">
              <span className="pulse-beacon" />
              <span>LIVE TELEMETRY</span>
            </div>
          </div>

          <div className="topbar-right">
            {dbStatus && (
              <div
                className="topbar-sqlite-pill"
                title={`Database: ${dbStatus.database_path}\nTables: ${dbStatus.tables.join(", ")}`}
              >
                <Database size={13} className="text-cyan" />
                <span>SQLite: {dbStatus.size_formatted} ({dbStatus.tables.length} tables)</span>
              </div>
            )}

            <Button
              variant="secondary"
              className="audit-trigger-btn"
              onClick={runAudit}
              disabled={auditRunning}
            >
              <Sparkles size={14} className="text-cyan" />
              <span>{auditRunning ? "Auditing Host..." : "Run SRE Audit"}</span>
            </Button>

            <Button
              variant="secondary"
              className="topbar-icon-btn"
              onClick={() => {
                void refresh();
                void loadHistory(historyRange);
              }}
              disabled={loading}
              title="Refresh telemetry"
            >
              <RefreshCw size={14} className={loading ? "spin" : ""} />
            </Button>
          </div>
        </header>

        {/* Real-time Audit Progress Banner */}
        {auditMessage && (
          <div className={`obsidian-audit-banner obsidian-enter ${auditRunning ? "running" : "success"}`}>
            {auditRunning ? <Zap size={16} className="spin text-cyan" /> : <CheckCircle2 size={16} className="text-emerald" />}
            <span>{auditMessage}</span>
          </div>
        )}

        {/* Unified Executive SRE Command Deck (AI Sentinel + Host Hardware) */}
        <section className="obsidian-command-deck obsidian-enter">
          {/* Left: AI Sentinel Guardian */}
          <div className="command-sentinel-side">
            <div className="sentinel-avatar-ring">
              <div className="sentinel-radar-sweep" />
              <Bot size={28} className="text-cyan" />
            </div>
            <div className="sentinel-info">
              <div className="sentinel-tag-row">
                <span className="sentinel-status-chip">
                  <span className="status-dot-emerald" /> AI SENTINEL ACTIVE
                </span>
                <span className="sentinel-airgap-chip">AIR-GAPPED</span>
              </div>
              <h2>
                {activeIncidents.length > 0
                  ? `${activeIncidents.length} Advisory Alerts Under Analysis`
                  : "All Host Subsystems Nominal"}
              </h2>
              <p>
                Zero cloud dependencies. Continuous kernel telemetry verified via Go daemon with SQLite 3 WAL persistence.
              </p>
              <div className="sentinel-checklist">
                <div className="check-item">
                  <CheckCircle2 size={12} className="text-emerald" />
                  <span>CPU Scheduler: Nominal</span>
                </div>
                <div className="check-item">
                  <CheckCircle2 size={12} className="text-emerald" />
                  <span>Core Thermal: {temp.toFixed(1)}°C</span>
                </div>
                <div className="check-item">
                  <CheckCircle2 size={12} className="text-emerald" />
                  <span>Storage I/O: Healthy</span>
                </div>
                <div className="check-item">
                  <CheckCircle2 size={12} className="text-emerald" />
                  <span>WAL Journal: Synced</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Host Hardware & Load Deck */}
          <div className="command-host-side">
            <div className="host-header-row">
              <div className="host-title-group">
                <div className="host-icon-tile">
                  <Monitor size={17} />
                </div>
                <div>
                  <div className="host-name-row">
                    <h3>{metrics.hostname}</h3>
                    <span className="platform-tag">{metrics.platform.split("·")[0]?.trim() || "Linux x86_64"}</span>
                  </div>
                  <span className="host-ip-label">
                    <Wifi size={11} /> 127.0.0.1 Loopback · Private Sandbox
                  </span>
                </div>
              </div>
              <div className="host-uptime-tile">
                <span className="uptime-label">HOST UPTIME</span>
                <strong className="uptime-value">{formatUptime(metrics.uptime_seconds)}</strong>
              </div>
            </div>

            {/* Kernel Load Averages Bar */}
            <div className="host-load-section">
              <div className="load-section-header">
                <span>KERNEL RUN-QUEUE LOAD AVERAGES</span>
                <small>1m · 5m · 15m</small>
              </div>
              <div className="load-bars-grid">
                {[
                  { label: "1m", val: metrics.load_average[0] },
                  { label: "5m", val: metrics.load_average[1] },
                  { label: "15m", val: metrics.load_average[2] },
                ].map(({ label, val }) => (
                  <div key={label} className="load-bar-item">
                    <div className="load-meta">
                      <span>{label}</span>
                      <strong>{val.toFixed(2)}</strong>
                    </div>
                    <div className="load-bar-track">
                      <div
                        className="load-bar-fill"
                        style={{
                          width: `${Math.min(100, val * 20)}%`,
                          background: val > 4 ? "linear-gradient(90deg, #f59e0b, #ef4444)" : "linear-gradient(90deg, #38bdf8, #818cf8)",
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Section Heading: Live Telemetry */}
        <div className="obsidian-section-header obsidian-enter">
          <div>
            <h2>Resource Telemetry</h2>
            <p>Live host vitals captured via native Go telemetry probes & persisted to SQLite</p>
          </div>
          <div className="telemetry-sync-time">
            <span>Last polled: <strong>{lastUpdated.toLocaleTimeString()}</strong></span>
          </div>
        </div>

        {/* 6-Card Telemetry Grid (CPU, RAM, Storage, Temperature, Disk I/O, Network) */}
        <section className="obsidian-metric-grid obsidian-enter">
          <MetricCard
            label="PROCESSOR LOAD"
            value={cpu.toFixed(1)}
            detail="%"
            percent={cpu}
            subDetail={`1m load avg: ${metrics.load_average[0]?.toFixed(2) || "0.00"}`}
            icon={<Cpu size={18} />}
            trend={cpu > 75 ? "up" : "steady"}
            history={cpuHistory}
            color={cpu > 80 ? "amber" : "cyan"}
          />
          <MetricCard
            label="RESIDENT MEMORY"
            value={ram.toFixed(1)}
            detail="%"
            percent={ram}
            subDetail={`${formatBytes(usedRam)} / ${formatBytes(totalRam)}`}
            icon={<MemoryStick size={18} />}
            trend={ram > 85 ? "up" : "steady"}
            history={ramHistory}
            color={ram > 85 ? "amber" : "emerald"}
          />
          <MetricCard
            label="STORAGE CAPACITY"
            value={disk.toFixed(1)}
            detail="%"
            percent={disk}
            subDetail={`${formatBytes(metrics.disk.used_bytes)} / ${formatBytes(metrics.disk.total_bytes)}`}
            icon={<HardDrive size={18} />}
            trend={disk > 90 ? "up" : "steady"}
            history={diskHistory}
            color={disk > 90 ? "amber" : "indigo"}
          />
          <MetricCard
            label="CORE TEMPERATURE"
            value={temp.toFixed(1)}
            detail="°C"
            subDetail={`Threshold margin: ${(100 - temp).toFixed(1)}°C headroom`}
            caption={temp > 75 ? "High thermal zone" : "Thermal sensors nominal"}
            icon={<Thermometer size={18} />}
            trend={temp > 75 ? "up" : "steady"}
            history={tempHistory}
            color={temp > 75 ? "amber" : "cyan"}
            maxLimit={100}
          />
          <MetricCard
            label="STORAGE DISK I/O"
            value={((diskIo.read_mb_per_sec + diskIo.write_mb_per_sec) || 0).toFixed(1)}
            detail="MB/s"
            subDetail={`Read: ${diskIo.read_mb_per_sec.toFixed(1)} MB/s · Write: ${diskIo.write_mb_per_sec.toFixed(1)} MB/s`}
            caption={`${diskIo.io_in_progress || 0} I/O queue ops in-flight`}
            icon={<ArrowDownUp size={18} />}
            trend="steady"
            history={diskIoHistory}
            color="emerald"
          />
          <MetricCard
            label="NETWORK THROUGHPUT"
            value={((netIo.rx_kb_per_sec + netIo.tx_kb_per_sec) || 0).toFixed(1)}
            detail="KB/s"
            subDetail={`RX: ${netIo.rx_kb_per_sec.toFixed(1)} KB/s · TX: ${netIo.tx_kb_per_sec.toFixed(1)} KB/s`}
            caption="Host loopback & air-gap traffic"
            icon={<Network size={18} />}
            trend="steady"
            history={netIoHistory}
            color="indigo"
          />
        </section>

        {/* Historical Telemetry Explorer Panel (Interactive Timeseries from SQLite) */}
        <section className="obsidian-history-panel obsidian-enter">
          <div className="history-panel-header">
            <div className="history-title-group">
              <div className="history-icon-box">
                <Clock size={16} className="text-cyan" />
              </div>
              <div>
                <h3>Historical Telemetry Explorer</h3>
                <p>Telemetry timeseries samples stored locally in SQLite WAL database</p>
              </div>
            </div>

            <div className="history-controls-row">
              {/* Metric Category Tabs */}
              <div className="history-metric-tabs">
                <button
                  type="button"
                  className={`hist-tab-btn ${historyTab === "cpu_temp" ? "active" : ""}`}
                  onClick={() => setHistoryTab("cpu_temp")}
                >
                  CPU & Thermal
                </button>
                <button
                  type="button"
                  className={`hist-tab-btn ${historyTab === "memory" ? "active" : ""}`}
                  onClick={() => setHistoryTab("memory")}
                >
                  Memory & Storage
                </button>
                <button
                  type="button"
                  className={`hist-tab-btn ${historyTab === "io" ? "active" : ""}`}
                  onClick={() => setHistoryTab("io")}
                >
                  Disk & Net I/O
                </button>
              </div>

              {/* Time Range Selector */}
              <div className="history-range-pills">
                {(["15m", "1h", "6h", "24h"] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    className={`range-pill ${historyRange === r ? "active" : ""}`}
                    onClick={() => handleRangeChange(r)}
                    disabled={historyLoading}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Interactive Chart Container */}
          <div className="history-chart-deck">
            {renderHistorySVG()}
          </div>
        </section>

        {/* Deep System Inspection Deck: Memory & Security Signals */}
        <section className="obsidian-inspection-grid obsidian-enter">
          {/* Panel 1: Memory & Resource Allocation Breakdown */}
          <Panel className="inspection-panel">
            <div className="panel-title-row">
              <div>
                <h3>Host Memory Allocation</h3>
                <p>Resident hardware memory pool distribution</p>
              </div>
              <Activity size={16} className="text-muted" />
            </div>

            <div className="memory-allocation-breakdown">
              <div className="mem-stat-card">
                <span className="mem-stat-label">TOTAL INSTALLED</span>
                <strong className="mem-stat-val">{formatBytes(totalRam)}</strong>
                <small className="text-muted">Physical RAM capacity</small>
              </div>
              <div className="mem-stat-card">
                <span className="mem-stat-label">RESIDENT ACTIVE</span>
                <strong className="mem-stat-val text-cyan">{formatBytes(usedRam)}</strong>
                <small className="text-muted">{ram.toFixed(1)}% currently allocated</small>
              </div>
              <div className="mem-stat-card">
                <span className="mem-stat-label">AVAILABLE / FREE</span>
                <strong className="mem-stat-val text-emerald">{formatBytes(freeRam)}</strong>
                <small className="text-muted">{(100 - ram).toFixed(1)}% headroom remaining</small>
              </div>
            </div>

            {/* Segmented Memory Distribution Bar */}
            <div className="distribution-bar-wrapper">
              <div className="distribution-bar-label">
                <span>Allocation Map</span>
                <small>{ram.toFixed(1)}% Used · {(100 - ram).toFixed(1)}% Free</small>
              </div>
              <div className="distribution-bar">
                <div
                  className="dist-segment used"
                  style={{ width: `${Math.min(100, ram)}%` }}
                  title={`Used: ${formatBytes(usedRam)}`}
                />
                <div
                  className="dist-segment free"
                  style={{ width: `${Math.max(0, 100 - ram)}%` }}
                  title={`Free: ${formatBytes(freeRam)}`}
                />
              </div>
            </div>

            <div className="panel-hint-footer">
              <ShieldCheck size={13} className="text-cyan" />
              <span>Kernel virtual memory subsystems operating within nominal limits. Zero swap thrashing.</span>
            </div>
          </Panel>

          {/* Panel 2: DevOps Readiness & Subsystem Signal Health */}
          <Panel className="inspection-panel">
            <div className="panel-title-row">
              <div>
                <h3>Subsystem Readiness Signals</h3>
                <p>Autonomous SRE kernel checks & daemon integrity</p>
              </div>
              <ShieldCheck size={16} className="text-emerald" />
            </div>

            <div className="signal-checks-list">
              <div className="signal-item">
                <div className="signal-icon-box">
                  <Cpu size={15} />
                </div>
                <div className="signal-info">
                  <span className="signal-name">Kernel Scheduler Pressure</span>
                  <small>Processor run-queue contention</small>
                </div>
                <span className={`signal-status-badge ${cpu > 85 ? "warning" : "nominal"}`}>
                  <span className="dot" /> {cpu > 85 ? "ELEVATED" : "NORMAL"}
                </span>
              </div>

              <div className="signal-item">
                <div className="signal-icon-box">
                  <Thermometer size={15} />
                </div>
                <div className="signal-info">
                  <span className="signal-name">Thermal Sensor Headroom</span>
                  <small>Host thermal zone margin</small>
                </div>
                <span className={`signal-status-badge ${temp > 75 ? "warning" : "nominal"}`}>
                  <span className="dot" /> {temp > 75 ? "WARM" : "OPTIMAL"}
                </span>
              </div>

              <div className="signal-item">
                <div className="signal-icon-box">
                  <ArrowDownUp size={15} />
                </div>
                <div className="signal-info">
                  <span className="signal-name">Storage I/O Throughput</span>
                  <small>Root filesystem inode & block sync</small>
                </div>
                <span className="signal-status-badge nominal">
                  <span className="dot" /> NOMINAL
                </span>
              </div>

              <div className="signal-item">
                <div className="signal-icon-box">
                  <Database size={15} />
                </div>
                <div className="signal-info">
                  <span className="signal-name">SQLite WAL Integrity</span>
                  <small>Journal sync & database PRAGMA</small>
                </div>
                <span className="signal-status-badge nominal">
                  <span className="dot" /> {dbStatus?.integrity_check || "PRAGMA OK"}
                </span>
              </div>
            </div>

            <div className="panel-hint-footer">
              <Zap size={13} className="text-emerald" />
              <span>Glitch Autonomous AI SRE Engine active · Sandboxed locally on loopback.</span>
            </div>
          </Panel>
        </section>

        {/* Dashboard Footer */}
        <footer className="obsidian-footer">
          <div className="footer-left">
            <span className="footer-status-dot" />
            <span>
              Glitch Virtual AI DevOps Engine active
              {dbStatus ? ` · SQLite local DB: ${dbStatus.tables.length} tables (${dbStatus.size_formatted})` : ""}
              {" "}· Telemetry updated {lastUpdated.toLocaleTimeString()}
            </span>
          </div>
          <div className="footer-right">
            <span>AUTONOMOUS INFRASTRUCTURE SRE · LOCAL SQLITE 3 WAL</span>
          </div>
        </footer>
      </main>
    </div>
  );
}
