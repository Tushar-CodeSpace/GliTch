import React from "react";
import { Button } from "@/components/ui/button";
import { 
  Menu, 
  Wrench, 
  Search, 
  RefreshCw, 
  UserCheck, 
  LogOut, 
  Code2, 
  Globe 
} from "lucide-react";

interface HealthInfo {
  status: string;
  service: string;
  version: string;
  timestamp: number;
  python_version: string;
}

interface NavbarProps {
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (collapsed: boolean) => void;
  selectedApp: string;
  setSelectedApp: (app: string) => void;
  selectedSite: string;
  setSelectedSite: (site: string) => void;
  health: HealthInfo | null;
  loadingHealth: boolean;
  latency: number | null;
  wsStatus?: "CONNECTING" | "CONNECTED" | "RECONNECTING" | "DISCONNECTED";
  wsLatency?: number | null;
  userEmail: string;
  onRefresh: () => void;
  onLogout: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export function Navbar({
  isSidebarCollapsed,
  setIsSidebarCollapsed,
  selectedApp,
  setSelectedApp,
  selectedSite,
  setSelectedSite,
  health,
  loadingHealth,
  latency,
  wsStatus = "CONNECTED",
  wsLatency,
  userEmail,
  onRefresh,
  onLogout,
  searchQuery,
  setSearchQuery,
}: NavbarProps) {
  const isWsConnected = wsStatus === "CONNECTED";

  return (
    <header className="h-14 bg-[#060908]/95 border-b border-zinc-800/80 sticky top-0 z-50 backdrop-blur-xl px-4 flex items-center justify-between shrink-0 shadow-md">
      
      {/* Left Section: Sidebar Toggle & Brand Title */}
      <div className="flex items-center gap-3">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
          className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-zinc-800/60 rounded-lg transition-colors"
          title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          <Menu className="w-4 h-4" />
        </Button>

        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <Wrench className="w-4 h-4" />
          </div>
          <h1 className="text-lg font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500 font-mono flex items-center">
            GliTch
            <span className="inline-block w-2 h-4 ml-1 bg-emerald-400 animate-terminal-blink" />
          </h1>
          <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-mono text-emerald-400 hidden sm:inline-block">
            ENTERPRISE DEVOPS v2.4
          </span>
        </div>
      </div>

      {/* Center Section: Multi-Tenant Selectors */}
      <div className="hidden lg:flex items-center gap-3 font-mono text-xs">
        
        {/* Software App Selector */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-black/60 border border-zinc-800 text-zinc-300">
          <Code2 className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-zinc-500 text-[11px]">Software:</span>
          <select
            value={selectedApp}
            onChange={(e) => setSelectedApp(e.target.value)}
            className="bg-transparent border-none outline-none text-emerald-400 font-semibold cursor-pointer pr-1"
          >
            <option value="FinTech Core App" className="bg-[#060908] text-white">FinTech Core App</option>
            <option value="E-Commerce Engine" className="bg-[#060908] text-white">E-Commerce Engine</option>
            <option value="Scraper Agent Pool" className="bg-[#060908] text-white">Scraper Agent Pool</option>
          </select>
        </div>

        {/* Client Target Site Selector */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-black/60 border border-zinc-800 text-zinc-300">
          <Globe className="w-3.5 h-3.5 text-teal-400" />
          <span className="text-zinc-500 text-[11px]">Target Client:</span>
          <select
            value={selectedSite}
            onChange={(e) => setSelectedSite(e.target.value)}
            className="bg-transparent border-none outline-none text-teal-300 font-semibold cursor-pointer pr-1"
          >
            <option value="All Client Sites" className="bg-[#060908] text-white">All Client Sites (3)</option>
            <option value="Client Alpha (US-East)" className="bg-[#060908] text-white">Client Alpha (US-East)</option>
            <option value="Client Beta (EU-West)" className="bg-[#060908] text-white">Client Beta (EU-West)</option>
            <option value="Client Gamma (AP-South)" className="bg-[#060908] text-white">Client Gamma (AP-South)</option>
          </select>
        </div>

      </div>

      {/* Right Section: Status Pills & Controls */}
      <div className="flex items-center gap-3">
        
        {/* Real-time WebSocket Live Badge */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-lg border border-emerald-500/30 bg-[#060908] text-xs font-mono">
          <span className={`relative flex h-2 w-2`}>
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isWsConnected ? "bg-emerald-400 opacity-75" : "bg-amber-400 opacity-75"}`} />
            <span className={`relative inline-flex rounded-full h-2 w-2 ${isWsConnected ? "bg-emerald-400" : "bg-amber-400"}`} />
          </span>
          <span className={`${isWsConnected ? "text-emerald-400 font-extrabold" : "text-amber-300 font-semibold"}`}>
            {isWsConnected ? "WS LIVE" : wsStatus}
          </span>
          {(wsLatency !== undefined && wsLatency !== null) ? (
            <span className="font-mono text-[10px] text-teal-300 bg-teal-500/10 px-1.5 py-0.5 rounded border border-teal-500/30">
              {wsLatency}ms
            </span>
          ) : latency ? (
            <span className="font-mono text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/30">
              {latency}ms
            </span>
          ) : null}
        </div>

        {/* Sync / Reconnect Button */}
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onRefresh} 
          className="h-8 px-2.5 border-zinc-800 bg-[#060908] hover:bg-zinc-900 text-zinc-300 rounded-lg text-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${!isWsConnected ? "animate-spin text-emerald-400" : "text-emerald-400"}`} />
          <span className="hidden md:inline ml-1.5">Sync</span>
        </Button>

        {/* User Identity */}
        <div className="hidden xl:flex items-center gap-1.5 px-3 py-1 rounded-lg border border-zinc-800 bg-[#060908] text-xs font-mono text-zinc-300">
          <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span className="truncate max-w-[120px]">{userEmail}</span>
        </div>

        {/* Sign Out Button */}
        <Button 
          variant="destructive" 
          size="sm" 
          onClick={onLogout} 
          className="h-8 px-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-lg text-xs font-mono"
        >
          <LogOut className="w-3.5 h-3.5 sm:mr-1" />
          <span className="hidden sm:inline">Sign Out</span>
        </Button>

      </div>

    </header>
  );
}

