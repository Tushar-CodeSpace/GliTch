import type { Incident, ServiceItem, PipelineItem, ChatMessage } from "../types/devops";

export const initialIncidents: Incident[] = [
  {
    id: "INC-308",
    title: "Celery Worker Memory Leak & OOM Risk",
    description: "worker-pool-2 resident memory escalated past 1.4 GB threshold following asynchronous batch indexing.",
    severity: "critical",
    service: "celery-worker-cluster",
    timestamp: "6m ago",
    status: "active",
    suggestedAction: "Gracefully rolling restart worker-pool-2 and enforce max-tasks-per-child=1000",
    command: "glitch remediate worker-pool-2 --graceful --recycle-workers",
    impact: "Job processing latency degraded by +420ms",
  },
  {
    id: "INC-307",
    title: "Docker Disk Space Warning (>82%)",
    description: "Dangling build cache and unused container layers occupying 22.4 GB in /var/lib/docker.",
    severity: "warning",
    service: "docker-daemon",
    timestamp: "24m ago",
    status: "active",
    suggestedAction: "Prune dangling images and expired buildkit cache",
    command: "docker system prune --volumes -f",
    impact: "Root volume I/O throttling imminent",
  },
  {
    id: "INC-305",
    title: "SSL Certificate Expiring in 5 Days",
    description: "TLS wildcard cert for *.glitch.internal expires on Nov 3, 2026.",
    severity: "info",
    service: "ingress-nginx",
    timestamp: "2h ago",
    status: "active",
    suggestedAction: "Trigger automated certbot renew sequence via Let's Encrypt DNS-01",
    command: "glitch certs renew *.glitch.internal --provider cloudflare",
    impact: "No current outage; proactive maintenance",
  },
];

export const initialServices: ServiceItem[] = [
  {
    id: "srv-1",
    name: "ingress-nginx",
    category: "proxy",
    status: "running",
    cpu: 4.2,
    memory: "184 MB",
    uptime: "14d 6h",
    port: "443 / 80",
    version: "v1.9.4-alpine",
    logs: [
      "[INFO] 192.168.1.45 GET /api/v1/health 200 4ms",
      "[INFO] TLS handshake successful for worker-02",
      "[INFO] Reloaded configuration from dynamic upstream map",
    ],
  },
  {
    id: "srv-2",
    name: "api-gateway",
    category: "api",
    status: "running",
    cpu: 12.8,
    memory: "412 MB",
    uptime: "4d 19h",
    port: "8080",
    version: "node-22.4.1",
    logs: [
      "[INFO] Fastify HTTP listening on 0.0.0.0:8080",
      "[METRIC] Req rate: 2,410 rps | Latency p95: 18ms",
      "[INFO] JWT validation cache warmed up (4,210 keys)",
    ],
  },
  {
    id: "srv-3",
    name: "postgres-primary",
    category: "database",
    status: "running",
    cpu: 18.5,
    memory: "1.82 GB",
    uptime: "28d 12h",
    port: "5432",
    version: "PostgreSQL 16.2",
    logs: [
      "[LOG] checkpoint starting: time",
      "[LOG] checkpoint complete: wrote 412 buffers (2.5%); 0 WAL file(s) added",
      "[LOG] autovacuum: vacuumed 4 tables, reclaimed 18 MB",
    ],
  },
  {
    id: "srv-4",
    name: "redis-cache",
    category: "database",
    status: "running",
    cpu: 6.1,
    memory: "680 MB",
    uptime: "28d 12h",
    port: "6379",
    version: "Redis 7.2.4",
    logs: [
      "[NOTICE] DB 0: 84,120 keys (0 volatile) in 131072 slots",
      "[NOTICE] 1 clients connected (0 replicas), 0 blocked clients",
    ],
  },
  {
    id: "srv-5",
    name: "celery-worker-cluster",
    category: "worker",
    status: "degraded",
    cpu: 44.7,
    memory: "1.42 GB",
    uptime: "18h 33m",
    port: "Internal",
    version: "Python 3.12 / Celery 5.4",
    logs: [
      "[WARN] worker-2 memory high: RSS 1,421MB > warn_threshold 1,200MB",
      "[INFO] Task tasks.index_repository[8f3b...] succeeded in 1.4s",
      "[WARN] Garbage collection pause: 230ms",
    ],
  },
  {
    id: "srv-6",
    name: "docker-daemon",
    category: "container",
    status: "running",
    cpu: 8.9,
    memory: "512 MB",
    uptime: "14d 6h",
    port: "unix:///var/run/docker.sock",
    version: "Docker 26.0.1",
    logs: [
      "[INFO] containerd runtime operational (containerd 1.7.15)",
      "[WARN] Free disk space on storage driver 'overlay2' below 18%",
    ],
  },
];

