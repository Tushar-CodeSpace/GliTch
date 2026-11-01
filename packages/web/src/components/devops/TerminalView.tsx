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
      command: "glitch status",
      output: `[GLITCH LOCAL DEVOPS CONSOLE]
Local SQLite Daemon: Connected (http://127.0.0.1:4780)
Engine: Go Native Microservice · SQLite 3 (WAL mode)
Status: All systems operational. Type 'glitch help' for available commands.`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
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
      output = `[GLITCH LOCAL STATUS]
Daemon Endpoint: http://127.0.0.1:4780
Database Engine: SQLite 3 (WAL Mode Enabled)
Local Telemetry: Live Host Polling Active
Active Incidents: 0
Status: All local subsystems nominal.`;
    } else if (lower.includes("triage")) {
      output = `[GLITCH ACTIVE INCIDENT TRIAGE]
✔ Zero active incidents detected across your local host.
✔ All system vitals and monitored processes are operating within nominal thresholds.`;
    } else if (lower.includes("fix")) {
      output = `[GLITCH AUTONOMOUS REMEDIATOR]
✔ Zero active incidents to fix. All local subsystems are nominal.`;
    } else if (lower.includes("doctor")) {
      output = `[GLITCH HOST HEALTH AUDIT]
Initializing local host system audit...
✔ CPU Topology: Host telemetry active
✔ Memory Allocation: Operating within safe bounds
✔ Local SQLite Database: Connected (Integrity: OK, WAL: active)
✔ Zero unhandled incident flags
Host health posture: Optimal.`;
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
