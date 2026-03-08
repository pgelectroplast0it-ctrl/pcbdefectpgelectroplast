import { useState, useCallback, useEffect } from "react";
import {
  isAuthenticated,
  logout as doLogout,
  getDefectReports,
  getEmployeeSession,
  clearEmployeeSession,
  syncReportsFromSheet,
  getLoginLocation,
} from "@/lib/dataStore";
import { Plant, Location, Line, EmployeeSession, DefectReport, LOCATIONS } from "@/types/pcb";
import LoginPage from "@/components/LoginPage";
import DashboardHeader from "@/components/DashboardHeader";
import StatsCards from "@/components/StatsCards";
import FilterBar from "@/components/FilterBar";
import DashboardCharts from "@/components/DashboardCharts";
import DefectEntryForm from "@/components/DefectEntryForm";
import AdminPanel from "@/components/AdminPanel";
import * as XLSX from "xlsx";

type View = "dashboard" | "defect-entry" | "admin";

const EXCEL_DOWNLOAD_PASSWORD = "excel@2024";

const Index = () => {
  const [loggedIn, setLoggedIn] = useState(isAuthenticated());
  const [view, setView] = useState<View>("dashboard");
  const [refresh, setRefresh] = useState(0);
  const [employeeSession, setEmployeeSession] = useState<EmployeeSession | null>(getEmployeeSession());

  const [plant, setPlant] = useState<Plant | undefined>();
  const [location, setLocation] = useState<Location | undefined>(getLoginLocation() || undefined);
  const [line, setLine] = useState<Line | undefined>();

  const [reports, setReports] = useState<DefectReport[]>(getDefectReports());
  const [showExcelDialog, setShowExcelDialog] = useState(false);
  const [excelType, setExcelType] = useState<"overall" | "monthly" | "location">("overall");
  const [excelLocation, setExcelLocation] = useState<Location | "">("");
  const [excelPassword, setExcelPassword] = useState("");
  const [excelError, setExcelError] = useState("");

  const doSync = useCallback(() => {
    syncReportsFromSheet()
      .then((remote) => setReports(remote))
      .catch(() => setReports(getDefectReports()));
  }, []);

  useEffect(() => {
    doSync();
  }, [refresh, doSync]);

  useEffect(() => {
    if (!loggedIn || view !== "dashboard") return;
    const interval = setInterval(doSync, 30000);
    return () => clearInterval(interval);
  }, [loggedIn, view, doSync]);

  const handleLogout = useCallback(() => {
    doLogout();
    setLoggedIn(false);
  }, []);

  const handleRefresh = useCallback(() => {
    setRefresh(r => r + 1);
  }, []);

  const performDownloadExcel = useCallback((type: "overall" | "monthly" | "location", loc?: Location) => {
    const all = getDefectReports();
    let filtered = all;
    if (type === "monthly") {
      filtered = all.filter((r) => {
        const d = new Date(r.timestamp);
        const now = new Date();
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      });
    } else if (type === "location" && loc) {
      filtered = all.filter((r) => r.location === loc);
    }

    const data = filtered.map((r) => ({
      ID: r.id,
      Timestamp: new Date(r.timestamp).toLocaleString("en-IN"),
      Plant: r.plant,
      Location: r.location,
      Line: r.line,
      Shift: r.shift,
      "Unit Type": r.unitType,
      Defect: r.defect,
      Severity: r.severity,
      Action: r.action,
      Quantity: r.quantity ?? "",
      Remark: r.remark ?? "",
      "Employee Name": r.employeeName,
      "Employee ID": r.employeeId,
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "PCB Defect Reports");
    const suffix = type === "monthly" ? "_ThisMonth" : type === "location" ? `_${loc}` : "_Overall";
    XLSX.writeFile(wb, `PCB_Defect_Reports${suffix}_${new Date().toISOString().slice(0, 10)}.xlsx`);
  }, []);

  const handleDownloadExcel = useCallback(() => {
    setShowExcelDialog(true);
    setExcelPassword("");
    setExcelError("");
  }, []);

  if (!loggedIn) {
    return <LoginPage onLogin={(loc) => { setLoggedIn(true); setLocation(loc); }} />;
  }

  if (view === "defect-entry" && employeeSession) {
    return (
      <DefectEntryForm
        session={employeeSession}
        onSubmit={() => { handleRefresh(); }}
        onLogout={() => {
          clearEmployeeSession();
          setEmployeeSession(null);
          setView("dashboard");
        }}
      />
    );
  }

  if (view === "admin") {
    return <AdminPanel onBack={() => { handleRefresh(); setView("dashboard"); }} />;
  }

  return (
    <div className="min-h-screen bg-background" key={refresh}>
      <div className="sticky top-0 z-50">
        <DashboardHeader
          onRefresh={handleRefresh}
          onLogout={handleLogout}
          onAdminPanel={() => setView("admin")}
          onDownloadExcel={handleDownloadExcel}
        />
      </div>

      <div className="max-w-[1920px] mx-auto px-4">
        <div className="sticky top-[52px] z-40 bg-background py-3 pb-4 -mx-4 px-4 border-b border-border/50">
          <FilterBar
            plant={plant}
            location={location}
            line={line}
            onPlantChange={setPlant}
            onLocationChange={setLocation}
            onLineChange={setLine}
          />
          <StatsCards reports={reports} filters={{ plant, location, line }} />
        </div>

        <div className="pt-2">
          <DashboardCharts reports={reports} filters={{ plant, location, line }} />
        </div>
      </div>

      {showExcelDialog && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[999]">
          <div className="bg-card rounded-xl border border-border p-6 w-full max-w-sm shadow-lg">
            <h2 className="text-base font-bold text-foreground mb-3">Secure Excel Download</h2>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-foreground/70 mb-1 block">Select Report Type</label>
                <select
                  value={excelType}
                  onChange={(e) => setExcelType(e.target.value as "overall" | "monthly" | "location")}
                  className="w-full py-2.5 px-3 rounded-lg border border-input bg-background text-sm"
                >
                  <option value="overall">Overall Defects</option>
                  <option value="monthly">Monthly Defects (Current Month)</option>
                  <option value="location">Location-wise Defects</option>
                </select>
              </div>
              {excelType === "location" && (
                <div>
                  <label className="text-xs font-semibold text-foreground/70 mb-1 block">Select Location</label>
                  <select
                    value={excelLocation}
                    onChange={(e) => setExcelLocation(e.target.value as Location)}
                    className="w-full py-2.5 px-3 rounded-lg border border-input bg-background text-sm"
                  >
                    <option value="">Select Location</option>
                    {LOCATIONS.map((loc) => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <label className="text-xs font-semibold text-foreground/70 mb-1 block">Password</label>
                <input
                  type="password"
                  value={excelPassword}
                  onChange={e => setExcelPassword(e.target.value)}
                  className="w-full py-2.5 px-3 rounded-lg border border-input bg-background text-sm"
                  placeholder="Enter download password"
                />
              </div>
              {excelError && (
                <p className="text-xs text-destructive">{excelError}</p>
              )}
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setShowExcelDialog(false)}
                  className="px-3 py-2 rounded-lg text-xs font-medium bg-muted text-foreground hover:bg-muted/80"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (excelPassword !== EXCEL_DOWNLOAD_PASSWORD) {
                      setExcelError("Invalid password.");
                      return;
                    }
                    if (excelType === "location" && !excelLocation) {
                      setExcelError("Please select location.");
                      return;
                    }
                    performDownloadExcel(excelType, excelLocation || undefined);
                    setShowExcelDialog(false);
                  }}
                  className="px-3 py-2 rounded-lg text-xs font-medium bg-primary text-primary-foreground hover:opacity-90"
                >
                  Download
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
