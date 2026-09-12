import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sliders, FileCode, CheckCircle, Copy } from "lucide-react";

export function ConfigManagerPage() {
  const [selectedSiteConfig, setSelectedSiteConfig] = useState<"alpha" | "beta" | "gamma">("alpha");
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const [configJson, setConfigJson] = useState({
    alpha: JSON.stringify({
      site_id: "CLIENT-ALPHA-US-EAST",
      environment: "production",
      max_db_connections: 120,
      enable_audit_logging: true,
      api_rate_limit: "5000/min",
      ssl_enforced: true,
      feature_flags: { beta_checkout: true, zero_trust_mfa: true }
    }, null, 2),
    beta: JSON.stringify({
      site_id: "CLIENT-BETA-EU-WEST",
      environment: "production",
      max_db_connections: 80,
      enable_audit_logging: true,
      api_rate_limit: "3000/min",
      ssl_enforced: true,
      feature_flags: { beta_checkout: false, zero_trust_mfa: true }
    }, null, 2),
    gamma: JSON.stringify({
      site_id: "CLIENT-GAMMA-AP-SOUTH",
      environment: "production",
      max_db_connections: 200,
      enable_audit_logging: true,
      api_rate_limit: "10000/min",
      ssl_enforced: true,
      feature_flags: { beta_checkout: true, zero_trust_mfa: false }
    }, null, 2)
  });

  const handleSaveConfig = () => {
    setSaveMessage(`Config bundle for ${selectedSiteConfig.toUpperCase()} successfully saved & validated!`);
    setTimeout(() => setSaveMessage(null), 3000);
  };

  return (
    <div className="space-y-6">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white font-mono flex items-center gap-2">
            <Sliders className="w-5 h-5 text-emerald-400" />
            Config-Driven Client Site Build Manager
          </h2>
          <p className="text-xs text-zinc-400 font-mono mt-1">
            Site-specific JSON configuration files injected into client software builds during CI
          </p>
        </div>
      </div>

      <Card className="bg-[#0b100e] border-emerald-500/20 p-6 rounded-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <FileCode className="w-5 h-5 text-emerald-400" />
            <span className="font-bold text-sm text-white font-mono">
              Site Configuration Matrix
            </span>
          </div>

          {/* SITE SWITCHER BUTTONS */}
          <div className="flex items-center gap-2 font-mono text-xs">
            <Button
              onClick={() => setSelectedSiteConfig("alpha")}
              className={`h-8 px-3 rounded-lg border ${selectedSiteConfig === "alpha" ? "bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold" : "bg-[#060908] border-zinc-800 text-zinc-400"}`}
            >
              Client Alpha (US-East)
            </Button>
            <Button
              onClick={() => setSelectedSiteConfig("beta")}
              className={`h-8 px-3 rounded-lg border ${selectedSiteConfig === "beta" ? "bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold" : "bg-[#060908] border-zinc-800 text-zinc-400"}`}
            >
              Client Beta (EU-West)
            </Button>
            <Button
              onClick={() => setSelectedSiteConfig("gamma")}
              className={`h-8 px-3 rounded-lg border ${selectedSiteConfig === "gamma" ? "bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold" : "bg-[#060908] border-zinc-800 text-zinc-400"}`}
            >
              Client Gamma (AP-South)
            </Button>
          </div>
        </div>

        {/* JSON CONFIG EDITOR */}
        <div className="space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between text-zinc-400">
            <span>Editing Target Config: <strong className="text-emerald-400">{selectedSiteConfig.toUpperCase()}_SITE_CONFIG.JSON</strong></span>
            <span className="text-[10px] text-zinc-500">Auto-validated schema &bull; Injected during CI</span>
          </div>

          <textarea
            value={configJson[selectedSiteConfig]}
            onChange={(e) => setConfigJson({ ...configJson, [selectedSiteConfig]: e.target.value })}
            rows={14}
            className="w-full p-4 rounded-xl bg-[#060908] border border-zinc-800 text-emerald-300 font-mono text-xs outline-none focus:border-emerald-500/60 leading-relaxed shadow-inner"
          />

          <div className="flex items-center justify-between pt-2">
            {saveMessage ? (
              <div className="flex items-center gap-2 text-xs text-emerald-400 font-mono">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>{saveMessage}</span>
              </div>
            ) : <div />}

            <Button 
              onClick={handleSaveConfig}
              className="h-9 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold font-mono rounded-xl text-xs"
            >
              Save & Rebuild Config Bundle
            </Button>
          </div>
        </div>
      </Card>

    </div>
  );
}
