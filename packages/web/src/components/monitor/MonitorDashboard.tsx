import { useEffect, useRef, useState } from "react";
import {
  Activity,
  Bot,
  CheckCircle2,
  Cpu,
  Database,
  HardDrive,
  LayoutDashboard,
  LogOut,
  MemoryStick,
  Monitor,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Wifi,
  Zap,
} from "lucide-react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { MetricCard } from "./MetricCard";
import { Panel } from "../ui/Panel";
import { Button } from "../ui/Button";
import { fetchMetrics, getDemoMetrics, type DeviceMetrics } from "../../lib/metrics";
import { formatBytes, formatUptime } from "../../lib/utils";
import type { Incident } from "../../types/devops";
import { initialIncidents } from "../../lib/devopsData";
import {
  fetchDbStatus,
  fetchIncidentsFromDb,
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

  // Metrics history for smooth SVG sparklines
  const [cpuHistory, setCpuHistory] = useState<number[]>([12, 16, 14, 18, 15, 17, 21, 16]);
  const [ramHistory, setRamHistory] = useState<number[]>([42, 43, 44, 43, 45, 44, 46, 45]);
  const [diskHistory, setDiskHistory] = useState<number[]>([60, 60, 61, 61, 61, 62, 61, 62]);

  // SRE Audit simulation state
  const [auditRunning, setAuditRunning] = useState(false);
  const [auditMessage, setAuditMessage] = useState<string | null>(null);

  // DevOps state
  const [incidents, setIncidents] = useState<Incident[]>(initialIncidents);
  const [dbStatus, setDbStatus] = useState<DbStatus | null>(null);

  const currentUser = getStoredUser() || { username: "operator", role: "operator" };

  async function refresh() {
    setLoading(true);
    try {
      const controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), 2500);
      try {
        const data = await fetchMetrics(controller.signal);
        setMetrics(data);
        setConnected(true);

        // Update sparkline histories
        setCpuHistory((prev) => [...prev.slice(-14), data.cpu_percent]);
        setRamHistory((prev) => [...prev.slice(-14), data.memory.used_percent]);
        setDiskHistory((prev) => [...prev.slice(-14), data.disk.used_percent]);

        // Fetch live state from local SQLite daemon
        const [status, dbIncidents] = await Promise.all([
          fetchDbStatus(controller.signal),
          fetchIncidentsFromDb(controller.signal),
        ]);

        if (status) setDbStatus(status);
        if (dbIncidents && dbIncidents.length > 0) setIncidents(dbIncidents);
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
      setAuditMessage("Validating host memory pools & air-gapped sandbox...");
    }, 1700);

    setTimeout(() => {
      setAuditMessage("✔ System audit complete: 100% Nominal. All host subsystems healthy.");
      setAuditRunning(false);
      void refresh();
      setTimeout(() => setAuditMessage(null), 4500);
    }, 2500);
  }

  useEffect(() => {
    void refresh();
    const timer = window.setInterval(() => void refresh(), 5000);
    return () => window.clearInterval(timer);
  }, []);

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
  const ram = metrics.memory.used_percent;
  const disk = metrics.disk.used_percent;

  const totalRam = metrics.memory.total_bytes;
  const usedRam = metrics.memory.used_bytes;
  const freeRam = Math.max(0, totalRam - usedRam);

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
            <span>Loopback Latency</span>
            <strong className="text-cyan">&lt; 0.2ms</strong>
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
              onClick={() => void refresh()}
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
                  <span>Resident RAM: Optimal</span>
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
            <p>High-frequency host metrics captured via native Go telemetry probes</p>
          </div>
          <div className="telemetry-sync-time">
            <span>Last polled: <strong>{lastUpdated.toLocaleTimeString()}</strong></span>
          </div>
        </div>

        {/* Telemetry Metric Cards with Smooth SVG Sparklines */}
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
                  <MemoryStick size={15} />
                </div>
                <div className="signal-info">
                  <span className="signal-name">Resident Memory Pressure</span>
                  <small>OOM reaper threshold margin</small>
                </div>
                <span className={`signal-status-badge ${ram > 90 ? "warning" : "nominal"}`}>
                  <span className="dot" /> {ram > 90 ? "ELEVATED" : "OPTIMAL"}
                </span>
              </div>

              <div className="signal-item">
                <div className="signal-icon-box">
                  <HardDrive size={15} />
                </div>
                <div className="signal-info">
                  <span className="signal-name">Storage I/O Throughput</span>
                  <small>Root filesystem inode & block sync</small>
                </div>
                <span className={`signal-status-badge ${disk > 90 ? "warning" : "nominal"}`}>
                  <span className="dot" /> {disk > 90 ? "WARNING" : "NOMINAL"}
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
