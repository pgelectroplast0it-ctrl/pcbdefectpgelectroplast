import { useMemo } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line as RLine, ComposedChart } from "recharts";
import { DefectReport } from "@/types/pcb";
import { filterReports } from "@/lib/dataStore";
import { Plant, Location, Line as LineType } from "@/types/pcb";

interface DashboardChartsProps {
  reports: DefectReport[];
  filters: { plant?: Plant; location?: Location; line?: LineType };
}

const COLORS = [
  "#60a5fa",
  "#34d399",
  "#fbbf24",
  "#a78bfa",
  "#2dd4bf",
  "#f472b6",
  "#fb923c",
  "#818cf8",
  "#4ade80",
  "#facc15",
  "#c084fc",
  "#22d3ee",
];

const DashboardCharts = ({ reports, filters }: DashboardChartsProps) => {
  const filtered = useMemo(() => filterReports(reports, filters), [reports, filters]);

  const plantData = useMemo(() => {
    const counts: Record<string, number> = {};
    filtered.forEach(r => { counts[r.plant] = (counts[r.plant] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [filtered]);

  const defectTypeData = useMemo(() => {
    const counts: Record<string, number> = {};
    filtered.forEach(r => { counts[r.unitType] = (counts[r.unitType] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name: name === "IDU" ? "Indoor Defect" : "Outdoor Defect", value }));
  }, [filtered]);

  const shiftData = useMemo(() => {
    const counts: Record<string, number> = {};
    filtered.forEach(r => { counts[r.shift] = (counts[r.shift] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [filtered]);

  const iduPareto = useMemo(() => {
    const counts: Record<string, number> = {};
    filtered.filter(r => r.unitType === "IDU").forEach(r => { counts[r.defect] = (counts[r.defect] || 0) + 1; });
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]).map(([name, value]) => ({ name: name.length > 15 ? name.slice(0, 15) + "…" : name, value, fullName: name }));
    let cumulative = 0;
    const total = sorted.reduce((s, d) => s + d.value, 0);
    return sorted.map(d => { cumulative += d.value; return { ...d, cumPct: total > 0 ? Math.round((cumulative / total) * 100) : 0 }; });
  }, [filtered]);

  const oduPareto = useMemo(() => {
    const counts: Record<string, number> = {};
    filtered.filter(r => r.unitType === "ODU").forEach(r => { counts[r.defect] = (counts[r.defect] || 0) + 1; });
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]).map(([name, value]) => ({ name: name.length > 15 ? name.slice(0, 15) + "…" : name, value, fullName: name }));
    let cumulative = 0;
    const total = sorted.reduce((s, d) => s + d.value, 0);
    return sorted.map(d => { cumulative += d.value; return { ...d, cumPct: total > 0 ? Math.round((cumulative / total) * 100) : 0 }; });
  }, [filtered]);

  const actionData = useMemo(() => {
    const counts: Record<string, number> = {};
    filtered.forEach(r => { counts[r.action] = (counts[r.action] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [filtered]);

  const trendData = useMemo(() => {
    const days: { name: string; value: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dStr = d.toDateString();
      const count = filtered.filter(r => new Date(r.timestamp).toDateString() === dStr).length;
      days.push({ name: d.toLocaleDateString("en", { day: "2-digit", month: "short" }), value: count });
    }
    return days;
  }, [filtered]);

  const severityData = useMemo(() => {
    const counts: Record<string, number> = {};
    filtered.forEach(r => { counts[r.severity] = (counts[r.severity] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [filtered]);

  const chartBox = "bg-card rounded-xl shadow-sm p-4 flex flex-col";
  const chartTitle = "text-xs font-bold text-foreground mb-2";

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={chartBox}>
          <h3 className={chartTitle}>🏭 Plant Distribution</h3>
          <div className="flex-1 min-h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={plantData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`} labelLine={false} fontSize={11}>
                  {plantData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={chartBox}>
          <h3 className={chartTitle}>🔍 Defect Type Distribution</h3>
          <div className="flex-1 min-h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={defectTypeData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${(percent * 100).toFixed(1)}%`} labelLine={false} fontSize={11}>
                  {defectTypeData.map((_, i) => <Cell key={i} fill={COLORS[(i + 3) % COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={chartBox}>
          <h3 className={chartTitle}>🌅 Shift-wise Defects</h3>
          <div className="flex-1 min-h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={shiftData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" fontSize={11} />
                <YAxis fontSize={11} />
                <Tooltip />
                <Bar dataKey="value" fill={COLORS[0]} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={chartBox}>
          <h3 className={chartTitle}>🔩 Indoor (IDU) Pareto</h3>
          <div className="flex-1 min-h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={iduPareto}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" fontSize={9} angle={-25} textAnchor="end" height={50} />
                <YAxis yAxisId="left" fontSize={10} />
                <YAxis yAxisId="right" orientation="right" domain={[0, 100]} fontSize={10} unit="%" />
                <Tooltip formatter={(val: number, name: string) => name === "cumPct" ? `${val}%` : val} />
                <Bar yAxisId="left" dataKey="value" fill={COLORS[0]} radius={[3, 3, 0, 0]} />
                <RLine yAxisId="right" type="monotone" dataKey="cumPct" stroke={COLORS[5]} strokeWidth={2} dot={{ r: 3 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={chartBox}>
          <h3 className={chartTitle}>🔩 Outdoor (ODU) Pareto</h3>
          <div className="flex-1 min-h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={oduPareto}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" fontSize={9} angle={-25} textAnchor="end" height={50} />
                <YAxis yAxisId="left" fontSize={10} />
                <YAxis yAxisId="right" orientation="right" domain={[0, 100]} fontSize={10} unit="%" />
                <Tooltip formatter={(val: number, name: string) => name === "cumPct" ? `${val}%` : val} />
                <Bar yAxisId="left" dataKey="value" fill={COLORS[2]} radius={[3, 3, 0, 0]} />
                <RLine yAxisId="right" type="monotone" dataKey="cumPct" stroke={COLORS[5]} strokeWidth={2} dot={{ r: 3 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={chartBox}>
          <h3 className={chartTitle}>✅ Action Distribution</h3>
          <div className="flex-1 min-h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={actionData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`} labelLine={false} fontSize={10}>
                  {actionData.map((_, i) => <Cell key={i} fill={COLORS[(i + 6) % COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className={chartBox}>
          <h3 className={chartTitle}>📈 7-Day Defect Trend</h3>
          <div className="flex-1 min-h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" fontSize={11} />
                <YAxis fontSize={11} />
                <Tooltip />
                <RLine type="monotone" dataKey="value" stroke={COLORS[0]} strokeWidth={2} dot={{ r: 4, fill: COLORS[0] }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={chartBox}>
          <h3 className={chartTitle}>⚠️ Severity Distribution</h3>
          <div className="flex-1 min-h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={severityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" fontSize={11} />
                <YAxis fontSize={11} />
                <Tooltip />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {severityData.map((entry, i) => (
                    <Cell key={i} fill={entry.name === "Major" ? COLORS[2] : COLORS[1]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl shadow-sm p-4">
        <h3 className="text-xs font-bold text-foreground mb-3">📋 Recent Reports (Last 50)</h3>
        <div className="overflow-x-auto max-h-[280px] overflow-y-auto">
          <table className="w-full text-[11px]">
            <thead>
              <tr className="bg-muted sticky top-0">
                {["Time", "Plant", "Location", "Line", "Unit", "Defect", "Severity", "Shift", "Action", "Employee"].map(h => (
                  <th key={h} className="px-2 py-2 text-left font-bold text-foreground/70">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, 50).map((r) => (
                <tr key={r.id} className="border-b border-border hover:bg-muted/50 transition">
                  <td className="px-2 py-1.5">{new Date(r.timestamp).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</td>
                  <td className="px-2 py-1.5">{r.plant}</td>
                  <td className="px-2 py-1.5">{r.location}</td>
                  <td className="px-2 py-1.5">{r.line}</td>
                  <td className="px-2 py-1.5">{r.unitType}</td>
                  <td className="px-2 py-1.5">{r.defect}</td>
                  <td className="px-2 py-1.5">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${r.severity === "Major" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"}`}>
                      {r.severity}
                    </span>
                  </td>
                  <td className="px-2 py-1.5">{r.shift}</td>
                  <td className="px-2 py-1.5">{r.action}</td>
                  <td className="px-2 py-1.5">{r.employeeName}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardCharts;
