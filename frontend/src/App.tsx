import React, { useState } from "react";
import { LoginPage } from "@/components/LoginPage";
import { Dashboard } from "@/components/Dashboard";

export default function App() {
  const [userEmail, setUserEmail] = useState<string | null>(() => {
    return localStorage.getItem("glitch_user");
  });

  const handleLoginSuccess = (email: string) => {
    localStorage.setItem("glitch_user", email);
    setUserEmail(email);
  };

  const handleLogout = () => {
    localStorage.removeItem("glitch_user");
    setUserEmail(null);
  };

  return (
    <div className="dark min-h-screen bg-background text-foreground">
      {userEmail ? (
        <Dashboard userEmail={userEmail} onLogout={handleLogout} />
      ) : (
        <LoginPage onLoginSuccess={handleLoginSuccess} />
      )}
    </div>
  );
}
