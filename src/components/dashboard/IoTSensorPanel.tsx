/**
 * IoTSensorPanel — the primary live-data card for the Dashboard.
 *
 * Reads from IoTContext (global singleton), so no extra subscriptions needed.
 * Displays:
 *   • AQI (derived from MQ135 ppm) with colour-coded bar
 *   • 6 sensor metrics: MQ135 ppm, Temperature, Humidity, Speed, Lat, Lon
 *   • Hardware online / stale / error status with explanations
 *   • Flash animation on every new reading
 *   • Google Maps deep-link when coordinates are available
 */
import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useIoT } from "@/contexts/IoTContext";
import {
  MapPin, Clock, Wind, Thermometer, Droplets,
  Navigation, Wifi, WifiOff, Loader2, AlertTriangle,
} from "lucide-react";

// ─── AQI helpers ──────────────────────────────────────────────────────────────

export const getAQICategory = (aqi: number) => {
  if (aqi <= 50)  return { label: "Good",                   color: "hsl(var(--aqi-good))",                emoji: "😊" };
  if (aqi <= 100) return { label: "Moderate",                color: "hsl(var(--aqi-moderate))",            emoji: "😐" };
  if (aqi <= 150) return { label: "Unhealthy for Sensitive", color: "hsl(var(--aqi-unhealthy-sensitive))", emoji: "😷" };
  if (aqi <= 200) return { label: "Unhealthy",               color: "hsl(var(--aqi-unhealthy))",           emoji: "😨" };
  if (aqi <= 300) return { label: "Very Unhealthy",          color: "hsl(var(--aqi-very-unhealthy))",      emoji: "🚨" };
  return           { label: "Hazardous",                     color: "hsl(var(--aqi-hazardous))",           emoji: "☠️" };
};

// ─── MetricCard ───────────────────────────────────────────────────────────────

interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number | null;
  unit: string;
  highlight?: boolean;
  color?: string;
}

const MetricCard = ({ icon, label, value, unit, highlight, color }: MetricCardProps) => (
  <div
    className={`p-3 sm:p-4 rounded-xl border-2 transition-all hover:shadow-md ${
      highlight ? "border-primary/60 bg-primary/5" : "border-border bg-card"
    }`}
  >
    <div className="flex items-center gap-2 mb-2 text-muted-foreground text-xs sm:text-sm font-medium">
      {icon}
      <span>{label}</span>
    </div>
    <div className="flex items-baseline gap-1">
      <span className="text-2xl sm:text-3xl font-bold" style={color ? { color } : undefined}>
        {value !== null && value !== undefined ? value : "—"}
      </span>
      <span className="text-xs sm:text-sm text-muted-foreground">{unit}</span>
    </div>
  </div>
);

// ─── Main component ───────────────────────────────────────────────────────────

