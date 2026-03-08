import { DefectReport, EmployeeRequest, EmployeeSession, EmployeeUser, SessionExtensionRequest, Plant, Location, Line, Admin, ADMINS } from "@/types/pcb";

const DEFECTS_KEY = "pcb_defect_reports_v5";
const EMPLOYEES_KEY = "pcb_employee_requests";
const EMPLOYEE_USERS_KEY = "pcb_employee_users";
const SESSION_REQUESTS_KEY = "pcb_session_extension_requests";
const AUTH_KEY = "pcb_dashboard_auth";
const LOGIN_LOCATION_KEY = "pcb_login_location";
const ADMIN_AUTH_KEY = "pcb_admin_auth";
const EMPLOYEE_SESSION_KEY = "pcb_employee_session";

const GOOGLE_SHEET_API_URL = import.meta.env.VITE_GOOGLE_SHEET_API_URL;

const EMPLOYEES_API_URL =
  import.meta.env.VITE_GOOGLE_SHEET_EMPLOYEES_URL ||
  (GOOGLE_SHEET_API_URL ? `${GOOGLE_SHEET_API_URL}?type=employees` : "");


// ================= DEFECT REPORTS =================

export function getDefectReports(): DefectReport[] {
  const stored = localStorage.getItem(DEFECTS_KEY);
  if (stored) return JSON.parse(stored);
  return [];
}

export function addDefectReport(report: DefectReport): void {
  const reports = getDefectReports();
  reports.unshift(report);
  localStorage.setItem(DEFECTS_KEY, JSON.stringify(reports));

  if (GOOGLE_SHEET_API_URL) {
    pushReportToSheet(report).catch(() => {});
  }
}

export function deleteDefectReport(id: string): void {
  const reports = getDefectReports().filter(r => r.id !== id);
  localStorage.setItem(DEFECTS_KEY, JSON.stringify(reports));
}


// ===== FETCH REPORTS FROM GOOGLE SHEET =====

async function fetchReportsFromSheet(): Promise<DefectReport[]> {
  if (!GOOGLE_SHEET_API_URL) return getDefectReports();

  const url = `${GOOGLE_SHEET_API_URL}?type=defects&_=${Date.now()}`;

  const response = await fetch(url, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  });

  if (!response.ok) throw new Error("Failed to fetch reports");

  const data = await response.json();

  return Array.isArray(data) ? data : [];
}


// ===== PUSH REPORT TO SHEET =====

async function pushReportToSheet(report: DefectReport): Promise<void> {
  if (!GOOGLE_SHEET_API_URL) return;

  await fetch(GOOGLE_SHEET_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      type: "defectReport",
      data: report,
    }),
  });
}


// ===== SYNC REPORTS =====

export async function syncReportsFromSheet(): Promise<DefectReport[]> {
  try {
    const remote = await fetchReportsFromSheet();
    const local = getDefectReports();

    const remoteIds = new Set(remote.map(r => r.id));

    const merged = [...remote];

    local.forEach(r => {
      if (!remoteIds.has(r.id)) merged.push(r);
    });

    merged.sort((a, b) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    localStorage.setItem(DEFECTS_KEY, JSON.stringify(merged));

    return merged;

  } catch {
    return getDefectReports();
  }
}


// ================= EMPLOYEE REQUESTS =================

export function getEmployeeRequests(): EmployeeRequest[] {
  const stored = localStorage.getItem(EMPLOYEES_KEY);
  if (stored) return JSON.parse(stored);
  return [];
}

export function addEmployeeRequest(req: EmployeeRequest): void {
  const requests = getEmployeeRequests();
  requests.push(req);
  localStorage.setItem(EMPLOYEES_KEY, JSON.stringify(requests));

  if (EMPLOYEES_API_URL) {
    pushEmployeeToSheet(req).catch(() => {});
  }
}

export function updateEmployeeRequest(id: string, status: "approved" | "rejected"): void {
  const requests = getEmployeeRequests().map(r =>
    r.id === id
      ? { ...r, status, approvedAt: status === "approved" ? new Date().toISOString() : undefined }
      : r
  );

  localStorage.setItem(EMPLOYEES_KEY, JSON.stringify(requests));

  const updated = requests.find(r => r.id === id);

  if (EMPLOYEES_API_URL && updated) {
    pushEmployeeUpdateToSheet(id, status).catch(() => {});
  }
}

export function deleteEmployeeRequest(id: string): void {
  const requests = getEmployeeRequests().filter(r => r.id !== id);
  localStorage.setItem(EMPLOYEES_KEY, JSON.stringify(requests));
}


// ===== FETCH EMPLOYEES =====

async function fetchEmployeesFromSheet(): Promise<EmployeeRequest[]> {
  if (!EMPLOYEES_API_URL) return getEmployeeRequests();

  const res = await fetch(EMPLOYEES_API_URL, {
    method: "GET",
    headers: { "Content-Type": "application/json" }
  });

  if (!res.ok) throw new Error("Failed to fetch employees");

  const data = await res.json();

  return Array.isArray(data) ? data : [];
}


// ===== PUSH EMPLOYEE =====

async function pushEmployeeToSheet(req: EmployeeRequest): Promise<void> {
  if (!EMPLOYEES_API_URL) return;

  await fetch(EMPLOYEES_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      type: "createEmployee",
      data: req
    }),
  });
}


