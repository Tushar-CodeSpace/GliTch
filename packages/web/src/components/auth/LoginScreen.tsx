import { useRef, useState, useEffect } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { AppHeader } from "../branding/AppHeader";
import { AuthMethodSelector, type AuthMethod } from "./AuthMethodSelector";
import { LoginForm } from "./LoginForm";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { fetchMetrics } from "../../lib/metrics";

gsap.registerPlugin(useGSAP);

type Props = {
  onDemoLogin: () => void;
  onAuthenticated?: () => void;
};

export function LoginScreen({ onDemoLogin, onAuthenticated }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [authMethod, setAuthMethod] = useState<AuthMethod>("password");
  const [isLive, setIsLive] = useState<boolean>(false);
  const [version, setVersion] = useState<string>("0.1.0");
  const reducedMotion = useReducedMotion();

  // Gentle health check to reflect real local daemon status
  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    async function checkDaemon() {
      try {
        await fetchMetrics(controller.signal);
        if (isMounted) setIsLive(true);

        const healthRes = await fetch("http://127.0.0.1:4780/api/health", { signal: controller.signal });
        if (healthRes.ok) {
          const healthData = (await healthRes.json()) as { version?: string };
          if (healthData.version && isMounted) setVersion(healthData.version);
        }
      } catch {
        if (isMounted) setIsLive(false);
      }
    }

    void checkDaemon();
    const interval = window.setInterval(() => {
      void checkDaemon();
    }, 10000);

    return () => {
      isMounted = false;
      controller.abort();
      window.clearInterval(interval);
    };
  }, []);

  // Subtle GSAP entrance animation on mount
  useGSAP(
    () => {
      if (reducedMotion) return;

      gsap.from(".terminal-app-header", {
        y: -6,
        duration: 0.35,
        ease: "power2.out",
        clearProps: "all",
      });

      gsap.from(".terminal-window-card", {
        y: 8,
        duration: 0.4,
        ease: "power2.out",
        clearProps: "all",
      });

      gsap.from(".terminal-corner-hud", {
        y: 4,
        duration: 0.35,
        ease: "power2.out",
        clearProps: "all",
      });
    },
    { scope: rootRef, dependencies: [reducedMotion] }
  );

  return (
    <div className="terminal-login-viewport" ref={rootRef}>
      {/* 1. Top Navigation Bar */}
      <AppHeader version={version} isLive={isLive} />

      {/* 2. Main Centered Terminal Window */}
      <main className="terminal-main-stage">
        <section className="terminal-window-card" aria-label="Glitch Local DevOps Terminal">
          {/* Window Title Bar */}
          <div className="terminal-window-titlebar" aria-hidden="true">
            <span className="terminal-prompt-glyph">&gt;_</span>
            <div className="terminal-window-controls">
              <span className="window-dot active" />
              <span className="window-dot muted" />
              <span className="window-dot muted" />
            </div>
          </div>

          {/* Brand Header */}
          <div className="terminal-card-header">
            <h1 className="terminal-main-title">
              <span className="glitch-effect" data-text="glitch">glitch</span>
              <span className="terminal-cursor-blink">_</span>
            </h1>
            <span className="terminal-subtitle">LOCAL DEVOPS TOOLKIT</span>
          </div>

          {/* 3-Option Auth Selector */}
          <AuthMethodSelector selected={authMethod} onSelect={setAuthMethod} />

          {/* Form */}
          <LoginForm
            onSuccess={() => (onAuthenticated ? onAuthenticated() : onDemoLogin())}
            onDemoLogin={onDemoLogin}
          />
        </section>
      </main>

      {/* 3. Bottom-Left Mode HUD */}
      <div className="terminal-corner-hud bottom-left" aria-hidden="true">
        <div className="mode-stack-bar" />
        <div className="mode-stack-text">
          <span className="mode-item active">MONITOR</span>
          <span className="mode-item">AUTOMATE</span>
          <span className="mode-item">DEPLOY</span>
          <span className="mode-item">OPTIMIZE</span>
        </div>
      </div>

      {/* 4. Bottom-Right Engineering Signature */}
      <div className="terminal-corner-hud bottom-right" aria-hidden="true">
        <span className="terminal-signature-text">
          [ BUILT FOR LAZY GUYS ]<span className="terminal-cursor-blink">_</span>
        </span>
      </div>
    </div>
  );
}
