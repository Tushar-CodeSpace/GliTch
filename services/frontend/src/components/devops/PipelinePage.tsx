import React, { useState } from "react";
import {
  GitBranch,
  Plus,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Play,
  ShoppingCart,
  BarChart3,
  ShoppingBag,
  Pill,
  GraduationCap,
  Building2,
  Users,
  Box,
  Store,
  Heart,
  X,
  Copy,
  ExternalLink,
  RotateCw,
  Sliders
} from "lucide-react";

export interface PipelineItem {
  id: string;
  name: string;
  app: string;
  appIcon: any;
  appColor: string;
  trigger: string;
  branch: string;
  lastRun: string;
  status: "Success" | "Failed" | "In Progress";
  duration: string;
  createdBy: string;
  commit: string;
  stages: { name: string; duration: string; status: "success" | "failed" | "running" }[];
  recentRuns: { date: string; status: "Success" | "Failed"; duration: string }[];
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
  userEmail = "Nido",
  onTriggerDeploy
}: PipelinePageProps = {}) {
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [appFilter, setAppFilter] = useState("All Applications");
  const [envFilter, setEnvFilter] = useState("All Environments");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [timeFilter, setTimeFilter] = useState("Last 30 days");
  const [currentPage, setCurrentPage] = useState(1);

  // Mock List of 10 Pipelines matching Screenshot 3
  const [pipelines, setPipelines] = useState<PipelineItem[]>([
    {
      id: "#001",
      name: "Ecom Pro CI/CD",
      app: "Ecom Pro",
      appIcon: ShoppingCart,
      appColor: "bg-blue-600/20 text-blue-400 border-blue-500/30",
      trigger: "Push",
      branch: "main",
      lastRun: "12 Sep 2026 10:24 AM",
      status: "Success",
      duration: "4m 32s",
      createdBy: "johndoe",
      commit: "a1b2c3d",
      stages: [
        { name: "Checkout", duration: "12s", status: "success" },
        { name: "Install", duration: "48s", status: "success" },
        { name: "Build", duration: "1m 12s", status: "success" },
        { name: "Test", duration: "1m 05s", status: "success" },
        { name: "Deploy", duration: "45s", status: "success" }
      ],
      recentRuns: [
        { date: "12 Sep 2026, 10:24 AM", status: "Success", duration: "4m 32s" },
        { date: "11 Sep 2026, 09:11 PM", status: "Failed", duration: "6m 12s" },
        { date: "10 Sep 2026, 08:45 AM", status: "Success", duration: "4m 10s" },
        { date: "09 Sep 2026, 02:18 PM", status: "Success", duration: "4m 55s" },
        { date: "08 Sep 2026, 11:03 AM", status: "Failed", duration: "5m 21s" }
      ]
    },
    {
      id: "#002",
      name: "LogTrack Pipeline",
      app: "LogTrack",
      appIcon: BarChart3,
      appColor: "bg-purple-600/20 text-purple-400 border-purple-500/30",
      trigger: "Pull Request",
      branch: "develop",
      lastRun: "12 Sep 2026 09:12 AM",
      status: "Failed",
      duration: "6m 12s",
      createdBy: "sarah.k",
      commit: "f4e5d6c",
      stages: [
        { name: "Checkout", duration: "10s", status: "success" },
        { name: "Install", duration: "40s", status: "success" },
        { name: "Build", duration: "2m 10s", status: "failed" }
      ],
      recentRuns: [
        { date: "12 Sep 2026, 09:12 AM", status: "Failed", duration: "6m 12s" },
        { date: "11 Sep 2026, 04:00 PM", status: "Success", duration: "4m 00s" }
      ]
    },
    {
      id: "#003",
      name: "RetailApp Release",
      app: "RetailApp",
      appIcon: ShoppingBag,
      appColor: "bg-amber-500/20 text-amber-400 border-amber-500/30",
      trigger: "Schedule",
      branch: "release/*",
      lastRun: "11 Sep 2026 11:03 PM",
      status: "Success",
      duration: "5m 14s",
      createdBy: "priya.s",
      commit: "b9c8d7e",
      stages: [
        { name: "Checkout", duration: "15s", status: "success" },
        { name: "Install", duration: "50s", status: "success" },
        { name: "Build", duration: "1m 30s", status: "success" },
        { name: "Test", duration: "1m 40s", status: "success" },
        { name: "Deploy", duration: "59s", status: "success" }
      ],
      recentRuns: [
        { date: "11 Sep 2026, 11:03 PM", status: "Success", duration: "5m 14s" }
      ]
    },
    {
      id: "#004",
      name: "PharmaSuite CI",
      app: "PharmaSuite",
      appIcon: Pill,
      appColor: "bg-teal-500/20 text-teal-400 border-teal-500/30",
      trigger: "Push",
      branch: "main",
      lastRun: "11 Sep 2026 06:45 PM",
      status: "In Progress",
      duration: "2m 10s",
      createdBy: "kavya.r",
      commit: "c3d4e5f",
      stages: [
        { name: "Checkout", duration: "10s", status: "success" },
        { name: "Install", duration: "45s", status: "success" },
        { name: "Build", duration: "1m 15s", status: "running" }
      ],
      recentRuns: []
    },
    {
      id: "#005",
      name: "EduPortal Deploy",
      app: "EduPortal",
      appIcon: GraduationCap,
      appColor: "bg-rose-500/20 text-rose-400 border-rose-500/30",
      trigger: "Manual",
      branch: "main",
      lastRun: "11 Sep 2026 02:18 PM",
      status: "Success",
      duration: "4m 50s",
      createdBy: "nisha.k",
      commit: "d5e6f7g",
      stages: [
        { name: "Checkout", duration: "12s", status: "success" },
        { name: "Deploy", duration: "4m 38s", status: "success" }
      ],
      recentRuns: []
    },
    {
      id: "#006",
      name: "FinServe Build",
      app: "FinServe",
      appIcon: Building2,
      appColor: "bg-sky-500/20 text-sky-400 border-sky-500/30",
      trigger: "Push",
      branch: "develop",
      lastRun: "10 Sep 2026 09:44 AM",
      status: "Success",
      duration: "3m 40s",
      createdBy: "mike.t",
      commit: "e6f7g8h",
      stages: [],
      recentRuns: []
    },
    {
      id: "#007",
      name: "HRMS Pipeline",
      app: "HRMS",
      appIcon: Users,
      appColor: "bg-pink-500/20 text-pink-400 border-pink-500/30",
      trigger: "Schedule",
      branch: "main",
      lastRun: "10 Sep 2026 04:32 PM",
      status: "Failed",
      duration: "5m 02s",
      createdBy: "arun.p",
      commit: "f7g8h9i",
      stages: [],
      recentRuns: []
    },
    {
      id: "#008",
      name: "InventoryX CI/CD",
      app: "InventoryX",
      appIcon: Box,
      appColor: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
      trigger: "Push",
      branch: "main",
      lastRun: "09 Sep 2026 11:20 AM",
      status: "Success",
      duration: "4m 15s",
      createdBy: "kavya.r",
      commit: "g8h9i0j",
      stages: [],
      recentRuns: []
    },
    {
      id: "#009",
      name: "QuickMart Deploy",
      app: "QuickMart",
      appIcon: Store,
      appColor: "bg-orange-500/20 text-orange-400 border-orange-500/30",
      trigger: "Manual",
      branch: "release/*",
      lastRun: "09 Sep 2026 09:55 AM",
      status: "Success",
      duration: "4m 20s",
      createdBy: "vijay.m",
      commit: "h9i0j1k",
      stages: [],
      recentRuns: []
    },
    {
      id: "#010",
      name: "HealthPoint CI",
      app: "HealthPoint",
      appIcon: Heart,
      appColor: "bg-red-500/20 text-red-400 border-red-500/30",
      trigger: "Push",
      branch: "develop",
      lastRun: "08 Sep 2026 01:15 PM",
      status: "In Progress",
      duration: "1m 45s",
      createdBy: "ravi.d",
      commit: "i0j1k2l",
      stages: [],
      recentRuns: []
    }
  ]);

  // Selected Pipeline: default #001
  const [selectedId, setSelectedId] = useState<string>("#001");
  const selectedPipe = pipelines.find((p) => p.id === selectedId) || pipelines[0];

  // Filtering
  const filteredPipelines = pipelines.filter((pipe) => {
    const matchesSearch =
      pipe.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pipe.app.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pipe.branch.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesApp = appFilter === "All Applications" || pipe.app === appFilter;
    const matchesStatus = statusFilter === "All Status" || pipe.status === statusFilter;

    return matchesSearch && matchesApp && matchesStatus;
  });

  return (
    <div className="space-y-5 animate-in fade-in duration-300 font-sans">
      
      {/* 1. TOP HEADER BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <GitBranch className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                Pipelines
              </h1>
              <p className="text-xs text-zinc-400 mt-0.5">
                Automate your build, test and deployment workflows across all environments.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1.5">
          <div className="text-[11px] font-mono text-zinc-500">
            Home <span className="mx-1 text-zinc-700">&gt;</span> <span className="text-zinc-300">Pipelines</span>
          </div>
          <button className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs px-4 py-2 rounded-lg transition-all flex items-center gap-2 shadow-lg shadow-emerald-950/40">
            <Plus className="w-4 h-4 stroke-[2.5]" />
            New Pipeline
          </button>
        </div>
      </div>

      {/* 2. TOP METRICS CARDS (4 CARDS) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Total Pipelines */}
        <div className="bg-[#090d0b] border border-zinc-800/80 rounded-2xl p-4 flex items-center justify-between hover:border-zinc-700/80 transition-all">
          <div className="space-y-1">
            <p className="text-xs text-zinc-400 font-medium">Total Pipelines</p>
            <p className="text-2xl font-bold text-white">28</p>
            <p className="text-[11px] font-medium text-emerald-400 flex items-center gap-1">
              ↑ 12% this month
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <GitBranch className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Successful Runs */}
        <div className="bg-[#090d0b] border border-zinc-800/80 rounded-2xl p-4 flex items-center justify-between hover:border-zinc-700/80 transition-all">
          <div className="space-y-1">
            <p className="text-xs text-zinc-400 font-medium">Successful Runs</p>
            <p className="text-2xl font-bold text-white">246</p>
            <p className="text-[11px] font-medium text-zinc-400">
              88% success rate
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: Failed Runs */}
        <div className="bg-[#090d0b] border border-zinc-800/80 rounded-2xl p-4 flex items-center justify-between hover:border-zinc-700/80 transition-all">
          <div className="space-y-1">
            <p className="text-xs text-zinc-400 font-medium">Failed Runs</p>
            <p className="text-2xl font-bold text-white">24</p>
            <p className="text-[11px] font-medium text-zinc-400">
              9% failure rate
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 shrink-0">
            <XCircle className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4: Running */}
        <div className="bg-[#090d0b] border border-zinc-800/80 rounded-2xl p-4 flex items-center justify-between hover:border-zinc-700/80 transition-all">
          <div className="space-y-1">
            <p className="text-xs text-zinc-400 font-medium">Running</p>
            <p className="text-2xl font-bold text-white">6</p>
            <p className="text-[11px] font-medium text-zinc-400">
              3% in progress
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 shrink-0">
            <Clock className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* 3. SPLIT VIEW LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* LEFT COLUMN: PIPELINES TABLE & BOTTOM CHARTS (8 COLS) */}
        <div className="lg:col-span-8 space-y-5">
          
          {/* Table Container */}
          <div className="bg-[#090d0b] border border-zinc-800/80 rounded-2xl overflow-hidden p-4 space-y-4">
            
            {/* Header & Filter Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Search pipelines..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#050807] border border-zinc-800/80 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-700"
                />
              </div>

              <div className="flex items-center gap-2 flex-wrap text-xs">
                <select
                  value={appFilter}
                  onChange={(e) => setAppFilter(e.target.value)}
                  className="bg-[#050807] border border-zinc-800 rounded-lg px-2.5 py-1.5 text-zinc-300 text-xs focus:outline-none"
                >
                  <option>All Applications</option>
                  <option>Ecom Pro</option>
                  <option>LogTrack</option>
                  <option>RetailApp</option>
                  <option>PharmaSuite</option>
                </select>

                <select
                  value={envFilter}
                  onChange={(e) => setEnvFilter(e.target.value)}
                  className="bg-[#050807] border border-zinc-800 rounded-lg px-2.5 py-1.5 text-zinc-300 text-xs focus:outline-none"
                >
                  <option>All Environments</option>
                  <option>Production</option>
                  <option>Staging</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-[#050807] border border-zinc-800 rounded-lg px-2.5 py-1.5 text-zinc-300 text-xs focus:outline-none"
                >
                  <option>All Status</option>
                  <option>Success</option>
                  <option>Failed</option>
                  <option>In Progress</option>
                </select>

                <select
                  value={timeFilter}
                  onChange={(e) => setTimeFilter(e.target.value)}
                  className="bg-[#050807] border border-zinc-800 rounded-lg px-2.5 py-1.5 text-zinc-300 text-xs focus:outline-none"
                >
                  <option>Last 30 days</option>
                  <option>Last 7 days</option>
                  <option>Today</option>
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-zinc-300 border-collapse">
                <thead>
                  <tr className="border-b border-zinc-800/80 text-zinc-500 font-medium">
                    <th className="py-2.5 px-3">#</th>
                    <th className="py-2.5 px-3">Pipeline Name</th>
                    <th className="py-2.5 px-3">Application</th>
                    <th className="py-2.5 px-3">Trigger</th>
                    <th className="py-2.5 px-3">Branches</th>
                    <th className="py-2.5 px-3">Last Run</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/40">
                  {filteredPipelines.map((pipe) => {
                    const AppIcon = pipe.appIcon;
                    const isSelected = selectedId === pipe.id;

                    return (
                      <tr
                        key={pipe.id}
                        onClick={() => setSelectedId(pipe.id)}
                        className={`cursor-pointer transition-colors ${
                          isSelected ? "bg-emerald-950/20 border-l-2 border-emerald-400" : "hover:bg-zinc-900/40"
                        }`}
                      >
                        <td className="py-3 px-3 font-mono font-medium text-zinc-400">{pipe.id}</td>

                        {/* Pipeline Name */}
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            <div className={`p-1.5 rounded-lg border ${pipe.appColor} shrink-0`}>
                              <AppIcon className="w-3.5 h-3.5" />
                            </div>
                            <span className="font-semibold text-white">{pipe.name}</span>
                          </div>
                        </td>

                        {/* Application */}
                        <td className="py-3 px-3 text-zinc-300">{pipe.app}</td>

                        {/* Trigger */}
                        <td className="py-3 px-3 text-zinc-400">{pipe.trigger}</td>

                        {/* Branches */}
                        <td className="py-3 px-3 font-mono text-zinc-300 text-[11px]">{pipe.branch}</td>

                        {/* Last Run */}
                        <td className="py-3 px-3 font-mono text-zinc-400 text-[11px]">{pipe.lastRun}</td>

                        {/* Status */}
                        <td className="py-3 px-3">
                          {pipe.status === "Success" && (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                              Success
                            </span>
                          )}
                          {pipe.status === "Failed" && (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                              Failed
                            </span>
                          )}
                          {pipe.status === "In Progress" && (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping" />
                              In Progress
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedId(pipe.id);
                              }}
                              className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 transition-all flex items-center gap-1"
                            >
                              <Play className="w-3 h-3 fill-current" />
                              Run
                            </button>
                            <button
                              onClick={(e) => e.stopPropagation()}
                              className="p-1 rounded-md text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50"
                            >
                              <MoreHorizontal className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 text-xs text-zinc-500">
              <span>Showing 1 to 10 of 28 pipelines</span>

              <div className="flex items-center gap-1 font-mono">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="p-1 rounded bg-zinc-900 border border-zinc-800 hover:text-white disabled:opacity-40"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>

                {[1, 2, 3].map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-6 h-6 rounded text-[11px] font-medium transition-all ${
                      currentPage === page
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                        : "hover:bg-zinc-800 text-zinc-400"
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  onClick={() => setCurrentPage((p) => p + 1)}
                  className="p-1 rounded bg-zinc-900 border border-zinc-800 hover:text-white"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <select
                aria-label="Items per page"
                className="bg-[#050807] border border-zinc-800 rounded px-2 py-1 text-zinc-400 text-xs focus:outline-none"
              >
                <option>10 / page</option>
                <option>25 / page</option>
              </select>
            </div>

          </div>

          {/* Bottom Cards Row (3 Cards: Donut, Multi-Line Trend, Duration Chart) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Card 1: Pipeline Success Rate Donut */}
            <div className="bg-[#090d0b] border border-zinc-800/80 rounded-2xl p-4 space-y-3">
              <h3 className="text-xs font-semibold text-white">Pipeline Success Rate</h3>

              <div className="flex items-center justify-between gap-3">
                <div className="relative w-20 h-20 shrink-0 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#1f2937"
                      strokeWidth="3.8"
                    />
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="3.8"
                      strokeDasharray="88, 100"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-sm font-extrabold text-white leading-none">88%</span>
                  </div>
                </div>

                <div className="flex-1 space-y-1.5 text-[11px]">
                  <div className="flex items-center justify-between text-zinc-300">
                    <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" /> Successful
                    </span>
                    <span className="font-semibold text-white">246</span>
                  </div>

                  <div className="flex items-center justify-between text-zinc-300">
                    <span className="flex items-center gap-1.5 text-rose-400 font-medium">
                      <span className="w-2 h-2 rounded-full bg-rose-400" /> Failed
                    </span>
                    <span className="font-semibold text-white">24</span>
                  </div>

                  <div className="flex items-center justify-between text-zinc-300">
                    <span className="flex items-center gap-1.5 text-sky-400 font-medium">
                      <span className="w-2 h-2 rounded-full bg-sky-400" /> Running
                    </span>
                    <span className="font-semibold text-white">6</span>
                  </div>

                  <p className="text-[9px] text-zinc-500 pt-1">Based on last 30 days</p>
                </div>
              </div>
            </div>

            {/* Card 2: Pipeline Runs Trend */}
            <div className="bg-[#090d0b] border border-zinc-800/80 rounded-2xl p-4 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <h3 className="font-semibold text-white">Pipeline Runs Trend</h3>
                <div className="flex items-center gap-2 text-[10px]">
                  <span className="text-emerald-400">— Success</span>
                  <span className="text-rose-400">— Failed</span>
                  <span className="text-sky-400">— Running</span>
                </div>
              </div>

              {/* Multi-line chart */}
              <div className="h-16 w-full pt-1">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 250 40">
                  <path d="M 0 15 Q 40 5, 80 25 T 160 10 T 250 20" fill="none" stroke="#10b981" strokeWidth="1.5" />
                  <path d="M 0 32 Q 40 30, 80 35 T 160 28 T 250 33" fill="none" stroke="#f43f5e" strokeWidth="1.5" />
                  <path d="M 0 38 Q 40 37, 80 36 T 160 38 T 250 37" fill="none" stroke="#38bdf8" strokeWidth="1.5" />
                </svg>
              </div>

              <div className="flex items-center justify-between text-[9px] font-mono text-zinc-600">
                <span>Sep 1</span>
                <span>Sep 5</span>
                <span>Sep 9</span>
                <span>Sep 13</span>
                <span>Sep 17</span>
                <span>Sep 21</span>
                <span>Sep 25</span>
                <span>Sep 30</span>
              </div>
            </div>

            {/* Card 3: Average Pipeline Duration */}
            <div className="bg-[#090d0b] border border-zinc-800/80 rounded-2xl p-4 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <h3 className="font-semibold text-white">Average Pipeline Duration</h3>
                <span className="text-[11px] font-mono text-purple-400 font-medium">Avg. 4m 18s</span>
              </div>

              <div className="h-16 w-full pt-1">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 250 40">
                  <path d="M 0 25 Q 40 10, 80 30 T 160 15 T 250 22" fill="none" stroke="#a855f7" strokeWidth="1.5" />
                </svg>
              </div>

              <div className="flex items-center justify-between text-[9px] font-mono text-zinc-600">
                <span>Sep 1</span>
                <span>Sep 5</span>
                <span>Sep 9</span>
                <span>Sep 13</span>
                <span>Sep 17</span>
                <span>Sep 21</span>
                <span>Sep 25</span>
                <span>Sep 30</span>
              </div>
            </div>

          </div>

        </div>

        {/* RIGHT COLUMN: PIPELINE DETAILS PANEL (4 COLS) */}
        <div className="lg:col-span-4 space-y-4">
          
          <div className="bg-[#090d0b] border border-zinc-800/80 rounded-2xl p-4 space-y-4">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">{selectedPipe.name}</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                  ● {selectedPipe.status}
                </span>
              </div>

              <button className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800/60">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* App Hero Box */}
            <div className="p-3 rounded-xl bg-[#050807] border border-zinc-800/60 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className={`p-2 rounded-xl border ${selectedPipe.appColor} shrink-0`}>
                  <selectedPipe.appIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">{selectedPipe.app}</h3>
                  <p className="text-[11px] text-zinc-400">Build • Test • Deploy to Production</p>
                </div>
              </div>

              <button className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-all">
                Run Pipeline
              </button>
            </div>

            {/* Panel Sub-Tabs */}
            <div className="flex items-center gap-4 border-b border-zinc-800/70 text-xs font-medium text-zinc-400">
              {["overview", "stages", "jobs", "logs", "settings"].map((t) => (
                <button
                  key={t}
                  onClick={() => setActiveTab(t)}
                  className={`pb-2 capitalize transition-all relative ${
                    activeTab === t ? "text-white font-semibold" : "hover:text-zinc-200"
                  }`}
                >
                  {t}
                  {activeTab === t && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400 rounded-full" />
                  )}
                </button>
              ))}
            </div>

            {/* Specs Grid */}
            <div className="grid grid-cols-2 gap-y-2.5 gap-x-4 p-3 rounded-xl bg-[#050807] border border-zinc-800/60 text-xs">
              <div>
                <span className="block text-[10px] text-zinc-500">Pipeline ID</span>
                <span className="text-zinc-300 font-mono">{selectedPipe.id}</span>
              </div>

              <div>
                <span className="block text-[10px] text-zinc-500">Last Run</span>
                <span className="text-zinc-300 font-mono text-[11px]">{selectedPipe.lastRun}</span>
              </div>

              <div>
                <span className="block text-[10px] text-zinc-500">Application</span>
                <span className="text-zinc-200 font-semibold">{selectedPipe.app}</span>
              </div>

              <div>
                <span className="block text-[10px] text-zinc-500">Duration</span>
                <span className="text-zinc-300 font-mono">{selectedPipe.duration}</span>
              </div>

              <div>
                <span className="block text-[10px] text-zinc-500">Trigger</span>
                <span className="text-zinc-300">{selectedPipe.trigger} ({selectedPipe.branch})</span>
              </div>

              <div>
                <span className="block text-[10px] text-zinc-500">Status</span>
                <span className="text-emerald-400 font-medium">● {selectedPipe.status}</span>
              </div>

              <div>
                <span className="block text-[10px] text-zinc-500">Created By</span>
                <span className="text-zinc-300 font-mono">{selectedPipe.createdBy}</span>
              </div>

              <div>
                <span className="block text-[10px] text-zinc-500">Branch / Commit</span>
                <span className="text-zinc-300 font-mono text-[11px] flex items-center gap-1">
                  {selectedPipe.branch} <span className="text-zinc-500">({selectedPipe.commit})</span>
                </span>
              </div>
            </div>

            {/* Pipeline Stages Stepper */}
            {selectedPipe.stages.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold text-white text-xs">Pipeline Stages</h4>

                <div className="p-3 rounded-xl bg-[#050807] border border-zinc-800/60">
                  <div className="flex items-center justify-between relative">
                    {selectedPipe.stages.map((st, idx) => (
                      <div key={idx} className="flex flex-col items-center z-10 text-center">
                        <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-black font-bold text-xs">
                          ✓
                        </div>
                        <span className="text-[11px] font-semibold text-white mt-1">{st.name}</span>
                        <span className="text-[9px] font-mono text-zinc-500">{st.duration}</span>
                      </div>
                    ))}
                    {/* Stepper connecting line */}
                    <div className="absolute top-3 left-4 right-4 h-0.5 bg-emerald-500 z-0" />
                  </div>
                </div>
              </div>
            )}

            {/* Recent Runs List */}
            {selectedPipe.recentRuns.length > 0 && (
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-white">Recent Runs</h4>
                  <button className="text-blue-400 hover:text-blue-300 text-[11px] font-medium">View All</button>
                </div>

                <div className="space-y-1.5 font-mono text-[11px]">
                  {selectedPipe.recentRuns.map((run, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-[#050807] border border-zinc-800/60">
                      <div className="flex items-center gap-2">
                        {run.status === "Success" ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <XCircle className="w-4 h-4 text-rose-400" />
                        )}
                        <span className="text-zinc-300">{run.date}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={run.status === "Success" ? "text-emerald-400" : "text-rose-400"}>{run.status}</span>
                        <span className="text-zinc-500">{run.duration}</span>
                        <MoreHorizontal className="w-3.5 h-3.5 text-zinc-500" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  );
}
