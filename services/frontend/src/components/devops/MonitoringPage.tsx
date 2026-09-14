import React, { useState } from "react";
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RotateCw,
  Search,
  Grid,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  LineChart,
  Box,
  Layers,
  Clock,
  Cpu,
  HardDrive,
  Radio,
  ExternalLink,
  ShieldAlert,
  Server
} from "lucide-react";

export interface ServiceItem {
  id: string;
  name: string;
  app: string;
  client: string;
  environment: string;
  status: "Healthy" | "Degraded" | "Down";
  uptime: string;
  cpu: number;
  memory: string;
}

export function MonitoringPage() {
  const [timeRange, setTimeRange] = useState("Last 1 hour");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [envFilter, setEnvFilter] = useState("All Environments");
  const [clientFilter, setClientFilter] = useState("All Clients");
  const [currentPage, setCurrentPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);

  // Mock Services Data matching the reference image
  const [services, setServices] = useState<ServiceItem[]>([
    {
      id: "#001",
      name: "api-gateway",
      app: "Ecom Pro",
      client: "BlueDart",
      environment: "Production",
      status: "Healthy",
      uptime: "12d 4h",
      cpu: 22,
      memory: "512 MB"
    },
    {
      id: "#002",
      name: "auth-service",
      app: "LogTrack",
      client: "MedPlus",
      environment: "Production",
      status: "Healthy",
      uptime: "8d 12h",
      cpu: 18,
      memory: "256 MB"
    },
    {
      id: "#003",
      name: "order-service",
      app: "RetailApp",
      client: "RetailMax",
      environment: "Staging",
      status: "Degraded",
      uptime: "2d 6h",
      cpu: 78,
      memory: "1.2 GB"
    },
    {
      id: "#004",
      name: "payment-service",
      app: "EduPortal",
      client: "EduCare",
      environment: "Production",
      status: "Healthy",
      uptime: "15d 3h",
      cpu: 35,
      memory: "412 MB"
    },
    {
      id: "#005",
      name: "inventory-service",
      app: "PharmaSuite",
      client: "MedPlus",
      environment: "Production",
      status: "Down",
      uptime: "12m",
      cpu: 0,
      memory: "0 MB"
    },
    {
      id: "#006",
      name: "notification-service",
      app: "HRMS",
      client: "Internal",
      environment: "Production",
      status: "Healthy",
      uptime: "7d 18h",
      cpu: 26,
      memory: "298 MB"
    },
    {
      id: "#007",
      name: "report-service",
      app: "FinServe",
      client: "FinServe",
      environment: "Staging",
      status: "Degraded",
      uptime: "1d 2h",
      cpu: 62,
      memory: "820 MB"
    },
    {
      id: "#008",
      name: "worker-service",
      app: "QuickMart",
      client: "RetailMax",
      environment: "Production",
      status: "Healthy",
      uptime: "20d 1h",
      cpu: 14,
      memory: "321 MB"
    },
    {
      id: "#009",
      name: "frontend",
      app: "Ecom Pro",
      client: "BlueDart",
      environment: "Production",
      status: "Healthy",
      uptime: "25d 6h",
      cpu: 12,
      memory: "190 MB"
    },
    {
      id: "#010",
      name: "db-mongodb",
      app: "Core",
      client: "Internal",
      environment: "Production",
      status: "Down",
      uptime: "4m",
      cpu: 0,
      memory: "0 MB"
    }
  ]);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  };

  // Filter Services
  const filteredServices = services.filter((srv) => {
    const matchesSearch =
      srv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      srv.app.toLowerCase().includes(searchQuery.toLowerCase()) ||
      srv.client.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "All Status" || srv.status === statusFilter;
    const matchesEnv = envFilter === "All Environments" || srv.environment === envFilter;
    const matchesClient = clientFilter === "All Clients" || srv.client === clientFilter;

    return matchesSearch && matchesStatus && matchesEnv && matchesClient;
  });

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      
      {/* 1. TOP HEADER BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight font-sans flex items-center gap-2">
                Monitoring
              </h1>
              <p className="text-xs text-zinc-400 mt-0.5">
                Real-time visibility into your infrastructure, applications and services.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1.5">
          <div className="text-[11px] font-mono text-zinc-500">
            Home <span className="mx-1 text-zinc-700">&gt;</span> <span className="text-zinc-300">Monitoring</span>
          </div>
          
          <div className="flex items-center gap-2">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              aria-label="Time range selector"
              className="bg-[#050807] border border-zinc-800 rounded-lg px-3 py-1.5 text-zinc-300 text-xs focus:outline-none focus:border-zinc-700"
            >
              <option>Last 1 hour</option>
              <option>Last 24 hours</option>
              <option>Last 7 days</option>
            </select>

            <button
              onClick={handleRefresh}
              className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 shadow-lg shadow-emerald-950/40"
            >
              <RotateCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* 2. TOP METRICS CARDS (4 CARDS) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Total Services */}
        <div className="bg-[#090d0b] border border-zinc-800/80 rounded-2xl p-4 flex items-center justify-between hover:border-zinc-700/80 transition-all">
          <div className="space-y-1">
            <p className="text-xs text-zinc-400 font-medium">Total Services</p>
            <p className="text-2xl font-bold text-white font-sans">48</p>
            <p className="text-[11px] font-medium text-emerald-400 flex items-center gap-1">
              ↑ 2 from last hour
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <Activity className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: Healthy */}
        <div className="bg-[#090d0b] border border-zinc-800/80 rounded-2xl p-4 flex items-center justify-between hover:border-zinc-700/80 transition-all">
          <div className="space-y-1">
            <p className="text-xs text-zinc-400 font-medium">Healthy</p>
            <p className="text-2xl font-bold text-white font-sans">42</p>
            <p className="text-[11px] font-medium text-zinc-400">
              88% of total
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: Degraded */}
        <div className="bg-[#090d0b] border border-zinc-800/80 rounded-2xl p-4 flex items-center justify-between hover:border-zinc-700/80 transition-all">
          <div className="space-y-1">
            <p className="text-xs text-zinc-400 font-medium">Degraded</p>
            <p className="text-2xl font-bold text-white font-sans">4</p>
            <p className="text-[11px] font-medium text-zinc-400">
              8% of total
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4: Down */}
        <div className="bg-[#090d0b] border border-zinc-800/80 rounded-2xl p-4 flex items-center justify-between hover:border-zinc-700/80 transition-all">
          <div className="space-y-1">
            <p className="text-xs text-zinc-400 font-medium">Down</p>
            <p className="text-2xl font-bold text-white font-sans">2</p>
            <p className="text-[11px] font-medium text-zinc-400">
              4% of total
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 shrink-0">
            <XCircle className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* 3. METRIC CHARTS GRID (TOP ROW 3 CHARTS) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Chart 1: CPU Usage */}
        <div className="bg-[#090d0b] border border-zinc-800/80 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <h3 className="font-semibold text-white">CPU Usage</h3>
            <span className="text-[11px] font-mono text-emerald-400 font-medium">
              Avg: 42%
            </span>
          </div>

          {/* SVG Line Chart */}
          <div className="h-24 w-full relative pt-2">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 300 60">
              {/* Horizontal Grid lines */}
              <line x1="0" y1="0" x2="300" y2="0" stroke="#1f2937" strokeDasharray="3 3" strokeWidth="0.5" />
              <line x1="0" y1="20" x2="300" y2="20" stroke="#1f2937" strokeDasharray="3 3" strokeWidth="0.5" />
              <line x1="0" y1="40" x2="300" y2="40" stroke="#1f2937" strokeDasharray="3 3" strokeWidth="0.5" />
              <line x1="0" y1="60" x2="300" y2="60" stroke="#1f2937" strokeDasharray="3 3" strokeWidth="0.5" />

              {/* Green Wave Path */}
              <path
                d="M 0 38 Q 30 25, 60 35 T 120 28 T 180 42 T 240 22 T 300 32"
                fill="none"
                stroke="#10b981"
                strokeWidth="2"
              />
            </svg>
          </div>

          <div className="flex items-center justify-between text-[9px] font-mono text-zinc-600 pt-1">
            <span>10:00</span>
            <span>10:10</span>
            <span>10:20</span>
            <span>10:30</span>
            <span>10:40</span>
            <span>10:50</span>
            <span>11:00</span>
          </div>
        </div>

        {/* Chart 2: Memory Usage */}
        <div className="bg-[#090d0b] border border-zinc-800/80 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <h3 className="font-semibold text-white">Memory Usage</h3>
            <span className="text-[11px] font-mono text-blue-400 font-medium">
              Avg: 58%
            </span>
          </div>

          {/* SVG Line Chart */}
          <div className="h-24 w-full relative pt-2">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 300 60">
              <line x1="0" y1="0" x2="300" y2="0" stroke="#1f2937" strokeDasharray="3 3" strokeWidth="0.5" />
              <line x1="0" y1="20" x2="300" y2="20" stroke="#1f2937" strokeDasharray="3 3" strokeWidth="0.5" />
              <line x1="0" y1="40" x2="300" y2="40" stroke="#1f2937" strokeDasharray="3 3" strokeWidth="0.5" />
              <line x1="0" y1="60" x2="300" y2="60" stroke="#1f2937" strokeDasharray="3 3" strokeWidth="0.5" />

              {/* Blue Wave Path */}
              <path
                d="M 0 45 Q 40 30, 80 20 T 160 30 T 240 15 T 300 28"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="2"
              />
            </svg>
          </div>

          <div className="flex items-center justify-between text-[9px] font-mono text-zinc-600 pt-1">
            <span>10:00</span>
            <span>10:10</span>
            <span>10:20</span>
            <span>10:30</span>
            <span>10:40</span>
            <span>10:50</span>
            <span>11:00</span>
          </div>
        </div>

        {/* Chart 3: Network Traffic */}
        <div className="bg-[#090d0b] border border-zinc-800/80 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <h3 className="font-semibold text-white">Network Traffic</h3>
            <div className="flex items-center gap-3 text-[11px]">
              <span className="flex items-center gap-1 text-emerald-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400" /> Incoming
              </span>
              <span className="flex items-center gap-1 text-sky-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-sky-400" /> Outgoing
              </span>
            </div>
          </div>

          {/* Dual Line Chart */}
          <div className="h-24 w-full relative pt-2">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 300 60">
              <line x1="0" y1="0" x2="300" y2="0" stroke="#1f2937" strokeDasharray="3 3" strokeWidth="0.5" />
              <line x1="0" y1="20" x2="300" y2="20" stroke="#1f2937" strokeDasharray="3 3" strokeWidth="0.5" />
              <line x1="0" y1="40" x2="300" y2="40" stroke="#1f2937" strokeDasharray="3 3" strokeWidth="0.5" />
              <line x1="0" y1="60" x2="300" y2="60" stroke="#1f2937" strokeDasharray="3 3" strokeWidth="0.5" />

              {/* Incoming Emerald Line */}
              <path
                d="M 0 50 Q 40 40, 80 15 T 160 45 T 220 10 T 300 30"
                fill="none"
                stroke="#10b981"
                strokeWidth="1.5"
              />

              {/* Outgoing Sky Blue Line */}
              <path
                d="M 0 42 Q 50 25, 100 48 T 180 20 T 260 35 T 300 20"
                fill="none"
                stroke="#38bdf8"
                strokeWidth="1.5"
              />
            </svg>
          </div>

          <div className="flex items-center justify-between text-[9px] font-mono text-zinc-600 pt-1">
            <span>10:00</span>
            <span>10:10</span>
            <span>10:20</span>
            <span>10:30</span>
            <span>10:40</span>
            <span>10:50</span>
            <span>11:00</span>
          </div>
        </div>

      </div>

      {/* 4. MAIN SPLIT VIEW SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* LEFT COLUMN: SERVICES TABLE (8 COLS) */}
        <div className="lg:col-span-8 bg-[#090d0b] border border-zinc-800/80 rounded-2xl overflow-hidden p-4 space-y-4">
          
          {/* Header & Filter Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <h2 className="text-sm font-semibold text-white">Services</h2>
              <div className="relative w-48">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1.5 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Search services..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#050807] border border-zinc-800/80 rounded-lg pl-8 pr-3 py-1 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-700"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap text-xs">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                aria-label="Filter by Status"
                className="bg-[#050807] border border-zinc-800 rounded-lg px-2.5 py-1 text-zinc-300 text-xs focus:outline-none"
              >
                <option>All Status</option>
                <option>Healthy</option>
                <option>Degraded</option>
                <option>Down</option>
              </select>

              <select
                value={envFilter}
                onChange={(e) => setEnvFilter(e.target.value)}
                aria-label="Filter by Environment"
                className="bg-[#050807] border border-zinc-800 rounded-lg px-2.5 py-1 text-zinc-300 text-xs focus:outline-none"
              >
                <option>All Environments</option>
                <option>Production</option>
                <option>Staging</option>
              </select>

              <select
                value={clientFilter}
                onChange={(e) => setClientFilter(e.target.value)}
                aria-label="Filter by Client"
                className="bg-[#050807] border border-zinc-800 rounded-lg px-2.5 py-1 text-zinc-300 text-xs focus:outline-none"
              >
                <option>All Clients</option>
                <option>BlueDart</option>
                <option>MedPlus</option>
                <option>RetailMax</option>
                <option>EduCare</option>
                <option>FinServe</option>
                <option>Internal</option>
              </select>

              <button className="p-1 rounded-lg bg-[#050807] border border-zinc-800 text-zinc-400 hover:text-white">
                <Grid className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-300 border-collapse">
              <thead>
                <tr className="border-b border-zinc-800/80 text-zinc-500 font-medium">
                  <th className="py-2.5 px-3">#</th>
                  <th className="py-2.5 px-3">Service Name</th>
                  <th className="py-2.5 px-3">Application</th>
                  <th className="py-2.5 px-3">Client</th>
                  <th className="py-2.5 px-3">Environment</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Uptime</th>
                  <th className="py-2.5 px-3">CPU</th>
                  <th className="py-2.5 px-3">Memory</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/40 font-sans">
                {filteredServices.map((srv) => (
                  <tr key={srv.id} className="hover:bg-zinc-900/40 transition-colors">
                    <td className="py-3 px-3 font-mono font-medium text-zinc-500">{srv.id}</td>
                    
                    {/* Service Name */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <Box className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                        <span className="font-mono font-semibold text-white">{srv.name}</span>
                      </div>
                    </td>

                    {/* Application */}
                    <td className="py-3 px-3 text-zinc-300 font-medium">{srv.app}</td>

                    {/* Client */}
                    <td className="py-3 px-3 text-zinc-400">{srv.client}</td>

                    {/* Environment */}
                    <td className="py-3 px-3 text-zinc-400">{srv.environment}</td>

                    {/* Status */}
                    <td className="py-3 px-3">
                      {srv.status === "Healthy" && (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          Healthy
                        </span>
                      )}
                      {srv.status === "Degraded" && (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                          Degraded
                        </span>
                      )}
                      {srv.status === "Down" && (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                          Down
                        </span>
                      )}
                    </td>

                    {/* Uptime */}
                    <td className="py-3 px-3 font-mono text-zinc-400 text-[11px]">{srv.uptime}</td>

                    {/* CPU */}
                    <td className="py-3 px-3 font-mono text-zinc-300">{srv.cpu}%</td>

                    {/* Memory */}
                    <td className="py-3 px-3 font-mono text-zinc-300">{srv.memory}</td>

                    {/* Actions */}
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800/60">
                          <LineChart className="w-3.5 h-3.5" />
                        </button>
                        <button className="p-1 rounded-md text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/60">
                          <MoreHorizontal className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 text-xs text-zinc-500">
            <span>Showing 1 to 10 of 48 services</span>

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

        {/* RIGHT COLUMN: SERVICE STATUS & SYSTEM RESOURCES PANEL (4 COLS) */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Card 1: Service Status Donut Chart */}
          <div className="bg-[#090d0b] border border-zinc-800/80 rounded-2xl p-4 space-y-3">
            <h3 className="text-xs font-semibold text-white">Service Status</h3>

            <div className="flex items-center justify-between gap-4">
              {/* SVG Donut Chart */}
              <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  {/* Outer circle track */}
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#1f2937"
                    strokeWidth="3.8"
                  />
                  {/* Healthy (88%) - Emerald */}
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="3.8"
                    strokeDasharray="88, 100"
                  />
                  {/* Degraded (8%) - Amber */}
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="3.8"
                    strokeDasharray="8, 100"
                    strokeDashoffset="-88"
                  />
                  {/* Down (4%) - Red */}
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#f43f5e"
                    strokeWidth="3.8"
                    strokeDasharray="4, 100"
                    strokeDashoffset="-96"
                  />
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-base font-extrabold text-white leading-none">48</span>
                  <span className="text-[9px] text-zinc-500 uppercase mt-0.5">Services</span>
                </div>
              </div>

              {/* Legend */}
              <div className="flex-1 space-y-2 text-xs">
                <div className="flex items-center justify-between text-zinc-300">
                  <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" /> Healthy
                  </span>
                  <span className="font-semibold text-white">42 (88%)</span>
                </div>

                <div className="flex items-center justify-between text-zinc-300">
                  <span className="flex items-center gap-1.5 text-amber-400 font-medium">
                    <span className="w-2 h-2 rounded-full bg-amber-400" /> Degraded
                  </span>
                  <span className="font-semibold text-white">4 (8%)</span>
                </div>

                <div className="flex items-center justify-between text-zinc-300">
                  <span className="flex items-center gap-1.5 text-rose-400 font-medium">
                    <span className="w-2 h-2 rounded-full bg-rose-400" /> Down
                  </span>
                  <span className="font-semibold text-white">2 (4%)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Recent Alerts */}
          <div className="bg-[#090d0b] border border-zinc-800/80 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <h3 className="font-semibold text-white">Recent Alerts</h3>
              <button className="text-blue-400 hover:text-blue-300 text-[11px] font-medium">
                View All
              </button>
            </div>

            <div className="space-y-2 text-xs">
              {/* Alert 1 */}
              <div className="flex items-center justify-between p-2 rounded-lg bg-rose-950/20 border border-rose-500/20">
                <div className="flex items-center gap-2 min-w-0">
                  <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span className="font-mono text-zinc-400 text-[11px]">10:58</span>
                  <span className="text-zinc-200 truncate">inventory-service is down</span>
                </div>
                <span className="text-[11px] text-zinc-400 shrink-0 ml-2 font-mono">Production</span>
              </div>

              {/* Alert 2 */}
              <div className="flex items-center justify-between p-2 rounded-lg bg-amber-950/20 border border-amber-500/20">
                <div className="flex items-center gap-2 min-w-0">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="font-mono text-zinc-400 text-[11px]">10:47</span>
                  <span className="text-zinc-200 truncate">High memory usage (78%)</span>
                </div>
                <span className="text-[11px] text-zinc-400 shrink-0 ml-2 font-mono">order-service</span>
              </div>

              {/* Alert 3 */}
              <div className="flex items-center justify-between p-2 rounded-lg bg-amber-950/20 border border-amber-500/20">
                <div className="flex items-center gap-2 min-w-0">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="font-mono text-zinc-400 text-[11px]">10:32</span>
                  <span className="text-zinc-200 truncate">API response time &gt; 2s</span>
                </div>
                <span className="text-[11px] text-zinc-400 shrink-0 ml-2 font-mono">report-service</span>
              </div>

              {/* Alert 4 */}
              <div className="flex items-center justify-between p-2 rounded-lg bg-rose-950/20 border border-rose-500/20">
                <div className="flex items-center gap-2 min-w-0">
                  <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span className="font-mono text-zinc-400 text-[11px]">10:18</span>
                  <span className="text-zinc-200 truncate">Database connection lost</span>
                </div>
                <span className="text-[11px] text-zinc-400 shrink-0 ml-2 font-mono">db-mongodb</span>
              </div>

              {/* Alert 5 */}
              <div className="flex items-center justify-between p-2 rounded-lg bg-amber-950/20 border border-amber-500/20">
                <div className="flex items-center gap-2 min-w-0">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="font-mono text-zinc-400 text-[11px]">10:05</span>
                  <span className="text-zinc-200 truncate">High CPU usage (85%)</span>
                </div>
                <span className="text-[11px] text-zinc-400 shrink-0 ml-2 font-mono">worker-service</span>
              </div>
            </div>
          </div>

          {/* Card 3: System Resources */}
          <div className="bg-[#090d0b] border border-zinc-800/80 rounded-2xl p-4 space-y-3">
            <h3 className="text-xs font-semibold text-white">System Resources</h3>

            <div className="space-y-2.5 text-xs">
              {/* CPU Bar */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400 font-medium">CPU</span>
                  <span className="text-emerald-400 font-mono font-bold">42%</span>
                </div>
                <div className="w-full h-2 bg-zinc-800/80 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-400 rounded-full" style={{ width: "42%" }} />
                </div>
              </div>

              {/* Memory Bar */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400 font-medium">Memory</span>
                  <span className="text-blue-400 font-mono font-bold">58%</span>
                </div>
                <div className="w-full h-2 bg-zinc-800/80 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-400 rounded-full" style={{ width: "58%" }} />
                </div>
              </div>

              {/* Disk Bar */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400 font-medium">Disk</span>
                  <span className="text-purple-400 font-mono font-bold">67%</span>
                </div>
                <div className="w-full h-2 bg-zinc-800/80 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-400 rounded-full" style={{ width: "67%" }} />
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
