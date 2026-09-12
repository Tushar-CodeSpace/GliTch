import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { HardDrive, Plus, Trash2 } from "lucide-react";

export interface Item {
  id: number;
  title: string;
  description: string;
  category: string;
  created_at: string;
  status: string;
}

interface CatalogPageProps {
  items: Item[];
  onDeleteItem: (id: number) => void;
  onCreateItem: (e: React.FormEvent) => void;
  showAddForm: boolean;
  setShowAddForm: (show: boolean) => void;
  formData: { title: string; description: string; category: string };
  setFormData: (data: { title: string; description: string; category: string }) => void;
  submitting: boolean;
}

export function CatalogPage({
  items,
  onDeleteItem,
  onCreateItem,
  showAddForm,
  setShowAddForm,
  formData,
  setFormData,
  submitting,
}: CatalogPageProps) {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredItems = items.filter((item) => {
    const matchesCategory = activeCategory === "All" || item.category.toLowerCase() === activeCategory.toLowerCase();
    const matchesSearch =
      searchQuery === "" ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6 font-mono">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <HardDrive className="w-5 h-5 text-emerald-400" />
            DevOps Infrastructure & Microservices Catalog
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Register and manage microservices, API routes, database clusters, and cloud resources
          </p>
        </div>

        <Button
          onClick={() => setShowAddForm(!showAddForm)}
          className="h-9 px-4 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold font-mono text-xs rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.25)] transition-all"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Register Resource
        </Button>
      </div>

      {/* ADD FORM */}
      {showAddForm && (
        <Card className="bg-[#0b100e] border-emerald-500/30 p-5 rounded-2xl space-y-4">
          <h3 className="font-bold text-sm text-emerald-400">Register New DevOps Resource</h3>
          <form onSubmit={onCreateItem} className="space-y-3 text-xs">
            <div>
              <Label className="text-zinc-300">Title / Component Name</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Redis Cache Cluster"
                className="bg-[#060908] border-zinc-800 text-white mt-1 h-9 rounded-xl font-mono"
                required
              />
            </div>
            <div>
              <Label className="text-zinc-300">Description / Config Details</Label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="e.g. In-memory session store on port 6379"
                className="bg-[#060908] border-zinc-800 text-white mt-1 h-9 rounded-xl font-mono"
                required
              />
            </div>
            <div>
              <Label className="text-zinc-300">Category</Label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-[#060908] border border-zinc-800 text-white mt-1 h-9 rounded-xl px-3 outline-none focus:border-emerald-500 font-mono"
              >
                <option value="Backend">Backend</option>
                <option value="Frontend">Frontend</option>
                <option value="Architecture">Architecture</option>
                <option value="General">General</option>
              </select>
            </div>
            <div className="flex gap-2 pt-2">
              <Button type="submit" disabled={submitting} className="bg-emerald-500 text-black font-bold h-9 rounded-xl px-4 text-xs font-mono">
                {submitting ? "Saving..." : "Save Resource"}
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowAddForm(false)} className="border-zinc-800 h-9 rounded-xl text-xs font-mono">
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* ITEMS LIST */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredItems.map((item) => (
          <Card key={item.id} className="bg-[#0b100e] border-emerald-500/20 p-4 rounded-2xl flex flex-col justify-between space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono border bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                  {item.category}
                </span>
                <h4 className="font-bold text-sm text-white font-mono mt-2">{item.title}</h4>
                <p className="text-xs text-zinc-400 mt-1 font-sans">{item.description}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDeleteItem(item.id)}
                className="h-8 w-8 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg shrink-0"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
            <div className="text-[10px] font-mono text-zinc-500 pt-2 border-t border-zinc-900">
              Created: {item.created_at}
            </div>
          </Card>
        ))}
      </div>

    </div>
  );
}
