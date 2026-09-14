import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  Grid, 
  Globe, 
  PlayCircle, 
  Rocket, 
  CheckCircle2, 
  GitCommit, 
  Settings, 
  FlaskConical, 
  Box, 
  ShieldCheck, 
  Clock, 
  GitBranch, 
  MoreHorizontal,
  ChevronDown,
  ArrowRight
} from "lucide-react";
import mountainBg from "@/assets/deploy_mountain_bg.jpg";

interface OverviewPageProps {
  health?: any;
  telemetry?: any;
  latency?: number | null;
  selectedApp?: string;
  selectedSite?: string;
  activityLogs?: any[];
  onNavigateTab?: (tab: string) => void;
  onCopyTelemetry?: () => void;
  copiedTelemetry?: boolean;
}

export function OverviewPage({
  onNavigateTab
}: OverviewPageProps) {

  // Stacked Bar Chart Data (Sep 1 - Sep 13)
  const barChartData = [
    { date: "Sep 1", success: 18, failed: 4, progress: 2 },
    { date: "Sep 2", success: 12, failed: 2, progress: 3 },
    { date: "Sep 3", success: 22, failed: 5, progress: 1 },
    { date: "Sep 4", success: 15, failed: 3, progress: 4 },
    { date: "Sep 5", success: 28, failed: 2, progress: 2 },
    { date: "Sep 6", success: 19, failed: 6, progress: 3 },
    { date: "Sep 7", success: 25, failed: 1, progress: 2 },
    { date: "Sep 8", success: 14, failed: 4, progress: 5 },
    { date: "Sep 9", success: 17, failed: 2, progress: 1 },
    { date: "Sep 10", success: 21, failed: 3, progress: 3 },
    { date: "Sep 11", success: 23, failed: 4, progress: 2 },
    { date: "Sep 12", success: 16, failed: 2, progress: 4 },
    { date: "Sep 13", success: 24, failed: 3, progress: 2 },
  ];

  // Table Data
  const recentDeployments = [
    {
      id: "#1024",
      app: "Ecom Pro",
      appColor: "bg-indigo-600",
      client: "BlueDart",
      version: "v2.4.1",
      env: "Production",
      envType: "production",
      status: "Success",
      statusType: "success",
      time: "12 Sep 2026, 10:12"
    },
    {
      id: "#1023",
      app: "LogTrack",
      appColor: "bg-purple-600",
      client: "MedPlus",
      version: "v1.8.0",
      env: "Staging",
      envType: "staging",
      status: "In Progress",
      statusType: "progress",
      time: "12 Sep 2026, 09:50"
    },
    {
      id: "#1022",
      app: "RetailApp",
      appColor: "bg-amber-600",
      client: "RetailMax",
      version: "v3.2.0",
      env: "Production",
      envType: "production",
      status: "Pending Approval",
      statusType: "pending",
      time: "12 Sep 2026, 09:10"
    },
    {
      id: "#1021",
      app: "PharmaSuite",
      appColor: "bg-teal-600",
      client: "MedPlus",
      version: "v1.5.3",
      env: "Production",
      envType: "production",
      status: "Success",
      statusType: "success",
      time: "11 Sep 2026, 23:10"
    },
    {
      id: "#1020",
      app: "EduPortal",
      appColor: "bg-rose-600",
      client: "EduCare",
      version: "v2.1.0",
      env: "Staging",
      envType: "staging",
      status: "Failed",
      statusType: "failed",
      time: "11 Sep 2026, 19:45"
    }
  ];

  return (
    <div className="space-y-5 pb-8 font-sans text-zinc-100 selection:bg-emerald-500 selection:text-black">
      
      {/* 1. GREETING HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            Good Morning, Nido! 👋
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Here's what's happening across all your clients and deployments.
          </p>
        </div>
        <div className="text-xs font-mono text-zinc-400 bg-[#090d0b] px-3 py-1.5 rounded-xl border border-zinc-800/80 shrink-0">
          Fri, 12 Sep 2026 &bull; 10:24 AM
        </div>
      </div>

      {/* 2. TOP METRICS ROW (6 Cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
        
        {/* Clients */}
        <div className="p-3.5 rounded-2xl bg-[#090d0b] border border-zinc-800/80 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-600/20 text-blue-400 shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-zinc-400 font-medium">Clients</p>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl font-black text-white">12</span>
              <span className="text-[10px] text-emerald-400 font-semibold">↑ +2 this month</span>
            </div>
          </div>
        </div>

        {/* Applications */}
        <div className="p-3.5 rounded-2xl bg-[#090d0b] border border-zinc-800/80 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-600/20 text-purple-400 shrink-0">
            <Grid className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-zinc-400 font-medium">Applications</p>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl font-black text-white">8</span>
              <span className="text-[10px] text-emerald-400 font-semibold">&bull; Active</span>
            </div>
          </div>
        </div>

        {/* Total Sites */}
        <div className="p-3.5 rounded-2xl bg-[#090d0b] border border-zinc-800/80 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-teal-600/20 text-teal-400 shrink-0">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-zinc-400 font-medium">Total Sites</p>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl font-black text-white">48</span>
            </div>
            <p className="text-[10px] text-zinc-500">Across all clients</p>
          </div>
        </div>

        {/* Running Pipelines */}
        <div className="p-3.5 rounded-2xl bg-[#090d0b] border border-zinc-800/80 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-500/20 text-blue-400 shrink-0">
            <PlayCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-zinc-400 font-medium">Running Pipelines</p>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl font-black text-white">6 / 12</span>
            </div>
            <p className="text-[10px] text-blue-400 font-semibold">6 in progress</p>
          </div>
        </div>

        {/* Deployments (30d) */}
        <div className="p-3.5 rounded-2xl bg-[#090d0b] border border-zinc-800/80 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 shrink-0">
            <Rocket className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-zinc-400 font-medium">Deployments (30d)</p>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl font-black text-white">126</span>
              <span className="text-[10px] text-emerald-400 font-semibold">↑ 18%</span>
            </div>
          </div>
        </div>

        {/* Test Pass Rate */}
        <div className="p-3.5 rounded-2xl bg-[#090d0b] border border-zinc-800/80 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-zinc-400 font-medium">Test Pass Rate</p>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl font-black text-white">92%</span>
              <span className="text-[10px] text-emerald-400 font-semibold">↑ 6%</span>
            </div>
          </div>
        </div>

      </div>

      {/* 3. MIDDLE SECTION: PIPELINE OVERVIEW & RECENT ACTIVITY */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Deployment Pipeline Overview (2 Columns Wide) */}
        <Card className="lg:col-span-2 bg-[#090d0b] border-zinc-800/80 p-5 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Deployment Pipeline Overview</h3>
              <p className="text-xs text-zinc-400">From code to customer &mdash; fully automated, fully visible.</p>
            </div>
            <button 
              onClick={() => onNavigateTab && onNavigateTab("pipeline")}
              className="px-3 py-1.5 rounded-xl border border-blue-500/30 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 text-xs font-medium transition-colors"
            >
              View All Pipelines &rarr;
            </button>
          </div>

          {/* Stepper Pipeline Flow */}
          <div className="py-6 overflow-x-auto">
            <div className="flex items-center justify-between min-w-[600px] px-2">
              
              {/* Step 1: Code Commit */}
              <div className="flex flex-col items-center text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-blue-600/20 border-2 border-blue-500 text-blue-400 flex items-center justify-center shadow-lg shadow-blue-500/10">
                  <GitCommit className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">1. Code Commit</p>
                  <p className="text-[10px] text-zinc-400">From Git</p>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Auto Triggered
                </span>
              </div>

              <ArrowRight className="w-4 h-4 text-zinc-600 shrink-0" />

              {/* Step 2: CI */}
              <div className="flex flex-col items-center text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-purple-600/20 border-2 border-purple-500 text-purple-400 flex items-center justify-center shadow-lg shadow-purple-500/10">
                  <Settings className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">2. CI</p>
                  <p className="text-[10px] text-zinc-400">Build & Lint</p>
                </div>
                <span className="text-[10px] text-zinc-500 font-mono">~ 5 min</span>
              </div>

              <ArrowRight className="w-4 h-4 text-zinc-600 shrink-0" />

              {/* Step 3: QA */}
              <div className="flex flex-col items-center text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-teal-600/20 border-2 border-teal-500 text-teal-400 flex items-center justify-center shadow-lg shadow-teal-500/10">
                  <FlaskConical className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">3. QA</p>
                  <p className="text-[10px] text-zinc-400">Automated Tests</p>
                </div>
                <span className="text-[10px] text-zinc-500 font-mono">~ 10 min</span>
              </div>

              <ArrowRight className="w-4 h-4 text-zinc-600 shrink-0" />

              {/* Step 4: Build */}
              <div className="flex flex-col items-center text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-amber-600/20 border-2 border-amber-500 text-amber-400 flex items-center justify-center shadow-lg shadow-amber-500/10">
                  <Box className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">4. Build</p>
                  <p className="text-[10px] text-zinc-400">Prepare for Sites</p>
                </div>
                <span className="text-[10px] text-zinc-500 font-mono">~ 8 min</span>
              </div>

              <ArrowRight className="w-4 h-4 text-zinc-600 shrink-0" />

              {/* Step 5: Approval */}
              <div className="flex flex-col items-center text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-rose-600/20 border-2 border-rose-500 text-rose-400 flex items-center justify-center shadow-lg shadow-rose-500/10">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">5. Approval</p>
                  <p className="text-[10px] text-zinc-400">Manual / Auto</p>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Pending
                </span>
              </div>

              <ArrowRight className="w-4 h-4 text-zinc-600 shrink-0" />

              {/* Step 6: Deploy */}
              <div className="flex flex-col items-center text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-blue-500/20 border-2 border-blue-400 text-blue-300 flex items-center justify-center shadow-lg shadow-blue-400/10">
                  <Rocket className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">6. Deploy</p>
                  <p className="text-[10px] text-zinc-400">To Sites</p>
                </div>
                <span className="text-[10px] text-zinc-500 font-mono">~ 5 min</span>
              </div>

            </div>
          </div>
        </Card>

        {/* Recent Activity Card */}
        <Card className="bg-[#090d0b] border-zinc-800/80 p-5 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-bold text-white">Recent Activity</h3>
            <button className="text-xs text-blue-400 hover:underline">View All</button>
          </div>

          <div className="space-y-3">
            
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="p-1 rounded-full bg-emerald-500/20 text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <span className="text-zinc-200 truncate">Build completed &mdash; Ecom Pro v2.4.1</span>
              </div>
              <span className="text-[10px] text-zinc-500 shrink-0">2 min ago</span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="p-1 rounded-full bg-emerald-500/20 text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <span className="text-zinc-200 truncate">QA tests passed &mdash; LogTrack</span>
              </div>
              <span className="text-[10px] text-zinc-500 shrink-0">12 min ago</span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="p-1 rounded-full bg-blue-500/20 text-blue-400">
                  <Rocket className="w-3.5 h-3.5" />
                </div>
                <span className="text-zinc-200 truncate">Deployment started &mdash; PharmaSuite (Client: MedPlus)</span>
              </div>
              <span className="text-[10px] text-zinc-500 shrink-0">28 min ago</span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="p-1 rounded-full bg-amber-500/20 text-amber-400">
                  <Clock className="w-3.5 h-3.5" />
                </div>
                <span className="text-zinc-200 truncate">Approval pending &mdash; RetailApp v3.2.0</span>
              </div>
              <span className="text-[10px] text-zinc-500 shrink-0">1 hour ago</span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="p-1 rounded-full bg-purple-500/20 text-purple-400">
                  <GitBranch className="w-3.5 h-3.5" />
                </div>
                <span className="text-zinc-200 truncate">New commit pushed &mdash; EduPortal</span>
              </div>
              <span className="text-[10px] text-zinc-500 shrink-0">2 hours ago</span>
            </div>

          </div>
        </Card>

      </div>

      {/* 4. THIRD GRID SECTION: CHARTS, HEALTH & DEPLOY PROMO */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        
        {/* Panel 1: Deployments Trend Bar Chart */}
        <Card className="bg-[#090d0b] border-zinc-800/80 p-4 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-bold text-white">Deployments Trend</h4>
            <div className="flex items-center gap-1 text-[11px] text-zinc-400 bg-[#060908] px-2 py-0.5 rounded-lg border border-zinc-800">
              <span>Last 14 days</span>
              <ChevronDown className="w-3 h-3" />
            </div>
          </div>

          <div className="flex items-center gap-3 text-[10px] text-zinc-400 mb-3">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400" /> Successful</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-500" /> Failed</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-400" /> In Progress</span>
          </div>

          {/* SVG Bar Chart */}
          <div className="h-32 w-full flex items-end justify-between gap-1 pt-2">
            {barChartData.map((d, i) => {
              const maxVal = 35;
              const sHeight = (d.success / maxVal) * 100;
              const fHeight = (d.failed / maxVal) * 100;
              const pHeight = (d.progress / maxVal) * 100;

              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                  <div className="w-full max-w-[12px] flex flex-col gap-0.5 items-center justify-end rounded-t overflow-hidden">
                    <div style={{ height: `${sHeight}%` }} className="w-full bg-emerald-400" />
                    <div style={{ height: `${fHeight}%` }} className="w-full bg-rose-500" />
                    <div style={{ height: `${pHeight}%` }} className="w-full bg-blue-400" />
                  </div>
                  {i % 2 === 0 && <span className="text-[8px] text-zinc-500 font-mono">{d.date.replace("Sep ", "")}</span>}
                </div>
              );
            })}
          </div>
        </Card>

        {/* Panel 2: Test Results Donut Chart */}
        <Card className="bg-[#090d0b] border-zinc-800/80 p-4 rounded-2xl flex flex-col justify-between">
          <h4 className="text-sm font-bold text-white mb-2">Test Results <span className="text-xs font-normal text-zinc-400">(Last 30 Days)</span></h4>
          
          <div className="flex items-center justify-between py-2">
            
            {/* SVG Donut */}
            <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-zinc-800"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-emerald-400"
                  strokeDasharray="92, 100"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-base font-black text-white leading-none">92%</span>
                <span className="text-[9px] text-zinc-400 leading-tight">Pass Rate</span>
              </div>
            </div>

            {/* Donut Legend */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between gap-4">
                <span className="flex items-center gap-1.5 text-zinc-300">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" /> Passed
                </span>
                <span className="font-bold text-white font-mono">1,240</span>
              </div>

              <div className="flex items-center justify-between gap-4">
                <span className="flex items-center gap-1.5 text-zinc-300">
                  <span className="w-2 h-2 rounded-full bg-rose-500" /> Failed
                </span>
                <span className="font-bold text-white font-mono">78</span>
              </div>

              <div className="flex items-center justify-between gap-4">
                <span className="flex items-center gap-1.5 text-zinc-300">
                  <span className="w-2 h-2 rounded-full bg-indigo-400" /> Skipped
                </span>
                <span className="font-bold text-white font-mono">32</span>
              </div>
            </div>

          </div>
        </Card>

        {/* Panel 3: System Health */}
        <Card className="bg-[#090d0b] border-zinc-800/80 p-4 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-bold text-white">System Health</h4>
            <button className="text-xs text-blue-400 hover:underline">View Details</button>
          </div>

          <div className="space-y-2 text-xs">
            
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-zinc-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400" /> CI Server
              </span>
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">Healthy</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-zinc-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400" /> QA Server
              </span>
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">Healthy</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-zinc-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400" /> Build Server
              </span>
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">Healthy</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-zinc-300">
                <span className="w-2 h-2 rounded-full bg-amber-400" /> Agent Network
              </span>
              <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 text-[10px] font-bold">2 Offline</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-zinc-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400" /> Monitoring
              </span>
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">Healthy</span>
            </div>

          </div>
        </Card>

        {/* Panel 4: Deploy With Confidence Promo Card */}
        <Card className="relative overflow-hidden bg-[#090d0b] border-zinc-800/80 p-5 rounded-2xl flex flex-col justify-between min-h-[160px]">
          <img 
            src={mountainBg} 
            alt="Mountain Background" 
            className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-luminosity pointer-events-none" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#090d0b] via-[#090d0b]/80 to-transparent pointer-events-none" />

          <div className="relative z-10 space-y-1">
            <h3 className="text-lg font-black text-white">Deploy With Confidence</h3>
            <p className="text-xs text-zinc-300">From code to customer, all in one place.</p>
          </div>

          <div className="relative z-10 pt-4">
            <Button className="w-auto h-9 px-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-500/25">
              Create Deployment &rarr;
            </Button>
          </div>
        </Card>

      </div>

      {/* 5. FOURTH SECTION: RECENT DEPLOYMENTS TABLE */}
      <Card className="bg-[#090d0b] border-zinc-800/80 p-5 rounded-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-white">Recent Deployments</h3>
          <button className="text-xs text-blue-400 hover:underline">View All &rarr;</button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-sans text-xs">
            <thead>
              <tr className="border-b border-zinc-800/80 text-zinc-400 font-medium">
                <th className="pb-3 font-semibold">#</th>
                <th className="pb-3 font-semibold">Application</th>
                <th className="pb-3 font-semibold">Client</th>
                <th className="pb-3 font-semibold">Version</th>
                <th className="pb-3 font-semibold">Environment</th>
                <th className="pb-3 font-semibold">Status</th>
                <th className="pb-3 font-semibold">Deployed At</th>
                <th className="pb-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/40">
              {recentDeployments.map((row) => (
                <tr key={row.id} className="hover:bg-zinc-900/40 transition-colors">
                  <td className="py-3 text-zinc-400 font-mono">{row.id}</td>
                  
                  <td className="py-3 font-semibold text-white">
                    <div className="flex items-center gap-2">
                      <div className={`w-5 h-5 rounded ${row.appColor} flex items-center justify-center text-[10px] text-white font-bold`}>
                        {row.app[0]}
                      </div>
                      <span>{row.app}</span>
                    </div>
                  </td>

                  <td className="py-3 text-zinc-300">{row.client}</td>
                  
                  <td className="py-3 text-zinc-400 font-mono">{row.version}</td>

                  <td className="py-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                      row.envType === "production" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                    }`}>
                      {row.env}
                    </span>
                  </td>

                  <td className="py-3">
                    <span className="flex items-center gap-1.5 font-medium">
                      {row.statusType === "success" && (
                        <>
                          <span className="w-2 h-2 rounded-full bg-emerald-400" />
                          <span className="text-emerald-400">Success</span>
                        </>
                      )}
                      {row.statusType === "progress" && (
                        <>
                          <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                          <span className="text-blue-400">In Progress</span>
                        </>
                      )}
                      {row.statusType === "pending" && (
                        <>
                          <span className="w-2 h-2 rounded-full bg-amber-400" />
                          <span className="text-amber-300">Pending Approval</span>
                        </>
                      )}
                      {row.statusType === "failed" && (
                        <>
                          <span className="w-2 h-2 rounded-full bg-rose-500" />
                          <span className="text-rose-400">Failed</span>
                        </>
                      )}
                    </span>
                  </td>

                  <td className="py-3 text-zinc-400 font-mono text-[11px]">{row.time}</td>

                  <td className="py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="px-2.5 py-1 rounded-lg border border-blue-500/30 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 text-[11px] font-medium transition-colors">
                        View
                      </button>
                      <button className="p-1 rounded text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/60">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* 6. FOOTER */}
      <div className="pt-2 flex items-center justify-between text-[11px] text-zinc-500 font-mono">
        <span>GliTch v1.0.0</span>
        <span>Tech &bull; Tools &bull; Tomorrow</span>
      </div>

    </div>
  );
}


