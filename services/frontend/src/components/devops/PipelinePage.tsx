import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  GitBranch, 
  CheckCircle2, 
  Clock, 
  Rocket, 
  ShieldCheck, 
  RefreshCw, 
  CheckCircle,
  FileCode,
  CheckSquare
} from "lucide-react";

interface PipelinePageProps {
  userEmail: string;
  pipelineStep: number;
  isApprovalGranted: boolean;
  deploying: boolean;
  deploySuccessMessage: string | null;
  onGrantApproval: () => void;
  onTriggerDeploy: () => void;
}

export function PipelinePage({
  userEmail,
  pipelineStep,
  isApprovalGranted,
  deploying,
  deploySuccessMessage,
  onGrantApproval,
  onTriggerDeploy,
}: PipelinePageProps) {
  return (
    <div className="space-y-6">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white font-mono flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-emerald-400" />
            End-to-End CI / QA Release Pipeline
          </h2>
          <p className="text-xs text-zinc-400 font-mono mt-1">
            Automated pipeline: Git Pull -&gt; CI Build -&gt; External QA Server -&gt; Site Config -&gt; Approval Gate -&gt; Agent Swarm
          </p>
        </div>
      </div>

      {/* PIPELINE STEPPER CARD */}
      <Card className="bg-[#0b100e] border-emerald-500/20 p-6 rounded-2xl space-y-6">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider">
            Active Pipeline Build ID: <span className="text-emerald-400">#BUILD-2026-v2.4.0</span>
          </span>
          <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-bold">
            BRANCH: main (commit #a98c1f2)
          </span>
        </div>

        {/* STEPPER GRAPHIC */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-3 font-mono text-xs">
          
          {/* Step 1: Git Pull */}
          <div className="p-3.5 rounded-xl bg-[#060908] border border-emerald-500/40 text-zinc-200 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-400">1. Git Pull</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-[10px] text-zinc-400">Commit #a98c1f2</p>
          </div>

          {/* Step 2: CI Build */}
          <div className="p-3.5 rounded-xl bg-[#060908] border border-emerald-500/40 text-zinc-200 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-400">2. CI Build</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-[10px] text-zinc-400">Artifacts Compiled</p>
          </div>

          {/* Step 3: QA Server Handoff */}
          <div className="p-3.5 rounded-xl bg-[#060908] border border-emerald-500/40 text-zinc-200 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-400">3. QA Server</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-[10px] text-zinc-400">412/412 Passed</p>
          </div>

          {/* Step 4: Site Config Injected */}
          <div className="p-3.5 rounded-xl bg-[#060908] border border-emerald-500/40 text-zinc-200 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-400">4. Site Config</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-[10px] text-zinc-400">3 Site JSONs Injected</p>
          </div>

          {/* Step 5: Approval Gate */}
          <div className={`p-3.5 rounded-xl bg-[#060908] border ${isApprovalGranted ? "border-emerald-500/40" : "border-amber-500/40 animate-pulse"} text-zinc-200 space-y-1`}>
            <div className="flex items-center justify-between">
              <span className={`font-bold ${isApprovalGranted ? "text-emerald-400" : "text-amber-400"}`}>
                5. Approval
              </span>
              {isApprovalGranted ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Clock className="w-4 h-4 text-amber-400" />}
            </div>
            <p className="text-[10px] text-zinc-400">{isApprovalGranted ? "Signed Off" : "Pending Gate"}</p>
          </div>

          {/* Step 6: Agent Swarm Deploy */}
          <div className={`p-3.5 rounded-xl bg-[#060908] border ${pipelineStep === 6 ? "border-emerald-500/40" : "border-zinc-800"} text-zinc-200 space-y-1`}>
            <div className="flex items-center justify-between">
              <span className={`font-bold ${pipelineStep === 6 ? "text-emerald-400" : "text-zinc-500"}`}>
                6. Agent Swarm
              </span>
              {pipelineStep === 6 ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Rocket className="w-4 h-4 text-zinc-600" />}
            </div>
            <p className="text-[10px] text-zinc-400">{pipelineStep === 6 ? "Agents Updated" : "Awaiting Push"}</p>
          </div>

        </div>
      </Card>

      {/* APPROVAL GATE & AGENT DISPATCH CONTROLS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Stage 5: Approval Gate Sign-Off */}
        <Card className="bg-[#0b100e] border-emerald-500/20 p-6 rounded-2xl space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <h4 className="font-bold text-base text-white font-mono">Stage 5: Production Approval Gate</h4>
            </div>
            <p className="text-xs text-zinc-400 mt-2">
              QA Server automation suite (Playwright host at <code>http://qa-auto.glitch.internal:9090</code>) completed with 100% score. Release leads must authorize before edge client agents pull builds.
            </p>
          </div>

          <div className="pt-4 border-t border-zinc-900 flex items-center gap-3">
            {!isApprovalGranted ? (
              <Button
                onClick={onGrantApproval}
                className="h-10 px-5 bg-amber-500 hover:bg-amber-400 text-black font-extrabold font-mono text-xs rounded-xl shadow-[0_0_15px_rgba(245,158,11,0.3)] transition-all"
              >
                <ShieldCheck className="w-4 h-4 mr-2" />
                GRANT PRODUCTION APPROVAL
              </Button>
            ) : (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>PRODUCTION APPROVAL SIGNED OFF ({userEmail})</span>
              </div>
            )}
          </div>
        </Card>

        {/* Stage 6: Dispatch Agent Swarm Signal */}
        <Card className="bg-[#0b100e] border-emerald-500/20 p-6 rounded-2xl space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Rocket className="w-5 h-5 text-emerald-400" />
              <h4 className="font-bold text-base text-white font-mono">Stage 6: Edge Client Agent Rollout Signal</h4>
            </div>
            <p className="text-xs text-zinc-400 mt-2">
              Dispatch update signal to active GliTch Edge Agents on Client Alpha, Beta, and Gamma servers. Agents pull site-specific config-driven builds for zero-downtime deployment.
            </p>
          </div>

          <div className="pt-4 border-t border-zinc-900 space-y-3">
            <Button
              onClick={onTriggerDeploy}
              disabled={!isApprovalGranted || deploying}
              className={`h-10 px-5 font-extrabold font-mono text-xs rounded-xl transition-all ${
                isApprovalGranted 
                  ? "bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_0_20px_rgba(16,185,129,0.3)]" 
                  : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
              }`}
            >
              {deploying ? (
                <span className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-black" />
                  DISPATCHING AGENT ROLLOUT...
                </span>
              ) : (
                "DISPATCH AGENT ROLLOUT SIGNAL"
              )}
            </Button>

            {deploySuccessMessage && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{deploySuccessMessage}</span>
              </div>
            )}
          </div>
        </Card>

      </div>

    </div>
  );
}
