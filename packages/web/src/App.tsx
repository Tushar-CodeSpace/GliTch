import { useState, useEffect } from "react";
import { LoginScreen } from "./components/auth/LoginScreen";
import { MonitorDashboard } from "./components/monitor/MonitorDashboard";
import {
  isAuthenticated,
  setDemoSession,
  clearAuthSession,
  verifyCurrentSession,
} from "./lib/auth";

export default function App() {
  const [authenticated, setAuthenticated] = useState<boolean>(() => isAuthenticated());

  useEffect(() => {
    // If authenticated with a token, verify validity with local backend
    if (authenticated) {
      verifyCurrentSession().then((valid) => {
        if (!valid) {
          setAuthenticated(false);
        }
      });
    }
  }, []);

  function handleDemoLogin() {
    setDemoSession();
    setAuthenticated(true);
  }

  function handleAuthenticated() {
    setAuthenticated(true);
  }

  function handleSignOut() {
    clearAuthSession();
    setAuthenticated(false);
  }

  if (!authenticated) {
    return (
      <LoginScreen
        onDemoLogin={handleDemoLogin}
        onAuthenticated={handleAuthenticated}
      />
    );
  }

  return <MonitorDashboard onSignOut={handleSignOut} />;
}
