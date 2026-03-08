import { RefreshCw, LogOut, Shield, Download } from "lucide-react";
import pgLogo from "@/assets/pg-logo.jpg";

interface DashboardHeaderProps {
  onRefresh: () => void;
  onLogout: () => void;
  onAdminPanel: () => void;
  onDownloadExcel: () => void;
}

const DashboardHeader = ({ onRefresh, onLogout, onAdminPanel, onDownloadExcel }: DashboardHeaderProps) => {
  return (
    <header className="bg-primary text-primary-foreground px-5 py-3 shadow-md">
      <div className="max-w-[1920px] mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={pgLogo} alt="PG" className="h-9 rounded-md object-cover" />
          <h1 className="text-lg font-bold">PCB Defect Monitoring Dashboard</h1>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 mr-2">
            <span className="w-2.5 h-2.5 rounded-full bg-green-400 live-blink" />
            <span className="text-sm font-semibold live-blink">LIVE</span>
          </div>

          <button onClick={onDownloadExcel} className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-primary-foreground/20 border border-primary-foreground/25 hover:bg-primary-foreground/30 transition">
            <Download className="h-3.5 w-3.5" /> Download Excel
          </button>

          <button onClick={onRefresh} className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-primary-foreground/20 border border-primary-foreground/25 hover:bg-primary-foreground/30 transition">
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </button>

          <button onClick={onAdminPanel} className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-primary-foreground/20 border border-primary-foreground/25 hover:bg-primary-foreground/30 transition">
            <Shield className="h-3.5 w-3.5" /> Admin Panel
          </button>

          <button onClick={onLogout} className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-destructive border-none hover:opacity-90 transition">
            <LogOut className="h-3.5 w-3.5" /> Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
