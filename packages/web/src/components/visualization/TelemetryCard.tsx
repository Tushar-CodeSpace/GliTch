import { Cpu, Server, HardDrive, Clock } from "lucide-react";

type Props = {
  label: "CPU" | "MEMORY" | "DISK" | "UPTIME";
  value: string;
  percent?: number;
  isLive: boolean;
};

export function TelemetryCard({ label, value, percent, isLive }: Props) {
  const getIcon = () => {
    switch (label) {
      case "CPU":
        return <Cpu size={14} className="telemetry-icon" />;
      case "MEMORY":
        return <Server size={14} className="telemetry-icon" />;
      case "DISK":
        return <HardDrive size={14} className="telemetry-icon" />;
      case "UPTIME":
        return <Clock size={14} className="telemetry-icon" />;
    }
  };

  return (
    <div className="telemetry-strip-card">
      <div className="telemetry-strip-header">
        <div className="telemetry-strip-title">
          {getIcon()}
          <span className="telemetry-label">{label}</span>
        </div>
        <span className={`telemetry-status-tag ${isLive ? "live" : "demo"}`}>
          {isLive ? "LIVE" : "DEMO"}
        </span>
      </div>

      <div className="telemetry-value-row">
        <strong className="telemetry-main-value">{value}</strong>
      </div>

      <div className="telemetry-progress-track">
        <div
          className="telemetry-progress-bar"
          style={{ width: `${Math.max(5, Math.min(100, percent ?? 60))}%` }}
        />
      </div>
    </div>
  );
}
