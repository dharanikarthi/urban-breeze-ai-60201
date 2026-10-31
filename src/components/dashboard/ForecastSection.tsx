/**
 * ForecastSection
 *
 * "Forecast" here is built from the IoT sensor's real-time readings stored in
 * IoTContext history (up to 50 snapshots, newest first).  When fewer than
 * 2 readings exist the chart shows a friendly empty-state instead of stale
 * hardcoded data.
 *
 * Props:
 *   location        — display label (e.g. "13.03, 80.23")
 *   liveAqi         — current AQI derived from MQ135
 *   liveTemperature — current °C
 *   liveHumidity    — current %
 */
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ComposedChart, Bar, Line, Area,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, ReferenceLine,
} from "recharts";
import { TrendingDown, TrendingUp, Info, Calendar, Thermometer, Droplets } from "lucide-react";
import { useIoT } from "@/contexts/IoTContext";

interface ForecastSectionProps {
  location: string;
  liveAqi: number | null;
  liveTemperature: number | null;
  liveHumidity: number | null;
}

// ─── helpers ─────────────────────────────────────────────────────────────────

const aqiColor = (aqi: number) => {
  if (aqi <= 50)  return "#10b981";
  if (aqi <= 100) return "#fbbf24";
  if (aqi <= 150) return "#f97316";
  if (aqi <= 200) return "#ef4444";
  if (aqi <= 300) return "#a855f7";
  return "#7f1d1d";
};

const aqiLabel = (aqi: number) => {
  if (aqi <= 50)  return "Good";
  if (aqi <= 100) return "Moderate";
  if (aqi <= 150) return "Sensitive";
  if (aqi <= 200) return "Unhealthy";
  if (aqi <= 300) return "Very Unhealthy";
  return "Hazardous";
};