const IoTSensorPanel = () => {
  const { data, status, error, hardwareOnline } = useIoT();

  // Flash ring on new reading
  const [flash, setFlash] = useState(false);
  const prevReadingTime   = useRef<string | null>(null);

  useEffect(() => {
    if (data?.readingTime && data.readingTime !== prevReadingTime.current) {
      prevReadingTime.current = data.readingTime;
      setFlash(true);
      const t = setTimeout(() => setFlash(false), 700);
      return () => clearTimeout(t);
    }
  }, [data?.readingTime]);

  const aqi      = data?.aqi ?? null;
  const category = aqi !== null ? getAQICategory(aqi) : null;
  const pct      = aqi !== null ? Math.min((aqi / 300) * 100, 100) : 0;

  const fmtReadingTime = (rt: string | null) => {
    if (!rt) return null;
    try { return new Date(rt.replace(" ", "T")).toLocaleString(); } catch { return rt; }
  };

  const fmtFetchedAt = (iso: string) => {
    try { return new Date(iso).toLocaleTimeString(); } catch { return iso; }
  };

  // Border colour: use AQI colour when online, amber when stale, red on error
  const borderColor =
    status === "ok" && category ? category.color :
    status === "stale"           ? "#f59e0b" :
    status === "error"           ? "#ef4444" : undefined;

  return (
    <Card
      className={`border-2 transition-all duration-300 ${flash ? "ring-2 ring-primary/40" : ""}`}
      style={borderColor ? { borderLeftWidth: "6px", borderLeftColor: borderColor } : undefined}
    >
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <CardHeader
        className="rounded-t-lg pb-3 sm:pb-4"
        style={category && status !== "stale" && status !== "error"
          ? { backgroundColor: `${category.color}15` }
          : status === "stale" ? { backgroundColor: "#f59e0b15" }
          : undefined}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary flex-shrink-0" />
            <span>IoT Sensor — Live Feed</span>
          </CardTitle>

          {/* Status badge */}
          {status === "loading" && (
            <Badge variant="secondary" className="gap-1.5 w-fit text-xs">
              <Loader2 className="h-3 w-3 animate-spin" /> Connecting…
            </Badge>
          )}
          {status === "ok" && hardwareOnline && category && (
            <Badge style={{ backgroundColor: category.color, color: "white" }} className="text-xs sm:text-sm px-2 sm:px-3 py-1 w-fit">
              {category.emoji} {category.label}
            </Badge>
          )}
          {status === "stale" && (
            <Badge className="gap-1.5 w-fit text-xs bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/30 dark:text-amber-300">
              <AlertTriangle className="h-3 w-3" /> Hardware offline
            </Badge>
          )}
          {status === "error" && (
            <Badge variant="destructive" className="gap-1.5 w-fit text-xs">
              <WifiOff className="h-3 w-3" /> Unreachable
            </Badge>
          )}
        </div>

        {/* Timestamps + refresh indicator */}
        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mt-2">
          {data?.readingTime && (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3 flex-shrink-0" />
              Device: {fmtReadingTime(data.readingTime)}
            </span>
          )}
          {data?.fetchedAt && (
            <span className="flex items-center gap-1">
              <Wifi className="h-3 w-3 flex-shrink-0" />
              Fetched: {fmtFetchedAt(data.fetchedAt)}
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <span className={`inline-block h-2 w-2 rounded-full ${
              status === "ok" && hardwareOnline ? "bg-green-500 animate-pulse" :
              status === "stale" ? "bg-amber-400" :
              status === "error" ? "bg-red-500" :
              "bg-yellow-400 animate-pulse"
            }`} />
            {status === "ok" && hardwareOnline
              ? "Hardware online · refreshing every 3 s"
              : status === "stale"
              ? "Hardware disconnected — reading time is frozen"
              : status === "error"
              ? "Connection failed"
              : "Connecting…"}
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 sm:space-y-6 pt-4 sm:pt-6">

        {/* ── Error / stale notices ─────────────────────────────────────── */}
        {status === "error" && error && (
          <div className="text-xs sm:text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-lg px-3 py-2">
            ⚠️ Last fetch failed: {error}. Showing last known data.
          </div>
        )}
        {status === "stale" && (
          <div className="text-xs sm:text-sm text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/20 border border-amber-300 dark:border-amber-700 rounded-lg px-3 py-2">
            🔌 The IoT device appears to be <strong>disconnected from hardware</strong>. The sensor reading time
            has not changed across the last several polls. Data below reflects the <em>last known reading</em>.
          </div>
        )}

        {/* ── AQI display ───────────────────────────────────────────────── */}
        {aqi !== null && category ? (
          <div>
            <div className="flex items-center gap-3 sm:gap-4 mb-4">
              <span className="text-5xl sm:text-6xl">{category.emoji}</span>
              <div>
                <div className="text-5xl sm:text-6xl md:text-7xl font-bold" style={{ color: category.color }}>
                  {aqi}
                </div>
                <p className="text-sm text-muted-foreground font-medium">
                  Estimated AQI
                  {!hardwareOnline && status !== "error" &&
                    <span className="ml-1 text-amber-600 dark:text-amber-400">(stale — hw offline)</span>}
                </p>
                <p className="text-xs text-muted-foreground">
                  Derived from MQ135 gas sensor ({data?.mq135 ?? "—"} ppm)
                </p>
              </div>
            </div>

            <div className="relative w-full h-2 sm:h-3 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full transition-all duration-700 rounded-full"
                style={{ width: `${pct}%`, backgroundColor: category.color }}
              />
            </div>
            <div className="flex justify-between text-[10px] sm:text-xs text-muted-foreground mt-1">
              <span>0</span><span>50</span><span>100</span><span>150</span><span>200</span><span>300+</span>
            </div>
          </div>
        ) : status === "loading" ? (
          <div className="flex items-center justify-center py-10 gap-3 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span>Fetching live sensor data…</span>
          </div>
        ) : null}

        {/* ── Sensor metrics grid ───────────────────────────────────────── */}
        {data && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <MetricCard icon={<Wind className="h-4 w-4" />}        label="MQ135 Gas"   value={data.mq135}       unit="ppm"   highlight color={category?.color} />
            <MetricCard icon={<Thermometer className="h-4 w-4" />} label="Temperature" value={data.temperature} unit="°C" />
            <MetricCard icon={<Droplets className="h-4 w-4" />}    label="Humidity"    value={data.humidity}    unit="%" />
            <MetricCard icon={<Navigation className="h-4 w-4" />}  label="Speed"       value={data.speed}       unit="km/h" />
            <MetricCard icon={<MapPin className="h-4 w-4" />}      label="Latitude"    value={data.latitude}    unit="°" />
            <MetricCard icon={<MapPin className="h-4 w-4" />}      label="Longitude"   value={data.longitude}   unit="°" />
          </div>
        )}

        {/* ── Google Maps link ──────────────────────────────────────────── */}
        {data?.latitude && data?.longitude && (
          <a
            href={`https://www.google.com/maps?q=${data.latitude},${data.longitude}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-xs sm:text-sm text-primary underline-offset-2 hover:underline"
          >
            <MapPin className="h-4 w-4 flex-shrink-0" />
            View sensor on Google Maps ({data.latitude}, {data.longitude})
          </a>
        )}
      </CardContent>
    </Card>
  );
};

export default IoTSensorPanel;
