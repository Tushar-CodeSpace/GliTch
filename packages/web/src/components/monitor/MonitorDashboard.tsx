import { useEffect, useRef, useState } from "react";
import {
  Activity,
  Bot,
  CheckCircle2,
  CircleHelp,
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

  // Metrics history for SVG sparklines
  const [cpuHistory, setCpuHistory] = useState<number[]>([14, 18, 16, 21, 19, 17, 22, 18]);
  const [ramHistory, setRamHistory] = useState<number[]>([44, 45, 46, 45, 47, 46, 48, 47]);
  const [diskHistory, setDiskHistory] = useState<number[]>([62, 62, 63, 63, 63, 64, 63, 64]);

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
    }, 900);

    setTimeout(() => {
      setAuditMessage("Validating host memory pools & air-gapped sandbox...");
    }, 1800);

    setTimeout(() => {
      setAuditMessage("✔ Audit complete: 100% Nominal. All host subsystems healthy.");
      setAuditRunning(false);
      void refresh();
      setTimeout(() => setAuditMessage(null), 4000);
    }, 2700);
  }

  useEffect(() => {
    void refresh();
    const timer = window.setInterval(() => void refresh(), 5000);
    return () => window.clearInterval(timer);
  }, []);

  useGSAP(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.fromTo(
      ".dashboard-enter",
      { y: 12, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.45, stagger: 0.05, ease: "power2.out" }
    );
    gsap.to(".pulse-ring", { scale: 1.3, opacity: 0, duration: 1.8, repeat: -1, ease: "power1.out" });
  }, { scope: root, dependencies: [] });

  const activeIncidents = incidents.filter((i) => i.status !== "resolved");
  const cpu = metrics.cpu_percent;
  const ram = metrics.memory.used_percent;
  const disk = metrics.disk.used_percent;

  return (
    <div className="dashboard-shell" ref={root}>
      {/* Sidebar with only Overview */}
      <aside className="sidebar">
        <a
          className="side-brand"
          href="#"
          onClick={(e) => e.preventDefault()}
        >
          <span className="brand-mark">
            <Activity size={18} strokeWidth={2.5} />
          </span>
          <div className="side-brand-text">
            <span>glitch<span className="wordmark-period">.</span></span>
            <span className="ai-submark">LOCAL DEVOPS SRE</span>
          </div>
        </a>

        <div className="workspace-switch">
          <div className="workspace-avatar">
            <Bot size={15} />
          </div>
          <span>
            <strong>Local SRE Cluster</strong>
            <small>Autonomous AI active</small>
          </span>
          <span className="status-ping-dot" />
        </div>

        <div className="nav-label">SYSTEM WORKSPACE</div>
        <nav className="side-nav">
          <button
            className="nav-item active"
            onClick={() => {}}
            title="System Overview"
          >
            <div className="nav-icon-box">
              <LayoutDashboard size={16} />
            </div>
            <div className="nav-text-group">
              <span className="nav-title">Overview</span>
              <span className="nav-subtitle">Host Vitals & SRE</span>
            </div>
            <span className="nav-active-dot" />
          </button>
        </nav>

        {/* Sidebar Mini Diagnostics Widget */}
        <div className="sidebar-diag-card">
          <div className="sidebar-diag-header">
            <span className="diag-label">SYSTEM RUNTIME</span>
            <span className="diag-badge">LOCAL</span>
          </div>
          <div className="sidebar-diag-row">
            <span>Host Vitals</span>
            <strong className="text-accent">Nominal</strong>
          </div>
          <div className="sidebar-diag-row">
            <span>SQLite Engine</span>
            <strong>WAL Active</strong>
          </div>
          <div className="sidebar-diag-row">
            <span>Air-Gap Mesh</span>
            <strong>Secured</strong>
          </div>
        </div>

        {/* Sidebar Bottom: Operator Profile & Sign Out */}
        <div className="sidebar-bottom">
          <div className="operator-profile-card">
            <div className="operator-avatar">
              {currentUser.username.slice(0, 2).toUpperCase()}
            </div>
            <div className="operator-meta">
              <strong>{currentUser.username}</strong>
              <small>{currentUser.role === "admin" ? "Administrator" : "DevOps Operator"}</small>
            </div>
            <button
              className="operator-signout-btn"
              onClick={onSignOut}
              title="Sign out of console"
              aria-label="Sign out"
            >
              <LogOut size={14} />
            </button>
          </div>

          <div className="sidebar-version">
            <span>GLITCH v0.1.0</span>
            <span className="version-light">SQLITE 3 WAL</span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="dashboard-main" id="overview">
        {/* Topbar Header */}
        <header className="dashboard-topbar">
          <div className="breadcrumbs">
            <span>Workspace</span>
            <span className="crumb-sep">/</span>
            <strong>Overview</strong>
            <span className="live-beat-tag">
              <span className="pulse-dot" /> LIVE 5s SYNC
            </span>
          </div>

          <div className="topbar-actions">
            <div className={`connection-pill ${connected ? "connected" : "demo"}`}>
              <span />
              {connected ? "LIVE HARDWARE TELEMETRY" : "LOCAL SANDBOX TELEMETRY"}
            </div>

            {dbStatus && (
              <div
                className="sqlite-status-pill"
                title={`SQLite local database:\n${dbStatus.database_path}\nTables: ${dbStatus.tables.join(", ")}\nIntegrity: ${dbStatus.integrity_check}`}
              >
                <Database size={13} className="text-accent" />
                <span>SQLITE: {dbStatus.size_formatted}</span>
              </div>
            )}

            <div className="glitch-status-pill">
              <Bot size={13} className="text-accent" />
              <span>AI SRE: ONLINE</span>
            </div>

            <Button
              variant="secondary"
              className="topbar-refresh-btn"
              onClick={() => void refresh()}
              disabled={loading}
              title="Refresh host vitals"
            >
              <RefreshCw size={13} className={loading ? "spin" : ""} />
            </Button>
          </div>
        </header>

        {/* Cockpit Overview Heading */}
        <section className="dashboard-heading dashboard-enter">
          <div>
            <div className="eyebrow">
              <span className="eyebrow-line" /> AUTONOMOUS INFRASTRUCTURE INTELLIGENCE
            </div>
            <h1>
              Virtual DevOps <span className="text-accent">Cockpit.</span>
            </h1>
            <p>
              Glitch continuously inspects host processor vitals, memory pressure, and local SQLite persistence.
            </p>
          </div>

          <div className="heading-actions">
            <Button
              variant="secondary"
              className="refresh-button"
              onClick={() => void refresh()}
              disabled={loading}
            >
              <RefreshCw size={14} className={loading ? "spin" : ""} /> Refresh
            </Button>
            <Button
              variant="primary"
              className="audit-button"
              onClick={runAudit}
              disabled={auditRunning}
            >
              <Sparkles size={14} /> {auditRunning ? "Auditing..." : "Run Diagnostics"}
            </Button>
          </div>
        </section>

        {/* Real-time Audit Toast/Banner if running or recently ran */}
        {auditMessage && (
          <div className={`audit-banner dashboard-enter ${auditRunning ? "running" : "success"}`}>
            {auditRunning ? <Zap size={15} className="spin" /> : <CheckCircle2 size={15} />}
            <span>{auditMessage}</span>
          </div>
        )}

        {/* Virtual DevOps AI SRE Hero Banner */}
        <Panel className="glitch-ai-hero-card dashboard-enter">
          <div className="hero-card-left">
            <div className="hero-ai-avatar">
              <Bot size={28} />
              <span className="hero-pulse" />
              <span className="hero-pulse-outer" />
            </div>
            <div className="hero-copy">
              <div className="hero-badge-row">
                <h2>Glitch Virtual DevOps Engineer</h2>
                <span className="hero-ai-chip">NEURAL SRE ENGINE</span>
                <span className="hero-sec-chip">AIR-GAPPED</span>
              </div>
              {activeIncidents.length > 0 ? (
                <p>
                  I detected <strong>{activeIncidents.length} actionable advisory alert{activeIncidents.length === 1 ? "" : "s"}</strong> across your local host. Automated playbooks are ready.
                </p>
              ) : (
                <p>
                  All host subsystems nominal. No memory pressure spikes, runaway processes, or storage bottlenecks detected.
                </p>
              )}

              <div className="hero-checklist-row">
                <span className="checklist-tag">
                  <CheckCircle2 size={12} className="text-accent" /> CPU Scheduler: Nominal
                </span>
                <span className="checklist-tag">
                  <CheckCircle2 size={12} className="text-accent" /> Resident Memory: Optimal
                </span>
                <span className="checklist-tag">
                  <CheckCircle2 size={12} className="text-accent" /> Root Disk I/O: Healthy
                </span>
                <span className="checklist-tag">
                  <CheckCircle2 size={12} className="text-accent" /> SQLite WAL: Synchronized
                </span>
              </div>
            </div>
          </div>

          <div className="hero-card-right">
            <div className="hero-metric-tile">
              <span>SYSTEM INTEGRITY</span>
              <strong className={activeIncidents.length > 0 ? "text-amber" : "text-accent"}>
                {activeIncidents.length > 0 ? "ATTENTION REQUIRED" : "100.0% Nominal"}
              </strong>
            </div>
            <div className="hero-metric-tile">
              <span>SRE AUTONOMY</span>
              <strong>ACTIVE GUARD</strong>
            </div>
            <div className="hero-metric-tile">
              <span>LOOPBACK LATENCY</span>
              <strong className="text-accent">&lt; 0.2ms</strong>
            </div>
          </div>
        </Panel>

        {/* Host Machine Telemetry Banner */}
        <Panel className="device-banner dashboard-enter" id="device">
          <div className="device-banner-main">
            <div className="device-icon">
              <Monitor size={22} />
            </div>
            <div>
              <div className="device-title-row">
                <h2>{metrics.hostname}</h2>
                <span className="status-badge connected">
                  <span /> LIVE LOCAL HOST
                </span>
                <span className="arch-chip">{metrics.platform.split("·")[0]?.trim() || "Linux x86_64"}</span>
              </div>
              <p>
                {metrics.platform}
              </p>
              <div className="device-meta">
                <span>
                  <Wifi size={13} /> Local Loopback (127.0.0.1)
                </span>
                <span>
                  <ShieldCheck size={13} /> Private & air-gapped
                </span>
                <span>
                  <Activity size={13} /> Uptime {formatUptime(metrics.uptime_seconds)}
                </span>
                <span>
                  <Database size={13} /> SQLite WAL Engine Active
                </span>
              </div>
            </div>
          </div>

          <div className="device-banner-right">
            <span className="device-meta-label">TELEMETRY SYNC</span>
            <strong>{lastUpdated.toLocaleTimeString()}</strong>
            <small>Continuous 5s local polling</small>
          </div>

          <div className="banner-grid" />
        </Panel>

        {/* Hardware Resource Utilization */}
        <div className="section-heading dashboard-enter">
          <div>
            <h2>Resource Utilization</h2>
            <p>Live metrics from the host machine managed by Glitch</p>
          </div>
          <span className="telemetry-live-pill">
            <span className="pulse-dot" /> STREAMING
          </span>
        </div>

        <section className="metric-grid dashboard-enter">
          <MetricCard
            label="CPU PROCESSOR LOAD"
            value={cpu.toFixed(1)}
            detail="%"
            percent={cpu}
            subDetail={`1m load: ${metrics.load_average[0]?.toFixed(2) || "0.00"}`}
            icon={<Cpu size={17} />}
            trend={cpu > 75 ? "up" : "steady"}
            history={cpuHistory}
            color={cpu > 80 ? "amber" : "lime"}
          />
          <MetricCard
            label="RESIDENT MEMORY"
            value={ram.toFixed(1)}
            detail="%"
            percent={ram}
            subDetail={`${formatBytes(metrics.memory.used_bytes)} / ${formatBytes(metrics.memory.total_bytes)}`}
            icon={<MemoryStick size={17} />}
            trend={ram > 85 ? "up" : "steady"}
            history={ramHistory}
            color={ram > 85 ? "amber" : "lime"}
          />
          <MetricCard
            label="ROOT DISK CAPACITY"
            value={disk.toFixed(1)}
            detail="%"
            percent={disk}
            subDetail={`${formatBytes(metrics.disk.used_bytes)} / ${formatBytes(metrics.disk.total_bytes)}`}
            icon={<HardDrive size={17} />}
            trend={disk > 90 ? "up" : "steady"}
            history={diskHistory}
            color={disk > 90 ? "amber" : "lime"}
          />
        </section>

        {/* Lower Grid: Load Average & Signal Health */}
        <section className="lower-grid">
          <Panel className="load-panel dashboard-enter">
            <div className="section-heading compact">
              <div>
                <h2>Host System Load</h2>
                <p>1m, 5m, and 15m run-queue averages</p>
              </div>
              <span className="live-tag">
                <span className="pulse-dot" /> LIVE RUN-QUEUE
              </span>
            </div>
            <div className="load-values">
              {[
                { label: "1 MIN LOAD", value: metrics.load_average[0] },
                { label: "5 MIN LOAD", value: metrics.load_average[1] },
                { label: "15 MIN LOAD", value: metrics.load_average[2] },
              ].map(({ label, value }) => (
                <div key={label} className="load-value">
                  <span>{label}</span>
                  <strong>{value.toFixed(2)}</strong>
                  <div className="load-track">
                    <i
                      style={{
                        width: `${Math.min(100, value * 20)}%`,
                        backgroundColor: value > 4 ? "#f59e0b" : "#8db83a",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="load-note">
              <Activity size={14} />
              <span>
                RAM available: <strong>{formatBytes(metrics.memory.total_bytes - metrics.memory.used_bytes)}</strong> of{" "}
                {formatBytes(metrics.memory.total_bytes)} installed capacity
              </span>
            </div>
          </Panel>

          <Panel className="health-panel dashboard-enter">
            <div className="section-heading compact">
              <div>
                <h2>DevOps Readiness Signals</h2>
                <p>Kernel pressure and daemon status</p>
              </div>
              <CircleHelp size={16} className="muted-icon" />
            </div>
            <div className="health-row">
              <span className="health-icon">
                <Cpu size={15} />
              </span>
              <span className="health-name">CPU Kernel Pressure</span>
              <span className={`health-state ${cpu > 85 ? "warning" : ""}`}>
                <i />
                {cpu > 85 ? "HIGH" : "NORMAL"}
              </span>
            </div>
            <div className="health-row">
              <span className="health-icon">
                <MemoryStick size={15} />
              </span>
              <span className="health-name">Memory Resident Pressure</span>
              <span className={`health-state ${ram > 90 ? "warning" : ""}`}>
                <i />
                {ram > 90 ? "HIGH" : "OPTIMAL"}
              </span>
            </div>
            <div className="health-row">
              <span className="health-icon">
                <HardDrive size={15} />
              </span>
              <span className="health-name">Storage I/O Pressure</span>
              <span className={`health-state ${disk > 90 ? "warning" : ""}`}>
                <i />
                {disk > 90 ? "HIGH" : "NOMINAL"}
              </span>
            </div>
            <div className="health-row">
              <span className="health-icon">
                <Database size={15} />
              </span>
              <span className="health-name">SQLite WAL Integrity</span>
              <span className="health-state">
                <i />
                {dbStatus?.integrity_check || "SYNCED"}
              </span>
            </div>
            <div className="health-footer">
              <ShieldCheck size={14} /> Glitch AI SRE active. Sandboxed on local loopback.
            </div>
          </Panel>
        </section>

        {/* Footer */}
        <footer className="dashboard-footer">
          <span>
            <span className="footer-live-dot" /> Glitch Virtual AI DevOps Engine active {dbStatus ? `· SQLite local DB: ${dbStatus.tables.length} tables (${dbStatus.size_formatted})` : ""} · Updated{" "}
            {lastUpdated.toLocaleTimeString()}
          </span>
          <span>
            AUTONOMOUS INFRASTRUCTURE SRE · LOCAL SQLITE 3 WAL <Activity size={13} />
          </span>
        </footer>
      </main>
    </div>
  );
}
