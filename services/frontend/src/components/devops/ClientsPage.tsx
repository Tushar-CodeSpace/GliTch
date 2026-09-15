import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Users, 
  Globe, 
  Search, 
  Plus, 
  Trash2, 
  X,
  Loader2,
  Building2
} from "lucide-react";

interface Client {
  id: string;
  name: string;
  code: string;
  status: string;
  sites_count: number;
  applications_count: number;
  created_at: string;
}

export function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewModal, setShowNewModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    code: ""
  });

  const fetchClients = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("http://127.0.0.1:8000/api/v1/clients");
      if (res.ok) {
        const data = await res.json();
        setClients(data);
      }
    } catch (err) {
      console.error("Error fetching clients:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.code) return;

    try {
      setIsSubmitting(true);
      const res = await fetch("http://127.0.0.1:8000/api/v1/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        setShowNewModal(false);
        setFormData({ name: "", code: "" });
        fetchClients();
      }
    } catch (err) {
      console.error("Error creating client:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClient = async (clientId: string) => {
    if (!confirm("Are you sure you want to delete this client?")) return;
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/v1/clients/${clientId}`, {
        method: "DELETE"
      });
      if (res.ok) {
        setClients(prev => prev.filter(c => c.id !== clientId));
      }
    } catch (err) {
      console.error("Error deleting client:", err);
    }
  };

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-5 pb-8 font-sans text-zinc-100 selection:bg-emerald-500 selection:text-black">
      
      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-6 h-6 text-emerald-400" />
            <h2 className="text-xl font-bold text-white tracking-tight">Clients</h2>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Manage your client organizations, site locations, environment targets, and deployment privileges.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs font-mono text-zinc-500">
            Home &gt; <span className="text-zinc-300">Clients</span>
          </div>
          <Button 
            onClick={() => setShowNewModal(true)}
            className="h-9 px-4 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            New Client
          </Button>
        </div>
      </div>

      {/* METRICS CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-[#090d0b] border border-zinc-800/80 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-600/20 text-blue-400 shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-zinc-400 font-medium">Total Clients</p>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl font-black text-white">{clients.length}</span>
            </div>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#090d0b] border border-zinc-800/80 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-zinc-400 font-medium">Active Accounts</p>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl font-black text-white">
                {clients.filter(c => c.status === "ACTIVE").length}
              </span>
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
              placeholder="Search clients by name or code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-9 pr-4 bg-[#060908] border border-zinc-800 rounded-xl text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/60 transition-colors"
            />
          </div>
          <div className="text-xs text-zinc-400 font-mono">
            Showing <span className="text-emerald-400 font-bold">{filteredClients.length}</span> clients
          </div>
        </div>
      </Card>

      {/* CONTENT LISTING / EMPTY STATE */}
      {isLoading ? (
        <div className="py-16 text-center text-zinc-400 font-mono text-xs flex flex-col items-center gap-2">
          <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" />
          Loading clients from MongoDB...
        </div>
      ) : filteredClients.length === 0 ? (
        <Card className="p-12 text-center bg-[#090d0b] border-zinc-800/80 rounded-2xl space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 mx-auto flex items-center justify-center">
            <Building2 className="w-6 h-6" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-base font-bold text-white">No Clients Found</h3>
            <p className="text-xs text-zinc-400">
              {searchQuery ? "No clients match your search query." : "No clients registered yet. Register your first client organization to start deploying sites."}
            </p>
          </div>
          <Button 
            onClick={() => setShowNewModal(true)}
            className="h-9 px-4 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Add First Client
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClients.map((client) => (
            <Card key={client.id} className="p-4 bg-[#090d0b] border-zinc-800/80 rounded-2xl hover:border-emerald-500/40 transition-colors space-y-4 relative group">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center font-bold font-mono text-sm">
                    {client.code.substring(0, 3)}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">{client.name}</h3>
                    <span className="text-[10px] font-mono text-zinc-500">{client.id} &bull; CODE: {client.code}</span>
                  </div>
                </div>
                <button 
                  onClick={() => handleDeleteClient(client.id)}
                  className="text-zinc-600 hover:text-rose-400 transition-colors p-1"
                  title="Delete client"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2 text-xs text-zinc-300 font-mono bg-[#060908] p-3 rounded-xl border border-zinc-800/60">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Status:</span>
                  <span className="text-emerald-400 font-bold">{client.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Registered:</span>
                  <span className="text-zinc-400">{client.created_at}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* NEW CLIENT MODAL */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <Card className="w-full max-w-md bg-[#090d0b] border-zinc-800 rounded-2xl p-6 space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-400" />
                Add New Client
              </h3>
              <button onClick={() => setShowNewModal(false)} className="text-zinc-500 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateClient} className="space-y-4 text-xs font-sans">
              <div className="space-y-1.5">
                <label className="text-zinc-300 font-semibold">Client Organization Name *</label>
                <Input 
                  placeholder="e.g. Acme Corp"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-[#060908] border-zinc-800 text-white rounded-xl text-xs h-10"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-zinc-300 font-semibold">Client Short Code *</label>
                <Input 
                  placeholder="e.g. ACME"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="bg-[#060908] border-zinc-800 text-white rounded-xl text-xs h-10 font-mono"
                  required
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
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Client"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

    </div>
  );
}
