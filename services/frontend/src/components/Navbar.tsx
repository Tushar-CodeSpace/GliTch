import React from "react";
import { Button } from "@/components/ui/button";
import { 
  Menu, 
  Search, 
  Sun, 
  Moon, 
  Bell, 
  RefreshCw
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
  const [isDarkMode, setIsDarkMode] = React.useState(true);

  return (
    <header className="h-14 bg-[#050807]/95 border-b border-zinc-800/60 sticky top-0 z-50 backdrop-blur-xl px-4 flex items-center justify-between shrink-0">
      
      {/* LEFT: SIDEBAR TOGGLE & GLOBAL SEARCH BAR */}
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
          className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-zinc-800/60 rounded-lg transition-colors shrink-0"
          title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          <Menu className="w-4 h-4" />
        </Button>

        {/* Global Search Bar */}
        <div className="relative w-full max-w-md hidden sm:block">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search apps, clients, deployment..."
            className="w-full h-8 pl-8 pr-4 bg-[#0a0f0d] border border-zinc-800/80 rounded-xl text-xs text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all font-sans"
          />
        </div>
      </div>

      {/* RIGHT: CONTROLS & USER PROFILE */}
      <div className="flex items-center gap-3">
        
        {/* Real-time WS Status Pill */}
        <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-lg border border-emerald-500/20 bg-[#070b09] text-[11px] font-mono">
          <span className="relative flex h-2 w-2">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isWsConnected ? "bg-emerald-400 opacity-75" : "bg-amber-400 opacity-75"}`} />
            <span className={`relative inline-flex rounded-full h-2 w-2 ${isWsConnected ? "bg-emerald-400" : "bg-amber-400"}`} />
          </span>
          <span className={isWsConnected ? "text-emerald-400 font-bold" : "text-amber-300"}>
            {isWsConnected ? "WS LIVE" : wsStatus}
          </span>
          {(wsLatency !== undefined && wsLatency !== null) && (
            <span className="text-[10px] text-zinc-400 ml-1">{wsLatency}ms</span>
          )}
        </div>

        {/* Refresh Sync */}
        <button 
          onClick={onRefresh}
          className="p-1.5 rounded-lg border border-zinc-800/60 bg-[#070b09] text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition-colors"
          title="Refresh Data"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>

        {/* Theme Toggle (Sun / Moon) */}
        <div 
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="flex items-center gap-1.5 p-1 rounded-full border border-zinc-800/80 bg-[#090d0b] cursor-pointer"
          title="Toggle Light/Dark Theme"
        >
          <Sun className={`w-3.5 h-3.5 ${!isDarkMode ? "text-amber-400" : "text-zinc-500"}`} />
          <div className={`w-3 h-3 rounded-full bg-emerald-400 transition-all ${isDarkMode ? "translate-x-0" : "translate-x-0"}`} />
          <Moon className={`w-3.5 h-3.5 ${isDarkMode ? "text-emerald-400" : "text-zinc-500"}`} />
        </div>

        {/* Notification Bell */}
        <button 
          className="relative p-1.5 rounded-lg border border-zinc-800/60 bg-[#070b09] text-zinc-400 hover:text-white transition-colors"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white font-bold text-[9px] flex items-center justify-center border border-[#050807]">
            3
          </span>
        </button>

        {/* User Identity Pill */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-zinc-800/60">
          <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-md">
            N
          </div>
          <div className="hidden lg:block text-left">
            <p className="text-xs font-bold text-white leading-tight">
              {userEmail.includes("@") ? userEmail.split("@")[0] : userEmail}
            </p>
            <p className="text-[10px] text-zinc-400 leading-tight">Administrator</p>
          </div>
        </div>

      </div>

    </header>
  );
}


