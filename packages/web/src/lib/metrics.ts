export type DiskIOStats = {
  read_mb_per_sec: number;
  write_mb_per_sec: number;
  io_in_progress?: number;
};

export type NetworkIOStats = {
  rx_kb_per_sec: number;
  tx_kb_per_sec: number;
  total_rx_bytes?: number;
  total_tx_bytes?: number;
};

export type DeviceMetrics = {
  hostname: string;
  platform: string;
  uptime_seconds: number;
  cpu_percent: number;
  temperature_celsius: number;
  memory: { used_percent: number; used_bytes: number; total_bytes: number };
  disk: { used_percent: number; used_bytes: number; total_bytes: number };
  disk_io: DiskIOStats;
  network_io: NetworkIOStats;
  process_count?: number;
  load_average: number[];
  updated_at: string;
  demo?: boolean;
};

export type MetricHistoryPoint = {
  id: number;
  recorded_at: string;
  cpu_percent: number;
  temperature_celsius: number;
  memory_used_percent: number;
  memory_used_bytes: number;
  memory_total_bytes: number;
  disk_used_percent: number;
  disk_read_mb_per_sec: number;
  disk_write_mb_per_sec: number;
  net_rx_kb_per_sec: number;
  net_tx_kb_per_sec: number;
  process_count: number;
  load_1m: number;
  load_5m: number;
  load_15m: number;
};

const demoMetrics: DeviceMetrics = {
  hostname: "glitch-workstation",
  platform: "Linux x86_64 · Ubuntu",
  uptime_seconds: 93642,
  cpu_percent: 18.6,
  temperature_celsius: 52.4,
  memory: { used_percent: 47.2, used_bytes: 7900000000, total_bytes: 16700000000 },
  disk: { used_percent: 63.8, used_bytes: 256000000000, total_bytes: 400000000000 },
  disk_io: { read_mb_per_sec: 1.4, write_mb_per_sec: 2.8, io_in_progress: 0 },
  network_io: { rx_kb_per_sec: 32.4, tx_kb_per_sec: 14.8, total_rx_bytes: 104857600, total_tx_bytes: 52428800 },
  process_count: 412,
  load_average: [0.42, 0.51, 0.48],
  updated_at: new Date().toISOString(),
  demo: true,
};

export async function fetchMetrics(signal?: AbortSignal): Promise<DeviceMetrics> {
  const response = await fetch("http://127.0.0.1:4780/api/metrics", {
    signal,
    headers: { Accept: "application/json" },
  });
  if (!response.ok) throw new Error(`Metrics API returned ${response.status}`);
  const data = (await response.json()) as DeviceMetrics;
  return { ...data, demo: false };
}

export async function fetchMetricsHistory(
  timeRange = "1h",
  limit = 60,
  signal?: AbortSignal
): Promise<MetricHistoryPoint[]> {
  try {
    const response = await fetch(
      `http://127.0.0.1:4780/api/metrics/history?range=${encodeURIComponent(timeRange)}&limit=${limit}`,
      {
        signal,
        headers: { Accept: "application/json" },
      }
    );
    if (!response.ok) return [];
    return (await response.json()) as MetricHistoryPoint[];
  } catch {
    return [];
  }
}

export function getDemoMetrics(): DeviceMetrics {
  return { ...demoMetrics, updated_at: new Date().toISOString() };
}
