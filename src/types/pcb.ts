// Types for PCB Defect Monitoring System

export type Plant = "NGM" | "PGTL";
export const LOCATIONS_LIST = ["Pune", "Noida", "Bhiwadi"] as const;
export type Location = (typeof LOCATIONS_LIST)[number];
export type Line = "Line 1" | "Line 2";
export type Shift = "Shift A" | "Shift B";
export type UnitType = "IDU" | "ODU";

export type IDUDefect =
  | "E5 Error"
  | "E1 Error"
  | "E3 Error"
  | "Remote Not Sense"
  | "No Beep Sound"
  | "High RPM"
  | "ON OFF Not Work"
  | "Power Supply Section"
  | "Fan Motor"
  | "Relay"
  | "Swing Motor Drive"
  | "IR Sensor"
  | "Temperature Sensor"
  | "Circuit"
  | "Display"
  | "PCB Track Burn";

export type ODUDefect =
  | "Compressor Lost Step"
  | "Compressor Current Prot"
  | "Comp. Not Start"
  | "DC Fan Fault"
  | "IPM Fault"
  | "Comp. Over Current"
  | "Fan Connector Miss"
  | "Connecting Fail"
  | "PCB Internal Wiring Wrong"
  | "BLDC Motor Error"
  | "Discharge Temp. Sensor Fail"
  | "Fan Motor Not Start"
  | "PCB Burn"
  | "Compressor Drive Error"
  | "Module Defect IPM IGBT";

export type ActionType = "Scrap" | "Repair";
export type Severity = "Major" | "Minor";

export interface DefectReport {
  id: string;
  timestamp: string;
  plant: Plant;
  location: Location;
  line: Line;
  shift: Shift;
  unitType: UnitType;
  defect: string;
  severity: Severity;
  action: ActionType;
  employeeName: string;
  employeeId: string;
  quantity?: number;
  remark?: string;
  model?: string;
}

export interface EmployeeRequest {
  id: string;
  name: string;
  email: string;
  employeeId: string;
  plant: Plant;
  status: "pending" | "approved" | "rejected";
  requestedAt: string;
  approvedAt?: string;
  assignedAdminEmail: string;
}

export interface EmployeeSession {
  employeeId: string;
  name: string;
  location: Location;
  loginAt: number;
  expiresAt: number;
}

export interface Admin {
  id: string;
  name: string;
  email: string;
  password: string;
  location: Location;
}

export interface EmployeeUser {
  id: string;
  employeeId: string;
  password: string;
  name: string;
  location: Location;
  createdByAdminEmail: string;
  createdAt: string;
  hasLoggedInBefore?: boolean;
}

export interface SessionExtensionRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  location: Location;
  createdByAdminEmail: string;
  requestedAt: string;
  status: "pending" | "approved";
  approvedAt?: string;
}

export const ADMINS: Admin[] = [
  { id: "admin-1", name: "Admin 1 - Plant Head NGM", email: "admin1@pgelectronics.com", password: "admin@123", location: "Pune" },
  { id: "admin-2", name: "Admin 2 - Plant Head PGTL", email: "admin2@pgelectronics.com", password: "admin@234", location: "Noida" },
  { id: "admin-3", name: "Admin 3 - Quality Head", email: "admin3@pgelectronics.com", password: "admin@345", location: "Bhiwadi" },
  { id: "admin-4", name: "Admin 4 - Production Manager", email: "admin4@pgelectronics.com", password: "admin@456", location: "Pune" },
  { id: "admin-5", name: "Admin 5 - Supervisor", email: "admin5@pgelectronics.com", password: "admin@567", location: "Noida" },
];

export const IDU_DEFECTS: IDUDefect[] = [
  "E5 Error", "E1 Error", "E3 Error", "Remote Not Sense", "No Beep Sound",
  "High RPM", "ON OFF Not Work", "Power Supply Section", "Fan Motor", "Relay",
  "Swing Motor Drive", "IR Sensor", "Temperature Sensor", "Circuit", "Display", "PCB Track Burn"
];

export const ODU_DEFECTS: ODUDefect[] = [
  "Compressor Lost Step", "Compressor Current Prot", "Comp. Not Start",
  "DC Fan Fault", "IPM Fault", "Comp. Over Current", "Fan Connector Miss",
  "Connecting Fail", "PCB Internal Wiring Wrong", "BLDC Motor Error",
  "Discharge Temp. Sensor Fail", "Fan Motor Not Start", "PCB Burn",
  "Compressor Drive Error", "Module Defect IPM IGBT"
];

export const PLANTS: Plant[] = ["NGM", "PGTL"];
export const LOCATIONS: readonly Location[] = LOCATIONS_LIST;
export const LINES: Line[] = ["Line 1", "Line 2"];
export const SHIFTS: Shift[] = ["Shift A", "Shift B"];
export const ACTIONS: ActionType[] = ["Scrap", "Repair"];
export const SEVERITIES: Severity[] = ["Major", "Minor"];
