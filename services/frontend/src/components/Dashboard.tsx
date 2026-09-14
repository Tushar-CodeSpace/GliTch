import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";
import { useWebSocket } from "@/lib/useWebSocket";

// Modular Page Components
import { OverviewPage } from "@/components/devops/OverviewPage";
import { ApplicationsPage } from "@/components/devops/ApplicationsPage";
import { ClientsPage } from "@/components/devops/ClientsPage";
import { PipelinePage } from "@/components/devops/PipelinePage";
import { BuildsPage } from "@/components/devops/BuildsPage";
import { DeploymentsPage } from "@/components/devops/DeploymentsPage";
import { QATestsPage } from "@/components/devops/QATestsPage";
import { MonitoringPage } from "@/components/devops/MonitoringPage";
import { LogsPage } from "@/components/devops/LogsPage";
import { ApprovalsPage } from "@/components/devops/ApprovalsPage";
import { ConfigManagerPage } from "@/components/devops/ConfigManagerPage";
import { AgentSwarmPage } from "@/components/devops/AgentSwarmPage";
import { TrafficMonitorPage } from "@/components/devops/TrafficMonitorPage";
import { SecurityAuditPage } from "@/components/devops/SecurityAuditPage";
import { CatalogPage } from "@/components/devops/CatalogPage";

export interface Item {
  id: number;
  title: string;
  description: string;
  category: string;
  created_at: string;
  status: string;
}

export interface HealthInfo {
  status: string;
  service: string;
  version: string;
  timestamp: number;
  python_version: string;
}

interface DashboardProps {
  userEmail: string;
  onLogout: () => void;
}

interface ActivityLog {
  id: string;
  time: string;
  type: string;
  title: string;
  status: string;
  details: string;
}

interface ClientAgent {
  id: string;
  name: string;
  site: string;
  ip: string;
  version: string;
  status: "ONLINE" | "PULLING" | "UPDATING" | "IDLE";
  lastSync: string;
  requestsPerSec: number;
}

