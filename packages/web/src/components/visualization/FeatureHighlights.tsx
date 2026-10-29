import { Monitor, Terminal, Hexagon } from "lucide-react";

export function FeatureHighlights() {
  return (
    <div className="feature-highlights-section">
      {/* High-Impact Headline & Supporting Copy */}
      <div className="hero-copy-block">
        <h1 className="hero-main-headline">
          <span className="headline-line-1">YOUR MACHINE.</span>
          <span className="headline-line-2">
            UNDER <span className="text-accent">CONTROL.</span>
          </span>
        </h1>
        <p className="hero-supporting-copy">
          Monitor system health. Run automation. Stay local.
        </p>
      </div>

      {/* 3 Compact Feature Indicators */}
      <div className="feature-badges-row">
        {/* Badge 1: Device Monitoring */}
        <div className="feature-badge-item">
          <div className="feature-icon-box">
            <Monitor size={15} strokeWidth={2.2} />
          </div>
          <div className="feature-badge-text">
            <span className="badge-line-1">DEVICE</span>
            <strong className="badge-line-2">MONITORING</strong>
          </div>
        </div>

        {/* Badge 2: Script Automation */}
        <div className="feature-badge-item">
          <div className="feature-icon-box">
            <Terminal size={15} strokeWidth={2.2} />
          </div>
          <div className="feature-badge-text">
            <span className="badge-line-1">SCRIPT</span>
            <strong className="badge-line-2">AUTOMATION</strong>
          </div>
        </div>

        {/* Badge 3: Local-First Architecture */}
        <div className="feature-badge-item">
          <div className="feature-icon-box">
            <Hexagon size={15} strokeWidth={2.2} />
          </div>
          <div className="feature-badge-text">
            <span className="badge-line-1">LOCAL-FIRST</span>
          </div>
        </div>
      </div>
    </div>
  );
}
