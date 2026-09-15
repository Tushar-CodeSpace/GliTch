import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  ShieldCheck, 
  Search, 
  CheckCircle2, 
  XCircle, 
  Loader2
} from "lucide-react";

interface ApprovalItem {
  id: string;
  build_id: string;
  application_id: string;
  app_name: string;
  title: string;
  environment: string;
  version: string;
  requester: string;
  priority: string;
  status: string;
  requested_at: string;
  description: string;
}

export function ApprovalsPage() {
  const [approvals, setApprovals] = useState<ApprovalItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchApprovals = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("http://127.0.0.1:8000/api/v1/approvals");
      if (res.ok) {
        const data = await res.json();
        setApprovals(data);
      }
    } catch (err) {
      console.error("Error fetching approvals:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovals();
  }, []);

  const handleApprove = async (approvalId: string) => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/v1/approvals/${approvalId}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_email: "admin@glitch.dev", comment: "Approved via console UI" })
      });
      if (res.ok) {
        fetchApprovals();
      }
    } catch (err) {
      console.error("Error approving request:", err);
    }
  };

  const handleReject = async (approvalId: string) => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/v1/approvals/${approvalId}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_email: "admin@glitch.dev", comment: "Rejected via console UI" })
      });
      if (res.ok) {
        fetchApprovals();
      }
    } catch (err) {
      console.error("Error rejecting request:", err);
    }
  };

  const filteredApprovals = approvals.filter(a => 
    a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.app_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-5 pb-8 font-sans text-zinc-100 selection:bg-emerald-500 selection:text-black">
      
      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
            <h2 className="text-xl font-bold text-white tracking-tight">Deployment Approval Gates</h2>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Governance approval workflows before production Edge agent deployment.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs font-mono text-zinc-500">
            Home &gt; <span className="text-zinc-300">Approvals</span>
          </div>
        </div>
      </div>

      {/* SEARCH BAR */}
      <Card className="p-3 bg-[#090d0b] border-zinc-800/80 rounded-2xl">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search approval requests..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-9 pr-4 bg-[#060908] border border-zinc-800 rounded-xl text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/60 transition-colors"
            />
          </div>
          <div className="text-xs text-zinc-400 font-mono">
            Showing <span className="text-emerald-400 font-bold">{filteredApprovals.length}</span> approval requests
          </div>
        </div>
      </Card>

      {/* CONTENT LISTING / EMPTY STATE */}
      {isLoading ? (
        <div className="py-16 text-center text-zinc-400 font-mono text-xs flex flex-col items-center gap-2">
          <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" />
          Loading approval requests from MongoDB...
        </div>
      ) : filteredApprovals.length === 0 ? (
        <Card className="p-12 text-center bg-[#090d0b] border-zinc-800/80 rounded-2xl space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 mx-auto flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-base font-bold text-white">No Approval Requests</h3>
            <p className="text-xs text-zinc-400">
              {searchQuery ? "No approval requests match your search query." : "No pending approval gates required. Production releases will generate approval tickets when triggered."}
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredApprovals.map((appr) => (
            <Card key={appr.id} className="p-4 bg-[#090d0b] border-zinc-800/80 rounded-2xl hover:border-emerald-500/40 transition-colors space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">{appr.title}</h3>
                  <span className="text-[10px] font-mono text-zinc-500">{appr.id} &bull; App: {appr.app_name}</span>
                </div>
                <div className="flex items-center gap-2">
                  {appr.status === "Pending" ? (
                    <>
                      <Button 
                        onClick={() => handleApprove(appr.id)}
                        size="sm"
                        className="h-8 px-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs rounded-xl flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Approve
                      </Button>
                      <Button 
                        onClick={() => handleReject(appr.id)}
                        size="sm"
                        variant="outline"
                        className="h-8 px-2.5 border-rose-500/40 text-rose-400 hover:bg-rose-500/10 text-xs rounded-xl flex items-center gap-1"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        Reject
                      </Button>
                    </>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                      {appr.status}
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-2 text-xs text-zinc-300 font-mono bg-[#060908] p-3 rounded-xl border border-zinc-800/60">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Environment:</span>
                  <span className="text-emerald-400">{appr.environment}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Requester:</span>
                  <span className="text-zinc-300">{appr.requester}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

    </div>
  );
}
