import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Zap, 
  Server, 
  Code2, 
  Activity, 
  Terminal, 
  CheckCircle2, 
  Users, 
  CheckSquare, 
  ShieldCheck, 
  GitBranch, 
  ArrowUpRight,
  HardDrive
} from "lucide-react";

interface HealthInfo {
  status: string;
  service: string;
  version: string;
  timestamp: number;
  python_version: string;
}

interface ActivityLog {
  id: string;
  time: string;
  type: string;
  title: string;
  status: string;
  details: string;
}

interface OverviewPageProps {
  health: HealthInfo | null;
  telemetry?: any;
  latency: number | null;
  selectedApp: string;
  selectedSite: string;
  activityLogs: ActivityLog[];
  onNavigateTab: (tab: string) => void;
  onCopyTelemetry: () => void;
  copiedTelemetry: boolean;
}

export function OverviewPage({
  health,
  telemetry,
  latency,
  selectedApp,
  selectedSite,
  activityLogs,
  onNavigateTab,
  onCopyTelemetry,
  copiedTelemetry,
}: OverviewPageProps) {
  const currentRequestsPerSec = telemetry?.requests_per_sec || 4550;
  const currentCpu = telemetry?.cpu_percent || 18.4;
  const currentRam = telemetry?.ram_usage_gb || 1.45;
  const currentLatency = latency ?? (telemetry?.latency_ms || 9);

  return (
    <div className="space-y-6">
      
      {/* SECTION 1: SYSTEM HEALTH & METRICS HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white font-mono flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-400" />
            Executive DevOps Overview & System Health
          </h2>
          <p className="text-xs text-zinc-400 font-mono mt-1">
            Real-time status for <strong className="text-emerald-400">{selectedApp}</strong> across <strong className="text-teal-300">{selectedSite}</strong>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => onNavigateTab("pipeline")}
            className="h-9 px-4 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold font-mono text-xs rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.25)] transition-all"
          >
            <GitBranch className="w-4 h-4 mr-1.5" />
            Release Pipeline
          </Button>
          <Button
            onClick={() => onNavigateTab("agents")}
            variant="outline"
            className="h-9 px-4 border-zinc-800 bg-[#060908] hover:bg-zinc-900 text-zinc-300 font-mono text-xs rounded-xl"
          >
            <Users className="w-4 h-4 mr-1.5 text-emerald-400" />
            Swarm Monitor
          </Button>
        </div>
      </div>

      {/* SECTION 2: HIGH-DENSITY METRICS GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 font-mono">
        <div className="p-4 rounded-2xl bg-[#0b100e] border border-emerald-500/20 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>API Gateway</span>
            <Server className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="pt-2 flex items-baseline gap-2">
            <span className="text-base font-extrabold text-emerald-400">
              {health || telemetry ? "OPERATIONAL" : "OFFLINE"}
            </span>
          </div>
          <div className="text-[10px] text-zinc-500 pt-1">
            Port 8000 &bull; {currentLatency}ms
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0b100e] border border-emerald-500/20 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>CPU & RAM Load</span>
            <HardDrive className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="pt-2 flex items-baseline gap-2">
            <span className="text-lg font-extrabold text-white">{currentCpu}%</span>
            <span className="text-[10px] text-emerald-400 font-semibold">{currentRam} GB</span>
          </div>
          <div className="text-[10px] text-zinc-500 pt-1">
            Uvicorn Async Worker
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0b100e] border border-emerald-500/20 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>QA Pass Rate</span>
            <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="pt-2 flex items-baseline gap-2">
            <span className="text-lg font-extrabold text-emerald-400">100%</span>
            <span className="text-[10px] text-zinc-400">412/412</span>
          </div>
          <div className="text-[10px] text-zinc-500 pt-1">
            Playwright Server
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0b100e] border border-emerald-500/20 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Approval Gate</span>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="pt-2 flex items-baseline gap-2">
            <span className="text-sm font-extrabold text-emerald-400">APPROVED</span>
          </div>
          <div className="text-[10px] text-zinc-500 pt-1">
            Build v2.4.0 Authorized
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#0b100e] border border-emerald-500/20 shadow-sm flex flex-col justify-between col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>HTTP Traffic</span>
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="pt-2 flex items-baseline gap-2">
            <span className="text-lg font-extrabold text-emerald-400">{currentRequestsPerSec.toLocaleString()}</span>
            <span className="text-[10px] text-zinc-400">reqs/s</span>
          </div>
          <div className="text-[10px] text-zinc-500 pt-1">
            200 OK: 99.88%
          </div>
        </div>
      </div>

      {/* SECTION 3: MICROSERVICES HEALTH CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        <Card className="bg-[#0b100e] border-emerald-500/20 p-5 rounded-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white font-mono">glitch-api-gateway</h3>
                <p className="text-xs text-zinc-400">FastAPI & Uvicorn Engine</p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              ONLINE (WS)
            </span>
          </div>
          <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs font-mono text-zinc-400">
            <span>Port: 8000</span>
            <span>Uptime: 99.98%</span>
            <span>Latency: {currentLatency}ms</span>
          </div>
        </Card>

        <Card className="bg-[#0b100e] border-emerald-500/20 p-5 rounded-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                <CheckSquare className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white font-mono">qa-automation-server</h3>
                <p className="text-xs text-zinc-400">External Playwright Host</p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              READY
            </span>
          </div>
          <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs font-mono text-zinc-400">
            <span>Port: 9090</span>
            <span>Suite: Playwright</span>
            <span>Tests: 412 Passed</span>
          </div>
        </Card>

        <Card className="bg-[#0b100e] border-emerald-500/20 p-5 rounded-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white font-mono">edge-agent-swarm</h3>
                <p className="text-xs text-zinc-400">On-Prem & Cloud Client Agents</p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              3/3 CONNECTED
            </span>
          </div>
          <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs font-mono text-zinc-400">
            <span>Agents: 3 Sites</span>
            <span>Sync: Pull Mode</span>
            <span>Zero Downtime</span>
          </div>
        </Card>

      </div>

      {/* SECTION 4: TELEMETRY & AUDIT STREAM */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Telemetry Payload */}
        <Card className="bg-[#0b100e] border-emerald-500/20 p-5 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-400" />
              <h3 className="font-bold text-base text-white font-mono">Live System Telemetry Payload</h3>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onCopyTelemetry}
              disabled={!health && !telemetry}
              className="h-8 border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 text-xs font-mono"
            >
              {copiedTelemetry ? "Copied Payload!" : "Export Telemetry JSON"}
            </Button>
          </div>

          {telemetry || health ? (
            <div className="p-4 rounded-xl bg-[#060908] border border-zinc-800 font-mono text-xs text-emerald-300 space-y-2 overflow-x-auto">
              <div><span className="text-zinc-500">status:</span> "{telemetry?.status || health?.status || 'OPERATIONAL'}"</div>
              <div><span className="text-zinc-500">software:</span> "{selectedApp}"</div>
              <div><span className="text-zinc-500">target_client:</span> "{selectedSite}"</div>
              <div><span className="text-zinc-500">cpu_percent:</span> {currentCpu}%</div>
              <div><span className="text-zinc-500">ram_usage_gb:</span> {currentRam} GB</div>
              <div><span className="text-zinc-500">requests_per_sec:</span> {currentRequestsPerSec}</div>
              <div><span className="text-zinc-500">python_runtime:</span> "{telemetry?.python_version || health?.python_version || '3.12'}"</div>
              <div><span className="text-zinc-500">ping_latency:</span> {currentLatency} ms</div>
              <div><span className="text-zinc-500">timestamp:</span> {telemetry?.timestamp || health?.timestamp}</div>
            </div>
          ) : (
            <div className="p-6 text-center text-xs text-zinc-500 font-mono">
              Connecting to FastAPI Gateway WebSocket telemetry stream...
            </div>
          )}
        </Card>

        {/* Audit Feed */}
        <Card className="bg-[#0b100e] border-emerald-500/20 p-5 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Terminal className="w-5 h-5 text-emerald-400" />
              <h3 className="font-bold text-base text-white font-mono">DevOps Audit Stream</h3>
            </div>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
              LIVE STREAM (WS)
            </span>
          </div>

          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
            {activityLogs.map((log) => (
              <div key={log.id} className="p-3 rounded-xl bg-[#060908] border border-zinc-800/80 flex items-start justify-between gap-3 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 font-mono font-semibold text-zinc-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{log.title}</span>
                  </div>
                  <p className="text-[11px] text-zinc-400 font-sans">{log.details}</p>
                </div>
                <span className="text-[10px] font-mono text-zinc-500 shrink-0">{log.time}</span>
              </div>
            ))}
          </div>
        </Card>

      </div>

    </div>
  );
}