export const initialPipelines: PipelineItem[] = [
  {
    id: "pipe-109",
    name: "production-deploy",
    branch: "main",
    commit: "e0269ba",
    status: "success",
    duration: "3m 42s",
    triggeredBy: "glitch-ai (auto-merge)",
    updatedAt: "18m ago",
    steps: [
      { name: "Lint & Unit Tests", status: "success", duration: "48s" },
      { name: "Build Container & Scan CVEs", status: "success", duration: "1m 32s" },
      { name: "Canary Rollout (10%)", status: "success", duration: "42s" },
      { name: "Promote to 100% Traffic", status: "success", duration: "40s" },
    ],
  },
  {
    id: "pipe-110",
    name: "security-compliance-audit",
    branch: "infra/tighten-ports",
    commit: "9c314ae",
    status: "running",
    duration: "1m 15s",
    triggeredBy: "snyder",
    updatedAt: "Just now",
    steps: [
      { name: "Trivy Container Scan", status: "success", duration: "35s" },
      { name: "Terraform Drift Check", status: "running", duration: "40s" },
      { name: "IAM Least-Privilege Verification", status: "queued" },
    ],
  },
  {
    id: "pipe-108",
    name: "staging-nightly-e2e",
    branch: "develop",
    commit: "3f880dc",
    status: "failed",
    duration: "5m 12s",
    triggeredBy: "cron(0 2 * * *)",
    updatedAt: "6h ago",
    steps: [
      { name: "Database Seeding", status: "success", duration: "1m 10s" },
      { name: "Integration Test Matrix", status: "failed", duration: "3m 50s" },
      { name: "Teardown Ephemeral Stack", status: "success", duration: "12s" },
    ],
  },
];

export const initialChatMessages: ChatMessage[] = [
  {
    id: "msg-1",
    sender: "glitch",
    text: "Hey! I'm Glitch, your virtual AI DevOps engineer. ⚡\n\nI continuously monitor your infrastructure, container health, and deployment pipelines. I've finished a routine baseline audit of your local workspace. Everything is responsive, but I spotted a memory spike in `celery-worker-cluster` and 22.4 GB of reclaimable Docker cache.",
    timestamp: "10:14 AM",
    command: "glitch doctor --quick",
    commandOutput: "✔ CPU: 18.6% (Normal)\n✔ Memory: 47.2% (Moderate)\n⚠ Celery workers: worker-2 approaching memory limit\n⚠ Docker cache: 22.4 GB unused layers found\n✔ Network: 0 packet drops detected",
    isActionable: true,
    actionLabel: "Auto-Triage Incidents",
    actionId: "triage-all",
    tags: ["DevOps AI", "Health Check"],
  },
];

