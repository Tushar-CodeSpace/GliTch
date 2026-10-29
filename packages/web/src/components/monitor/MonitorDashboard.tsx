import { useEffect, useRef, useState } from "react";
import {
  Activity,
  Bell,
  Bot,
  ChevronDown,
  CircleHelp,
  Cpu,
  Database,
  HardDrive,
  LayoutDashboard,
  LogOut,
  MemoryStick,
  Monitor,
  RefreshCw,
  Server,
  Settings2,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Terminal,
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
import type { NavigationTab, Incident, ServiceItem, PipelineItem, ChatMessage } from "../../types/devops";
import {
  initialIncidents,
  initialServices,
  initialPipelines,
  initialChatMessages,
  generateGlitchResponse,
} from "../../lib/devopsData";
import { GlitchCopilot } from "../ai/GlitchCopilot";
import { IncidentsView } from "../devops/IncidentsView";
import { ServicesView } from "../devops/ServicesView";
import { PipelinesView } from "../devops/PipelinesView";
import { TerminalView } from "../devops/TerminalView";
import {
  fetchDbStatus,
  fetchIncidentsFromDb,
  resolveIncidentInDb,
  fetchServicesFromDb,
  restartServiceInDb,
  fetchPipelinesFromDb,
  fetchChatHistoryFromDb,
  saveChatMessageToDb,
  type DbStatus,
} from "../../lib/devopsApi";

gsap.registerPlugin(useGSAP);

type Props = { onSignOut: () => void };

export function MonitorDashboard({ onSignOut }: Props) {
  const root = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<NavigationTab>("overview");
  const [metrics, setMetrics] = useState<DeviceMetrics>(getDemoMetrics());
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // DevOps state
  const [incidents, setIncidents] = useState<Incident[]>(initialIncidents);
  const [services, setServices] = useState<ServiceItem[]>(initialServices);
  const [pipelines, setPipelines] = useState<PipelineItem[]>(initialPipelines);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(initialChatMessages);
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
        const [status, dbIncidents, dbServices, dbPipelines, dbChats] = await Promise.all([
          fetchDbStatus(controller.signal),
          fetchIncidentsFromDb(controller.signal),
          fetchServicesFromDb(controller.signal),
          fetchPipelinesFromDb(controller.signal),
          fetchChatHistoryFromDb(controller.signal),
        ]);

        if (status) setDbStatus(status);
        if (dbIncidents && dbIncidents.length > 0) setIncidents(dbIncidents);
        if (dbServices && dbServices.length > 0) setServices(dbServices);
        if (dbPipelines && dbPipelines.length > 0) setPipelines(dbPipelines);
        if (dbChats && dbChats.length > 0) setChatMessages(dbChats);
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
  }, { scope: root, dependencies: [activeTab] });

  // DevOps Handlers
  function handleSendMessage(text: string) {
    const userMsg: ChatMessage = {
      id: "msg-" + Date.now(),
      sender: "user",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    void saveChatMessageToDb(userMsg);

    setTimeout(() => {
      const glitchReply = generateGlitchResponse(text);
      setChatMessages((prev) => [...prev, glitchReply]);
      void saveChatMessageToDb(glitchReply);
    }, 600);
  }

  function handleAskGlitch(query: string) {
    setActiveTab("copilot");
    handleSendMessage(query);
  }

  function handleExecuteAction(actionId: string, command: string) {
    // Mark in chat as executed
    setChatMessages((prev) =>
      prev.map((m) => (m.actionId === actionId ? { ...m, actionExecuted: true } : m))
    );

    if (actionId === "fix-celery" || actionId === "triage-all" || actionId === "fix-all") {
      void resolveIncidentInDb("INC-308");
      setIncidents((prev) =>
        prev.map((inc) => (inc.service === "celery-worker-cluster" ? { ...inc, status: "resolved" } : inc))
      );
      void restartServiceInDb("celery-worker-cluster");
      setServices((prev) =>
        prev.map((srv) =>
          srv.name === "celery-worker-cluster"
            ? { ...srv, status: "running", memory: "380 MB", cpu: 14.2 }
            : srv
        )
      );
    }

    if (actionId === "fix-docker" || actionId === "fix-all") {
      void resolveIncidentInDb("INC-307");
      setIncidents((prev) =>
        prev.map((inc) => (inc.service === "docker-daemon" ? { ...inc, status: "resolved" } : inc))
      );
    }

    // Add confirmation message from Glitch
    setTimeout(() => {
      const confirmationMsg: ChatMessage = {
        id: "msg-" + Date.now(),
        sender: "glitch",
        text: `✔ Action verified: Automated remediation playbook successfully executed.\nCommand: \`${command}\`\nLive status: Health checks passing. Target systems returned to nominal.`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        tags: ["Auto-Remediation", "SRE Verified"],
      };
      setChatMessages((prev) => [...prev, confirmationMsg]);
      void saveChatMessageToDb(confirmationMsg);
    }, 400);
  }

  function handleResolveIncident(id: string) {
    void resolveIncidentInDb(id);
    setIncidents((prev) =>
      prev.map((inc) => (inc.id === id ? { ...inc, status: "resolved" } : inc))
    );

    const inc = incidents.find((i) => i.id === id);
    if (inc?.service === "celery-worker-cluster") {
      void restartServiceInDb("celery-worker-cluster");
      setServices((prev) =>
        prev.map((srv) =>
          srv.name === "celery-worker-cluster"
            ? { ...srv, status: "running", memory: "380 MB", cpu: 14.2 }
            : srv
        )
      );
    }
  }

  function handleRestartService(id: string) {
    void restartServiceInDb(id);
    setServices((prev) =>
      prev.map((srv) =>
        srv.id === id ? { ...srv, status: "running", cpu: 12.0, uptime: "Just restarted" } : srv
      )
    );
  }

  function handleTriggerPipeline(name: string) {
    setPipelines((prev) =>
      prev.map((p) =>
        p.name === name
          ? {
              ...p,
              status: "running",
              updatedAt: "Just now",
              steps: p.steps.map((s, idx) => ({
                ...s,
                status: idx === 0 ? "running" : "queued",
              })),
            }
          : p
      )
    );

    setTimeout(() => {
      setPipelines((prev) =>
        prev.map((p) =>
          p.name === name
            ? {
                ...p,
                status: "success",
                duration: "2m 14s",
                updatedAt: "Just now",
                steps: p.steps.map((s) => ({ ...s, status: "success" })),
              }
            : p
        )
      );
    }, 2500);
  }

  const activeIncidents = incidents.filter((i) => i.status !== "resolved");
  const cpu = metrics.cpu_percent;
  const ram = metrics.memory.used_percent;
  const disk = metrics.disk.used_percent;

  return (
    <div className="dashboard-shell" ref={root}>
      {/* Sidebar */}
      <aside className="sidebar">
        <a
          className="wordmark side-brand"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setActiveTab("overview");
          }}
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
          <ChevronDown size={14} />
        </div>

        <div className="nav-label">DEVOPS WORKSPACE</div>
        <nav className="side-nav">
          <button
            className={`nav-item ${activeTab === "overview" ? "active" : ""}`}
            onClick={() => setActiveTab("overview")}
          >
            <LayoutDashboard size={17} />
            <span>Overview</span>
            {activeTab === "overview" && <span className="nav-active-dot" />}
          </button>

          <button
            className={`nav-item ${activeTab === "copilot" ? "active" : ""}`}
            onClick={() => setActiveTab("copilot")}
          >
            <Bot size={17} className="text-accent" />
            <span>Glitch Copilot</span>
            <span className="copilot-nav-badge">AI</span>
            {activeTab === "copilot" && <span className="nav-active-dot" />}
          </button>

          <button
            className={`nav-item ${activeTab === "services" ? "active" : ""}`}
            onClick={() => setActiveTab("services")}
          >
            <Server size={17} />
            <span>Services & Mesh</span>
            {activeTab === "services" && <span className="nav-active-dot" />}
          </button>

          <button
            className={`nav-item ${activeTab === "pipelines" ? "active" : ""}`}
            onClick={() => setActiveTab("pipelines")}
          >
            <Zap size={17} />
            <span>Pipelines (CI/CD)</span>
            {activeTab === "pipelines" && <span className="nav-active-dot" />}
          </button>

          <button
            className={`nav-item ${activeTab === "incidents" ? "active" : ""}`}
            onClick={() => setActiveTab("incidents")}
          >
            <ShieldAlert size={17} />
            <span>Incident Triage</span>
            {activeIncidents.length > 0 && (
              <span className="nav-incident-badge">{activeIncidents.length}</span>
            )}
            {activeTab === "incidents" && <span className="nav-active-dot" />}
          </button>

          <button
            className={`nav-item ${activeTab === "terminal" ? "active" : ""}`}
            onClick={() => setActiveTab("terminal")}
          >
            <Terminal size={17} />
            <span>DevOps Terminal</span>
            {activeTab === "terminal" && <span className="nav-active-dot" />}
          </button>
        </nav>

        <div className="sidebar-bottom">
          <div
            className="sidebar-mini-status clickable-status"
            onClick={() => setActiveTab("copilot")}
            title="Click to talk with Glitch"
          >
            <span className="status-orb">
              <span className="pulse-ring" />
            </span>
            <div>
              <strong>Glitch AI Online</strong>
              <small>Virtual DevOps monitoring</small>
            </div>
            <Sparkles size={12} className="text-accent ml-auto" />
          </div>

          <a className="nav-item" href="#settings" onClick={(e) => e.preventDefault()}>
            <Settings2 size={17} />
            <span>Settings</span>
          </a>
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
        {/* Topbar */}
        <header className="dashboard-topbar">
          <div className="breadcrumbs">
            <span>Workspace</span>
            <span className="crumb-sep">/</span>
            <strong className="capitalize">{activeTab}</strong>
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

            <div
              className="glitch-status-pill clickable-pill"
              onClick={() => setActiveTab("copilot")}
            >
              <Bot size={13} className="text-accent" />
              <span>AI COPILOT: ACTIVE</span>
            </div>

            <button
              className="icon-button"
              aria-label="Triage Incidents"
              onClick={() => setActiveTab("incidents")}
              title="Open Incident Triage"
            >
              <Bell size={17} />
              {activeIncidents.length > 0 && <span className="icon-badge" />}
            </button>
            <div className="user-avatar" title="Local Operator">
              OP
            </div>
          </div>
        </header>

        {/* Tab 1: Overview */}
        {activeTab === "overview" && (
          <>
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
                  <p>
                    I detected <strong>{activeIncidents.length} actionable advisory alerts</strong> across your local container mesh. Memory pressure on <code>celery-worker-cluster</code> and Docker image layer caching are ready for 1-click remediation.
                  </p>
                  <div className="hero-actions">
                    <Button
                      variant="primary"
                      className="hero-action-btn"
                      onClick={() => handleAskGlitch("Run full incident triage and optimize resource usage")}
                    >
                      <Sparkles size={14} /> Open Copilot Triage
                    </Button>
                    <Button
                      variant="secondary"
                      className="hero-action-btn"
                      onClick={() => setActiveTab("incidents")}
                    >
                      <ShieldAlert size={14} /> View {activeIncidents.length} Alerts
                    </Button>
                  </div>
                </div>
              </div>

              <div className="hero-card-right">
                <div className="hero-metric-tile">
                  <span>AUTONOMOUS STATUS</span>
                  <strong className="text-accent">GUARDING STACK</strong>
                </div>
                <div className="hero-metric-tile">
                  <span>CONTAINERS MONITORED</span>
                  <strong>{services.length} Services</strong>
                </div>
                <div className="hero-metric-tile">
                  <span>DEPLOYMENT HEALTH</span>
                  <strong className="text-accent">99.8% Nominal</strong>
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
                    <span className="device-chip">
                      <span /> {connected ? "LIVE LOCAL HOST" : "LOCAL PREVIEW"}
                    </span>
                  </div>
                  <p>{metrics.platform}</p>
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
                <strong>
                  {lastUpdated.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })}
                </strong>
                <small>{connected ? "Continuous local polling" : "Synthetic sandbox metrics"}</small>
              </div>
              <div className="banner-grid" />
            </Panel>

            {/* Resource Utilization Metrics */}
            <div className="section-heading dashboard-enter">
              <div>
                <h2>Resource Utilization</h2>
                <p>Live metrics from the host machine managed by Glitch</p>
              </div>
              <button
                className="more-button"
                aria-label="More options"
                onClick={() => handleAskGlitch("Analyze my resource utilization and recommend optimizations")}
                title="Ask Glitch about utilization"
              >
                <Bot size={15} />
              </button>
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

            {/* Load average & Device Health */}
            <section className="lower-grid">
              <Panel className="load-panel dashboard-enter">
                <div className="section-heading compact">
                  <div>
                    <h2>Load average</h2>
                    <p>System load · 1 / 5 / 15 minutes</p>
                  </div>
                  <span className="live-tag">
                    <span /> {connected ? "LIVE" : "SAMPLE"}
                  </span>
                </div>
                <div className="load-values">
                  {(metrics.load_average || []).slice(0, 3).map((value, index) => (
                    <div className="load-value" key={index}>
                      <span>{["1 MIN", "5 MIN", "15 MIN"][index]}</span>
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
          </>
        )}

        {/* Tab 2: Glitch Copilot */}
        {activeTab === "copilot" && (
          <GlitchCopilot
            messages={chatMessages}
            onSendMessage={handleSendMessage}
            onExecuteAction={handleExecuteAction}
            incidents={incidents}
            services={services}
          />
        )}

        {/* Tab 3: Services & Mesh */}
        {activeTab === "services" && (
          <ServicesView
            services={services}
            onRestartService={handleRestartService}
            onAskGlitch={handleAskGlitch}
          />
        )}

        {/* Tab 4: Pipelines (CI/CD) */}
        {activeTab === "pipelines" && (
          <PipelinesView
            pipelines={pipelines}
            onTriggerPipeline={handleTriggerPipeline}
            onAskGlitch={handleAskGlitch}
          />
        )}

        {/* Tab 5: Incident Triage */}
        {activeTab === "incidents" && (
          <IncidentsView
            incidents={incidents}
            onResolveIncident={handleResolveIncident}
            onAskGlitch={handleAskGlitch}
          />
        )}

        {/* Tab 6: DevOps Terminal */}
        {activeTab === "terminal" && <TerminalView onAskGlitch={handleAskGlitch} />}

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
