import React, { useState, useEffect, useRef } from "react";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  Loader2, 
  AlertCircle,
  Activity,
  ShieldCheck,
  Zap,
  Server,
  Rocket,
  Cpu,
  Wrench
} from "lucide-react";

interface LoginPageProps {
  onLoginSuccess: (email: string) => void;
}

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
}

interface Pulse {
  fromNode: number;
  toNode: number;
  progress: number;
  speed: number;
}

function NetworkThreadCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;

    const resizeCanvas = () => {
      canvas.width = canvas.parentElement?.clientWidth || window.innerWidth / 2;
      canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Mouse Tracking
    const mouse = { x: -1000, y: -1000, active: false };
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.active = true;
    };
    const handleMouseLeave = () => {
      mouse.active = false;
      mouse.x = -1000;
      mouse.y = -1000;
    };

    // Click Ripple Effect
    const ripples: { x: number; y: number; radius: number; maxRadius: number; alpha: number }[] = [];
    const handleClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      ripples.push({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        radius: 5,
        maxRadius: 180,
        alpha: 0.9
      });
    };

    const parentEl = canvas.parentElement;
    if (parentEl) {
      parentEl.addEventListener("mousemove", handleMouseMove);
      parentEl.addEventListener("mouseleave", handleMouseLeave);
      parentEl.addEventListener("click", handleClick);
    }

    // Initialize Nodes
    const nodeCount = 42;
    const nodes: Node[] = [];
    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.7,
        vy: (Math.random() - 0.5) * 0.7,
        radius: Math.random() * 2 + 1.5,
      });
    }

    // Helper: Find connected neighbors
    const getConnections = () => {
      const maxDistance = 160;
      const connections: { from: number; to: number; dist: number }[] = [];
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < maxDistance) {
            connections.push({ from: i, to: j, dist });
          }
        }
      }
      return connections;
    };

    // Initialize Light Pulses traveling along threads
    const pulseCount = 24;
    const pulses: Pulse[] = [];

    const resetPulse = (pulse: Pulse) => {
      const connections = getConnections();
      if (connections.length > 0) {
        const randomConn = connections[Math.floor(Math.random() * connections.length)];
        pulse.fromNode = randomConn.from;
        pulse.toNode = randomConn.to;
        pulse.progress = 0;
        pulse.speed = 0.005 + Math.random() * 0.009;
      }
    };

    for (let i = 0; i < pulseCount; i++) {
      const p: Pulse = { fromNode: 0, toNode: 0, progress: 0, speed: 0.005 };
      resetPulse(p);
      p.progress = Math.random();
      pulses.push(p);
    }

    // Main Render Loop
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Render Ripples
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        r.radius += 4;
        r.alpha *= 0.95;

        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(52, 211, 153, ${r.alpha})`;
        ctx.lineWidth = 2;
        ctx.stroke();

        if (r.alpha < 0.01 || r.radius > r.maxRadius) {
          ripples.splice(i, 1);
        }
      }

      // 1. Update & Draw Nodes with Mouse Attraction
      nodes.forEach((node) => {
        // Mouse gravitation force
        if (mouse.active) {
          const mdx = mouse.x - node.x;
          const mdy = mouse.y - node.y;
          const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
          if (mdist < 180 && mdist > 5) {
            const force = (180 - mdist) / 180 * 0.4;
            node.x += (mdx / mdist) * force;
            node.y += (mdy / mdist) * force;
          }
        }

        node.x += node.vx;
        node.y += node.vy;

        // Bounce off canvas edges
        if (node.x < 0 || node.x > canvas.width) node.vx *= -1;
        if (node.y < 0 || node.y > canvas.height) node.vy *= -1;

        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(16, 185, 129, 0.85)";
        ctx.shadowColor = "#10b981";
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // 2. Draw Network Threads
      const maxDistance = 160;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxDistance) {
            const alpha = (1 - dist / maxDistance) * 0.3;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `rgba(16, 185, 129, ${alpha})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }

        // Draw connections to active Mouse cursor
        if (mouse.active) {
          const mdx = nodes[i].x - mouse.x;
          const mdy = nodes[i].y - mouse.y;
          const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
          if (mdist < 140) {
            const alpha = (1 - mdist / 140) * 0.6;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.strokeStyle = `rgba(52, 211, 153, ${alpha})`;
            ctx.lineWidth = 1.5;
            ctx.stroke();
          }
        }
      }

      // Draw glowing cursor node if active
      if (mouse.active) {
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = "#34d399";
        ctx.shadowColor = "#34d399";
        ctx.shadowBlur = 16;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // 3. Draw Traveling Light Pulses along Threads
      pulses.forEach((pulse) => {
        const from = nodes[pulse.fromNode];
        const to = nodes[pulse.toNode];

        if (from && to) {
          pulse.progress += pulse.speed;
          if (pulse.progress >= 1) {
            resetPulse(pulse);
          } else {
            const px = from.x + (to.x - from.x) * pulse.progress;
            const py = from.y + (to.y - from.y) * pulse.progress;

            // Draw glowing head
            ctx.beginPath();
            ctx.arc(px, py, 3.5, 0, Math.PI * 2);
            ctx.fillStyle = "#34d399";
            ctx.shadowColor = "#34d399";
            ctx.shadowBlur = 16;
            ctx.fill();
            ctx.shadowBlur = 0;

            // Draw light tail
            const tailLen = 0.18;
            const tailProgress = Math.max(0, pulse.progress - tailLen);
            const tx = from.x + (to.x - from.x) * tailProgress;
            const ty = from.y + (to.y - from.y) * tailProgress;

            const grad = ctx.createLinearGradient(px, py, tx, ty);
            grad.addColorStop(0, "rgba(52, 211, 153, 0.9)");
            grad.addColorStop(1, "rgba(16, 185, 129, 0)");

            ctx.beginPath();
            ctx.moveTo(px, py);
            ctx.lineTo(tx, ty);
            ctx.strokeStyle = grad;
            ctx.lineWidth = 2;
            ctx.stroke();
          }
        } else {
          resetPulse(pulse);
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      if (parentEl) {
        parentEl.removeEventListener("mousemove", handleMouseMove);
        parentEl.removeEventListener("mouseleave", handleMouseLeave);
        parentEl.removeEventListener("click", handleClick);
      }
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 w-full h-full pointer-events-auto opacity-80 cursor-crosshair"
    />
  );
}

export function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Please fill in both email and password.");
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      if (email.includes("@") && password.length >= 4) {
        onLoginSuccess(email);
      } else {
        setError("Invalid email or password. Try admin@glitch.io / password");
      }
    }, 700);
  };

  const handleDemoFill = () => {
    setEmail("admin@glitch.io");
    setPassword("password");
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#080b0a] text-zinc-100 flex flex-col lg:flex-row selection:bg-emerald-500 selection:text-black overflow-hidden">
      
      {/* LEFT PANEL: NETWORK THREAD & BRANDING */}
      <div className="relative flex-1 lg:w-7/12 min-h-[400px] lg:min-h-screen bg-[#060908] flex flex-col justify-between p-8 lg:p-12 overflow-hidden border-b lg:border-b-0 lg:border-r border-zinc-800/80">
        
        {/* Animated Network Canvas Background */}
        <NetworkThreadCanvas />

        {/* Hero Branding Content */}
        <div className="relative z-10 space-y-6 max-w-xl my-auto py-12 pointer-events-none">
          <h1 className="text-5xl lg:text-6xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500 font-mono drop-shadow-[0_0_25px_rgba(16,185,129,0.35)] flex items-center">
            GliTch
            <span className="inline-block w-3 lg:w-4 h-9 lg:h-12 ml-2 bg-emerald-400 animate-terminal-blink" />
          </h1>
          <p className="text-sm font-mono tracking-[0.3em] text-emerald-400 uppercase font-semibold">
            TECH &bull; TOOLS &bull; TOMORROW
          </p>
          <p className="text-sm text-zinc-400 leading-relaxed font-sans max-w-md">
            Personalized DevOps console for multi-client real-time infrastructure, API services, and automated workflow management.
          </p>

          {/* DevOps Activity Highlights Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 font-mono text-xs pointer-events-auto">
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-black/60 border border-zinc-800 text-zinc-300 backdrop-blur-md hover:border-emerald-500/40 transition-colors">
              <Rocket className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>CI/CD Deployments</span>
            </div>
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-black/60 border border-zinc-800 text-zinc-300 backdrop-blur-md hover:border-emerald-500/40 transition-colors">
              <Cpu className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Automated Workflows</span>
            </div>
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-black/60 border border-zinc-800 text-zinc-300 backdrop-blur-md hover:border-emerald-500/40 transition-colors">
              <Activity className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Live Monitoring</span>
            </div>
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-black/60 border border-zinc-800 text-zinc-300 backdrop-blur-md hover:border-emerald-500/40 transition-colors">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Patch & Release Control</span>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="relative z-10 flex items-center justify-between text-xs font-mono text-zinc-500 pt-4 border-t border-zinc-900">
          <span>GliTch Console &copy; 2026</span>
          <span className="text-emerald-500/80 font-semibold">&bull; Console System Active</span>
        </div>

      </div>

      {/* RIGHT PANEL: LOGIN BOX */}
      <div className="flex-1 lg:w-5/12 flex items-center justify-center p-6 lg:p-12 bg-[#080b0a] relative">
        {/* Subtle background ambient light */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="w-full max-w-sm space-y-6 relative z-10">
          
          {/* Professional Login Card */}
          <Card className="bg-[#0b100e] border-emerald-500/20 shadow-[0_20px_50px_rgba(0,0,0,0.8)] rounded-2xl overflow-hidden backdrop-blur-2xl">
            <div className="h-1 w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600" />
            
            <CardHeader className="space-y-1 text-center pb-2 pt-6">
              <CardTitle className="text-2xl font-extrabold tracking-tight text-white font-sans">
                System Access Portal
              </CardTitle>
              <CardDescription className="text-xs text-zinc-400">
                Enter authorized credentials to access the console
              </CardDescription>
            </CardHeader>

            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4 pt-4">
                
                {/* Error Alert */}
                {error && (
                  <div className="flex items-center gap-2.5 p-3 text-xs rounded-xl bg-rose-500/10 text-rose-300 border border-rose-500/20 backdrop-blur-sm">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Email Input */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-zinc-300 text-xs font-semibold uppercase tracking-wider font-mono">
                    Email Address
                  </Label>
                  <div className="relative group">
                    <Mail className="absolute left-3.5 top-3 h-4 w-4 text-zinc-500 group-focus-within:text-emerald-400 transition-colors" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="admin@glitch.io"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 h-10 bg-[#060908] border-zinc-800 text-white placeholder:text-zinc-600 focus-visible:ring-emerald-500/50 focus-visible:border-emerald-500/60 rounded-xl transition-all font-sans text-sm"
                      required
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-zinc-300 text-xs font-semibold uppercase tracking-wider font-mono">
                      Password
                    </Label>
                    <button
                      type="button"
                      onClick={handleDemoFill}
                      className="text-[11px] text-emerald-400 hover:text-emerald-300 transition-colors font-mono hover:underline"
                    >
                      [Auto-Fill Demo]
                    </button>
                  </div>
                  <div className="relative group">
                    <Lock className="absolute left-3.5 top-3 h-4 w-4 text-zinc-500 group-focus-within:text-emerald-400 transition-colors" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10 h-10 bg-[#060908] border-zinc-800 text-white placeholder:text-zinc-600 focus-visible:ring-emerald-500/50 focus-visible:border-emerald-500/60 rounded-xl transition-all font-sans text-sm"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3 text-zinc-500 hover:text-zinc-300 transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Remember Me */}
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2.5 text-xs text-zinc-400 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-zinc-800 bg-[#060908] text-emerald-500 focus:ring-emerald-500/40 w-4 h-4"
                    />
                    <span>Remember session for 30 days</span>
                  </label>
                </div>
              </CardContent>

              <CardFooter className="flex flex-col gap-3 pt-4 pb-6">
                <Button 
                  type="submit" 
                  className="w-full h-11 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold tracking-wider rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all transform active:scale-[0.98]" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center text-black">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin text-black" />
                      AUTHENTICATING...
                    </span>
                  ) : (
                    "AUTHENTICATE SYSTEM"
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>

          {/* Demo Credentials Footer */}
          <div className="p-3.5 rounded-xl border border-zinc-800 bg-[#060908] text-center text-xs text-zinc-400 font-mono flex items-center justify-center gap-2 shadow-inner">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>DEMO:</span>{" "}
            <span className="text-emerald-400 font-semibold">admin@glitch.io</span> / <span className="text-zinc-300 font-semibold">password</span>
          </div>

        </div>
      </div>

    </div>
  );
}
