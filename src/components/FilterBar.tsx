import { Plant, Location, Line, PLANTS, LOCATIONS, LINES } from "@/types/pcb";

interface FilterBarProps {
  plant?: Plant;
  location?: Location;
  line?: Line;
  onPlantChange: (p?: Plant) => void;
  onLocationChange: (l?: Location) => void;
  onLineChange: (l?: Line) => void;
}

const FilterBar = ({ plant, location, line, onPlantChange, onLocationChange, onLineChange }: FilterBarProps) => {
  const selectClass = "px-3 py-1.5 rounded-lg text-xs font-semibold border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30";

  return (
    <div className="flex flex-wrap items-center gap-3 mb-4 px-1">
      <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Filters:</span>

      <select value={plant || ""} onChange={(e) => onPlantChange(e.target.value as Plant || undefined)} className={selectClass}>
        <option value="">All Plants</option>
        {PLANTS.map(p => <option key={p} value={p}>{p}</option>)}
      </select>

      <select value={location || ""} onChange={(e) => onLocationChange(e.target.value as Location || undefined)} className={selectClass}>
        <option value="">All Locations</option>
        {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
      </select>

      <select value={line || ""} onChange={(e) => onLineChange(e.target.value as Line || undefined)} className={selectClass}>
        <option value="">All Lines</option>
        {LINES.map(l => <option key={l} value={l}>{l}</option>)}
      </select>

      {(plant || location || line) && (
        <button
          onClick={() => { onPlantChange(undefined); onLocationChange(undefined); onLineChange(undefined); }}
          className="text-xs text-primary font-semibold hover:underline"
        >
          Clear All
        </button>
      )}
    </div>
  );
};

export default FilterBar;
