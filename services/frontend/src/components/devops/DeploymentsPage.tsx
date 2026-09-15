import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Rocket, 
  Search, 
  Plus, 
  Trash2, 
  X,
  Loader2,
  RotateCcw,
  AlertTriangle,
  CheckCircle2
} from "lucide-react";

interface DeploymentItem {
  id: string;
  app_name: string;
  site_id: string;
  client_name: string;
  site_name: string;
  agent_id: string;
  environment: string;
  target_version: string;
  status: string;
  strategy: string;
  started_at: string;
}

export function DeploymentsPage() {
  const [deployments, setDeployments] = useState<DeploymentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewModal, setShowNewModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Rollback Modal State
  const [rollbackTarget, setRollbackTarget] = useState<DeploymentItem | null>(null);
  const [rollbackReason, setRollbackReason] = useState("");
  const [isRollingBack, setIsRollingBack] = useState(false);

  // Form State for new deployment
  const [formData, setFormData] = useState({
    build_id: "build-1024",
    site_id: "site-001",
    environment: "Production",
    strategy: "STANDARD"
  });

  const fetchDeployments = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("http://127.0.0.1:8000/api/v1/deployments");
      if (res.ok) {
        const data = await res.json();
        setDeployments(data);
      }
    } catch (err) {
      console.error("Error fetching deployments:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDeployments();

    // Listen for live deployment & rollback updates via WebSocket
    const ws = new WebSocket("ws://127.0.0.1:8000/ws/telemetry");
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "deployment_triggered" || data.type === "deployment_updated") {
          fetchDeployments();
        } else if (data.type === "agent_rollback_progress") {
          const payload = data.payload || {};
          const depId = payload.deploymentId;
          const stage = payload.stage;
          setDeployments((prev) =>
            prev.map((d) =>
              d.id === depId
                ? { ...d, status: stage === "SUCCESS" ? "Rolled Back" : `Rolling Back (${stage})` }
                : d
            )
          );
        }
      } catch (e) {
        console.error("WS error in DeploymentsPage:", e);
      }
    };

    return () => {
      ws.close();
    };
  }, []);

  const handleTriggerDeployment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const res = await fetch("http://127.0.0.1:8000/api/v1/deployments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        setShowNewModal(false);
        fetchDeployments();
      }
    } catch (err) {
      console.error("Error triggering deployment:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExecuteRollback = async () => {
    if (!rollbackTarget) return;
    try {
      setIsRollingBack(true);
      const res = await fetch(`http://127.0.0.1:8000/api/v1/deployments/${rollbackTarget.id}/rollback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: rollbackReason || "Operator initiated rollback" })
      });

      if (res.ok) {
        setDeployments((prev) =>
          prev.map((d) => (d.id === rollbackTarget.id ? { ...d, status: "Rolling Back" } : d))
        );
        setRollbackTarget(null);
        setRollbackReason("");
      }
    } catch (err) {
      console.error("Error triggering rollback:", err);
    } finally {
      setIsRollingBack(false);
    }
  };

  const filteredDeployments = deployments.filter(d => 
    d.app_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.client_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.site_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-5 pb-8 font-sans text-zinc-100 selection:bg-emerald-500 selection:text-black">
      
      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div>
          <div className="flex items-center gap-2">
            <Rocket className="w-6 h-6 text-emerald-400" />
            <h2 className="text-xl font-bold text-white tracking-tight">Deployments & Automated Rollbacks</h2>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Active Edge agent rollouts, deployment strategies, zero-downtime swaps, and automated version rollbacks.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs font-mono text-zinc-500">
            Home &gt; <span className="text-zinc-300">Deployments</span>
          </div>
          <Button 
            onClick={() => setShowNewModal(true)}
            className="h-9 px-4 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            New Deployment
          </Button>
        </div>
      </div>

      {/* SEARCH BAR */}
      <Card className="p-3 bg-[#090d0b] border-zinc-800/80 rounded-2xl">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search deployments by app, site, client..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-9 pr-4 bg-[#060908] border border-zinc-800 rounded-xl text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/60 transition-colors"
            />
          </div>
          <div className="text-xs text-zinc-400 font-mono">
            Showing <span className="text-emerald-400 font-bold">{filteredDeployments.length}</span> deployments
          </div>
        </div>
      </Card>

      {/* CONTENT LISTING / EMPTY STATE */}
      {isLoading ? (
        <div className="py-16 text-center text-zinc-400 font-mono text-xs flex flex-col items-center gap-2">
          <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" />
          Loading deployments from MongoDB...
        </div>
      ) : filteredDeployments.length === 0 ? (
        <Card className="p-12 text-center bg-[#090d0b] border-zinc-800/80 rounded-2xl space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 mx-auto flex items-center justify-center">
            <Rocket className="w-6 h-6" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-base font-bold text-white">No Deployments Found</h3>
            <p className="text-xs text-zinc-400">
              {searchQuery ? "No deployments match your search query." : "No site deployments recorded yet. Trigger your first site deployment."}
            </p>
          </div>
          <Button 
            onClick={() => setShowNewModal(true)}
            className="h-9 px-4 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Trigger First Deployment
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredDeployments.map((dep) => (
            <Card key={dep.id} className="p-4 bg-[#090d0b] border-zinc-800/80 rounded-2xl hover:border-emerald-500/40 transition-colors space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">{dep.app_name} ({dep.target_version})</h3>
                  <span className="text-[10px] font-mono text-zinc-500">{dep.id} &bull; Site: {dep.site_name} &bull; Agent: {dep.agent_id}</span>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                  dep.status.includes("Rolled Back") ? "bg-amber-500/10 text-amber-400 border border-amber-500/30" :
                  dep.status.includes("Rolling Back") ? "bg-rose-500/10 text-rose-400 border border-rose-500/30 animate-pulse" :
                  "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                }`}>
                  {dep.status}
                </span>
              </div>

              <div className="space-y-2 text-xs text-zinc-300 font-mono bg-[#060908] p-3 rounded-xl border border-zinc-800/60">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Environment:</span>
                  <span className="text-emerald-400">{dep.environment}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Client:</span>
                  <span className="text-zinc-300">{dep.client_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Started:</span>
                  <span className="text-zinc-400">{dep.started_at}</span>
                </div>
              </div>

              {/* ACTION FOOTER */}
              <div className="pt-2 border-t border-zinc-900 flex items-center justify-between text-xs">
                <span className="text-zinc-500 text-[11px] font-mono">Strategy: {dep.strategy}</span>
                <Button
                  onClick={() => setRollbackTarget(dep)}
                  disabled={dep.status.includes("Rolling Back")}
                  className="h-8 px-3 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold text-xs rounded-lg transition-all flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Trigger Rollback
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* ROLLBACK CONFIRMATION MODAL */}
      {rollbackTarget && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="w-full max-w-md bg-[#090d0b] border-amber-500/30 rounded-2xl p-6 space-y-4 shadow-2xl relative font-mono text-xs">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-amber-400 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Confirm Deployment Rollback
              </h3>
              <button onClick={() => setRollbackTarget(null)} className="text-zinc-500 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-zinc-300">
              <p>
                Target Application: <span className="text-white font-bold">{rollbackTarget.app_name} ({rollbackTarget.target_version})</span>
              </p>
              <p>
                Edge Agent: <span className="text-emerald-400 font-bold">{rollbackTarget.agent_id}</span> ({rollbackTarget.site_name})
              </p>
              <p className="text-zinc-400 text-[11px] leading-relaxed font-sans pt-1">
                Triggering rollback will instruct the edge agent to restore the previous backup snapshot from local storage and swap application processes with zero downtime.
              </p>
            </div>

            <div className="space-y-1.5 font-sans">
              <label className="text-zinc-300 font-semibold text-xs">Rollback Reason / Comment</label>
              <Input
                placeholder="e.g., Performance degradation detected in QA"
                value={rollbackReason}
                onChange={(e) => setRollbackReason(e.target.value)}
                className="bg-[#060908] border-zinc-800 text-white rounded-xl text-xs h-10"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setRollbackTarget(null)}
                className="h-9 text-xs border-zinc-800 text-zinc-400 hover:text-white"
              >
                Cancel
              </Button>
              <Button
                onClick={handleExecuteRollback}
                disabled={isRollingBack}
                className="h-9 px-4 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs rounded-xl flex items-center gap-1.5"
              >
                {isRollingBack ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
                Confirm Rollback
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* NEW DEPLOYMENT MODAL */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="w-full max-w-md bg-[#090d0b] border-zinc-800 rounded-2xl p-6 space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Rocket className="w-4 h-4 text-emerald-400" />
                Trigger Site Deployment
              </h3>
              <button onClick={() => setShowNewModal(false)} className="text-zinc-500 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleTriggerDeployment} className="space-y-4 text-xs font-sans">
              <div className="space-y-1.5">
                <label className="text-zinc-300 font-semibold">Environment Target</label>
                <Input 
                  placeholder="Production"
                  value={formData.environment}
                  onChange={(e) => setFormData({ ...formData, environment: e.target.value })}
                  className="bg-[#060908] border-zinc-800 text-white rounded-xl text-xs h-10"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-zinc-300 font-semibold">Rollout Strategy</label>
                <Input 
                  placeholder="STANDARD"
                  value={formData.strategy}
                  onChange={(e) => setFormData({ ...formData, strategy: e.target.value })}
                  className="bg-[#060908] border-zinc-800 text-white rounded-xl text-xs h-10 font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => setShowNewModal(false)}
                  className="h-9 text-xs border-zinc-800 text-zinc-400 hover:text-white"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="h-9 px-4 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs rounded-xl"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Deploy Now"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

    </div>
  );
}