export function generateGlitchResponse(prompt: string): ChatMessage {
  const lower = prompt.toLowerCase();
  const timestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  if (lower.includes("memory") || lower.includes("ram") || lower.includes("celery") || lower.includes("oom")) {
    return {
      id: "msg-" + Date.now(),
      sender: "glitch",
      text: "I analyzed the memory distribution across all containers. `celery-worker-cluster` is currently consuming 1.42 GB of RAM due to uncollected batch tasks.\n\nI recommend recycling the workers gracefully without dropping in-flight jobs. Here is the remediation command:",
      timestamp,
      command: "glitch remediate worker-pool-2 --graceful --recycle-workers",
      commandOutput: "[GLITCH] Executing rolling worker restart...\n[CELERY] worker-2 SIGUSR1 received, draining queues...\n[CELERY] Spawning replacement child worker PID 49210...\n✔ Memory dropped from 1.42 GB -> 380 MB\n✔ Zero dropped jobs. Service status: HEALTHY",
      isActionable: true,
      actionLabel: "Recycle Celery Workers",
      actionId: "fix-celery",
      tags: ["Incident", "Memory Optimization"],
    };
  }

  if (lower.includes("docker") || lower.includes("disk") || lower.includes("prune") || lower.includes("cache")) {
    return {
      id: "msg-" + Date.now(),
      sender: "glitch",
      text: "Inspecting Docker volume and overlay2 storage. You have 22.4 GB of unreferenced build cache, dangling image layers, and stopped container logs.\n\nI can execute a safe system prune to immediately reclaim disk bandwidth.",
      timestamp,
      command: "docker system prune --volumes -f",
      commandOutput: "Deleted Containers:\n4b9a102f... (exited)\nDeleted Volumes:\nglitch_test_ephemeral_vol\nDeleted Images:\nsha256:8f4bc... (dangling)\nTotal reclaimed space: 22.41GB",
      isActionable: true,
      actionLabel: "Prune Docker Cache",
      actionId: "fix-docker",
      tags: ["Storage", "Docker"],
    };
  }

  if (lower.includes("triage") || lower.includes("incident") || lower.includes("fix") || lower.includes("scan")) {
    return {
      id: "msg-" + Date.now(),
      sender: "glitch",
      text: "Running autonomous Incident Triage across all 6 services and your host kernel...\n\n• Found 1 Critical incident (`celery-worker-cluster` memory leak)\n• Found 1 Warning incident (`docker-daemon` disk pressure)\n• Found 1 Info item (SSL renewal in 5 days)\n\nAll automated fix playbooks are generated and ready for your sign-off.",
      timestamp,
      command: "glitch incidents triage --all --generate-playbooks",
      commandOutput: "TRIAGE MATRIX:\n[CRITICAL] INC-308: Celery OOM risk -> Playbook #1 ready\n[WARNING]  INC-307: Docker disk cache -> Playbook #2 ready\n[INFO]     INC-305: Certbot renewal -> DNS hook configured\n\nAutomated remediation plan confidence: 99.4%",
      isActionable: true,
      actionLabel: "Execute All Playbooks",
      actionId: "fix-all",
      tags: ["Autonomous Triage", "SRE"],
    };
  }

  if (lower.includes("ci") || lower.includes("pipeline") || lower.includes("deploy") || lower.includes("build")) {
    return {
      id: "msg-" + Date.now(),
      sender: "glitch",
      text: "Checking active pipelines. Production deploy pipeline `#109` finished cleanly in 3m 42s. Staging nightly run `#108` failed during integration tests because Postgres had locked row tables.\n\nI can trigger a fast-track build or re-run the failed test matrix with isolated DB transactions.",
      timestamp,
      command: "glitch pipeline retry #108 --isolated-db --trace-locks",
      commandOutput: "[PIPELINE] Queued job #108 retry on worker-ci-04\n[DB] Spawning isolated schema test_schema_tmp_4812\n[RUNNER] Running 142 integration test suites...\n✔ 142/142 tests passed (48s)",
      isActionable: true,
      actionLabel: "Rerun Staging Pipeline",
      actionId: "rerun-pipeline",
      tags: ["CI/CD", "Testing"],
    };
  }

  if (lower.includes("security") || lower.includes("port") || lower.includes("cve") || lower.includes("firewall")) {
    return {
      id: "msg-" + Date.now(),
      sender: "glitch",
      text: "Running localized network port scan and CVE audit.\n\n• Ingress ports 80, 443 are properly filtered behind Nginx rate limiting.\n• Internal port 5432 (Postgres) and 6379 (Redis) are bound to `127.0.0.1` only. No external exposure.\n• Zero Critical CVEs detected across container bases.",
      timestamp,
      command: "glitch security audit --local-firewall --cve-check",
      commandOutput: "PORT AUDIT:\n0.0.0.0:80    -> nginx (rate_limit: 100r/s)\n0.0.0.0:443   -> nginx (TLS 1.3 strict)\n127.0.0.1:5432 -> postgres (local only)\n127.0.0.1:6379 -> redis (local only)\n\nSecurity Posture: 98/100 (A+ Grade)",
      isActionable: false,
      tags: ["Security", "Hardening"],
    };
  }

  return {
    id: "msg-" + Date.now(),
    sender: "glitch",
    text: `Understood! As your virtual DevOps engineer, I can manage your services, auto-remediate failed containers, generate CI/CD configs, inspect live logs, and optimize resource usage.\n\nWhat would you like me to tackle? You can also click any of the quick-action prompts below!`,
    timestamp,
    command: `glitch query "${prompt}"`,
    commandOutput: `[GLITCH AI] Prompt ingested. Parsing operational parameters...\nContext: Local machine · 6 running services · 2 open incidents\nReady for next instruction.`,
    isActionable: true,
    actionLabel: "Run Full System Diagnostic",
    actionId: "full-diag",
    tags: ["DevOps Copilot"],
  };
}

