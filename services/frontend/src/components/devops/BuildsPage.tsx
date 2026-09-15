import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Layers, 
  Search, 
  Plus, 
  Trash2, 
  X,
  Loader2,
  Box,
  ChevronDown
} from "lucide-react";

interface BuildItem {
  id: string;
  application_id: string;
  app_name: string;
  build_number: string;
  version: string;
  commit_hash: string;
  branch: string;
  checksum_sha256: string;
  storage_path: string;
  status: string;
  created_at: string;
}

interface ApplicationItem {
  id: string;
  name: string;
  repository: string;
  default_branch: string;
  technology: string;
  is_private?: boolean;
  status: string;
}

export function BuildsPage() {
  const [builds, setBuilds] = useState<BuildItem[]>([]);
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewModal, setShowNewModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    application_id: "",
    version: "v1.0.0",
    commit_hash: "",
    branch: "main"
  });

  const fetchBuilds = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("http://127.0.0.1:8000/api/v1/builds");
      if (res.ok) {
        const data = await res.json();
        setBuilds(data);
      }
    } catch (err) {
      console.error("Error fetching builds:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchApplications = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/api/v1/applications");
      if (res.ok) {
        const data = await res.json();
        setApplications(data);
      }
    } catch (err) {
      console.error("Error fetching applications:", err);
    }
  };

  useEffect(() => {
    fetchBuilds();
    fetchApplications();
  }, []);

  const handleCreateBuild = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const res = await fetch("http://127.0.0.1:8000/api/v1/builds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        setShowNewModal(false);
        setFormData({ application_id: "", version: "v1.0.0", commit_hash: "", branch: "main" });
        fetchBuilds();
      }
    } catch (err) {
      console.error("Error creating build:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredBuilds = builds.filter(b => 
    b.app_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.version.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.build_number.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-5 pb-8 font-sans text-zinc-100 selection:bg-emerald-500 selection:text-black">
      
      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-6 h-6 text-emerald-400" />
            <h2 className="text-xl font-bold text-white tracking-tight">Builds & Artifacts</h2>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Compiled build artifacts, SHA256 checksum validation, and version packages.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs font-mono text-zinc-500">
            Home &gt; <span className="text-zinc-300">Builds</span>
          </div>
          <Button 
            onClick={() => setShowNewModal(true)}
            className="h-9 px-4 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            New Build
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
              placeholder="Search builds by version or app..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-9 pr-4 bg-[#060908] border border-zinc-800 rounded-xl text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/60 transition-colors"
            />
          </div>
          <div className="text-xs text-zinc-400 font-mono">
            Showing <span className="text-emerald-400 font-bold">{filteredBuilds.length}</span> builds
          </div>
        </div>
      </Card>

      {/* CONTENT LISTING / EMPTY STATE */}
      {isLoading ? (
        <div className="py-16 text-center text-zinc-400 font-mono text-xs flex flex-col items-center gap-2">
          <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" />
          Loading builds from MongoDB...
        </div>
      ) : filteredBuilds.length === 0 ? (
        <Card className="p-12 text-center bg-[#090d0b] border-zinc-800/80 rounded-2xl space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 mx-auto flex items-center justify-center">
            <Layers className="w-6 h-6" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-base font-bold text-white">No Builds Found</h3>
            <p className="text-xs text-zinc-400">
              {searchQuery ? "No builds match your search query." : "No build packages recorded yet. Register your first build package."}
            </p>
          </div>
          <Button 
            onClick={() => setShowNewModal(true)}
            className="h-9 px-4 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Register First Build
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredBuilds.map((build) => (
            <Card key={build.id} className="p-4 bg-[#090d0b] border-zinc-800/80 rounded-2xl hover:border-emerald-500/40 transition-colors space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">{build.app_name} ({build.version})</h3>
                  <span className="text-[10px] font-mono text-zinc-500">{build.build_number} &bull; ID: {build.id}</span>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                  {build.status}
                </span>
              </div>

              <div className="space-y-2 text-xs text-zinc-300 font-mono bg-[#060908] p-3 rounded-xl border border-zinc-800/60">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Branch:</span>
                  <span className="text-emerald-400">{build.branch}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Checksum:</span>
                  <span className="text-zinc-400 text-[10px] truncate max-w-[200px]">{build.checksum_sha256}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Created:</span>
                  <span className="text-zinc-400">{build.created_at}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* NEW BUILD MODAL */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="w-full max-w-md bg-[#090d0b] border-zinc-800 rounded-2xl p-6 space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-400" />
                Register New Build
              </h3>
              <button onClick={() => setShowNewModal(false)} className="text-zinc-500 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBuild} className="space-y-4 text-xs font-sans">
              <div className="space-y-1.5">
                <Label className="text-zinc-300 font-semibold">Target Application *</Label>
                <div className="relative">
                  <select
                    value={formData.application_id}
                    onChange={(e) => {
                      const selected = applications.find(a => a.id === e.target.value);
                      setFormData({
                        ...formData,
                        application_id: e.target.value,
                        branch: selected?.default_branch || "main"
                      });
                    }}
                    className="w-full h-10 pl-3 pr-8 bg-[#060908] border border-zinc-800 rounded-xl text-xs text-white appearance-none focus:outline-none focus:border-emerald-500/60 cursor-pointer"
                    required
                  >
                    <option value="">Select application...</option>
                    {applications.map((app) => (
                      <option key={app.id} value={app.id}>
                        {app.name} ({app.default_branch})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-zinc-500 absolute right-3 top-2.5 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-zinc-300 font-semibold">Build Version *</label>
                <Input 
                  placeholder="e.g. v2.4.1"
                  value={formData.version}
                  onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                  className="bg-[#060908] border-zinc-800 text-white rounded-xl text-xs h-10"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-zinc-300 font-semibold">Target Branch</label>
                <Input 
                  placeholder="main"
                  value={formData.branch}
                  onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
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
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Build"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

    </div>
  );
}
