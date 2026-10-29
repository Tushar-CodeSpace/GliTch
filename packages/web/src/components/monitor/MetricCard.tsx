import type { ReactNode } from "react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Panel } from "../ui/Panel";

type Props = {
  label: string;
  value: string;
  detail: string;
  percent?: number;
  icon: ReactNode;
  trend?: "up" | "down" | "steady";
};

export function MetricCard({ label, value, detail, percent, icon, trend = "steady" }: Props) {
  return (
    <Panel className="metric-card">
      <div className="metric-top"><span className="metric-label">{label}</span><span className="metric-icon">{icon}</span></div>
      <div className="metric-value">{value}<span className="metric-detail">{detail}</span></div>
      {percent !== undefined && <div className="meter"><span style={{ width: `${Math.max(0, Math.min(100, percent))}%` }} /></div>}
      <div className="metric-bottom">
        <span className="metric-caption">{percent !== undefined ? `${percent.toFixed(1)}% utilized` : "Current reading"}</span>
        <span className={`metric-trend trend-${trend}`}>{trend === "up" ? <ArrowUpRight size={13} /> : trend === "down" ? <ArrowDownRight size={13} /> : <span className="trend-dot" />} {trend === "steady" ? "STABLE" : trend === "up" ? "INCREASING" : "DECREASING"}</span>
      </div>
    </Panel>
  );
}
