import React from "react";
import { Card } from "@/components/ui/card";
import { Zap, Activity, CheckCircle2, AlertTriangle, ShieldAlert } from "lucide-react";
import { HttpLogEntry } from "@/lib/useWebSocket";

interface TrafficMonitorPageProps {
  trafficLogs?: HttpLogEntry[];
  requestsPerSec?: number;
}

export function TrafficMonitorPage({ trafficLogs = [], requestsPerSec }: TrafficMonitorPageProps) {
  const currentReqs = requestsPerSec || 4550;

  // Fallback logs if ws is connecting
  const displayLogs = trafficLogs.length > 0 ? trafficLogs : [
    { id: "1", time: "12:00:01", endpoint: "[HTTP GET] /api/v2/payment/process (Client Alpha - US East)", status: "200 OK", latency: "8ms" },
    { id: "2", time: "12:00:02", endpoint: "[HTTP POST] /api/v2/checkout/submit (Client Beta - EU West)", status: "200 OK", latency: "14ms" },
    { id: "3", time: "12:00:03", endpoint: "[HTTP GET] /api/v2/products/query (Client Gamma - AP South)", status: "200 OK", latency: "6ms" },
    { id: "4", time: "12:00:04", endpoint: "[HTTP GET] /api/v2/auth/verify (Client Alpha - US East)", status: "200 OK", latency: "11ms" },
    { id: "5", time: "12:00:05", endpoint: "[HTTP POST] /api/v2/cart/sync (Client Beta - EU West)", status: "200 OK", latency: "9ms" }
  ];

  return (
    <div className="space-y-6 font-mono">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white font-mono flex items-center gap-2">
            <Zap className="w-5 h-5 text-emerald-400" />
            Real-Time Client HTTP Traffic & Telemetry Analytics
          </h2>
          <p className="text-xs text-zinc-400 font-mono mt-1">
            Live request throughput, status code distribution, and latency streams across client endpoints
          </p>
        </div>

        <div className="text-right">
          <span className="text-2xl font-black text-emerald-400">{currentReqs.toLocaleString()}</span>
          <span className="text-xs text-zinc-400 ml-1">reqs/sec</span>
        </div>
      </div>

      {/* METRIC GAUGE CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <div className="p-4 rounded-2xl bg-[#0b100e] border border-emerald-500/30 text-emerald-400 space-y-1">
          <div className="flex items-center justify-between font-bold">
            <span>200 OK Successful</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-extrabold text-white pt-1">99.85%</div>
          <p className="text-[10px] text-zinc-400">{(currentReqs - 7).toLocaleString()} reqs/sec &bull; Avg Latency 9ms</p>
        </div>

        <div className="p-4 rounded-2xl bg-[#0b100e] border border-amber-500/30 text-amber-400 space-y-1">
          <div className="flex items-center justify-between font-bold">
            <span>4xx Client Rate Limit</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-extrabold text-white pt-1">0.12%</div>
          <p className="text-[10px] text-zinc-400">5 reqs/sec &bull; Rate limit throttling</p>
        </div>

        <div className="p-4 rounded-2xl bg-[#0b100e] border border-rose-500/30 text-rose-400 space-y-1">
          <div className="flex items-center justify-between font-bold">
            <span>5xx Server Faults</span>
            <ShieldAlert className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-extrabold text-white pt-1">0.03%</div>
          <p className="text-[10px] text-zinc-400">2 reqs/sec &bull; Nominal threshold</p>
        </div>
      </div>

      {/* LIVE HTTP STREAM LOG INSPECTOR */}
      <Card className="bg-[#0b100e] border-emerald-500/20 p-5 rounded-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-base text-white">Live Inbound Request Inspector</h3>
          </div>
          <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30 font-mono">
            STREAMING (WS PORT 8000)
          </span>
        </div>

        <div className="p-4 rounded-xl bg-[#060908] border border-zinc-800 font-mono text-xs text-emerald-300 space-y-2.5 h-64 overflow-y-auto">
          <div className="flex justify-between text-zinc-500 text-[10px] border-b border-zinc-800 pb-1.5 font-bold">
            <span>REQUEST ENDPOINT & CLIENT TARGET</span>
            <span>HTTP STATUS & LATENCY</span>
          </div>
          {displayLogs.map((log) => {
            const isError = log.status.includes("429") || log.status.includes("500");
            return (
              <div key={log.id} className={`flex justify-between items-center ${isError ? "text-amber-300" : ""}`}>
                <span className="truncate max-w-[70%]">{log.endpoint}</span>
                <span className={`${isError ? "text-amber-400 font-bold" : "text-emerald-400 font-bold"}`}>
                  {log.status} ({log.latency})
                </span>
              </div>
            );
          })}
        </div>
      </Card>

    </div>
  );
}