// ===== UPDATE EMPLOYEE =====

async function pushEmployeeUpdateToSheet(id: string, status: "approved" | "rejected"): Promise<void> {
  if (!EMPLOYEES_API_URL) return;

  await fetch(EMPLOYEES_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      type: "employee_update",
      id,
      status
    }),
  });
}


// ===== SYNC EMPLOYEES =====

export async function syncEmployeesFromSheet(): Promise<EmployeeRequest[]> {
  try {
    const remote = await fetchEmployeesFromSheet();

    if (remote.length > 0) {
      localStorage.setItem(EMPLOYEES_KEY, JSON.stringify(remote));
      return remote;
    }

  } catch {}

  return getEmployeeRequests();
}


// ================= AUTH =================

export function isAuthenticated(): boolean {
  return localStorage.getItem(AUTH_KEY) === "authenticated";
}

export function logout(): void {
  localStorage.removeItem(AUTH_KEY);
  localStorage.removeItem(LOGIN_LOCATION_KEY);
  localStorage.removeItem(ADMIN_AUTH_KEY);
}

export function setLoginLocation(loc: Location): void {
  localStorage.setItem(LOGIN_LOCATION_KEY, loc);
}

export function getLoginLocation(): Location | null {
  return localStorage.getItem(LOGIN_LOCATION_KEY) as Location | null;
}


// ================= ADMIN AUTH =================

export function authenticateAdmin(email: string, password: string): Admin | null {

  const admin = ADMINS.find(
    a => a.email === email && a.password === password
  );

  if (admin) {
    localStorage.setItem(ADMIN_AUTH_KEY, JSON.stringify(admin));
    return admin;
  }

  return null;
}

export function getAuthenticatedAdmin(): Admin | null {

  const stored = localStorage.getItem(ADMIN_AUTH_KEY);

  if (stored) return JSON.parse(stored);

  return null;
}

export function logoutAdmin(): void {
  localStorage.removeItem(ADMIN_AUTH_KEY);
}


// ================= STATS =================

export function getTodayCount(reports: DefectReport[]): number {

  const today = new Date().toDateString();

  return reports.filter(
    r => new Date(r.timestamp).toDateString() === today
  ).length;
}

export function getYesterdayCount(reports: DefectReport[]): number {

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  const yStr = yesterday.toDateString();

  return reports.filter(
    r => new Date(r.timestamp).toDateString() === yStr
  ).length;
}

export function getThisMonthCount(reports: DefectReport[]): number {

  const now = new Date();

  return reports.filter(r => {

    const d = new Date(r.timestamp);

    return (
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear()
    );

  }).length;
}

export function filterReports(
  reports: DefectReport[],
  filters: { plant?: Plant; location?: Location; line?: Line }
): DefectReport[] {
  return reports.filter(r => {
    if (filters.plant && r.plant !== filters.plant) return false;
    if (filters.location && r.location !== filters.location) return false;
    if (filters.line && r.line !== filters.line) return false;
    return true;
  });
}

export function getAvgDaily(reports: DefectReport[]): number {
  if (reports.length === 0) return 0;
  const days = new Set(reports.map(r => new Date(r.timestamp).toDateString()));
  return Math.round(reports.length / days.size);
}

export function getDefectPercentage(reports: DefectReport[], total: number): string {
  if (total === 0) return "0.0";
  return ((reports.length / total) * 100).toFixed(1);
}


// ================= EMPLOYEE SESSION =================

