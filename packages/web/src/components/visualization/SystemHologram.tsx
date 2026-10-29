import { useEffect, useState } from "react";
import { OrbitalGlobe } from "./OrbitalGlobe";
import { TelemetryCard } from "./TelemetryCard";
import { FeatureHighlights } from "./FeatureHighlights";
import { fetchMetrics, getDemoMetrics, type DeviceMetrics } from "../../lib/metrics";
import { formatUptime } from "../../lib/utils";

type Props = {
  onMetricsStateChange?: (isLive: boolean) => void;
};

export function SystemHologram({ onMetricsStateChange }: Props) {
  const [metrics, setMetrics] = useState<DeviceMetrics>(() => getDemoMetrics());
  const [isLive, setIsLive] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    async function checkMetrics() {
      try {
        const data = await fetchMetrics(controller.signal);
        if (isMounted) {
          setMetrics(data);
          setIsLive(true);
          onMetricsStateChange?.(true);
        }
      } catch {
        if (isMounted) {
          setIsLive(false);
          onMetricsStateChange?.(false);
          setMetrics(getDemoMetrics());
        }
      }
    }

    void checkMetrics();
    // Gentle polling interval: 8 seconds (does not hammer local daemon)
    const interval = window.setInterval(() => {
      void checkMetrics();
    }, 8000);

    return () => {
      isMounted = false;
      controller.abort();
      window.clearInterval(interval);
    };
  }, [onMetricsStateChange]);

  const cpuPercent = metrics.cpu_percent;
  const memPercent = metrics.memory.used_percent;
  const diskPercent = metrics.disk.used_percent;
  const uptimeStr = formatUptime(metrics.uptime_seconds);

  return (
    <section className="system-hologram-stage" aria-label="System telemetry and cyber-industrial console">
      {/* 1. Large Holographic Computing Platform Visualization */}
      <div className="hologram-viewport-box">
        <OrbitalGlobe />
      </div>

      {/* 2. Unified Horizontal Telemetry Cards Row */}
      <div className="telemetry-horizontal-grid" aria-label="System metrics">
        <TelemetryCard
          label="CPU"
          value={`${cpuPercent.toFixed(1)}%`}
          percent={cpuPercent}
          isLive={isLive}
        />

        <TelemetryCard
          label="MEMORY"
          value={`${memPercent.toFixed(1)}%`}
          percent={memPercent}
          isLive={isLive}
        />

        <TelemetryCard
          label="DISK"
          value={`${diskPercent.toFixed(1)}%`}
          percent={diskPercent}
          isLive={isLive}
        />

        <TelemetryCard
          label="UPTIME"
          value={uptimeStr}
          percent={75}
          isLive={isLive}
        />
      </div>

      {/* 3. Hero Typography and 3 Feature Badges */}
      <FeatureHighlights />
    </section>
  );
}
