import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  Globe, 
  Box, 
  Pause, 
  Search, 
  SlidersHorizontal, 
  Plus, 
  Eye, 
  Pencil, 
  MoreHorizontal, 
  Rocket, 
  CheckCircle2, 
  LayoutGrid, 
  Table as TableIcon,
  ChevronLeft,
  ChevronRight,
  ChevronDown
} from "lucide-react";

interface Client {
  id: string;
  name: string;
  code: string;
  industry: string;
  sites: number;
  apps: number;
  status: "Active" | "Inactive";
  createdAt: string;
  avatarColor: string;
  tagline: string;
  description: string;
  email: string;
  contactPerson: string;
  phone: string;
  address: string;
  activeDeployments: number;
  successRate: number;
}

export function ClientsPage() {
  const clientsData: Client[] = [
    {
      id: "#001",
      name: "BlueDart",
      code: "BLU",
      industry: "Logistics",
      sites: 8,
      apps: 4,
      status: "Active",
      createdAt: "12 Jan 2025",
      avatarColor: "bg-blue-600",
      tagline: "Logistics solutions for a connected world.",
      description: "End-to-end logistics and supply chain solutions.",
      email: "it@bluedart.com",
      contactPerson: "Rakesh Sharma",
      phone: "+91 98765 43210",
      address: "BlueDart House, Andheri (E), Mumbai, Maharashtra - 400093, India",
      activeDeployments: 2,
      successRate: 96
    },
    {
      id: "#002",
      name: "MedPlus",
      code: "MED",
      industry: "Healthcare",
      sites: 6,
      apps: 4,
      status: "Active",
      createdAt: "18 Jan 2025",
      avatarColor: "bg-rose-600",
      tagline: "Integrated healthcare and pharmaceutical network.",
      description: "Healthcare logistics and medicine delivery platform.",
      email: "ops@medplus.com",
      contactPerson: "Dr. Ananya Roy",
      phone: "+91 98123 45678",
      address: "MedPlus Towers, HITEC City, Hyderabad - 500081, India",
      activeDeployments: 1,
      successRate: 98
    },
    {
      id: "#003",
      name: "RetailMax",
      code: "RTL",
      industry: "Retail",
      sites: 10,
      apps: 3,
      status: "Active",
      createdAt: "25 Jan 2025",
      avatarColor: "bg-purple-600",
      tagline: "Omnichannel retail platform for fashion & lifestyle.",
      description: "Enterprise retail point-of-sale and inventory platform.",
      email: "tech@retailmax.com",
      contactPerson: "Vikram Mehta",
      phone: "+91 99887 66554",
      address: "RetailMax Plaza, MG Road, Bengaluru - 560001, India",
      activeDeployments: 3,
      successRate: 94
    },
    {
      id: "#004",
      name: "EduCare",
      code: "EDU",
      industry: "Education",
      sites: 4,
      apps: 3,
      status: "Active",
      createdAt: "02 Feb 2025",
      avatarColor: "bg-emerald-600",
      tagline: "Smart learning portals and university management.",
      description: "EdTech infrastructure and online examination portal.",
      email: "admin@educare.org",
      contactPerson: "Sarah Jenkins",
      phone: "+91 97654 32109",
      address: "EduCare Campus, Salt Lake, Kolkata - 700091, India",
      activeDeployments: 1,
      successRate: 99
    },
    {
      id: "#005",
      name: "FinServe",
      code: "FIN",
      industry: "Finance",
      sites: 6,
      apps: 2,
      status: "Active",
      createdAt: "10 Feb 2025",
      avatarColor: "bg-[#0284c7]",
      tagline: "High-frequency core banking & payment processing.",
      description: "Banking API gateway and fraud detection engine.",
      email: "support@finserve.net",
      contactPerson: "Arjun Verma",
      phone: "+91 96543 21098",
      address: "FinServe Capital Center, BKC, Mumbai - 400051, India",
      activeDeployments: 2,
      successRate: 97
    },
    {
      id: "#006",
      name: "PharmaLink",
      code: "PHR",
      industry: "Pharma",
      sites: 5,
      apps: 3,
      status: "Active",
      createdAt: "15 Feb 2025",
      avatarColor: "bg-indigo-600",
      tagline: "Global clinical research and supply tracking.",
      description: "Pharmaceutical cold-chain logistics and compliance tracker.",
      email: "dev@pharmalink.com",
      contactPerson: "Priya Nair",
      phone: "+91 95432 10987",
      address: "PharmaLink Hub, Cyber City, Gurugram - 122002, India",
      activeDeployments: 1,
      successRate: 95
    },
    {
      id: "#007",
      name: "HealthPoint",
      code: "HP",
      industry: "Healthcare",
      sites: 4,
      apps: 2,
      status: "Active",
      createdAt: "20 Feb 2025",
      avatarColor: "bg-rose-500",
      tagline: "Telemedicine and patient record management.",
      description: "Cloud EHR and hospital queue system.",
      email: "contact@healthpoint.io",
      contactPerson: "Dr. K. S. Rao",
      phone: "+91 94321 09876",
      address: "HealthPoint HQ, Anna Salai, Chennai - 600002, India",
      activeDeployments: 0,
      successRate: 92
    },
    {
      id: "#008",
      name: "QuickMart",
      code: "QMT",
      industry: "Retail",
      sites: 3,
      apps: 2,
      status: "Inactive",
      createdAt: "01 Mar 2025",
      avatarColor: "bg-amber-600",
      tagline: "Instant grocery & quick commerce engine.",
      description: "Hyper-local delivery dispatch and inventory sync.",
      email: "tech@quickmart.in",
      contactPerson: "Deepak Patel",
      phone: "+91 93210 98765",
      address: "QuickMart Hub, Okhla Phase III, New Delhi - 110020, India",
      activeDeployments: 0,
      successRate: 88
    },
    {
      id: "#009",
      name: "LogiTrack",
      code: "LOG",
      industry: "Logistics",
      sites: 5,
      apps: 3,
      status: "Active",
      createdAt: "05 Mar 2025",
      avatarColor: "bg-blue-500",
      tagline: "Real-time fleet telematics & route optimization.",
      description: "GPS tracking and driver dispatch cloud service.",
      email: "cloud@logitrack.com",
      contactPerson: "Siddharth Das",
      phone: "+91 92109 87654",
      address: "LogiTrack Tech Park, Hadapsar, Pune - 411028, India",
      activeDeployments: 1,
      successRate: 96
    },
    {
      id: "#010",
      name: "Ecom Pro",
      code: "ECO",
      industry: "E-commerce",
      sites: 7,
      apps: 4,
      status: "Active",
      createdAt: "12 Mar 2025",
      avatarColor: "bg-teal-600",
      tagline: "Global multi-vendor marketplace platform.",
      description: "High-scale checkout system with multi-currency support.",
      email: "engineering@ecompro.com",
      contactPerson: "Neha Kapoor",
      phone: "+91 91098 76543",
      address: "Ecom Pro Tech Tower, Sector 62, Noida - 201309, India",
      activeDeployments: 2,
      successRate: 97
    }
  ];

  const [selectedClient, setSelectedClient] = useState<Client>(clientsData[0]);
  const [searchQuery, setSearchQuery] = useState("");
  const [industryFilter, setIndustryFilter] = useState("All Industries");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [selectedTab, setSelectedTab] = useState<"overview" | "sites" | "apps" | "deployments" | "settings">("overview");

  // Filtering
  const filteredClients = clientsData.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          client.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          client.industry.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesIndustry = industryFilter === "All Industries" || client.industry === industryFilter;
    const matchesStatus = statusFilter === "All Status" || client.status === statusFilter;
    return matchesSearch && matchesIndustry && matchesStatus;
  });

  return (
    <div className="space-y-5 pb-8 font-sans text-zinc-100 selection:bg-emerald-500 selection:text-black">
      
      {/* 1. HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-6 h-6 text-emerald-400" />
            <h2 className="text-xl font-bold text-white tracking-tight">Clients</h2>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Manage your clients, their sites, configurations and deployments.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs font-mono text-zinc-500">
            Home &gt; <span className="text-zinc-300">Clients</span>
          </div>
          <Button className="h-9 px-4 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-1.5">
            <Plus className="w-4 h-4" />
            New Client
          </Button>
        </div>
      </div>

      {/* 2. TOP METRICS CARDS ROW (4 Cards) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        
        {/* Total Clients */}
        <div className="p-3.5 rounded-2xl bg-[#090d0b] border border-zinc-800/80 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-600/20 text-blue-400 shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-zinc-400 font-medium">Total Clients</p>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl font-black text-white">12</span>
              <span className="text-[10px] text-emerald-400 font-semibold">↑ +2 this month</span>
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

        {/* Active Clients */}
        <div className="p-3.5 rounded-2xl bg-[#090d0b] border border-zinc-800/80 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-purple-600/20 text-purple-400 shrink-0">
            <Box className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-zinc-400 font-medium">Active Clients</p>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl font-black text-white">10</span>
              <span className="text-[10px] text-zinc-400">83% of total</span>
            </div>
          </div>
        </div>

        {/* Inactive Clients */}
        <div className="p-3.5 rounded-2xl bg-[#090d0b] border border-zinc-800/80 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-rose-600/20 text-rose-400 shrink-0">
            <Pause className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-zinc-400 font-medium">Inactive Clients</p>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-xl font-black text-white">2</span>
              <span className="text-[10px] text-zinc-400">17% of total</span>
            </div>
          </div>
        </div>

      </div>

      {/* 3. MAIN SPLIT VIEW (TABLE LIST + CLIENT DETAILS PANEL) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        
        {/* LEFT COLUMN: CLIENTS TABLE (7 Columns Wide on XL) */}
        <Card className="xl:col-span-7 bg-[#090d0b] border-zinc-800/80 p-4 rounded-2xl flex flex-col justify-between space-y-4">
          
          <div>
            {/* SEARCH & FILTERS BAR */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              
              <div className="relative flex-1 min-w-[180px]">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input 
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search clients by name, code, industry..."
                  className="w-full h-8 pl-8 pr-3 bg-[#060908] border border-zinc-800/80 rounded-xl text-xs text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500/50"
                />
              </div>

              <select 
                value={industryFilter}
                onChange={(e) => setIndustryFilter(e.target.value)}
                className="h-8 px-2.5 bg-[#060908] border border-zinc-800/80 rounded-xl text-xs text-zinc-300 focus:outline-none cursor-pointer"
              >
                <option value="All Industries">All Industries</option>
                <option value="Logistics">Logistics</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Retail">Retail</option>
                <option value="Education">Education</option>
                <option value="Finance">Finance</option>
              </select>

              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-8 px-2.5 bg-[#060908] border border-zinc-800/80 rounded-xl text-xs text-zinc-300 focus:outline-none cursor-pointer"
              >
                <option value="All Status">All Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>

              <div className="h-8 px-2.5 bg-[#060908] border border-zinc-800/80 rounded-xl text-xs text-zinc-300 flex items-center gap-1 cursor-pointer">
                <span>Sort by: Name (A-Z)</span>
                <ChevronDown className="w-3 h-3 text-zinc-500" />
              </div>

              <button className="h-8 w-8 bg-[#060908] border border-zinc-800/80 rounded-xl flex items-center justify-center text-zinc-400 hover:text-white">
                <SlidersHorizontal className="w-3.5 h-3.5" />
              </button>

            </div>

            {/* CLIENTS TABLE */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs font-sans">
                <thead>
                  <tr className="border-b border-zinc-800/80 text-zinc-500 font-medium">
                    <th className="pb-2.5 font-semibold">#</th>
                    <th className="pb-2.5 font-semibold">Client</th>
                    <th className="pb-2.5 font-semibold">Code</th>
                    <th className="pb-2.5 font-semibold">Industry</th>
                    <th className="pb-2.5 font-semibold">Sites</th>
                    <th className="pb-2.5 font-semibold">Applications</th>
                    <th className="pb-2.5 font-semibold">Status</th>
                    <th className="pb-2.5 font-semibold">Created At</th>
                    <th className="pb-2.5 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/30">
                  {filteredClients.map((client) => {
                    const isSelected = selectedClient.id === client.id;
                    return (
                      <tr 
                        key={client.id}
                        onClick={() => setSelectedClient(client)}
                        className={`cursor-pointer transition-colors ${
                          isSelected ? "bg-[#0d1c16] border-l-2 border-emerald-400" : "hover:bg-zinc-900/40"
                        }`}
                      >
                        <td className="py-2.5 text-zinc-500 font-mono">{client.id}</td>
                        <td className="py-2.5 font-semibold text-white">
                          <div className="flex items-center gap-2">
                            <div className={`w-6 h-6 rounded-lg ${client.avatarColor} text-white font-bold text-[10px] flex items-center justify-center shrink-0`}>
                              {client.name.substring(0, 2).toUpperCase()}
                            </div>
                            <span>{client.name}</span>
                          </div>
                        </td>
                        <td className="py-2.5 text-zinc-400 font-mono">{client.code}</td>
                        <td className="py-2.5 text-zinc-400">{client.industry}</td>
                        <td className="py-2.5 text-zinc-200 font-mono">{client.sites}</td>
                        <td className="py-2.5 text-zinc-200 font-mono">{client.apps}</td>
                        <td className="py-2.5">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold flex items-center gap-1 w-fit ${
                            client.status === "Active" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-zinc-800 text-zinc-400"
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${client.status === "Active" ? "bg-emerald-400" : "bg-zinc-500"}`} />
                            {client.status}
                          </span>
                        </td>
                        <td className="py-2.5 text-zinc-500 font-mono text-[11px]">{client.createdAt}</td>
                        <td className="py-2.5 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1">
                            <button 
                              onClick={() => setSelectedClient(client)}
                              className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-800/60"
                              title="View Details"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-800/60" title="Edit Client">
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button className="p-1 rounded text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/60">
                              <MoreHorizontal className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* TABLE PAGINATION FOOTER */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-zinc-800/60 text-xs text-zinc-500 font-mono">
            <span>Showing 1 to {filteredClients.length} of 12 clients</span>
            <div className="flex items-center gap-2">
              <button className="p-1 rounded border border-zinc-800 bg-[#060908] hover:bg-zinc-800 text-zinc-400">
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button className="w-6 h-6 rounded bg-emerald-500 text-black font-bold text-xs flex items-center justify-center">1</button>
              <button className="w-6 h-6 rounded bg-[#060908] border border-zinc-800 text-zinc-400 hover:bg-zinc-800 text-xs flex items-center justify-center">2</button>
              <button className="p-1 rounded border border-zinc-800 bg-[#060908] hover:bg-zinc-800 text-zinc-400">
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
              <div className="flex items-center gap-1 px-2 py-0.5 bg-[#060908] border border-zinc-800 rounded text-zinc-400 text-xs">
                <span>10 / page</span>
                <ChevronDown className="w-3 h-3" />
              </div>
            </div>
          </div>

        </Card>

        {/* RIGHT COLUMN: CLIENT DETAILS PANEL (5 Columns Wide on XL) */}
        <Card className="xl:col-span-5 bg-[#090d0b] border-zinc-800/80 p-4 rounded-2xl flex flex-col justify-between space-y-4">
          
          <div>
            {/* PANEL TOP BAR & VIEW SWITCH */}
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white">Client Details</h3>
              <div className="flex items-center gap-1 text-[11px]">
                <button className="px-2 py-1 rounded-lg text-zinc-400 hover:bg-zinc-800/60 flex items-center gap-1">
                  <LayoutGrid className="w-3 h-3" /> Card View
                </button>
                <button className="px-2 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30 flex items-center gap-1">
                  <TableIcon className="w-3 h-3" /> Table View
                </button>
                <button className="p-1 rounded text-zinc-500 hover:text-white">
                  <MoreHorizontal className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* SELECTED CLIENT CARD BANNER */}
            <div className="p-4 rounded-2xl bg-[#060a08] border border-zinc-800/80 flex items-center gap-3.5 mb-3">
              <div className={`w-12 h-12 rounded-xl ${selectedClient.avatarColor} text-white font-black text-lg flex items-center justify-center shadow-lg shrink-0`}>
                {selectedClient.name.substring(0, 2).toUpperCase()}
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h4 className="text-base font-black text-white">{selectedClient.name}</h4>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                    selectedClient.status === "Active" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-zinc-800 text-zinc-400"
                  }`}>
                    &bull; {selectedClient.status}
                  </span>
                </div>
                <p className="text-xs text-zinc-400 font-sans">{selectedClient.tagline}</p>
              </div>
            </div>

            {/* DETAIL TABS */}
            <div className="flex items-center gap-4 border-b border-zinc-800/80 text-xs font-medium mb-4 overflow-x-auto">
              <button 
                onClick={() => setSelectedTab("overview")}
                className={`pb-2 border-b-2 transition-colors ${
                  selectedTab === "overview" ? "border-emerald-400 text-emerald-400 font-bold" : "border-transparent text-zinc-400 hover:text-white"
                }`}
              >
                Overview
              </button>
              <button 
                onClick={() => setSelectedTab("sites")}
                className={`pb-2 border-b-2 transition-colors ${
                  selectedTab === "sites" ? "border-emerald-400 text-emerald-400 font-bold" : "border-transparent text-zinc-400 hover:text-white"
                }`}
              >
                Sites ({selectedClient.sites})
              </button>
              <button 
                onClick={() => setSelectedTab("apps")}
                className={`pb-2 border-b-2 transition-colors ${
                  selectedTab === "apps" ? "border-emerald-400 text-emerald-400 font-bold" : "border-transparent text-zinc-400 hover:text-white"
                }`}
              >
                Applications ({selectedClient.apps})
              </button>
              <button 
                onClick={() => setSelectedTab("deployments")}
                className={`pb-2 border-b-2 transition-colors ${
                  selectedTab === "deployments" ? "border-emerald-400 text-emerald-400 font-bold" : "border-transparent text-zinc-400 hover:text-white"
                }`}
              >
                Deployments
              </button>
              <button 
                onClick={() => setSelectedTab("settings")}
                className={`pb-2 border-b-2 transition-colors ${
                  selectedTab === "settings" ? "border-emerald-400 text-emerald-400 font-bold" : "border-transparent text-zinc-400 hover:text-white"
                }`}
              >
                Settings
              </button>
            </div>

            {/* TAB CONTENT GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
              
              {/* General Information Sub-Panel */}
              <div className="space-y-3 p-3.5 rounded-2xl bg-[#060908] border border-zinc-800/60">
                <h5 className="font-bold text-white text-xs border-b border-zinc-800 pb-1.5">General Information</h5>
                
                <div className="space-y-2 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Client Name</span>
                    <span className="text-zinc-200 font-semibold">{selectedClient.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Code</span>
                    <span className="text-zinc-300 font-mono">{selectedClient.code}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Industry</span>
                    <span className="text-zinc-300">{selectedClient.industry}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block mb-0.5">Description</span>
                    <p className="text-zinc-400 text-[10px] leading-relaxed">{selectedClient.description}</p>
                  </div>
                  <div className="flex justify-between pt-1">
                    <span className="text-zinc-500">Created At</span>
                    <span className="text-zinc-300 font-mono text-[10px]">{selectedClient.createdAt}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Contact Email</span>
                    <a href={`mailto:${selectedClient.email}`} className="text-blue-400 hover:underline">{selectedClient.email}</a>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Contact Person</span>
                    <span className="text-zinc-300">{selectedClient.contactPerson}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Phone</span>
                    <span className="text-zinc-300 font-mono text-[10px]">{selectedClient.phone}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block mb-0.5">Address</span>
                    <p className="text-zinc-400 text-[10px] leading-relaxed">{selectedClient.address}</p>
                  </div>
                </div>
              </div>

              {/* Statistics & Quick Actions Column */}
              <div className="space-y-4">
                
                {/* Statistics Card */}
                <div className="p-3.5 rounded-2xl bg-[#060908] border border-zinc-800/60 space-y-2.5">
                  <h5 className="font-bold text-white text-xs border-b border-zinc-800 pb-1.5">Statistics</h5>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    
                    <div className="p-2 rounded-xl bg-zinc-900/60 flex items-center gap-2">
                      <Globe className="w-4 h-4 text-teal-400 shrink-0" />
                      <div>
                        <p className="text-[10px] text-zinc-500">Total Sites</p>
                        <p className="font-bold text-white font-mono">{selectedClient.sites}</p>
                      </div>
                    </div>

                    <div className="p-2 rounded-xl bg-zinc-900/60 flex items-center gap-2">
                      <Box className="w-4 h-4 text-purple-400 shrink-0" />
                      <div>
                        <p className="text-[10px] text-zinc-500">Applications</p>
                        <p className="font-bold text-white font-mono">{selectedClient.apps}</p>
                      </div>
                    </div>

                    <div className="p-2 rounded-xl bg-zinc-900/60 flex items-center gap-2">
                      <Rocket className="w-4 h-4 text-amber-400 shrink-0" />
                      <div>
                        <p className="text-[10px] text-zinc-500">Active Deployments</p>
                        <p className="font-bold text-white font-mono">{selectedClient.activeDeployments}</p>
                      </div>
                    </div>

                    <div className="p-2 rounded-xl bg-zinc-900/60 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <div>
                        <p className="text-[10px] text-zinc-500">Success Rate (30d)</p>
                        <p className="font-bold text-emerald-400 font-mono">{selectedClient.successRate}%</p>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Quick Actions Card */}
                <div className="p-3.5 rounded-2xl bg-[#060908] border border-zinc-800/60 space-y-2">
                  <h5 className="font-bold text-white text-xs border-b border-zinc-800 pb-1.5">Quick Actions</h5>
                  
                  <div className="space-y-1.5">
                    <Button className="w-full h-8 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs rounded-xl justify-start">
                      + Add New Site
                    </Button>
                    <Button className="w-full h-8 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl justify-start">
                      View Deployments
                    </Button>
                    <Button className="w-full h-8 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl justify-start">
                      Manage Configurations
                    </Button>
                    <Button variant="outline" className="w-full h-8 border-zinc-800 bg-[#060908] hover:bg-zinc-800 text-zinc-300 font-medium text-xs rounded-xl justify-start">
                      Client Settings
                    </Button>
                  </div>
                </div>

              </div>

            </div>

          </div>

        </Card>

      </div>

    </div>
  );
}
