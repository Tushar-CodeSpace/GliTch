import { useState } from "react";
import { LoginScreen } from "./components/auth/LoginScreen";
import { MonitorDashboard } from "./components/monitor/MonitorDashboard";

export default function App() {
  const [authenticated, setAuthenticated] = useState(false);

  if (!authenticated) {
    return (
      <LoginScreen
        onDemoLogin={() => setAuthenticated(true)}
        onAuthenticated={() => setAuthenticated(true)}
      />
    );
  }

  return <MonitorDashboard onSignOut={() => setAuthenticated(false)} />;
}
