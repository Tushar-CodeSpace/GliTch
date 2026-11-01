import { useState } from "react";
import { Server, Database, Container, Globe, RotateCcw, FileText, ChevronDown, ChevronUp, Bot } from "lucide-react";
import { Panel } from "../ui/Panel";
import { Button } from "../ui/Button";
import type { ServiceItem } from "../../types/devops";

type Props = {
  services: ServiceItem[];
  onRestartService: (id: string) => void;
  onAskGlitch: (query: string) => void;
};

export function ServicesView({ services, onRestartService, onAskGlitch }: Props) {
  const [selectedLogsId, setSelectedLogsId] = useState<string | null>(null);
  const [restartingId, setRestartingId] = useState<string | null>(null);

  function getCategoryIcon(cat: ServiceItem["category"]) {
    switch (cat) {
      case "database": return <Database size={15} />;
      case "proxy": return <Globe size={15} />;
      case "container": return <Container size={15} />;
      default: return <Server size={15} />;
    }
  }

  function handleRestart(id: string) {
    setRestartingId(id);
    setTimeout(() => {
      onRestartService(id);
      setRestartingId(null);
    }, 1200);
  }

  return (
    <div className="devops-subview">
      <div className="subview-header">
        <div>
          <div className="eyebrow"><span className="eyebrow-line" /> LOCAL ORCHESTRATION</div>
          <h1>Services & <span className="text-accent">Containers.</span></h1>
          <p>Real-time telemetry, memory profiles, and live process inspection managed by Glitch.</p>
        </div>

        <Button
          variant="secondary"
          onClick={() => onAskGlitch("Audit all running services and detect any resource leaks")}
        >
          <Bot size={14} className="text-accent" /> Glitch Health Audit
        </Button>
      </div>

      <div className="services-grid">
        {services.length === 0 && (
          <Panel className="empty-state-card" style={{ gridColumn: "1 / -1", textAlign: "center", padding: "3rem 1.5rem" }}>
            <Server size={36} className="text-muted" style={{ margin: "0 auto 1rem auto", display: "block" }} />
            <h3 style={{ fontSize: "1.1rem", marginBottom: "0.5rem" }}>No Monitored Services Registered</h3>
            <p style={{ color: "var(--color-muted)", fontSize: "0.9rem", maxWidth: "480px", margin: "0 auto" }}>
              Local containers and microservices will automatically appear here once registered with GliTch or detected via daemon metrics.
            </p>
          </Panel>
        )}
        {services.map((service) => {
          const isLogsOpen = selectedLogsId === service.id;
          const isRestarting = restartingId === service.id;

          return (
            <Panel key={service.id} className={`service-card status-${service.status}`}>
              <div className="service-card-top">
                <div className="service-icon-box">
                  {getCategoryIcon(service.category)}
                </div>
                <div className="service-name-box">
                  <div className="service-name-row">
                    <h3>{service.name}</h3>
                    <span className={`status-chip ${service.status}`}>
                      <span className="dot" />
                      {service.status.toUpperCase()}
                    </span>
                  </div>
                  <span className="service-version">{service.version} · Port: {service.port}</span>
                </div>
              </div>

              <div className="service-metrics-row">
                <div className="service-metric">
                  <span className="metric-name">CPU</span>
                  <strong>{service.cpu.toFixed(1)}%</strong>
                  <div className="mini-meter">
                    <span style={{ width: `${Math.min(100, service.cpu * 2)}%` }} />
                  </div>
                </div>
                <div className="service-metric">
                  <span className="metric-name">MEMORY</span>
                  <strong>{service.memory}</strong>
                </div>
                <div className="service-metric">
                  <span className="metric-name">UPTIME</span>
                  <strong>{service.uptime}</strong>
                </div>
              </div>

              <div className="service-card-footer">
                <button
                  className="log-toggle-btn"
                  onClick={() => setSelectedLogsId(isLogsOpen ? null : service.id)}
                >
                  <FileText size={13} />
                  <span>{isLogsOpen ? "Hide Logs" : "View Logs"}</span>
                  {isLogsOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                </button>

                <div className="service-action-btns">
                  <Button
                    variant="secondary"
                    className="service-btn"
                    disabled={isRestarting}
                    onClick={() => handleRestart(service.id)}
                  >
                    <RotateCcw size={12} className={isRestarting ? "spin" : ""} />
                    {isRestarting ? "Restarting..." : "Restart"}
                  </Button>
                  <button
                    className="glitch-inspect-btn"
                    title="Ask Glitch to diagnose this service"
                    onClick={() => onAskGlitch(`Diagnose and optimize service ${service.name}`)}
                  >
                    <Bot size={13} />
                  </button>
                </div>
              </div>

              {isLogsOpen && service.logs && (
                <div className="service-logs-drawer">
                  <div className="logs-drawer-header">
                    <span>LIVE LOG STREAM ({service.name})</span>
                  </div>
                  <pre className="logs-stream-content">
                    {service.logs.map((log, idx) => (
                      <div key={idx} className="log-line">{log}</div>
                    ))}
                  </pre>
                </div>
              )}
            </Panel>
          );
        })}
      </div>
    </div>
  );
}
