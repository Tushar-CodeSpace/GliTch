import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Rocket, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Search, 
  Plus, 
  MoreHorizontal, 
  ShoppingCart, 
  BarChart3, 
  ShoppingBag, 
  Pill, 
  GraduationCap, 
  Building2, 
  Users, 
  Package, 
  Heart, 
  Store, 
  RefreshCw, 
  RotateCcw, 
  ExternalLink, 
  Calendar, 
  ArrowRight,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronDown
} from "lucide-react";

interface DeploymentItem {
  id: string;
  name: string;
  description: string;
  client: string;
  site: string;
  env: string;
  version: string;
  status: "Success" | "Failed" | "In Progress";
  startedAt: string;
  completedAt: string;
  duration: string;
  triggeredBy: string;
  icon: any;
  iconBg: string;
}

export function DeploymentsPage() {
  const deploymentsData: DeploymentItem[] = [
    {
      id: "#1026",
      name: "Ecom Pro",
      description: "E-commerce platform for retail clients",
      client: "BlueDart",
      site: "BLR-DC01",
      env: "Production",
      version: "v2.4.1",
      status: "Success",
      startedAt: "12 Sep 2026, 10:24 AM",
      completedAt: "12 Sep 2026, 10:28 AM",
      duration: "4m 32s",
      triggeredBy: "Nido (Manual)",
      icon: ShoppingCart,
      iconBg: "bg-blue-600"
    },
    {
      id: "#1025",
      name: "LogTrack",
      description: "Log management and analytics",
      client: "MedPlus",
      site: "HYD-01",
      env: "Production",
      version: "v1.8.0",
      status: "In Progress",
      startedAt: "12 Sep 2026, 10:12 AM",
      completedAt: "In Progress",
      duration: "2m 45s",
      triggeredBy: "Auto CI Push",
      icon: BarChart3,
      iconBg: "bg-purple-600"
    },
    {
      id: "#1024",
      name: "RetailApp",
      description: "Retail store management",
      client: "RetailMax",
      site: "MUM-02",
      env: "Staging",
      version: "v3.2.0",
      status: "Success",
      startedAt: "11 Sep 2026, 08:45 PM",
      completedAt: "11 Sep 2026, 08:50 PM",
      duration: "5m 18s",
      triggeredBy: "Nido (Manual)",
      icon: ShoppingBag,
      iconBg: "bg-amber-600"
    },
    {
      id: "#1023",
      name: "PharmaSuite",
      description: "Pharmacy operations suite",
      client: "MedPlus",
      site: "DEL-01",
      env: "Production",
      version: "v1.5.3",
      status: "Failed",
      startedAt: "11 Sep 2026, 04:32 PM",
      completedAt: "11 Sep 2026, 04:36 PM",
      duration: "3m 40s",
      triggeredBy: "Release Bot",
      icon: Pill,
      iconBg: "bg-teal-600"
    },
    {
      id: "#1022",
      name: "EduPortal",
      description: "Education management portal",
      client: "EduCare",
      site: "BLR-01",
      env: "Production",
      version: "v2.1.0",
      status: "Success",
      startedAt: "11 Sep 2026, 11:03 AM",
      completedAt: "11 Sep 2026, 11:08 AM",
      duration: "4m 50s",
      triggeredBy: "Nido (Manual)",
      icon: GraduationCap,
      iconBg: "bg-rose-600"
    },
    {
      id: "#1021",
      name: "FinServe",
      description: "Financial services platform",
      client: "FinServe",
      site: "PUNE-01",
      env: "Staging",
      version: "v0.9.0",
      status: "Success",
      startedAt: "10 Sep 2026, 08:20 PM",
      completedAt: "10 Sep 2026, 08:25 PM",
      duration: "4m 55s",
      triggeredBy: "Auto CI Push",
      icon: Building2,
      iconBg: "bg-[#0284c7]"
    },
    {
      id: "#1020",
      name: "HRMS",
      description: "Human resource management",
      client: "Internal",
      site: "CHN-01",
      env: "Production",
      version: "v1.2.0",
      status: "Success",
      startedAt: "10 Sep 2026, 04:18 PM",
      completedAt: "10 Sep 2026, 04:22 PM",
      duration: "3m 50s",
      triggeredBy: "Release Bot",
      icon: Users,
      iconBg: "bg-rose-500"
    },
    {
      id: "#1019",
      name: "InventoryX",
      description: "Inventory and warehouse management",
      client: "LogiTrack",
      site: "DEL-02",
      env: "Production",
      version: "v3.0.0",
      status: "Success",
      startedAt: "09 Sep 2026, 09:55 PM",
      completedAt: "09 Sep 2026, 10:01 PM",
      duration: "6m 12s",
      triggeredBy: "Nido (Manual)",
      icon: Package,
      iconBg: "bg-cyan-600"
    },
    {
      id: "#1018",
      name: "QuickMart",
      description: "Hyperlocal grocery engine",
      client: "RetailMax",
      site: "BLR-03",
      env: "Staging",
      version: "v1.1.4",
      status: "In Progress",
      startedAt: "09 Sep 2026, 02:14 PM",
      completedAt: "In Progress",
      duration: "2m 10s",
      triggeredBy: "Auto CI Push",
      icon: Store,
      iconBg: "bg-amber-500"
    },
    {
      id: "#1017",
      name: "HealthPoint",
      description: "Telemedicine patient portal",
      client: "MedPlus",
      site: "HYD-02",
      env: "Production",
      version: "v2.0.1",
      status: "Success",
      startedAt: "08 Sep 2026, 07:32 PM",
      completedAt: "08 Sep 2026, 07:37 PM",
      duration: "4m 15s",
      triggeredBy: "Nido (Manual)",
      icon: Heart,
      iconBg: "bg-rose-600"
    }
  ];

  const [selectedDeployment, setSelectedDeployment] = useState<DeploymentItem>(deploymentsData[0]);
  const [searchQuery, setSearchQuery] = useState("");
  const [appFilter, setAppFilter] = useState("All Applications");
  const [clientFilter, setClientFilter] = useState("All Clients");
  const [siteFilter, setSiteFilter] = useState("All Sites");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [selectedTab, setSelectedTab] = useState<"logs" | "artifacts" | "config" | "approvals" | "notes">("logs");

  const filteredDeployments = deploymentsData.filter(dep => {
    const matchesSearch = dep.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          dep.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          dep.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          dep.site.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          dep.version.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesApp = appFilter === "All Applications" || dep.name === appFilter;
    const matchesClient = clientFilter === "All Clients" || dep.client === clientFilter;
    const matchesStatus = statusFilter === "All Status" || dep.status === statusFilter;
    return matchesSearch && matchesApp && matchesClient && matchesStatus;
  });

  const SelectedIcon = selectedDeployment.icon;

  return (
    <div className="space-y-5 pb-8 font-sans text-zinc-100 selection:bg-emerald-500 selection:text-black">
      
      {/* 1. HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div>
          <div className="flex items-center gap-2">
            <Rocket className="w-6 h-6 text-emerald-400" />
            <h2 className="text-xl font-bold text-white tracking-tight">Deployments</h2>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Deploy application builds to client sites. Track deployment status across all environments.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs font-mono text-zinc-500">
            Home &gt; <span className="text-zinc-300">Deployments</span>
          </div>
          <Button className="h-9 px-4 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-1.5">
            <Plus className="w-4 h-4" />
            New Deployment
          </Button>
        </div>
      </div>

      {/* 2. TOP METRICS CARDS ROW (4 Cards) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        
        {/* Total Deployments */}
        <div className="p-3.5 rounded-2xl bg-[#090d0b] border border-zinc-800/80 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-600/20 text-emerald-400 shrink-0">
            <Rocket className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-zinc-400 font-medium">Total Deployments</p>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl font-black text-white">126</span>
              <span className="text-[10px] text-emerald-400 font-semibold">↑ 18% this month</span>
            </div>
          </div>
        </div>

        {/* Successful */}
        <div className="p-3.5 rounded-2xl bg-[#090d0b] border border-zinc-800/80 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-zinc-400 font-medium">Successful</p>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl font-black text-white">112</span>
              <span className="text-[10px] text-zinc-400">89% success rate</span>
            </div>
          </div>
        </div>

        {/* Failed */}
        <div className="p-3.5 rounded-2xl bg-[#090d0b] border border-zinc-800/80 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-rose-600/20 text-rose-400 shrink-0">
            <XCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-zinc-400 font-medium">Failed</p>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl font-black text-white">8</span>
              <span className="text-[10px] text-zinc-400">6% failure rate</span>
            </div>
          </div>
        </div>

        {/* In Progress */}
        <div className="p-3.5 rounded-2xl bg-[#090d0b] border border-zinc-800/80 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-500/20 text-blue-400 shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-zinc-400 font-medium">In Progress</p>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl font-black text-white">6</span>
              <span className="text-[10px] text-zinc-400">5% running</span>
            </div>
          </div>
        </div>

      </div>

      {/* 3. MAIN SPLIT VIEW (DEPLOYMENTS TABLE + DEPLOYMENT DETAILS PANEL) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        
        {/* LEFT COLUMN: DEPLOYMENTS TABLE (7 Columns Wide on XL) */}
        <Card className="xl:col-span-7 bg-[#090d0b] border-zinc-800/80 p-4 rounded-2xl flex flex-col justify-between space-y-4">
          
          <div>
            {/* SEARCH & FILTERS BAR */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              
              <div className="relative flex-1 min-w-[160px]">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input 
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search deployments..."
                  className="w-full h-8 pl-8 pr-3 bg-[#060908] border border-zinc-800/80 rounded-xl text-xs text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500/50"
                />
              </div>

              <select 
                value={appFilter}
                onChange={(e) => setAppFilter(e.target.value)}
                className="h-8 px-2.5 bg-[#060908] border border-zinc-800/80 rounded-xl text-xs text-zinc-300 focus:outline-none cursor-pointer"
              >
                <option value="All Applications">All Applications</option>
                <option value="Ecom Pro">Ecom Pro</option>
                <option value="LogTrack">LogTrack</option>
                <option value="RetailApp">RetailApp</option>
                <option value="PharmaSuite">PharmaSuite</option>
              </select>

              <select 
                value={clientFilter}
                onChange={(e) => setClientFilter(e.target.value)}
                className="h-8 px-2.5 bg-[#060908] border border-zinc-800/80 rounded-xl text-xs text-zinc-300 focus:outline-none cursor-pointer"
              >
                <option value="All Clients">All Clients</option>
                <option value="BlueDart">BlueDart</option>
                <option value="MedPlus">MedPlus</option>
                <option value="RetailMax">RetailMax</option>
              </select>

              <select 
                value={siteFilter}
                onChange={(e) => setSiteFilter(e.target.value)}
                className="h-8 px-2.5 bg-[#060908] border border-zinc-800/80 rounded-xl text-xs text-zinc-300 focus:outline-none cursor-pointer"
              >
                <option value="All Sites">All Sites</option>
                <option value="BLR-DC01">BLR-DC01</option>
                <option value="HYD-01">HYD-01</option>
                <option value="MUM-02">MUM-02</option>
              </select>

              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-8 px-2.5 bg-[#060908] border border-zinc-800/80 rounded-xl text-xs text-zinc-300 focus:outline-none cursor-pointer"
              >
                <option value="All Status">All Status</option>
                <option value="Success">Success</option>
                <option value="In Progress">In Progress</option>
                <option value="Failed">Failed</option>
              </select>

              <div className="h-8 px-2.5 bg-[#060908] border border-zinc-800/80 rounded-xl text-xs text-zinc-300 flex items-center gap-1.5 cursor-pointer">
                <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                <span>Last 30 days</span>
              </div>

            </div>

            {/* DEPLOYMENTS TABLE */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs font-sans">
                <thead>
                  <tr className="border-b border-zinc-800/80 text-zinc-500 font-medium">
                    <th className="pb-2.5 font-semibold">#</th>
                    <th className="pb-2.5 font-semibold">Application</th>
                    <th className="pb-2.5 font-semibold">Client</th>
                    <th className="pb-2.5 font-semibold">Site / Environment</th>
                    <th className="pb-2.5 font-semibold">Version</th>
                    <th className="pb-2.5 font-semibold">Status</th>
                    <th className="pb-2.5 font-semibold">Started At</th>
                    <th className="pb-2.5 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/30">
                  {filteredDeployments.map((dep) => {
                    const isSelected = selectedDeployment.id === dep.id;
                    const AppIcon = dep.icon;

                    return (
                      <tr 
                        key={dep.id}
                        onClick={() => setSelectedDeployment(dep)}
                        className={`cursor-pointer transition-colors ${
                          isSelected ? "bg-[#0d1c16] border-l-2 border-emerald-400" : "hover:bg-zinc-900/40"
                        }`}
                      >
                        <td className="py-2.5 text-zinc-500 font-mono">{dep.id}</td>

                        <td className="py-2.5 font-semibold text-white">
                          <div className="flex items-center gap-2">
                            <div className={`w-5 h-5 rounded ${dep.iconBg} text-white flex items-center justify-center shrink-0`}>
                              <AppIcon className="w-3 h-3" />
                            </div>
                            <span>{dep.name}</span>
                          </div>
                        </td>

                        <td className="py-2.5 text-zinc-300">{dep.client}</td>

                        <td className="py-2.5 text-zinc-400 font-mono text-[11px]">
                          {dep.site} <span className="text-zinc-500">({dep.env})</span>
                        </td>

                        <td className="py-2.5 text-zinc-400 font-mono text-[11px]">{dep.version}</td>

                        <td className="py-2.5">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold flex items-center gap-1 w-fit ${
                            dep.status === "Success"
                              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                              : dep.status === "In Progress"
                              ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                              : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              dep.status === "Success" ? "bg-emerald-400" : dep.status === "In Progress" ? "bg-blue-400 animate-pulse" : "bg-rose-500"
                            }`} />
                            {dep.status}
                          </span>
                        </td>

                        <td className="py-2.5 text-zinc-500 font-mono text-[11px]">{dep.startedAt}</td>

                        <td className="py-2.5 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1">
                            <button 
                              onClick={() => setSelectedDeployment(dep)}
                              className="px-2.5 py-1 rounded-lg border border-blue-500/30 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 text-[11px] font-medium transition-colors"
                            >
                              View
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
            <span>Showing 1 to {filteredDeployments.length} of 126 deployments</span>
            <div className="flex items-center gap-1.5">
              <button className="p-1 rounded border border-zinc-800 bg-[#060908] hover:bg-zinc-800 text-zinc-400">
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button className="w-6 h-6 rounded bg-emerald-500 text-black font-bold text-xs flex items-center justify-center">1</button>
              <button className="w-6 h-6 rounded bg-[#060908] border border-zinc-800 text-zinc-400 hover:bg-zinc-800 text-xs flex items-center justify-center">2</button>
              <button className="w-6 h-6 rounded bg-[#060908] border border-zinc-800 text-zinc-400 hover:bg-zinc-800 text-xs flex items-center justify-center">3</button>
              <button className="w-6 h-6 rounded bg-[#060908] border border-zinc-800 text-zinc-400 hover:bg-zinc-800 text-xs flex items-center justify-center">4</button>
              <button className="w-6 h-6 rounded bg-[#060908] border border-zinc-800 text-zinc-400 hover:bg-zinc-800 text-xs flex items-center justify-center">5</button>
              <span>...</span>
              <button className="w-6 h-6 rounded bg-[#060908] border border-zinc-800 text-zinc-400 hover:bg-zinc-800 text-xs flex items-center justify-center">13</button>
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

        {/* RIGHT COLUMN: DEPLOYMENT DETAILS PANEL (5 Columns Wide on XL) */}
        <Card className="xl:col-span-5 bg-[#090d0b] border-zinc-800/80 p-4 rounded-2xl flex flex-col justify-between space-y-4 font-sans">
          
          <div className="space-y-4">
            
            {/* PANEL HEADER */}
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">Deployment {selectedDeployment.id}</h3>
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                  selectedDeployment.status === "Success" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                }`}>
                  &bull; {selectedDeployment.status}
                </span>
              </div>
              <button className="p-1 rounded text-zinc-500 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* APPLICATION BANNER */}
            <div className="p-3.5 rounded-2xl bg-[#060a08] border border-zinc-800/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl ${selectedDeployment.iconBg} text-white flex items-center justify-center shrink-0 shadow-md`}>
                  <SelectedIcon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">{selectedDeployment.name}</h4>
                  <p className="text-[11px] text-zinc-400">{selectedDeployment.description}</p>
                </div>
              </div>

              <button className="px-2.5 py-1 rounded-xl border border-blue-500/30 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 text-xs font-medium">
                View Build
              </button>
            </div>

            {/* METADATA GRID */}
            <div className="grid grid-cols-2 gap-y-2 gap-x-4 p-3 rounded-2xl bg-[#060908] border border-zinc-800/60 text-xs font-sans">
              <div>
                <span className="text-zinc-500 block text-[11px]">Client</span>
                <span className="font-semibold text-zinc-200">{selectedDeployment.client}</span>
              </div>

              <div>
                <span className="text-zinc-500 block text-[11px]">Site</span>
                <span className="font-mono text-zinc-200">{selectedDeployment.site}</span>
              </div>

              <div>
                <span className="text-zinc-500 block text-[11px]">Environment</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 w-fit inline-block">
                  {selectedDeployment.env}
                </span>
              </div>

              <div>
                <span className="text-zinc-500 block text-[11px]">Version</span>
                <span className="font-mono text-zinc-300">{selectedDeployment.version}</span>
              </div>

              <div>
                <span className="text-zinc-500 block text-[11px]">Started At</span>
                <span className="font-mono text-zinc-400 text-[11px]">{selectedDeployment.startedAt}</span>
              </div>

              <div>
                <span className="text-zinc-500 block text-[11px]">Completed At</span>
                <span className="font-mono text-zinc-400 text-[11px]">{selectedDeployment.completedAt}</span>
              </div>

              <div>
                <span className="text-zinc-500 block text-[11px]">Duration</span>
                <span className="font-mono text-zinc-300">{selectedDeployment.duration}</span>
              </div>

              <div>
                <span className="text-zinc-500 block text-[11px]">Triggered By</span>
                <span className="text-zinc-300">{selectedDeployment.triggeredBy}</span>
              </div>
            </div>

            {/* DEPLOYMENT PROGRESS STEPPER */}
            <div className="space-y-2">
              <h5 className="font-bold text-white text-xs">Deployment Progress</h5>

              <div className="p-3 rounded-2xl bg-[#060908] border border-zinc-800/60 overflow-x-auto">
                <div className="flex items-center justify-between min-w-[380px] text-[10px] text-center">
                  
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-zinc-300 font-semibold">Prepare</span>
                    <span className="text-zinc-500 font-mono">12s</span>
                  </div>

                  <ArrowRight className="w-3 h-3 text-zinc-600 shrink-0" />

                  <div className="flex flex-col items-center gap-1">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-zinc-300 font-semibold">Transfer Files</span>
                    <span className="text-zinc-500 font-mono">48s</span>
                  </div>

                  <ArrowRight className="w-3 h-3 text-zinc-600 shrink-0" />

                  <div className="flex flex-col items-center gap-1">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-zinc-300 font-semibold">Stop Services</span>
                    <span className="text-zinc-500 font-mono">22s</span>
                  </div>

                  <ArrowRight className="w-3 h-3 text-zinc-600 shrink-0" />

                  <div className="flex flex-col items-center gap-1">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-zinc-300 font-semibold">Deploy</span>
                    <span className="text-zinc-500 font-mono">1m 45s</span>
                  </div>

                  <ArrowRight className="w-3 h-3 text-zinc-600 shrink-0" />

                  <div className="flex flex-col items-center gap-1">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-zinc-300 font-semibold">Start Services</span>
                    <span className="text-zinc-500 font-mono">35s</span>
                  </div>

                  <ArrowRight className="w-3 h-3 text-zinc-600 shrink-0" />

                  <div className="flex flex-col items-center gap-1">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-zinc-300 font-semibold">Health Check</span>
                    <span className="text-zinc-500 font-mono">30s</span>
                  </div>

                </div>
              </div>
            </div>

            {/* DETAIL TABS & LOGS */}
            <div className="space-y-2">
              <div className="flex items-center gap-4 border-b border-zinc-800/80 text-xs font-medium pb-1">
                <button 
                  onClick={() => setSelectedTab("logs")}
                  className={`pb-1 border-b-2 transition-colors ${
                    selectedTab === "logs" ? "border-emerald-400 text-emerald-400 font-bold" : "border-transparent text-zinc-400 hover:text-white"
                  }`}
                >
                  Logs
                </button>
                <button 
                  onClick={() => setSelectedTab("artifacts")}
                  className={`pb-1 border-b-2 transition-colors ${
                    selectedTab === "artifacts" ? "border-emerald-400 text-emerald-400 font-bold" : "border-transparent text-zinc-400 hover:text-white"
                  }`}
                >
                  Artifacts
                </button>
                <button 
                  onClick={() => setSelectedTab("config")}
                  className={`pb-1 border-b-2 transition-colors ${
                    selectedTab === "config" ? "border-emerald-400 text-emerald-400 font-bold" : "border-transparent text-zinc-400 hover:text-white"
                  }`}
                >
                  Configuration
                </button>
                <button 
                  onClick={() => setSelectedTab("approvals")}
                  className={`pb-1 border-b-2 transition-colors ${
                    selectedTab === "approvals" ? "border-emerald-400 text-emerald-400 font-bold" : "border-transparent text-zinc-400 hover:text-white"
                  }`}
                >
                  Approvals
                </button>
                <button 
                  onClick={() => setSelectedTab("notes")}
                  className={`pb-1 border-b-2 transition-colors ${
                    selectedTab === "notes" ? "border-emerald-400 text-emerald-400 font-bold" : "border-transparent text-zinc-400 hover:text-white"
                  }`}
                >
                  Notes
                </button>
              </div>

              {/* TERMINAL LOGS BOX */}
              <div className="p-3 rounded-2xl bg-[#050807] border border-zinc-800/80 font-mono text-[11px] text-zinc-400 space-y-1 overflow-x-auto leading-relaxed max-h-[180px] overflow-y-auto">
                <div><span className="text-zinc-600">[10:24:12]</span> Connecting to site BLR-DC01...</div>
                <div><span className="text-zinc-600">[10:24:15]</span> Authenticated successfully</div>
                <div><span className="text-zinc-600">[10:24:18]</span> Downloading build artifacts v2.4.1...</div>
                <div><span className="text-zinc-600">[10:25:02]</span> Extracting files...</div>
                <div><span className="text-zinc-600">[10:25:24]</span> Stopping existing services...</div>
                <div><span className="text-zinc-600">[10:25:46]</span> Deploying new version...</div>
                <div><span className="text-zinc-600">[10:27:02]</span> Starting services...</div>
                <div><span className="text-zinc-600">[10:27:28]</span> Running health checks...</div>
                <div><span className="text-zinc-600">[10:27:58]</span> <span className="text-emerald-400">Health check passed ✓</span></div>
                <div><span className="text-zinc-600">[10:28:00]</span> <span className="text-emerald-400 font-bold">Deployment completed successfully!</span></div>
              </div>
            </div>

            {/* BOTTOM ACTION BUTTONS ROW */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-zinc-800/80 text-xs">
              <Button variant="outline" className="h-9 border-zinc-800 bg-[#060908] hover:bg-zinc-800 text-zinc-300 font-medium text-xs rounded-xl flex items-center justify-center gap-1.5">
                <RefreshCw className="w-3.5 h-3.5" /> Redeploy
              </Button>

              <Button variant="outline" className="h-9 border-zinc-800 bg-[#060908] hover:bg-zinc-800 text-zinc-300 font-medium text-xs rounded-xl flex items-center justify-center gap-1.5">
                <RotateCcw className="w-3.5 h-3.5" /> Rollback
              </Button>

              <Button className="h-9 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-md">
                <ExternalLink className="w-3.5 h-3.5 text-black" /> View Site
              </Button>
            </div>

          </div>

        </Card>

      </div>

    </div>
  );
}
