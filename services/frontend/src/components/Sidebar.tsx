import React from "react";
import { Button } from "@/components/ui/button";
import { 
  Activity, 
  GitBranch, 
  Sliders, 
  Users, 
  Zap, 
  ShieldCheck, 
  HardDrive, 
  ChevronLeft, 
  ChevronRight 
} from "lucide-react";

interface SidebarProps {
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (collapsed: boolean) => void;
  activeTab: string;
  setActiveTab: (tab: "overview" | "pipeline" | "configs" | "agents" | "traffic" | "security" | "resources") => void;
}

export function Sidebar({
  isSidebarCollapsed,
  setIsSidebarCollapsed,
  activeTab,
  setActiveTab,
}: SidebarProps) {
  return (
    <aside className={`bg-[#060908] border-r border-zinc-800/80 flex flex-col justify-between transition-all duration-300 shrink-0 z-30 ${isSidebarCollapsed ? "w-16" : "w-64"}`}>
      
      <div className="p-3 space-y-5">
        
        {/* GROUP 1: CORE DEVOPS */}
        <div>
          {!isSidebarCollapsed && (
            <div className="px-3 pb-2 text-[10px] font-mono tracking-wider text-zinc-500 uppercase font-semibold">
              Core Console
            </div>
          )}
          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab("overview")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-mono transition-all ${
                activeTab === "overview"
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold shadow-[0_0_15px_rgba(16,185,129,0.15)]"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-900/60 border border-transparent"
              }`}
              title="Overview & States"
            >
              <Activity className="w-4 h-4 shrink-0 text-emerald-400" />
              {!isSidebarCollapsed && <span className="truncate">Overview & States</span>}
            </button>
          </nav>
        </div>

        {/* GROUP 2: DELIVERY PIPELINE */}
        <div>
          {!isSidebarCollapsed && (
            <div className="px-3 pb-2 text-[10px] font-mono tracking-wider text-zinc-500 uppercase font-semibold">
              Delivery Pipeline
            </div>
          )}
          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab("pipeline")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-mono transition-all ${
                activeTab === "pipeline"
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold shadow-[0_0_15px_rgba(16,185,129,0.15)]"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-900/60 border border-transparent"
              }`}
              title="CI/QA Release Pipeline"
            >
              <GitBranch className="w-4 h-4 shrink-0 text-emerald-400" />
              {!isSidebarCollapsed && <span className="truncate">CI/QA Release Pipeline</span>}
            </button>

            <button
              onClick={() => setActiveTab("configs")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-mono transition-all ${
                activeTab === "configs"
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold shadow-[0_0_15px_rgba(16,185,129,0.15)]"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-900/60 border border-transparent"
              }`}
              title="Site Config Manager"
            >
              <Sliders className="w-4 h-4 shrink-0 text-emerald-400" />
              {!isSidebarCollapsed && <span className="truncate">Site Config Manager</span>}
            </button>
          </nav>
        </div>

        {/* GROUP 3: INFRASTRUCTURE SWARM & TRAFFIC */}
        <div>
          {!isSidebarCollapsed && (
            <div className="px-3 pb-2 text-[10px] font-mono tracking-wider text-zinc-500 uppercase font-semibold">
              Swarm & Monitoring
            </div>
          )}
          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab("agents")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-mono transition-all ${
                activeTab === "agents"
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold shadow-[0_0_15px_rgba(16,185,129,0.15)]"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-900/60 border border-transparent"
              }`}
              title="Edge Client Swarm"
            >
              <Users className="w-4 h-4 shrink-0 text-emerald-400" />
              {!isSidebarCollapsed && <span className="truncate">Client Agent Swarm</span>}
            </button>

            <button
              onClick={() => setActiveTab("traffic")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-mono transition-all ${
                activeTab === "traffic"
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold shadow-[0_0_15px_rgba(16,185,129,0.15)]"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-900/60 border border-transparent"
              }`}
              title="Live HTTP Traffic Stream"
            >
              <Zap className="w-4 h-4 shrink-0 text-emerald-400" />
              {!isSidebarCollapsed && <span className="truncate">Live HTTP Traffic</span>}
            </button>
          </nav>
        </div>

        {/* GROUP 4: GOVERNANCE & CATALOG */}
        <div>
          {!isSidebarCollapsed && (
            <div className="px-3 pb-2 text-[10px] font-mono tracking-wider text-zinc-500 uppercase font-semibold">
              Governance
            </div>
          )}
          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab("security")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-mono transition-all ${
                activeTab === "security"
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold shadow-[0_0_15px_rgba(16,185,129,0.15)]"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-900/60 border border-transparent"
              }`}
              title="Security & Patches"
            >
              <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400" />
              {!isSidebarCollapsed && <span className="truncate">Security & Patches</span>}
            </button>

            <button
              onClick={() => setActiveTab("resources")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-mono transition-all ${
                activeTab === "resources"
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold shadow-[0_0_15px_rgba(16,185,129,0.15)]"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-900/60 border border-transparent"
              }`}
              title="DevOps Infrastructure Catalog"
            >
              <HardDrive className="w-4 h-4 shrink-0 text-emerald-400" />
              {!isSidebarCollapsed && <span className="truncate">DevOps Catalog</span>}
            </button>
          </nav>
        </div>

      </div>

      {/* BOTTOM SIDEBAR FOOTER */}
      <div className="p-3 border-t border-zinc-900 flex items-center justify-between">
        {!isSidebarCollapsed && (
          <span className="text-[11px] font-mono text-zinc-500 truncate">
            GliTch Swarm v2.4
          </span>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-zinc-800/60 rounded-lg mx-auto"
        >
          {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </Button>
      </div>

    </aside>
  );
}
