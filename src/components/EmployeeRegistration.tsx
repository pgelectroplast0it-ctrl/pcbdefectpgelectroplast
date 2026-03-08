import { useState, useEffect } from "react";
import { User, Mail, BadgeCheck, Factory, UserCheck, LogIn } from "lucide-react";
import { addEmployeeRequest, getApprovedEmployee, setEmployeeSession, syncEmployeesFromSheet } from "@/lib/dataStore";
import { Plant, PLANTS, ADMINS, EmployeeSession } from "@/types/pcb";
import pgLogo from "@/assets/pg-logo.jpg";

interface EmployeeRegistrationProps {
  onBack: () => void;
  onSessionStart: (session: EmployeeSession) => void;
}

const EmployeeRegistration = ({ onBack, onSessionStart }: EmployeeRegistrationProps) => {
  const [mode, setMode] = useState<"choose" | "register" | "login">("choose");
  useEffect(() => { syncEmployeesFromSheet().catch(() => {}); }, []);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [empId, setEmpId] = useState("");
  const [plant, setPlant] = useState<Plant | "">("");
  const [selectedAdmin, setSelectedAdmin] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loginError, setLoginError] = useState("");

  const handleRegister = () => {
    if (!name || !email || !empId || !plant || !selectedAdmin) return;
    addEmployeeRequest({
      id: `REQ-${Date.now()}`,
      name,
      email,
      employeeId: empId,
      plant: plant as Plant,
      status: "pending",
      requestedAt: new Date().toISOString(),
      assignedAdminEmail: selectedAdmin,
    });
    setSubmitted(true);
  };

  const handleLogin = () => {
    if (!email || !empId) return;
    const approved = getApprovedEmployee(email, empId);
    if (approved) {
      const session: EmployeeSession = {
        employeeId: approved.employeeId,
        name: approved.name,
        email: approved.email,
        plant: approved.plant,
        loginAt: Date.now(),
        expiresAt: Date.now() + 12 * 60 * 60 * 1000, // 12 hours
      };
      setEmployeeSession(session);
      onSessionStart(session);
    } else {
      setLoginError("Registration not approved yet or invalid credentials.");
      setTimeout(() => setLoginError(""), 4000);
    }
  };

  const selectedAdminObj = ADMINS.find(a => a.email === selectedAdmin);

  const inputClass = "w-full pl-10 pr-4 py-3 rounded-lg border border-input bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30";

  if (mode === "choose") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="w-full max-w-md rounded-2xl bg-card p-8 shadow-lg border border-border animate-fade-in">
          <div className="flex flex-col items-center mb-6">
            <img src={pgLogo} alt="PG" className="h-14 mb-3 object-contain" />
            <h2 className="text-lg font-bold text-foreground">Employee Portal</h2>
            <p className="text-sm text-muted-foreground">Register or login to submit defect reports</p>
          </div>

          <div className="space-y-3">
            <button onClick={() => setMode("register")}
              className="w-full py-3.5 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 transition flex items-center justify-center gap-2">
              <UserCheck className="h-4 w-4" /> New Registration
            </button>
            <button onClick={() => setMode("login")}
              className="w-full py-3.5 rounded-lg bg-muted text-foreground font-semibold hover:bg-muted/80 transition flex items-center justify-center gap-2 border border-border">
              <LogIn className="h-4 w-4" /> Already Registered? Login
            </button>
          </div>

          <p className="text-xs text-center text-muted-foreground mt-4">Session valid for 12 hours after login</p>

          <button onClick={onBack} className="mt-4 text-sm text-primary font-semibold hover:underline w-full text-center">
            ← Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (mode === "login") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="w-full max-w-md rounded-2xl bg-card p-8 shadow-lg border border-border animate-fade-in">
          <div className="flex flex-col items-center mb-6">
            <img src={pgLogo} alt="PG" className="h-14 mb-3 object-contain" />
            <h2 className="text-lg font-bold text-foreground">Employee Login</h2>
            <p className="text-sm text-muted-foreground">Login with your approved credentials</p>
          </div>

          <div className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input placeholder="Your Email" value={email} onChange={e => setEmail(e.target.value)} type="email" className={inputClass} />
            </div>
            <div className="relative">
              <BadgeCheck className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input placeholder="Employee ID" value={empId} onChange={e => setEmpId(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleLogin()} className={inputClass} />
            </div>

            <button onClick={handleLogin} disabled={!email || !empId}
              className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 transition disabled:opacity-50">
              Login (12hr Session)
            </button>

            {loginError && (
              <div className="bg-destructive/10 text-destructive text-sm text-center py-2 px-4 rounded-lg animate-fade-in">
                {loginError}
              </div>
            )}
          </div>

          <button onClick={() => setMode("choose")} className="mt-4 text-sm text-primary font-semibold hover:underline w-full text-center">
            ← Back
          </button>
        </div>
      </div>
    );
  }

  // Registration mode
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-lg rounded-2xl bg-card p-8 shadow-lg border border-border animate-fade-in">
        <div className="flex flex-col items-center mb-6">
          <img src={pgLogo} alt="PG" className="h-14 mb-3 object-contain" />
          <h2 className="text-lg font-bold text-foreground">Employee Registration</h2>
          <p className="text-sm text-muted-foreground">Register to submit defect entries</p>
        </div>

        {submitted ? (
          <div className="bg-info/10 text-info rounded-xl p-6 text-center animate-fade-in">
            <p className="font-bold text-base">Request Submitted!</p>
            <p className="text-sm mt-1">Your request has been sent to <strong>{selectedAdminObj?.name}</strong>.</p>
            <p className="text-sm mt-1">After approval, use <strong>Login</strong> with your Email + Employee ID.</p>
            <button onClick={() => { setMode("login"); setSubmitted(false); }}
              className="mt-4 px-6 py-2 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition">
              Go to Login
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input placeholder="Employee Name" value={name} onChange={e => setName(e.target.value)} className={inputClass} />
            </div>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input placeholder="Employee Email" value={email} onChange={e => setEmail(e.target.value)} type="email" className={inputClass} />
            </div>
            <div className="relative">
              <BadgeCheck className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input placeholder="Employee ID" value={empId} onChange={e => setEmpId(e.target.value)} className={inputClass} />
            </div>
            <div className="relative">
              <Factory className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <select value={plant} onChange={e => setPlant(e.target.value as Plant)}
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-input bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 appearance-none">
                <option value="">Select Plant</option>
                {PLANTS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1.5">
                <UserCheck className="h-3.5 w-3.5" /> Select Admin to send request
              </label>
              <div className="space-y-2 mt-1.5">
                {ADMINS.map(admin => (
                  <label key={admin.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition ${
                      selectedAdmin === admin.email ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
                    }`}>
                    <input type="radio" name="admin" value={admin.email}
                      checked={selectedAdmin === admin.email}
                      onChange={e => setSelectedAdmin(e.target.value)}
                      className="accent-primary" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{admin.name}</p>
                      <p className="text-xs text-muted-foreground">{admin.email}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <button onClick={handleRegister} disabled={!name || !email || !empId || !plant || !selectedAdmin}
              className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 transition disabled:opacity-50">
              Submit Request
            </button>
          </div>
        )}

        <button onClick={() => setMode("choose")} className="mt-4 text-sm text-primary font-semibold hover:underline w-full text-center">
          ← Back
        </button>
      </div>
    </div>
  );
};

export default EmployeeRegistration;
