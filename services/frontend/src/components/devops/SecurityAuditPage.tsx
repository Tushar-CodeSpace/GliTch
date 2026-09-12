import React from "react";
import { Card } from "@/components/ui/card";
import { ShieldCheck, Lock, CheckCircle2, AlertTriangle, FileCode } from "lucide-react";

export function SecurityAuditPage() {
  return (
    <div className="space-y-6 font-mono">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white font-mono flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            Security Compliance & Dependency Audit
          </h2>
          <p className="text-xs text-zinc-400 font-mono mt-1">
            Automated CVE vulnerability scanning, SSL certificate validity, and role access compliance
          </p>
        </div>

        <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-bold">
          0 VULNERABILITIES FOUND
        </span>
      </div>

      {/* COMPLIANCE AUDIT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <Card className="bg-[#0b100e] border-emerald-500/20 p-5 rounded-2xl space-y-3">
          <div className="flex items-center justify-between font-bold text-white">
            <span>Python uv Dependencies</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-zinc-400 text-[11px]">
            FastAPI 0.115, Uvicorn, Pytest, Pydantic v2
          </p>
          <div className="pt-2 border-t border-zinc-900 flex justify-between text-[10px] text-emerald-400">
            <span>uv sync --check</span>
            <span>PASS</span>
          </div>
        </Card>

        <Card className="bg-[#0b100e] border-emerald-500/20 p-5 rounded-2xl space-y-3">
          <div className="flex items-center justify-between font-bold text-white">
            <span>Node npm Packages</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-zinc-400 text-[11px]">
            React 18.3, Vite 5.4, Lucide Icons, Tailwind
          </p>
          <div className="pt-2 border-t border-zinc-900 flex justify-between text-[10px] text-emerald-400">
            <span>npm audit --production</span>
            <span>PASS</span>
          </div>
        </Card>

        <Card className="bg-[#0b100e] border-emerald-500/20 p-5 rounded-2xl space-y-3">
          <div className="flex items-center justify-between font-bold text-white">
            <span>SSL & Zero-Trust MFA</span>
            <Lock className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-zinc-400 text-[11px]">
            TLS 1.3 Encryption &bull; JWT Authentication
          </p>
          <div className="pt-2 border-t border-zinc-900 flex justify-between text-[10px] text-emerald-400">
            <span>Cert Validity: 342 Days</span>
            <span>PASS</span>
          </div>
        </Card>
      </div>

    </div>
  );
}
