/**
 * Insights page — live IoT analytics + rich health insights
 *
 * Sections:
 *   1. Quick stats (AQI, Temp, Humidity, Points)
 *   2. AQI Over Time chart
 *   3. Temperature & Humidity chart
 *   4. Gas Concentration chart
 *   5. Health Insights panel:
 *      • Lung health score (derived from AQI exposure)
 *      • Exposure risk level
 *      • Personalized health advice
 *      • Activity safety guide
 *   6. Daily Task Completion pie
 */
import { useState, useEffect, useMemo } from "react";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import UserProfileHeader from "@/components/UserProfileHeader";
import HardwareStatusBanner from "@/components/HardwareStatusBanner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
  Wind, Thermometer, Droplets, Heart,
  ShieldCheck, AlertTriangle, CheckCircle, XCircle,
  Bike, PersonStanding, Dumbbell,
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
const aqiLabel = (aqi: number) => {
  if (aqi <= 50)  return "Good";
  if (aqi <= 100) return "Moderate";
  if (aqi <= 150) return "Unhealthy for Sensitive";
  if (aqi <= 200) return "Unhealthy";
  if (aqi <= 300) return "Very Unhealthy";
  return "Hazardous";
};

const fmtTime = (rt: string | null) => {
  if (!rt) return "";
  try { return new Date(rt.replace(" ", "T")).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }); }
  catch { return rt; }
};

const tooltipStyle = {
  contentStyle: {
    backgroundColor: "hsl(var(--card))",
    border: "1px solid hsl(var(--border))",
    borderRadius: "8px",
    fontSize: "12px",
  },
};

// ─── Lung health score (0-100) ───────────────────────────────────────────────

function computeLungScore(avgAqi: number): number {
  if (avgAqi <= 50)  return Math.round(92 + (50 - avgAqi) * 0.16);
  if (avgAqi <= 100) return Math.round(75 + (100 - avgAqi) * 0.34);
  if (avgAqi <= 150) return Math.round(55 + (150 - avgAqi) * 0.40);
  if (avgAqi <= 200) return Math.round(35 + (200 - avgAqi) * 0.40);
  return Math.max(10, Math.round(35 - (avgAqi - 200) * 0.12));
}

function lungScoreColor(score: number): string {
  if (score >= 80) return "#10b981";
  if (score >= 60) return "#fbbf24";
  if (score >= 40) return "#f97316";
  return "#ef4444";
}

// ─── Activity safety ─────────────────────────────────────────────────────────

function getActivitySafety(aqi: number) {
  return [
    {
      icon: PersonStanding,
      label: "Walking / Light Walk",
      safe:  aqi <= 150,
      note:  aqi <= 50 ? "Great — go for it!" : aqi <= 100 ? "Generally safe" : aqi <= 150 ? "Sensitive groups limit time" : "Avoid outdoors",
    },
    {
      icon: Bike,
      label: "Cycling / Running",
      safe:  aqi <= 100,
      note:  aqi <= 50 ? "Perfect conditions" : aqi <= 100 ? "Acceptable for healthy adults" : "Not recommended",
    },
    {
      icon: Dumbbell,
      label: "Intense Outdoor Exercise",
      safe:  aqi <= 50,
      note:  aqi <= 50 ? "Ideal — go train!" : aqi <= 100 ? "Reduce intensity" : "Move workout indoors",
    },
  ];
}

// ─── Personalized health advice ───────────────────────────────────────────────

