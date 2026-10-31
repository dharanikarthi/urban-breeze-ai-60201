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
import { X, Shield, MapPin } from "lucide-react";
import { useIoT } from "@/contexts/IoTContext";

// ─── AQI category helper (shared) ───────────────────────────────────────────
const getAQICategory = (aqi: number) => {
  if (aqi <= 50)  return { label: "Good",                   color: "hsl(var(--aqi-good))",                emoji: "😊", safety: "safe" };
  if (aqi <= 100) return { label: "Moderate",                color: "hsl(var(--aqi-moderate))",            emoji: "😐", safety: "moderate" };
  if (aqi <= 150) return { label: "Unhealthy for Sensitive", color: "hsl(var(--aqi-unhealthy-sensitive))", emoji: "😷", safety: "unhealthy-sensitive" };
  if (aqi <= 200) return { label: "Unhealthy",               color: "hsl(var(--aqi-unhealthy))",           emoji: "😨", safety: "unhealthy" };
  if (aqi <= 300) return { label: "Very Unhealthy",          color: "hsl(var(--aqi-very-unhealthy))",      emoji: "🚨", safety: "very-unhealthy" };
  return           { label: "Hazardous",                     color: "hsl(var(--aqi-hazardous))",           emoji: "☠️", safety: "hazardous" };
};

// ─── Health recommendation engine ───────────────────────────────────────────
const getHealthRecs = (aqi: number, profile: Record<string, string>) => {
  const age      = parseInt(profile.age) || 30;
  const isElderly = age >= 60;
  const isChild   = age < 18;
  const cond      = profile.healthCondition?.toLowerCase() || "";
  const hasAsthma = cond.includes("asthma");
  const hasCOPD   = cond.includes("copd");
  const hasAllergies = cond.includes("allergies");
  const hasHeart  = cond.includes("heart");
  const isHighRisk = hasAsthma || hasCOPD || hasAllergies || hasHeart || isElderly || isChild;

  const cat = getAQICategory(aqi);

  let title = `${cat.emoji} Air Quality: ${cat.label}`;
  let recs: string[] = [];

  if (aqi <= 50) {
    recs = ["Perfect for outdoor activities", "No special precautions needed"];
    if (hasAsthma) recs.push("Safe for asthma patients — enjoy outdoor time");
  } else if (aqi <= 100) {
    recs = isHighRisk
      ? ["You're in a sensitive group — take extra care", "Consider wearing a KN95 mask outdoors", "Keep windows closed during peak hours"]
      : ["Generally safe for most people", "Sensitive individuals may limit prolonged outdoor exposure"];
    if (hasAsthma) recs.push("🫁 Carry rescue inhaler at all times");
    if (hasAllergies) recs.push("🤧 Consider antihistamines before going out");
  } else if (aqi <= 150) {
    title = `⚠️ Unhealthy Air for Sensitive Groups`;
    recs = ["Sensitive groups should stay indoors", "⚠️ Wear N95/KN95 mask if going outside", "Keep all windows closed", "Run air purifier on high setting"];
    if (hasAsthma) recs.push("🫁 High asthma attack risk — avoid outdoor activities completely");
    if (hasHeart) recs.push("❤️ Avoid any strenuous activity outdoors");
  } else if (aqi <= 200) {
    title = `🛑 Unhealthy Air — Limit Outdoor Time`;
    recs = ["Everyone should reduce outdoor activities", "🚫 Mandatory N95 mask if venturing outside", "Seal windows and doors", "Cancel non-essential outdoor plans"];
    if (isHighRisk) recs.push("⚠️ HIGH RISK: Stay indoors completely, consider medical advice");
  } else if (aqi <= 300) {
    title = `☢️ Very Unhealthy — Stay Indoors`;
    recs = ["🚫 DO NOT go outside — emergency conditions", "Seal all windows/doors with tape if necessary", "Run HEPA air purifiers in every room", "Monitor health symptoms hourly"];
    if (isHighRisk) recs.push("🚨 MEDICAL ALERT: Contact your doctor immediately");
  } else {
    title = `☠️ Hazardous — Evacuate if Possible`;
    recs = ["⚠️ LIFE-THREATENING air quality", "🚫 Do NOT go outside under ANY circumstances", "Evacuate to cleaner air if possible", "Call emergency services if symptoms appear"];
  }

  return { title, recs, color: cat.color, icon: cat.emoji };
};

