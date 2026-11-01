/**
 * ForecastSection
 *
 * Shows two views:
 *   1. HISTORY  — real readings from IoTContext.history (pre-seeded with 24 h sample data)
 *   2. FORECAST — 24-hour projection extrapolated from the latest live values
 *
 * Forecast model:
 *   Uses a sinusoidal diurnal AQI pattern tuned to the current live AQI as
 *   the "anchor" value, with typical Chennai rush-hour amplifications.
 */
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ComposedChart, Bar, Line, Area,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, ReferenceLine,
} from "recharts";
import {
  TrendingDown, TrendingUp, Info, Calendar,
  Thermometer, Droplets, Clock, BarChart2,
} from "lucide-react";
import { useIoT } from "@/contexts/IoTContext";

interface ForecastSectionProps {
  location: string;
  liveAqi: number | null;
  liveTemperature: number | null;
  liveHumidity: number | null;
}

// ─── Colour / label helpers ───────────────────────────────────────────────────

export const aqiColor = (aqi: number) => {
  if (aqi <= 50)  return "#10b981";
  if (aqi <= 100) return "#fbbf24";
  if (aqi <= 150) return "#f97316";
  if (aqi <= 200) return "#ef4444";
  if (aqi <= 300) return "#a855f7";
  return "#7f1d1d";
};

export const aqiLabel = (aqi: number) => {
  if (aqi <= 50)  return "Good";
  if (aqi <= 100) return "Moderate";
  if (aqi <= 150) return "Sensitive";
  if (aqi <= 200) return "Unhealthy";
  if (aqi <= 300) return "Very Unhealthy";
  return "Hazardous";
};

const fmtTime = (rt: string) => {
  try { return new Date(rt.replace(" ", "T")).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }); }
  catch { return rt; }
};

// ─── 24-hour AQI forecast generator ─────────────────────────────────────────

function buildForecast(baseAqi: number, baseTemp: number, baseHum: number) {
  const now  = new Date();
  const rows = [];
  // Typical Chennai diurnal multiplier — dip at night, peak at rush hours
  const multiplier = [
    0.82, 0.79, 0.76, 0.75, 0.77, 0.84,   // 00-05
    0.95, 1.08, 1.18, 1.15, 1.10, 1.05,   // 06-11
    1.02, 1.00, 1.03, 1.07, 1.14, 1.20,   // 12-17
    1.16, 1.09, 1.02, 0.95, 0.90, 0.85,   // 18-23
  ];
  for (let h = 0; h < 24; h++) {
    const t   = new Date(now.getTime() + h * 3_600_000);
    const hr  = t.getHours();
    const aqi = Math.max(10, Math.round(baseAqi * multiplier[hr] + (Math.random() - 0.5) * 4));
    // Temperature peaks mid-afternoon
    const tempOff = Math.sin(((hr - 6) / 24) * 2 * Math.PI) * 3.5;
    const temp    = parseFloat((baseTemp + tempOff + (Math.random() - 0.5) * 0.4).toFixed(1));
    // Humidity inversely related to temp
    const hum  = Math.max(30, Math.min(95, Math.round(baseHum - tempOff * 2 + (Math.random() - 0.5) * 3)));
    const pad  = (n: number) => String(n).padStart(2, "0");
    rows.push({
      time:   `${pad(hr)}:00`,
      aqi,
      temp,
      hum,
      label:  aqiLabel(aqi),
      isFuture: h > 0,
    });
  }
  return rows;
}

// ─── Custom tooltip ───────────────────────────────────────────────────────────

const ChartTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-card border-2 rounded-xl p-3 shadow-xl min-w-[170px]" style={{ borderColor: aqiColor(d.aqi) }}>
      <p className="font-bold text-sm mb-1.5">{d.time}{d.isFuture ? " (forecast)" : ""}</p>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-muted-foreground">AQI</span>
        <span className="text-2xl font-bold" style={{ color: aqiColor(d.aqi) }}>{d.aqi}</span>
      </div>
      <Badge style={{ backgroundColor: aqiColor(d.aqi), color: "white" }} className="text-xs mb-2">{d.label}</Badge>
      {d.temp != null && <p className="text-xs text-muted-foreground">🌡️ {d.temp}°C</p>}
      {d.hum  != null && <p className="text-xs text-muted-foreground">💧 {d.hum}%</p>}
    </div>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────

