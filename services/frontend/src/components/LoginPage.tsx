import React, { useState } from "react";
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
  AlertCircle
} from "lucide-react";

interface LoginPageProps {
  onLoginSuccess: (email: string) => void;
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
    <div className="min-h-screen bg-black flex items-center justify-center p-4 selection:bg-cyan-500 selection:text-black">
      <div className="w-full max-w-sm space-y-5">
        
        {/* GLITCh Logo Banner */}
        <div className="flex flex-col items-center justify-center text-center px-2">
          <img 
            src="/glitch-logo.png" 
            alt="GLITCh - TECH | TOOLS | TOMORROW" 
            className="w-full max-w-[280px] h-auto object-contain transition-transform hover:scale-[1.01]"
          />
        </div>

        {/* Pitch Black Login Card */}
        <Card className="bg-[#050508]/90 border-white/10 shadow-2xl backdrop-blur-xl">
          <CardHeader className="space-y-1 text-center pb-2">
            <CardTitle className="text-xl font-bold tracking-tight text-white">
              System Access Portal
            </CardTitle>
            <CardDescription className="text-xs text-zinc-400">
              Enter authorized credentials to proceed to the console
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4 pt-2">
              
              {/* Error Alert */}
              {error && (
                <div className="flex items-center gap-2 p-3 text-xs rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Email Input */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-zinc-300 text-xs font-semibold uppercase tracking-wider">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@glitch.io"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9 bg-black/70 border-zinc-800 text-white placeholder:text-zinc-600 focus-visible:ring-cyan-500"
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-zinc-300 text-xs font-semibold uppercase tracking-wider">
                    Password
                  </Label>
                  <button
                    type="button"
                    onClick={handleDemoFill}
                    className="text-[11px] text-cyan-400 hover:text-cyan-300 transition-colors font-mono"
                  >
                    [Auto-Fill Demo]
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9 pr-10 bg-black/70 border-zinc-800 text-white placeholder:text-zinc-600 focus-visible:ring-fuchsia-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-zinc-500 hover:text-zinc-300 transition-colors"
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
                <label className="flex items-center gap-2 text-xs text-zinc-400 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-zinc-800 bg-black text-cyan-500 focus:ring-cyan-500"
                  />
                  <span>Remember session for 30 days</span>
                </label>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-3 pt-2">
              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-cyan-500 via-purple-600 to-pink-500 hover:from-cyan-400 hover:to-pink-400 text-white font-bold tracking-wide shadow-lg shadow-cyan-500/20" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    AUTHENTICATING...
                  </>
                ) : (
                  "AUTHENTICATE SYSTEM"
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>

        {/* Demo Credentials Footer */}
        <div className="p-3 rounded-lg border border-zinc-800/80 bg-black/60 text-center text-xs text-zinc-400 font-mono">
          <span className="text-zinc-300">DEMO ACCESS:</span>{" "}
          <span className="text-cyan-400">admin@glitch.io</span> / <span className="text-fuchsia-400">password</span>
        </div>

      </div>
    </div>
  );
}
