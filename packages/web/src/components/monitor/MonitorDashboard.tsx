import { useEffect, useRef, useState } from "react";
import {
  Activity,
  Bot,
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
} from "lucide-react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { MetricCard } from "./MetricCard";
import { Panel } from "../ui/Panel";
import { Button } from "../ui/Button";
import { fetchMetrics, getDemoMetrics, type DeviceMetrics } from "../../lib/metrics";
import { formatBytes, formatUptime } from "../../lib/utils";
import type { Incident, ServiceItem } from "../../types/devops";
import {
  initialIncidents,
  initialServices,
} from "../../lib/devopsData";
import {
  fetchDbStatus,
  fetchIncidentsFromDb,
  fetchServicesFromDb,
  type DbStatus,
} from "../../lib/devopsApi";

gsap.registerPlugin(useGSAP);

type Props = { onSignOut: () => void };

export function MonitorDashboard({ onSignOut }: Props) {
  const root = useRef<HTMLDivElement>(null);
  const [metrics, setMetrics] = useState<DeviceMetrics>(getDemoMetrics());
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // DevOps state
  const [incidents, setIncidents] = useState<Incident[]>(initialIncidents);
  const [services, setServices] = useState<ServiceItem[]>(initialServices);
  const [dbStatus, setDbStatus] = useState<DbStatus | null>(null);

  async function refresh() {
    setLoading(true);
    try {
      const controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), 2500);
      try {
        const data = await fetchMetrics(controller.signal);
        setMetrics(data);
        setConnected(true);

        // Fetch live state from local SQLite daemon
        const [status, dbIncidents, dbServices] = await Promise.all([
          fetchDbStatus(controller.signal),
          fetchIncidentsFromDb(controller.signal),
          fetchServicesFromDb(controller.signal),
        ]);

        if (status) setDbStatus(status);
        if (dbIncidents && dbIncidents.length > 0) setIncidents(dbIncidents);
        if (dbServices && dbServices.length > 0) setServices(dbServices);
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

  useEffect(() => {
    void refresh();
    const timer = window.setInterval(() => void refresh(), 5000);
    return () => window.clearInterval(timer);
  }, []);

  useGSAP(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.fromTo(
      ".dashboard-enter",
      { y: 10, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.45, stagger: 0.06, ease: "power2.out" }
    );
    gsap.to(".pulse-ring", { scale: 1.25, opacity: 0, duration: 1.7, repeat: -1, ease: "power1.out" });
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
          className="wordmark side-brand"
          href="#"
          onClick={(e) => e.preventDefault()}
        >
          <span className="brand-mark">
            <Activity size={18} strokeWidth={2.5} />
          </span>
          <div className="side-brand-text">
            <span>glitch<span className="wordmark-period">.</span></span>
            <span className="ai-submark">VIRTUAL DEVOPS</span>
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
        </div>

        <div className="nav-label">DEVOPS WORKSPACE</div>
        <nav className="side-nav">
          <button
            className="nav-item active"
            onClick={() => {}}
          >
            <LayoutDashboard size={17} />
            <span>Overview</span>
            <span className="nav-active-dot" />
          </button>
        </nav>

        <div className="sidebar-bottom">
          <button className="nav-item signout" onClick={onSignOut}>
            <LogOut size={17} />
            <span>Sign out</span>
          </button>
          <div className="sidebar-version">
            <span>GLITCH / 0.1.0-AI</span>
            <span className="version-light">VIRTUAL SRE</span>
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

            <div className="user-avatar" title="Local Operator">
              OP
            </div>
          </div>
        </header>

        {/* Cockpit Overview Content */}
        <section className="dashboard-heading dashboard-enter">
          <div>
            <div className="eyebrow">
              <span className="eyebrow-line" /> AUTONOMOUS INFRASTRUCTURE INTELLIGENCE
            </div>
            <h1>
              Virtual DevOps <span className="text-accent">Cockpit.</span>
            </h1>
            <p>
              Glitch continuously analyzes host vitals, inspects container networks, and automates incident remediation.
            </p>
          </div>
          <Button
            variant="secondary"
            className="refresh-button"
            onClick={() => void refresh()}
            disabled={loading}
          >
            <RefreshCw size={14} className={loading ? "spin" : ""} /> Refresh
          </Button>
        </section>

        {/* Virtual DevOps AI Hero Banner */}
        <Panel className="glitch-ai-hero-card dashboard-enter">
          <div className="hero-card-left">
            <div className="hero-ai-avatar">
              <Bot size={28} />
              <span className="hero-pulse" />
            </div>
            <div className="hero-copy">
              <div className="hero-badge-row">
                <h2>Glitch Virtual DevOps Engineer</h2>
                <span className="hero-ai-chip">NEURAL SRE ENGINE</span>
              </div>
              {activeIncidents.length > 0 ? (
                <p>
                  I detected <strong>{activeIncidents.length} actionable advisory alert{activeIncidents.length === 1 ? "" : "s"}</strong> across your local host.
                </p>
              ) : (
                <p>
                  All systems operational. No active incidents or memory leaks detected across your local host.
                </p>
              )}
              <div className="hero-actions">
                <Button
                  variant="primary"
                  className="hero-action-btn"
                  onClick={() => void refresh()}
                  disabled={loading}
                >
                  <Sparkles size={14} /> Run Host Telemetry Audit
                </Button>
              </div>
            </div>
          </div>

          <div className="hero-card-right">
            <div className="hero-metric-tile">
              <span>AUTONOMOUS STATUS</span>
              <strong className={activeIncidents.length > 0 ? "text-amber" : "text-accent"}>
                {activeIncidents.length > 0 ? "ATTENTION REQUIRED" : "ALL SYSTEMS NOMINAL"}
              </strong>
            </div>
            <div className="hero-metric-tile">
              <span>SERVICES MONITORED</span>
              <strong>{services.length} Service{services.length === 1 ? "" : "s"}</strong>
            </div>
            <div className="hero-metric-tile">
              <span>DEPLOYMENT HEALTH</span>
              <strong className={activeIncidents.length > 0 ? "text-amber" : "text-accent"}>
                {activeIncidents.length > 0 ? "Action Needed" : "100.0% Nominal"}
              </strong>
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
              </div>
              <p>
                {metrics.platform}
              </p>
              <div className="device-meta">
                <span>
                  <Wifi size={13} /> Local device
                </span>
                <span>
                  <ShieldCheck size={13} /> Private & air-gapped
                </span>
                <span>
                  <Activity size={13} /> Uptime {formatUptime(metrics.uptime_seconds)}
                </span>
              </div>
            </div>
          </div>

          <div className="device-banner-right">
            <span className="device-meta-label">TELEMETRY SYNC</span>
            <strong>{lastUpdated.toLocaleTimeString()}</strong>
            <small>Continuous local polling</small>
          </div>

          <div className="banner-grid" />
        </Panel>

        {/* Hardware Resource Utilization */}
        <div className="section-heading dashboard-enter">
          <div>
            <h2>Resource Utilization</h2>
            <p>Live metrics from the host machine managed by Glitch</p>
          </div>
        </div>

        <section className="metric-grid dashboard-enter">
          <MetricCard
            label="CPU LOAD"
            value={cpu.toFixed(1)}
            detail="%"
            percent={cpu}
            icon={<Cpu size={17} />}
            trend={cpu > 75 ? "up" : "steady"}
          />
          <MetricCard
            label="MEMORY"
            value={ram.toFixed(1)}
            detail="%"
            percent={ram}
            icon={<MemoryStick size={17} />}
            trend={ram > 85 ? "up" : "steady"}
          />
          <MetricCard
            label="DISK USAGE"
            value={disk.toFixed(1)}
            detail="%"
            percent={disk}
            icon={<HardDrive size={17} />}
            trend={disk > 90 ? "up" : "steady"}
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
                <span className="pulse-dot" /> LIVE
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
                    <i style={{ width: `${Math.min(100, value * 20)}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="load-note">
              <Activity size={14} />
              <span>
                RAM available: {formatBytes(metrics.memory.total_bytes - metrics.memory.used_bytes)} of{" "}
                {formatBytes(metrics.memory.total_bytes)}
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
              <span className="health-name">CPU Pressure</span>
              <span className={`health-state ${cpu > 85 ? "warning" : ""}`}>
                <i />
                {cpu > 85 ? "HIGH" : "NORMAL"}
              </span>
            </div>
            <div className="health-row">
              <span className="health-icon">
                <MemoryStick size={15} />
              </span>
              <span className="health-name">Memory Pressure</span>
              <span className={`health-state ${ram > 90 ? "warning" : ""}`}>
                <i />
                {ram > 90 ? "HIGH" : "NORMAL"}
              </span>
            </div>
            <div className="health-row">
              <span className="health-icon">
                <HardDrive size={15} />
              </span>
              <span className="health-name">Disk Pressure</span>
              <span className={`health-state ${disk > 90 ? "warning" : ""}`}>
                <i />
                {disk > 90 ? "HIGH" : "NORMAL"}
              </span>
            </div>
            <div className="health-footer">
              <ShieldCheck size={14} /> Glitch AI SRE active. Sandboxed on local host.
            </div>
          </Panel>
        </section>

        {/* Footer */}
        <footer className="dashboard-footer">
          <span>
            <span className="footer-live-dot" /> Glitch Virtual AI DevOps Engine active {dbStatus ? `· SQLite local DB: ${dbStatus.tables.length} tables` : ""} · Updated{" "}
            {lastUpdated.toLocaleTimeString()}
          </span>
          <span>
            AUTONOMOUS INFRASTRUCTURE SRE {dbStatus ? "· LOCAL SQLITE" : ""} <Activity size={13} />
          </span>
        </footer>
      </main>
    </div>
  );
}
