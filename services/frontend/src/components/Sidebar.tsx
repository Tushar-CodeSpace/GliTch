import React from "react";
import { 
  Home, 
  Grid, 
  Users, 
  GitBranch, 
  Layers, 
  Rocket, 
  CheckCircle2, 
  Bot, 
  Activity, 
  FileText, 
  ShieldCheck, 
  Settings, 
  LogOut,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

interface SidebarProps {
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (collapsed: boolean) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userEmail?: string;
  onLogout?: () => void;
}

export function Sidebar({
  isSidebarCollapsed,
  setIsSidebarCollapsed,
  activeTab,
  setActiveTab,
  userEmail = "Nido",
  onLogout,
}: SidebarProps) {

  const navItems = [
    { id: "overview", label: "Dashboard", icon: Home },
    { id: "applications", label: "Applications", icon: Grid },
    { id: "clients", label: "Clients", icon: Users },
    { id: "pipeline", label: "Pipelines", icon: GitBranch },
    { id: "builds", label: "Builds", icon: Layers },
    { id: "deployments", label: "Deployments", icon: Rocket },
    { id: "qa", label: "QA & Tests", icon: CheckCircle2 },
    { id: "agents", label: "Agents", icon: Bot },
    { id: "monitoring", label: "Monitoring", icon: Activity },
    { id: "logs", label: "Logs", icon: FileText },
    { id: "approvals", label: "Approvals", icon: ShieldCheck },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <aside className={`bg-[#050807] border-r border-zinc-800/60 flex flex-col justify-between transition-all duration-300 shrink-0 z-30 ${isSidebarCollapsed ? "w-16" : "w-60"}`}>
      
      {/* TOP BRAND HEADER */}
      <div>
        <div className="p-4 border-b border-zinc-800/40 flex items-center justify-between">
          {!isSidebarCollapsed ? (
            <div>
              <h1 className="text-xl font-black tracking-tight text-white flex items-center gap-1.5 font-sans">
                GliTch
              </h1>
              <p className="text-[9px] font-mono tracking-widest text-emerald-400 font-bold uppercase mt-0.5">
                ONE CONSOLE. EVERY DEPLOYMENT.
              </p>
            </div>
          ) : (
            <span className="text-lg font-black text-emerald-400 mx-auto">G</span>
          )}
        </div>

        {/* NAVIGATION LINKS LIST */}
        <nav className="p-2 space-y-0.5 mt-1 overflow-y-auto max-h-[calc(100vh-280px)]">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id || (activeTab === "overview" && item.id === "overview");
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? "bg-[#0b241c] text-emerald-300 font-semibold border-l-2 border-emerald-400"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50 border-l-2 border-transparent"
                }`}
                title={item.label}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-emerald-400" : "text-zinc-400"}`} />
                {!isSidebarCollapsed && <span className="truncate">{item.label}</span>}
              </button>
            );
          })}
        </nav>
      </div>

      {/* BOTTOM PROMO & USER PROFILE SECTION */}
      <div className="p-3 space-y-3">
        
        {/* Abstract Wavy Promo Card */}
        {!isSidebarCollapsed && (
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[#0a231b] via-[#061510] to-[#040c09] border border-emerald-500/20 p-3 text-left">
            <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />
            <svg className="absolute right-0 bottom-0 w-24 h-16 opacity-20 text-emerald-400" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="3">
              <path d="M0 80 Q 25 20, 50 80 T 100 20" />
            </svg>
            <p className="text-xs font-bold text-white leading-tight font-sans">
              Build<br />
              Deploy<br />
              Monitor<br />
              <span className="text-emerald-400">Everywhere.</span>
            </p>
          </div>
        )}

        {/* User Info Bar */}
        <div className="flex items-center justify-between p-2 rounded-xl bg-[#090d0b] border border-zinc-800/80">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-md">
              N
            </div>
            {!isSidebarCollapsed && (
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-white truncate">
                  {userEmail.includes("@") ? userEmail.split("@")[0] : userEmail}
                </p>
                <p className="text-[10px] text-zinc-400 truncate">Administrator</p>
              </div>
            )}
          </div>
          {!isSidebarCollapsed && onLogout && (
            <button 
              onClick={onLogout}
              className="text-zinc-400 hover:text-rose-400 p-1.5 rounded-lg hover:bg-zinc-800/50 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Sidebar Footer & Collapse Toggle */}
        <div className="flex items-center justify-between pt-1 px-1 text-[10px] font-mono text-zinc-600">
          {!isSidebarCollapsed && <span>GliTch v1.0.0</span>}
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="text-zinc-500 hover:text-zinc-300 p-1 rounded-md hover:bg-zinc-800/50 transition-colors mx-auto"
          >
            {isSidebarCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
          </button>
        </div>

      </div>

    </aside>
  );
}

