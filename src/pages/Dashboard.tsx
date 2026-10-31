import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import UserProfileHeader from "@/components/UserProfileHeader";
import IoTSensorPanel from "@/components/dashboard/IoTSensorPanel";
import AQIGuideSection from "@/components/dashboard/AQIGuideSection";
import ForecastSection from "@/components/dashboard/ForecastSection";
import RecommendationsSection from "@/components/dashboard/RecommendationsSection";
import HardwareStatusBanner from "@/components/HardwareStatusBanner";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { X, Shield, MapPin, Thermometer, Droplets, Wind } from "lucide-react";
import { useIoT } from "@/contexts/IoTContext";

// ─── helpers ─────────────────────────────────────────────────────────────────

const getAQICategory = (aqi: number) => {
  if (aqi <= 50)  return { label: "Good",                   color: "hsl(var(--aqi-good))",                emoji: "😊" };
  if (aqi <= 100) return { label: "Moderate",                color: "hsl(var(--aqi-moderate))",            emoji: "😐" };
  if (aqi <= 150) return { label: "Unhealthy for Sensitive", color: "hsl(var(--aqi-unhealthy-sensitive))", emoji: "😷" };
  if (aqi <= 200) return { label: "Unhealthy",               color: "hsl(var(--aqi-unhealthy))",           emoji: "😨" };
  if (aqi <= 300) return { label: "Very Unhealthy",          color: "hsl(var(--aqi-very-unhealthy))",      emoji: "🚨" };
  return           { label: "Hazardous",                     color: "hsl(var(--aqi-hazardous))",           emoji: "☠️" };
};

const getHealthRecs = (aqi: number, profile: Record<string, string>) => {
  const cond         = profile.healthCondition?.toLowerCase() || "";
  const isHighRisk   = ["asthma","copd","heart","allergies"].some(c => cond.includes(c));
  const cat          = getAQICategory(aqi);
  let title = `${cat.emoji} Air Quality: ${cat.label}`;
  let recs: string[] = [];

  if (aqi <= 50) {
    recs = ["Perfect for outdoor activities", "No special precautions needed"];
  } else if (aqi <= 100) {
    recs = isHighRisk
      ? ["You're in a sensitive group — take extra care", "Consider a KN95 mask outdoors"]
      : ["Generally safe for most people"];
    if (cond.includes("asthma")) recs.push("🫁 Carry rescue inhaler at all times");
  } else if (aqi <= 150) {
    title = `⚠️ Unhealthy for Sensitive Groups`;
    recs = ["Sensitive groups should stay indoors", "Wear N95/KN95 mask if going outside", "Keep windows closed"];
  } else if (aqi <= 200) {
    title = `🛑 Unhealthy — Limit Outdoor Time`;
    recs = ["Reduce all outdoor activities", "Mandatory N95 mask outside", "Seal windows and doors"];
  } else if (aqi <= 300) {
    title = `☢️ Very Unhealthy — Stay Indoors`;
    recs = ["DO NOT go outside", "Run HEPA air purifiers", "Monitor health symptoms"];
  } else {
    title = `☠️ Hazardous — Evacuate if Possible`;
    recs = ["LIFE-THREATENING air quality", "Do NOT go outside", "Call emergency services if symptoms appear"];
  }
  return { title, recs, color: cat.color };
};

// ─── Quick stat card ─────────────────────────────────────────────────────────

const StatCard = ({
  icon, label, value, unit, color,
}: {
  icon: React.ReactNode; label: string;
  value: string | number | null; unit: string; color?: string;
}) => (
  <Card className="border-2">
    <CardContent className="pt-4 pb-3 px-4">
      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
        {icon} {label}
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl sm:text-3xl font-bold" style={color ? { color } : undefined}>
          {value !== null && value !== undefined ? value : "—"}
        </span>
        <span className="text-xs text-muted-foreground">{unit}</span>
      </div>
    </CardContent>
  </Card>
);

// ─── Dashboard ───────────────────────────────────────────────────────────────

