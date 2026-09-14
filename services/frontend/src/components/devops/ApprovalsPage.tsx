import React, { useState } from "react";
import {
  ShieldCheck,
  Plus,
  Hourglass,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Rocket,
  Settings,
  UserCheck,
  Layers,
  FileText,
  X,
  MessageSquare,
  Check,
  AlertCircle
} from "lucide-react";

export interface ApprovalItem {
  id: string;
  type: "Deployment" | "Configuration" | "Access" | "Infrastructure" | "Other";
  typeIcon: any;
  typeColor: string;
  title: string;
  app: string;
  requester: string;
  status: "Pending" | "Approved" | "Rejected";
  requestedAt: string;
  environment: string;
  version: string;
  priority: "High" | "Medium" | "Low";
  reviewers: string;
  dueBy: string;
  description: string;
  flow: { title: string; status: "completed" | "current" | "pending"; subtext?: string }[];
}

export function ApprovalsPage() {
  const [activeTab, setActiveTab] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("All Types");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [requesterFilter, setRequesterFilter] = useState("All Requesters");
  const [timeFilter, setTimeFilter] = useState("Last 30 days");
  const [currentPage, setCurrentPage] = useState(1);

  // Mock list of 10 requests matching Screenshot 2
  const [requests, setRequests] = useState<ApprovalItem[]>([
    {
      id: "#1084",
      type: "Deployment",
      typeIcon: Rocket,
      typeColor: "bg-blue-600/20 text-blue-400 border-blue-500/30",
      title: "Deploy v2.4.1 to Production",
      app: "Ecom Pro",
      requester: "johndoe",
      status: "Pending",
      requestedAt: "12 Sep 2026 10:24 AM",
      environment: "Production",
      version: "v2.4.1",
      priority: "High",
      reviewers: "sachin, asfak",
      dueBy: "12 Sep 2026, 02:00 PM",
      description: "This release includes performance improvements, bug fixes, and new features for the checkout flow.",
      flow: [
        { title: "Requested by johndoe", status: "completed", subtext: "12 Sep 2026, 10:24 AM" },
        { title: "Pending approval (sachin)", status: "current", subtext: "Waiting for review" },
        { title: "Pending approval (asfak)", status: "pending" },
        { title: "Deploy to Production", status: "pending" }
      ]
    },
    {
      id: "#1083",
      type: "Configuration",
      typeIcon: Settings,
      typeColor: "bg-emerald-600/20 text-emerald-400 border-emerald-500/30",
      title: "Update database config",
      app: "LogTrack",
      requester: "sarah.k",
      status: "Approved",
      requestedAt: "11 Sep 2026 04:12 PM",
      environment: "Production",
      version: "v1.8.0",
      priority: "Medium",
      reviewers: "johndoe",
      dueBy: "11 Sep 2026, 06:00 PM",
      description: "Increased connection pool size to 100 for peak load handling.",
      flow: [
        { title: "Requested by sarah.k", status: "completed", subtext: "11 Sep 2026, 04:12 PM" },
        { title: "Approved by johndoe", status: "completed", subtext: "11 Sep 2026, 04:45 PM" }
      ]
    },
    {
      id: "#1082",
      type: "Access",
      typeIcon: UserCheck,
      typeColor: "bg-sky-600/20 text-sky-400 border-sky-500/30",
      title: "Grant server access",
      app: "FinServe",
      requester: "mike.t",
      status: "Pending",
      requestedAt: "11 Sep 2026 11:03 AM",
      environment: "Staging",
      version: "v0.9.0",
      priority: "Low",
      reviewers: "sachin",
      dueBy: "12 Sep 2026, 11:00 AM",
      description: "Temporary SSH access granted for debugging staging gateway.",
      flow: [
        { title: "Requested by mike.t", status: "completed", subtext: "11 Sep 2026, 11:03 AM" },
        { title: "Pending approval (sachin)", status: "current", subtext: "Waiting for review" }
      ]
    },
    {
      id: "#1081",
      type: "Deployment",
      typeIcon: Rocket,
      typeColor: "bg-rose-600/20 text-rose-400 border-rose-500/30",
      title: "Deploy hotfix v1.8.1",
      app: "RetailApp",
      requester: "priya.s",
      status: "Rejected",
      requestedAt: "10 Sep 2026 06:45 PM",
      environment: "Production",
      version: "v1.8.1",
      priority: "High",
      reviewers: "asfak",
      dueBy: "10 Sep 2026, 08:00 PM",
      description: "Emergency patch for cart total calculation error.",
      flow: [
        { title: "Requested by priya.s", status: "completed" },
        { title: "Rejected by asfak", status: "completed", subtext: "Requires regression tests first" }
      ]
    },
    {
      id: "#1080",
      type: "Infrastructure",
      typeIcon: Layers,
      typeColor: "bg-indigo-600/20 text-indigo-400 border-indigo-500/30",
      title: "Scale up worker nodes",
      app: "HRMS",
      requester: "arun.p",
      status: "Approved",
      requestedAt: "10 Sep 2026 02:18 PM",
      environment: "Production",
      version: "v1.2.0",
      priority: "Medium",
      reviewers: "johndoe",
      dueBy: "10 Sep 2026, 04:00 PM",
      description: "Scale Kubernetes worker nodes from 4 to 8 for payroll processing.",
      flow: [
        { title: "Requested by arun.p", status: "completed" },
        { title: "Approved by johndoe", status: "completed" }
      ]
    },
    {
      id: "#1079",
      type: "Configuration",
      typeIcon: Settings,
      typeColor: "bg-emerald-600/20 text-emerald-400 border-emerald-500/30",
      title: "Update environment variables",
      app: "InventoryX",
      requester: "kavya.r",
      status: "Approved",
      requestedAt: "09 Sep 2026 11:20 AM",
      environment: "Production",
      version: "v3.0.0",
      priority: "Low",
      reviewers: "sachin",
      dueBy: "09 Sep 2026, 02:00 PM",
      description: "Updated API key secrets for vendor integration endpoint.",
      flow: [{ title: "Approved by sachin", status: "completed" }]
    },
    {
      id: "#1078",
      type: "Deployment",
      typeIcon: Rocket,
      typeColor: "bg-blue-600/20 text-blue-400 border-blue-500/30",
      title: "Deploy v3.0.0 to Staging",
      app: "QuickMart",
      requester: "vijay.m",
      status: "Approved",
      requestedAt: "09 Sep 2026 09:44 AM",
      environment: "Staging",
      version: "v3.0.0",
      priority: "Medium",
      reviewers: "asfak",
      dueBy: "09 Sep 2026, 12:00 PM",
      description: "Staging deployment for QA validation.",
      flow: [{ title: "Approved by asfak", status: "completed" }]
    },
    {
      id: "#1077",
      type: "Access",
      typeIcon: UserCheck,
      typeColor: "bg-sky-600/20 text-sky-400 border-sky-500/30",
      title: "Revoke user access",
      app: "EduPortal",
      requester: "nisha.k",
      status: "Pending",
      requestedAt: "08 Sep 2026 04:32 PM",
      environment: "Production",
      version: "v2.1.0",
      priority: "High",
      reviewers: "johndoe",
      dueBy: "09 Sep 2026, 10:00 AM",
      description: "Revoke offboarded developer access credentials.",
      flow: [{ title: "Pending approval (johndoe)", status: "current" }]
    },
    {
      id: "#1076",
      type: "Other",
      typeIcon: FileText,
      typeColor: "bg-zinc-600/20 text-zinc-400 border-zinc-500/30",
      title: "Run data migration script",
      app: "HealthPoint",
      requester: "ravi.d",
      status: "Approved",
      requestedAt: "08 Sep 2026 01:15 PM",
      environment: "Production",
      version: "v2.0.1",
      priority: "High",
      reviewers: "sachin",
      dueBy: "08 Sep 2026, 03:00 PM",
      description: "Execute schema migration for v2.0 patient records.",
      flow: [{ title: "Approved by sachin", status: "completed" }]
    },
    {
      id: "#1075",
      type: "Infrastructure",
      typeIcon: Layers,
      typeColor: "bg-indigo-600/20 text-indigo-400 border-indigo-500/30",
      title: "Increase disk size",
      app: "MedPlus",
      requester: "anita.s",
      status: "Rejected",
      requestedAt: "07 Sep 2026 05:12 PM",
      environment: "Production",
      version: "v1.5.0",
      priority: "Medium",
      reviewers: "asfak",
      dueBy: "07 Sep 2026, 07:00 PM",
      description: "Expand EBS volume to 500GB.",
      flow: [{ title: "Rejected by asfak", status: "completed" }]
    }
  ]);

  // Selected Item: default #1084
  const [selectedId, setSelectedId] = useState<string>("#1084");
  const selectedReq = requests.find((r) => r.id === selectedId) || requests[0];

  const handleApprove = (id: string) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "Approved" } : r))
    );
  };

  const handleReject = (id: string) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "Rejected" } : r))
    );
  };

  // Filter Logic
  const filteredRequests = requests.filter((req) => {
    const matchesSearch =
      req.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.app.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.requester.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = typeFilter === "All Types" || req.type === typeFilter;
    const matchesStatus = statusFilter === "All Status" || req.status === statusFilter;
    const matchesRequester = requesterFilter === "All Requesters" || req.requester === requesterFilter;

    return matchesSearch && matchesType && matchesStatus && matchesRequester;
  });

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      
      {/* 1. TOP HEADER BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight font-sans flex items-center gap-2">
                Approvals
              </h1>
              <p className="text-xs text-zinc-400 mt-0.5">
                Review and approve deployment requests, configuration changes and critical operations.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1.5">
          <div className="text-[11px] font-mono text-zinc-500">
            Home <span className="mx-1 text-zinc-700">&gt;</span> <span className="text-zinc-300">Approvals</span>
          </div>
          <button className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs px-4 py-2 rounded-lg transition-all flex items-center gap-2 shadow-lg shadow-emerald-950/40">
            <Plus className="w-4 h-4 stroke-[2.5]" />
            New Approval Request
          </button>
        </div>
      </div>

      {/* 2. TOP METRICS CARDS (4 CARDS) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Pending */}
        <div className="bg-[#090d0b] border border-zinc-800/80 rounded-2xl p-4 flex items-center justify-between hover:border-zinc-700/80 transition-all">
          <div className="space-y-1">
            <p className="text-xs text-zinc-400 font-medium">Pending</p>
            <p className="text-2xl font-bold text-white font-sans">8</p>
            <p className="text-[11px] font-medium text-amber-400">
              Awaiting review
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
            <Hourglass className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Approved */}
        <div className="bg-[#090d0b] border border-zinc-800/80 rounded-2xl p-4 flex items-center justify-between hover:border-zinc-700/80 transition-all">
          <div className="space-y-1">
            <p className="text-xs text-zinc-400 font-medium">Approved</p>
            <p className="text-2xl font-bold text-white font-sans">142</p>
            <p className="text-[11px] font-medium text-zinc-400">
              92% approval rate
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: Rejected */}
        <div className="bg-[#090d0b] border border-zinc-800/80 rounded-2xl p-4 flex items-center justify-between hover:border-zinc-700/80 transition-all">
          <div className="space-y-1">
            <p className="text-xs text-zinc-400 font-medium">Rejected</p>
            <p className="text-2xl font-bold text-white font-sans">11</p>
            <p className="text-[11px] font-medium text-zinc-400">
              7% rejection rate
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 shrink-0">
            <XCircle className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4: Avg. Review Time */}
        <div className="bg-[#090d0b] border border-zinc-800/80 rounded-2xl p-4 flex items-center justify-between hover:border-zinc-700/80 transition-all">
          <div className="space-y-1">
            <p className="text-xs text-zinc-400 font-medium">Avg. Review Time</p>
            <p className="text-2xl font-bold text-white font-sans">18m</p>
            <p className="text-[11px] font-medium text-emerald-400 flex items-center gap-1">
              ↓ 35% from last month
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
          { id: "all", label: "All Requests" },
          { id: "deployment", label: "Deployment" },
          { id: "configuration", label: "Configuration" },
          { id: "access", label: "Access" },
          { id: "infrastructure", label: "Infrastructure" },
          { id: "other", label: "Other" }
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
        
        {/* LEFT COLUMN: REQUESTS TABLE (8 COLS) */}
        <div className="lg:col-span-8 bg-[#090d0b] border border-zinc-800/80 rounded-2xl overflow-hidden p-4 space-y-4">
          
          {/* Search & Filters Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-zinc-500" />
              <input
                type="text"
                placeholder="Search approval requests..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#050807] border border-zinc-800/80 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-700"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap text-xs">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                aria-label="Filter by Type"
                className="bg-[#050807] border border-zinc-800 rounded-lg px-2.5 py-1.5 text-zinc-300 text-xs focus:outline-none"
              >
                <option>All Types</option>
                <option>Deployment</option>
                <option>Configuration</option>
                <option>Access</option>
                <option>Infrastructure</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                aria-label="Filter by Status"
                className="bg-[#050807] border border-zinc-800 rounded-lg px-2.5 py-1.5 text-zinc-300 text-xs focus:outline-none"
              >
                <option>All Status</option>
                <option>Pending</option>
                <option>Approved</option>
                <option>Rejected</option>
              </select>

              <select
                value={requesterFilter}
                onChange={(e) => setRequesterFilter(e.target.value)}
                aria-label="Filter by Requester"
                className="bg-[#050807] border border-zinc-800 rounded-lg px-2.5 py-1.5 text-zinc-300 text-xs focus:outline-none"
              >
                <option>All Requesters</option>
                <option>johndoe</option>
                <option>sarah.k</option>
                <option>mike.t</option>
              </select>

              <select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
                aria-label="Filter by Time"
                className="bg-[#050807] border border-zinc-800 rounded-lg px-2.5 py-1.5 text-zinc-300 text-xs focus:outline-none"
              >
                <option>Last 30 days</option>
                <option>Last 7 days</option>
                <option>Today</option>
              </select>
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-300 border-collapse">
              <thead>
                <tr className="border-b border-zinc-800/80 text-zinc-500 font-medium">
                  <th className="py-2.5 px-3">#</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Title</th>
                  <th className="py-2.5 px-3">Application</th>
                  <th className="py-2.5 px-3">Requester</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Requested At</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/40 font-sans">
                {filteredRequests.map((req) => {
                  const TypeIcon = req.typeIcon;
                  const isSelected = selectedId === req.id;

                  return (
                    <tr
                      key={req.id}
                      onClick={() => setSelectedId(req.id)}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? "bg-emerald-950/20 border-l-2 border-emerald-400"
                          : "hover:bg-zinc-900/40"
                      }`}
                    >
                      {/* ID */}
                      <td className="py-3 px-3 font-mono font-medium text-zinc-400">{req.id}</td>

                      {/* Type */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5">
                          <div className={`p-1 rounded border ${req.typeColor} shrink-0`}>
                            <TypeIcon className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-zinc-300 font-medium">{req.type}</span>
                        </div>
                      </td>

                      {/* Title */}
                      <td className="py-3 px-3 font-semibold text-white truncate max-w-xs">{req.title}</td>

                      {/* Application */}
                      <td className="py-3 px-3 text-zinc-400">{req.app}</td>

                      {/* Requester */}
                      <td className="py-3 px-3 font-mono text-zinc-300 text-[11px]">{req.requester}</td>

                      {/* Status */}
                      <td className="py-3 px-3">
                        {req.status === "Pending" && (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                            Pending
                          </span>
                        )}
                        {req.status === "Approved" && (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            Approved
                          </span>
                        )}
                        {req.status === "Rejected" && (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                            Rejected
                          </span>
                        )}
                      </td>

                      {/* Requested At */}
                      <td className="py-3 px-3 text-zinc-400 text-[11px] font-mono">{req.requestedAt}</td>

                      {/* Actions */}
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {req.status === "Pending" ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedId(req.id);
                              }}
                              className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 transition-all"
                            >
                              Review
                            </button>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedId(req.id);
                              }}
                              className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 transition-all"
                            >
                              View
                            </button>
                          )}
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
            <span>Showing 1 to 10 of 161 requests</span>

            <div className="flex items-center gap-1 font-mono">
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
                onClick={() => setCurrentPage(17)}
                className="px-2 py-0.5 rounded text-[11px] text-zinc-400 hover:bg-zinc-800"
              >
                17
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

        {/* RIGHT COLUMN: REQUEST DETAILS PANEL (4 COLS) */}
        <div className="lg:col-span-4 space-y-4">
          
          <div className="bg-[#090d0b] border border-zinc-800/80 rounded-2xl p-4 space-y-4">
            
            {/* Panel Header */}
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">
                  Request {selectedReq.id}
                </h2>
                {selectedReq.status === "Pending" && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/40">
                    ● Pending
                  </span>
                )}
                {selectedReq.status === "Approved" && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                    ● Approved
                  </span>
                )}
                {selectedReq.status === "Rejected" && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/20 text-rose-400 border border-rose-500/40">
                    ● Rejected
                  </span>
                )}
              </div>

              <button className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800/60">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* App Hero Box */}
            <div className="p-3 rounded-xl bg-[#050807] border border-zinc-800/60 flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 shrink-0">
                <Rocket className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">{selectedReq.title}</h3>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  Deploy latest version to production environment
                </p>
              </div>
            </div>

            {/* Specs Grid */}
            <div className="grid grid-cols-2 gap-y-2.5 gap-x-4 p-3 rounded-xl bg-[#050807] border border-zinc-800/60 text-xs">
              <div>
                <span className="block text-[10px] text-zinc-500">Application</span>
                <span className="text-zinc-200 font-semibold">{selectedReq.app}</span>
              </div>

              <div>
                <span className="block text-[10px] text-zinc-500">Environment</span>
                <span className="text-emerald-400 font-medium">{selectedReq.environment}</span>
              </div>

              <div>
                <span className="block text-[10px] text-zinc-500">Type</span>
                <span className="text-zinc-300">{selectedReq.type}</span>
              </div>

              <div>
                <span className="block text-[10px] text-zinc-500">Version</span>
                <span className="text-zinc-300 font-mono">{selectedReq.version}</span>
              </div>

              <div>
                <span className="block text-[10px] text-zinc-500">Requester</span>
                <span className="text-zinc-300 font-mono">{selectedReq.requester}</span>
              </div>

              <div>
                <span className="block text-[10px] text-zinc-500">Priority</span>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                  {selectedReq.priority}
                </span>
              </div>

              <div>
                <span className="block text-[10px] text-zinc-500">Requested At</span>
                <span className="text-zinc-300 font-mono text-[11px]">{selectedReq.requestedAt}</span>
              </div>

              <div>
                <span className="block text-[10px] text-zinc-500">Reviewers</span>
                <span className="text-zinc-300 font-mono text-[11px]">{selectedReq.reviewers}</span>
              </div>

              <div className="col-span-2">
                <span className="block text-[10px] text-zinc-500">Due By</span>
                <span className="text-zinc-300 font-mono text-[11px]">{selectedReq.dueBy}</span>
              </div>
            </div>

            {/* Description Card */}
            <div className="space-y-1.5 text-xs">
              <h4 className="font-semibold text-white">Description</h4>
              <p className="p-3 rounded-xl bg-[#050807] border border-zinc-800/60 text-zinc-300 leading-relaxed text-[11px]">
                {selectedReq.description}
              </p>
            </div>

            {/* Approval Flow Stepper */}
            <div className="space-y-2 text-xs">
              <h4 className="font-semibold text-white">Approval Flow</h4>

              <div className="p-3 rounded-xl bg-[#050807] border border-zinc-800/60 space-y-3">
                {selectedReq.flow.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-3 relative">
                    {idx < selectedReq.flow.length - 1 && (
                      <div className="absolute left-2.5 top-5 bottom-0 w-0.5 bg-zinc-800" />
                    )}

                    <div className="relative z-10 shrink-0">
                      {step.status === "completed" && (
                        <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-black">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                      {step.status === "current" && (
                        <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-white animate-pulse">
                          <div className="w-2 h-2 rounded-full bg-white" />
                        </div>
                      )}
                      {step.status === "pending" && (
                        <div className="w-5 h-5 rounded-full bg-zinc-800 border border-zinc-700" />
                      )}
                    </div>

                    <div>
                      <p className={`font-semibold ${step.status === "completed" ? "text-white" : step.status === "current" ? "text-blue-400" : "text-zinc-500"}`}>
                        {step.title}
                      </p>
                      {step.subtext && (
                        <p className="text-[10px] text-zinc-500 font-mono mt-0.5">{step.subtext}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            {selectedReq.status === "Pending" ? (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={() => handleApprove(selectedReq.id)}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs py-2 rounded-lg transition-all flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  Approve
                </button>
                <button
                  onClick={() => handleReject(selectedReq.id)}
                  className="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs py-2 rounded-lg transition-all flex items-center justify-center gap-1.5"
                >
                  <X className="w-4 h-4 stroke-[3]" />
                  Reject
                </button>
                <button className="col-span-2 w-full bg-zinc-900 border border-zinc-700 hover:bg-zinc-800 text-zinc-200 font-medium text-xs py-2 rounded-lg transition-all flex items-center justify-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-zinc-400" />
                  Add Comment
                </button>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-[#050807] border border-zinc-800/60 text-center text-xs font-semibold text-zinc-400">
                This request has been {selectedReq.status.toLowerCase()}.
              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  );
}