export function Dashboard({ userEmail, onLogout }: DashboardProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("overview");

  // Real-Time WebSocket Hook
  const {
    isConnected,
    connectionStatus,
    telemetry,
    wsLatency,
    trafficLogs,
    subscribeEvent,
    sendEvent,
    reconnect
  } = useWebSocket();

  // App & Client Filters
  const [selectedApp, setSelectedApp] = useState("FinTech Core App");
  const [selectedSite, setSelectedSite] = useState("All Client Sites");

  const [health, setHealth] = useState<HealthInfo | null>(null);
  const [loadingHealth, setLoadingHealth] = useState(true);
  const [items, setItems] = useState<Item[]>([]);
  const [loadingItems, setLoadingItems] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedTelemetry, setCopiedTelemetry] = useState(false);
  
  // Pipeline & Approval States
  const [pipelineStep, setPipelineStep] = useState<number>(4);
  const [isApprovalGranted, setIsApprovalGranted] = useState<boolean>(false);
  const [deploying, setDeploying] = useState(false);
  const [deploySuccessMessage, setDeploySuccessMessage] = useState<string | null>(null);

  // Client Agent Swarm List
  const [agents, setAgents] = useState<ClientAgent[]>([
    {
      id: "agent-01",
      name: "GliTch Edge Agent #1",
      site: "Client Alpha (US-East)",
      ip: "10.0.4.12",
      version: "v2.4.0",
      status: "ONLINE",
      lastSync: "Just now",
      requestsPerSec: 1420
    },
    {
      id: "agent-02",
      name: "GliTch Edge Agent #2",
      site: "Client Beta (EU-West)",
      ip: "10.2.1.88",
      version: "v2.4.0",
      status: "ONLINE",
      lastSync: "Just now",
      requestsPerSec: 980
    },
    {
      id: "agent-03",
      name: "GliTch Edge Agent #3",
      site: "Client Gamma (AP-South)",
      ip: "10.5.12.3",
      version: "v2.4.0",
      status: "ONLINE",
      lastSync: "Just now",
      requestsPerSec: 2150
    }
  ]);

  // Form State for Catalog
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({ title: "", description: "", category: "Backend" });
  const [submitting, setSubmitting] = useState(false);

  // Ping Latency fallback
  const [latency, setLatency] = useState<number | null>(null);

  // Live DevOps Stream Log
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([
    {
      id: "log-1",
      time: "Just now",
      type: "approval",
      title: "QA Automation Passed (100% Score)",
      status: "approved",
      details: "QA Server (http://qa-auto.glitch.internal:9090) returned 412/412 tests passed."
    },
    {
      id: "log-2",
      time: "10 mins ago",
      type: "qa",
      title: "Site Config Bundles Prepared",
      status: "success",
      details: "Generated config-driven builds for Client Alpha, Beta, & Gamma."
    },
    {
      id: "log-3",
      time: "25 mins ago",
      type: "deployment",
      title: "Git Code Commit Pulled",
      status: "success",
      details: "Fetched commit #a98c1f2 from branch 'release/v2.4.0'."
    },
    {
      id: "log-4",
      time: "45 mins ago",
      type: "monitoring",
      title: "Client Edge Agent Heartbeat Verified",
      status: "healthy",
      details: "3 Edge Agents connected across US-East, EU-West, and AP-South."
    }
  ]);

  const fetchHealth = async () => {
    setLoadingHealth(true);
    const start = performance.now();
    try {
      const res = await fetch("/api/health");
      const data = await res.json();
      const end = performance.now();
      setLatency(Math.round(end - start));
      setHealth(data);
    } catch (err) {
      console.error("Health fetch failed:", err);
    } finally {
      setLoadingHealth(false);
    }
  };

  const fetchItems = async () => {
    setLoadingItems(true);
    try {
      const res = await fetch("/api/items");
      if (res.ok) {
        const data = await res.json();
        setItems(data);
      }
    } catch (err) {
      console.error("Items fetch failed:", err);
    } finally {
      setLoadingItems(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    fetchItems();
  }, []);

  // Listen for real-time WebSocket events across sessions
  useEffect(() => {
    const unsubscribe = subscribeEvent((event) => {
      if (event.type === "item_created" && event.item) {
        setItems(prev => {
          if (prev.some(i => i.id === event.item.id)) return prev;
          return [event.item, ...prev];
        });
      } else if (event.type === "item_deleted" && event.item_id) {
        setItems(prev => prev.filter(i => i.id !== event.item_id));
      } else if (event.type === "approval_granted") {
        setIsApprovalGranted(true);
        setPipelineStep(5);
        if (event.log) {
          setActivityLogs(prev => [event.log, ...prev]);
        }
      }
    });
    return unsubscribe;
  }, [subscribeEvent]);

  // Merge dynamic agent metrics when telemetry updates
  useEffect(() => {
    if (telemetry?.agents) {
      setAgents(prev => {
        return prev.map(existing => {
          const fresh = telemetry.agents.find(a => a.id === existing.id);
          if (fresh) {
            return {
              ...existing,
              requestsPerSec: fresh.requestsPerSec,
              lastSync: fresh.lastSync
            };
          }
          return existing;
        });
      });
    }
  }, [telemetry]);

  const handleGrantApproval = async () => {
    setIsApprovalGranted(true);
    setPipelineStep(5);
    const newLog: ActivityLog = {
      id: `log-${Date.now()}`,
      time: "Just now",
      type: "approval",
      title: "Production Release Approved",
      status: "approved",
      details: `Deployment approval granted by ${userEmail}. Ready for Edge Client Agent pull.`
    };
    setActivityLogs(prev => [newLog, ...prev]);

    try {
      await fetch("/api/pipeline/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_email: userEmail })
      });
    } catch (err) {
      console.error("Failed to notify backend approval:", err);
    }
  };

  const handleTriggerDeploy = () => {
    if (!isApprovalGranted) return;
    setDeploying(true);
    setDeploySuccessMessage(null);
    setTimeout(() => {
      setDeploying(false);
      setPipelineStep(6);
      setDeploySuccessMessage("Multi-Client Rollout Triggered! Edge Agents on Client Alpha, Beta, & Gamma are pulling build v2.4.0.");
      const deployLog: ActivityLog = {
        id: `log-${Date.now()}`,
        time: "Just now",
        type: "deployment",
        title: "Edge Client Agent Pull Initiated",
        status: "success",
        details: "Pushed update signal to 3 client edge agents. Rolling zero-downtime deployment active."
      };
      setActivityLogs(prev => [deployLog, ...prev]);

      setAgents(prev => prev.map(a => ({ ...a, status: "UPDATING", version: "v2.4.0" })));
      setTimeout(() => {
        setAgents(prev => prev.map(a => ({ ...a, status: "ONLINE" })));
      }, 3000);

    }, 1500);
  };

  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description) return;
    
    setSubmitting(true);
    try {
      const res = await fetch("/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        const newItem = await res.json();
        setItems(prev => {
          if (prev.some(i => i.id === newItem.id)) return prev;
          return [newItem, ...prev];
        });
        setFormData({ title: "", description: "", category: "Backend" });
        setShowAddForm(false);
      }
    } catch (err) {
      console.error("Failed to create item:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteItem = async (id: number) => {
    try {
      const res = await fetch(`/api/items/${id}`, { method: "DELETE" });
      if (res.ok) {
        setItems(prev => prev.filter(item => item.id !== id));
      }
    } catch (err) {
      console.error("Failed to delete item:", err);
    }
  };

  const handleCopyTelemetry = () => {
    const dataToCopy = telemetry || health;
    if (!dataToCopy) return;
    navigator.clipboard.writeText(JSON.stringify(dataToCopy, null, 2));
    setCopiedTelemetry(true);
    setTimeout(() => setCopiedTelemetry(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#050807] text-zinc-100 flex flex-col selection:bg-emerald-500 selection:text-black font-sans">
      
      {/* TOP NAVBAR */}
      <Navbar
        isSidebarCollapsed={isSidebarCollapsed}
        setIsSidebarCollapsed={setIsSidebarCollapsed}
        selectedApp={selectedApp}
        setSelectedApp={setSelectedApp}
        selectedSite={selectedSite}
        setSelectedSite={setSelectedSite}
        health={health}
        loadingHealth={loadingHealth}
        latency={latency}
        wsStatus={connectionStatus}
        wsLatency={wsLatency}
        userEmail={userEmail}
        onRefresh={() => { fetchHealth(); fetchItems(); reconnect(); }}
        onLogout={onLogout}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* BODY WITH COLLAPSIBLE SIDEBAR & MODULAR PAGES */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* SIDEBAR NAVIGATION */}
        <Sidebar
          isSidebarCollapsed={isSidebarCollapsed}
          setIsSidebarCollapsed={setIsSidebarCollapsed}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          userEmail={userEmail}
          onLogout={onLogout}
        />

        {/* MAIN WORKSPACE VIEW */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {activeTab === "overview" && (
            <OverviewPage
              health={health}
              telemetry={telemetry}
              latency={wsLatency ?? latency}
              selectedApp={selectedApp}
              selectedSite={selectedSite}
              activityLogs={activityLogs}
              onNavigateTab={(tab) => setActiveTab(tab as any)}
              onCopyTelemetry={handleCopyTelemetry}
              copiedTelemetry={copiedTelemetry}
            />
          )}

          {activeTab === "applications" && <ApplicationsPage />}

          {activeTab === "clients" && <ClientsPage />}

          {activeTab === "pipeline" && (
            <PipelinePage
              userEmail={userEmail}
              pipelineStep={pipelineStep}
              isApprovalGranted={isApprovalGranted}
              deploying={deploying}
              deploySuccessMessage={deploySuccessMessage}
              onGrantApproval={handleGrantApproval}
              onTriggerDeploy={handleTriggerDeploy}
            />
          )}

          {activeTab === "builds" && <BuildsPage />}

          {activeTab === "deployments" && <DeploymentsPage />}

          {activeTab === "qa" && <QATestsPage />}

          {activeTab === "monitoring" && <MonitoringPage />}

          {activeTab === "logs" && <LogsPage />}

          {activeTab === "approvals" && <ApprovalsPage />}

          {activeTab === "configs" && <ConfigManagerPage />}

          {activeTab === "agents" && <AgentSwarmPage agents={agents} />}

          {activeTab === "traffic" && (
            <TrafficMonitorPage
              trafficLogs={trafficLogs}
              requestsPerSec={telemetry?.requests_per_sec}
            />
          )}

          {activeTab === "security" && <SecurityAuditPage />}

          {activeTab === "resources" && (
            <CatalogPage
              items={items}
              onDeleteItem={handleDeleteItem}
              onCreateItem={handleCreateItem}
              showAddForm={showAddForm}
              setShowAddForm={setShowAddForm}
              formData={formData}
              setFormData={setFormData}
              submitting={submitting}
            />
          )}
        </main>

      </div>

    </div>
  );
}

