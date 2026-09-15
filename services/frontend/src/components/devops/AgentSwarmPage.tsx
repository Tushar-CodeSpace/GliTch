import React, { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useWebSocket } from "@/lib/useWebSocket";
import { Users, Server, Activity, Terminal, Send, X, Loader2, PlayCircle, ShieldAlert } from "lucide-react";

interface ClientAgent {
  id: string;
  name: string;
  site: string;
  ip: string;
  version: string;
  status: "ONLINE" | "PULLING" | "UPDATING" | "IDLE";
  lastSync: string;
  requestsPerSec: number;
}

interface AgentSwarmPageProps {
  agents: ClientAgent[];
}

interface TerminalLog {
  id: string;
  type: "input" | "output" | "error" | "info";
  text: string;
  timestamp: string;
  exitCode?: number;
}

export function AgentSwarmPage({ agents }: AgentSwarmPageProps) {
  const [activeTerminalAgent, setActiveTerminalAgent] = useState<ClientAgent | null>(null);
  const [commandInput, setCommandInput] = useState("");
  const [terminalLogs, setTerminalLogs] = useState<Record<string, TerminalLog[]>>({});
  const [isExecuting, setIsExecuting] = useState(false);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Shared WebSocket hook for real-time remote shell output
  const { subscribeEvent, sendEvent } = useWebSocket();

  // Auto-scroll terminal to bottom when logs update
  useEffect(() => {
    if (activeTerminalAgent) {
      terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [terminalLogs, activeTerminalAgent]);

  // WebSocket Listener for real-time remote shell output via shared hook
  useEffect(() => {
    const unsubscribe = subscribeEvent((data: any) => {
      if (data.type === "agent_exec_response") {
        const payload = data.payload;
        const agentId = data.agent_id || "agent-01";
        const stdout = payload.stdout || "";
        const stderr = payload.stderr || "";
        const exitCode = payload.exitCode ?? 0;
        const timeStr = new Date().toLocaleTimeString();

        setTerminalLogs((prev) => {
          const current = prev[agentId] || [];
          const newEntries: TerminalLog[] = [];

          if (stdout.trim()) {
            newEntries.push({
              id: `out-${Date.now()}-1`,
              type: "output",
              text: stdout,
              timestamp: timeStr,
              exitCode
            });
          }
          if (stderr.trim()) {
            newEntries.push({
              id: `err-${Date.now()}-2`,
              type: "error",
              text: stderr,
              timestamp: timeStr,
              exitCode
            });
          }
          if (!stdout.trim() && !stderr.trim()) {
            newEntries.push({
              id: `info-${Date.now()}-3`,
              type: "info",
              text: `[Process exited with code ${exitCode}]`,
              timestamp: timeStr,
              exitCode
            });
          }

          return {
            ...prev,
            [agentId]: [...current, ...newEntries]
          };
        });

        setIsExecuting(false);
      }
    });

    return unsubscribe;
  }, [subscribeEvent]);

  const handleExecuteCommand = async (agentId: string, cmdToRun?: string) => {
    const cmd = cmdToRun || commandInput.trim();
    if (!cmd) return;

    const timeStr = new Date().toLocaleTimeString();

    // Record user input entry
    setTerminalLogs((prev) => ({
      ...prev,
      [agentId]: [
        ...(prev[agentId] || []),
        {
          id: `in-${Date.now()}`,
          type: "input",
          text: `$ ${cmd}`,
          timestamp: timeStr
        }
      ]
    }));

    if (!cmdToRun) setCommandInput("");
    setIsExecuting(true);

    try {
      const res = await fetch(`http://127.0.0.1:8000/api/v1/agents/${agentId}/exec`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command: cmd })
      });
      if (!res.ok) {
        setTerminalLogs((prev) => ({
          ...prev,
          [agentId]: [
            ...(prev[agentId] || []),
            {
              id: `err-${Date.now()}`,
              type: "error",
              text: `HTTP ${res.status}: Failed to reach agent control channel`,
              timestamp: new Date().toLocaleTimeString()
            }
          ]
        }));
        setIsExecuting(false);
      }
    } catch (err: any) {
      setTerminalLogs((prev) => ({
        ...prev,
        [agentId]: [
          ...(prev[agentId] || []),
          {
            id: `err-${Date.now()}`,
            type: "error",
            text: `Connection Error: ${err.message}`,
            timestamp: new Date().toLocaleTimeString()
          }
        ]
      }));
      setIsExecuting(false);
    }
  };

  const presetCmds = [
    "uptime",
    "ps aux",
    "df -h",
    "ls -la deployments/",
    "python --version"
  ];

  return (
    <div className="space-y-6">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white font-mono flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-400" />
            Edge Client Agent Swarm Monitor
          </h2>
          <p className="text-xs text-zinc-400 font-mono mt-1">
            Real-time status, hardware telemetry, & remote command shell for GliTch Edge Agents
          </p>
        </div>

        <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-bold">
          {agents.length} AGENTS ONLINE
        </span>
      </div>

      {/* AGENTS MATRIX */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 font-mono">
        {agents.map((agent) => (
          <Card key={agent.id} className="bg-[#0b100e] border-emerald-500/20 p-5 rounded-2xl space-y-4 flex flex-col justify-between hover:border-emerald-500/40 transition-colors">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Server className="w-4 h-4 text-emerald-400" />
                  <span className="font-bold text-white text-sm">{agent.name}</span>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                  agent.status === "ONLINE" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30" : "bg-amber-500/10 text-amber-300 border border-amber-500/30 animate-pulse"
                }`}>
                  {agent.status}
                </span>
              </div>

              <div className="space-y-1.5 text-zinc-400 text-xs pt-1">
                <div className="flex justify-between"><span>Agent ID:</span> <span className="text-emerald-400 font-semibold">{agent.id}</span></div>
                <div className="flex justify-between"><span>Target Client:</span> <span className="text-zinc-200 font-semibold">{agent.site}</span></div>
                <div className="flex justify-between"><span>Host Server IP:</span> <span className="text-zinc-200">{agent.ip}</span></div>
                <div className="flex justify-between"><span>Active Build:</span> <span className="text-emerald-400 font-semibold">{agent.version}</span></div>
                <div className="flex justify-between"><span>Throughput:</span> <span className="text-teal-300">{agent.requestsPerSec} reqs/s</span></div>
              </div>
            </div>

            <div className="pt-3 border-t border-zinc-900 flex items-center justify-between text-[11px] text-zinc-500">
              <span>Sync: {agent.lastSync}</span>
              <button 
                onClick={() => setActiveTerminalAgent(agent)}
                className="px-2.5 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Terminal className="w-3.5 h-3.5" /> Remote Shell
              </button>
            </div>
          </Card>
        ))}
      </div>

      {/* REMOTE TERMINAL MODAL */}
      {activeTerminalAgent && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <Card className="w-full max-w-3xl bg-[#080d0a] border border-emerald-500/30 rounded-2xl p-6 space-y-4 shadow-2xl relative font-mono text-xs flex flex-col max-h-[85vh]">
            
            {/* TERMINAL HEADER */}
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Terminal className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="text-sm font-bold text-white">Remote Agent Shell &bull; {activeTerminalAgent.name} ({activeTerminalAgent.id})</h3>
                  <span className="text-[10px] text-zinc-400">Host IP: {activeTerminalAgent.ip} | Outbound WebSocket Active</span>
                </div>
              </div>
              <button 
                onClick={() => setActiveTerminalAgent(null)} 
                className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* PRESET COMMAND BUTTONS */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-[11px]">
              <span className="text-zinc-500 font-semibold whitespace-nowrap">Quick Commands:</span>
              {presetCmds.map((preset) => (
                <button
                  key={preset}
                  onClick={() => handleExecuteCommand(activeTerminalAgent.id, preset)}
                  disabled={isExecuting}
                  className="px-2.5 py-1 bg-zinc-900 hover:bg-emerald-500/20 border border-zinc-800 hover:border-emerald-500/40 text-emerald-300 rounded-lg transition-all whitespace-nowrap"
                >
                  {preset}
                </button>
              ))}
            </div>

            {/* TERMINAL CONSOLE BODY */}
            <div className="flex-1 bg-[#040705] border border-zinc-900 rounded-xl p-4 overflow-y-auto space-y-2 min-h-[300px] text-zinc-200">
              <div className="text-zinc-500 text-[11px] pb-2 border-b border-zinc-900">
                GliTch Edge Agent Remote Execution Subshell v2.0. Type commands below to execute directly on {activeTerminalAgent.name}.
              </div>

              {(terminalLogs[activeTerminalAgent.id] || []).length === 0 ? (
                <div className="text-zinc-600 text-center py-12">
                  No command history yet. Click a quick command above or type below.
                </div>
              ) : (
                (terminalLogs[activeTerminalAgent.id] || []).map((log) => (
                  <div key={log.id} className="space-y-1">
                    {log.type === "input" && (
                      <div className="text-emerald-400 font-bold flex justify-between">
                        <span>{log.text}</span>
                        <span className="text-[10px] text-zinc-600">{log.timestamp}</span>
                      </div>
                    )}
                    {log.type === "output" && (
                      <pre className="text-zinc-300 text-[11px] leading-relaxed whitespace-pre-wrap pl-2 border-l-2 border-emerald-500/40 font-mono">
                        {log.text}
                      </pre>
                    )}
                    {log.type === "error" && (
                      <pre className="text-rose-400 text-[11px] leading-relaxed whitespace-pre-wrap pl-2 border-l-2 border-rose-500/50 font-mono">
                        {log.text}
                      </pre>
                    )}
                    {log.type === "info" && (
                      <div className="text-amber-400/80 text-[10px] italic">
                        {log.text}
                      </div>
                    )}
                  </div>
                ))
              )}
              {isExecuting && (
                <div className="text-emerald-400 flex items-center gap-2 text-xs py-1">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Executing command on remote agent...
                </div>
              )}
              <div ref={terminalEndRef} />
            </div>

            {/* COMMAND INPUT FORM */}
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleExecuteCommand(activeTerminalAgent.id);
              }}
              className="flex items-center gap-2 pt-2"
            >
              <div className="relative flex-1">
                <span className="absolute left-3 top-2.5 text-emerald-400 font-bold">$</span>
                <input
                  type="text"
                  placeholder="Type shell command (e.g. ps, df -h, uptime)..."
                  value={commandInput}
                  onChange={(e) => setCommandInput(e.target.value)}
                  disabled={isExecuting}
                  className="w-full h-9 pl-7 pr-4 bg-[#040705] border border-zinc-800 rounded-xl text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/60 transition-colors"
                />
              </div>
              <Button
                type="submit"
                disabled={isExecuting || !commandInput.trim()}
                className="h-9 px-4 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs rounded-xl flex items-center gap-1.5"
              >
                {isExecuting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                Run
              </Button>
            </form>

          </Card>
        </div>
      )}

      {/* AGENT ARCHITECTURE NOTICE */}
      <Card className="bg-[#0b100e] border-emerald-500/20 p-5 rounded-2xl space-y-2 font-mono text-xs">
        <h4 className="font-bold text-zinc-200 flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-400" />
          Agent Swarm Execution Protocol
        </h4>
        <p className="text-zinc-400 text-xs leading-relaxed font-sans">
          GliTch Edge Agents operate in secure outbound-only pull mode over encrypted WebSocket/HTTPS connection to the API Gateway. Commands dispatched via the Remote Shell execute in isolated agent worker context and stream terminal output back in real-time.
        </p>
      </Card>

    </div>
  );
}
