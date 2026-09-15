import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  GitBranch, 
  Plus, 
  Search, 
  Play, 
  Trash2, 
  X,
  Loader2,
  Box
} from "lucide-react";

interface PipelineItem {
  id: string;
  application_id: string;
  app_name: string;
  name: string;
  trigger_type: string;
  branch_pattern: string;
  status: string;
  last_run: string;
  duration: string;
}

interface PipelinePageProps {
  userEmail?: string;
  pipelineStep?: number;
  isApprovalGranted?: boolean;
  deploying?: boolean;
  deploySuccessMessage?: string | null;
  onGrantApproval?: () => void;
  onTriggerDeploy?: () => void;
}

export function PipelinePage({
  userEmail = "admin@glitch.dev",
  onTriggerDeploy
}: PipelinePageProps = {}) {
  const [pipelines, setPipelines] = useState<PipelineItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewModal, setShowNewModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    application_id: "",
    trigger_type: "Push",
    branch_pattern: "main"
  });

  const fetchPipelines = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("http://127.0.0.1:8000/api/v1/pipelines");
      if (res.ok) {
        const data = await res.json();
        setPipelines(data);
      }
    } catch (err) {
      console.error("Error fetching pipelines:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPipelines();
  }, []);

  const handleCreatePipeline = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    try {
      setIsSubmitting(true);
      const res = await fetch("http://127.0.0.1:8000/api/v1/pipelines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        setShowNewModal(false);
        setFormData({ name: "", application_id: "", trigger_type: "Push", branch_pattern: "main" });
        fetchPipelines();
      }
    } catch (err) {
      console.error("Error creating pipeline:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRunPipeline = async (pipelineId: string) => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/v1/pipelines/${pipelineId}/run`, {
        method: "POST"
      });
      if (res.ok) {
        fetchPipelines();
      }
    } catch (err) {
      console.error("Error triggering pipeline run:", err);
    }
  };

  const filteredPipelines = pipelines.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.app_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-5 pb-8 font-sans text-zinc-100 selection:bg-emerald-500 selection:text-black">
      
      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div>
          <div className="flex items-center gap-2">
            <GitBranch className="w-6 h-6 text-emerald-400" />
            <h2 className="text-xl font-bold text-white tracking-tight">Pipelines</h2>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Automated CI/CD build, test, and release workflows.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs font-mono text-zinc-500">
            Home &gt; <span className="text-zinc-300">Pipelines</span>
          </div>
          <Button 
            onClick={() => setShowNewModal(true)}
            className="h-9 px-4 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Create Pipeline
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
              placeholder="Search pipelines..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-9 pr-4 bg-[#060908] border border-zinc-800 rounded-xl text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/60 transition-colors"
            />
          </div>
          <div className="text-xs text-zinc-400 font-mono">
            Showing <span className="text-emerald-400 font-bold">{filteredPipelines.length}</span> pipelines
          </div>
        </div>
      </Card>

      {/* CONTENT LISTING / EMPTY STATE */}
      {isLoading ? (
        <div className="py-16 text-center text-zinc-400 font-mono text-xs flex flex-col items-center gap-2">
          <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" />
          Loading pipelines from MongoDB...
        </div>
      ) : filteredPipelines.length === 0 ? (
        <Card className="p-12 text-center bg-[#090d0b] border-zinc-800/80 rounded-2xl space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 mx-auto flex items-center justify-center">
            <GitBranch className="w-6 h-6" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-base font-bold text-white">No Pipelines Found</h3>
            <p className="text-xs text-zinc-400">
              {searchQuery ? "No pipelines match your search query." : "No pipelines created yet. Define your first CI/CD pipeline."}
            </p>
          </div>
          <Button 
            onClick={() => setShowNewModal(true)}
            className="h-9 px-4 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Create First Pipeline
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredPipelines.map((pipe) => (
            <Card key={pipe.id} className="p-4 bg-[#090d0b] border-zinc-800/80 rounded-2xl hover:border-emerald-500/40 transition-colors space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">{pipe.name}</h3>
                  <span className="text-[10px] font-mono text-zinc-500">{pipe.id} &bull; App: {pipe.app_name}</span>
                </div>
                <Button 
                  onClick={() => handleRunPipeline(pipe.id)}
                  size="sm"
                  className="h-8 px-3 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 font-bold text-xs border border-emerald-500/40 rounded-xl flex items-center gap-1"
                >
                  <Play className="w-3.5 h-3.5" />
                  Run
                </Button>
              </div>

              <div className="space-y-2 text-xs text-zinc-300 font-mono bg-[#060908] p-3 rounded-xl border border-zinc-800/60">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Trigger:</span>
                  <span className="text-zinc-300">{pipe.trigger_type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Branch:</span>
                  <span className="text-emerald-400">{pipe.branch_pattern}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Status:</span>
                  <span className="text-zinc-300">{pipe.status}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* NEW PIPELINE MODAL */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="w-full max-w-md bg-[#090d0b] border-zinc-800 rounded-2xl p-6 space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-400" />
                Create New Pipeline
              </h3>
              <button onClick={() => setShowNewModal(false)} className="text-zinc-500 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePipeline} className="space-y-4 text-xs font-sans">
              <div className="space-y-1.5">
                <label className="text-zinc-300 font-semibold">Pipeline Name *</label>
                <Input 
                  placeholder="e.g. Production Release Pipeline"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-[#060908] border-zinc-800 text-white rounded-xl text-xs h-10"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-zinc-300 font-semibold">Branch Pattern</label>
                <Input 
                  placeholder="main"
                  value={formData.branch_pattern}
                  onChange={(e) => setFormData({ ...formData, branch_pattern: e.target.value })}
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
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Pipeline"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

    </div>
  );
}
