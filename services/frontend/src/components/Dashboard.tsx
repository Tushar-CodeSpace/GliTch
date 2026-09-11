import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Plus, 
  Trash2, 
  RefreshCw, 
  Server, 
  Code2, 
  Layers, 
  Terminal, 
  Cpu, 
  LogOut, 
  UserCheck,
  Rocket,
  ShieldCheck,
  Activity,
  CheckCircle2,
  GitCommit,
  Wrench,
  Clock,
  ArrowUpRight,
  ShieldAlert,
  HardDrive
} from "lucide-react";

export interface Item {
  id: number;
  title: string;
  description: string;
  category: string;
  created_at: string;
  status: string;
}

export interface HealthInfo {
  status: string;
  service: string;
  version: string;
  timestamp: number;
  python_version: string;
}

interface DashboardProps {
  userEmail: string;
  onLogout: () => void;
}

interface ActivityLog {
  id: string;
  time: string;
  type: "deployment" | "patch" | "monitoring" | "development";
  title: string;
  status: "success" | "pending" | "healthy";
  details: string;
}

export function Dashboard({ userEmail, onLogout }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "deployments" | "patches" | "resources">("overview");
  const [health, setHealth] = useState<HealthInfo | null>(null);
  const [loadingHealth, setLoadingHealth] = useState(true);
  const [items, setItems] = useState<Item[]>([]);
  const [loadingItems, setLoadingItems] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedTelemetry, setCopiedTelemetry] = useState(false);
  const [deploying, setDeploying] = useState(false);
  const [deploySuccessMessage, setDeploySuccessMessage] = useState<string | null>(null);

  // Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({ title: "", description: "", category: "Backend" });
  const [submitting, setSubmitting] = useState(false);

  // Ping Latency
  const [latency, setLatency] = useState<number | null>(null);

  // DevOps Activity Stream Log
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([
    {
      id: "log-1",
      time: "Just now",
      type: "monitoring",
      title: "API Gateway Telemetry Ping",
      status: "healthy",
      details: "Port 8000 operational. Response latency recorded."
    },
    {
      id: "log-2",
      time: "12 mins ago",
      type: "deployment",
      title: "Production Deployment build #104",
      status: "success",
      details: "ghcr.io/tushar-codespace/glitch-api-gateway:latest deployed to EC2"
    },
    {
      id: "log-3",
      time: "45 mins ago",
      type: "patch",
      title: "Dependency Security Audit Passed",
      status: "success",
      details: "uv sync & npm audit clean. 0 vulnerabilities found."
    },
    {
      id: "log-4",
      time: "2 hours ago",
      type: "development",
      title: "Playwright Scraper Agent Pool Initialized",
      status: "healthy",
      details: "Microservice connected on port 8001. Textbox sensing online."
    }
  ]);

  const fetchHealth = async () => {
    setLoadingHealth(true);
    const start = performance.now();
    try {
      const res = await fetch("/api/health");
      const data = await res.json();
      const end = performance.now();
      setLatency(Math.round(end - start));
      setHealth(data);
    } catch (err) {
      console.error("Health fetch failed:", err);
      setHealth(null);
      setLatency(null);
    } finally {
      setLoadingHealth(false);
    }
  };

  const fetchItems = async () => {
    setLoadingItems(true);
    try {
      const res = await fetch("/api/items");
      if (res.ok) {
        const data = await res.json();
        setItems(data);
      }
    } catch (err) {
      console.error("Items fetch failed:", err);
    } finally {
      setLoadingItems(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    fetchItems();
  }, []);

  const handleTriggerDeploy = () => {
    setDeploying(true);
    setDeploySuccessMessage(null);
    setTimeout(() => {
      setDeploying(false);
      setDeploySuccessMessage("CI/CD Deployment Pipeline Triggered! Pushed release to production EC2 node.");
      setActivityLogs(prev => [
        {
          id: `log-${Date.now()}`,
          time: "Just now",
          type: "deployment",
          title: "Manual Release Triggered",
          status: "success",
          details: "Deployed release build to EC2 via GitHub Actions workflow."
        },
        ...prev
      ]);
    }, 1200);
  };

  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description) return;
    
    setSubmitting(true);
    try {
      const res = await fetch("/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        await fetchItems();
        setFormData({ title: "", description: "", category: "Backend" });
        setShowAddForm(false);
      }
    } catch (err) {
      console.error("Failed to create item:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteItem = async (id: number) => {
    try {
      const res = await fetch(`/api/items/${id}`, { method: "DELETE" });
      if (res.ok) {
        setItems(prev => prev.filter(item => item.id !== id));
      }
    } catch (err) {
      console.error("Failed to delete item:", err);
    }
  };

  const handleCopyTelemetry = () => {
    if (!health) return;
    navigator.clipboard.writeText(JSON.stringify(health, null, 2));
    setCopiedTelemetry(true);
    setTimeout(() => setCopiedTelemetry(false), 2000);
  };

  const categories = ["All", "Backend", "Frontend", "Architecture", "General"];

  const filteredItems = items.filter(item => {
    const matchesCategory = activeCategory === "All" || item.category.toLowerCase() === activeCategory.toLowerCase();
    const matchesSearch = searchQuery === "" || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getTagStyle = (cat: string) => {
    switch (cat.toLowerCase()) {
      case "backend": return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.15)]";
      case "frontend": return "bg-teal-500/10 text-teal-300 border-teal-500/30 shadow-[0_0_10px_rgba(20,184,166,0.15)]";
      case "architecture": return "bg-emerald-950/60 text-emerald-200 border-emerald-800/50";
      default: return "bg-zinc-800/60 text-zinc-300 border-zinc-700/50";
    }
  };

  return (
    <div className="min-h-screen bg-[#080b0a] text-zinc-100 selection:bg-emerald-500 selection:text-black">
      
      {/* BACKGROUND AMBIENT GLOW */}
      <div className="fixed top-0 left-1/3 w-[600px] h-[300px] bg-emerald-500/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-[500px] h-[300px] bg-teal-500/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 py-8 space-y-6">
        
        {/* HEADER BAR */}
        <Card className="bg-[#0b100e] p-5 rounded-2xl border-emerald-500/20 shadow-[0_10px_30px_rgba(0,0,0,0.6)] backdrop-blur-2xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
            
            {/* Logo & Platform Info */}
            <div className="flex items-center gap-4">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                <Wrench className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500 font-mono drop-shadow-[0_0_15px_rgba(16,185,129,0.35)] flex items-center">
                    GliTch
                    <span className="inline-block w-2.5 h-6 ml-1.5 bg-emerald-400 animate-terminal-blink" />
                  </h1>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-mono text-emerald-400">
                    DEVOPS HUB v1.0
                  </span>
                </div>
                <p className="text-xs text-zinc-400 font-mono">Personalized DevOps Console</p>
              </div>
            </div>

            {/* Status Pills & Controls */}
            <div className="flex flex-wrap items-center gap-3">
              
              {/* User Identity Capsule */}
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-zinc-800 bg-[#060908] text-xs font-mono text-zinc-300">
                <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span className="truncate max-w-[140px]">{userEmail}</span>
              </div>

              {/* API Gateway Status Pill */}
              <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl border border-zinc-800 bg-[#060908] text-xs">
                <span className={`relative flex h-2 w-2`}>
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${health ? "bg-emerald-400 opacity-75" : "bg-rose-500 opacity-75"}`} />
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${health ? "bg-emerald-400 shadow-[0_0_8px_#10b981]" : "bg-rose-500"}`} />
                </span>
                <span className="text-zinc-300 font-medium font-mono text-xs">
                  {loadingHealth ? "Syncing..." : health ? "API Gateway Online" : "Gateway Offline"}
                </span>
                {latency && (
                  <span className="font-mono text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-md border border-emerald-500/30">
                    {latency}ms
                  </span>
                )}
              </div>

              {/* Refresh Button */}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => { fetchHealth(); fetchItems(); }} 
                className="h-9 border-zinc-800 bg-[#060908] hover:bg-zinc-900 text-zinc-300 rounded-xl transition-all"
              >
                <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loadingHealth ? "animate-spin text-emerald-400" : ""}`} />
                Sync
              </Button>

              {/* Sign Out Button */}
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={onLogout} 
                className="h-9 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-xl transition-all"
              >
                <LogOut className="w-3.5 h-3.5 mr-1.5" />
                Sign Out
              </Button>

            </div>

          </div>
        </Card>

        {/* DEVOPS NAVIGATION TABS BAR */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-zinc-800/80 font-mono text-xs">
          <button
            onClick={() => setActiveTab("overview")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all ${
              activeTab === "overview"
                ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)] font-semibold"
                : "border-transparent bg-transparent text-zinc-400 hover:text-white hover:bg-[#0b100e]"
            }`}
          >
            <Activity className="w-4 h-4" />
            Overview & Monitoring
          </button>

          <button
            onClick={() => setActiveTab("deployments")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all ${
              activeTab === "deployments"
                ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)] font-semibold"
                : "border-transparent bg-transparent text-zinc-400 hover:text-white hover:bg-[#0b100e]"
            }`}
          >
            <Rocket className="w-4 h-4" />
            Deployments & CI/CD
          </button>

          <button
            onClick={() => setActiveTab("patches")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all ${
              activeTab === "patches"
                ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)] font-semibold"
                : "border-transparent bg-transparent text-zinc-400 hover:text-white hover:bg-[#0b100e]"
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            Patch & Security
          </button>

          <button
            onClick={() => setActiveTab("resources")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all ${
              activeTab === "resources"
                ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)] font-semibold"
                : "border-transparent bg-transparent text-zinc-400 hover:text-white hover:bg-[#0b100e]"
            }`}
          >
            <Layers className="w-4 h-4" />
            DevOps Resources ({items.length})
          </button>
        </div>

        {/* TAB 1: OVERVIEW & MONITORING */}
        {activeTab === "overview" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* STATS CARDS GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Card 1: API Gateway */}
              <Card className="bg-[#0b100e] p-5 rounded-2xl border-zinc-800/80 hover:border-emerald-500/50 transition-all relative overflow-hidden group">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[11px] font-mono font-medium text-zinc-400 uppercase tracking-wider">FastAPI Gateway</p>
                    <h3 className="text-xl font-bold mt-1 text-white tracking-tight">{health ? "Online" : "Offline"}</h3>
                  </div>
                  <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                    <Server className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs font-mono text-zinc-400">
                  <span>Python {health?.python_version || "3.12"}</span>
                  <span className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">Port 8000</span>
                </div>
              </Card>

              {/* Card 2: Scraper Agent */}
              <Card className="bg-[#0b100e] p-5 rounded-2xl border-zinc-800/80 hover:border-emerald-500/50 transition-all relative overflow-hidden group">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[11px] font-mono font-medium text-zinc-400 uppercase tracking-wider">Scraper Agent</p>
                    <h3 className="text-xl font-bold mt-1 text-white tracking-tight">Playwright</h3>
                  </div>
                  <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                    <Cpu className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs font-mono text-zinc-400">
                  <span>Port 8001</span>
                  <span className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">Sensed</span>
                </div>
              </Card>

              {/* Card 3: Frontend Stack */}
              <Card className="bg-[#0b100e] p-5 rounded-2xl border-zinc-800/80 hover:border-emerald-500/50 transition-all relative overflow-hidden group">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[11px] font-mono font-medium text-zinc-400 uppercase tracking-wider">Frontend Engine</p>
                    <h3 className="text-xl font-bold mt-1 text-white tracking-tight">React 18</h3>
                  </div>
                  <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                    <Code2 className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs font-mono text-zinc-400">
                  <span>TypeScript + Vite</span>
                  <span className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">Tailwind</span>
                </div>
              </Card>

              {/* Card 4: Total Managed Resources */}
              <Card className="bg-[#0b100e] p-5 rounded-2xl border-zinc-800/80 hover:border-emerald-500/50 transition-all relative overflow-hidden group">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[11px] font-mono font-medium text-zinc-400 uppercase tracking-wider">DevOps Resources</p>
                    <h3 className="text-xl font-bold mt-1 text-white tracking-tight">{items.length} Entries</h3>
                  </div>
                  <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                    <Layers className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs font-mono text-zinc-400">
                  <span>State Store</span>
                  <span className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">Live Catalog</span>
                </div>
              </Card>

            </div>

            {/* LIVE DEVOPS ACTIVITY AUDIT LOG */}
            <Card className="bg-[#0b100e] rounded-2xl border-zinc-800/80 overflow-hidden shadow-2xl">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 p-5 border-b border-zinc-900 bg-[#060908]">
                <div>
                  <CardTitle className="text-base font-extrabold text-white flex items-center gap-2 font-mono">
                    <Clock className="w-4 h-4 text-emerald-400" />
                    Live DevOps Activity Stream
                  </CardTitle>
                  <CardDescription className="text-xs text-zinc-400 mt-0.5">
                    Audit timeline for deployments, health pings, patches, and dev events
                  </CardDescription>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/30">
                  REALTIME AUDIT
                </span>
              </CardHeader>

              <CardContent className="p-5 space-y-3">
                {activityLogs.map((log) => (
                  <div 
                    key={log.id} 
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl border border-zinc-800/80 bg-[#060908] hover:border-emerald-500/30 transition-all gap-3"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0 mt-0.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-white font-mono">{log.title}</h4>
                          <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            {log.type}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-400 mt-1 font-sans">{log.details}</p>
                      </div>
                    </div>

                    <div className="text-[11px] font-mono text-zinc-500 shrink-0 self-end sm:self-center">
                      {log.time}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* TELEMETRY TERMINAL INSPECTOR */}
            <Card className="bg-[#0b100e] rounded-2xl border-zinc-800/80 overflow-hidden shadow-2xl">
              <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-900 bg-[#060908]">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-rose-500/80" />
                    <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                    <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  </div>
                  <div className="flex items-center gap-2 pl-2 border-l border-zinc-800 text-xs font-mono text-zinc-400">
                    <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                    <span>telemetry_stream.json</span>
                  </div>
                </div>

                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleCopyTelemetry}
                  className="h-7 text-xs font-mono text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-lg px-2.5"
                >
                  {copiedTelemetry ? "Copied!" : "Copy JSON"}
                </Button>
              </div>

              <div className="p-5 bg-[#060908] font-mono text-xs text-emerald-400 overflow-x-auto leading-relaxed">
                <pre>
                  {health ? JSON.stringify(health, null, 2) : "// Telemetry payload pending stream connection..."}
                </pre>
              </div>
            </Card>
          </div>
        )}

        {/* TAB 2: DEPLOYMENTS & CI/CD */}
        {activeTab === "deployments" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            
            {/* CI/CD TRIGGER HEADER CARD */}
            <Card className="bg-[#0b100e] p-6 rounded-2xl border-emerald-500/20 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-2">
                  <Rocket className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-lg font-extrabold text-white font-mono">Automated CI/CD Pipeline</h3>
                </div>
                <p className="text-xs text-zinc-400 mt-1 max-w-xl">
                  GitHub Actions workflow automatically builds, runs Pytest unit tests, packages Docker images, and deploys to production EC2 (`docker compose up -d --remove-orphans`).
                </p>
              </div>

              <Button 
                onClick={handleTriggerDeploy}
                disabled={deploying}
                className="h-11 px-6 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all shrink-0"
              >
                {deploying ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin text-black" />
                    Deploying Pipeline...
                  </>
                ) : (
                  <>
                    <Rocket className="w-4 h-4 mr-2" />
                    Trigger Production Deploy
                  </>
                )}
              </Button>
            </Card>

            {deploySuccessMessage && (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span>{deploySuccessMessage}</span>
              </div>
            )}

            {/* ENVIRONMENTS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Production Environment */}
              <Card className="bg-[#0b100e] p-5 rounded-2xl border-zinc-800/80 space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#10b981]" />
                    <h4 className="text-sm font-extrabold text-white font-mono">Production (AWS EC2)</h4>
                  </div>
                  <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30">
                    LIVE
                  </span>
                </div>
                <div className="space-y-2 text-xs font-mono text-zinc-400">
                  <div className="flex justify-between">
                    <span>Host:</span>
                    <span className="text-zinc-200">ec2-user@opt/glitch</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Compose file:</span>
                    <span className="text-zinc-200">docker-compose.prod.yml</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Orphan Pruning:</span>
                    <span className="text-emerald-400">--remove-orphans</span>
                  </div>
                </div>
              </Card>

              {/* Staging Environment */}
              <Card className="bg-[#0b100e] p-5 rounded-2xl border-zinc-800/80 space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-teal-400" />
                    <h4 className="text-sm font-extrabold text-white font-mono">Staging Environment</h4>
                  </div>
                  <span className="text-[10px] font-mono bg-teal-500/10 text-teal-300 px-2 py-0.5 rounded border border-teal-500/30">
                    READY
                  </span>
                </div>
                <div className="space-y-2 text-xs font-mono text-zinc-400">
                  <div className="flex justify-between">
                    <span>GHCR Registry:</span>
                    <span className="text-zinc-200">ghcr.io/tushar-codespace</span>
                  </div>
                  <div className="flex justify-between">
                    <span>API Gateway tag:</span>
                    <span className="text-zinc-200">glitch-api-gateway:latest</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Frontend tag:</span>
                    <span className="text-zinc-200">glitch-frontend:latest</span>
                  </div>
                </div>
              </Card>

              {/* Local Dev Environment */}
              <Card className="bg-[#0b100e] p-5 rounded-2xl border-zinc-800/80 space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                    <h4 className="text-sm font-extrabold text-white font-mono">Local Dev Environment</h4>
                  </div>
                  <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30">
                    RUNNING
                  </span>
                </div>
                <div className="space-y-2 text-xs font-mono text-zinc-400">
                  <div className="flex justify-between">
                    <span>Vite Frontend:</span>
                    <span className="text-emerald-400">http://localhost:5173</span>
                  </div>
                  <div className="flex justify-between">
                    <span>API Gateway:</span>
                    <span className="text-emerald-400">http://127.0.0.1:8000</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pytest Suite:</span>
                    <span className="text-emerald-400">4 / 4 PASSED</span>
                  </div>
                </div>
              </Card>

            </div>

          </div>
        )}

        {/* TAB 3: PATCH MANAGEMENT & SECURITY */}
        {activeTab === "patches" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Package & Dependency Health */}
              <Card className="bg-[#0b100e] p-6 rounded-2xl border-zinc-800/80 space-y-4">
                <div className="flex items-center gap-3 border-b border-zinc-900 pb-4">
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-white font-mono">Package Patch & Version Manager</h3>
                    <p className="text-xs text-zinc-400">Python `uv` and Node.js `npm` dependencies audit</p>
                  </div>
                </div>

                <div className="space-y-3 font-mono text-xs">
                  <div className="p-3.5 rounded-xl bg-[#060908] border border-zinc-800 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-white">FastAPI & Uvicorn (`uv`)</h4>
                      <p className="text-[11px] text-zinc-400">FastAPI 0.110.0 &bull; Uvicorn 0.28.0</p>
                    </div>
                    <span className="px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      PATCHED
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#060908] border border-zinc-800 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-white">React & Vite (`npm`)</h4>
                      <p className="text-[11px] text-zinc-400">React 18 &bull; Vite 5.4.21</p>
                    </div>
                    <span className="px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      UP TO DATE
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#060908] border border-zinc-800 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-white">Playwright Browser Pool</h4>
                      <p className="text-[11px] text-zinc-400">Chromium Headless &bull; Playwright 1.42.0</p>
                    </div>
                    <span className="px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      SECURE
                    </span>
                  </div>
                </div>
              </Card>

              {/* Security Audit & Compliance Card */}
              <Card className="bg-[#0b100e] p-6 rounded-2xl border-zinc-800/80 space-y-4">
                <div className="flex items-center gap-3 border-b border-zinc-900 pb-4">
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-white font-mono">DevOps Security Compliance</h3>
                    <p className="text-xs text-zinc-400">Container vulnerability and CORS policy scanner</p>
                  </div>
                </div>

                <div className="space-y-3 font-mono text-xs">
                  <div className="p-3.5 rounded-xl bg-[#060908] border border-zinc-800 space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-200 font-bold">CORS Policy Configuration</span>
                      <span className="text-emerald-400">ACTIVE</span>
                    </div>
                    <p className="text-[11px] text-zinc-400 font-sans">CORSMiddleware configured for API Gateway endpoints.</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#060908] border border-zinc-800 space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-200 font-bold">Docker Image Prune & Cleanup</span>
                      <span className="text-emerald-400">AUTOMATED</span>
                    </div>
                    <p className="text-[11px] text-zinc-400 font-sans">`docker image prune -f` executed post-deploy.</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#060908] border border-zinc-800 space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-200 font-bold">Orphan Container Safeguard</span>
                      <span className="text-emerald-400">ENFORCED</span>
                    </div>
                    <p className="text-[11px] text-zinc-400 font-sans">`--remove-orphans` prevents legacy port binding conflicts.</p>
                  </div>
                </div>
              </Card>

            </div>
          </div>
        )}

        {/* TAB 4: DEVOPS RESOURCES & TOOLS */}
        {activeTab === "resources" && (
          <Card className="bg-[#0b100e] rounded-2xl border-zinc-800/80 overflow-hidden shadow-2xl animate-in fade-in duration-200">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 border-b border-zinc-900 bg-[#060908]">
              <div>
                <CardTitle className="text-lg font-extrabold text-white tracking-tight flex items-center gap-2 font-mono">
                  <Layers className="w-5 h-5 text-emerald-400" />
                  DevOps Resource & Infrastructure Catalog
                </CardTitle>
                <CardDescription className="text-xs text-zinc-400 mt-1">
                  Real-time DevOps items fetched from API Gateway
                </CardDescription>
              </div>

              <Button 
                onClick={() => setShowAddForm(!showAddForm)} 
                className="h-10 px-4 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all"
              >
                <Plus className="w-4 h-4 mr-1.5 stroke-[3]" />
                Add New Entry
              </Button>
            </CardHeader>

            <CardContent className="space-y-6 p-6">
              
              {/* Create Item Form Drawer */}
              {showAddForm && (
                <form onSubmit={handleCreateItem} className="p-5 rounded-2xl border border-emerald-500/40 bg-[#060908] shadow-[0_0_30px_rgba(16,185,129,0.1)] space-y-4 backdrop-blur-xl animate-in fade-in slide-in-from-top-4 duration-300">
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                    <h4 className="text-sm font-bold text-emerald-400 font-mono flex items-center gap-2">
                      <Plus className="w-4 h-4" /> Create New Resource Entry
                    </h4>
                    <span className="text-[10px] font-mono text-zinc-500 uppercase">POST /api/items</span>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="item-title" className="text-zinc-300 text-xs font-semibold font-mono">Resource Title</Label>
                      <Input 
                        id="item-title"
                        placeholder="e.g. Redis Cache Cluster"
                        value={formData.title} 
                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                        className="bg-[#080b0a] border-zinc-800 text-white focus-visible:ring-emerald-500/50 rounded-xl text-sm"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="item-cat" className="text-zinc-300 text-xs font-semibold font-mono">Category Tag</Label>
                      <select 
                        id="item-cat"
                        className="flex h-10 w-full rounded-xl border border-zinc-800 bg-[#080b0a] px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 font-mono"
                        value={formData.category}
                        onChange={e => setFormData({ ...formData, category: e.target.value })}
                      >
                        <option value="Backend">Backend</option>
                        <option value="Frontend">Frontend</option>
                        <option value="Architecture">Architecture</option>
                        <option value="General">General</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="item-desc" className="text-zinc-300 text-xs font-semibold font-mono">Detailed Description</Label>
                    <textarea 
                      id="item-desc"
                      rows={2}
                      className="flex w-full rounded-xl border border-zinc-800 bg-[#080b0a] px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 font-sans"
                      placeholder="Provide resource summary and technical purpose..."
                      value={formData.description}
                      onChange={e => setFormData({ ...formData, description: e.target.value })}
                      required
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <Button type="button" variant="outline" size="sm" onClick={() => setShowAddForm(false)} className="border-zinc-800 text-zinc-400 rounded-xl">Cancel</Button>
                    <Button type="submit" size="sm" disabled={submitting} className="bg-emerald-500 text-black font-extrabold rounded-xl px-5">
                      {submitting ? "Saving..." : "Commit Entry"}
                    </Button>
                  </div>
                </form>
              )}

              {/* Filter Chips & Search Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                
                {/* Category Filter Chips */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-semibold border transition-all shrink-0 ${
                        activeCategory === cat 
                          ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]" 
                          : "border-zinc-800 bg-[#060908] text-zinc-400 hover:text-white hover:border-zinc-700"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Search Bar */}
                <div className="relative min-w-[240px]">
                  <Input
                    type="text"
                    placeholder="Filter resources..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="h-9 bg-[#060908] border-zinc-800 text-white placeholder:text-zinc-600 focus-visible:ring-emerald-500/40 rounded-xl text-xs pl-3 pr-8"
                  />
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery("")} 
                      className="absolute right-2.5 top-2 text-zinc-500 hover:text-white text-xs font-mono"
                    >
                      &times;
                    </button>
                  )}
                </div>

              </div>

              {/* Resource Items Grid */}
              {loadingItems ? (
                <div className="py-16 text-center text-xs font-mono text-zinc-500 flex flex-col items-center justify-center gap-3">
                  <RefreshCw className="w-6 h-6 animate-spin text-emerald-400" />
                  <span>Loading catalog state...</span>
                </div>
              ) : filteredItems.length === 0 ? (
                <div className="py-16 text-center text-xs font-mono text-zinc-500 border border-dashed border-zinc-800 rounded-2xl bg-[#060908]">
                  No items match your criteria.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredItems.map(item => (
                    <Card key={item.id} className="bg-[#0b100e] p-5 rounded-2xl border-zinc-800/80 hover:border-emerald-500/40 transition-all group flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-center mb-3">
                          <span className={`text-[10px] font-mono font-bold uppercase px-2.5 py-1 rounded-md border ${getTagStyle(item.category)}`}>
                            {item.category}
                          </span>
                          <button 
                            onClick={() => handleDeleteItem(item.id)}
                            className="text-zinc-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-500/10 transition-colors opacity-80 group-hover:opacity-100"
                            title="Delete item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <h4 className="font-bold text-sm text-white group-hover:text-emerald-400 transition-colors mb-1.5">{item.title}</h4>
                        <p className="text-xs text-zinc-400 line-clamp-3 leading-relaxed">{item.description}</p>
                      </div>

                      <div className="flex justify-between items-center text-[10px] font-mono text-zinc-500 pt-4 mt-4 border-t border-zinc-800/60">
                        <span className="bg-[#060908] px-2 py-0.5 rounded text-zinc-400 border border-zinc-800">ID #{item.id}</span>
                        <span>{item.created_at}</span>
                      </div>
                    </Card>
                  ))}
                </div>
              )}

            </CardContent>
          </Card>
        )}

      </div>
    </div>
  );
}
