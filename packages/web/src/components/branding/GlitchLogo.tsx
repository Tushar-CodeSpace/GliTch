type Props = {
  size?: "sm" | "md" | "lg";
  className?: string;
};

export function GlitchLogo({ size = "md", className = "" }: Props) {
  const iconSizes = {
    sm: 24,
    md: 28,
    lg: 34,
  };

  const titleSizes = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
  };

  const s = iconSizes[size];

  return (
    <div className={`glitch-logo-brand ${className}`}>
      {/* Inline Vector Logo Icon */}
      <div
        className="glitch-logo-mark"
        style={{ width: `${s}px`, height: `${s}px` }}
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="glitch-logo-svg"
        >
          <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
        </svg>
      </div>

      {/* Wordmark and subtitle */}
      <div className="glitch-logo-text">
        <span className={`glitch-wordmark ${titleSizes[size]}`}>
          glitch<span className="text-accent">.</span>
        </span>
        <span className="glitch-submark">LOCAL DEVOPS</span>
      </div>
    </div>
  );
}

