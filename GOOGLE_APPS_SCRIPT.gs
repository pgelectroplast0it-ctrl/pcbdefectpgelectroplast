// ============================================
// PCB Defect Monitoring - Google Apps Script
// Copy this entire file to your Apps Script project
// (Extensions > Apps Script in your Google Sheet)
// ============================================

const DEFECTS_SHEET = "Sheet1";   // Defects tab name
const EMPLOYEES_SHEET = "Employees"; // Create this tab in your sheet

function doGet(e) {
  const type = e?.parameter?.type || "defects";
  const output = type === "employees" ? getEmployees() : getDefects();
  return ContentService.createTextOutput(JSON.stringify(output)).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  const body = JSON.parse(e.postData?.contents || "{}");
  if (body.type === "employee") {
    appendEmployee(body.data);
  } else if (body.type === "employee_update") {
    updateEmployeeStatus(body.id, body.status);
  } else {
    appendDefect(body);
  }
  return ContentService.createTextOutput(JSON.stringify({ success: true })).setMimeType(ContentService.MimeType.JSON);
}

function getDefects() {
  const sheet = getOrCreateSheet(DEFECTS_SHEET);
  if (sheet.getLastRow() === 0) return [];
  const values = sheet.getDataRange().getValues();
  const rows = [];
  for (let i = 1; i < values.length; i++) {
    const r = values[i];
    if (!r[0]) continue;
    rows.push({
      id: r[0], timestamp: r[1], plant: r[2], location: r[3], line: r[4],
      shift: r[5], unitType: r[6], defect: r[7], severity: r[8], action: r[9],
      employeeName: r[10], employeeId: r[11], quantity: r[12] || undefined, remark: r[13] || undefined
    });
  }
  return rows;
}

function appendDefect(report) {
  const sheet = getOrCreateSheet(DEFECTS_SHEET);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["id","timestamp","plant","location","line","shift","unitType","defect","severity","action","employeeName","employeeId","quantity","remark"]);
  }
  sheet.appendRow([
    report.id, report.timestamp, report.plant, report.location, report.line,
    report.shift, report.unitType, report.defect, report.severity, report.action,
    report.employeeName, report.employeeId, report.quantity || "", report.remark || ""
  ]);
}

function getEmployees() {
  const sheet = getOrCreateSheet(EMPLOYEES_SHEET);
  if (sheet.getLastRow() === 0) return [];
  const values = sheet.getDataRange().getValues();
  const rows = [];
  for (let i = 1; i < values.length; i++) {
    const r = values[i];
    if (!r[0]) continue;
    rows.push({
      id: r[0], name: r[1], email: r[2], employeeId: r[3], plant: r[4],
      status: r[5], requestedAt: r[6], approvedAt: r[7], assignedAdminEmail: r[8]
    });
  }
  return rows;
}

function appendEmployee(req) {
  const sheet = getOrCreateSheet(EMPLOYEES_SHEET);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["id","name","email","employeeId","plant","status","requestedAt","approvedAt","assignedAdminEmail"]);
  }
  sheet.appendRow([
    req.id, req.name, req.email, req.employeeId, req.plant, req.status,
    req.requestedAt || "", req.approvedAt || "", req.assignedAdminEmail
  ]);
}

function updateEmployeeStatus(id, status) {
  const sheet = getOrCreateSheet(EMPLOYEES_SHEET);
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === id) {
      sheet.getRange(i + 1, 6).setValue(status);
      if (status === "approved") {
        sheet.getRange(i + 1, 8).setValue(new Date().toISOString());
      }
      break;
    }
  }
}

function getOrCreateSheet(name) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
  }
  return sheet;
}
