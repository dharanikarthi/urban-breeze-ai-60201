/**
 * HardwareStatusBanner
 * A slim banner shown at the top of every page that reflects the IoT hardware
 * connection state:
 *   • green pulse  — hardware online, data changing
 *   • amber        — data frozen (device may be disconnected)
 *   • red          — API/network error
 *   • grey spin    — first-time loading
 */
import { useIoT } from "@/contexts/IoTContext";
import { Wifi, WifiOff, Loader2, AlertTriangle } from "lucide-react";

const HardwareStatusBanner = () => {
  const { status, hardwareOnline, data, error } = useIoT();

  if (status === "idle") return null;

  if (status === "loading") {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/60 border text-xs text-muted-foreground animate-fade-in">
        <Loader2 className="h-3 w-3 animate-spin flex-shrink-0" />
        Connecting to IoT sensor…
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-destructive/10 border border-destructive/30 text-xs text-destructive animate-fade-in">
        <WifiOff className="h-3 w-3 flex-shrink-0" />
        <span>Sensor unreachable{error ? `: ${error}` : ""}. Showing last known data.</span>
      </div>
    );
  }

  if (status === "stale" || !hardwareOnline) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-300 dark:border-amber-700 text-xs text-amber-800 dark:text-amber-200 animate-fade-in">
        <AlertTriangle className="h-3 w-3 flex-shrink-0" />
        <span>
          Hardware appears <strong>offline</strong> — reading time frozen at{" "}
          <code className="font-mono">{data?.readingTime ?? "—"}</code>. Showing last known values.
        </span>
      </div>
    );
  }

  // Online & fresh
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-xs text-green-800 dark:text-green-200 animate-fade-in">
      <span className="relative flex h-2 w-2 flex-shrink-0">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
      </span>
      <Wifi className="h-3 w-3 flex-shrink-0" />
      <span>
        Hardware <strong>online</strong> · live readings every 3 s · last update:{" "}
        {data?.readingTime ?? "—"}
      </span>
    </div>
  );
};

export default HardwareStatusBanner;