const ForecastSection = ({ location, liveAqi, liveTemperature, liveHumidity }: ForecastSectionProps) => {
  const { history } = useIoT();
  const [view, setView] = useState<"history" | "forecast">("history");

  // History chart data (oldest → newest)
  const historyData = [...history]
    .reverse()
    .filter(h => h.aqi !== null && h.readingTime)
    .map(h => ({
      time:     fmtTime(h.readingTime!),
      aqi:      h.aqi!,
      temp:     h.temperature,
      hum:      h.humidity,
      label:    aqiLabel(h.aqi!),
      isFuture: false,
    }));

  // Forecast chart data
  const forecastData = buildForecast(
    liveAqi      ?? 80,
    liveTemperature ?? 31,
    liveHumidity    ?? 68,
  );

  const chartData = view === "history" ? historyData : forecastData;

  const avgAQI = chartData.length
    ? Math.round(chartData.reduce((s, d) => s + d.aqi, 0) / chartData.length) : 0;
  const maxAQI = chartData.length ? Math.max(...chartData.map(d => d.aqi)) : 0;
  const minAQI = chartData.length ? Math.min(...chartData.map(d => d.aqi)) : 0;

  const trend = historyData.length >= 2
    ? historyData[historyData.length - 1].aqi - historyData[0].aqi
    : null;

  return (
    <Card className="hover:shadow-xl transition-all duration-300 border-2">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              {view === "forecast" ? <Clock className="h-6 w-6 text-primary" /> : <BarChart2 className="h-6 w-6 text-primary" />}
            </div>
            <div>
              <CardTitle className="text-xl sm:text-2xl">
                {view === "forecast" ? "24-Hour AQI Forecast" : "Sensor Reading History"}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {location} · {view === "history" ? `${historyData.length} readings` : "next 24 h projection"}
              </p>
            </div>
          </div>

          {/* Toggle history / forecast */}
          <Tabs value={view} onValueChange={v => setView(v as "history" | "forecast")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="history"  className="text-xs sm:text-sm gap-1"><BarChart2 className="h-3.5 w-3.5" />History</TabsTrigger>
              <TabsTrigger value="forecast" className="text-xs sm:text-sm gap-1"><Clock     className="h-3.5 w-3.5" />Forecast</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Live snapshot pills */}
        <div className="flex flex-wrap gap-2 mt-3">
          {liveAqi !== null && (
            <Badge style={{ backgroundColor: aqiColor(liveAqi), color: "white" }} className="text-xs">
              AQI {liveAqi} — {aqiLabel(liveAqi)}
            </Badge>
          )}
          {liveTemperature !== null && (
            <Badge variant="outline" className="text-xs gap-1">
              <Thermometer className="h-3 w-3" /> {liveTemperature}°C
            </Badge>
          )}
          {liveHumidity !== null && (
            <Badge variant="outline" className="text-xs gap-1">
              <Droplets className="h-3 w-3" /> {liveHumidity}%
            </Badge>
          )}
          {view === "forecast" && (
            <Badge variant="secondary" className="text-xs">⚠️ Projected values</Badge>
          )}
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 mt-4">
          {[
            { label: "Average", val: avgAQI, bg: "from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20", border: "border-blue-200 dark:border-blue-800" },
            { label: "Best",    val: minAQI, bg: "from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20", border: "border-green-200 dark:border-green-800" },
            { label: "Worst",   val: maxAQI, bg: "from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20", border: "border-orange-200 dark:border-orange-800" },
          ].map(s => (
            <div key={s.label} className={`p-2 sm:p-3 bg-gradient-to-br ${s.bg} rounded-lg border ${s.border}`}>
              <p className="text-[10px] sm:text-xs text-muted-foreground mb-1">{s.label}</p>
              <p className="text-xl sm:text-2xl font-bold" style={{ color: aqiColor(s.val) }}>{s.val}</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">{aqiLabel(s.val)}</p>
            </div>
          ))}
        </div>

        {/* Trend indicator (history only) */}
        {trend !== null && view === "history" && (
          <div className="flex items-center gap-2 mt-4 p-3 bg-muted/50 rounded-lg">
            {trend <= 0
              ? <><TrendingDown className="h-5 w-5 text-green-500 flex-shrink-0" /><p className="text-sm font-medium text-green-700 dark:text-green-400">AQI improving since session start</p></>
              : <><TrendingUp   className="h-5 w-5 text-orange-500 flex-shrink-0" /><p className="text-sm font-medium text-orange-700 dark:text-orange-400">AQI rising since session start (+{trend})</p></>
            }
          </div>
        )}

        {view === "forecast" && (
          <div className="flex items-start gap-2 mt-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300">
            <Info className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
            Forecast is a 24-hour AQI projection based on the current live reading and typical Chennai diurnal patterns. Rush-hour peaks (08-10, 17-19) are modelled automatically.
          </div>
        )}
      </CardHeader>

      <CardContent className="pt-0">
        <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900/50 dark:to-slate-800/50 rounded-xl p-3 sm:p-4 border">
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={chartData}>
              <defs>
                <linearGradient id="aqiAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#10b981" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis
                dataKey="time"
                stroke="hsl(var(--muted-foreground))"
                tick={{ fill: "hsl(var(--foreground))", fontSize: 11 }}
                interval="preserveStartEnd"
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                tick={{ fill: "hsl(var(--foreground))", fontSize: 11 }}
                label={{ value: "AQI", angle: -90, position: "insideLeft", style: { fontSize: 12, fill: "hsl(var(--foreground))" } }}
                domain={[0, 'auto']}
              />
              <ReferenceLine y={50}  stroke="#10b981" strokeDasharray="4 3" opacity={0.6} label={{ value: "Good", position: "insideTopRight", fontSize: 9, fill: "#10b981" }} />
              <ReferenceLine y={100} stroke="#fbbf24" strokeDasharray="4 3" opacity={0.6} label={{ value: "Moderate", position: "insideTopRight", fontSize: 9, fill: "#fbbf24" }} />
              <ReferenceLine y={150} stroke="#f97316" strokeDasharray="4 3" opacity={0.6} label={{ value: "Sensitive", position: "insideTopRight", fontSize: 9, fill: "#f97316" }} />
              <Tooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey="aqi" fill="url(#aqiAreaGrad)" stroke="none" />
              <Bar dataKey="aqi" radius={[5, 5, 0, 0]} maxBarSize={36}>
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={aqiColor(entry.aqi)} opacity={entry.isFuture ? 0.55 : 0.8} />
                ))}
              </Bar>
              <Line type="monotone" dataKey="aqi" stroke="#3b82f6" strokeWidth={2} dot={false}
                activeDot={{ r: 5, fill: "#3b82f6" }}
                strokeDasharray={view === "forecast" ? "5 3" : "0"} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Colour legend */}
        <div className="mt-3 p-3 bg-muted/40 rounded-lg border">
          <p className="text-xs font-semibold mb-2 flex items-center gap-1">
            <Info className="h-3 w-3" /> AQI Colour Guide
          </p>
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            {[
              { r: "0–50",    l: "Good",         c: "#10b981" },
              { r: "51–100",  l: "Moderate",      c: "#fbbf24" },
              { r: "101–150", l: "Sensitive",      c: "#f97316" },
              { r: "151–200", l: "Unhealthy",      c: "#ef4444" },
              { r: "201–300", l: "Very Unhealthy", c: "#a855f7" },
              { r: "301+",    l: "Hazardous",      c: "#7f1d1d" },
            ].map(item => (
              <div key={item.r} className="flex items-center gap-1.5 text-xs">
                <span className="h-2.5 w-2.5 rounded-full inline-block flex-shrink-0" style={{ backgroundColor: item.c }} />
                <span className="text-muted-foreground">{item.r}</span>
                <span className="font-medium">{item.l}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ForecastSection;
