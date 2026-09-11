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
  UserCheck 
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

export function Dashboard({ userEmail, onLogout }: DashboardProps) {
  const [health, setHealth] = useState<HealthInfo | null>(null);
  const [loadingHealth, setLoadingHealth] = useState(true);
  const [items, setItems] = useState<Item[]>([]);
  const [loadingItems, setLoadingItems] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  
  // Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({ title: "", description: "", category: "Backend" });
  const [submitting, setSubmitting] = useState(false);

  // Ping Latency
  const [latency, setLatency] = useState<number | null>(null);

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

  const categories = ["All", "Backend", "Frontend", "Architecture", "General"];

  const filteredItems = activeCategory === "All" 
    ? items 
    : items.filter(item => item.category.toLowerCase() === activeCategory.toLowerCase());

  const getTagStyle = (cat: string) => {
    switch (cat.toLowerCase()) {
      case "backend": return "bg-cyan-500/10 text-cyan-400 border-cyan-500/30";
      case "frontend": return "bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/30";
      case "architecture": return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
      default: return "bg-amber-500/10 text-amber-400 border-amber-500/30";
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 bg-black text-white selection:bg-cyan-500 selection:text-black">
      
      {/* HEADER BAR */}
      <Card className="p-6 bg-[#050508]/90 border-white/10 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          <div className="flex items-center gap-4">
            <img 
              src="/glitch-logo.png" 
              alt="GLITCh" 
              className="h-12 w-auto object-contain"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Logged in User Pill */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-zinc-800 bg-black/60 text-xs font-mono text-zinc-300">
              <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>{userEmail}</span>
            </div>

            {/* Health Badge */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-zinc-800 bg-black text-xs">
              <span className={`w-2 h-2 rounded-full ${health ? "bg-cyan-400 shadow-sm shadow-cyan-400" : "bg-rose-500"}`} />
              <span className="text-zinc-300">{loadingHealth ? "Syncing..." : health ? "FastAPI Online" : "Backend Offline"}</span>
              {latency && (
                <span className="font-mono text-[10px] text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-500/20">
                  {latency}ms
                </span>
              )}
            </div>

            <Button variant="outline" size="sm" onClick={() => { fetchHealth(); fetchItems(); }} className="border-zinc-800 bg-black hover:bg-zinc-900 text-zinc-300">
              <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loadingHealth ? "animate-spin" : ""}`} />
              Sync
            </Button>

            <Button variant="destructive" size="sm" onClick={onLogout} className="bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30">
              <LogOut className="w-3.5 h-3.5 mr-1.5" />
              Sign Out
            </Button>
          </div>

        </div>
      </Card>

      {/* DASHBOARD STATS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 bg-[#050508]/90 border-white/10 hover:border-cyan-500/40 transition-colors">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-mono text-zinc-400 uppercase">FastAPI Engine</p>
              <h3 className="text-xl font-bold mt-1 text-white">{health ? "Online" : "Offline"}</h3>
            </div>
            <div className="p-2.5 bg-cyan-500/10 rounded-lg text-cyan-400 border border-cyan-500/20">
              <Server className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs font-mono text-zinc-500 mt-3">
            Python {health?.python_version || "3.12"} &bull; Port 8000
          </p>
        </Card>

        <Card className="p-5 bg-[#050508]/90 border-white/10 hover:border-fuchsia-500/40 transition-colors">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-mono text-zinc-400 uppercase">Scraper Agent</p>
              <h3 className="text-xl font-bold mt-1 text-white">Playwright</h3>
            </div>
            <div className="p-2.5 bg-fuchsia-500/10 rounded-lg text-fuchsia-400 border border-fuchsia-500/20">
              <Cpu className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs font-mono text-zinc-500 mt-3">
            Port 8001 &bull; Textbox Sensed
          </p>
        </Card>

        <Card className="p-5 bg-[#050508]/90 border-white/10 hover:border-emerald-500/40 transition-colors">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-mono text-zinc-400 uppercase">Frontend</p>
              <h3 className="text-xl font-bold mt-1 text-white">TypeScript</h3>
            </div>
            <div className="p-2.5 bg-emerald-500/10 rounded-lg text-emerald-400 border border-emerald-500/20">
              <Code2 className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs font-mono text-zinc-500 mt-3">
            React 18 + Vite &bull; Tailwind CSS
          </p>
        </Card>

        <Card className="p-5 bg-[#050508]/90 border-white/10 hover:border-amber-500/40 transition-colors">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-mono text-zinc-400 uppercase">Total Resources</p>
              <h3 className="text-xl font-bold mt-1 text-white">{items.length}</h3>
            </div>
            <div className="p-2.5 bg-amber-500/10 rounded-lg text-amber-400 border border-amber-500/20">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs font-mono text-zinc-500 mt-3">
            Active items in backend state
          </p>
        </Card>
      </div>

      {/* RESOURCE MANAGER */}
      <Card className="bg-[#050508]/90 border-white/10">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-zinc-900">
          <div>
            <CardTitle className="text-lg font-bold text-white">Application Resources</CardTitle>
            <CardDescription className="text-xs text-zinc-400">
              Live CRUD items managed by FastAPI backend
            </CardDescription>
          </div>
          <Button onClick={() => setShowAddForm(!showAddForm)} className="bg-cyan-500 hover:bg-cyan-400 text-black font-semibold">
            <Plus className="w-4 h-4 mr-1.5" />
            Add Resource
          </Button>
        </CardHeader>

        <CardContent className="space-y-4 pt-6">
          {showAddForm && (
            <form onSubmit={handleCreateItem} className="p-4 rounded-lg border border-zinc-800 bg-black/80 space-y-4">
              <h4 className="text-sm font-semibold text-cyan-400 font-mono">New Resource Entry</h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="item-title" className="text-zinc-300">Title</Label>
                  <Input 
                    id="item-title"
                    placeholder="e.g. Async PostgreSQL Pool"
                    value={formData.title} 
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    className="bg-black border-zinc-800 text-white focus-visible:ring-cyan-500"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="item-cat" className="text-zinc-300">Category</Label>
                  <select 
                    id="item-cat"
                    className="flex h-10 w-full rounded-md border border-zinc-800 bg-black px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
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
                <Label htmlFor="item-desc" className="text-zinc-300">Description</Label>
                <textarea 
                  id="item-desc"
                  rows={2}
                  className="flex w-full rounded-md border border-zinc-800 bg-black px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
                  placeholder="Provide component description..."
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowAddForm(false)} className="border-zinc-800 text-zinc-400">Cancel</Button>
                <Button type="submit" size="sm" disabled={submitting} className="bg-cyan-500 text-black font-semibold">
                  {submitting ? "Saving..." : "Create Resource"}
                </Button>
              </div>
            </form>
          )}

          <div className="flex gap-2 overflow-x-auto pb-1">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium border transition-all ${
                  activeCategory === cat 
                    ? "border-cyan-500/50 bg-cyan-500/10 text-cyan-400" 
                    : "border-zinc-800 bg-black/40 text-zinc-400 hover:text-white"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {loadingItems ? (
            <div className="py-12 text-center text-sm font-mono text-zinc-500">
              Loading resources...
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="py-12 text-center text-sm font-mono text-zinc-500 border border-dashed border-zinc-800 rounded-lg">
              No items found in category "{activeCategory}".
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredItems.map(item => (
                <Card key={item.id} className="p-4 bg-black/50 border-zinc-800/80 hover:border-cyan-500/40">
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-[10px] font-mono font-semibold uppercase px-2 py-0.5 rounded border ${getTagStyle(item.category)}`}>
                      {item.category}
                    </span>
                    <button 
                      onClick={() => handleDeleteItem(item.id)}
                      className="text-zinc-500 hover:text-rose-400 p-1 transition-colors"
                      title="Delete item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <h4 className="font-semibold text-sm mb-1 text-white">{item.title}</h4>
                  <p className="text-xs text-zinc-400 mb-4 line-clamp-2">{item.description}</p>
                  <div className="flex justify-between items-center text-[10px] font-mono text-zinc-600 pt-2 border-t border-zinc-800/60">
                    <span>ID: #{item.id}</span>
                    <span>{item.created_at}</span>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* TELEMETRY INSPECTOR */}
      <Card className="p-6 bg-[#050508]/90 border-white/10">
        <div className="flex items-center gap-2 mb-3">
          <Terminal className="w-4 h-4 text-cyan-400" />
          <h3 className="font-bold text-sm text-white">System Telemetry Output</h3>
        </div>
        <pre className="font-mono text-xs bg-black p-4 rounded-lg border border-zinc-800 text-cyan-400 overflow-x-auto">
          {health ? JSON.stringify(health, null, 2) : "// Backend telemetry pending connection..."}
        </pre>
      </Card>

    </div>
  );
}
