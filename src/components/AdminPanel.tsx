import { useState, useEffect } from "react";
import {
  getEmployeeRequestsForAdmin,
  updateEmployeeRequest,
  deleteEmployeeRequest,
  getDefectReports,
  deleteDefectReport,
  authenticateAdmin,
  getAuthenticatedAdmin,
  logoutAdmin,
  syncEmployeesFromSheet,
  getEmployeeUsersByAdmin,
  addEmployeeUser,
  deleteEmployeeUser,
  getSessionRequestsForAdmin,
  approveSessionExtensionRequest,
} from "@/lib/dataStore";
import { Check, X, Trash2, Users, Database, ArrowLeft, Lock, LogOut, Mail, UserPlus, Clock } from "lucide-react";
import { Admin, ADMINS, EmployeeRequest } from "@/types/pcb";
import pgLogo from "@/assets/pg-logo.jpg";

interface AdminPanelProps {
  onBack: () => void;
}

const AdminPanel = ({ onBack }: AdminPanelProps) => {
  const [admin, setAdmin] = useState<Admin | null>(getAuthenticatedAdmin());
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [tab, setTab] = useState<"employees" | "reports" | "create-user" | "session-requests">("employees");
  const [refresh, setRefresh] = useState(0);

  const [createEmpId, setCreateEmpId] = useState("");
  const [createPassword, setCreatePassword] = useState("");
  const [createName, setCreateName] = useState("");
  const [createSuccess, setCreateSuccess] = useState(false);

  const [employeesSynced, setEmployeesSynced] = useState<EmployeeRequest[]>([]);
  const reports = getDefectReports();

  const employeeUsers = admin ? getEmployeeUsersByAdmin(admin.email) : [];
  const sessionRequests = admin ? getSessionRequestsForAdmin(admin.email).filter((r) => r.status === "pending") : [];

  useEffect(() => {
    if (!admin) {
      setEmployeesSynced([]);
      return;
    }
    syncEmployeesFromSheet().then(() => setEmployeesSynced(getEmployeeRequestsForAdmin(admin.email)));
  }, [admin, refresh]);

  const handleLogin = () => {
    const result = authenticateAdmin(email, password);
    if (result) {
      setAdmin(result);
      setError(false);
      setEmail("");
      setPassword("");
    } else {
      setError(true);
      setTimeout(() => setError(false), 3000);
    }
  };

  const handleLogout = () => {
    logoutAdmin();
    setAdmin(null);
    setEmail("");
    setPassword("");
  };

  const handleApprove = (id: string) => {
    updateEmployeeRequest(id, "approved");
    setEmployeesSynced(getEmployeeRequestsForAdmin(admin!.email));
    setRefresh((r) => r + 1);
  };
  const handleReject = (id: string) => {
    updateEmployeeRequest(id, "rejected");
    setEmployeesSynced(getEmployeeRequestsForAdmin(admin!.email));
    setRefresh((r) => r + 1);
  };
  const handleDeleteEmp = (id: string) => {
    deleteEmployeeRequest(id);
    setEmployeesSynced(getEmployeeRequestsForAdmin(admin!.email));
    setRefresh((r) => r + 1);
  };
  const handleDeleteReport = (id: string) => {
    deleteDefectReport(id);
    setRefresh((r) => r + 1);
  };

  const handleCreateUser = () => {
    if (!admin || !createEmpId || !createPassword) return;
    addEmployeeUser({
      id: `EMP-${Date.now()}`,
      employeeId: createEmpId.trim(),
      password: createPassword,
      name: createName.trim(),
      location: admin.location,
      createdByAdminEmail: admin.email,
      createdAt: new Date().toISOString(),
    });
    setCreateSuccess(true);
    setCreateEmpId("");
    setCreatePassword("");
    setCreateName("");
    setTimeout(() => setCreateSuccess(false), 3000);
    setRefresh((r) => r + 1);
  };

  const handleDeleteUser = (id: string) => {
    deleteEmployeeUser(id);
    setRefresh((r) => r + 1);
  };

  const handleApproveSessionRequest = (id: string) => {
    approveSessionExtensionRequest(id);
    setRefresh((r) => r + 1);
  };

  const tabClass = (active: boolean) =>
    `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition ${active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`;

  if (!admin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="w-full max-w-md rounded-2xl bg-card p-10 shadow-lg border border-border animate-fade-in">
          <div className="flex flex-col items-center mb-6">
            <img src={pgLogo} alt="PG" className="h-14 mb-3 object-contain" />
            <h2 className="text-xl font-bold text-foreground">Admin Panel Login</h2>
            <p className="text-sm text-muted-foreground mt-1">Only authorized admins can access</p>
          </div>

          <div className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="email"
                placeholder="Admin Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-input bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="password"
                placeholder="Admin Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-input bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <button
              onClick={handleLogin}
              className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 transition"
            >
              Login as Admin
            </button>

            {error && (
              <div className="bg-destructive/10 text-destructive text-sm text-center py-2 px-4 rounded-lg animate-fade-in">
                Invalid admin credentials!
              </div>
            )}

            <div className="bg-muted rounded-lg p-3 mt-2">
              <p className="text-xs font-semibold text-foreground mb-1.5">Registered Admins:</p>
              {ADMINS.map((a) => (
                <p key={a.id} className="text-xs text-muted-foreground">
                  {a.name} — {a.email} ({a.location})
                </p>
              ))}
            </div>
          </div>

          <button onClick={onBack} className="mt-4 text-sm text-primary font-semibold hover:underline w-full text-center">
            ← Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4" key={refresh}>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="p-2 rounded-lg hover:bg-muted transition">
              <ArrowLeft className="h-5 w-5 text-foreground" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-foreground">Admin Panel</h1>
              <p className="text-xs text-muted-foreground">
                {admin.name} ({admin.email}) — {admin.location}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <button onClick={() => setTab("create-user")} className={tabClass(tab === "create-user")}>
              <UserPlus className="h-4 w-4" /> Create User
            </button>
            <button onClick={() => setTab("session-requests")} className={tabClass(tab === "session-requests")}>
              <Clock className="h-4 w-4" /> Session ({sessionRequests.length})
            </button>
            <button onClick={() => setTab("employees")} className={tabClass(tab === "employees")}>
              <Users className="h-4 w-4" /> Requests ({employeesSynced.length})
            </button>
            <button onClick={() => setTab("reports")} className={tabClass(tab === "reports")}>
              <Database className="h-4 w-4" /> Reports ({reports.length})
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-destructive text-destructive-foreground hover:opacity-90 transition ml-2"
            >
              <LogOut className="h-4 w-4" /> Logout
            </button>
          </div>
        </div>

        {tab === "create-user" && (
          <div className="bg-card rounded-xl shadow-sm border border-border p-6 max-w-md">
            <h3 className="text-base font-bold text-foreground mb-4">Create Employee User</h3>
            <p className="text-xs text-muted-foreground mb-4">
              Location: <strong>{admin.location}</strong> (employee will only access this location)
            </p>
            <div className="space-y-3">
              <input
                placeholder="Employee ID"
                value={createEmpId}
                onChange={(e) => setCreateEmpId(e.target.value)}
                className="w-full py-2.5 px-3 rounded-lg border border-input bg-background text-sm"
              />
              <input
                type="password"
                placeholder="Password"
                value={createPassword}
                onChange={(e) => setCreatePassword(e.target.value)}
                className="w-full py-2.5 px-3 rounded-lg border border-input bg-background text-sm"
              />
              <input
                placeholder="Name (optional)"
                value={createName}
                onChange={(e) => setCreateName(e.target.value)}
                className="w-full py-2.5 px-3 rounded-lg border border-input bg-background text-sm"
              />
              <button
                onClick={handleCreateUser}
                disabled={!createEmpId || !createPassword}
                className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 disabled:opacity-50"
              >
                Create User
              </button>
              {createSuccess && (
                <p className="text-sm text-green-600 font-medium">User created! Employee can now login at /employee</p>
              )}
            </div>
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-xs font-semibold text-foreground mb-2">Created Users ({employeeUsers.length})</p>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {employeeUsers.map((u) => (
                  <div key={u.id} className="flex items-center justify-between text-sm bg-muted/50 rounded px-3 py-2">
                    <span>{u.employeeId} — {u.name || "-"}</span>
                    <button
                      onClick={() => handleDeleteUser(u.id)}
                      className="p-1 rounded hover:bg-destructive/20 text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
                {employeeUsers.length === 0 && (
                  <p className="text-xs text-muted-foreground">No users created yet</p>
                )}
              </div>
            </div>
          </div>
        )}

        {tab === "session-requests" && (
          <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
            <p className="text-sm text-muted-foreground p-4">
              Employees whose 12hr session expired need your approval to login again.
            </p>
            <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted sticky top-0">
                    <th className="px-4 py-3 text-left font-bold text-foreground/70 text-xs">Employee ID</th>
                    <th className="px-4 py-3 text-left font-bold text-foreground/70 text-xs">Name</th>
                    <th className="px-4 py-3 text-left font-bold text-foreground/70 text-xs">Location</th>
                    <th className="px-4 py-3 text-left font-bold text-foreground/70 text-xs">Requested</th>
                    <th className="px-4 py-3 text-left font-bold text-foreground/70 text-xs">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {sessionRequests.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                        No pending session extension requests
                      </td>
                    </tr>
                  ) : (
                    sessionRequests.map((req) => (
                      <tr key={req.id} className="border-b border-border hover:bg-muted/30 transition">
                        <td className="px-4 py-3 font-medium">{req.employeeId}</td>
                        <td className="px-4 py-3">{req.employeeName || "-"}</td>
                        <td className="px-4 py-3">{req.location}</td>
                        <td className="px-4 py-3 text-xs">{new Date(req.requestedAt).toLocaleString()}</td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleApproveSessionRequest(req.id)}
                            className="p-2 rounded bg-success/15 text-success hover:bg-success/25 transition font-medium text-xs"
                          >
                            <Check className="h-4 w-4 inline mr-1" /> Approve
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === "employees" && (
          <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
            <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted sticky top-0">
                    {["Name", "Email", "Employee ID", "Plant", "Status", "Requested", "Actions"].map((h) => (
                      <th key={h} className="px-4 py-3 text-left font-bold text-foreground/70 text-xs">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {employeesSynced.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                        No requests assigned to you
                      </td>
                    </tr>
                  ) : (
                    employeesSynced.map((emp) => (
                      <tr key={emp.id} className="border-b border-border hover:bg-muted/30 transition">
                        <td className="px-4 py-3 font-medium">{emp.name}</td>
                        <td className="px-4 py-3">{emp.email}</td>
                        <td className="px-4 py-3">{emp.employeeId}</td>
                        <td className="px-4 py-3">{emp.plant}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                              emp.status === "approved"
                                ? "bg-success/15 text-success"
                                : emp.status === "rejected"
                                  ? "bg-destructive/15 text-destructive"
                                  : "bg-warning/15 text-warning"
                            }`}
                          >
                            {emp.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs">{new Date(emp.requestedAt).toLocaleString()}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1">
                            {emp.status === "pending" && (
                              <>
                                <button
                                  onClick={() => handleApprove(emp.id)}
                                  className="p-1.5 rounded bg-success/15 text-success hover:bg-success/25 transition"
                                >
                                  <Check className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  onClick={() => handleReject(emp.id)}
                                  className="p-1.5 rounded bg-destructive/15 text-destructive hover:bg-destructive/25 transition"
                                >
                                  <X className="h-3.5 w-3.5" />
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => handleDeleteEmp(emp.id)}
                              className="p-1.5 rounded bg-muted text-muted-foreground hover:bg-destructive/15 hover:text-destructive transition"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === "reports" && (
          <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
            <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted sticky top-0">
                    {["ID", "Time", "Location", "Unit", "Defect", "Severity", "Action", "Qty", "Remark", "Employee", "Delete"].map(
                      (h) => (
                        <th key={h} className="px-3 py-3 text-left font-bold text-foreground/70 text-xs">
                          {h}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody>
                  {reports.slice(0, 100).map((r) => (
                    <tr key={r.id} className="border-b border-border hover:bg-muted/30 transition">
                      <td className="px-3 py-2 text-xs font-mono">{r.id}</td>
                      <td className="px-3 py-2 text-xs">{new Date(r.timestamp).toLocaleString()}</td>
                      <td className="px-3 py-2">{r.location}</td>
                      <td className="px-3 py-2">{r.unitType}</td>
                      <td className="px-3 py-2 text-xs">{r.defect}</td>
                      <td className="px-3 py-2">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            r.severity === "Major" ? "bg-warning/20 text-warning" : "bg-success/20 text-success"
                          }`}
                        >
                          {r.severity}
                        </span>
                      </td>
                      <td className="px-3 py-2">{r.action}</td>
                      <td className="px-3 py-2">{r.quantity ?? "-"}</td>
                      <td className="px-3 py-2 text-xs max-w-[120px] truncate">{r.remark ?? "-"}</td>
                      <td className="px-3 py-2 text-xs">{r.employeeName}</td>
                      <td className="px-3 py-2">
                        <button
                          onClick={() => handleDeleteReport(r.id)}
                          className="p-1.5 rounded bg-muted text-muted-foreground hover:bg-destructive/15 hover:text-destructive transition"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
