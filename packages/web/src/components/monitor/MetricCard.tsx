import type { ReactNode } from "react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Panel } from "../ui/Panel";

export type MetricColor = "cyan" | "emerald" | "indigo" | "amber" | "rose" | "lime";

type Props = {
  label: string;
  value: string;
  detail: string;
  percent?: number;
  subDetail?: string;
  icon: ReactNode;
  trend?: "up" | "down" | "steady";
  history?: number[];
  color?: MetricColor;
};

// Generates a smooth Catmull-Rom / Bezier spline SVG path
function generateSmoothPath(coords: { x: number; y: number }[]): string {
  if (coords.length === 0) return "";
  if (coords.length === 1) return `M ${coords[0].x} ${coords[0].y}`;
  let d = `M ${coords[0].x.toFixed(1)} ${coords[0].y.toFixed(1)}`;
  for (let i = 0; i < coords.length - 1; i++) {
    const p0 = coords[i === 0 ? 0 : i - 1];
    const p1 = coords[i];
    const p2 = coords[i + 1];
    const p3 = coords[i + 2] || p2;

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  return d;
}

export function MetricCard({
  label,
  value,
  detail,
  percent,
  subDetail,
  icon,
  trend = "steady",
  history = [],
  color = "cyan",
}: Props) {
  // Generate SVG Sparkline coordinates from history array
  const points = history.length > 0 ? history : [percent ?? 20, percent ?? 20];
  const minVal = Math.min(...points, 0);
  const maxVal = Math.max(...points, 100);
  const range = maxVal - minVal || 1;

  const width = 130;
  const height = 40;
  const paddingY = 5;

  const coords = points.map((val, idx) => {
    const x = (idx / Math.max(points.length - 1, 1)) * width;
    const normalized = (val - minVal) / range;
    const y = height - paddingY - normalized * (height - paddingY * 2);
    return { x, y };
  });

  const pathD = generateSmoothPath(coords);
  const areaD = coords.length > 0
    ? `${pathD} L ${coords[coords.length - 1].x.toFixed(1)} ${height} L ${coords[0].x.toFixed(1)} ${height} Z`
    : "";

  const lastPt = coords[coords.length - 1] || { x: width, y: height / 2 };

  const colorPalette: Record<MetricColor, { stroke: string; glow: string }> = {
    cyan: { stroke: "#38bdf8", glow: "rgba(56, 189, 248, 0.4)" },
    emerald: { stroke: "#10b981", glow: "rgba(16, 185, 129, 0.4)" },
    indigo: { stroke: "#818cf8", glow: "rgba(129, 140, 248, 0.4)" },
    amber: { stroke: "#f59e0b", glow: "rgba(245, 158, 11, 0.4)" },
    rose: { stroke: "#f43f5e", glow: "rgba(244, 63, 94, 0.4)" },
    lime: { stroke: "#a3e635", glow: "rgba(163, 230, 53, 0.4)" },
  };

  const activeColor = colorPalette[color] || colorPalette.cyan;
  const gradId = `spark-grad-${label.replace(/[^a-zA-Z0-9]/g, "")}`;

  return (
    <Panel className={`obsidian-metric-card card-${color}`}>
      <div className="card-ambient-glow" />

      {/* Top Header */}
      <div className="metric-header-row">
        <div className="metric-title-group">
          <span className="metric-badge-label">{label}</span>
          {subDetail && <span className="metric-subdetail">{subDetail}</span>}
        </div>
        <div className="metric-icon-tile">{icon}</div>
      </div>

      {/* Value & Smooth Sparkline Row */}
      <div className="metric-body-row">
        <div className="metric-value-container">
          <div className="metric-reading">
            <span className="metric-num">{value}</span>
            <span className="metric-unit">{detail}</span>
          </div>
        </div>

        {points.length > 1 && (
          <div className="metric-sparkline-box" title={`Live Trend (last ${points.length} samples)`}>
            <svg
              viewBox={`0 0 ${width} ${height}`}
              className="sparkline-svg"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={activeColor.stroke} stopOpacity="0.38" />
                  <stop offset="100%" stopColor={activeColor.stroke} stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path d={areaD} fill={`url(#${gradId})`} />
              <path
                d={pathD}
                fill="none"
                stroke={activeColor.stroke}
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle
                cx={lastPt.x}
                cy={lastPt.y}
                r="3.5"
                fill={activeColor.stroke}
                className="sparkline-dot"
                style={{ filter: `drop-shadow(0 0 6px ${activeColor.stroke})` }}
              />
            </svg>
          </div>
        )}
      </div>

      {/* Segmented High-Precision Gauge Bar */}
      {percent !== undefined && (
        <div className="meter-wrapper">
          <div className="segmented-gauge">
            <div
              className="gauge-fill"
              style={{
                width: `${Math.max(0, Math.min(100, percent))}%`,
                background: `linear-gradient(90deg, ${activeColor.stroke}aa, ${activeColor.stroke})`,
                boxShadow: `0 0 12px ${activeColor.glow}`,
              }}
            />
          </div>
        </div>
      )}

      {/* Card Footer: Capacity & Trend */}
      <div className="metric-footer-row">
        <span className="metric-caption">
          {percent !== undefined ? `${percent.toFixed(1)}% current capacity` : "Live telemetry probe"}
        </span>
        <span className={`metric-trend-chip trend-${trend}`}>
          {trend === "up" ? (
            <ArrowUpRight size={12} />
          ) : trend === "down" ? (
            <ArrowDownRight size={12} />
          ) : (
            <span className="trend-dot" />
          )}
          {trend === "steady"
            ? "STABLE"
            : trend === "up"
            ? "RISING"
            : "DECLINING"}
        </span>
      </div>
    </Panel>
  );
}