function getHealthAdvice(aqi: number, profile: Record<string, string>) {
  const cond     = (profile.healthCondition || "").toLowerCase();
  const hasAsthma    = cond.includes("asthma");
  const hasCOPD      = cond.includes("copd");
  const hasAllergies = cond.includes("allerg");
  const hasHeart     = cond.includes("heart");
  const isHighRisk   = hasAsthma || hasCOPD || hasAllergies || hasHeart;

  const advice: { icon: string; text: string; type: "good" | "warn" | "danger" }[] = [];

  if (aqi <= 50) {
    advice.push({ icon: "😊", text: "Air quality is excellent — perfect for all outdoor activities.", type: "good" });
    advice.push({ icon: "🌿", text: "Open windows to let fresh air circulate indoors.", type: "good" });
    advice.push({ icon: "🏃", text: "Great time for morning runs, cycling, or outdoor sports.", type: "good" });
  } else if (aqi <= 100) {
    advice.push({ icon: "✅", text: "Air quality is acceptable for most people.", type: "good" });
    if (isHighRisk) {
      advice.push({ icon: "⚠️", text: "You have a health condition — limit prolonged outdoor exposure.", type: "warn" });
    }
    if (hasAsthma) advice.push({ icon: "🫁", text: "Carry your rescue inhaler outdoors.", type: "warn" });
    if (hasAllergies) advice.push({ icon: "🤧", text: "Consider an antihistamine before going outside.", type: "warn" });
    advice.push({ icon: "💧", text: "Stay well-hydrated; drink at least 8 glasses of water.", type: "good" });
  } else if (aqi <= 150) {
    advice.push({ icon: "⚠️", text: "Air quality is unhealthy for sensitive groups.", type: "warn" });
    advice.push({ icon: "😷", text: "Wear a KN95/N95 mask if heading outside.", type: "warn" });
    advice.push({ icon: "🏠", text: "Keep windows closed; use an air purifier indoors.", type: "warn" });
    if (hasAsthma || hasCOPD) advice.push({ icon: "🚨", text: "High respiratory risk — avoid outdoor activities entirely.", type: "danger" });
    if (hasHeart) advice.push({ icon: "❤️", text: "Avoid strenuous activity; monitor heart rate.", type: "danger" });
  } else if (aqi <= 200) {
    advice.push({ icon: "🛑", text: "Unhealthy air — everyone should reduce outdoor time.", type: "danger" });
    advice.push({ icon: "😷", text: "Mandatory N95 mask for any outdoor exposure.", type: "danger" });
    advice.push({ icon: "🏠", text: "Seal windows and run HEPA air purifiers continuously.", type: "danger" });
    if (isHighRisk) advice.push({ icon: "🚨", text: "HIGH RISK: Consider staying home entirely and contacting your doctor.", type: "danger" });
  } else {
    advice.push({ icon: "☢️", text: "Very unhealthy / hazardous — do not go outside.", type: "danger" });
    advice.push({ icon: "🚨", text: "Evacuate to a location with better air quality if possible.", type: "danger" });
    advice.push({ icon: "📞", text: "If experiencing symptoms, call emergency services (108).", type: "danger" });
  }

  return advice;
}

// ─── EmptyChart placeholder ───────────────────────────────────────────────────

const EmptyChart = ({ label, height = 240 }: { label: string; height?: number }) => (
  <div className="flex flex-col items-center justify-center text-muted-foreground gap-3 rounded-xl border border-dashed bg-muted/20" style={{ height }}>
    <Activity className="h-8 w-8 opacity-30" />
    <p className="text-xs text-center max-w-xs px-4">{label}</p>
  </div>
);

// ─── Main ─────────────────────────────────────────────────────────────────────

