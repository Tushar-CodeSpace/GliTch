import { useState, useRef, useEffect } from "react";
import { Terminal as TerminalIcon, Trash2, Bot } from "lucide-react";
import { Button } from "../ui/Button";

type CommandEntry = {
  id: string;
  command: string;
  output: string;
  timestamp: string;
};

type Props = {
  onAskGlitch: (query: string) => void;
};

export function TerminalView({ onAskGlitch }: Props) {
  const [history, setHistory] = useState<CommandEntry[]>([
    {
      id: "hist-0",
      command: "glitch doctor",
      output: `[GLITCH AI DEVOPS ENGINE v0.1.0-alpha]
Initializing local system audit...
✓ CPU topology: 8-core host (18.6% active utilization)
✓ Memory sub-allocations: 7.9 GB / 16.7 GB
✓ Docker daemon socket: Connected at unix:///var/run/docker.sock
⚠ Found 2 advisory flags:
  - celery-worker-cluster: memory high (1.42 GB)
  - docker-daemon: 22.4 GB unpruned cache
Type 'glitch triage' or 'glitch fix --all' for autonomous remediation.`,
      timestamp: "10:14:02",
    },
  ]);
  const [input, setInput] = useState("");
  const terminalEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  function handleCommand(e: React.FormEvent) {
    e.preventDefault();
    const cmd = input.trim();
    if (!cmd) return;

    const time = new Date().toLocaleTimeString();

    if (cmd === "clear") {
      setHistory([]);
      setInput("");
      return;
    }

    let output = "";
    const lower = cmd.toLowerCase();

    if (lower === "glitch help" || lower === "glitch --help" || lower === "help") {
      output = `Glitch Virtual AI DevOps CLI
Usage: glitch <command> [options]

Commands:
  glitch doctor          Run complete infrastructure & host health check
  glitch status          Show running containers, services, and memory states
  glitch triage          Run autonomous incident root-cause analysis
  glitch fix --all       Execute auto-generated remediation playbooks
  glitch certs renew     Renew local & wildcard SSL certificates
  docker ps              List running container instances
  kubectl get pods       Inspect Kubernetes cluster pods
  clear                  Clear terminal session output`;
    } else if (lower.includes("status")) {
      output = `[GLITCH VIRTUAL SRE - SERVICE MESH STATUS]
NAME                     CATEGORY   STATUS     CPU     MEM       PORT
ingress-nginx            proxy      RUNNING    4.2%    184 MB    80/443
api-gateway              api        RUNNING    12.8%   412 MB    8080
postgres-primary         database   RUNNING    18.5%   1.82 GB   5432
redis-cache              database   RUNNING    6.1%    680 MB    6379
celery-worker-cluster    worker     DEGRADED   44.7%   1.42 GB   Internal
docker-daemon            container  RUNNING    8.9%    512 MB    unix:///sock

Summary: 5 Healthy, 1 Degraded, 0 Stopped`;
    } else if (lower.includes("triage")) {
      output = `[GLITCH AI INCIDENT TRIAGE]
Analyzing recent kernel ring buffer & service logs...
Detected 2 incidents:
[CRITICAL] INC-308: Celery memory leak detected in worker-2
  -> Proposed fix: 'glitch remediate worker-pool-2 --graceful'
[WARNING]  INC-307: Reclaimable Docker storage layers (22.4 GB)
  -> Proposed fix: 'docker system prune --volumes -f'

Run 'glitch fix --all' to execute both automated fixes.`;
    } else if (lower.includes("fix")) {
      output = `[GLITCH AUTONOMOUS REMEDIATOR]
Executing authorized playbooks:
[1/2] Draining and recycling celery-worker-cluster...
      ✓ Spawned replacement worker PID 50124 (Mem: 380 MB)
[2/2] Running Docker prune on dangling image layers...
      ✓ Reclaimed 22.41 GB disk volume space.
All incidents successfully resolved. System status: NOMINAL.`;
    } else if (lower === "docker ps") {
      output = `CONTAINER ID   IMAGE                 COMMAND                  STATUS          PORTS
4b892a01f78c   nginx:1.25-alpine     "/docker-entrypoint.…"   Up 14 days      0.0.0.0:80->80/tcp, 0.0.0.0:443->443/tcp
8f19920cb921   postgres:16.2         "docker-entrypoint.s…"   Up 28 days      0.0.0.0:5432->5432/tcp
24ab878190ff   redis:7.2             "docker-entrypoint.s…"   Up 28 days      0.0.0.0:6379->6379/tcp
992c10b84711   glitch/api:latest     "node dist/server.js"    Up 4 days       0.0.0.0:8080->8080/tcp`;
    } else if (lower.includes("kubectl")) {
      output = `NAME                               READY   STATUS    RESTARTS   AGE
ingress-nginx-controller-7f49c      1/1     Running   0          14d
glitch-api-deployment-5d97f8c6b-2   1/1     Running   0          4d
celery-worker-set-0                 1/1     Running   2 (18h)    18h
postgres-statefulset-0              1/1     Running   0          28d`;
    } else if (lower === "uname -a") {
      output = `Linux glitch-workstation 6.8.0-45-generic #45-Ubuntu SMP PREEMPT_DYNAMIC x86_64 GNU/Linux`;
    } else {
      output = `[GLITCH DEVOPS SHELL] Command '${cmd}' dispatched.
Executing in local sandboxed environment...
(Tip: type 'glitch help' to see virtual DevOps assistant commands)`;
    }

    setHistory((prev) => [
      ...prev,
      { id: "cmd-" + Date.now(), command: cmd, output, timestamp: time },
    ]);
    setInput("");
  }

  return (
    <div className="devops-subview">
      <div className="subview-header">
        <div>
          <div className="eyebrow"><span className="eyebrow-line" /> INTERACTIVE SHELL</div>
          <h1>Glitch <span className="text-accent">Terminal.</span></h1>
          <p>Direct CLI interface with the Glitch virtual DevOps engine and your local runtime.</p>
        </div>

        <div className="terminal-topbar-actions">
          <Button variant="secondary" onClick={() => setHistory([])}>
            <Trash2 size={13} /> Clear
          </Button>
          <Button
            variant="secondary"
            onClick={() => onAskGlitch("Explain the top DevOps CLI commands available in Glitch")}
          >
            <Bot size={13} className="text-accent" /> Copilot Assist
          </Button>
        </div>
      </div>

      <div className="terminal-window">
        <div className="terminal-window-header">
          <div className="terminal-dots">
            <span className="dot red" />
            <span className="dot yellow" />
            <span className="dot green" />
          </div>
          <div className="terminal-title">
            <TerminalIcon size={12} /> glitch@workstation:~ (virtual-devops-core)
          </div>
          <div className="terminal-engine-badge">AI AGENT: ONLINE</div>
        </div>

        <div className="terminal-body">
          {history.map((entry) => (
            <div key={entry.id} className="terminal-entry">
              <div className="terminal-cmd-line">
                <span className="prompt-host">glitch@workstation</span>
                <span className="prompt-colon">:</span>
                <span className="prompt-path">~</span>
                <span className="prompt-dollar">$</span>
                <span className="prompt-cmd">{entry.command}</span>
                <span className="prompt-time">{entry.timestamp}</span>
              </div>
              <pre className="terminal-output">{entry.output}</pre>
            </div>
          ))}

          <form onSubmit={handleCommand} className="terminal-input-row">
            <span className="prompt-host">glitch@workstation</span>
            <span className="prompt-colon">:</span>
            <span className="prompt-path">~</span>
            <span className="prompt-dollar">$</span>
            <input
              type="text"
              className="terminal-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="type 'glitch help', 'glitch status', or 'glitch fix --all'..."
              autoFocus
            />
          </form>
          <div ref={terminalEndRef} />
        </div>
      </div>
    </div>
  );
}
