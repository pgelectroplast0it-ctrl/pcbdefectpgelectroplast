import { useState } from "react";
import { addDefectReport, clearEmployeeSession } from "@/lib/dataStore";
import {
  DefectReport,
  Plant,
  Location,
  Line,
  Shift,
  UnitType,
  ActionType,
  Severity,
  PLANTS,
  LINES,
  SHIFTS,
  ACTIONS,
  SEVERITIES,
  IDU_DEFECTS,
  ODU_DEFECTS,
  EmployeeSession,
} from "@/types/pcb";
import { LogOut, Clock } from "lucide-react";
import iduImage from "@/assets/idu-pcb.png";
import oduImage from "@/assets/odu-pcb.png";

interface DefectEntryFormProps {
  session: EmployeeSession;
  onSubmit: () => void;
  onLogout: () => void;
}

const DefectEntryForm = ({ session, onSubmit, onLogout }: DefectEntryFormProps) => {
  const [plant, setPlant] = useState<Plant | "">("");
  const [line, setLine] = useState<Line | "">("");
  const [shift, setShift] = useState<Shift | "">("");
  const [unitType, setUnitType] = useState<UnitType | "">("");
  const [defect, setDefect] = useState("");
  const [severity, setSeverity] = useState<Severity | "">("");
  const [action, setAction] = useState<ActionType | "">("");
  const [quantity, setQuantity] = useState("");
  const [remark, setRemark] = useState("");
  const [employeeName, setEmployeeName] = useState(session.name);
  const [submitted, setSubmitted] = useState(false);

  const defects = unitType === "IDU" ? IDU_DEFECTS : unitType === "ODU" ? ODU_DEFECTS : [];
  const location = session.location;

  const timeLeft = Math.max(0, session.expiresAt - Date.now());
  const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60));
  const minsLeft = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));

  const handleSubmit = () => {
    if (!plant || !line || !shift || !unitType || !defect || !severity || !action || !employeeName) return;
    const report: DefectReport = {
      id: `DEF-${Date.now()}`,
      timestamp: new Date().toISOString(),
      plant: plant as Plant,
      location,
      line: line as Line,
      shift: shift as Shift,
      unitType: unitType as UnitType,
      defect,
      severity: severity as Severity,
      action: action as ActionType,
      employeeName,
      employeeId: session.employeeId,
      quantity: quantity ? parseInt(String(quantity), 10) || undefined : undefined,
      remark: remark.trim() || undefined,
    };
    addDefectReport(report);
    setSubmitted(true);
    onSubmit();
    setTimeout(() => {
      setSubmitted(false);
      setPlant("");
      setLine("");
      setShift("");
      setUnitType("");
      setDefect("");
      setSeverity("");
      setAction("");
      setQuantity("");
      setRemark("");
    }, 2000);
  };

  const handleLogout = () => {
    clearEmployeeSession();
    onLogout();
  };

  const selectClass =
    "w-full py-3 px-4 rounded-lg border border-input bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 appearance-none text-sm";

  if (submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="bg-success/10 text-success rounded-xl p-8 text-center animate-fade-in max-w-md">
          <p className="text-2xl font-bold mb-2">✅ Report Submitted!</p>
          <p className="text-sm">Preparing next entry...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-primary text-primary-foreground px-4 py-3 shadow-md">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold">PCB Defect Entry</h2>
            <p className="text-xs opacity-80">
              {employeeName} ({session.employeeId}) — {location}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-xs bg-primary-foreground/15 px-2 py-1 rounded">
              <Clock className="h-3 w-3" />
              {hoursLeft}h {minsLeft}m left
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded text-xs font-medium bg-destructive hover:opacity-90 transition"
            >
              <LogOut className="h-3 w-3" /> Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto p-4">
        <div className="bg-card rounded-2xl shadow-lg border border-border p-6 animate-fade-in">
          <h2 className="text-lg font-bold text-foreground mb-1">Add Defect Report</h2>
          <p className="text-sm text-muted-foreground mb-6">Select defect details below</p>

          {unitType && (
            <div className="flex justify-center mb-6">
              <div className="bg-muted rounded-xl p-4 border border-border">
                <img
                  src={unitType === "IDU" ? iduImage : oduImage}
                  alt={`${unitType} PCB Board`}
                  className="h-40 object-contain rounded-lg"
                />
                <p className="text-xs text-center text-muted-foreground mt-2 font-semibold">
                  {unitType === "IDU" ? "Indoor Unit (IDU) PCB" : "Outdoor Unit (ODU) PCB"}
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="text-xs font-bold text-foreground/70 mb-1 block">Your Name</label>
              <input
                value={employeeName}
                onChange={(e) => setEmployeeName(e.target.value)}
                placeholder="Enter your name"
                className={selectClass}
              />
            </div>
            <div>
              <label className="text-xs font-bold text-foreground/70 mb-1 block">Location</label>
              <input value={location} disabled className={`${selectClass} bg-muted opacity-80`} />
            </div>
            <div>
              <label className="text-xs font-bold text-foreground/70 mb-1 block">Plant</label>
              <select value={plant} onChange={(e) => setPlant(e.target.value as Plant)} className={selectClass}>
                <option value="">Select Plant</option>
                {PLANTS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-foreground/70 mb-1 block">Line</label>
              <select value={line} onChange={(e) => setLine(e.target.value as Line)} className={selectClass}>
                <option value="">Select Line</option>
                {LINES.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-foreground/70 mb-1 block">Shift</label>
              <select value={shift} onChange={(e) => setShift(e.target.value as Shift)} className={selectClass}>
                <option value="">Select Shift</option>
                {SHIFTS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-foreground/70 mb-1 block">Unit Type</label>
              <select
                value={unitType}
                onChange={(e) => {
                  setUnitType(e.target.value as UnitType);
                  setDefect("");
                }}
                className={selectClass}
              >
                <option value="">Select Unit</option>
                <option value="IDU">IDU (Indoor)</option>
                <option value="ODU">ODU (Outdoor)</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-foreground/70 mb-1 block">Defect</label>
              <select
                value={defect}
                onChange={(e) => setDefect(e.target.value)}
                className={selectClass}
                disabled={!unitType}
              >
                <option value="">Select Defect</option>
                {defects.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-foreground/70 mb-1 block">Severity</label>
              <select value={severity} onChange={(e) => setSeverity(e.target.value as Severity)} className={selectClass}>
                <option value="">Select Severity</option>
                {SEVERITIES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-foreground/70 mb-1 block">Action</label>
              <select value={action} onChange={(e) => setAction(e.target.value as ActionType)} className={selectClass}>
                <option value="">Select Action</option>
                {ACTIONS.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-foreground/70 mb-1 block">Quantity</label>
              <input
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="Optional"
                className={selectClass}
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs font-bold text-foreground/70 mb-1 block">Remark (kya problem hai likhein)</label>
              <textarea
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
                placeholder="Describe the problem..."
                rows={2}
                className={`${selectClass} resize-none`}
              />
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={!plant || !line || !shift || !unitType || !defect || !severity || !action || !employeeName}
            className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition disabled:opacity-50"
          >
            Submit Defect Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default DefectEntryForm;
