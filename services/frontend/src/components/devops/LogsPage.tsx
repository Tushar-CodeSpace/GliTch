import React, { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useWebSocket } from "@/lib/useWebSocket";
import { 
  FileText, 
  Search, 
  Loader2,
  Radio,
  Pause,
  Play,
  Filter,
  Trash2
} from "lucide-react";

interface LogEntry {
  id: string;
  timestamp: string;
  level: string;
  source: string;
  service: string;
  message: string;
  environment: string;
}

export function LogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLevel, setSelectedLevel] = useState<string>("ALL");
  const [isLiveStreaming, setIsLiveStreaming] = useState(true);
  const logsEndRef = useRef<HTMLDivElement>(null);

  const fetchLogs = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("http://127.0.0.1:8000/api/v1/logs");
      if (res.ok) {
        const data = await res.json();
        setLogs(Array.isArray(data) ? data : []);
      } else {
        setLogs([]);
      }
    } catch (err) {
      console.error("Error fetching logs:", err);
      setLogs([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const { subscribeEvent } = useWebSocket();

  useEffect(() => {
    const unsubscribe = subscribeEvent((data: any) => {
      if (data.type === "log_entry" && data.log) {
        setLogs((prev) => [data.log, ...prev]);
      } else if (data.type === "agent_log_stream" && data.payload) {
        const p = data.payload;
        const newLog: LogEntry = {
          id: `ws-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          timestamp: new Date().toLocaleTimeString(),
          level: p.level || "INFO",
          source: data.agent_id || "AGENT_HOST",
          service: "GliTch Edge Agent Stream",
          message: p.message || p.text || JSON.stringify(p),
          environment: "Production"
        };
        setLogs((prev) => [newLog, ...prev]);
      }
    });

    return unsubscribe;
  }, [subscribeEvent]);

  const handleClearLogs = () => {
    setLogs([]);
  };

  const filteredLogs = logs.filter((l) => {
    const matchesSearch =
      l.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.source.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.service.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesLevel =
      selectedLevel === "ALL" || l.level.toUpperCase() === selectedLevel.toUpperCase();

    return matchesSearch && matchesLevel;
  });

  return (
    <div className="space-y-5 pb-8 font-sans text-zinc-100 selection:bg-emerald-500 selection:text-black">
      
      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-6 h-6 text-emerald-400" />
            <h2 className="text-xl font-bold text-white tracking-tight">Real-Time System Logs & Telemetry</h2>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Live WebSocket audit streaming, control plane logs, and agent edge output console.
          </p>
        </div>

        <div className="flex items-center gap-3 font-mono text-xs">
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold">
            <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
            LIVE WEBSOCKET STREAM
          </span>
          <Button
            onClick={handleClearLogs}
            variant="outline"
            className="h-8 px-3 border-zinc-800 text-zinc-400 hover:text-white text-xs rounded-xl flex items-center gap-1"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear
          </Button>
        </div>
      </div>

      {/* SEARCH & FILTER BAR */}
      <Card className="p-3 bg-[#090d0b] border-zinc-800/80 rounded-2xl space-y-3 font-mono">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search logs by message, source, or service..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-9 pr-4 bg-[#060908] border border-zinc-800 rounded-xl text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/60 transition-colors"
            />
          </div>

          {/* LEVEL FILTER PILLS */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-[11px]">
            {["ALL", "INFO", "WARN", "ERROR", "DEBUG"].map((lvl) => (
              <button
                key={lvl}
                onClick={() => setSelectedLevel(lvl)}
                className={`px-2.5 py-1 rounded-lg border font-bold transition-all ${
                  selectedLevel === lvl
                    ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
                    : "bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300"
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>

          <div className="text-xs text-zinc-400">
            Showing <span className="text-emerald-400 font-bold">{filteredLogs.length}</span> log events
          </div>
        </div>
      </Card>

      {/* CONTENT LISTING / STREAM CONSOLE */}
      {isLoading ? (
        <div className="py-16 text-center text-zinc-400 font-mono text-xs flex flex-col items-center gap-2">
          <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" />
          Loading initial system logs...
        </div>
      ) : filteredLogs.length === 0 ? (
        <Card className="p-12 text-center bg-[#090d0b] border-zinc-800/80 rounded-2xl space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 mx-auto flex items-center justify-center">
            <FileText className="w-6 h-6" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-base font-bold text-white">No Matching System Logs</h3>
            <p className="text-xs text-zinc-400">
              {searchQuery || selectedLevel !== "ALL"
                ? "No log entries match your filter criteria."
                : "No system logs recorded yet. Real-time events will stream here as backend and agent actions occur."}
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-2 font-mono text-xs">
          {filteredLogs.map((log) => (
            <div 
              key={log.id} 
              className={`p-3.5 bg-[#080d0a] border rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 transition-all hover:border-emerald-500/30 ${
                log.level === "ERROR" ? "border-rose-500/30 bg-rose-950/10" :
                log.level === "WARN" ? "border-amber-500/30 bg-amber-950/10" :
                "border-zinc-800/80 text-zinc-300"
              }`}
            >
              <div className="flex items-start sm:items-center gap-2.5">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  log.level === "ERROR" ? "bg-rose-500/20 text-rose-300 border border-rose-500/30" :
                  log.level === "WARN" ? "bg-amber-500/20 text-amber-300 border border-amber-500/30" :
                  log.level === "DEBUG" ? "bg-purple-500/20 text-purple-300 border border-purple-500/30" :
                  "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                }`}>
                  {log.level}
                </span>

                <div>
                  <span className="font-semibold text-white mr-2">{log.message}</span>
                  <div className="text-[10px] text-zinc-500 mt-0.5 flex items-center gap-2">
                    <span>Source: <span className="text-zinc-400 font-semibold">{log.source}</span></span>
                    <span>&bull;</span>
                    <span>Service: <span className="text-emerald-400/80">{log.service}</span></span>
                  </div>
                </div>
              </div>

              <div className="text-[10px] text-zinc-500 whitespace-nowrap self-end sm:self-auto font-mono">
                {log.timestamp}
              </div>
            </div>
          ))}
          <div ref={logsEndRef} />
        </div>
      )}

    </div>
  );
}
