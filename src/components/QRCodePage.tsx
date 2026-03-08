import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { ArrowLeft, Lock, Link as LinkIcon, Copy, Check } from "lucide-react";
import pgLogo from "@/assets/pg-logo.jpg";

interface QRCodePageProps {
  onBack: () => void;
}

const QR_PASSWORD = "qr@pcb2024";

const QRCodePage = ({ onBack }: QRCodePageProps) => {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [url, setUrl] = useState(`${window.location.origin}/employee`);
  const [copied, setCopied] = useState(false);

  const handleLogin = () => {
    if (password === QR_PASSWORD) {
      setAuthenticated(true);
    } else {
      setError(true);
      setTimeout(() => setError(false), 3000);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!authenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="w-full max-w-md rounded-2xl bg-card p-8 shadow-lg border border-border animate-fade-in">
          <div className="flex flex-col items-center mb-6">
            <img src={pgLogo} alt="PG" className="h-14 mb-3 object-contain" />
            <h2 className="text-lg font-bold text-foreground">QR Code Generator</h2>
            <p className="text-sm text-muted-foreground">Enter password to access</p>
          </div>

          <div className="space-y-4">
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="password"
                placeholder="Enter QR Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleLogin()}
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-input bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition"
              />
            </div>
            <button onClick={handleLogin} className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 transition">
              Access QR Generator
            </button>
            {error && (
              <div className="bg-destructive/10 text-destructive text-sm text-center py-2 px-4 rounded-lg animate-fade-in">
                Invalid password!
              </div>
            )}
            <div className="bg-muted rounded-lg p-3">
              <p className="text-[10px] font-bold text-foreground/60">Password: qr@pcb2024</p>
            </div>
          </div>

          <button onClick={onBack} className="mt-4 text-sm text-primary font-semibold hover:underline w-full text-center">
            ← Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-lg rounded-2xl bg-card p-8 shadow-lg border border-border animate-fade-in">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={onBack} className="p-2 rounded-lg hover:bg-muted transition">
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </button>
          <div>
            <h2 className="text-lg font-bold text-foreground">QR Code Generator</h2>
            <p className="text-sm text-muted-foreground">Generate QR code for employee defect entry or any URL</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="relative">
            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="url"
              placeholder="Enter URL to generate QR"
              value={url}
              onChange={e => setUrl(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-input bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition text-sm"
            />
          </div>

          <div className="flex flex-col items-center gap-4 p-6 bg-muted/50 rounded-xl border border-border">
            <QRCodeSVG value={url || window.location.origin} size={200} />
            <p className="text-xs text-muted-foreground text-center break-all max-w-xs">{url}</p>
          </div>

          <button onClick={handleCopy} className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:opacity-90 transition flex items-center justify-center gap-2">
            {copied ? <><Check className="h-4 w-4" /> Copied!</> : <><Copy className="h-4 w-4" /> Copy URL</>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default QRCodePage;
