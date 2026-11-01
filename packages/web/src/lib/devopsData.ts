import type { Incident, ServiceItem, PipelineItem, ChatMessage } from "../types/devops";

export const initialIncidents: Incident[] = [];

export const initialServices: ServiceItem[] = [];

export const initialPipelines: PipelineItem[] = [];

export const initialChatMessages: ChatMessage[] = [
  {
    id: "msg-welcome",
    sender: "glitch",
    text: "Welcome to GliTch! ⚡\n\nI'm your autonomous AI DevOps & SRE assistant. I am connected directly to your host daemon and local SQLite database.\n\nAsk me to run a health audit, inspect system resources, review active logs, or automate local infrastructure workflows.",
    timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    command: "glitch status",
    commandOutput: "✔ Host Vitals: Active\n✔ SQLite Database: Connected (WAL Mode)\n✔ Zero Active Incidents\n✔ Subsystems nominal",
    isActionable: false,
    tags: ["DevOps AI", "Online"],
  },
];

export function generateGlitchResponse(prompt: string): ChatMessage {
  const lower = prompt.toLowerCase();
  const timestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  if (lower.includes("memory") || lower.includes("ram") || lower.includes("swap")) {
    return {
      id: "msg-" + Date.now(),
      sender: "glitch",
      text: "Inspecting host memory distribution and active process allocations.\n\nYour host RAM utilization is within safe thresholds. No anomalous leaks or OOM kill risks detected.",
      timestamp,
      command: "glitch metrics --memory",
      commandOutput: "✔ Memory allocation nominal\n✔ Swap usage healthy\n✔ Zero runaway processes detected",
      isActionable: false,
      tags: ["Host Vitals", "Memory"],
    };
  }

  if (lower.includes("docker") || lower.includes("disk") || lower.includes("prune") || lower.includes("cache")) {
    return {
      id: "msg-" + Date.now(),
      sender: "glitch",
      text: "Inspecting container storage layers and host disk partitions.\n\nYou can run a safe prune to remove unused build layers and expired logs.",
      timestamp,
      command: "docker system df",
      commandOutput: "TYPE            TOTAL     ACTIVE    SIZE      RECLAIMABLE\nImages          0         0         0B        0B\nContainers      0         0         0B        0B\nLocal Volumes   0         0         0B        0B\nBuild Cache     0         0         0B        0B",
      isActionable: true,
      actionLabel: "Reclaim Storage",
      actionId: "prune-storage",
      tags: ["Storage", "Disk Audit"],
    };
  }

  if (lower.includes("triage") || lower.includes("incident") || lower.includes("scan") || lower.includes("audit")) {
    return {
      id: "msg-" + Date.now(),
      sender: "glitch",
      text: "Running autonomous Incident Triage across all local services and host kernel telemetry.\n\n✔ Zero active incidents or unhandled exceptions detected.\n✔ All local subsystems and daemons are operating normally.",
      timestamp,
      command: "glitch triage",
      commandOutput: "⚡ ACTIVE INCIDENT TRIAGE:\n✔ Zero active incidents detected. All local subsystems nominal.",
      isActionable: false,
      tags: ["Autonomous Triage", "SRE"],
    };
  }

  if (lower.includes("ci") || lower.includes("pipeline") || lower.includes("deploy") || lower.includes("build")) {
    return {
      id: "msg-" + Date.now(),
      sender: "glitch",
      text: "Checking continuous delivery runners and pipeline triggers.\n\nNo pipeline builds are currently queued. Connect your Git webhooks or run a local build to track pipeline telemetry.",
      timestamp,
      command: "glitch pipeline list",
      commandOutput: "Pipeline Runners: Ready\nActive Queues: 0 pending",
      isActionable: false,
      tags: ["CI/CD"],
    };
  }

  if (lower.includes("security") || lower.includes("port") || lower.includes("firewall")) {
    return {
      id: "msg-" + Date.now(),
      sender: "glitch",
      text: "Running localized network port scan and host security check.\n\n• Local daemon is bound to 127.0.0.1:4780.\n• Local SQLite database is protected with file permissions 0640.\n• Host communication is sandboxed and private.",
      timestamp,
      command: "glitch security audit --local-only",
      commandOutput: "PORT AUDIT:\n127.0.0.1:4780 -> glitch-daemon (authenticated)\nLocal-only air-gapped security posture: Optimal",
      isActionable: false,
      tags: ["Security", "Hardening"],
    };
  }

  return {
    id: "msg-" + Date.now(),
    sender: "glitch",
    text: `Understood! As your virtual DevOps engineer, I can inspect host vitals, track background services, run incident triage, and manage local deployments.\n\nHow can I assist you with your infrastructure today?`,
    timestamp,
    command: `glitch query "${prompt}"`,
    commandOutput: `[GLITCH AI] Command processed.\nContext: Local machine · Zero open incidents\nReady for next instruction.`,
    isActionable: false,
    tags: ["DevOps Copilot"],
  };
}
