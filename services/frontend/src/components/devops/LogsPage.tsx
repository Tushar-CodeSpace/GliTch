import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  Search, 
  Loader2,
  Box
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

  const filteredLogs = logs.filter(l => 
    l.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.source.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-5 pb-8 font-sans text-zinc-100 selection:bg-emerald-500 selection:text-black">
      
      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-6 h-6 text-emerald-400" />
            <h2 className="text-xl font-bold text-white tracking-tight">System Logs & Telemetry</h2>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Centralized application log streaming, event telemetry, and audit history.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs font-mono text-zinc-500">
            Home &gt; <span className="text-zinc-300">Logs</span>
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
              placeholder="Search logs by message or source..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-9 pr-4 bg-[#060908] border border-zinc-800 rounded-xl text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/60 transition-colors"
            />
          </div>
          <div className="text-xs text-zinc-400 font-mono">
            Showing <span className="text-emerald-400 font-bold">{filteredLogs.length}</span> log entries
          </div>
        </div>
      </Card>

      {/* CONTENT LISTING / EMPTY STATE */}
      {isLoading ? (
        <div className="py-16 text-center text-zinc-400 font-mono text-xs flex flex-col items-center gap-2">
          <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" />
          Loading logs from MongoDB...
        </div>
      ) : filteredLogs.length === 0 ? (
        <Card className="p-12 text-center bg-[#090d0b] border-zinc-800/80 rounded-2xl space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 mx-auto flex items-center justify-center">
            <FileText className="w-6 h-6" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-base font-bold text-white">No System Logs</h3>
            <p className="text-xs text-zinc-400">
              {searchQuery ? "No log entries match your search query." : "No system logs recorded yet. Application logs will stream in real-time."}
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-2 font-mono text-xs">
          {filteredLogs.map((log) => (
            <div key={log.id} className="p-3 bg-[#090d0b] border border-zinc-800/80 rounded-xl flex items-center justify-between text-zinc-300">
              <div>
                <span className="text-emerald-400 font-bold mr-2">[{log.level}]</span>
                <span>{log.message}</span>
              </div>
              <span className="text-[10px] text-zinc-500">{log.timestamp}</span>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
