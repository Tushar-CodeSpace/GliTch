import React, { useState } from "react";
import {
  FileText,
  Download,
  Search,
  RotateCw,
  X,
  Copy,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Info,
  AlertTriangle,
  XCircle,
  Bug,
  Zap,
  CheckCircle2,
  ExternalLink,
  Layers
} from "lucide-react";

export interface LogEntry {
  id: string;
  timestamp: string;
  level: "INFO" | "WARN" | "ERROR" | "DEBUG";
  source: string;
  service: string;
  message: string;
  environment: string;
  host: string;
  hostId: string;
  requestId: string;
  user: string;
  ip: string;
  jsonDetails: any;
  relatedLogs: { time: string; level: "INFO" | "WARN" | "ERROR"; message: string }[];
}

export function LogsPage() {
  const [sourceFilter, setSourceFilter] = useState("All Sources");
  const [appFilter, setAppFilter] = useState("Ecom Pro");
  const [envFilter, setEnvFilter] = useState("All Environments");
  const [levelFilter, setLevelFilter] = useState("All Levels");
  const [timeFilter, setTimeFilter] = useState("Last 24 hours");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeLevelFilter, setActiveLevelFilter] = useState<string>("All");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [linesCount, setLinesCount] = useState("100 lines");
  const [currentPage, setCurrentPage] = useState(1);
  const [copySuccess, setCopySuccess] = useState(false);

  // Mock 15 logs matching Screenshot 1
  const [logs, setLogs] = useState<LogEntry[]>([
    {
      id: "log-1",
      timestamp: "12 Sep 2026 10:24:12",
      level: "INFO",
      source: "Ecom Pro",
      service: "api-gateway",
      message: "Request received: GET /api/products",
      environment: "Production",
      host: "a1b2c3d4e5f6",
      hostId: "a1b2c3d4e5f6",
      requestId: "req_101abc",
      user: "user_456",
      ip: "10.1.24.12",
      jsonDetails: {
        level: "info",
        message: "Request received: GET /api/products",
        service: "api-gateway",
        timestamp: "2026-09-12T10:24:12:102Z",
        traceId: "a1b2c3d4e5f6",
        requestId: "req_101abc",
        details: { method: "GET", path: "/api/products", statusCode: 200 }
      },
      relatedLogs: [
        { time: "10:24:11", level: "INFO", message: "User authenticated successfully" },
        { time: "10:24:12", level: "INFO", message: "Request received: GET /api/products" }
      ]
    },
    {
      id: "log-2",
      timestamp: "12 Sep 2026 10:24:11",
      level: "INFO",
      source: "Ecom Pro",
      service: "auth-service",
      message: "User authenticated successfully",
      environment: "Production",
      host: "a1b2c3d4e5f6",
      hostId: "a1b2c3d4e5f6",
      requestId: "req_102def",
      user: "user_456",
      ip: "10.1.24.12",
      jsonDetails: {
        level: "info",
        message: "User authenticated successfully",
        service: "auth-service",
        timestamp: "2026-09-12T10:24:11:890Z",
        traceId: "a1b2c3d4e5f6",
        requestId: "req_102def"
      },
      relatedLogs: [
        { time: "10:24:10", level: "INFO", message: "Validating JWT payload" },
        { time: "10:24:11", level: "INFO", message: "User authenticated successfully" }
      ]
    },
    {
      id: "log-3",
      timestamp: "12 Sep 2026 10:24:10",
      level: "WARN",
      source: "Ecom Pro",
      service: "order-service",
      message: "High response time: 2.4s",
      environment: "Production",
      host: "a1b2c3d4e5f6",
      hostId: "a1b2c3d4e5f6",
      requestId: "req_103ghi",
      user: "user_789",
      ip: "10.1.24.18",
      jsonDetails: {
        level: "warn",
        message: "High response time: 2.4s",
        service: "order-service",
        timestamp: "2026-09-12T10:24:10:412Z",
        traceId: "a1b2c3d4e5f6",
        requestId: "req_103ghi",
        details: { latencyMs: 2400, thresholdMs: 1000 }
      },
      relatedLogs: [
        { time: "10:24:08", level: "INFO", message: "Querying DB order_table" },
        { time: "10:24:10", level: "WARN", message: "High response time: 2.4s" }
      ]
    },
    {
      id: "log-4",
      timestamp: "12 Sep 2026 10:24:08",
      level: "ERROR",
      source: "Ecom Pro",
      service: "payment-service",
      message: "Payment gateway timeout",
      environment: "Production",
      host: "a1b2c3d4e5f6",
      hostId: "a1b2c3d4e5f6",
      requestId: "req_789xyz",
      user: "N/A",
      ip: "10.1.24.56",
      jsonDetails: {
        level: "error",
        message: "Payment gateway timeout",
        service: "payment-service",
        timestamp: "2026-09-12T10:24:08:342Z",
        traceId: "a1b2c3d4e5f6",
        requestId: "req_789xyz",
        details: {
          gateway: "stripe",
          timeout: 30000
        }
      },
      relatedLogs: [
        { time: "10:24:07", level: "INFO", message: "Payment request initiated" },
        { time: "10:24:08", level: "ERROR", message: "Payment gateway timeout" },
        { time: "10:24:09", level: "INFO", message: "Retrying payment (1/3)" }
      ]
    },
    {
      id: "log-5",
      timestamp: "12 Sep 2026 10:24:07",
      level: "INFO",
      source: "Ecom Pro",
      service: "inventory-service",
      message: "Stock updated for product #12345",
      environment: "Production",
      host: "a1b2c3d4e5f6",
      hostId: "a1b2c3d4e5f6",
      requestId: "req_105jkl",
      user: "sys_worker",
      ip: "10.1.24.08",
      jsonDetails: {
        level: "info",
        message: "Stock updated for product #12345",
        service: "inventory-service",
        timestamp: "2026-09-12T10:24:07:900Z",
        traceId: "a1b2c3d4e5f6",
        requestId: "req_105jkl"
      },
      relatedLogs: []
    },
    {
      id: "log-6",
      timestamp: "12 Sep 2026 10:24:06",
      level: "DEBUG",
      source: "Ecom Pro",
      service: "frontend",
      message: 'API call payload: {"page":1,"limit":20}',
      environment: "Production",
      host: "a1b2c3d4e5f6",
      hostId: "a1b2c3d4e5f6",
      requestId: "req_106mno",
      user: "N/A",
      ip: "10.1.24.99",
      jsonDetails: {
        level: "debug",
        message: 'API call payload: {"page":1,"limit":20}',
        service: "frontend",
        timestamp: "2026-09-12T10:24:06:500Z",
        traceId: "a1b2c3d4e5f6",
        requestId: "req_106mno"
      },
      relatedLogs: []
    },
    {
      id: "log-7",
      timestamp: "12 Sep 2026 10:24:05",
      level: "INFO",
      source: "Ecom Pro",
      service: "worker-service",
      message: "Background job started: sync-inventory",
      environment: "Production",
      host: "a1b2c3d4e5f6",
      hostId: "a1b2c3d4e5f6",
      requestId: "req_107pqr",
      user: "sys_cron",
      ip: "10.1.24.77",
      jsonDetails: {
        level: "info",
        message: "Background job started: sync-inventory",
        service: "worker-service",
        timestamp: "2026-09-12T10:24:05:120Z",
        traceId: "a1b2c3d4e5f6",
        requestId: "req_107pqr"
      },
      relatedLogs: []
    },
    {
      id: "log-8",
      timestamp: "12 Sep 2026 10:24:03",
      level: "INFO",
      source: "Ecom Pro",
      service: "db-mongodb",
      message: "Connection established",
      environment: "Production",
      host: "a1b2c3d4e5f6",
      hostId: "a1b2c3d4e5f6",
      requestId: "req_108stu",
      user: "N/A",
      ip: "10.1.24.20",
      jsonDetails: {
        level: "info",
        message: "Connection established",
        service: "db-mongodb",
        timestamp: "2026-09-12T10:24:03:001Z",
        traceId: "a1b2c3d4e5f6",
        requestId: "req_108stu"
      },
      relatedLogs: []
    },
    {
      id: "log-9",
      timestamp: "12 Sep 2026 10:24:01",
      level: "ERROR",
      source: "Ecom Pro",
      service: "report-service",
      message: "Failed to generate report: Out of memory",
      environment: "Production",
      host: "a1b2c3d4e5f6",
      hostId: "a1b2c3d4e5f6",
      requestId: "req_109vwx",
      user: "admin",
      ip: "10.1.24.33",
      jsonDetails: {
        level: "error",
        message: "Failed to generate report: Out of memory",
        service: "report-service",
        timestamp: "2026-09-12T10:24:01:800Z",
        traceId: "a1b2c3d4e5f6",
        requestId: "req_109vwx"
      },
      relatedLogs: []
    },
    {
      id: "log-10",
      timestamp: "12 Sep 2026 10:23:59",
      level: "INFO",
      source: "Ecom Pro",
      service: "api-gateway",
      message: "Response sent: 200 (342ms)",
      environment: "Production",
      host: "a1b2c3d4e5f6",
      hostId: "a1b2c3d4e5f6",
      requestId: "req_110yz1",
      user: "N/A",
      ip: "10.1.24.12",
      jsonDetails: {
        level: "info",
        message: "Response sent: 200 (342ms)",
        service: "api-gateway",
        timestamp: "2026-09-12T10:23:59:440Z",
        traceId: "a1b2c3d4e5f6",
        requestId: "req_110yz1"
      },
      relatedLogs: []
    },
    {
      id: "log-11",
      timestamp: "12 Sep 2026 10:23:58",
      level: "WARN",
      source: "Ecom Pro",
      service: "notification-service",
      message: "Email service slow: 1.8s",
      environment: "Production",
      host: "a1b2c3d4e5f6",
      hostId: "a1b2c3d4e5f6",
      requestId: "req_111234",
      user: "N/A",
      ip: "10.1.24.44",
      jsonDetails: {
        level: "warn",
        message: "Email service slow: 1.8s",
        service: "notification-service",
        timestamp: "2026-09-12T10:23:58:200Z",
        traceId: "a1b2c3d4e5f6",
        requestId: "req_111234"
      },
      relatedLogs: []
    },
    {
      id: "log-12",
      timestamp: "12 Sep 2026 10:23:56",
      level: "INFO",
      source: "Ecom Pro",
      service: "auth-service",
      message: "Token refreshed for user: user123",
      environment: "Production",
      host: "a1b2c3d4e5f6",
      hostId: "a1b2c3d4e5f6",
      requestId: "req_112567",
      user: "user123",
      ip: "10.1.24.15",
      jsonDetails: {
        level: "info",
        message: "Token refreshed for user: user123",
        service: "auth-service",
        timestamp: "2026-09-12T10:23:56:010Z",
        traceId: "a1b2c3d4e5f6",
        requestId: "req_112567"
      },
      relatedLogs: []
    },
    {
      id: "log-13",
      timestamp: "12 Sep 2026 10:23:54",
      level: "DEBUG",
      source: "Ecom Pro",
      service: "order-service",
      message: "Order payload: {...}",
      environment: "Production",
      host: "a1b2c3d4e5f6",
      hostId: "a1b2c3d4e5f6",
      requestId: "req_113890",
      user: "N/A",
      ip: "10.1.24.18",
      jsonDetails: {
        level: "debug",
        message: "Order payload: {...}",
        service: "order-service",
        timestamp: "2026-09-12T10:23:54:990Z",
        traceId: "a1b2c3d4e5f6",
        requestId: "req_113890"
      },
      relatedLogs: []
    },
    {
      id: "log-14",
      timestamp: "12 Sep 2026 10:23:52",
      level: "INFO",
      source: "Ecom Pro",
      service: "payment-service",
      message: "Payment processed successfully",
      environment: "Production",
      host: "a1b2c3d4e5f6",
      hostId: "a1b2c3d4e5f6",
      requestId: "req_114111",
      user: "user_999",
      ip: "10.1.24.56",
      jsonDetails: {
        level: "info",
        message: "Payment processed successfully",
        service: "payment-service",
        timestamp: "2026-09-12T10:23:52:300Z",
        traceId: "a1b2c3d4e5f6",
        requestId: "req_114111"
      },
      relatedLogs: []
    },
    {
      id: "log-15",
      timestamp: "12 Sep 2026 10:23:50",
      level: "INFO",
      source: "Ecom Pro",
      service: "inventory-service",
      message: "Low stock alert: product #67890",
      environment: "Production",
      host: "a1b2c3d4e5f6",
      hostId: "a1b2c3d4e5f6",
      requestId: "req_115222",
      user: "sys_worker",
      ip: "10.1.24.08",
      jsonDetails: {
        level: "info",
        message: "Low stock alert: product #67890",
        service: "inventory-service",
        timestamp: "2026-09-12T10:23:50:880Z",
        traceId: "a1b2c3d4e5f6",
        requestId: "req_115222"
      },
      relatedLogs: []
    }
  ]);

  // Default selected log: log-4 (#4 Payment gateway timeout)
  const [selectedLogId, setSelectedLogId] = useState<string>("log-4");
  const selectedLog = logs.find((l) => l.id === selectedLogId) || logs[3];

  // Filtering
  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.service.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.requestId.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesLevel =
      activeLevelFilter === "All" ||
      log.level.toUpperCase() === activeLevelFilter.toUpperCase();

    const matchesApp = appFilter === "All Applications" || log.source === appFilter;

    return matchesSearch && matchesLevel && matchesApp;
  });

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(selectedLog.jsonDetails, null, 2));
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      
      {/* 1. TOP HEADER BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight font-sans flex items-center gap-2">
                Logs
              </h1>
              <p className="text-xs text-zinc-400 mt-0.5">
                Search and analyse logs from applications, builds, deployments and system services.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1.5">
          <div className="text-[11px] font-mono text-zinc-500">
            Home <span className="mx-1 text-zinc-700">&gt;</span> <span className="text-zinc-300">Logs</span>
          </div>
          <button className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-zinc-900 border border-zinc-700 text-zinc-200 hover:text-white hover:bg-zinc-800 transition-all flex items-center gap-2">
            <Download className="w-3.5 h-3.5" />
            Export Logs
          </button>
        </div>
      </div>

      {/* 2. TOP FILTER CONTROLS BAR (6 INPUTS) */}
      <div className="bg-[#090d0b] border border-zinc-800/80 rounded-2xl p-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
        
        {/* Source */}
        <div className="space-y-1">
          <label className="text-[10px] text-zinc-400 font-medium block">Source</label>
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="w-full bg-[#050807] border border-zinc-800 rounded-lg px-2.5 py-1.5 text-zinc-200 focus:outline-none focus:border-zinc-700"
          >
            <option>All Sources</option>
            <option>Kubernetes Cluster</option>
            <option>Edge Agents</option>
          </select>
        </div>

        {/* Application */}
        <div className="space-y-1">
          <label className="text-[10px] text-zinc-400 font-medium block">Application</label>
          <select
            value={appFilter}
            onChange={(e) => setAppFilter(e.target.value)}
            className="w-full bg-[#050807] border border-zinc-800 rounded-lg px-2.5 py-1.5 text-zinc-200 focus:outline-none focus:border-zinc-700"
          >
            <option>Ecom Pro</option>
            <option>LogTrack</option>
            <option>RetailApp</option>
            <option>PharmaSuite</option>
          </select>
        </div>

        {/* Environment */}
        <div className="space-y-1">
          <label className="text-[10px] text-zinc-400 font-medium block">Environment</label>
          <select
            value={envFilter}
            onChange={(e) => setEnvFilter(e.target.value)}
            className="w-full bg-[#050807] border border-zinc-800 rounded-lg px-2.5 py-1.5 text-zinc-200 focus:outline-none focus:border-zinc-700"
          >
            <option>All Environments</option>
            <option>Production</option>
            <option>Staging</option>
          </select>
        </div>

        {/* Log Level */}
        <div className="space-y-1">
          <label className="text-[10px] text-zinc-400 font-medium block">Log Level</label>
          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            className="w-full bg-[#050807] border border-zinc-800 rounded-lg px-2.5 py-1.5 text-zinc-200 focus:outline-none focus:border-zinc-700"
          >
            <option>All Levels</option>
            <option>INFO</option>
            <option>WARN</option>
            <option>ERROR</option>
            <option>DEBUG</option>
          </select>
        </div>

        {/* Time Range */}
        <div className="space-y-1">
          <label className="text-[10px] text-zinc-400 font-medium block">Time Range</label>
          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
            className="w-full bg-[#050807] border border-zinc-800 rounded-lg px-2.5 py-1.5 text-zinc-200 focus:outline-none focus:border-zinc-700"
          >
            <option>Last 24 hours</option>
            <option>Last 1 hour</option>
            <option>Last 7 days</option>
          </select>
        </div>

        {/* Search Input */}
        <div className="space-y-1">
          <label className="text-[10px] text-zinc-400 font-medium block">Search Logs</label>
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-zinc-500" />
            <input
              type="text"
              placeholder="Search by message..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#050807] border border-zinc-800 rounded-lg pl-8 pr-2.5 py-1.5 text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-zinc-700"
            />
          </div>
        </div>

      </div>

      {/* 3. LEVEL QUICK-FILTER BUTTONS ROW & AUTO REFRESH */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        
        {/* Quick Filter Buttons */}
        <div className="flex items-center gap-2 overflow-x-auto">
          {[
            { id: "All", label: "⚡ All", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/40" },
            { id: "Info", label: "ℹ️ Info", color: "bg-blue-500/20 text-blue-400 border-blue-500/40" },
            { id: "Warn", label: "⚠️ Warn", color: "bg-amber-500/20 text-amber-400 border-amber-500/40" },
            { id: "Error", label: "🔴 Error", color: "bg-rose-500/20 text-rose-400 border-rose-500/40" },
            { id: "Debug", label: "🟣 Debug", color: "bg-purple-500/20 text-purple-400 border-purple-500/40" }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveLevelFilter(item.id)}
              className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                activeLevelFilter === item.id
                  ? item.color
                  : "bg-[#090d0b] border-zinc-800 text-zinc-400 hover:text-white"
              }`}
            >
              {item.label}
            </button>
          ))}

          <button className="p-1.5 rounded-lg bg-[#090d0b] border border-zinc-800 text-zinc-400 hover:text-white">
            <RotateCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Auto Refresh Toggle & Lines dropdown */}
        <div className="flex items-center gap-3 self-end sm:self-auto">
          <label className="flex items-center gap-2 cursor-pointer">
            <span className="text-zinc-400 text-xs font-medium">Auto Refresh</span>
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-8 h-4 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-emerald-500 relative" />
          </label>

          <select
            value={linesCount}
            onChange={(e) => setLinesCount(e.target.value)}
            className="bg-[#050807] border border-zinc-800 rounded-lg px-2.5 py-1 text-zinc-300 text-xs focus:outline-none"
          >
            <option>100 lines</option>
            <option>500 lines</option>
            <option>1000 lines</option>
          </select>
        </div>

      </div>

      {/* 4. SPLIT VIEW LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* LEFT COLUMN: LOGS TABLE (8 COLS) */}
        <div className="lg:col-span-8 bg-[#090d0b] border border-zinc-800/80 rounded-2xl overflow-hidden p-4 space-y-4">
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-300 border-collapse">
              <thead>
                <tr className="border-b border-zinc-800/80 text-zinc-500 font-medium">
                  <th className="py-2.5 px-3">Timestamp</th>
                  <th className="py-2.5 px-3">Level</th>
                  <th className="py-2.5 px-3">Source</th>
                  <th className="py-2.5 px-3">Service</th>
                  <th className="py-2.5 px-3">Message</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/40 font-mono text-[11px]">
                {filteredLogs.map((log) => {
                  const isSelected = selectedLogId === log.id;

                  return (
                    <tr
                      key={log.id}
                      onClick={() => setSelectedLogId(log.id)}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? "bg-emerald-950/20 border-l-2 border-emerald-400"
                          : "hover:bg-zinc-900/40"
                      }`}
                    >
                      {/* Timestamp */}
                      <td className="py-2.5 px-3 text-zinc-400 whitespace-nowrap">{log.timestamp}</td>

                      {/* Level */}
                      <td className="py-2.5 px-3">
                        {log.level === "INFO" && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                            <Info className="w-3 h-3" /> INFO
                          </span>
                        )}
                        {log.level === "WARN" && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                            <AlertTriangle className="w-3 h-3" /> WARN
                          </span>
                        )}
                        {log.level === "ERROR" && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                            <XCircle className="w-3 h-3" /> ERROR
                          </span>
                        )}
                        {log.level === "DEBUG" && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-400 border border-purple-500/30">
                            <Bug className="w-3 h-3" /> DEBUG
                          </span>
                        )}
                      </td>

                      {/* Source */}
                      <td className="py-2.5 px-3 text-zinc-300 font-sans">{log.source}</td>

                      {/* Service */}
                      <td className="py-2.5 px-3 text-zinc-300">{log.service}</td>

                      {/* Message */}
                      <td className={`py-2.5 px-3 font-sans truncate max-w-xs ${
                        log.level === "ERROR" ? "text-rose-400 font-medium" : log.level === "WARN" ? "text-amber-400" : "text-zinc-200"
                      }`}>
                        {log.message}
                      </td>

                      {/* Actions */}
                      <td className="py-2.5 px-3 text-right">
                        <button className="p-1 rounded text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50">
                          <MoreHorizontal className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 text-xs text-zinc-500 font-sans">
            <span>Showing 1 to 15 of 12,438 logs</span>

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
                onClick={() => setCurrentPage(830)}
                className="px-2 py-0.5 rounded text-[11px] text-zinc-400 hover:bg-zinc-800"
              >
                830
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
              <option>15 / page</option>
              <option>50 / page</option>
              <option>100 / page</option>
            </select>
          </div>

        </div>

        {/* RIGHT COLUMN: LOG DETAILS DRAWER (4 COLS) */}
        <div className="lg:col-span-4 space-y-4 font-sans">
          
          <div className="bg-[#090d0b] border border-zinc-800/80 rounded-2xl p-4 space-y-4">
            
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
              <h2 className="text-base font-bold text-white">Log Details</h2>
              <button className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800/60">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Level Badge & Timestamp */}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-xs font-bold bg-rose-500/20 text-rose-400 border border-rose-500/40 uppercase">
                  🔴 {selectedLog.level}
                </span>
                <span className="text-xs font-mono text-zinc-400">{selectedLog.timestamp}</span>
              </div>
              <h3 className="text-sm font-bold text-white pt-1">{selectedLog.message}</h3>
            </div>

            {/* Key Specs Grid */}
            <div className="grid grid-cols-2 gap-y-2 gap-x-4 p-3 rounded-xl bg-[#050807] border border-zinc-800/60 text-xs text-zinc-400">
              <div>
                <span className="block text-[10px] text-zinc-500">Application</span>
                <span className="text-zinc-200 font-semibold">{selectedLog.source}</span>
              </div>

              <div>
                <span className="block text-[10px] text-zinc-500">Service</span>
                <span className="text-zinc-200 font-mono">{selectedLog.service}</span>
              </div>

              <div>
                <span className="block text-[10px] text-zinc-500">Environment</span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  {selectedLog.environment}
                </span>
              </div>

              <div>
                <span className="block text-[10px] text-zinc-500">Host</span>
                <span className="text-zinc-200 font-mono text-[11px]">{selectedLog.host}</span>
              </div>

              <div>
                <span className="block text-[10px] text-zinc-500">Host ID</span>
                <span className="text-zinc-300 font-mono text-[11px] flex items-center gap-1">
                  {selectedLog.hostId} <Copy className="w-3 h-3 text-zinc-500 cursor-pointer" />
                </span>
              </div>

              <div>
                <span className="block text-[10px] text-zinc-500">Request ID</span>
                <span className="text-zinc-300 font-mono text-[11px] flex items-center gap-1">
                  {selectedLog.requestId} <Copy className="w-3 h-3 text-zinc-500 cursor-pointer" />
                </span>
              </div>

              <div>
                <span className="block text-[10px] text-zinc-500">User</span>
                <span className="text-zinc-300">{selectedLog.user}</span>
              </div>

              <div>
                <span className="block text-[10px] text-zinc-500">IP Address</span>
                <span className="text-zinc-300 font-mono">{selectedLog.ip}</span>
              </div>
            </div>

            {/* Log Message Code Block */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <h4 className="font-semibold text-white">Log Message</h4>
                
                <div className="flex items-center gap-2 text-[11px]">
                  <button className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-semibold border border-emerald-500/30">
                    Formatted
                  </button>
                  <button className="px-2 py-0.5 rounded text-zinc-400 hover:text-white">
                    Raw
                  </button>
                  <button
                    onClick={handleCopyJson}
                    className="flex items-center gap-1 text-zinc-400 hover:text-white"
                  >
                    <Copy className="w-3 h-3" />
                    {copySuccess ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>

              {/* JSON Editor Terminal Box */}
              <div className="p-3 rounded-xl bg-black/90 border border-zinc-800 font-mono text-[11px] text-emerald-300 space-y-1 overflow-x-auto">
                <pre>{JSON.stringify(selectedLog.jsonDetails, null, 2)}</pre>
              </div>
            </div>

            {/* Related Logs Section */}
            {selectedLog.relatedLogs.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <h4 className="font-semibold text-white">Related Logs</h4>
                  <button className="text-blue-400 hover:text-blue-300 text-[11px] font-medium flex items-center gap-1">
                    View Related →
                  </button>
                </div>

                <div className="space-y-1.5 font-mono text-[11px]">
                  {selectedLog.relatedLogs.map((rel, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 rounded-lg bg-[#050807] border border-zinc-800/60"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-zinc-500">{rel.time}</span>
                        {rel.level === "INFO" && <span className="text-blue-400 font-bold">INFO</span>}
                        {rel.level === "ERROR" && <span className="text-rose-400 font-bold">ERROR</span>}
                        <span className="text-zinc-200 truncate">{rel.message}</span>
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
