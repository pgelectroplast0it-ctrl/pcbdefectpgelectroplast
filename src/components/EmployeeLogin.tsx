import { useState } from "react";
import { BadgeCheck, Lock, User } from "lucide-react";
import {
  authenticateEmployee,
  setEmployeeSession,
  addSessionExtensionRequest,
  getPendingSessionRequestForEmployee,
  getApprovedSessionRequestForEmployee,
  consumeApprovedSessionRequest,
  markEmployeeHasLoggedIn,
} from "@/lib/dataStore";
import { EmployeeSession } from "@/types/pcb";
import pgLogo from "@/assets/pg-logo.jpg";

interface EmployeeLoginProps {
  onSessionStart: (session: EmployeeSession) => void;
}

const EmployeeLogin = ({ onSessionStart }: EmployeeLoginProps) => {
  const [employeeId, setEmployeeId] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loginError, setLoginError] = useState("");
  const [waitingForApproval, setWaitingForApproval] = useState(false);
  const [requestSent, setRequestSent] = useState(false);

  const handleLogin = () => {
    if (!employeeId || !password) return;
    const user = authenticateEmployee(employeeId, password);
    if (!user) {
      setLoginError("Invalid Employee ID or Password.");
      setTimeout(() => setLoginError(""), 4000);
      return;
    }

    const approvedReq = getApprovedSessionRequestForEmployee(employeeId);
    if (approvedReq) {
      consumeApprovedSessionRequest(employeeId);
      const session: EmployeeSession = {
        employeeId: user.employeeId,
        name: name.trim() || user.name,
        location: user.location,
        loginAt: Date.now(),
        expiresAt: Date.now() + 12 * 60 * 60 * 1000,
      };
      setEmployeeSession(session);
      markEmployeeHasLoggedIn(employeeId);
      onSessionStart(session);
      return;
    }

    const pendingReq = getPendingSessionRequestForEmployee(employeeId);
    if (pendingReq) {
      setWaitingForApproval(true);
      setRequestSent(false);
      return;
    }

    if (!user.hasLoggedInBefore) {
      const session: EmployeeSession = {
        employeeId: user.employeeId,
        name: name.trim() || user.name,
        location: user.location,
        loginAt: Date.now(),
        expiresAt: Date.now() + 12 * 60 * 60 * 1000,
      };
      setEmployeeSession(session);
      markEmployeeHasLoggedIn(employeeId);
      onSessionStart(session);
      return;
    }

    addSessionExtensionRequest({
      id: `SER-${Date.now()}`,
      employeeId: user.employeeId,
      employeeName: name.trim() || user.name,
      location: user.location,
      createdByAdminEmail: user.createdByAdminEmail,
      requestedAt: new Date().toISOString(),
      status: "pending",
    });
    setRequestSent(true);
    setWaitingForApproval(false);
  };

  const inputClass =
    "w-full pl-10 pr-4 py-3 rounded-lg border border-input bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30";

  if (waitingForApproval) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="w-full max-w-md rounded-2xl bg-card p-8 shadow-lg border border-border animate-fade-in">
          <div className="flex flex-col items-center mb-6">
            <img src={pgLogo} alt="PG" className="h-14 mb-3 object-contain" />
            <h2 className="text-lg font-bold text-foreground">Waiting for Approval</h2>
            <p className="text-sm text-muted-foreground mt-2 text-center">
              Your session extension request is pending. Please ask your admin to approve.
            </p>
          </div>
          <button
            onClick={() => setWaitingForApproval(false)}
            className="w-full py-3 rounded-lg bg-muted text-foreground font-semibold hover:bg-muted/80 transition"
          >
            ← Back to Login
          </button>
        </div>
      </div>
    );
  }

  if (requestSent) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="w-full max-w-md rounded-2xl bg-card p-8 shadow-lg border border-border animate-fade-in">
          <div className="flex flex-col items-center mb-6">
            <img src={pgLogo} alt="PG" className="h-14 mb-3 object-contain" />
            <h2 className="text-lg font-bold text-foreground">Request Sent!</h2>
            <p className="text-sm text-muted-foreground mt-2 text-center">
              Your session expired. Request sent to admin. Please ask admin to approve, then login again.
            </p>
          </div>
          <button
            onClick={() => setRequestSent(false)}
            className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 transition"
          >
            ← Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md rounded-2xl bg-card p-8 shadow-lg border border-border animate-fade-in">
        <div className="flex flex-col items-center mb-6">
          <img src={pgLogo} alt="PG" className="h-14 mb-3 object-contain" />
          <h2 className="text-lg font-bold text-foreground">Employee Login</h2>
          <p className="text-sm text-muted-foreground">Login with admin-provided credentials</p>
        </div>

        <div className="space-y-4">
          <div className="relative">
            <BadgeCheck className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              placeholder="Employee ID"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              className={inputClass}
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              className={inputClass}
            />
          </div>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              placeholder="Your Name (optional)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClass}
            />
          </div>

          <button
            onClick={handleLogin}
            disabled={!employeeId || !password}
            className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 transition disabled:opacity-50"
          >
            Login (12hr Session)
          </button>

          {loginError && (
            <div className="bg-destructive/10 text-destructive text-sm text-center py-2 px-4 rounded-lg animate-fade-in">
              {loginError}
            </div>
          )}
        </div>

        <p className="text-xs text-center text-muted-foreground mt-4">
          Session expires in 12 hours. After expiry, admin approval required.
        </p>
      </div>
    </div>
  );
};

export default EmployeeLogin;
