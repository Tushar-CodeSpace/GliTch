export type DeviceMetrics = {
  hostname: string;
  platform: string;
  uptime_seconds: number;
  cpu_percent: number;
  memory: { used_percent: number; used_bytes: number; total_bytes: number };
  disk: { used_percent: number; used_bytes: number; total_bytes: number };
  load_average: number[];
  updated_at: string;
  demo?: boolean;
};

const demoMetrics: DeviceMetrics = {
  hostname: "glitch-workstation",
  platform: "Linux x86_64 · Ubuntu",
  uptime_seconds: 93642,
  cpu_percent: 18.6,
  memory: { used_percent: 47.2, used_bytes: 7900000000, total_bytes: 16700000000 },
  disk: { used_percent: 63.8, used_bytes: 256000000000, total_bytes: 400000000000 },
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
  const data = await response.json() as DeviceMetrics;
  return { ...data, demo: false };
}

export function getDemoMetrics(): DeviceMetrics {
  return { ...demoMetrics, updated_at: new Date().toISOString() };
}
