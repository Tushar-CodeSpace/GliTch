import React, { useState } from "react";
import {
  FlaskConical,
  Plus,
  CheckCircle2,
  XCircle,
  Clock,
  FileCheck,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  RotateCw,
  ShoppingBag,
  ShoppingCart,
  BarChart3,
  Pill,
  GraduationCap,
  Building2,
  Users,
  Box,
  Store,
  Heart,
  MoreHorizontal,
  ChevronDown,
  ExternalLink,
  AlertTriangle,
  Play
} from "lucide-react";

export interface TestRunItem {
  id: string;
  app: string;
  appIcon: any;
  appColor: string;
  client: string;
  buildVersion: string;
  testSuite: string;
  status: "Passed" | "Failed" | "In Progress";
  startedAt: string;
  completedAt?: string;
  duration: string;
  triggeredBy: string;
  totalTests: number;
  passCount: number;
  failCount: number;
  skipCount: number;
  passRate: number;
  passTrend: string;
  failedTestCases: { code: string; title: string; duration: string }[];
}

export function QATestsPage() {
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [panelTab, setPanelTab] = useState<string>("summary");
  const [searchQuery, setSearchQuery] = useState("");
  const [appFilter, setAppFilter] = useState("All Applications");
  const [clientFilter, setClientFilter] = useState("All Clients");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [timeFilter, setTimeFilter] = useState("Last 30 days");
  const [currentPage, setCurrentPage] = useState(1);

  // Mock List of 10 Test Runs matching the image
  const [testRuns, setTestRuns] = useState<TestRunItem[]>([
    {
      id: "#324",
      app: "Ecom Pro",
      appIcon: ShoppingCart,
      appColor: "bg-blue-600/20 text-blue-400 border-blue-500/30",
      client: "BlueDart",
      buildVersion: "v2.4.1 (1245)",
      testSuite: "Regression",
      status: "Passed",
      startedAt: "12 Sep 2026 10:15 AM",
      completedAt: "12 Sep 2026 10:33 AM",
      duration: "18m 24s",
      triggeredBy: "CI/CD Pipeline (main)",
      totalTests: 120,
      passCount: 118,
      failCount: 0,
      skipCount: 2,
      passRate: 98,
      passTrend: "↑ 4% from last run",
      failedTestCases: []
    },
    {
      id: "#323",
      app: "LogTrack",
      appIcon: BarChart3,
      appColor: "bg-purple-600/20 text-purple-400 border-purple-500/30",
      client: "MedPlus",
      buildVersion: "v1.8.0 (1023)",
      testSuite: "API Tests",
      status: "Passed",
      startedAt: "12 Sep 2026 09:40 AM",
      completedAt: "12 Sep 2026 09:52 AM",
      duration: "12m 06s",
      triggeredBy: "Schedule (Daily)",
      totalTests: 85,
      passCount: 85,
      failCount: 0,
      skipCount: 0,
      passRate: 100,
      passTrend: "↑ 0% from last run",
      failedTestCases: []
    },
    {
      id: "#322",
      app: "RetailApp",
      appIcon: ShoppingBag,
      appColor: "bg-amber-500/20 text-amber-400 border-amber-500/30",
      client: "RetailMax",
      buildVersion: "v3.2.0 (1022)",
      testSuite: "E2E Tests",
      status: "Failed",
      startedAt: "11 Sep 2026, 06:22 PM",
      completedAt: "11 Sep 2026, 06:47 PM",
      duration: "25m 14s",
      triggeredBy: "Pipeline (main)",
      totalTests: 72,
      passCount: 54,
      failCount: 14,
      skipCount: 4,
      passRate: 75,
      passTrend: "↓ 12% from last run",
      failedTestCases: [
        { code: "TC-1024", title: "Login with invalid credentials", duration: "12.4s" },
        { code: "TC-1031", title: "Add item to cart", duration: "8.7s" },
        { code: "TC-1042", title: "Checkout with COD", duration: "15.2s" },
        { code: "TC-1050", title: "Apply discount coupon", duration: "10.1s" },
        { code: "TC-1061", title: "Generate invoice", duration: "9.3s" }
      ]
    },
    {
      id: "#321",
      app: "PharmaSuite",
      appIcon: Pill,
      appColor: "bg-teal-500/20 text-teal-400 border-teal-500/30",
      client: "MedPlus",
      buildVersion: "v1.5.3 (1021)",
      testSuite: "Smoke Tests",
      status: "Passed",
      startedAt: "11 Sep 2026 02:18 PM",
      completedAt: "11 Sep 2026 02:24 PM",
      duration: "6m 38s",
      triggeredBy: "Git Commit (feature/rx)",
      totalTests: 40,
      passCount: 40,
      failCount: 0,
      skipCount: 0,
      passRate: 100,
      passTrend: "↑ 2% from last run",
      failedTestCases: []
    },
    {
      id: "#320",
      app: "EduPortal",
      appIcon: GraduationCap,
      appColor: "bg-rose-500/20 text-rose-400 border-rose-500/30",
      client: "EduCare",
      buildVersion: "v2.1.0 (1020)",
      testSuite: "Regression",
      status: "Passed",
      startedAt: "11 Sep 2026 11:05 AM",
      completedAt: "11 Sep 2026 11:25 AM",
      duration: "20m 11s",
      triggeredBy: "Schedule (Nightly)",
      totalTests: 150,
      passCount: 148,
      failCount: 0,
      skipCount: 2,
      passRate: 99,
      passTrend: "↑ 1% from last run",
      failedTestCases: []
    },
    {
      id: "#319",
      app: "FinServe",
      appIcon: Building2,
      appColor: "bg-sky-500/20 text-sky-400 border-sky-500/30",
      client: "FinServe",
      buildVersion: "v0.9.0 (1019)",
      testSuite: "API Tests",
      status: "In Progress",
      startedAt: "11 Sep 2026 10:02 AM",
      duration: "14m 33s",
      triggeredBy: "Manual Trigger",
      totalTests: 95,
      passCount: 60,
      failCount: 0,
      skipCount: 0,
      passRate: 88,
      passTrend: "Running...",
      failedTestCases: []
    },
    {
      id: "#318",
      app: "HRMS",
      appIcon: Users,
      appColor: "bg-pink-500/20 text-pink-400 border-pink-500/30",
      client: "Internal",
      buildVersion: "v1.2.0 (1018)",
      testSuite: "E2E Tests",
      status: "Passed",
      startedAt: "10 Sep 2026 04:50 PM",
      completedAt: "10 Sep 2026 05:06 PM",
      duration: "16m 27s",
      triggeredBy: "Pipeline (main)",
      totalTests: 65,
      passCount: 64,
      failCount: 0,
      skipCount: 1,
      passRate: 98,
      passTrend: "↑ 5% from last run",
      failedTestCases: []
    },
    {
      id: "#317",
      app: "InventoryX",
      appIcon: Box,
      appColor: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
      client: "LogiTrack",
      buildVersion: "v3.0.0 (1017)",
      testSuite: "Smoke Tests",
      status: "Failed",
      startedAt: "10 Sep 2026 03:12 PM",
      completedAt: "10 Sep 2026 03:34 PM",
      duration: "22m 18s",
      triggeredBy: "Git Commit (bugfix/stock)",
      totalTests: 50,
      passCount: 35,
      failCount: 12,
      skipCount: 3,
      passRate: 70,
      passTrend: "↓ 15% from last run",
      failedTestCases: [
        { code: "TC-201", title: "Stock count sync timeout", duration: "18.1s" },
        { code: "TC-204", title: "Warehouse barcode scanner event", duration: "11.4s" }
      ]
    },
    {
      id: "#316",
      app: "QuickMart",
      appIcon: Store,
      appColor: "bg-orange-500/20 text-orange-400 border-orange-500/30",
      client: "RetailMax",
      buildVersion: "v1.1.4 (1016)",
      testSuite: "Regression",
      status: "Passed",
      startedAt: "09 Sep 2026 02:45 PM",
      completedAt: "09 Sep 2026 02:58 PM",
      duration: "13m 02s",
      triggeredBy: "Schedule (Daily)",
      totalTests: 110,
      passCount: 108,
      failCount: 0,
      skipCount: 2,
      passRate: 98,
      passTrend: "↑ 1% from last run",
      failedTestCases: []
    },
    {
      id: "#315",
      app: "HealthPoint",
      appIcon: Heart,
      appColor: "bg-red-500/20 text-red-400 border-red-500/30",
      client: "MedPlus",
      buildVersion: "v2.0.1 (1015)",
      testSuite: "API Tests",
      status: "Passed",
      startedAt: "09 Sep 2026 11:20 AM",
      completedAt: "09 Sep 2026 11:31 AM",
      duration: "11m 47s",
      triggeredBy: "Pipeline (main)",
      totalTests: 80,
      passCount: 80,
      failCount: 0,
      skipCount: 0,
      passRate: 100,
      passTrend: "↑ 0% from last run",
      failedTestCases: []
    }
  ]);

  // Selected Test Run state
  const [selectedRunId, setSelectedRunId] = useState<string>("#322");
  const selectedRun = testRuns.find((r) => r.id === selectedRunId) || testRuns[2];

  // Filtering Logic
  const filteredRuns = testRuns.filter((run) => {
    const matchesSearch =
      run.app.toLowerCase().includes(searchQuery.toLowerCase()) ||
      run.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
      run.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      run.testSuite.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesApp = appFilter === "All Applications" || run.app === appFilter;
    const matchesClient = clientFilter === "All Clients" || run.client === clientFilter;
    const matchesStatus = statusFilter === "All Status" || run.status === statusFilter;

    return matchesSearch && matchesApp && matchesClient && matchesStatus;
  });

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      
      {/* 1. TOP HEADER BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <FlaskConical className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight font-sans flex items-center gap-2">
                QA & Tests
              </h1>
              <p className="text-xs text-zinc-400 mt-0.5">
                Automated testing, quality validation and test reports for all applications.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1.5">
          <div className="text-[11px] font-mono text-zinc-500">
            Home <span className="mx-1 text-zinc-700">&gt;</span> <span className="text-zinc-300">QA & Tests</span>
          </div>
          <button className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs px-4 py-2 rounded-lg transition-all flex items-center gap-2 shadow-lg shadow-emerald-950/40">
            <Plus className="w-4 h-4 stroke-[2.5]" />
            New Test Run
          </button>
        </div>
      </div>

      {/* 2. TOP METRICS CARDS (4 CARDS) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Total Test Runs */}
        <div className="bg-[#090d0b] border border-zinc-800/80 rounded-2xl p-4 flex items-center justify-between hover:border-zinc-700/80 transition-all">
          <div className="space-y-1">
            <p className="text-xs text-zinc-400 font-medium">Total Test Runs</p>
            <p className="text-2xl font-bold text-white font-sans">324</p>
            <p className="text-[11px] font-medium text-emerald-400 flex items-center gap-1">
              ↑ 22% this month
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
            <FileCheck className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Passed */}
        <div className="bg-[#090d0b] border border-zinc-800/80 rounded-2xl p-4 flex items-center justify-between hover:border-zinc-700/80 transition-all">
          <div className="space-y-1">
            <p className="text-xs text-zinc-400 font-medium">Passed</p>
            <p className="text-2xl font-bold text-white font-sans">278</p>
            <p className="text-[11px] font-medium text-zinc-400">
              86% success rate
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: Failed */}
        <div className="bg-[#090d0b] border border-zinc-800/80 rounded-2xl p-4 flex items-center justify-between hover:border-zinc-700/80 transition-all">
          <div className="space-y-1">
            <p className="text-xs text-zinc-400 font-medium">Failed</p>
            <p className="text-2xl font-bold text-white font-sans">32</p>
            <p className="text-[11px] font-medium text-zinc-400">
              10% failure rate
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 shrink-0">
            <XCircle className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4: In Progress */}
        <div className="bg-[#090d0b] border border-zinc-800/80 rounded-2xl p-4 flex items-center justify-between hover:border-zinc-700/80 transition-all">
          <div className="space-y-1">
            <p className="text-xs text-zinc-400 font-medium">In Progress</p>
            <p className="text-2xl font-bold text-white font-sans">14</p>
            <p className="text-[11px] font-medium text-zinc-400">
              4% running
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 shrink-0">
            <Clock className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* 3. SUB-NAVIGATION TABS BAR */}
      <div className="flex items-center gap-6 border-b border-zinc-800/70 text-xs font-medium text-zinc-400 overflow-x-auto pb-1">
        {[
          { id: "overview", label: "Overview" },
          { id: "test-runs", label: "Test Runs" },
          { id: "test-suites", label: "Test Suites" },
          { id: "test-cases", label: "Test Cases" },
          { id: "schedules", label: "Schedules" },
          { id: "reports", label: "Reports" },
          { id: "settings", label: "Settings" }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-2.5 transition-all relative whitespace-nowrap ${
              activeTab === tab.id
                ? "text-white font-semibold"
                : "hover:text-zinc-200"
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400 rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* 4. SPLIT VIEW LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* LEFT COLUMN: RECENT TEST RUNS TABLE & CHARTS (8 COLS) */}
        <div className="lg:col-span-8 space-y-5">
          
          {/* Recent Test Runs Table Container */}
          <div className="bg-[#090d0b] border border-zinc-800/80 rounded-2xl overflow-hidden p-4 space-y-4">
            
            {/* Header & Filter Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h2 className="text-sm font-semibold text-white">Recent Test Runs</h2>

              <div className="flex items-center gap-2 flex-wrap text-xs">
                {/* App Filter */}
                <select
                  value={appFilter}
                  onChange={(e) => setAppFilter(e.target.value)}
                  aria-label="Filter by Application"
                  className="bg-[#050807] border border-zinc-800 rounded-lg px-2.5 py-1.5 text-zinc-300 text-xs focus:outline-none focus:border-zinc-700"
                >
                  <option>All Applications</option>
                  <option>Ecom Pro</option>
                  <option>LogTrack</option>
                  <option>RetailApp</option>
                  <option>PharmaSuite</option>
                </select>

                {/* Client Filter */}
                <select
                  value={clientFilter}
                  onChange={(e) => setClientFilter(e.target.value)}
                  aria-label="Filter by Client"
                  className="bg-[#050807] border border-zinc-800 rounded-lg px-2.5 py-1.5 text-zinc-300 text-xs focus:outline-none focus:border-zinc-700"
                >
                  <option>All Clients</option>
                  <option>BlueDart</option>
                  <option>MedPlus</option>
                  <option>RetailMax</option>
                </select>

                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  aria-label="Filter by Status"
                  className="bg-[#050807] border border-zinc-800 rounded-lg px-2.5 py-1.5 text-zinc-300 text-xs focus:outline-none focus:border-zinc-700"
                >
                  <option>All Status</option>
                  <option>Passed</option>
                  <option>Failed</option>
                  <option>In Progress</option>
                </select>

                {/* Time Filter */}
                <select
                  value={timeFilter}
                  onChange={(e) => setTimeFilter(e.target.value)}
                  aria-label="Filter by Time"
                  className="bg-[#050807] border border-zinc-800 rounded-lg px-2.5 py-1.5 text-zinc-300 text-xs focus:outline-none focus:border-zinc-700"
                >
                  <option>Last 30 days</option>
                  <option>Last 7 days</option>
                  <option>Today</option>
                </select>
              </div>
            </div>

            {/* Table View */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-zinc-300 border-collapse">
                <thead>
                  <tr className="border-b border-zinc-800/80 text-zinc-500 font-medium">
                    <th className="py-2.5 px-3">#</th>
                    <th className="py-2.5 px-3">Application</th>
                    <th className="py-2.5 px-3">Client</th>
                    <th className="py-2.5 px-3">Build Version</th>
                    <th className="py-2.5 px-3">Test Suite</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Started At</th>
                    <th className="py-2.5 px-3">Duration</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/40 font-sans">
                  {filteredRuns.map((run) => {
                    const AppIcon = run.appIcon;
                    const isSelected = selectedRunId === run.id;

                    return (
                      <tr
                        key={run.id}
                        onClick={() => setSelectedRunId(run.id)}
                        className={`cursor-pointer transition-colors ${
                          isSelected ? "bg-emerald-950/20 border-l-2 border-emerald-400" : "hover:bg-zinc-900/40"
                        }`}
                      >
                        <td className="py-3 px-3 font-mono font-medium text-zinc-400">{run.id}</td>
                        
                        {/* Application */}
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            <div className={`p-1.5 rounded-lg border ${run.appColor} shrink-0`}>
                              <AppIcon className="w-3.5 h-3.5" />
                            </div>
                            <span className="font-semibold text-white">{run.app}</span>
                          </div>
                        </td>

                        {/* Client */}
                        <td className="py-3 px-3 text-zinc-300">{run.client}</td>

                        {/* Build Version */}
                        <td className="py-3 px-3 font-mono text-zinc-400 text-[11px]">{run.buildVersion}</td>

                        {/* Test Suite */}
                        <td className="py-3 px-3 text-zinc-300">{run.testSuite}</td>

                        {/* Status */}
                        <td className="py-3 px-3">
                          {run.status === "Passed" && (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                              Passed
                            </span>
                          )}
                          {run.status === "Failed" && (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                              Failed
                            </span>
                          )}
                          {run.status === "In Progress" && (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping" />
                              In Progress
                            </span>
                          )}
                        </td>

                        {/* Started At */}
                        <td className="py-3 px-3 text-zinc-400 text-[11px]">{run.startedAt}</td>

                        {/* Duration */}
                        <td className="py-3 px-3 font-mono text-zinc-300 text-[11px]">{run.duration}</td>

                        {/* Actions */}
                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedRunId(run.id);
                              }}
                              className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 transition-all"
                            >
                              View
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
              <span>Showing 1 to 10 of 324 test runs</span>
              
              <div className="flex items-center gap-1">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="p-1 rounded bg-zinc-900 border border-zinc-800 hover:text-white disabled:opacity-40"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>

                {[1, 2, 3, 4, 5].map((page) => (
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

                <span className="px-1 text-zinc-600">...</span>

                <button
                  onClick={() => setCurrentPage(33)}
                  className="px-2 py-0.5 rounded text-[11px] text-zinc-400 hover:bg-zinc-800"
                >
                  33
                </button>

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
                <option>50 / page</option>
              </select>
            </div>

          </div>

          {/* Bottom Cards: Test Coverage & Test Trends Chart */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Card 1: Test Coverage */}
            <div className="bg-[#090d0b] border border-zinc-800/80 rounded-2xl p-4 flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold text-white">Test Coverage</h3>
                <span className="text-xl font-extrabold text-emerald-400">78%</span>
              </div>

              {/* Progress Track */}
              <div className="space-y-1.5">
                <div className="w-full h-2.5 bg-zinc-800/80 rounded-full overflow-hidden p-0.5">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                    style={{ width: "78%" }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-zinc-500">
                  <span>1,245 / 1,600 lines covered</span>
                  <span className="text-emerald-400 font-medium">Target: &gt;75%</span>
                </div>
              </div>
            </div>

            {/* Card 2: Test Trends Chart */}
            <div className="bg-[#090d0b] border border-zinc-800/80 rounded-2xl p-4 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <h3 className="font-semibold text-white">Test Trends</h3>
                <div className="flex items-center gap-3 text-[11px]">
                  <span className="flex items-center gap-1 text-emerald-400 font-medium">
                    <span className="w-2 h-0.5 bg-emerald-400 rounded" /> Passed
                  </span>
                  <span className="flex items-center gap-1 text-rose-400 font-medium">
                    <span className="w-2 h-0.5 bg-rose-400 rounded" /> Failed
                  </span>
                </div>
              </div>

              {/* SVG Spline Trend Line Chart */}
              <div className="h-16 w-full pt-1">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 300 40">
                  {/* Grid Lines */}
                  <line x1="0" y1="10" x2="300" y2="10" stroke="#1f2937" strokeDasharray="3 3" strokeWidth="0.5" />
                  <line x1="0" y1="25" x2="300" y2="25" stroke="#1f2937" strokeDasharray="3 3" strokeWidth="0.5" />
                  
                  {/* Passed Green Line */}
                  <path
                    d="M 0 12 Q 50 8, 100 15 T 200 10 T 300 14"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="2"
                  />
                  {/* Failed Red Line */}
                  <path
                    d="M 0 32 Q 50 30, 100 35 T 200 28 T 300 33"
                    fill="none"
                    stroke="#f43f5e"
                    strokeWidth="2"
                  />
                </svg>
              </div>

              {/* X-Axis Dates */}
              <div className="flex items-center justify-between text-[9px] font-mono text-zinc-600 pt-1">
                <span>Sep 1</span>
                <span>Sep 3</span>
                <span>Sep 5</span>
                <span>Sep 7</span>
                <span>Sep 9</span>
                <span>Sep 11</span>
                <span>Sep 12</span>
              </div>
            </div>

          </div>

        </div>

        {/* RIGHT COLUMN: TEST RUN DETAILS PANEL (#322 DEFAULT) (4 COLS) */}
        <div className="lg:col-span-4 space-y-4">
          
          <div className="bg-[#090d0b] border border-zinc-800/80 rounded-2xl p-4 space-y-4">
            
            {/* Panel Header */}
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white font-sans">
                  Test Run {selectedRun.id}
                </h2>
                {selectedRun.status === "Failed" && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/20 text-rose-400 border border-rose-500/40">
                    ● Failed
                  </span>
                )}
                {selectedRun.status === "Passed" && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                    ● Passed
                  </span>
                )}
                {selectedRun.status === "In Progress" && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/20 text-blue-400 border border-blue-500/40">
                    ● Running
                  </span>
                )}
              </div>

              <button className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-zinc-900 border border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800 transition-all">
                <RotateCw className="w-3.5 h-3.5 text-zinc-400" />
                Re-run Tests
              </button>
            </div>

            {/* App & Run Metadata Box */}
            <div className="flex items-start justify-between gap-3 p-3 rounded-xl bg-[#050807] border border-zinc-800/60">
              <div className="flex items-start gap-2.5">
                <div className={`p-2 rounded-xl border ${selectedRun.appColor} shrink-0 mt-0.5`}>
                  <selectedRun.appIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white leading-tight">{selectedRun.app}</h3>
                  <p className="text-[11px] text-zinc-400">Client: <span className="text-zinc-200">{selectedRun.client}</span></p>
                  <p className="text-[11px] font-mono text-zinc-500 mt-0.5">Build: {selectedRun.buildVersion}</p>
                </div>
              </div>

              {/* Detailed Specs Right Column */}
              <div className="text-right text-[11px] space-y-1 text-zinc-400 font-sans">
                <p>Started At: <span className="text-zinc-300 font-mono">{selectedRun.startedAt}</span></p>
                {selectedRun.completedAt && (
                  <p>Completed At: <span className="text-zinc-300 font-mono">{selectedRun.completedAt}</span></p>
                )}
                <p>Duration: <span className="text-zinc-300 font-mono">{selectedRun.duration}</span></p>
                <p>Triggered By: <span className="text-zinc-300 font-medium">{selectedRun.triggeredBy}</span></p>
              </div>
            </div>

            {/* Panel Sub-Tabs */}
            <div className="flex items-center gap-4 border-b border-zinc-800/70 text-xs font-medium text-zinc-400">
              {["summary", "test-cases", "logs", "artifacts"].map((t) => (
                <button
                  key={t}
                  onClick={() => setPanelTab(t)}
                  className={`pb-2 capitalize transition-all relative ${
                    panelTab === t ? "text-white font-semibold" : "hover:text-zinc-200"
                  }`}
                >
                  {t.replace("-", " ")}
                  {panelTab === t && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400 rounded-full" />
                  )}
                </button>
              ))}
            </div>

            {/* TAB 1: SUMMARY (DONUT CHART & METRICS) */}
            {panelTab === "summary" && (
              <div className="space-y-4">
                
                {/* Donut Chart & Ring Metrics */}
                <div className="p-3.5 rounded-xl bg-[#050807] border border-zinc-800/60 flex items-center justify-between gap-4">
                  
                  {/* SVG Donut Chart */}
                  <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                      {/* Background circle */}
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#1f2937"
                        strokeWidth="3.8"
                      />
                      {/* Passed segment (75%) - Emerald */}
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="3.8"
                        strokeDasharray="75, 100"
                      />
                      {/* Failed segment (19%) - Red */}
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#f43f5e"
                        strokeWidth="3.8"
                        strokeDasharray="19, 100"
                        strokeDashoffset="-75"
                      />
                    </svg>

                    {/* Center Text */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                      <span className="text-base font-extrabold text-white leading-none">
                        {selectedRun.totalTests}
                      </span>
                      <span className="text-[9px] text-zinc-500 font-medium uppercase mt-0.5">Total</span>
                    </div>
                  </div>

                  {/* Legend & Pass Rate Stats */}
                  <div className="flex-1 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between text-zinc-300">
                      <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                        Passed
                      </span>
                      <span className="font-semibold text-white">{selectedRun.passCount} ({selectedRun.passRate}%)</span>
                    </div>

                    <div className="flex items-center justify-between text-zinc-300">
                      <span className="flex items-center gap-1.5 text-rose-400 font-medium">
                        <span className="w-2 h-2 rounded-full bg-rose-400" />
                        Failed
                      </span>
                      <span className="font-semibold text-white">{selectedRun.failCount} ({Math.round((selectedRun.failCount / selectedRun.totalTests) * 100)}%)</span>
                    </div>

                    <div className="flex items-center justify-between text-zinc-300">
                      <span className="flex items-center gap-1.5 text-zinc-500 font-medium">
                        <span className="w-2 h-2 rounded-full bg-zinc-600" />
                        Skipped
                      </span>
                      <span className="font-semibold text-white">{selectedRun.skipCount} ({Math.round((selectedRun.skipCount / selectedRun.totalTests) * 100)}%)</span>
                    </div>

                    <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-zinc-500 block uppercase">Pass Rate</span>
                        <span className="text-lg font-bold text-white">{selectedRun.passRate}%</span>
                      </div>
                      <span className={`text-[11px] font-medium ${selectedRun.passTrend.includes("↓") ? "text-rose-400" : "text-emerald-400"}`}>
                        {selectedRun.passTrend}
                      </span>
                    </div>
                  </div>

                </div>

                {/* Failed Test Cases Card */}
                {selectedRun.failedTestCases.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <h4 className="font-semibold text-white flex items-center gap-1.5">
                        Failed Test Cases
                      </h4>
                      <button className="text-blue-400 hover:text-blue-300 text-[11px] font-medium">
                        View All
                      </button>
                    </div>

                    <div className="space-y-1.5">
                      {selectedRun.failedTestCases.map((tc) => (
                        <div
                          key={tc.code}
                          className="flex items-center justify-between p-2 rounded-lg bg-rose-950/10 border border-rose-500/20 text-xs"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                            <span className="font-mono text-zinc-400 font-semibold">{tc.code}</span>
                            <span className="text-zinc-200 truncate">{tc.title}</span>
                          </div>
                          <span className="font-mono text-[11px] text-zinc-400 shrink-0 ml-2">{tc.duration}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Bottom Right: Execution Time Trend Chart */}
                <div className="p-3.5 rounded-xl bg-[#050807] border border-zinc-800/60 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <h4 className="font-semibold text-white">Execution Time Trend</h4>
                    <span className="text-[11px] font-mono text-purple-400 font-medium">
                      Avg. 14m 32s
                    </span>
                  </div>

                  {/* SVG Wave Line */}
                  <div className="h-12 w-full pt-1">
                    <svg className="w-full h-full overflow-visible" viewBox="0 0 250 30">
                      <path
                        d="M 0 20 Q 40 5, 80 22 T 160 8 T 250 18"
                        fill="none"
                        stroke="#a855f7"
                        strokeWidth="2"
                      />
                    </svg>
                  </div>

                  <div className="flex items-center justify-between text-[9px] font-mono text-zinc-600">
                    <span>Sep 1</span>
                    <span>Sep 3</span>
                    <span>Sep 5</span>
                    <span>Sep 7</span>
                    <span>Sep 9</span>
                    <span>Sep 11</span>
                    <span>Sep 12</span>
                  </div>
                </div>

              </div>
            )}

            {/* TAB 2: TEST CASES PLACEHOLDER */}
            {panelTab === "test-cases" && (
              <div className="p-4 text-center text-xs text-zinc-400 space-y-2">
                <FileCheck className="w-8 h-8 mx-auto text-zinc-600" />
                <p className="font-medium text-white">72 Test Cases Registered</p>
                <p>54 Passed | 14 Failed | 4 Skipped</p>
              </div>
            )}

            {/* TAB 3: LOGS PLACEHOLDER */}
            {panelTab === "logs" && (
              <div className="p-3 rounded-lg bg-black/80 font-mono text-[11px] text-zinc-400 space-y-1 h-48 overflow-y-auto">
                <p className="text-zinc-600">[06:22:01] Initializing PyTest / Jest Test Runner...</p>
                <p className="text-emerald-400">[06:22:15] PASS: TC-1001 Auth Token Generation (1.2s)</p>
                <p className="text-rose-400">[06:24:40] FAIL: TC-1024 Login with invalid credentials (12.4s)</p>
                <p className="text-zinc-500">[06:25:00] Assertion Error: Expected 401 Unauthorized but received 500 Internal Error.</p>
                <p className="text-rose-400">[06:26:12] FAIL: TC-1031 Add item to cart (8.7s)</p>
              </div>
            )}

            {/* TAB 4: ARTIFACTS PLACEHOLDER */}
            {panelTab === "artifacts" && (
              <div className="space-y-2 text-xs text-zinc-300">
                <div className="p-2.5 rounded-lg bg-[#050807] border border-zinc-800/80 flex items-center justify-between">
                  <span className="font-mono text-zinc-300">junit-report.xml</span>
                  <span className="text-[11px] text-zinc-500 font-mono">420 KB</span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#050807] border border-zinc-800/80 flex items-center justify-between">
                  <span className="font-mono text-zinc-300">coverage-report.html</span>
                  <span className="text-[11px] text-zinc-500 font-mono">1.8 MB</span>
                </div>
              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  );
}