// ─── Dashboard ───────────────────────────────────────────────────────────────
const Dashboard = () => {
  const profile = JSON.parse(localStorage.getItem("healthProfile") || "{}");
  const { data, status, hardwareOnline } = useIoT();

  const [showHealthAlert, setShowHealthAlert] = useState(false);
  const [dismissedAqi, setDismissedAqi]       = useState<number | null>(null);

  // Show health alert whenever AQI crosses a meaningful threshold
  useEffect(() => {
    if (!data?.aqi) return;
    const aqi = data.aqi;
    // Only re-show if the AQI category bucket changed
    const prevBucket = dismissedAqi !== null ? Math.floor(dismissedAqi / 50) : -1;
    const currBucket = Math.floor(aqi / 50);
    if (currBucket !== prevBucket) {
      setShowHealthAlert(true);
    }
  }, [data?.aqi]);

  const aqi      = data?.aqi ?? null;
  const cat      = aqi !== null ? getAQICategory(aqi) : null;
  const healthRec = aqi !== null ? getHealthRecs(aqi, profile) : null;

  const hasLiveData = status === "ok" || status === "stale";

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />

      <div className="flex-1 lg:ml-64 pb-20 lg:pb-0">
        <main className="p-3 sm:p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-3 sm:space-y-4 md:space-y-6">
            <UserProfileHeader />

            {/* Page title */}
            <div className="animate-fade-in">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-1">
                {profile.name ? `Hi, ${profile.name}! 👋` : "Dashboard"}
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                Live IoT sensor data · refreshing every 3 s
              </p>
            </div>

            {/* Hardware status banner */}
            <HardwareStatusBanner />

            {/* Health alert (driven by live AQI) */}
            {showHealthAlert && healthRec && aqi !== null && (
              <Card
                className="border-2 animate-fade-in"
                style={{ borderColor: healthRec.color, borderLeftWidth: "6px" }}
              >
                <CardContent className="pt-4 sm:pt-5 px-3 sm:px-6">
                  <div className="flex items-start justify-between gap-2 sm:gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base sm:text-xl font-bold break-words mb-3" style={{ color: healthRec.color }}>
                        {healthRec.title}
                      </h3>
                      <ul className="space-y-2">
                        {healthRec.recs.map((rec, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs sm:text-sm">
                            <Shield className="h-3 w-3 sm:h-4 sm:w-4 mt-0.5 flex-shrink-0 text-muted-foreground" />
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                      {profile.healthCondition && (
                        <p className="mt-3 text-xs text-muted-foreground">
                          ⚕️ Based on your health profile: <strong>{profile.healthCondition}</strong>
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => { setShowHealthAlert(false); setDismissedAqi(aqi); }}
                      className="p-1 sm:p-2 hover:bg-black/10 rounded-full transition-colors flex-shrink-0"
                      aria-label="Dismiss"
                    >
                      <X className="h-4 w-4 sm:h-5 sm:w-5" />
                    </button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* ── Sensor location chip ── */}
            {data?.latitude && data?.longitude && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3 text-primary" />
                <span>
                  Sensor at{" "}
                  <a
                    href={`https://www.google.com/maps?q=${data.latitude},${data.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary underline underline-offset-2"
                  >
                    {data.latitude}, {data.longitude}
                  </a>
                </span>
              </div>
            )}

            {/* ── Main sensor data tabs ── */}
            <div className="space-y-3 sm:space-y-4">
              <h2 className="text-base sm:text-lg font-semibold text-muted-foreground uppercase tracking-wide">
                📡 Live Sensor Data
              </h2>

              <Tabs defaultValue="realtime" className="w-full">
                <TabsList className="grid w-full grid-cols-3 h-11">
                  <TabsTrigger value="realtime"  className="text-xs sm:text-sm">Real‑Time</TabsTrigger>
                  <TabsTrigger value="forecast"  className="text-xs sm:text-sm">Forecast</TabsTrigger>
                  <TabsTrigger value="guide"     className="text-xs sm:text-sm">AQI Guide</TabsTrigger>
                </TabsList>

                {/* ── Real-Time tab ── */}
                <TabsContent value="realtime" className="space-y-6 mt-6">
                  <IoTSensorPanel />
                </TabsContent>

                {/* ── Forecast tab ── */}
                <TabsContent value="forecast" className="space-y-6 mt-6">
                  <ForecastSection
                    location={data?.latitude ? `${data.latitude}, ${data.longitude}` : "IoT Sensor"}
                    liveAqi={aqi}
                    liveTemperature={data?.temperature ?? null}
                    liveHumidity={data?.humidity ?? null}
                  />
                </TabsContent>

                {/* ── Guide tab ── */}
                <TabsContent value="guide" className="mt-6">
                  <AQIGuideSection />
                </TabsContent>
              </Tabs>
            </div>

            {/* ── Health Tasks ── */}
            <div className="space-y-3 sm:space-y-4 mt-4">
              <h2 className="text-base sm:text-lg font-semibold text-muted-foreground uppercase tracking-wide">
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
