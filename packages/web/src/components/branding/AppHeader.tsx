type Props = {
  version?: string;
  isLive?: boolean;
};

export function AppHeader({ version = "0.1.0", isLive = false }: Props) {
  return (
    <header className="terminal-app-header">
      <div className="header-inner">
        {/* Left: Brand Icon & Monospace Wordmark */}
        <div className="terminal-header-brand">
          <div className="terminal-logo-box" aria-hidden="true">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="#38bdf8"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="terminal-logo-svg"
            >
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </div>
          <span className="terminal-brand-wordmark">glitch.</span>
        </div>

        {/* Right: Technical Version & Local Status */}
        <div className="terminal-header-meta">
          <span className="terminal-meta-version">v{version}</span>
          <span className="terminal-meta-divider">|</span>
          <div className="terminal-meta-mode" title={isLive ? "Connected to local daemon" : "Local mode"}>
            <span className={`status-dot ${isLive ? "live" : "local"}`} />
            <span>LOCAL MODE</span>
          </div>
        </div>
      </div>
    </header>
  );
}
