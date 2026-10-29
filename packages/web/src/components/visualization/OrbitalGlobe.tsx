import { useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { useReducedMotion } from "../../hooks/useReducedMotion";

gsap.registerPlugin(useGSAP);

export function OrbitalGlobe() {
  const containerRef = useRef<HTMLDivElement>(null);
  const orbit1Ref = useRef<SVGGElement>(null);
  const orbit2Ref = useRef<SVGGElement>(null);
  const coreGlowRef = useRef<SVGCircleElement>(null);
  const emitterGlowRef = useRef<SVGEllipseElement>(null);
  const conduitPulseRef = useRef<SVGGElement>(null);
  const reducedMotion = useReducedMotion();

  useGSAP(
    () => {
      if (reducedMotion) return;

      // Slow, steady orbital revolutions
      if (orbit1Ref.current) {
        gsap.to(orbit1Ref.current, {
          rotation: "+=360",
          transformOrigin: "320px 146px",
          duration: 42,
          repeat: -1,
          ease: "none",
        });
      }

      if (orbit2Ref.current) {
        gsap.to(orbit2Ref.current, {
          rotation: "-=360",
          transformOrigin: "320px 146px",
          duration: 54,
          repeat: -1,
          ease: "none",
        });
      }

      // Restrained breathing glow on the central holographic core
      if (coreGlowRef.current) {
        gsap.to(coreGlowRef.current, {
          opacity: 0.85,
          scale: 1.04,
          transformOrigin: "center center",
          duration: 2.6,
          yoyo: true,
          repeat: -1,
          ease: "sine.inOut",
        });
      }

      // Emitter platform focal pulse
      if (emitterGlowRef.current) {
        gsap.to(emitterGlowRef.current, {
          opacity: 0.95,
          duration: 1.8,
          yoyo: true,
          repeat: -1,
          ease: "power1.inOut",
        });
      }

      // Conduit LED data bus transmission
      if (conduitPulseRef.current) {
        gsap.to(conduitPulseRef.current, {
          opacity: 0.35,
          duration: 1.2,
          yoyo: true,
          repeat: -1,
          ease: "steps(2)",
        });
      }
    },
    { scope: containerRef, dependencies: [reducedMotion] }
  );

  return (
    <div className="cyber-platform-stage" ref={containerRef}>
      <svg
        viewBox="0 0 720 395"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="cyber-platform-svg"
        aria-label="Integrated cyber-industrial computing console with volumetric holographic sphere"
      >
        <defs>
          {/* Intense Neon Lime Glow Filter */}
          <filter id="neon-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3.5" result="blur1" />
            <feGaussianBlur in="SourceGraphic" stdDeviation="1.2" result="blur2" />
            <feMerge>
              <feMergeNode in="blur1" />
              <feMergeNode in="blur2" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Core Atmospheric Halo */}
          <radialGradient id="globe-atmosphere" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#c5ff4a" stopOpacity="0.45" />
            <stop offset="35%" stopColor="#78a623" stopOpacity="0.22" />
            <stop offset="70%" stopColor="#182a0c" stopOpacity="0.06" />
            <stop offset="100%" stopColor="#050505" stopOpacity="0" />
          </radialGradient>

          {/* Metallic Industrial Chassis Gradients */}
          <linearGradient id="chassis-bevel-left" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1e2c14" />
            <stop offset="40%" stopColor="#12180d" />
            <stop offset="100%" stopColor="#080c05" />
          </linearGradient>

          <linearGradient id="chassis-front-bay" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#131b0e" />
            <stop offset="30%" stopColor="#0a0f07" />
            <stop offset="100%" stopColor="#050804" />
          </linearGradient>

          <linearGradient id="chassis-bevel-right" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#16220f" />
            <stop offset="100%" stopColor="#070a05" />
          </linearGradient>

          {/* Emitter Circular Deck Multi-Ring Radial */}
          <radialGradient id="platform-deck" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#c5ff4a" stopOpacity="0.95" />
            <stop offset="22%" stopColor="#96ca37" stopOpacity="0.65" />
            <stop offset="55%" stopColor="#1d300f" stopOpacity="0.85" />
            <stop offset="85%" stopColor="#0a0e06" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#050505" stopOpacity="1" />
          </radialGradient>

          {/* Vertical Holo-Field Projection Column */}
          <linearGradient id="holo-beam-vert" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#c5ff4a" stopOpacity="0.55" />
            <stop offset="40%" stopColor="#c5ff4a" stopOpacity="0.16" />
            <stop offset="100%" stopColor="#c5ff4a" stopOpacity="0" />
          </linearGradient>

          {/* Data Bus Pulse Line */}
          <linearGradient id="conduit-grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#c5ff4a" stopOpacity="0.9" />
            <stop offset="55%" stopColor="#679124" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#1c280e" stopOpacity="0.15" />
          </linearGradient>
        </defs>

        {/* ============================================================== */}
        {/* 1. PERSPECTIVE FLOOR GRID & BACKGROUND CONSOLE HUD             */}
        {/* ============================================================== */}
        <g className="background-hud" opacity="0.85">
          {/* Radial grid floor lines anchored to chassis perspective */}
          <line x1="130" y1="330" x2="20" y2="390" stroke="#152110" strokeWidth="1" />
          <line x1="200" y1="330" x2="100" y2="390" stroke="#182713" strokeWidth="1" />
          <line x1="500" y1="330" x2="600" y2="390" stroke="#182713" strokeWidth="1" />
          <line x1="570" y1="330" x2="680" y2="390" stroke="#152110" strokeWidth="1" />

          {/* Left Mode Telemetry HUD Stack */}
          <g className="hud-left-stack">
            <line x1="45" y1="62" x2="45" y2="95" stroke="#c5ff4a" strokeWidth="2.2" filter="url(#neon-glow)" />
            <text x="56" y="69" fill="#c5ff4a" fontSize="8.5" fontFamily="var(--font-mono)" fontWeight="700" letterSpacing="0.18em">
              MONITOR
            </text>
            <text x="56" y="81" fill="#6f7568" fontSize="8" fontFamily="var(--font-mono)" fontWeight="500" letterSpacing="0.18em">
              AUTOMATE
            </text>
            <text x="56" y="93" fill="#6f7568" fontSize="8" fontFamily="var(--font-mono)" fontWeight="500" letterSpacing="0.18em">
              DEPLOY
            </text>
            <text x="56" y="105" fill="#6f7568" fontSize="8" fontFamily="var(--font-mono)" fontWeight="500" letterSpacing="0.18em">
              OPTIMIZE
            </text>
          </g>

          {/* Right Local Synchronization HUD */}
          <g className="hud-right-stack">
            <path d="M 525 58 L 518 58 L 518 93 L 525 93" stroke="#2b3b1f" strokeWidth="1.2" fill="none" />
            <text x="528" y="67" fill="#6f7568" fontSize="8" fontFamily="var(--font-mono)" fontWeight="600" letterSpacing="0.16em">
              YOUR
            </text>
            <text x="528" y="79" fill="#6f7568" fontSize="8" fontFamily="var(--font-mono)" fontWeight="600" letterSpacing="0.16em">
              LOCAL SYSTEM
            </text>
            <text x="528" y="91" fill="#c5ff4a" fontSize="8" fontFamily="var(--font-mono)" fontWeight="700" letterSpacing="0.16em">
              IN SYNC ───
            </text>
          </g>
        </g>

        {/* ============================================================== */}
        {/* 2. INDUSTRIAL CONDUITS & DATA TRANSMISSION BUS                 */}
        {/* ============================================================== */}
        <g className="conduit-assembly">
          {/* Top Industrial Power Cable */}
          <path d="M 475 224 L 535 224 L 560 242 L 710 242" stroke="#141d10" strokeWidth="6.5" strokeLinecap="round" />
          <path d="M 475 224 L 535 224 L 560 242 L 710 242" stroke="#26381a" strokeWidth="2.2" strokeLinecap="round" />
          <path d="M 565 242 L 710 242" stroke="url(#conduit-grad)" strokeWidth="1.5" strokeDasharray="12 5" />

          {/* Middle Fiber Data Conduit with Coupler Housing */}
          <path d="M 465 248 L 525 248 L 550 266 L 710 266" stroke="#141d10" strokeWidth="7.5" strokeLinecap="round" />
          <path d="M 465 248 L 525 248 L 550 266 L 710 266" stroke="#293c1c" strokeWidth="2.4" strokeLinecap="round" />
          <path d="M 555 266 L 710 266" stroke="url(#conduit-grad)" strokeWidth="2" strokeDasharray="10 4" />

          {/* Bottom Ground Cable */}
          <path d="M 455 272 L 515 272 L 540 290 L 710 290" stroke="#141d10" strokeWidth="6.5" strokeLinecap="round" />
          <path d="M 455 272 L 515 272 L 540 290 L 710 290" stroke="#26381a" strokeWidth="2.2" strokeLinecap="round" />
          <path d="M 545 290 L 710 290" stroke="url(#conduit-grad)" strokeWidth="1.5" strokeDasharray="14 6" />

          {/* Data Coupler Blocks & Illuminated Status Indicators */}
          <g ref={conduitPulseRef}>
            <rect x="528" y="218" width="24" height="12" rx="2" fill="#080c05" stroke="#3d5724" strokeWidth="1" />
            <text x="532" y="227" fill="#c5ff4a" fontSize="7.5" fontFamily="var(--font-mono)" fontWeight="700">01 10</text>
            <rect x="498" y="260" width="18" height="10" rx="2" fill="#080c05" stroke="#3d5724" strokeWidth="1" />
            <circle cx="503" cy="265" r="1.8" fill="#c5ff4a" filter="url(#neon-glow)" />
            <circle cx="511" cy="265" r="1.8" fill="#c5ff4a" filter="url(#neon-glow)" />
          </g>
        </g>

        {/* ============================================================== */}
        {/* 3. SOLID CYBER-INDUSTRIAL PLATFORM HARDWARE                    */}
        {/* ============================================================== */}
        <g className="platform-chassis">
          {/* Main Chassis Isometric Footprint */}
          <polygon
            points="105,290 205,220 415,220 515,290 435,350 185,350"
            fill="#060905"
            stroke="#1c2715"
            strokeWidth="1.6"
          />

          {/* Lower Chamfer Step with Mechanical Highlight */}
          <polygon
            points="95,300 200,228 420,228 525,300 440,362 180,362"
            fill="url(#chassis-bevel-left)"
            stroke="#293b1d"
            strokeWidth="1.3"
          />

          {/* Front-Left Recessed Brand Bay */}
          <polygon
            points="120,310 205,310 265,342 180,362 120,334"
            fill="url(#chassis-front-bay)"
            stroke="#3e5b29"
            strokeWidth="1.4"
          />

          {/* Crisp Illuminated "glitch." Logo on Front Chassis Facet */}
          <text
            x="185"
            y="338"
            fill="#c5ff4a"
            fontSize="18"
            fontFamily="var(--font-mono)"
            fontWeight="800"
            letterSpacing="-0.02em"
            filter="url(#neon-glow)"
          >
            glitch.
          </text>

          {/* Front Center Lower Vent & Neon Edge Runner */}
          <polygon
            points="265,342 380,342 370,366 245,366"
            fill="#060805"
            stroke="#273a1c"
            strokeWidth="1"
          />
          {/* Solid Neon Under-Glow Bar */}
          <path
            d="M 265 360 L 355 360"
            stroke="#c5ff4a"
            strokeWidth="3.2"
            strokeLinecap="round"
            filter="url(#neon-glow)"
          />

          {/* Right Chassis Armor Wing with Telemetry Stencil */}
          <polygon
            points="380,342 440,324 495,270 430,270 380,324"
            fill="url(#chassis-bevel-right)"
            stroke="#304721"
            strokeWidth="1.2"
          />
          <g transform="translate(425, 280) skewY(-8)" opacity="0.85">
            <text x="0" y="0" fill="#7d9952" fontSize="6.5" fontFamily="var(--font-mono)" fontWeight="700">LOCAL</text>
            <text x="0" y="8" fill="#586c39" fontSize="6" fontFamily="var(--font-mono)" fontWeight="600">ANALYZE</text>
            <text x="0" y="16" fill="#586c39" fontSize="6" fontFamily="var(--font-mono)" fontWeight="600">AUTOMATE</text>
            <text x="0" y="24" fill="#586c39" fontSize="6" fontFamily="var(--font-mono)" fontWeight="600">OPTIMIZE</text>
          </g>

          {/* Metallic Edge Trims & Seams */}
          <path
            d="M 105,300 L 180,362 L 440,362 L 525,300"
            stroke="#c5ff4a"
            strokeWidth="1.6"
            strokeOpacity="0.75"
            fill="none"
          />

          {/* ============================================================== */}
          {/* 4. CONCENTRIC ILLUMINATED EMITTER PLATFORM                     */}
          {/* ============================================================== */}
          {/* Heavy Outer Deck Ellipse */}
          <ellipse
            cx="310"
            cy="255"
            rx="180"
            ry="45"
            fill="#070a05"
            stroke="#3a5225"
            strokeWidth="1.5"
          />

          {/* Intermediate Stepped Deck Ring */}
          <ellipse
            cx="310"
            cy="251"
            rx="150"
            ry="36"
            fill="url(#platform-deck)"
            stroke="#5d8531"
            strokeWidth="1.8"
          />

          {/* Technical Radial Hash Markers */}
          <ellipse
            cx="310"
            cy="251"
            rx="130"
            ry="30"
            stroke="#c5ff4a"
            strokeWidth="1.4"
            strokeDasharray="18 6"
            strokeOpacity="0.8"
          />

          {/* Concentric Neon Lime Laser Emitter Ring */}
          <ellipse
            ref={emitterGlowRef}
            cx="310"
            cy="251"
            rx="102"
            ry="23"
            fill="#c5ff4a"
            fillOpacity="0.38"
            stroke="#c5ff4a"
            strokeWidth="2.6"
            filter="url(#neon-glow)"
          />

          {/* Core Emitter Focal Beam */}
          <ellipse
            cx="310"
            cy="251"
            rx="58"
            ry="13"
            fill="#ffffff"
            fillOpacity="0.7"
            filter="url(#neon-glow)"
          />

          {/* Upward Volumetric Holographic Beam Column */}
          <polygon
            points="218,249 232,96 388,96 402,249"
            fill="url(#holo-beam-vert)"
            opacity="0.65"
          />
          <line x1="218" y1="249" x2="232" y2="92" stroke="#c5ff4a" strokeWidth="1" strokeDasharray="5 3" strokeOpacity="0.65" />
          <line x1="402" y1="249" x2="388" y2="92" stroke="#c5ff4a" strokeWidth="1" strokeDasharray="5 3" strokeOpacity="0.65" />
        </g>

        {/* ============================================================== */}
        {/* 5. LARGE VOLUMETRIC HOLOGRAPHIC SPHERE                         */}
        {/* ============================================================== */}
        <g className="holographic-globe-assembly">
          {/* Atmospheric Back-Aura */}
          <circle
            ref={coreGlowRef}
            cx="310"
            cy="146"
            r="92"
            fill="url(#globe-atmosphere)"
          />

          {/* Main Sphere Outer Horizon */}
          <circle
            cx="310"
            cy="146"
            r="92"
            stroke="#c5ff4a"
            strokeWidth="1.8"
            strokeOpacity="0.95"
            filter="url(#neon-glow)"
          />

          {/* Latitude Parallels (Depth: Subdued Back vs Razor-Sharp Front) */}
          <path d="M 218 146 A 92 20 0 0 1 402 146" stroke="#253517" strokeWidth="1" strokeDasharray="3 3" opacity="0.4" />
          <path d="M 226 112 A 86 17 0 0 1 394 112" stroke="#202e14" strokeWidth="0.9" strokeDasharray="3 3" opacity="0.35" />
          <path d="M 226 180 A 86 17 0 0 1 394 180" stroke="#202e14" strokeWidth="0.9" strokeDasharray="3 3" opacity="0.35" />

          {/* Front Parallels */}
          <path d="M 218 146 A 92 20 0 0 0 402 146" stroke="#c5ff4a" strokeWidth="1.5" strokeOpacity="0.95" />
          <path d="M 226 112 A 86 17 0 0 0 394 112" stroke="#a7d841" strokeWidth="1.2" strokeOpacity="0.85" />
          <path d="M 226 180 A 86 17 0 0 0 394 180" stroke="#a7d841" strokeWidth="1.2" strokeOpacity="0.85" />
          <path d="M 244 83 A 66 13 0 0 0 376 83" stroke="#7aa32c" strokeWidth="1" strokeOpacity="0.75" />
          <path d="M 244 209 A 66 13 0 0 0 376 209" stroke="#7aa32c" strokeWidth="1" strokeOpacity="0.75" />
          <path d="M 268 63 A 42 8 0 0 0 352 63" stroke="#50701b" strokeWidth="0.8" strokeOpacity="0.6" />
          <path d="M 268 229 A 42 8 0 0 0 352 229" stroke="#50701b" strokeWidth="0.8" strokeOpacity="0.6" />

          {/* Longitude Meridians */}
          <ellipse cx="310" cy="146" rx="31" ry="92" stroke="#c5ff4a" strokeWidth="1.3" strokeOpacity="0.9" />
          <ellipse cx="310" cy="146" rx="64" ry="92" stroke="#9bc93b" strokeWidth="1.1" strokeOpacity="0.8" />
          <ellipse cx="310" cy="146" rx="84" ry="92" stroke="#668c24" strokeWidth="0.9" strokeOpacity="0.65" />
          <line x1="310" y1="54" x2="310" y2="238" stroke="#c5ff4a" strokeWidth="1.4" strokeDasharray="5 3" strokeOpacity="0.95" />

          {/* DENSE CONTINENTAL POINT-CLOUD (AMERICAS TELEMETRY PROJECTION) */}
          {/* North America */}
          <circle cx="264" cy="104" r="2.4" fill="#c5ff4a" filter="url(#neon-glow)" />
          <circle cx="274" cy="98" r="2.2" fill="#ffffff" filter="url(#neon-glow)" />
          <circle cx="286" cy="94" r="2.5" fill="#c5ff4a" filter="url(#neon-glow)" />
          <circle cx="296" cy="92" r="2.2" fill="#c5ff4a" />
          <circle cx="258" cy="116" r="2" fill="#c5ff4a" />
          <circle cx="270" cy="112" r="2.4" fill="#ffffff" />
          <circle cx="282" cy="108" r="2.2" fill="#c5ff4a" />
          <circle cx="294" cy="110" r="2" fill="#b0e03e" />
          <circle cx="262" cy="128" r="2.2" fill="#c5ff4a" />
          <circle cx="276" cy="126" r="2.5" fill="#ffffff" filter="url(#neon-glow)" />
          <circle cx="288" cy="130" r="2" fill="#c5ff4a" />
          <circle cx="300" cy="132" r="2.2" fill="#c5ff4a" />
          <circle cx="270" cy="142" r="2" fill="#b0e03e" />
          <circle cx="282" cy="146" r="2.4" fill="#c5ff4a" filter="url(#neon-glow)" />
          <circle cx="292" cy="150" r="2" fill="#ffffff" />

          {/* Central America & Caribbean */}
          <circle cx="286" cy="162" r="2" fill="#c5ff4a" />
          <circle cx="294" cy="166" r="2.4" fill="#ffffff" filter="url(#neon-glow)" />
          <circle cx="304" cy="170" r="2" fill="#c5ff4a" />

          {/* South America */}
          <circle cx="298" cy="180" r="2.4" fill="#c5ff4a" filter="url(#neon-glow)" />
          <circle cx="308" cy="184" r="2.2" fill="#ffffff" />
          <circle cx="318" cy="190" r="2.5" fill="#c5ff4a" filter="url(#neon-glow)" />
          <circle cx="304" cy="198" r="2.2" fill="#c5ff4a" />
          <circle cx="314" cy="206" r="2" fill="#b0e03e" />
          <circle cx="310" cy="216" r="2.4" fill="#c5ff4a" />
          <circle cx="316" cy="226" r="2" fill="#88b525" />

          {/* Greenland & Arctic Nodes */}
          <circle cx="310" cy="62" r="2.4" fill="#ffffff" stroke="#c5ff4a" strokeWidth="1" filter="url(#neon-glow)" />
          <circle cx="322" cy="66" r="2" fill="#c5ff4a" />
          <circle cx="334" cy="72" r="2" fill="#ffffff" />

          {/* Atlantic & Edge Rim Nodes */}
          <circle cx="342" cy="108" r="2" fill="#c5ff4a" />
          <circle cx="356" cy="120" r="2.4" fill="#c5ff4a" filter="url(#neon-glow)" />
          <circle cx="368" cy="136" r="2" fill="#ffffff" />
          <circle cx="352" cy="160" r="2" fill="#a0cf34" />
          <circle cx="364" cy="172" r="2.2" fill="#c5ff4a" />

          {/* Poles */}
          <circle cx="310" cy="54" r="3.2" fill="#ffffff" stroke="#c5ff4a" strokeWidth="1.8" filter="url(#neon-glow)" />
          <circle cx="310" cy="238" r="3.2" fill="#ffffff" stroke="#c5ff4a" strokeWidth="1.8" filter="url(#neon-glow)" />
        </g>

        {/* ============================================================== */}
        {/* 6. DYNAMIC ORBITAL RINGS & SATELLITE TRACER NODES              */}
        {/* ============================================================== */}
        {/* Orbit Ring 1: Tilted -24deg */}
        <g ref={orbit1Ref}>
          <ellipse
            cx="310"
            cy="146"
            rx="145"
            ry="45"
            stroke="#c5ff4a"
            strokeWidth="1.6"
            strokeDasharray="8 5"
            strokeOpacity="0.95"
            transform="rotate(-24 310 146)"
            filter="url(#neon-glow)"
          />
          <circle
            cx="455"
            cy="146"
            r="4"
            fill="#ffffff"
            stroke="#c5ff4a"
            strokeWidth="2"
            transform="rotate(-24 310 146)"
            filter="url(#neon-glow)"
          />
        </g>

        {/* Orbit Ring 2: Tilted +38deg */}
        <g ref={orbit2Ref}>
          <ellipse
            cx="310"
            cy="146"
            rx="135"
            ry="40"
            stroke="#95c531"
            strokeWidth="1.4"
            strokeOpacity="0.85"
            transform="rotate(38 310 146)"
          />
          <circle
            cx="175"
            cy="146"
            r="3.5"
            fill="#c5ff4a"
            transform="rotate(38 310 146)"
            filter="url(#neon-glow)"
          />
        </g>

        {/* Ambient Hologram Tracer Stars */}
        <circle cx="170" cy="78" r="1.8" fill="#c5ff4a" opacity="0.85" filter="url(#neon-glow)" />
        <circle cx="460" cy="73" r="2" fill="#ffffff" opacity="0.9" filter="url(#neon-glow)" />
        <circle cx="480" cy="208" r="1.6" fill="#c5ff4a" opacity="0.75" />
        <circle cx="140" cy="208" r="1.8" fill="#c5ff4a" opacity="0.85" filter="url(#neon-glow)" />
      </svg>
    </div>
  );
}
