import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Layers, 
  Box, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Search, 
  Plus, 
  Eye, 
  MoreHorizontal, 
  Github, 
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
  Download, 
  FileText, 
  FileCode, 
  FileArchive, 
  Calendar, 
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ChevronDown
} from "lucide-react";

interface BuildItem {
  id: string;
  name: string;
  client: string;
  version: string;
  trigger: string;
  status: "Success" | "Failed" | "In Progress";
  duration: string;
  startedAt: string;
  commit: string;
  branch: string;
  icon: any;
  iconBg: string;
}

export function BuildsPage() {
  const buildsData: BuildItem[] = [
    {
      id: "#1024",
      name: "Ecom Pro",
      client: "BlueDart",
      version: "v2.4.1",
      trigger: "CI (main)",
      status: "Success",
      duration: "4m 32s",
      startedAt: "12 Sep 2026 10:02 AM",
      commit: "a1b2c3d",
      branch: "main",
      icon: ShoppingCart,
      iconBg: "bg-blue-600"
    },
    {
      id: "#1023",
      name: "LogTrack",
      client: "MedPlus",
      version: "v1.8.0",
      trigger: "Manual",
      status: "Failed",
      duration: "3m 12s",
      startedAt: "12 Sep 2026 09:41 AM",
      commit: "f4e5d6c",
      branch: "main",
      icon: BarChart3,
      iconBg: "bg-purple-600"
    },
    {
      id: "#1022",
      name: "RetailApp",
      client: "RetailMax",
      version: "v3.2.0",
      trigger: "CI (develop)",
      status: "Success",
      duration: "5m 18s",
      startedAt: "11 Sep 2026 06:20 PM",
      commit: "8x9y0z1",
      branch: "develop",
      icon: ShoppingBag,
      iconBg: "bg-amber-600"
    },
    {
      id: "#1021",
      name: "PharmaSuite",
      client: "MedPlus",
      version: "v1.5.3",
      trigger: "Manual",
      status: "Success",
      duration: "6m 02s",
      startedAt: "11 Sep 2026 02:14 PM",
      commit: "2p3q4r5",
      branch: "main",
      icon: Pill,
      iconBg: "bg-teal-600"
    },
    {
      id: "#1020",
      name: "EduPortal",
      client: "EduCare",
      version: "v2.1.0",
      trigger: "CI (main)",
      status: "In Progress",
      duration: "2m 10s",
      startedAt: "11 Sep 2026 11:03 AM",
      commit: "5e6f7a8",
      branch: "main",
      icon: GraduationCap,
      iconBg: "bg-rose-600"
    },
    {
      id: "#1019",
      name: "FinServe",
      client: "FinServe",
      version: "v0.9.0",
      trigger: "CI (feature/ui)",
      status: "Success",
      duration: "4m 55s",
      startedAt: "10 Sep 2026 08:32 PM",
      commit: "9a8b7c6",
      branch: "feature/ui",
      icon: Building2,
      iconBg: "bg-[#0284c7]"
    },
    {
      id: "#1018",
      name: "HRMS",
      client: "Internal",
      version: "v1.2.0",
      trigger: "Manual",
      status: "Failed",
      duration: "3m 44s",
      startedAt: "10 Sep 2026 04:18 PM",
      commit: "7u8v9w0",
      branch: "main",
      icon: Users,
      iconBg: "bg-rose-500"
    },
    {
      id: "#1017",
      name: "InventoryX",
      client: "LogiTrack",
      version: "v3.0.0",
      trigger: "CI (main)",
      status: "Success",
      duration: "6m 20s",
      startedAt: "09 Sep 2026 10:25 AM",
      commit: "3c2d1e0",
      branch: "main",
      icon: Package,
      iconBg: "bg-cyan-600"
    },
    {
      id: "#1016",
      name: "QuickMart",
      client: "RetailMax",
      version: "v1.1.4",
      trigger: "CI (main)",
      status: "Success",
      duration: "5m 11s",
      startedAt: "09 Sep 2026 09:44 AM",
      commit: "4k5l6m7",
      branch: "main",
      icon: Store,
      iconBg: "bg-amber-500"
    },
    {
      id: "#1015",
      name: "HealthPoint",
      client: "MedPlus",
      version: "v2.0.1",
      trigger: "Manual",
      status: "Success",
      duration: "4m 08s",
      startedAt: "08 Sep 2026 05:12 PM",
      commit: "1a2b3c4",
      branch: "main",
      icon: Heart,
      iconBg: "bg-rose-600"
    }
  ];

  const [selectedBuild, setSelectedBuild] = useState<BuildItem>(buildsData[0]);
  const [searchQuery, setSearchQuery] = useState("");
  const [appFilter, setAppFilter] = useState("All Applications");
  const [clientFilter, setClientFilter] = useState("All Clients");
  const [statusFilter, setStatusFilter] = useState("All Status");

  const filteredBuilds = buildsData.filter(build => {
    const matchesSearch = build.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          build.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          build.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          build.version.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesApp = appFilter === "All Applications" || build.name === appFilter;
    const matchesClient = clientFilter === "All Clients" || build.client === clientFilter;
    const matchesStatus = statusFilter === "All Status" || build.status === statusFilter;
    return matchesSearch && matchesApp && matchesClient && matchesStatus;
  });

  const SelectedIcon = selectedBuild.icon;

  return (
    <div className="space-y-5 pb-8 font-sans text-zinc-100 selection:bg-emerald-500 selection:text-black">
      
      {/* 1. HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-6 h-6 text-emerald-400" />
            <h2 className="text-xl font-bold text-white tracking-tight">Builds</h2>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Manage build artifacts for all applications. View build history, logs and promote builds to deployment.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs font-mono text-zinc-500">
            Home &gt; <span className="text-zinc-300">Builds</span>
          </div>
          <Button className="h-9 px-4 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-1.5">
            <Plus className="w-4 h-4" />
            Trigger Build
          </Button>
        </div>
      </div>

      {/* 2. TOP METRICS CARDS ROW (4 Cards) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        
        {/* Total Builds */}
        <div className="p-3.5 rounded-2xl bg-[#090d0b] border border-zinc-800/80 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-600/20 text-blue-400 shrink-0">
            <Box className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-zinc-400 font-medium">Total Builds</p>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl font-black text-white">248</span>
              <span className="text-[10px] text-emerald-400 font-semibold">↑ 12% this month</span>
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
              <span className="text-xl font-black text-white">206</span>
              <span className="text-[10px] text-zinc-400">83% success rate</span>
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
              <span className="text-xl font-black text-white">28</span>
              <span className="text-[10px] text-zinc-400">11% failure rate</span>
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
              <span className="text-xl font-black text-white">14</span>
              <span className="text-[10px] text-zinc-400">6% running</span>
            </div>
          </div>
        </div>

      </div>

      {/* 3. MAIN SPLIT VIEW (BUILD HISTORY TABLE + BUILD DETAILS PANEL) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        
        {/* LEFT COLUMN: BUILD HISTORY TABLE (7 Columns Wide on XL) */}
        <Card className="xl:col-span-7 bg-[#090d0b] border-zinc-800/80 p-4 rounded-2xl flex flex-col justify-between space-y-4">
          
          <div>
            <h3 className="text-sm font-bold text-white mb-3">Build History</h3>

            {/* SEARCH & FILTERS BAR */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              
              <div className="relative flex-1 min-w-[160px]">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input 
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search builds..."
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
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-8 px-2.5 bg-[#060908] border border-zinc-800/80 rounded-xl text-xs text-zinc-300 focus:outline-none cursor-pointer"
              >
                <option value="All Status">All Status</option>
                <option value="Success">Success</option>
                <option value="Failed">Failed</option>
                <option value="In Progress">In Progress</option>
              </select>

              <div className="h-8 px-2.5 bg-[#060908] border border-zinc-800/80 rounded-xl text-xs text-zinc-300 flex items-center gap-1.5 cursor-pointer">
                <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                <span>Last 30 days</span>
              </div>

            </div>

            {/* BUILDS TABLE */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs font-sans">
                <thead>
                  <tr className="border-b border-zinc-800/80 text-zinc-500 font-medium">
                    <th className="pb-2.5 font-semibold">#</th>
                    <th className="pb-2.5 font-semibold">Application</th>
                    <th className="pb-2.5 font-semibold">Client</th>
                    <th className="pb-2.5 font-semibold">Version</th>
                    <th className="pb-2.5 font-semibold">Trigger</th>
                    <th className="pb-2.5 font-semibold">Status</th>
                    <th className="pb-2.5 font-semibold">Duration</th>
                    <th className="pb-2.5 font-semibold">Started At</th>
                    <th className="pb-2.5 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/30">
                  {filteredBuilds.map((build) => {
                    const isSelected = selectedBuild.id === build.id;
                    const AppIcon = build.icon;

                    return (
                      <tr 
                        key={build.id}
                        onClick={() => setSelectedBuild(build)}
                        className={`cursor-pointer transition-colors ${
                          isSelected ? "bg-[#0d1c16] border-l-2 border-emerald-400" : "hover:bg-zinc-900/40"
                        }`}
                      >
                        <td className="py-2.5 text-zinc-500 font-mono">{build.id}</td>

                        <td className="py-2.5 font-semibold text-white">
                          <div className="flex items-center gap-2">
                            <div className={`w-5 h-5 rounded ${build.iconBg} text-white flex items-center justify-center shrink-0`}>
                              <AppIcon className="w-3 h-3" />
                            </div>
                            <span>{build.name}</span>
                          </div>
                        </td>

                        <td className="py-2.5 text-zinc-300">{build.client}</td>

                        <td className="py-2.5 text-zinc-400 font-mono text-[11px]">{build.version}</td>

                        <td className="py-2.5 text-zinc-400 font-mono text-[11px]">{build.trigger}</td>

                        <td className="py-2.5">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold flex items-center gap-1 w-fit ${
                            build.status === "Success"
                              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                              : build.status === "In Progress"
                              ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                              : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              build.status === "Success" ? "bg-emerald-400" : build.status === "In Progress" ? "bg-blue-400 animate-pulse" : "bg-rose-500"
                            }`} />
                            {build.status}
                          </span>
                        </td>

                        <td className="py-2.5 text-zinc-400 font-mono text-[11px]">{build.duration}</td>

                        <td className="py-2.5 text-zinc-500 font-mono text-[11px]">{build.startedAt}</td>

                        <td className="py-2.5 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1">
                            <button 
                              onClick={() => setSelectedBuild(build)}
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
            <span>Showing 1 to {filteredBuilds.length} of 248 builds</span>
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
              <button className="w-6 h-6 rounded bg-[#060908] border border-zinc-800 text-zinc-400 hover:bg-zinc-800 text-xs flex items-center justify-center">25</button>
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

        {/* RIGHT COLUMN: BUILD DETAILS PANEL (5 Columns Wide on XL) */}
        <Card className="xl:col-span-5 bg-[#090d0b] border-zinc-800/80 p-4 rounded-2xl flex flex-col justify-between space-y-4 font-sans">
          
          <div className="space-y-4">
            
            {/* BUILD PANEL HEADER */}
            <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">Build {selectedBuild.id}</h3>
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                  selectedBuild.status === "Success" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                }`}>
                  &bull; {selectedBuild.status}
                </span>
              </div>
              <a 
                href="https://github.com/org/ecom-pro" 
                target="_blank" 
                rel="noreferrer"
                className="px-2.5 py-1 rounded-xl border border-zinc-800/80 bg-[#060908] text-zinc-300 hover:text-white text-xs flex items-center gap-1.5"
              >
                <Github className="w-3.5 h-3.5" /> View in GitHub
              </a>
            </div>

            {/* APP SUMMARY CARD */}
            <div className="p-3.5 rounded-2xl bg-[#060a08] border border-zinc-800/80 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl ${selectedBuild.iconBg} text-white flex items-center justify-center shrink-0 shadow-md`}>
                  <SelectedIcon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">{selectedBuild.name}</h4>
                  <p className="text-[11px] text-zinc-400">Client: {selectedBuild.client}</p>
                  <p className="text-[11px] text-zinc-400">Version: <span className="font-mono text-zinc-200">{selectedBuild.version}</span></p>
                  <p className="text-[11px] text-zinc-400">Triggered by: <span className="font-mono text-zinc-200">{selectedBuild.trigger}</span></p>
                </div>
              </div>

              <div className="text-right text-[11px] space-y-0.5 font-mono">
                <div><span className="text-zinc-500">Started At:</span> <span className="text-zinc-300">{selectedBuild.startedAt}</span></div>
                <div><span className="text-zinc-500">Duration:</span> <span className="text-zinc-300">{selectedBuild.duration}</span></div>
                <div><span className="text-zinc-500">Commit:</span> <span className="text-blue-400">{selectedBuild.commit}</span></div>
                <div><span className="text-zinc-500">Branch:</span> <span className="text-zinc-300">{selectedBuild.branch}</span></div>
              </div>
            </div>

            {/* BUILD PIPELINE STEPPER */}
            <div className="space-y-2">
              <h5 className="font-bold text-white text-xs">Build Pipeline</h5>
              
              <div className="p-3 rounded-2xl bg-[#060908] border border-zinc-800/60 overflow-x-auto">
                <div className="flex items-center justify-between min-w-[360px] text-[10px] text-center">
                  
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-zinc-300 font-semibold">Checkout</span>
                    <span className="text-zinc-500 font-mono">12s</span>
                  </div>

                  <ArrowRight className="w-3 h-3 text-zinc-600 shrink-0" />

                  <div className="flex flex-col items-center gap-1">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-zinc-300 font-semibold">Install</span>
                    <span className="text-zinc-500 font-mono">48s</span>
                  </div>

                  <ArrowRight className="w-3 h-3 text-zinc-600 shrink-0" />

                  <div className="flex flex-col items-center gap-1">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-zinc-300 font-semibold">Build</span>
                    <span className="text-zinc-500 font-mono">1m 20s</span>
                  </div>

                  <ArrowRight className="w-3 h-3 text-zinc-600 shrink-0" />

                  <div className="flex flex-col items-center gap-1">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-zinc-300 font-semibold">Test</span>
                    <span className="text-zinc-500 font-mono">1m 05s</span>
                  </div>

                  <ArrowRight className="w-3 h-3 text-zinc-600 shrink-0" />

                  <div className="flex flex-col items-center gap-1">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-zinc-300 font-semibold">Package</span>
                    <span className="text-zinc-500 font-mono">42s</span>
                  </div>

                  <ArrowRight className="w-3 h-3 text-zinc-600 shrink-0" />

                  <div className="flex flex-col items-center gap-1">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-zinc-300 font-semibold">Publish</span>
                    <span className="text-zinc-500 font-mono">25s</span>
                  </div>

                </div>
              </div>
            </div>

            {/* BUILD ARTIFACTS CARD */}
            <div className="space-y-2">
              <h5 className="font-bold text-white text-xs">Build Artifacts</h5>
              
              <div className="space-y-1.5 text-xs">
                
                <div className="p-2.5 rounded-xl bg-[#060908] border border-zinc-800/60 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileArchive className="w-4 h-4 text-blue-400 shrink-0" />
                    <span className="font-mono text-zinc-200 text-xs">ecom-pro-v2.4.1.zip</span>
                    <span className="text-[10px] text-zinc-500 font-mono">1.2 GB</span>
                  </div>
                  <button className="px-2.5 py-1 rounded-lg border border-blue-500/30 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 text-[11px] font-medium flex items-center gap-1">
                    <Download className="w-3 h-3" /> Download
                  </button>
                </div>

                <div className="p-2.5 rounded-xl bg-[#060908] border border-zinc-800/60 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="font-mono text-zinc-200 text-xs">checksums.txt</span>
                    <span className="text-[10px] text-zinc-500 font-mono">4 KB</span>
                  </div>
                  <button className="px-2.5 py-1 rounded-lg border border-blue-500/30 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 text-[11px] font-medium flex items-center gap-1">
                    <Download className="w-3 h-3" /> Download
                  </button>
                </div>

                <div className="p-2.5 rounded-xl bg-[#060908] border border-zinc-800/60 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileCode className="w-4 h-4 text-purple-400 shrink-0" />
                    <span className="font-mono text-zinc-200 text-xs">build-metadata.json</span>
                    <span className="text-[10px] text-zinc-500 font-mono">12 KB</span>
                  </div>
                  <button className="px-2.5 py-1 rounded-lg border border-blue-500/30 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 text-[11px] font-medium flex items-center gap-1">
                    <Download className="w-3 h-3" /> Download
                  </button>
                </div>

              </div>
            </div>

            {/* LOGS SECTION */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h5 className="font-bold text-white text-xs">Logs</h5>
                <button className="text-xs text-blue-400 hover:underline">View Full Logs &rarr;</button>
              </div>

              <div className="p-3 rounded-2xl bg-[#050807] border border-zinc-800/80 font-mono text-[11px] text-zinc-400 space-y-1 overflow-x-auto leading-relaxed">
                <div><span className="text-zinc-600">[10:02:11]</span> Starting build process...</div>
                <div><span className="text-zinc-600">[10:02:13]</span> Checking out code (main)...</div>
                <div><span className="text-zinc-600">[10:02:25]</span> Installing dependencies...</div>
                <div><span className="text-zinc-600">[10:03:13]</span> Running unit tests...</div>
                <div><span className="text-zinc-600">[10:04:18]</span> <span className="text-emerald-400">Tests passed ✓ (124/124)</span></div>
                <div><span className="text-zinc-600">[10:04:35]</span> Building application...</div>
                <div><span className="text-zinc-600">[10:06:12]</span> Build completed successfully!</div>
                <div><span className="text-zinc-600">[10:06:15]</span> Publishing artifacts...</div>
                <div><span className="text-zinc-600">[10:06:43]</span> Build finished in 4m 32s</div>
              </div>
            </div>

          </div>

        </Card>

      </div>

    </div>
  );
}
