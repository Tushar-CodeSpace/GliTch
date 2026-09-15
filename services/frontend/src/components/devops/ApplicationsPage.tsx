import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Grid, 
  Box, 
  Plus, 
  Search, 
  Github, 
  Trash2,
  X,
  Loader2,
  Lock,
  Eye,
  EyeOff,
  KeyRound,
  ShieldCheck
} from "lucide-react";

interface ApplicationItem {
  id: string;
  name: string;
  repository: string;
  default_branch: string;
  technology: string;
  is_private?: boolean;
  repo_username?: string;
  repo_token_or_password?: string;
  status: string;
  clients_count: number;
  last_deployment: string;
  created_at: string;
}

export function ApplicationsPage() {
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewModal, setShowNewModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    repository: "",
    default_branch: "main",
    technology: "Node.js / React",
    is_private: false,
    repo_username: "",
    repo_token_or_password: ""
  });

  const fetchApplications = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("http://127.0.0.1:8000/api/v1/applications");
      if (res.ok) {
        const data = await res.json();
        setApplications(data);
      }
    } catch (err) {
      console.error("Error fetching applications:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleCreateApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.repository) return;

    try {
      setIsSubmitting(true);
      const res = await fetch("http://127.0.0.1:8000/api/v1/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        setShowNewModal(false);
        setFormData({ 
          name: "", 
          repository: "", 
          default_branch: "main", 
          technology: "Node.js / React",
          is_private: false,
          repo_username: "",
          repo_token_or_password: ""
        });
        fetchApplications();
      }
    } catch (err) {
      console.error("Error creating application:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteApplication = async (appId: string) => {
    if (!confirm("Are you sure you want to delete this application?")) return;
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/v1/applications/${appId}`, {
        method: "DELETE"
      });
      if (res.ok) {
        setApplications(prev => prev.filter(a => a.id !== appId));
      }
    } catch (err) {
      console.error("Error deleting application:", err);
    }
  };

  const filteredApps = applications.filter(app => {
    return app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           app.repository.toLowerCase().includes(searchQuery.toLowerCase()) ||
           app.technology.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="space-y-5 pb-8 font-sans text-zinc-100 selection:bg-emerald-500 selection:text-black">
      
      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div>
          <div className="flex items-center gap-2">
            <Box className="w-6 h-6 text-emerald-400" />
            <h2 className="text-xl font-bold text-white tracking-tight">Applications</h2>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Manage public & private software applications. Define credentials, pipelines, environments and configurations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs font-mono text-zinc-500">
            Home &gt; <span className="text-zinc-300">Applications</span>
          </div>
          <Button 
            onClick={() => setShowNewModal(true)}
            className="h-9 px-4 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            New Application
          </Button>
        </div>
      </div>

      {/* METRICS CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-[#090d0b] border border-zinc-800/80 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-600/20 text-blue-400 shrink-0">
            <Grid className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-zinc-400 font-medium">Total Applications</p>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl font-black text-white">{applications.length}</span>
            </div>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#090d0b] border border-zinc-800/80 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0">
            <span className="w-3 h-3 rounded-full bg-emerald-400 inline-block" />
          </div>
          <div>
            <p className="text-[11px] text-zinc-400 font-medium">Active Services</p>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl font-black text-white">
                {applications.filter(a => a.status === "ACTIVE").length}
              </span>
            </div>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#090d0b] border border-zinc-800/80 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 shrink-0">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-zinc-400 font-medium">Private Repos</p>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl font-black text-white">
                {applications.filter(a => a.is_private).length}
              </span>
            </div>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#090d0b] border border-zinc-800/80 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-400 shrink-0">
            <Github className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-zinc-400 font-medium">Linked Repos</p>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl font-black text-white">{applications.length}</span>
            </div>
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
              placeholder="Search by name, repository, technology..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-9 pr-4 bg-[#060908] border border-zinc-800 rounded-xl text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/60 transition-colors"
            />
          </div>
          <div className="text-xs text-zinc-400 font-mono">
            Showing <span className="text-emerald-400 font-bold">{filteredApps.length}</span> of {applications.length} applications
          </div>
        </div>
      </Card>

      {/* CONTENT LISTING / EMPTY STATE */}
      {isLoading ? (
        <div className="py-16 text-center text-zinc-400 font-mono text-xs flex flex-col items-center gap-2">
          <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" />
          Loading applications from MongoDB...
        </div>
      ) : filteredApps.length === 0 ? (
        <Card className="p-12 text-center bg-[#090d0b] border-zinc-800/80 rounded-2xl space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 mx-auto flex items-center justify-center">
            <Box className="w-6 h-6" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-base font-bold text-white">No Applications Found</h3>
            <p className="text-xs text-zinc-400">
              {searchQuery ? "No applications match your search query." : "No applications registered yet. Click below to add your first software application."}
            </p>
          </div>
          <Button 
            onClick={() => setShowNewModal(true)}
            className="h-9 px-4 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Add First Application
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredApps.map((app) => (
            <Card key={app.id} className="p-4 bg-[#090d0b] border-zinc-800/80 rounded-2xl hover:border-emerald-500/40 transition-colors space-y-4 relative group">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold font-mono text-sm">
                    {app.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-sm font-bold text-white">{app.name}</h3>
                      {app.is_private && (
                        <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[9px] font-mono flex items-center gap-1" title="Private Repository">
                          <Lock className="w-2.5 h-2.5" /> Private
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] font-mono text-zinc-500">{app.id}</span>
                  </div>
                </div>
                <button 
                  onClick={() => handleDeleteApplication(app.id)}
                  className="text-zinc-600 hover:text-rose-400 transition-colors p-1"
                  title="Delete application"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2 text-xs text-zinc-300 font-mono bg-[#060908] p-3 rounded-xl border border-zinc-800/60">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Repository:</span>
                  <span className="text-emerald-400 truncate max-w-[180px]">{app.repository}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Branch:</span>
                  <span className="text-zinc-300">{app.default_branch}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Tech Stack:</span>
                  <span className="text-zinc-300">{app.technology}</span>
                </div>
                {app.is_private && app.repo_username && (
                  <div className="flex justify-between border-t border-zinc-800/60 pt-1.5">
                    <span className="text-zinc-500">Auth User:</span>
                    <span className="text-amber-400">{app.repo_username}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-zinc-500">Last Deploy:</span>
                  <span className="text-zinc-400">{app.last_deployment}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* NEW APPLICATION MODAL */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="w-full max-w-md bg-[#090d0b] border-zinc-800 rounded-2xl p-6 space-y-4 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-400" />
                Add New Application
              </h3>
              <button onClick={() => setShowNewModal(false)} className="text-zinc-500 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateApplication} className="space-y-4 text-xs font-sans">
              <div className="space-y-1.5">
                <label className="text-zinc-300 font-semibold">Application Name *</label>
                <Input 
                  placeholder="e.g. Ecom Core Service"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-[#060908] border-zinc-800 text-white rounded-xl text-xs h-10"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-zinc-300 font-semibold">Repository URL *</label>
                <Input 
                  placeholder="e.g. github.com/org/ecom-service"
                  value={formData.repository}
                  onChange={(e) => setFormData({ ...formData, repository: e.target.value })}
                  className="bg-[#060908] border-zinc-800 text-white rounded-xl text-xs h-10"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-zinc-300 font-semibold">Default Branch</label>
                  <Input 
                    placeholder="main"
                    value={formData.default_branch}
                    onChange={(e) => setFormData({ ...formData, default_branch: e.target.value })}
                    className="bg-[#060908] border-zinc-800 text-white rounded-xl text-xs h-10"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-zinc-300 font-semibold">Technology Stack</label>
                  <Input 
                    placeholder="Node.js / React"
                    value={formData.technology}
                    onChange={(e) => setFormData({ ...formData, technology: e.target.value })}
                    className="bg-[#060908] border-zinc-800 text-white rounded-xl text-xs h-10"
                  />
                </div>
              </div>

              {/* PRIVATE REPOSITORY TOGGLE */}
              <div className="p-3 bg-[#060908] border border-zinc-800/80 rounded-xl space-y-3">
                <label className="flex items-center justify-between cursor-pointer select-none">
                  <div className="flex items-center gap-2">
                    <Lock className={`w-4 h-4 ${formData.is_private ? "text-amber-400" : "text-zinc-500"}`} />
                    <span className="text-zinc-200 font-semibold text-xs">Private Repository Authentication</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.is_private}
                    onChange={(e) => setFormData({ ...formData, is_private: e.target.checked })}
                    className="w-4 h-4 rounded border-zinc-700 bg-black text-emerald-500 focus:ring-emerald-500/40 cursor-pointer"
                  />
                </label>

                {formData.is_private && (
                  <div className="space-y-3 pt-2 border-t border-zinc-800/60 animate-in fade-in duration-200">
                    <div className="space-y-1">
                      <label className="text-zinc-400 text-[11px]">Git Username / Service Account</label>
                      <Input 
                        placeholder="e.g. git-user or bot-account"
                        value={formData.repo_username}
                        onChange={(e) => setFormData({ ...formData, repo_username: e.target.value })}
                        className="bg-black border-zinc-800 text-white rounded-lg text-xs h-9"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-zinc-400 text-[11px]">Personal Access Token / Password</label>
                      <div className="relative">
                        <Input 
                          type={showPassword ? "text" : "password"}
                          placeholder="e.g. ghp_xxxxxxxxxxxx or password"
                          value={formData.repo_token_or_password}
                          onChange={(e) => setFormData({ ...formData, repo_token_or_password: e.target.value })}
                          className="bg-black border-zinc-800 text-white rounded-lg text-xs h-9 pr-8 font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-2.5 top-2.5 text-zinc-500 hover:text-zinc-300"
                        >
                          {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
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
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Application"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

    </div>
  );
}
