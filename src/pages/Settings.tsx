import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import UserProfileHeader from "@/components/UserProfileHeader";
import HardwareStatusBanner from "@/components/HardwareStatusBanner";
import { useIoT } from "@/contexts/IoTContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Bell, Moon, MapPin, Shield, Trash2, Wifi } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useTheme } from "@/hooks/use-theme";
// Available locations
const availableLocations = [
  "Velachery", "Tambaram", "Anna Nagar", "T. Nagar", 
  "Coimbatore", "Madurai", "Trichy", "Salem",
  "Adyar", "Mylapore", "Guindy", "Porur",
  "Chrompet", "Pallavaram", "Sholinganallur", "OMR",
  "ECR", "Perungudi", "Thoraipakkam", "Navalur",
  "Siruseri", "Vandalur", "Poonamallee", "Avadi",
  "Ambattur", "Red Hills", "Thiruvallur", "Kanchipuram",
  "Chengalpattu", "Mahabalipuram", "Pondicherry"
];

const Settings = () => {
  const { theme, toggleTheme } = useTheme();
  const { data: iotData, status: iotStatus, hardwareOnline } = useIoT();
  const [location, setLocation] = useState("Velachery");
  const [notifications, setNotifications] = useState(true);
  const [healthAlerts, setHealthAlerts] = useState(true);
  const [dataSharing, setDataSharing] = useState(false);

  useEffect(() => {
    // Load settings from localStorage
    const profile = JSON.parse(localStorage.getItem("healthProfile") || "{}");
    if (profile.location) setLocation(profile.location);

    const savedSettings = localStorage.getItem("appSettings");
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setNotifications(settings.notifications ?? true);
      setHealthAlerts(settings.healthAlerts ?? true);
      setDataSharing(settings.dataSharing ?? false);
    }
  }, []);



  const saveSettings = () => {
    const settings = {
      notifications,
      healthAlerts,
      dataSharing
    };
    localStorage.setItem("appSettings", JSON.stringify(settings));

    const profile = JSON.parse(localStorage.getItem("healthProfile") || "{}");
    profile.location = location;
    localStorage.setItem("healthProfile", JSON.stringify(profile));

    toast({
      title: "Settings Saved",
      description: "Your preferences have been updated successfully.",
    });
  };

  const handleClearData = () => {
    if (confirm("Are you sure you want to clear all your data? This cannot be undone.")) {
      localStorage.removeItem("dailyTasks");
      localStorage.removeItem("totalPoints");
      localStorage.removeItem("healthProfile");
      localStorage.removeItem("appSettings");
      
      toast({
        title: "Data Cleared",
        description: "All your data has been removed.",
        variant: "destructive"
      });
      
      setTimeout(() => window.location.reload(), 1500);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      
      <div className="flex-1 lg:ml-64 pb-20 lg:pb-0">
        <main className="p-3 sm:p-4 md:p-6 lg:p-8">
          <div className="max-w-4xl mx-auto space-y-3 sm:space-y-4 md:space-y-6">
            <UserProfileHeader />
            
            <div className="animate-fade-in">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-1">Settings</h1>
              <p className="text-sm sm:text-base text-muted-foreground">Manage your preferences</p>
            </div>

            <HardwareStatusBanner />

            <div className="space-y-6">

            {/* IoT Sensor Info */}
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wifi className="h-5 w-5 text-primary" />
                  IoT Sensor Connection
                </CardTitle>
                <CardDescription>
                  Live data source: iotcloud22.in/4991/demo.php
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Hardware Status</span>
                  <span className={`text-sm font-semibold px-2 py-0.5 rounded-full ${
                    iotStatus === "ok" && hardwareOnline
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                      : iotStatus === "stale"
                      ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
                      : iotStatus === "error"
                      ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                      : "bg-muted text-muted-foreground"
                  }`}>
                    {iotStatus === "ok" && hardwareOnline ? "Online" :
                     iotStatus === "stale"               ? "Hardware Offline" :
                     iotStatus === "error"               ? "Connection Error" :
                     iotStatus === "loading"             ? "Connecting…" : "Idle"}
                  </span>
                </div>
                {iotData && (
                  <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                    <div className="p-2 rounded-lg bg-muted/50">
                      <p className="font-medium text-foreground">Last Reading</p>
                      <p>{iotData.readingTime ?? "—"}</p>
                    </div>
                    <div className="p-2 rounded-lg bg-muted/50">
                      <p className="font-medium text-foreground">Derived AQI</p>
                      <p>{iotData.aqi ?? "—"}</p>
                    </div>
                    <div className="p-2 rounded-lg bg-muted/50">
                      <p className="font-medium text-foreground">MQ135 Gas</p>
                      <p>{iotData.mq135 !== null ? `${iotData.mq135} ppm` : "—"}</p>
                    </div>
                    <div className="p-2 rounded-lg bg-muted/50">
                      <p className="font-medium text-foreground">Poll Interval</p>
                      <p>3 seconds</p>
                    </div>
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  The sensor is scraped via a Vercel serverless proxy at <code className="font-mono bg-muted px-1 rounded">/api/iot-data</code>.
                  Hardware online/offline is detected by comparing consecutive device timestamps.
                </p>
              </CardContent>
            </Card>

            {/* Location Settings */}
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  Location Preferences
                </CardTitle>
                <CardDescription>
                  Choose your primary location for air quality monitoring
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <Label htmlFor="location" className="text-sm sm:text-base font-medium">Preferred Location</Label>
                  <Select value={location} onValueChange={setLocation}>
                    <SelectTrigger className="w-full sm:w-[200px] h-11">
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableLocations.map((loc) => (
                        <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Notification Settings */}
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-primary" />
                  Notification Preferences
                </CardTitle>
                <CardDescription>
                  Control how you receive alerts and updates
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="notifications" className="text-base">Enable Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive daily AQI updates and reminders
                    </p>
                  </div>
                  <Switch
                    id="notifications"
                    checked={notifications}
                    onCheckedChange={setNotifications}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="health-alerts" className="text-base">Health Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Get alerts when air quality is unhealthy
                    </p>
                  </div>
                  <Switch
                    id="health-alerts"
                    checked={healthAlerts}
                    onCheckedChange={setHealthAlerts}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Appearance Settings */}
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Moon className="h-5 w-5 text-primary" />
                  Appearance
                </CardTitle>
                <CardDescription>
                  Customize how the app looks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="dark-mode" className="text-base">Dark Mode</Label>
                    <p className="text-sm text-muted-foreground">
                      Switch to dark theme
                    </p>
                  </div>
                  <Switch
                    id="dark-mode"
                    checked={theme === "dark"}
                    onCheckedChange={toggleTheme}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Privacy Settings */}
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Privacy & Data
                </CardTitle>
                <CardDescription>
                  Manage your data and privacy preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="data-sharing" className="text-base">Anonymous Data Sharing</Label>
                    <p className="text-sm text-muted-foreground">
                      Help improve air quality research
                    </p>
                  </div>
                  <Switch
                    id="data-sharing"
                    checked={dataSharing}
                    onCheckedChange={setDataSharing}
                  />
                </div>

                <div className="pt-4 border-t">
                  <Button 
                    variant="destructive" 
                    className="w-full"
                    onClick={handleClearData}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear All Data
                  </Button>
                  <p className="text-xs text-muted-foreground text-center mt-2">
                    This will remove all your profile, tasks, and progress data
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3">
              <Button variant="outline" onClick={() => window.location.reload()} className="w-full sm:w-auto">
                Cancel
              </Button>
              <Button onClick={saveSettings} className="w-full sm:w-auto sm:min-w-[120px]">
                Save Settings
              </Button>
            </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
};

export default Settings;
