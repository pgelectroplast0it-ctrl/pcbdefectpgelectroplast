import { useState } from "react";
import { Lock, MapPin } from "lucide-react";
import pgLogo from "@/assets/pg-logo.jpg";
import { Location, LOCATIONS } from "@/types/pcb";
import { setLoginLocation } from "@/lib/dataStore";

interface LoginPageProps {
  onLogin: (location: Location) => void;
}

const DASHBOARD_PASSWORD = "pcb@2024";

const LoginPage = ({ onLogin }: LoginPageProps) => {
  const [password, setPassword] = useState("");
  const [location, setLocation] = useState<Location | "">("");
  const [error, setError] = useState(false);

  const handleLogin = () => {
    if (password !== DASHBOARD_PASSWORD || !location) {
      setError(true);
      setTimeout(() => setError(false), 3000);
      return;
    }
    setLoginLocation(location);
    localStorage.setItem("pcb_dashboard_auth", "authenticated");
    onLogin(location);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-md rounded-2xl bg-card p-10 shadow-lg border border-border animate-fade-in">
        <div className="flex flex-col items-center mb-6">
          <img src={pgLogo} alt="PG Logo" className="h-16 mb-4 object-contain" />
          <h1 className="text-xl font-bold text-foreground">PCB Defect Monitoring</h1>
          <p className="text-sm text-muted-foreground mt-1">Enter password and select location</p>
        </div>

        <div className="space-y-4">
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="password"
              placeholder="Enter Dashboard Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-input bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
            />
          </div>

          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value as Location)}
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-input bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 appearance-none"
            >
              <option value="">Select Location</option>
              {LOCATIONS.map((loc) => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          </div>

          <button
            onClick={handleLogin}
            disabled={!password || !location}
            className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-semibold text-base hover:opacity-90 transition disabled:opacity-50"
          >
            Login
          </button>

          {error && (
            <div className="bg-destructive/10 text-destructive text-sm text-center py-2 px-4 rounded-lg animate-fade-in">
              Invalid password or please select location!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
