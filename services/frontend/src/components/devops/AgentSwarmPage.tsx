import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Server, Activity, Terminal, RefreshCw, CheckCircle2 } from "lucide-react";

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

export function AgentSwarmPage({ agents }: AgentSwarmPageProps) {
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
            Real-time status of GliTch Edge Deployment Agents installed on target client servers
          </p>
        </div>

        <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-bold">
          3 AGENTS ACTIVE
        </span>
      </div>

      {/* AGENTS MATRIX */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 font-mono">
        {agents.map((agent) => (
          <Card key={agent.id} className="bg-[#0b100e] border-emerald-500/20 p-5 rounded-2xl space-y-4 flex flex-col justify-between">
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
                <div className="flex justify-between"><span>Target Client:</span> <span className="text-zinc-200 font-semibold">{agent.site}</span></div>
                <div className="flex justify-between"><span>Host Server IP:</span> <span className="text-zinc-200">{agent.ip}</span></div>
                <div className="flex justify-between"><span>Active Build:</span> <span className="text-emerald-400 font-semibold">{agent.version}</span></div>
                <div className="flex justify-between"><span>Throughput:</span> <span className="text-teal-300">{agent.requestsPerSec} reqs/s</span></div>
              </div>
            </div>

            <div className="pt-3 border-t border-zinc-900 flex items-center justify-between text-[11px] text-zinc-500">
              <span>Last Sync: {agent.lastSync}</span>
              <span className="text-emerald-400 hover:underline cursor-pointer flex items-center gap-1">
                <Terminal className="w-3 h-3" /> View Agent Logs
              </span>
            </div>
          </Card>
        ))}
      </div>

      {/* AGENT ARCHITECTURE NOTICE */}
      <Card className="bg-[#0b100e] border-emerald-500/20 p-5 rounded-2xl space-y-2 font-mono text-xs">
        <h4 className="font-bold text-zinc-200 flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-400" />
          Agent Swarm Execution Protocol
        </h4>
        <p className="text-zinc-400 text-xs leading-relaxed font-sans">
          GliTch Edge Agents operate in secure outbound-only pull mode over encrypted WebSocket/HTTPS connection to the API Gateway. Agents continuously report host health, listen for approved release signals, and perform zero-downtime container swaps on target client hosts without requiring open inbound firewall ports.
        </p>
      </Card>

    </div>
  );
}
