/**
 * Insights page — fully driven by live IoT sensor data.
 *
 * Charts:
 *   1. AQI over time (from IoTContext history)
 *   2. Temperature & Humidity (from IoTContext history)
 *   3. Gas concentration (MQ135 ppm) over time
 *   4. Task completion pie (localStorage)
 *
 * Stats:
 *   • Current AQI, Temp, Humidity from latest sensor reading
 *   • Tasks done / points from localStorage
 */
import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import UserProfileHeader from "@/components/UserProfileHeader";
import HardwareStatusBanner from "@/components/HardwareStatusBanner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AreaChart, Area,
  LineChart, Line,
  BarChart, Bar,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp, TrendingDown, Activity, Award,
  Wind, Thermometer, Droplets, AlertCircle,
} from "lucide-react";
import { useIoT } from "@/contexts/IoTContext";

// ─── helpers ─────────────────────────────────────────────────────────────────

const aqiColor = (aqi: number) => {
  if (aqi <= 50)  return "#10b981";
  if (aqi <= 100) return "#fbbf24";
  if (aqi <= 150) return "#f97316";
  if (aqi <= 200) return "#ef4444";
  if (aqi <= 300) return "#a855f7";
  return "#7f1d1d";
};

const fmtTime = (rt: string | null) => {
  if (!rt) return "";
  try {
    return new Date(rt.replace(" ", "T")).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch { return rt; }
};

// ─── Tooltip style ────────────────────────────────────────────────────────────

const tooltipStyle = {
  contentStyle: {
    backgroundColor: "hsl(var(--card))",
    border: "1px solid hsl(var(--border))",
    borderRadius: "8px",
    fontSize: "12px",
  },
};

// ─── Insights ─────────────────────────────────────────────────────────────────

const Insights = () => {
  const { data, history, status, hardwareOnline } = useIoT();

  const [totalPoints,    setTotalPoints]    = useState(0);
  const [tasksCompleted, setTasksCompleted] = useState(0);
  const [taskData,       setTaskData]       = useState([
    { name: "Completed", value: 0, color: "#10b981" },
    { name: "Pending",   value: 5, color: "hsl(var(--muted))" },
  ]);

  useEffect(() => {
    const pts   = localStorage.getItem("totalPoints");
    const tasks = localStorage.getItem("dailyTasks");
    const pts_n = pts ? parseInt(pts) : 0;
    setTotalPoints(pts_n);
    if (tasks) {
      const parsed: { completed: boolean }[] = JSON.parse(tasks);
      const done    = parsed.filter(t => t.completed).length;
      const pending = parsed.length - done;
      setTasksCompleted(done);
      setTaskData([
        { name: "Completed", value: done,    color: "#10b981" },
        { name: "Pending",   value: pending, color: "hsl(var(--muted))" },
      ]);
    }
  }, []);

  // Build chart data from history (oldest → newest)
  const chartPoints = [...history]
    .reverse()
    .filter(h => h.readingTime)
    .map(h => ({
      time:  fmtTime(h.readingTime),
      aqi:   h.aqi,
      temp:  h.temperature,
      hum:   h.humidity,
      gas:   h.mq135,
    }));

  const hasHistory = chartPoints.length >= 2;

  // Stats from latest reading
  const currentAqi  = data?.aqi          ?? null;
  const currentTemp = data?.temperature  ?? null;
  const currentHum  = data?.humidity     ?? null;

  const avgAqi = hasHistory
    ? Math.round(chartPoints.reduce((s, d) => s + (d.aqi ?? 0), 0) / chartPoints.length)
    : currentAqi;

  const aqiTrend = hasHistory && chartPoints.length >= 2
    ? chartPoints[chartPoints.length - 1].aqi! - chartPoints[0].aqi!
    : null;

  const isOnline = status === "ok" && hardwareOnline;

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />

      <div className="flex-1 lg:ml-64 pb-20 lg:pb-0">
        <main className="p-3 sm:p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-4 md:space-y-6">
            <UserProfileHeader />

            <div className="animate-fade-in">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-1">Health Insights</h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                Live sensor analytics · {chartPoints.length} reading{chartPoints.length !== 1 ? "s" : ""} collected this session
              </p>
            </div>

            <HardwareStatusBanner />

            {/* ── Quick stats ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {/* Current AQI */}
              <Card className="border-2">
                <CardContent className="pt-4 sm:pt-5 px-3 sm:px-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm text-muted-foreground mb-1">Current AQI</p>
                      <p
                        className="text-2xl sm:text-3xl font-bold"
                        style={currentAqi !== null ? { color: aqiColor(currentAqi) } : undefined}
                      >
                        {currentAqi ?? "—"}
                      </p>
                      <Badge variant="outline" className="mt-1 text-xs">
                        {isOnline ? "Live" : status === "stale" ? "Stale" : "—"}
                      </Badge>
                    </div>
                    <Activity className="h-6 w-6 sm:h-8 sm:w-8 text-primary flex-shrink-0" />
                  </div>
                </CardContent>
              </Card>

              {/* Temperature */}
              <Card className="border-2">
                <CardContent className="pt-4 sm:pt-5 px-3 sm:px-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm text-muted-foreground mb-1">Temperature</p>
                      <p className="text-2xl sm:text-3xl font-bold text-primary">
                        {currentTemp !== null ? `${currentTemp}°C` : "—"}
                      </p>
                      <Badge variant="outline" className="mt-1 text-xs">Live</Badge>
                    </div>
                    <Thermometer className="h-6 w-6 sm:h-8 sm:w-8 text-orange-500 flex-shrink-0" />
                  </div>
                </CardContent>
              </Card>

              {/* Humidity */}
              <Card className="border-2">
                <CardContent className="pt-4 sm:pt-5 px-3 sm:px-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm text-muted-foreground mb-1">Humidity</p>
                      <p className="text-2xl sm:text-3xl font-bold text-primary">
                        {currentHum !== null ? `${currentHum}%` : "—"}
                      </p>
                      <Badge variant="outline" className="mt-1 text-xs">Live</Badge>
                    </div>
                    <Droplets className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500 flex-shrink-0" />
                  </div>
                </CardContent>
              </Card>

              {/* Points */}
              <Card className="border-2">
                <CardContent className="pt-4 sm:pt-5 px-3 sm:px-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm text-muted-foreground mb-1">Points Earned</p>
                      <p className="text-2xl sm:text-3xl font-bold text-primary">{totalPoints}</p>
                      <Badge variant="outline" className="mt-1 text-xs">Total</Badge>
                    </div>
                    <Award className="h-6 w-6 sm:h-8 sm:w-8 text-primary flex-shrink-0" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* ── AQI over time ── */}
            <Card className="border-2">
              <CardHeader>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                    <Activity className="h-5 w-5 text-primary" />
                    AQI Over Time
                  </CardTitle>
                  {aqiTrend !== null && (
                    <div className="flex items-center gap-1 text-sm">
                      {aqiTrend <= 0
                        ? <><TrendingDown className="h-4 w-4 text-green-500" /><span className="text-green-600">Improving</span></>
                        : <><TrendingUp   className="h-4 w-4 text-red-500"   /><span className="text-red-600">Rising</span></>
                      }
                      <span className="text-muted-foreground ml-1">
                        ({aqiTrend > 0 ? "+" : ""}{aqiTrend})
                      </span>
                    </div>
                  )}
                </div>
                {avgAqi !== null && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Session average AQI: <span className="font-bold" style={{ color: aqiColor(avgAqi) }}>{avgAqi}</span>
                  </p>
                )}
              </CardHeader>
              <CardContent>
                {hasHistory ? (
                  <ResponsiveContainer width="100%" height={280}>
                    <AreaChart data={chartPoints}>
                      <defs>
                        <linearGradient id="aqiGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor="hsl(var(--primary))" stopOpacity={0.35} />
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
                      <YAxis stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 11 }} label={{ value: "AQI", angle: -90, position: "insideLeft", style: { fontSize: 12 } }} />
                      <Tooltip {...tooltipStyle} formatter={(v: number) => [v, "AQI"]} />
                      <Area type="monotone" dataKey="aqi" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#aqiGrad)" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyChart label="AQI history will appear here as the sensor sends new readings." />
                )}
              </CardContent>
            </Card>

            {/* ── Temp & Humidity ── */}
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                  <Thermometer className="h-5 w-5 text-orange-500" />
                  Temperature &amp; Humidity
                </CardTitle>
              </CardHeader>
              <CardContent>
                {hasHistory ? (
                  <ResponsiveContainer width="100%" height={260}>
                    <LineChart data={chartPoints}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
                      <YAxis stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 11 }} />
                      <Tooltip {...tooltipStyle} />
                      <Line type="monotone" dataKey="temp" stroke="#f97316" strokeWidth={2} dot={false} name="Temp (°C)" />
                      <Line type="monotone" dataKey="hum"  stroke="#3b82f6" strokeWidth={2} dot={false} name="Humidity (%)" />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyChart label="Temperature and humidity history will build up here." />
                )}
              </CardContent>
            </Card>

            {/* ── Gas + Task completion ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">

              {/* Gas (MQ135 ppm) */}
              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                    <Wind className="h-5 w-5 text-primary" />
                    Gas Concentration (MQ135)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {hasHistory ? (
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={chartPoints}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                        <YAxis stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 11 }} />
                        <Tooltip {...tooltipStyle} formatter={(v: number) => [v, "ppm"]} />
                        <Bar dataKey="gas" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="MQ135 ppm" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <EmptyChart label="Gas readings will appear as new sensor data arrives." height={220} />
                  )}
                </CardContent>
              </Card>

              {/* Task completion */}
              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl">Daily Task Completion</CardTitle>
                  <p className="text-sm text-muted-foreground">{tasksCompleted} of {taskData.reduce((s, d) => s + d.value, 0)} tasks done</p>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie
                        data={taskData}
                        cx="50%"
                        cy="50%"
                        outerRadius={75}
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}`}
                        dataKey="value"
                      >
                        {taskData.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  {taskData[0].value + taskData[1].value > 0 && (
                    <p className="text-center text-sm text-muted-foreground mt-1">
                      {Math.round((taskData[0].value / (taskData[0].value + taskData[1].value)) * 100)}% completion rate
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
};

// ─── EmptyChart placeholder ───────────────────────────────────────────────────
const EmptyChart = ({ label, height = 260 }: { label: string; height?: number }) => (
  <div
    className="flex flex-col items-center justify-center text-muted-foreground gap-3 rounded-xl border border-dashed bg-muted/20"
    style={{ height }}
  >
    <AlertCircle className="h-8 w-8 opacity-30" />
    <p className="text-xs text-center max-w-xs px-4">{label}</p>
  </div>
);

export default Insights;