export function getEmployeeSession(): EmployeeSession | null {
  const stored = localStorage.getItem(EMPLOYEE_SESSION_KEY);
  if (!stored) return null;
  const session: EmployeeSession = JSON.parse(stored);
  if (Date.now() > session.expiresAt) {
    localStorage.removeItem(EMPLOYEE_SESSION_KEY);
    return null;
  }
  return session;
}

export function setEmployeeSession(session: EmployeeSession): void {
  localStorage.setItem(EMPLOYEE_SESSION_KEY, JSON.stringify(session));
}

export function clearEmployeeSession(): void {
  localStorage.removeItem(EMPLOYEE_SESSION_KEY);
}


// ================= EMPLOYEE REQUESTS (admin-scoped) =================

export function getEmployeeRequestsForAdmin(adminEmail: string): EmployeeRequest[] {
  return getEmployeeRequests().filter(r => r.assignedAdminEmail === adminEmail);
}

export function getApprovedEmployee(email: string, employeeId: string): EmployeeRequest | null {
  const match = getEmployeeRequests().find(
    r => r.email === email && r.employeeId === employeeId && r.status === "approved"
  );
  return match ?? null;
}


// ================= EMPLOYEE USERS =================

function getEmployeeUsers(): EmployeeUser[] {
  const stored = localStorage.getItem(EMPLOYEE_USERS_KEY);
  if (stored) return JSON.parse(stored);
  return [];
}

export function getEmployeeUsersByAdmin(adminEmail: string): EmployeeUser[] {
  return getEmployeeUsers().filter(u => u.createdByAdminEmail === adminEmail);
}

export function addEmployeeUser(user: EmployeeUser): void {
  const users = getEmployeeUsers();
  users.push(user);
  localStorage.setItem(EMPLOYEE_USERS_KEY, JSON.stringify(users));
}

export function deleteEmployeeUser(id: string): void {
  const users = getEmployeeUsers().filter(u => u.id !== id);
  localStorage.setItem(EMPLOYEE_USERS_KEY, JSON.stringify(users));
}

export function authenticateEmployee(employeeId: string, password: string): EmployeeUser | null {
  const user = getEmployeeUsers().find(
    u => u.employeeId === employeeId && u.password === password
  );
  return user ?? null;
}

export function markEmployeeHasLoggedIn(employeeId: string): void {
  const users = getEmployeeUsers().map(u =>
    u.employeeId === employeeId ? { ...u, hasLoggedInBefore: true } : u
  );
  localStorage.setItem(EMPLOYEE_USERS_KEY, JSON.stringify(users));
}


// ================= SESSION EXTENSION REQUESTS =================

function getSessionExtensionRequests(): SessionExtensionRequest[] {
  const stored = localStorage.getItem(SESSION_REQUESTS_KEY);
  if (stored) return JSON.parse(stored);
  return [];
}

export function getSessionRequestsForAdmin(adminEmail: string): SessionExtensionRequest[] {
  return getSessionExtensionRequests().filter(r => r.createdByAdminEmail === adminEmail);
}

export function addSessionExtensionRequest(req: SessionExtensionRequest): void {
  const requests = getSessionExtensionRequests();
  requests.push(req);
  localStorage.setItem(SESSION_REQUESTS_KEY, JSON.stringify(requests));
}

export function approveSessionExtensionRequest(id: string): void {
  const requests = getSessionExtensionRequests().map(r =>
    r.id === id ? { ...r, status: "approved" as const, approvedAt: new Date().toISOString() } : r
  );
  localStorage.setItem(SESSION_REQUESTS_KEY, JSON.stringify(requests));
}

export function getPendingSessionRequestForEmployee(employeeId: string): SessionExtensionRequest | null {
  const req = getSessionExtensionRequests().find(
    r => r.employeeId === employeeId && r.status === "pending"
  );
  return req ?? null;
}

export function getApprovedSessionRequestForEmployee(employeeId: string): SessionExtensionRequest | null {
  const req = getSessionExtensionRequests().find(
    r => r.employeeId === employeeId && r.status === "approved"
  );
  return req ?? null;
}

export function consumeApprovedSessionRequest(employeeId: string): void {
  const requests = getSessionExtensionRequests().filter(
    r => !(r.employeeId === employeeId && r.status === "approved")
  );
  localStorage.setItem(SESSION_REQUESTS_KEY, JSON.stringify(requests));
}