const Dashboard = () => {
  const profile = JSON.parse(localStorage.getItem("healthProfile") || "{}");
  const { data, status, hardwareOnline } = useIoT();

  const [showHealthAlert, setShowHealthAlert] = useState(false);
  const [dismissedBucket, setDismissedBucket] = useState<number | null>(null);

  useEffect(() => {
    if (!data?.aqi) return;
    const bucket = Math.floor(data.aqi / 50);
    if (bucket !== dismissedBucket) setShowHealthAlert(true);
  }, [data?.aqi]);

  const aqi       = data?.aqi      ?? null;
  const temp      = data?.temperature ?? null;
  const humidity  = data?.humidity ?? null;
  const gas       = data?.mq135    ?? null;
  const cat       = aqi !== null ? getAQICategory(aqi) : null;
  const healthRec = aqi !== null ? getHealthRecs(aqi, profile) : null;

  const firstName = profile.name?.split(" ")[0] || "";

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />

      <div className="flex-1 lg:ml-64 pb-20 lg:pb-0">
        <main className="p-3 sm:p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-4 md:space-y-6">
            <UserProfileHeader />

            {/* ── Title ── */}
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">
                {firstName ? `Hi, ${firstName}! 👋` : "Dashboard"}
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Live IoT sensor · updates every 3 s
                {data?.latitude && data?.longitude && (
                  <> ·{" "}
                    <a
                      href={`https://www.google.com/maps?q=${data.latitude},${data.longitude}`}
                      target="_blank" rel="noopener noreferrer"
                      className="text-primary underline-offset-2 hover:underline inline-flex items-center gap-0.5"
                    >
                      <MapPin className="h-3 w-3" />
                      {data.latitude.toFixed(4)}, {data.longitude.toFixed(4)}
                    </a>
                  </>
                )}
              </p>
            </div>

            {/* ── Hardware status ── */}
            <HardwareStatusBanner />

            {/* ── Live stats row ── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatCard
                icon={<Wind className="h-3.5 w-3.5" />}
                label="AQI"
                value={aqi !== null ? `${aqi} ${cat?.emoji ?? ""}` : null}
                unit=""
                color={cat?.color}
              />
              <StatCard
                icon={<Thermometer className="h-3.5 w-3.5" />}
                label="Temperature"
                value={temp}
                unit="°C"
              />
              <StatCard
                icon={<Droplets className="h-3.5 w-3.5" />}
                label="Humidity"
                value={humidity}
                unit="%"
              />
              <StatCard
                icon={<Wind className="h-3.5 w-3.5" />}
                label="MQ135 Gas"
                value={gas}
                unit="ppm"
              />
            </div>

            {/* ── Health alert ── */}
            {showHealthAlert && healthRec && aqi !== null && (
              <Card
                className="border-l-4 animate-fade-in"
                style={{ borderColor: healthRec.color }}
              >
                <CardContent className="pt-4 px-4 pb-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm sm:text-base mb-2" style={{ color: healthRec.color }}>
                        {healthRec.title}
                      </p>
                      <ul className="space-y-1">
                        {healthRec.recs.map((rec, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs sm:text-sm text-muted-foreground">
                            <Shield className="h-3 w-3 mt-0.5 flex-shrink-0" />
                            {rec}
                          </li>
                        ))}
                      </ul>
                      {profile.healthCondition && (
                        <p className="mt-2 text-xs text-muted-foreground">
                          ⚕️ Based on: <strong>{profile.healthCondition}</strong>
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        setShowHealthAlert(false);
                        setDismissedBucket(aqi !== null ? Math.floor(aqi / 50) : null);
                      }}
                      className="p-1 hover:bg-muted rounded-full transition-colors flex-shrink-0"
                      aria-label="Dismiss"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* ── Main tabs ── */}
            <Tabs defaultValue="realtime" className="w-full">
              <TabsList className="grid w-full grid-cols-3 h-11">
                <TabsTrigger value="realtime" className="text-xs sm:text-sm">📡 Live Data</TabsTrigger>
                <TabsTrigger value="history"  className="text-xs sm:text-sm">📈 History</TabsTrigger>
                <TabsTrigger value="guide"    className="text-xs sm:text-sm">ℹ️ AQI Guide</TabsTrigger>
              </TabsList>

              <TabsContent value="realtime" className="mt-6">
                <IoTSensorPanel />
              </TabsContent>

              <TabsContent value="history" className="mt-6">
                <ForecastSection
                  location={
                    data?.latitude
                      ? `${data.latitude.toFixed(4)}, ${data.longitude?.toFixed(4)}`
                      : "IoT Sensor"
                  }
                  liveAqi={aqi}
                  liveTemperature={temp}
                  liveHumidity={humidity}
                />
              </TabsContent>

              <TabsContent value="guide" className="mt-6">
                <AQIGuideSection />
              </TabsContent>
            </Tabs>

            {/* ── Health Tasks ── */}
            <div className="mt-2">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                🏥 Health Tasks
              </h2>
              <RecommendationsSection />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default Dashboard;
