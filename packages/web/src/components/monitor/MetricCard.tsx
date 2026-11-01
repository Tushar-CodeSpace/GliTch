import type { ReactNode } from "react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Panel } from "../ui/Panel";

type Props = {
  label: string;
  value: string;
  detail: string;
  percent?: number;
  subDetail?: string;
  icon: ReactNode;
  trend?: "up" | "down" | "steady";
  history?: number[];
  color?: "lime" | "amber" | "cyan";
};

export function MetricCard({
  label,
  value,
  detail,
  percent,
  subDetail,
  icon,
  trend = "steady",
  history = [],
  color = "lime",
}: Props) {
  // Generate SVG Sparkline coordinates from history array
  const points = history.length > 0 ? history : [percent ?? 20, percent ?? 20];
  const minVal = Math.min(...points, 0);
  const maxVal = Math.max(...points, 100);
  const range = maxVal - minVal || 1;

  const width = 120;
  const height = 36;
  const paddingY = 4;

  const coords = points.map((val, idx) => {
    const x = (idx / Math.max(points.length - 1, 1)) * width;
    const normalized = (val - minVal) / range;
    const y = height - paddingY - normalized * (height - paddingY * 2);
    return { x, y };
  });

  const pathD = coords.reduce(
    (acc, pt, idx) => (idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`),
    ""
  );

  const areaD = coords.length > 0
    ? `${pathD} L ${coords[coords.length - 1].x} ${height} L ${coords[0].x} ${height} Z`
    : "";

  const lastPt = coords[coords.length - 1] || { x: width, y: height / 2 };

  const strokeColor =
    color === "amber" ? "#f59e0b" : color === "cyan" ? "#38bdf8" : "#c5ff4a";
  const gradId = `spark-grad-${label.replace(/[^a-zA-Z0-9]/g, "")}`;

  return (
    <Panel className={`metric-card metric-card-${color}`}>
      <div className="metric-top">
        <span className="metric-label">{label}</span>
        <span className="metric-icon">{icon}</span>
      </div>

      <div className="metric-middle">
        <div className="metric-value-group">
          <div className="metric-value">
            {value}
            <span className="metric-detail">{detail}</span>
          </div>
          {subDetail && <span className="metric-subdetail">{subDetail}</span>}
        </div>

        {points.length > 1 && (
          <div className="metric-sparkline" title={`Live Trend (last ${points.length} samples)`}>
            <svg
              viewBox={`0 0 ${width} ${height}`}
              className="sparkline-svg"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={strokeColor} stopOpacity="0.32" />
                  <stop offset="100%" stopColor={strokeColor} stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path d={areaD} fill={`url(#${gradId})`} />
              <path
                d={pathD}
                fill="none"
                stroke={strokeColor}
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle
                cx={lastPt.x}
                cy={lastPt.y}
                r="3"
                fill={strokeColor}
                className="sparkline-dot"
              />
            </svg>
          </div>
        )}
      </div>

      {percent !== undefined && (
        <div className="meter-wrapper">
          <div className="meter">
            <span
              style={{
                width: `${Math.max(0, Math.min(100, percent))}%`,
                backgroundColor: strokeColor,
                boxShadow: `0 0 10px ${strokeColor}44`,
              }}
            />
          </div>
        </div>
      )}

      <div className="metric-bottom">
        <span className="metric-caption">
          {percent !== undefined ? `${percent.toFixed(1)}% utilized` : "Current reading"}
        </span>
        <span className={`metric-trend trend-${trend}`}>
          {trend === "up" ? (
            <ArrowUpRight size={13} />
          ) : trend === "down" ? (
            <ArrowDownRight size={13} />
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
