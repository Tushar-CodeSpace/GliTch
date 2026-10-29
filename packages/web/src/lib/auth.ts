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

const LOCAL_AUTH_API_URL = "http://127.0.0.1:4780/api/auth/login";

/**
 * Attempts authentication with the local FastAPI service if present.
 * If the service is unreachable or unauthenticated, returns a clear error
 * explaining that authentication is unavailable, without faking login success.
 */
export async function loginWithPassword(credentials: LoginCredentials, signal?: AbortSignal): Promise<AuthResult> {
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
    const timeout = window.setTimeout(() => controller.abort(), 3000);
    const effectiveSignal = signal || controller.signal;

    try {
      const response = await fetch(LOCAL_AUTH_API_URL, {
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
        return {
          success: true,
          token: data.access_token || data.token,
          user: data.user || { username, role: "operator" },
        };
      }

      if (response.status === 401 || response.status === 403) {
        return { success: false, error: "Invalid credentials. Please verify your username and password." };
      }

      if (response.status === 404) {
        return {
          success: false,
          error: "Authentication endpoint (/api/auth/login) is not configured on local backend (127.0.0.1:4780). Please use Demo Mode to access the dashboard.",
        };
      }

      return {
        success: false,
        error: `Local auth service responded with status ${response.status}. Use Demo Mode for preview.`,
      };
    } finally {
      window.clearTimeout(timeout);
    }
  } catch {
    return {
      success: false,
      error: "Local authentication service unavailable (127.0.0.1:4780 is offline). To explore the console, click 'Continue in Demo Mode'.",
    };
  }
}

