import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  Grid, 
  Globe, 
  Rocket, 
  Box, 
  ShieldCheck, 
  Plus,
  Loader2,
  Activity
} from "lucide-react";

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

export function OverviewPage({ onNavigateTab }: OverviewPageProps) {
  const [appsCount, setAppsCount] = useState(0);
  const [clientsCount, setClientsCount] = useState(0);
  const [deployments, setDeployments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const [appsRes, clientsRes, depsRes] = await Promise.all([
          fetch("http://127.0.0.1:8000/api/v1/applications"),
          fetch("http://127.0.0.1:8000/api/v1/clients"),
          fetch("http://127.0.0.1:8000/api/v1/deployments")
        ]);

        if (appsRes.ok) {
          const apps = await appsRes.json();
          setAppsCount(apps.length);
        }
        if (clientsRes.ok) {
          const clients = await clientsRes.json();
          setClientsCount(clients.length);
        }
        if (depsRes.ok) {
          const deps = await depsRes.json();
          setDeployments(deps);
        }
      } catch (err) {
        console.error("Error loading overview data:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="space-y-6 pb-8 font-sans text-zinc-100 selection:bg-emerald-500 selection:text-black">
      
      {/* 1. HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Activity className="w-6 h-6 text-emerald-400" />
            GliTch Control Plane Overview
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Centralized software delivery, client environments, CI/CD pipelines, and active Edge agent rollouts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            onClick={() => onNavigateTab?.("applications")}
            className="h-9 px-4 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Add Application
          </Button>
        </div>
      </div>

      {/* 2. METRICS CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="p-4 rounded-2xl bg-[#090d0b] border border-zinc-800/80 flex items-center gap-3">
          <div className="p-3 rounded-xl bg-blue-600/20 text-blue-400">
            <Grid className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-zinc-400">Applications</p>
            <p className="text-2xl font-black text-white">{appsCount}</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#090d0b] border border-zinc-800/80 flex items-center gap-3">
          <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-zinc-400">Client Accounts</p>
            <p className="text-2xl font-black text-white">{clientsCount}</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#090d0b] border border-zinc-800/80 flex items-center gap-3">
          <div className="p-3 rounded-xl bg-purple-500/20 text-purple-400">
            <Rocket className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-zinc-400">Deployments</p>
            <p className="text-2xl font-black text-white">{deployments.length}</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#090d0b] border border-zinc-800/80 flex items-center gap-3">
          <div className="p-3 rounded-xl bg-amber-500/20 text-amber-400">
            <Globe className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-zinc-400">Edge Agents</p>
            <p className="text-2xl font-black text-emerald-400">ONLINE</p>
          </div>
        </div>

      </div>

      {/* 3. RECENT DEPLOYMENTS LIST / EMPTY STATE */}
      <Card className="p-6 bg-[#090d0b] border-zinc-800/80 rounded-2xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Rocket className="w-5 h-5 text-emerald-400" />
            Recent Deployments
          </h3>
        </div>

        {isLoading ? (
          <div className="py-12 text-center text-zinc-400 font-mono text-xs flex flex-col items-center gap-2">
            <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" />
            Loading real-time telemetry from database...
          </div>
        ) : deployments.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <Box className="w-10 h-10 text-zinc-600 mx-auto" />
            <p className="text-sm text-zinc-400">No deployments recorded in the database yet.</p>
            <Button 
              onClick={() => onNavigateTab?.("applications")}
              variant="outline"
              className="h-8 text-xs border-zinc-800 text-emerald-400 hover:bg-emerald-500/10"
            >
              Add Application & Get Started
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-zinc-800/60 font-mono text-xs">
            {deployments.map((dep) => (
              <div key={dep.id} className="py-3 flex items-center justify-between">
                <div>
                  <p className="text-white font-bold">{dep.app_name} ({dep.target_version})</p>
                  <p className="text-zinc-500 text-[10px]">Site: {dep.site_name} &bull; Client: {dep.client_name}</p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                  {dep.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>

    </div>
  );
}
