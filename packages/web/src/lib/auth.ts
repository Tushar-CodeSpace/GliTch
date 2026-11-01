export type LoginCredentials = {
  username: string;
  password: string;
  remember?: boolean;
};

export type AuthResult = {
  success: boolean;
  error?: string;
  token?: string;
  user?: { username: string; role: string };
};

const STORAGE_KEY_TOKEN = "glitch_auth_token";
const STORAGE_KEY_USER = "glitch_auth_user";
const STORAGE_KEY_DEMO = "glitch_demo_mode";

function getBaseApiUrl(): string {
  // If served directly from daemon (http://127.0.0.1:4780), use relative origin
  if (typeof window !== "undefined" && window.location.origin) {
    if (window.location.port === "4780" || !window.location.port) {
      return window.location.origin;
    }
  }
  return "http://127.0.0.1:4780";
}

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(STORAGE_KEY_TOKEN) || sessionStorage.getItem(STORAGE_KEY_TOKEN);
}

export function getStoredUser(): { username: string; role: string } | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(STORAGE_KEY_USER) || sessionStorage.getItem(STORAGE_KEY_USER);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function isDemoSession(): boolean {
  if (typeof window === "undefined") return false;
  return (
    localStorage.getItem(STORAGE_KEY_DEMO) === "true" ||
    sessionStorage.getItem(STORAGE_KEY_DEMO) === "true"
  );
}

export function setDemoSession(): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY_DEMO, "true");
}

export function saveAuthSession(
  token: string,
  user: { username: string; role: string },
  remember: boolean = true
): void {
  if (typeof window === "undefined") return;
  const targetStorage = remember ? localStorage : sessionStorage;

  targetStorage.setItem(STORAGE_KEY_TOKEN, token);
  targetStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
  localStorage.removeItem(STORAGE_KEY_DEMO);
  sessionStorage.removeItem(STORAGE_KEY_DEMO);
}

export function clearAuthSession(): void {
  if (typeof window === "undefined") return;
  const token = getStoredToken();
  if (token) {
    // Fire and forget logout to invalidate server session in SQLite
    try {
      fetch(`${getBaseApiUrl()}/api/auth/logout`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        keepalive: true,
      }).catch(() => {});
    } catch {}
  }

  localStorage.removeItem(STORAGE_KEY_TOKEN);
  localStorage.removeItem(STORAGE_KEY_USER);
  localStorage.removeItem(STORAGE_KEY_DEMO);
  sessionStorage.removeItem(STORAGE_KEY_TOKEN);
  sessionStorage.removeItem(STORAGE_KEY_USER);
  sessionStorage.removeItem(STORAGE_KEY_DEMO);
}

export function isAuthenticated(): boolean {
  return Boolean(getStoredToken() || isDemoSession());
}

export async function verifyCurrentSession(): Promise<boolean> {
  if (isDemoSession()) return true;

  const token = getStoredToken();
  if (!token) return false;

  try {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 2000);
    try {
      const response = await fetch(`${getBaseApiUrl()}/api/auth/verify`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        signal: controller.signal,
      });

      if (response.ok) {
        const data = await response.json();
        if (data.user) {
          const remember = Boolean(localStorage.getItem(STORAGE_KEY_TOKEN));
          saveAuthSession(token, data.user, remember);
        }
        return true;
      }

      if (response.status === 401 || response.status === 403) {
        clearAuthSession();
        return false;
      }

      // In case of non-auth error (e.g. 500), keep session alive locally
      return true;
    } finally {
      window.clearTimeout(timeout);
    }
  } catch {
    // Network offline or timeout: keep session active for offline/air-gapped resilience
    return true;
  }
}

/**
 * Attempts authentication with the local Go SQLite daemon.
 */
export async function loginWithPassword(
  credentials: LoginCredentials,
  signal?: AbortSignal
): Promise<AuthResult> {
  const username = credentials.username.trim();
  const password = credentials.password;

  if (!username) {
    return { success: false, error: "Please enter your username or operator email." };
  }

  if (!password) {
    return { success: false, error: "Please enter your password." };
  }

  try {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 3500);
    const effectiveSignal = signal || controller.signal;

    try {
      const response = await fetch(`${getBaseApiUrl()}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ username, password }),
        signal: effectiveSignal,
      });

      window.clearTimeout(timeout);

      if (response.ok) {
        const data = await response.json();
        const token = data.access_token || data.token;
        const user = data.user || { username, role: "operator" };

        saveAuthSession(token, user, credentials.remember ?? true);

        return {
          success: true,
          token,
          user,
        };
      }

      if (response.status === 401 || response.status === 403) {
        return { success: false, error: "Invalid credentials. Please verify your username and password." };
      }

      return {
        success: false,
        error: `Authentication failed (status ${response.status}). Please check credentials or use Demo Mode.`,
      };
    } finally {
      window.clearTimeout(timeout);
    }
  } catch {
    return {
      success: false,
      error: "Local daemon authentication service is offline. To explore the console, click 'Continue in Demo Mode'.",
    };
  }
}
