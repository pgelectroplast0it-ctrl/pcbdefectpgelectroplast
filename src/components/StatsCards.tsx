import { DefectReport, Plant, Location, Line } from "@/types/pcb";
import { filterReports, getTodayCount, getYesterdayCount, getThisMonthCount, getAvgDaily, getDefectPercentage } from "@/lib/dataStore";
import { QRCodeSVG } from "qrcode.react";

interface StatsCardsProps {
  reports: DefectReport[];
  filters: { plant?: Plant; location?: Location; line?: Line };
}

const StatsCards = ({ reports, filters }: StatsCardsProps) => {
  const filtered = filterReports(reports, filters);
  const today = getTodayCount(filtered);
  const yesterday = getYesterdayCount(filtered);
  const thisMonth = getThisMonthCount(filtered);
  const avgDaily = getAvgDaily(filtered);
  const total = filtered.length;
  const defectPct = getDefectPercentage(filtered, total + 500);
  const uniqueDefects = new Set(filtered.map(r => r.defect)).size;
  const employeeEntryUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/employee`;

  const cards = [
    { label: "TODAY'S", value: today, color: "bg-stat-blue" },
    { label: "YESTERDAY", value: yesterday, color: "bg-stat-red" },
    { label: "AVG DAILY", value: avgDaily, color: "bg-stat-teal" },
    { label: "THIS MONTH", value: thisMonth, color: "bg-stat-purple" },
    { label: "TOTAL", value: total, color: "bg-stat-orange" },
    { label: "DEFECT %", value: `${defectPct}%`, color: "bg-stat-green" },
    { label: "UNIQUE DEFECTS", value: uniqueDefects, color: "bg-stat-indigo" },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 mt-3">
      {cards.map((card) => (
        <div
          key={card.label}
          className={`${card.color} rounded-xl p-3 shadow-sm flex flex-col items-center justify-center text-center min-h-[72px]`}
        >
          <span className="text-[10px] font-black uppercase tracking-wider text-foreground/80">
            {card.label}
          </span>
          <span className="text-2xl font-black text-foreground mt-1">
            {card.value}
          </span>
        </div>
      ))}
      <div className="bg-muted rounded-xl p-3 shadow-sm flex flex-col items-center justify-center text-center min-h-[72px] border border-border">
        <span className="text-[10px] font-black uppercase tracking-wider text-foreground/80 mb-1">
          QR ENTRY
        </span>
        <QRCodeSVG value={employeeEntryUrl} size={48} className="rounded" />
      </div>
    </div>
  );
};

export default StatsCards;
