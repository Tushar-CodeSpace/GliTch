import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Grid, 
  Box, 
  Plus, 
  Search, 
  ShoppingCart, 
  BarChart3, 
  ShoppingBag, 
  Pill, 
  GraduationCap, 
  Building2, 
  Users, 
  Package, 
  Github, 
  Pencil, 
  MoreHorizontal, 
  LayoutGrid, 
  Table as TableIcon,
  ChevronLeft,
  ChevronRight,
  ChevronDown
} from "lucide-react";

interface ApplicationItem {
  id: string;
  name: string;
  description: string;
  client: string;
  repo: string;
  status: "Active" | "In Development" | "Inactive";
  version: string;
  updatedAt: string;
  icon: any;
  iconBg: string;
}

export function ApplicationsPage() {
  const applicationsData: ApplicationItem[] = [
    {
      id: "#1024",
      name: "Ecom Pro",
      description: "E-commerce platform for retail clients",
      client: "BlueDart",
      repo: "github.com/org/ecom-pro",
      status: "Active",
      version: "v2.4.1",
      updatedAt: "12 Sep 2026 10:12 AM",
      icon: ShoppingCart,
      iconBg: "bg-blue-600"
    },
    {
      id: "#1023",
      name: "LogTrack",
      description: "Log management and analytics",
      client: "MedPlus",
      repo: "github.com/org/logtrack",
      status: "Active",
      version: "v1.8.0",
      updatedAt: "12 Sep 2026 09:50 AM",
      icon: BarChart3,
      iconBg: "bg-purple-600"
    },
    {
      id: "#1022",
      name: "RetailApp",
      description: "Retail store management",
      client: "RetailMax",
      repo: "github.com/org/retailapp",
      status: "Active",
      version: "v3.2.0",
      updatedAt: "12 Sep 2026 09:10 AM",
      icon: ShoppingBag,
      iconBg: "bg-amber-600"
    },
    {
      id: "#1021",
      name: "PharmaSuite",
      description: "Pharmacy operations suite",
      client: "MedPlus",
      repo: "github.com/org/pharmasuite",
      status: "Active",
      version: "v1.5.3",
      updatedAt: "11 Sep 2026 23:10 PM",
      icon: Pill,
      iconBg: "bg-teal-600"
    },
    {
      id: "#1020",
      name: "EduPortal",
      description: "Education management portal",
      client: "EduCare",
      repo: "github.com/org/eduportal",
      status: "Active",
      version: "v2.1.0",
      updatedAt: "11 Sep 2026 19:45 PM",
      icon: GraduationCap,
      iconBg: "bg-rose-600"
    },
    {
      id: "#1019",
      name: "FinServe",
      description: "Financial services platform",
      client: "FinServe",
      repo: "github.com/org/finserve",
      status: "In Development",
      version: "v0.9.0",
      updatedAt: "10 Sep 2026 14:20 PM",
      icon: Building2,
      iconBg: "bg-[#0284c7]"
    },
    {
      id: "#1018",
      name: "HRMS",
      description: "Human resource management",
      client: "Internal",
      repo: "github.com/org/hrms",
      status: "Inactive",
      version: "v1.2.0",
      updatedAt: "09 Sep 2026 16:10 PM",
      icon: Users,
      iconBg: "bg-rose-500"
    },
    {
      id: "#1017",
      name: "InventoryX",
      description: "Inventory and warehouse management",
      client: "LogiTrack",
      repo: "github.com/org/inventoryx",
      status: "Active",
      version: "v3.0.0",
      updatedAt: "09 Sep 2026 14:05 PM",
      icon: Package,
      iconBg: "bg-cyan-600"
    }
  ];

  const [searchQuery, setSearchQuery] = useState("");
  const [clientFilter, setClientFilter] = useState("All Clients");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");

  const filteredApps = applicationsData.filter(app => {
    const matchesSearch = app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          app.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          app.repo.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesClient = clientFilter === "All Clients" || app.client === clientFilter;
    const matchesStatus = statusFilter === "All Status" || app.status === statusFilter;
    return matchesSearch && matchesClient && matchesStatus;
  });

  return (
    <div className="space-y-5 pb-8 font-sans text-zinc-100 selection:bg-emerald-500 selection:text-black">
      
      {/* 1. HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div>
          <div className="flex items-center gap-2">
            <Box className="w-6 h-6 text-emerald-400" />
            <h2 className="text-xl font-bold text-white tracking-tight">Applications</h2>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Manage your software applications across all clients. Define repositories, pipelines, environments and configurations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs font-mono text-zinc-500">
            Home &gt; <span className="text-zinc-300">Applications</span>
          </div>
          <Button className="h-9 px-4 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-1.5">
            <Plus className="w-4 h-4" />
            New Application
          </Button>
        </div>
      </div>

      {/* 2. TOP METRICS CARDS ROW (4 Cards) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        
        {/* Total Applications */}
        <div className="p-3.5 rounded-2xl bg-[#090d0b] border border-zinc-800/80 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-600/20 text-blue-400 shrink-0">
            <Grid className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-zinc-400 font-medium">Total Applications</p>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl font-black text-white">8</span>
              <span className="text-[10px] text-emerald-400 font-semibold">↑ 2 this month</span>
            </div>
          </div>
        </div>

        {/* Active */}
        <div className="p-3.5 rounded-2xl bg-[#090d0b] border border-zinc-800/80 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0">
            <span className="w-3 h-3 rounded-full bg-emerald-400 inline-block" />
          </div>
          <div>
            <p className="text-[11px] text-zinc-400 font-medium">Active</p>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl font-black text-white">6</span>
              <span className="text-[10px] text-zinc-400">75% of total</span>
            </div>
          </div>
        </div>

        {/* In Development */}
        <div className="p-3.5 rounded-2xl bg-[#090d0b] border border-zinc-800/80 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 shrink-0">
            <span className="w-3 h-3 rounded-full bg-amber-400 inline-block" />
          </div>
          <div>
            <p className="text-[11px] text-zinc-400 font-medium">In Development</p>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl font-black text-white">1</span>
              <span className="text-[10px] text-zinc-400">12% of total</span>
            </div>
          </div>
        </div>

        {/* Inactive */}
        <div className="p-3.5 rounded-2xl bg-[#090d0b] border border-zinc-800/80 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-500/20 text-blue-400 shrink-0">
            <span className="w-3 h-3 rounded-full bg-blue-400 inline-block" />
          </div>
          <div>
            <p className="text-[11px] text-zinc-400 font-medium">Inactive</p>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl font-black text-white">1</span>
              <span className="text-[10px] text-zinc-400">12% of total</span>
            </div>
          </div>
        </div>

      </div>

      {/* 3. MAIN TABLE & CONTROLS */}
      <Card className="bg-[#090d0b] border-zinc-800/80 p-4 rounded-2xl flex flex-col justify-between space-y-4">
        
        <div>
          {/* SEARCH & FILTERS BAR */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            
            <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[280px]">
              
              <div className="relative flex-1 min-w-[180px]">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input 
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search applications..."
                  className="w-full h-8 pl-8 pr-3 bg-[#060908] border border-zinc-800/80 rounded-xl text-xs text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500/50"
                />
              </div>

              <select 
                value={clientFilter}
                onChange={(e) => setClientFilter(e.target.value)}
                className="h-8 px-2.5 bg-[#060908] border border-zinc-800/80 rounded-xl text-xs text-zinc-300 focus:outline-none cursor-pointer"
              >
                <option value="All Clients">All Clients</option>
                <option value="BlueDart">BlueDart</option>
                <option value="MedPlus">MedPlus</option>
                <option value="RetailMax">RetailMax</option>
                <option value="EduCare">EduCare</option>
                <option value="FinServe">FinServe</option>
              </select>

              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-8 px-2.5 bg-[#060908] border border-zinc-800/80 rounded-xl text-xs text-zinc-300 focus:outline-none cursor-pointer"
              >
                <option value="All Status">All Status</option>
                <option value="Active">Active</option>
                <option value="In Development">In Development</option>
                <option value="Inactive">Inactive</option>
              </select>

              <select 
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="h-8 px-2.5 bg-[#060908] border border-zinc-800/80 rounded-xl text-xs text-zinc-300 focus:outline-none cursor-pointer"
              >
                <option value="All Categories">All Categories</option>
                <option value="E-commerce">E-commerce</option>
                <option value="Analytics">Analytics</option>
                <option value="Operations">Operations</option>
              </select>

            </div>

            {/* VIEW MODE TOGGLE */}
            <div className="flex items-center gap-1 text-[11px]">
              <button className="px-2.5 py-1.5 rounded-lg text-zinc-400 hover:bg-zinc-800/60 flex items-center gap-1">
                <LayoutGrid className="w-3.5 h-3.5" /> Card View
              </button>
              <button className="px-2.5 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30 flex items-center gap-1">
                <TableIcon className="w-3.5 h-3.5" /> Table View
              </button>
            </div>

          </div>

          {/* APPLICATIONS TABLE */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs font-sans">
              <thead>
                <tr className="border-b border-zinc-800/80 text-zinc-500 font-medium">
                  <th className="pb-3 font-semibold">#</th>
                  <th className="pb-3 font-semibold">Application</th>
                  <th className="pb-3 font-semibold">Description</th>
                  <th className="pb-3 font-semibold">Client</th>
                  <th className="pb-3 font-semibold">Repository</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold">Version</th>
                  <th className="pb-3 font-semibold">Environments</th>
                  <th className="pb-3 font-semibold">Updated At</th>
                  <th className="pb-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/30">
                {filteredApps.map((app) => {
                  const Icon = app.icon;
                  return (
                    <tr key={app.id} className="hover:bg-zinc-900/40 transition-colors">
                      
                      <td className="py-3 text-zinc-500 font-mono">{app.id}</td>

                      <td className="py-3 font-semibold text-white">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-7 h-7 rounded-lg ${app.iconBg} text-white flex items-center justify-center shrink-0 shadow-md`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <span className="font-bold">{app.name}</span>
                        </div>
                      </td>

                      <td className="py-3 text-zinc-400 max-w-[220px] truncate">{app.description}</td>

                      <td className="py-3">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-blue-600/20 text-blue-300 border border-blue-500/30">
                          {app.client}
                        </span>
                      </td>

                      <td className="py-3">
                        <a 
                          href={`https://${app.repo}`}
                          target="_blank" 
                          rel="noreferrer"
                          className="flex items-center gap-1.5 text-blue-400 hover:underline font-mono text-[11px]"
                        >
                          <Github className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                          <span>{app.repo}</span>
                        </a>
                      </td>

                      <td className="py-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold flex items-center gap-1.5 w-fit ${
                          app.status === "Active"
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            : app.status === "In Development"
                            ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                            : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            app.status === "Active" ? "bg-emerald-400" : app.status === "In Development" ? "bg-amber-400" : "bg-rose-400"
                          }`} />
                          {app.status}
                        </span>
                      </td>

                      <td className="py-3 text-zinc-400 font-mono text-[11px]">{app.version}</td>

                      <td className="py-3">
                        <div className="flex items-center gap-1 font-mono text-[9px] font-bold">
                          <span className="px-1.5 py-0.5 rounded bg-blue-600/30 text-blue-300 border border-blue-500/30">DEV</span>
                          <span className="px-1.5 py-0.5 rounded bg-amber-600/30 text-amber-300 border border-amber-500/30">QA</span>
                          <span className="px-1.5 py-0.5 rounded bg-emerald-600/30 text-emerald-300 border border-emerald-500/30">PROD</span>
                        </div>
                      </td>

                      <td className="py-3 text-zinc-400 font-mono text-[11px]">{app.updatedAt}</td>

                      <td className="py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-800/60" title="Edit Application">
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button className="p-1 rounded text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/60">
                            <MoreHorizontal className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* TABLE PAGINATION FOOTER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-zinc-800/60 text-xs text-zinc-500 font-mono">
          <span>Showing 1 to {filteredApps.length} of 8 applications</span>
          <div className="flex items-center gap-2">
            <button className="p-1 rounded border border-zinc-800 bg-[#060908] hover:bg-zinc-800 text-zinc-400">
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button className="w-6 h-6 rounded bg-emerald-500 text-black font-bold text-xs flex items-center justify-center">1</button>
            <button className="p-1 rounded border border-zinc-800 bg-[#060908] hover:bg-zinc-800 text-zinc-400">
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            <div className="flex items-center gap-1 px-2 py-0.5 bg-[#060908] border border-zinc-800 rounded text-zinc-400 text-xs">
              <span>10 / page</span>
              <ChevronDown className="w-3 h-3" />
            </div>
          </div>
        </div>

      </Card>

    </div>
  );
}
