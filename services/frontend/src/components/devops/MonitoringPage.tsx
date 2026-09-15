import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Activity, 
  Search, 
  Loader2,
  Box,
  Server
} from "lucide-react";

interface AgentItem {
  id: string;
  site_id: string;
  site_name: string;
  agent_code: string;
  hostname: string;
  ip_address: string;
  version: string;
  status: string;
  last_seen: string;
}

export function MonitoringPage() {
  const [agents, setAgents] = useState<AgentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchAgents = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("http://127.0.0.1:8000/api/v1/agents");
      if (res.ok) {
        const data = await res.json();
        setAgents(data);
      }
    } catch (err) {
      console.error("Error fetching agents:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  const filteredAgents = agents.filter(a => 
    a.agent_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.hostname.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.site_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-5 pb-8 font-sans text-zinc-100 selection:bg-emerald-500 selection:text-black">
      
      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="w-6 h-6 text-emerald-400" />
            <h2 className="text-xl font-bold text-white tracking-tight">System & Agent Monitoring</h2>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Real-time HTTP health, Edge agent heartbeats, CPU/Memory metrics, and service availability.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs font-mono text-zinc-500">
            Home &gt; <span className="text-zinc-300">Monitoring</span>
          </div>
        </div>
      </div>

      {/* SEARCH BAR */}
      <Card className="p-3 bg-[#090d0b] border-zinc-800/80 rounded-2xl">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search agents by hostname or site..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-9 pr-4 bg-[#060908] border border-zinc-800 rounded-xl text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/60 transition-colors"
            />
          </div>
          <div className="text-xs text-zinc-400 font-mono">
            Showing <span className="text-emerald-400 font-bold">{filteredAgents.length}</span> active agents
          </div>
        </div>
      </Card>

      {/* CONTENT LISTING / EMPTY STATE */}
      {isLoading ? (
        <div className="py-16 text-center text-zinc-400 font-mono text-xs flex flex-col items-center gap-2">
          <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" />
          Loading telemetry & agents from MongoDB...
        </div>
      ) : filteredAgents.length === 0 ? (
        <Card className="p-12 text-center bg-[#090d0b] border-zinc-800/80 rounded-2xl space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 mx-auto flex items-center justify-center">
            <Server className="w-6 h-6" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-base font-bold text-white">No Connected Edge Agents</h3>
            <p className="text-xs text-zinc-400">
              {searchQuery ? "No agents match your search query." : "No Edge Site Agents currently registered. Start an agent daemon to stream live heartbeats over WebSockets."}
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredAgents.map((agent) => (
            <Card key={agent.id} className="p-4 bg-[#090d0b] border-zinc-800/80 rounded-2xl hover:border-emerald-500/40 transition-colors space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">{agent.agent_code} ({agent.hostname})</h3>
                  <span className="text-[10px] font-mono text-zinc-500">{agent.id} &bull; Site: {agent.site_name}</span>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                  {agent.status}
                </span>
              </div>

              <div className="space-y-2 text-xs text-zinc-300 font-mono bg-[#060908] p-3 rounded-xl border border-zinc-800/60">
                <div className="flex justify-between">
                  <span className="text-zinc-500">IP Address:</span>
                  <span className="text-emerald-400">{agent.ip_address}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Version:</span>
                  <span className="text-zinc-300">{agent.version}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Last Heartbeat:</span>
                  <span className="text-zinc-400">{agent.last_seen}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

    </div>
  );
}
