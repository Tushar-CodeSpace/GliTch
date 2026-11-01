import { useState, useRef, useEffect } from "react";
import { Send, Bot, Terminal, Sparkles, Check, Copy, Play, ShieldCheck, RotateCcw } from "lucide-react";
import { Button } from "../ui/Button";
import { Panel } from "../ui/Panel";
import type { ChatMessage, Incident, ServiceItem } from "../../types/devops";

type Props = {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  onExecuteAction: (actionId: string, command: string) => void;
  incidents: Incident[];
  services: ServiceItem[];
};

export function GlitchCopilot({ messages, onSendMessage, onExecuteAction, incidents, services }: Props) {
  const [input, setInput] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [executingId, setExecutingId] = useState<string | null>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const activeIncidents = incidents.filter(i => i.status !== "resolved");
  const degradedServices = services.filter(s => s.status !== "running");

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, executingId]);

  function handleSend(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!input.trim()) return;
    onSendMessage(input.trim());
    setInput("");
  }

  function handleCopy(text: string, id: string) {
    void navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  function handleRun(actionId: string, command: string, msgId: string) {
    setExecutingId(msgId);
    setTimeout(() => {
      onExecuteAction(actionId, command);
      setExecutingId(null);
    }, 900);
  }

  const quickPrompts = [
    { label: "🔍 Triage Incidents", prompt: "Triage all active incidents and propose fix playbooks" },
    { label: "🧠 Analyze Memory", prompt: "Analyze host memory utilization and running processes" },
    { label: "🐳 Inspect Containers", prompt: "Inspect running Docker containers and daemon status" },
    { label: "🛡️ Audit Security", prompt: "Audit open ports and firewall security" },
    { label: "🚀 System Vitals", prompt: "Check host infrastructure health and load averages" },
  ];

  return (
    <div className="copilot-container">
      {/* Glitch AI Status Header */}
      <Panel className="copilot-header-panel">
        <div className="copilot-persona">
          <div className="copilot-avatar">
            <Bot size={26} strokeWidth={2.2} />
            <span className="copilot-glow" />
          </div>
          <div>
            <div className="copilot-name-row">
              <h2>Glitch AI</h2>
              <span className="ai-badge">VIRTUAL DEVOPS ENGINEER · L6 SRE</span>
              <span className="online-tag"><span className="pulse-dot" /> AUTONOMOUS MONITORING</span>
            </div>
            <p className="copilot-subtitle">
              Your 24/7 AI DevOps teammate. Continuously inspecting kernel metrics, Docker containers, database connections, and CI/CD pipelines.
            </p>
          </div>
        </div>

        <div className="copilot-stats-summary">
          <div className="copilot-stat-item">
            <span>ACTIVE INCIDENTS</span>
            <strong className={activeIncidents.length > 0 ? "text-amber" : "text-accent"}>
              {activeIncidents.length} Issue{activeIncidents.length === 1 ? "" : "s"}
            </strong>
          </div>
          <div className="copilot-stat-divider" />
          <div className="copilot-stat-item">
            <span>HEALTH STATUS</span>
            <strong className={degradedServices.length > 0 ? "text-amber" : "text-accent"}>
              {degradedServices.length > 0 ? "Degraded" : "Nominal"}
            </strong>
          </div>
          <div className="copilot-stat-divider" />
          <div className="copilot-stat-item">
            <span>REMEDIATION MODE</span>
            <strong className="text-accent">Supervised</strong>
          </div>
        </div>
      </Panel>

      {/* Quick Prompts */}
      <div className="quick-prompt-bar">
        <span className="quick-prompt-label"><Sparkles size={13} /> QUICK ACTIONS:</span>
        <div className="quick-prompt-pills">
          {quickPrompts.map((q, idx) => (
            <button
              key={idx}
              className="prompt-pill"
              onClick={() => onSendMessage(q.prompt)}
            >
              {q.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages Log */}
      <div className="copilot-messages-scroll">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`message-bubble-wrapper ${msg.sender === "user" ? "user-msg" : "glitch-msg"}`}
          >
            {msg.sender === "glitch" && (
              <div className="msg-avatar glitch-avatar">
                <Bot size={18} />
              </div>
            )}

            <div className="message-content-box">
              <div className="message-meta-header">
                <span className="msg-author">{msg.sender === "glitch" ? "Glitch AI · DevOps Agent" : "You (Operator)"}</span>
                <span className="msg-time">{msg.timestamp}</span>
                {msg.tags?.map((t, idx) => (
                  <span key={idx} className="msg-tag">{t}</span>
                ))}
              </div>

              <div className="msg-text">
                {msg.text.split("\n\n").map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </div>

              {msg.command && (
                <div className="command-block">
                  <div className="command-block-header">
                    <span className="command-label"><Terminal size={13} /> RECOMMENDED DEVOPS COMMAND</span>
                    <div className="command-actions">
                      <button
                        className="cmd-icon-btn"
                        onClick={() => handleCopy(msg.command!, msg.id)}
                        title="Copy command"
                      >
                        {copiedId === msg.id ? <Check size={13} className="text-accent" /> : <Copy size={13} />}
                        <span>{copiedId === msg.id ? "COPIED" : "COPY"}</span>
                      </button>
                    </div>
                  </div>
                  <pre className="command-code">
                    <code>$ {msg.command}</code>
                  </pre>

                  {msg.commandOutput && (
                    <div className="command-output">
                      <div className="output-header">STDOUT / TERMINAL OUTPUT</div>
                      <pre>{msg.commandOutput}</pre>
                    </div>
                  )}

                  {msg.isActionable && msg.actionId && (
                    <div className="action-button-row">
                      {msg.actionExecuted ? (
                        <div className="action-success-badge">
                          <Check size={14} /> REMEDIATION EXECUTED SUCCESSFULLY
                        </div>
                      ) : (
                        <Button
                          variant="primary"
                          className="action-exec-btn"
                          disabled={executingId === msg.id}
                          onClick={() => handleRun(msg.actionId!, msg.command!, msg.id)}
                        >
                          {executingId === msg.id ? (
                            <>
                              <RotateCcw size={14} className="spin" /> Executing Playbook...
                            </>
                          ) : (
                            <>
                              <Play size={14} /> {msg.actionLabel || "Approve & Execute via Glitch"}
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {msg.sender === "user" && (
              <div className="msg-avatar user-avatar-bubble">
                <span>OP</span>
              </div>
            )}
          </div>
        ))}
        <div ref={chatBottomRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSend} className="copilot-input-form">
        <div className="copilot-input-wrapper">
          <span className="input-prompt-symbol">$</span>
          <input
            type="text"
            placeholder="Ask Glitch to diagnose issues, write configs, or run remediations..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <Button type="submit" variant="primary" className="send-btn" disabled={!input.trim()}>
            <span>Ask Glitch</span>
            <Send size={14} />
          </Button>
        </div>
        <div className="input-footer-hint">
          <span><ShieldCheck size={12} /> Local sandboxed execution</span>
          <span>Press <strong>Enter</strong> to prompt Glitch</span>
        </div>
      </form>
    </div>
  );
}