const fmtTime = (iso: string) => {
  try {
    return new Date(iso.replace(" ", "T")).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch { return iso; }
};

// ─── component ───────────────────────────────────────────────────────────────

const ForecastSection = ({ location, liveAqi, liveTemperature, liveHumidity }: ForecastSectionProps) => {
  const { history } = useIoT();

  // Build chart data from history (oldest → newest so chart reads left-to-right)
  const chartData = [...history]
    .reverse()
    .filter(h => h.aqi !== null && h.readingTime)
    .map(h => ({
      time: fmtTime(h.readingTime!),
      aqi:  h.aqi!,
      temp: h.temperature,
      hum:  h.humidity,
      label: aqiLabel(h.aqi!),
    }));

  const hasData = chartData.length >= 2;

  const avgAQI = hasData
    ? Math.round(chartData.reduce((s, d) => s + d.aqi, 0) / chartData.length)
    : liveAqi ?? 0;
  const maxAQI = hasData ? Math.max(...chartData.map(d => d.aqi)) : (liveAqi ?? 0);
  const minAQI = hasData ? Math.min(...chartData.map(d => d.aqi)) : (liveAqi ?? 0);

  const trend = hasData && chartData.length >= 2
    ? chartData[chartData.length - 1].aqi < chartData[0].aqi
    : null;

  return (
    <Card className="hover:shadow-xl transition-all duration-300 border-2">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Calendar className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl sm:text-2xl">Sensor Reading History</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {location} · last {chartData.length} readings
              </p>
            </div>
          </div>

          {/* Live snapshot pills */}
          <div className="flex flex-wrap gap-2">
            {liveAqi !== null && (
              <Badge style={{ backgroundColor: aqiColor(liveAqi), color: "white" }} className="text-xs px-2 py-1">
                AQI {liveAqi}
              </Badge>
            )}
            {liveTemperature !== null && (
              <Badge variant="outline" className="text-xs px-2 py-1 gap-1">
                <Thermometer className="h-3 w-3" /> {liveTemperature}°C
              </Badge>
            )}
            {liveHumidity !== null && (
              <Badge variant="outline" className="text-xs px-2 py-1 gap-1">
                <Droplets className="h-3 w-3" /> {liveHumidity}%
              </Badge>
            )}
          </div>
        </div>

        {/* Stats row */}
        {hasData && (
          <div className="grid grid-cols-3 gap-2 sm:gap-3 mt-4">
            <div className="p-2 sm:p-3 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-[10px] sm:text-xs text-muted-foreground mb-1">Average</p>
              <p className="text-xl sm:text-2xl font-bold" style={{ color: aqiColor(avgAQI) }}>{avgAQI}</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">{aqiLabel(avgAQI)}</p>
            </div>
            <div className="p-2 sm:p-3 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg border border-green-200 dark:border-green-800">
              <p className="text-[10px] sm:text-xs text-muted-foreground mb-1">Best</p>
              <p className="text-xl sm:text-2xl font-bold text-green-600">{minAQI}</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">{aqiLabel(minAQI)}</p>
            </div>
            <div className="p-2 sm:p-3 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-lg border border-orange-200 dark:border-orange-800">
              <p className="text-[10px] sm:text-xs text-muted-foreground mb-1">Worst</p>
              <p className="text-xl sm:text-2xl font-bold text-orange-600">{maxAQI}</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">{aqiLabel(maxAQI)}</p>
            </div>
          </div>
        )}

        {/* Trend indicator */}
        {trend !== null && (
          <div className="flex items-center gap-2 mt-4 p-3 bg-muted/50 rounded-lg">
            {trend ? (
              <>
                <TrendingDown className="h-5 w-5 text-green-500 flex-shrink-0" />
                <p className="text-sm font-medium text-green-700 dark:text-green-400">
                  AQI improving since first recorded reading
                </p>
              </>
            ) : (
              <>
                <TrendingUp className="h-5 w-5 text-orange-500 flex-shrink-0" />
                <p className="text-sm font-medium text-orange-700 dark:text-orange-400">
                  AQI rising since first recorded reading
                </p>
              </>
            )}
          </div>
        )}
      </CardHeader>

      <CardContent className="pt-0">
        {hasData ? (
          <>
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900/50 dark:to-slate-800/50 rounded-xl p-4 border">
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={chartData}>
                  <defs>
                    <linearGradient id="aqiHistGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#10b981" stopOpacity={0.3} />
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
                  />
                  <ReferenceLine y={50}  stroke="#10b981" strokeDasharray="3 3" opacity={0.5} />
                  <ReferenceLine y={100} stroke="#fbbf24" strokeDasharray="3 3" opacity={0.5} />
                  <ReferenceLine y={150} stroke="#f97316" strokeDasharray="3 3" opacity={0.5} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const d = payload[0].payload;
                      return (
                        <div className="bg-card border-2 rounded-xl p-3 shadow-xl min-w-[180px]" style={{ borderColor: aqiColor(d.aqi) }}>
                          <p className="font-bold text-sm mb-2">{d.time}</p>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-muted-foreground">AQI</span>
                            <span className="text-2xl font-bold" style={{ color: aqiColor(d.aqi) }}>{d.aqi}</span>
                          </div>
                          <Badge style={{ backgroundColor: aqiColor(d.aqi), color: "white" }} className="text-xs mb-2">{d.label}</Badge>
                          {d.temp !== null && (
                            <p className="text-xs text-muted-foreground">🌡️ {d.temp}°C</p>
                          )}
                          {d.hum !== null && (
                            <p className="text-xs text-muted-foreground">💧 {d.hum}%</p>
                          )}
                        </div>
                      );
                    }}
                  />
                  <Area type="monotone" dataKey="aqi" fill="url(#aqiHistGrad)" stroke="none" />
                  <Bar dataKey="aqi" radius={[6, 6, 0, 0]} maxBarSize={40}>
                    {chartData.map((entry, i) => (
                      <Cell key={i} fill={aqiColor(entry.aqi)} opacity={0.75} />
                    ))}
                  </Bar>
                  <Line
                    type="monotone"
                    dataKey="aqi"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 6, fill: "#3b82f6" }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            {/* AQI colour legend */}
            <div className="mt-4 p-3 bg-muted/40 rounded-lg border">
              <p className="text-xs font-semibold mb-2 flex items-center gap-1">
                <Info className="h-3 w-3" /> AQI Colour Guide
              </p>
              <div className="flex flex-wrap gap-x-4 gap-y-1">
                {[
                  { r: "0‑50",    l: "Good",            c: "#10b981" },
                  { r: "51‑100",  l: "Moderate",         c: "#fbbf24" },
                  { r: "101‑150", l: "Sensitive",         c: "#f97316" },
                  { r: "151‑200", l: "Unhealthy",         c: "#ef4444" },
                  { r: "201‑300", l: "Very Unhealthy",    c: "#a855f7" },
                  { r: "301+",    l: "Hazardous",         c: "#7f1d1d" },
                ].map(item => (
                  <div key={item.r} className="flex items-center gap-1.5 text-xs">
                    <span className="h-2.5 w-2.5 rounded-full inline-block flex-shrink-0" style={{ backgroundColor: item.c }} />
                    <span className="text-muted-foreground">{item.r}</span>
                    <span className="font-medium">{item.l}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-3">
            <Calendar className="h-12 w-12 opacity-30" />
            <p className="font-medium">Not enough history yet</p>
            <p className="text-xs text-center max-w-xs">
              The chart builds automatically as the sensor sends new readings (one per unique timestamp). Keep this page open and data will appear here.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ForecastSection;
