export type Severity = "critical" | "warning" | "info";

export type Incident = {
  id: string;
  title: string;
  description: string;
  severity: Severity;
  service: string;
  timestamp: string;
  status: "active" | "investigating" | "resolved";
  suggestedAction: string;
  command: string;
  impact: string;
};

export type ServiceStatus = "running" | "degraded" | "stopped";

export type ServiceItem = {
  id: string;
  name: string;
  category: "container" | "database" | "proxy" | "worker" | "api";
  status: ServiceStatus;
  cpu: number;
  memory: string;
  uptime: string;
  port: string;
  version: string;
  logs?: string[];
};

export type PipelineStatus = "success" | "running" | "failed" | "queued";

export type PipelineStep = {
  name: string;
  status: PipelineStatus;
  duration?: string;
};

export type PipelineItem = {
  id: string;
  name: string;
  branch: string;
  commit: string;
  status: PipelineStatus;
  duration: string;
  triggeredBy: string;
  updatedAt: string;
  steps: PipelineStep[];
};

export type ChatMessage = {
  id: string;
  sender: "user" | "glitch";
  text: string;
  timestamp: string;
  command?: string;
  commandOutput?: string;
  isActionable?: boolean;
  actionLabel?: string;
  actionId?: string;
  actionExecuted?: boolean;
  tags?: string[];
};

export type NavigationTab = "overview" | "copilot" | "services" | "pipelines" | "incidents" | "terminal";