const Insights = () => {
  const { data, history, status, hardwareOnline } = useIoT();
  const profile = JSON.parse(localStorage.getItem("healthProfile") || "{}");

  const [totalPoints,    setTotalPoints]    = useState(0);
  const [tasksCompleted, setTasksCompleted] = useState(0);
  const [taskData,       setTaskData]       = useState([
    { name: "Completed", value: 0, color: "#10b981" },
    { name: "Pending",   value: 5, color: "#e5e7eb" },
  ]);

  useEffect(() => {
    const pts   = localStorage.getItem("totalPoints");
    const tasks = localStorage.getItem("dailyTasks");
    setTotalPoints(pts ? parseInt(pts) : 0);
    if (tasks) {
      const parsed: { completed: boolean }[] = JSON.parse(tasks);
      const done    = parsed.filter(t => t.completed).length;
      const pending = parsed.length - done;
      setTasksCompleted(done);
      setTaskData([
        { name: "Completed", value: done,    color: "#10b981" },
        { name: "Pending",   value: pending, color: "#e5e7eb" },
      ]);
    }
  }, []);

  // Chart points (oldest → newest)
  const chartPoints = useMemo(() =>
    [...history]
      .reverse()
      .filter(h => h.readingTime)
      .map(h => ({
        time: fmtTime(h.readingTime),
        aqi:  h.aqi,
        temp: h.temperature,
        hum:  h.humidity,
        gas:  h.mq135,
      })),
    [history]
  );

  const hasHistory = chartPoints.length >= 2;

  const currentAqi  = data?.aqi          ?? null;
  const currentTemp = data?.temperature  ?? null;
  const currentHum  = data?.humidity     ?? null;

  const avgAqi = chartPoints.length
    ? Math.round(chartPoints.reduce((s, d) => s + (d.aqi ?? 0), 0) / chartPoints.length)
    : (currentAqi ?? 0);

  const aqiTrend = chartPoints.length >= 2
    ? (chartPoints[chartPoints.length - 1].aqi ?? 0) - (chartPoints[0].aqi ?? 0)
    : null;

  const lungScore        = computeLungScore(avgAqi);
  const lungScoreClr     = lungScoreColor(lungScore);
  const activitySafety   = getActivitySafety(currentAqi ?? avgAqi);
  const healthAdvice     = getHealthAdvice(currentAqi ?? avgAqi, profile);
  const isOnline         = status === "ok" && hardwareOnline;

  // Exposure risk
  const exposureRisk =
    avgAqi <= 50  ? { label: "Low",      color: "#10b981", icon: ShieldCheck  } :
    avgAqi <= 100 ? { label: "Moderate", color: "#fbbf24", icon: AlertTriangle } :
    avgAqi <= 150 ? { label: "High",     color: "#f97316", icon: AlertTriangle } :
                    { label: "Very High",color: "#ef4444", icon: XCircle      };

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />

      <div className="flex-1 lg:ml-64 pb-20 lg:pb-0">
        <main className="p-3 sm:p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-4 md:space-y-6">
            <UserProfileHeader />

            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-0.5">Health Insights</h1>
              <p className="text-sm text-muted-foreground">
                {chartPoints.length} reading{chartPoints.length !== 1 ? "s" : ""} this session · live IoT analytics
              </p>
            </div>

            <HardwareStatusBanner />

            {/* ── Quick stats ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <Card className="border-2">
                <CardContent className="pt-4 px-4 pb-4">
                  <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><Activity className="h-3.5 w-3.5" /> Current AQI</p>
                  <p className="text-3xl font-bold" style={currentAqi !== null ? { color: aqiColor(currentAqi) } : undefined}>
                    {currentAqi ?? "—"}
                  </p>
                  <Badge variant="outline" className="mt-1 text-xs">{isOnline ? "Live" : "Cached"}</Badge>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardContent className="pt-4 px-4 pb-4">
                  <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><Thermometer className="h-3.5 w-3.5" /> Temperature</p>
                  <p className="text-3xl font-bold text-orange-500">{currentTemp !== null ? `${currentTemp}°C` : "—"}</p>
                  <Badge variant="outline" className="mt-1 text-xs">Live</Badge>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardContent className="pt-4 px-4 pb-4">
                  <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><Droplets className="h-3.5 w-3.5" /> Humidity</p>
                  <p className="text-3xl font-bold text-blue-500">{currentHum !== null ? `${currentHum}%` : "—"}</p>
                  <Badge variant="outline" className="mt-1 text-xs">Live</Badge>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardContent className="pt-4 px-4 pb-4">
                  <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><Award className="h-3.5 w-3.5" /> Points</p>
                  <p className="text-3xl font-bold text-primary">{totalPoints}</p>
                  <Badge variant="outline" className="mt-1 text-xs">{tasksCompleted} tasks done</Badge>
                </CardContent>
              </Card>
            </div>

            {/* ── Health Insights panel ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

              {/* Lung health score */}
              <Card className="border-2">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    🫁 Lung Health Score
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 mb-4">
                    <div
                      className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold text-white flex-shrink-0"
                      style={{ background: `conic-gradient(${lungScoreClr} ${lungScore}%, #e5e7eb ${lungScore}%)` }}
                    >
                      <div className="w-14 h-14 rounded-full bg-card flex items-center justify-center">
                        <span className="text-xl font-bold" style={{ color: lungScoreClr }}>{lungScore}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-2xl font-bold" style={{ color: lungScoreClr }}>
                        {lungScore >= 80 ? "Excellent" : lungScore >= 60 ? "Fair" : lungScore >= 40 ? "Poor" : "Critical"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">Based on avg AQI {avgAqi}</p>
                    </div>
                  </div>
                  <Progress value={lungScore} className="h-2 mb-2" style={{ "--progress-color": lungScoreClr } as any} />
                  <p className="text-xs text-muted-foreground">
                    {lungScore >= 80
                      ? "🟢 Breathing conditions are excellent. Keep it up!"
                      : lungScore >= 60
                      ? "🟡 Moderate exposure — monitor regularly."
                      : lungScore >= 40
                      ? "🟠 Elevated risk — take protective measures."
                      : "🔴 High risk — minimise outdoor exposure immediately."}
                  </p>
                </CardContent>
              </Card>

              {/* Exposure risk */}
              <Card className="border-2">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    ☁️ Exposure Risk
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div
                    className="flex items-center gap-3 p-3 rounded-xl border-2"
                    style={{ borderColor: exposureRisk.color, backgroundColor: `${exposureRisk.color}15` }}
                  >
                    <exposureRisk.icon className="h-8 w-8 flex-shrink-0" style={{ color: exposureRisk.color }} />
                    <div>
                      <p className="font-bold text-lg" style={{ color: exposureRisk.color }}>{exposureRisk.label} Risk</p>
                      <p className="text-xs text-muted-foreground">AQI {avgAqi} · {aqiLabel(avgAqi)}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {[
                      { label: "Daily safe exposure", val: avgAqi <= 50 ? "24h" : avgAqi <= 100 ? "8–12h" : avgAqi <= 150 ? "2–4h" : "< 30 min" },
                      { label: "Mask needed",          val: avgAqi > 100 ? "Yes — KN95/N95" : "No" },
                      { label: "Window ventilation",   val: avgAqi <= 100 ? "Yes — open windows" : "No — keep closed" },
                      { label: "Air purifier",         val: avgAqi > 100 ? "Recommended" : "Optional" },
                    ].map(r => (
                      <div key={r.label} className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">{r.label}</span>
                        <span className="font-medium">{r.val}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Activity safety */}
              <Card className="border-2">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    🏃 Activity Safety
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {activitySafety.map(a => (
                    <div key={a.label} className={`flex items-start gap-3 p-2.5 rounded-lg border ${
                      a.safe ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                             : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
                    }`}>
                      <div className={`p-1.5 rounded-md flex-shrink-0 ${a.safe ? "bg-green-100 dark:bg-green-800/40" : "bg-red-100 dark:bg-red-800/40"}`}>
                        <a.icon className={`h-4 w-4 ${a.safe ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold truncate">{a.label}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{a.note}</p>
                      </div>
                      {a.safe
                        ? <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 ml-auto" />
                        : <XCircle    className="h-4 w-4 text-red-500   flex-shrink-0 ml-auto" />
                      }
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* ── Personalized health advice ── */}
            <Card className="border-2">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Heart className="h-4 w-4 text-red-500" />
                  Personalized Health Advice
                  {profile.name && <span className="text-sm font-normal text-muted-foreground">for {profile.name}</span>}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {healthAdvice.map((a, i) => (
                    <div key={i} className={`flex items-start gap-2.5 p-3 rounded-lg border text-sm ${
                      a.type === "good"   ? "bg-green-50  dark:bg-green-900/20  border-green-200  dark:border-green-800" :
                      a.type === "warn"   ? "bg-amber-50  dark:bg-amber-900/20  border-amber-200  dark:border-amber-800" :
                                            "bg-red-50    dark:bg-red-900/20    border-red-200    dark:border-red-800"
                    }`}>
                      <span className="text-base flex-shrink-0">{a.icon}</span>
                      <span className={
                        a.type === "good"   ? "text-green-800 dark:text-green-300" :
                        a.type === "warn"   ? "text-amber-800 dark:text-amber-300" :
                                              "text-red-800   dark:text-red-300"
                      }>{a.text}</span>
                    </div>
                  ))}
                </div>
                {profile.healthCondition && (
                  <p className="mt-3 text-xs text-muted-foreground bg-muted/50 p-2 rounded-lg">
                    ⚕️ Advice personalised for: <strong>{profile.healthCondition}</strong>
                  </p>
                )}
              </CardContent>
            </Card>

            {/* ── AQI chart ── */}
            <Card className="border-2">
              <CardHeader>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Activity className="h-5 w-5 text-primary" /> AQI Over Time
                  </CardTitle>
                  {aqiTrend !== null && (
                    <div className="flex items-center gap-1 text-sm">
                      {aqiTrend <= 0
                        ? <><TrendingDown className="h-4 w-4 text-green-500" /><span className="text-green-600">Improving ({aqiTrend})</span></>
                        : <><TrendingUp   className="h-4 w-4 text-red-500"   /><span className="text-red-600">Rising (+{aqiTrend})</span></>
                      }
                    </div>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  Session avg: <span className="font-bold" style={{ color: aqiColor(avgAqi) }}>{avgAqi}</span> — {aqiLabel(avgAqi)}
                </p>
              </CardHeader>
              <CardContent>
                {hasHistory ? (
                  <ResponsiveContainer width="100%" height={260}>
                    <AreaChart data={chartPoints}>
                      <defs>
                        <linearGradient id="aqiGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor="hsl(var(--primary))" stopOpacity={0.35} />
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
                      <YAxis stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 11 }} />
                      <Tooltip {...tooltipStyle} formatter={(v: number) => [v, "AQI"]} />
                      <Area type="monotone" dataKey="aqi" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#aqiGrad)" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyChart label="AQI history will appear automatically as the sensor sends new readings." />
                )}
              </CardContent>
            </Card>

            {/* ── Temp & Humidity ── */}
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Thermometer className="h-5 w-5 text-orange-500" /> Temperature &amp; Humidity
                </CardTitle>
              </CardHeader>
              <CardContent>
                {hasHistory ? (
                  <ResponsiveContainer width="100%" height={240}>
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
                  <EmptyChart label="Temperature and humidity charts will build up here." />
                )}
              </CardContent>
            </Card>

            {/* ── Gas + Task pie ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Wind className="h-5 w-5 text-primary" /> Gas Concentration (MQ135)
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
                        <Bar dataKey="gas" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="ppm" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <EmptyChart label="Gas readings will appear as new sensor data arrives." height={220} />
                  )}
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="text-lg">Daily Task Completion</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {tasksCompleted} of {taskData.reduce((s, d) => s + d.value, 0)} tasks done today
                  </p>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={taskData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={80}
                        paddingAngle={4}
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
                    <p className="text-center text-sm font-semibold mt-1">
                      {Math.round((taskData[0].value / (taskData[0].value + taskData[1].value)) * 100)}% completion rate
                    </p>
                  )}
                  <div className="flex justify-center gap-4 mt-2">
                    {taskData.map(d => (
                      <div key={d.name} className="flex items-center gap-1.5 text-xs">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                        {d.name} ({d.value})
                      </div>
                    ))}
                  </div>
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

export default Insights;
