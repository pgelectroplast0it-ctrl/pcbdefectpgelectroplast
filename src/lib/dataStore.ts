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
