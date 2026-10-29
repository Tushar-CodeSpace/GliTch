import type { Incident, ServiceItem, PipelineItem, ChatMessage } from "../types/devops";

const API_BASE = "http://127.0.0.1:4780/api";

export type DbStatus = {
  engine: string;
  database_path: string;
  size_bytes: number;
  size_formatted: string;
  tables: string[];
  counts: Record<string, number>;
  integrity_check: string;
  wal_mode: boolean;
};

export async function fetchDbStatus(signal?: AbortSignal): Promise<DbStatus | null> {
  try {
    const res = await fetch(`${API_BASE}/db/status`, { signal });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function fetchIncidentsFromDb(signal?: AbortSignal): Promise<Incident[] | null> {
  try {
    const res = await fetch(`${API_BASE}/incidents`, { signal });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function resolveIncidentInDb(id: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/incidents/${id}/resolve`, {
      method: "POST",
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function fetchServicesFromDb(signal?: AbortSignal): Promise<ServiceItem[] | null> {
  try {
    const res = await fetch(`${API_BASE}/services`, { signal });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function restartServiceInDb(id: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/services/${id}/restart`, {
      method: "POST",
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function fetchPipelinesFromDb(signal?: AbortSignal): Promise<PipelineItem[] | null> {
  try {
    const res = await fetch(`${API_BASE}/pipelines`, { signal });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function fetchChatHistoryFromDb(signal?: AbortSignal): Promise<ChatMessage[] | null> {
  try {
    const res = await fetch(`${API_BASE}/copilot/chats`, { signal });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function saveChatMessageToDb(message: ChatMessage): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/copilot/chats`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(message),
    });
    return res.ok;
  } catch {
    return false;
  }
}

