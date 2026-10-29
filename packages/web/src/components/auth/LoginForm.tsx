import { useState, type FormEvent } from "react";
import { AlertCircle, Eye, EyeOff, Lock, RotateCcw, Shield, User } from "lucide-react";
import { DemoModeButton } from "./DemoModeButton";
import { loginWithPassword } from "../../lib/auth";

type Props = {
  onSuccess: () => void;
  onDemoLogin: () => void;
};

export function LoginForm({ onSuccess, onDemoLogin }: Props) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      const result = await loginWithPassword({
        username,
        password,
        remember,
      });

      if (result.success) {
        onSuccess();
      } else {
        setErrorMessage(result.error || "Authentication failed.");
      }
    } catch {
      setErrorMessage("An unexpected authentication error occurred.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="terminal-login-form-wrapper">
      <form onSubmit={handleSubmit} className="terminal-card-form" noValidate>
        {/* Error Alert Box */}
        {errorMessage && (
          <div className="auth-error-banner" role="alert">
            <AlertCircle size={14} className="error-glyph" />
            <div className="error-text-content">
              <strong>Access Notice:</strong>
              <span>{errorMessage}</span>
            </div>
          </div>
        )}

        {/* Username Input Field */}
        <div className="field-group">
          <label htmlFor="login-username" className="sr-only">
            Username or email
          </label>
          <div className="terminal-input-wrap">
            <User size={14} className="input-glyph" aria-hidden="true" />
            <input
              id="login-username"
              type="text"
              autoComplete="username"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                if (errorMessage) setErrorMessage(null);
              }}
              placeholder="Username or email"
              required
              disabled={loading}
            />
          </div>
        </div>

        {/* Password Input Field with Toggle */}
        <div className="field-group">
          <label htmlFor="login-password" className="sr-only">
            Password
          </label>
          <div className="terminal-input-wrap">
            <Lock size={14} className="input-glyph" aria-hidden="true" />
            <input
              id="login-password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errorMessage) setErrorMessage(null);
              }}
              placeholder="Password"
              required
              disabled={loading}
            />
            <button
              type="button"
              className="password-toggle-btn"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              disabled={loading}
            >
              {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
        </div>

        {/* Options Row: Remember device & Forgot password */}
        <div className="terminal-options-row">
          <label className="terminal-checkbox-wrap">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              disabled={loading}
            />
            <span className={`custom-checkbox ${remember ? "checked" : ""}`} aria-hidden="true">
              {remember && (
                <svg viewBox="0 0 12 12" fill="none" className="w-2.5 h-2.5">
                  <path d="M2.5 6L5 8.5L9.5 3.5" stroke="#000000" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </span>
            <span className="checkbox-divider" aria-hidden="true">|</span>
            <span className="checkbox-label">Remember this device</span>
          </label>

          <a
            href="#forgot-password"
            className="forgot-link"
            onClick={(e) => {
              e.preventDefault();
              setErrorMessage("Local passwords can be reset via the 'glitch auth reset' CLI command on your host machine.");
            }}
          >
            Forgot password?
          </a>
        </div>

        {/* Primary Action Button: [ Sign In → ] */}
        <button
          type="submit"
          className="terminal-signin-btn"
          disabled={loading}
        >
          {loading ? (
            <>
              <RotateCcw size={14} className="spin" />
              <span>[ Verifying... ]</span>
            </>
          ) : (
            <span>[ Sign In → ]</span>
          )}
        </button>
      </form>

      {/* Divider: --- OR --- */}
      <div className="terminal-divider-row" aria-hidden="true">
        <span className="terminal-divider-text">--- OR ---</span>
      </div>

      {/* Secondary Demo Mode CTA */}
      <DemoModeButton onClick={onDemoLogin} disabled={loading} />

      {/* Verified Local-First Privacy Notice */}
      <div className="terminal-security-note">
        <Shield size={13} className="security-shield-icon" aria-hidden="true" />
        <span>Your device. Your data. Local by default.</span>
      </div>
    </div>
  );
}
