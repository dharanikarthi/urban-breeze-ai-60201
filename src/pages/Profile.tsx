import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import UserProfileHeader from "@/components/UserProfileHeader";
import HardwareStatusBanner from "@/components/HardwareStatusBanner";
import { useIoT } from "@/contexts/IoTContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Award, User, MapPin, Heart, Trophy, Star, Medal, Crown } from "lucide-react";
import { toast } from "@/hooks/use-toast";
interface BadgeWithIcon {
  id: string;
  name: string;
  icon: string;
  color: string;
  earned: boolean;
  requirement: string;
  iconComponent: any;
}

// Badges data
const badgesData: BadgeWithIcon[] = [
  { id: "beginner", name: "Air Guardian", icon: "Star", color: "hsl(var(--muted-foreground))", earned: true, requirement: "Complete 5 tasks", iconComponent: Star },
  { id: "intermediate", name: "Breath Master", icon: "Medal", color: "hsl(var(--primary))", earned: true, requirement: "Earn 50 points", iconComponent: Medal },
  { id: "expert", name: "Health Champion", icon: "Trophy", color: "hsl(var(--aqi-good))", earned: false, requirement: "Earn 100 points", iconComponent: Trophy },
  { id: "legend", name: "Air Quality Legend", icon: "Crown", color: "hsl(var(--aqi-moderate))", earned: false, requirement: "Earn 200 points", iconComponent: Crown }
];

const Profile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>({});
  const [totalPoints, setTotalPoints] = useState(0);
  const [level, setLevel] = useState("Beginner");
  const [badges] = useState<BadgeWithIcon[]>(badgesData);
  const { data: iotData } = useIoT();

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

  useEffect(() => {
    // Load profile data from localStorage
    const storedProfile = localStorage.getItem("healthProfile");
    const points = localStorage.getItem("totalPoints");
    
    if (storedProfile) {
      setProfile(JSON.parse(storedProfile));
    }
    
    if (points) {
      const pts = parseInt(points);
      setTotalPoints(pts);
      
      if (pts >= 200) setLevel("Legend");
      else if (pts >= 100) setLevel("Expert");
      else if (pts >= 50) setLevel("Intermediate");
      else setLevel("Beginner");
    }
  }, []);



  const handleEditProfile = () => {
    // Clear the profile to allow modal to show again
    localStorage.removeItem("healthProfile");
    toast({
      title: "Redirecting...",
      description: "Opening profile editor",
    });
    // Navigate to home where the modal will appear
    navigate("/");
  };

  const earnedBadges = badges.filter(b => {
    if (b.id === "beginner") return totalPoints >= 0;
    if (b.id === "intermediate") return totalPoints >= 50;
    if (b.id === "expert") return totalPoints >= 100;
    if (b.id === "legend") return totalPoints >= 200;
    return b.earned; // Use API data if available
  });

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      
      <div className="flex-1 lg:ml-64 pb-20 lg:pb-0">
        <main className="p-3 sm:p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-3 sm:space-y-4 md:space-y-6">
            <UserProfileHeader />
            
            <div className="animate-fade-in">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-1">Your Profile</h1>
              <p className="text-sm sm:text-base text-muted-foreground">Manage your information and achievements</p>
            </div>

            <HardwareStatusBanner />

            {/* Live AQI snapshot */}
            {iotData?.aqi !== null && iotData?.aqi !== undefined && (
              <div
                className="flex items-center gap-3 p-3 rounded-xl border-2"
                style={{ borderColor: aqiColor(iotData.aqi), backgroundColor: `${aqiColor(iotData.aqi)}10` }}
              >
                <span className="text-2xl">
                  {iotData.aqi <= 50 ? "😊" : iotData.aqi <= 100 ? "😐" : iotData.aqi <= 150 ? "😷" : iotData.aqi <= 200 ? "😨" : "🚨"}
                </span>
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">Current air quality at sensor</p>
                  <p className="font-bold text-lg" style={{ color: aqiColor(iotData.aqi) }}>
                    AQI {iotData.aqi} — {aqiLabel(iotData.aqi)}
                  </p>
                </div>
                <div className="text-right text-xs text-muted-foreground">
                  <p>{iotData.temperature !== null ? `${iotData.temperature}°C` : ""}</p>
                  <p>{iotData.humidity    !== null ? `${iotData.humidity}% RH`  : ""}</p>
                </div>
              </div>
            )}

            <div className="space-y-6">

            {/* Profile Info Card */}
            <Card className="border-2">
              <CardHeader className="px-4 sm:px-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <CardTitle className="text-lg sm:text-xl md:text-2xl flex items-center gap-2">
                    <User className="h-5 w-5 sm:h-6 sm:w-6 text-primary flex-shrink-0" />
                    Personal Information
                  </CardTitle>
                  <Button onClick={handleEditProfile} variant="outline" className="w-full sm:w-auto min-h-[44px]">
                    Edit Profile
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="px-4 sm:px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-3 sm:space-y-4">
                    <div className="p-3 sm:p-4 rounded-lg bg-muted/50 border">
                      <p className="text-xs sm:text-sm text-muted-foreground mb-1">Name</p>
                      <p className="text-lg sm:text-xl font-semibold break-words">{profile.name || "Not set"}</p>
                    </div>
                    
                    <div className="p-4 rounded-lg bg-muted/50 border">
                      <p className="text-sm text-muted-foreground mb-1">Age</p>
                      <p className="text-xl font-semibold">{profile.age || "Not set"} years</p>
                    </div>
                    
                    <div className="p-4 rounded-lg bg-muted/50 border">
                      <p className="text-sm text-muted-foreground mb-1">Gender</p>
                      <p className="text-xl font-semibold capitalize">{profile.gender || "Not set"}</p>
                    </div>
                    
                    <div className="p-4 rounded-lg bg-muted/50 border flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-primary mt-1" />
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Location</p>
                        <p className="text-xl font-semibold">{profile.location || "Not set"}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-muted/50 border flex items-start gap-3">
                      <Heart className="h-5 w-5 text-red-500 mt-1" />
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Health Conditions</p>
                        <p className="text-xl font-semibold">{profile.healthCondition || "Not set"}</p>
                      </div>
                    </div>

                    <div className="p-4 rounded-lg bg-muted/50 border">
                      <p className="text-sm text-muted-foreground mb-1">Activity Level</p>
                      <p className="text-xl font-semibold capitalize">{profile.activityLevel || "Not set"}</p>
                    </div>

                    <div className="p-4 rounded-lg bg-muted/50 border">
                      <p className="text-sm text-muted-foreground mb-1">Alert Preference</p>
                      <p className="text-xl font-semibold capitalize">{profile.alertType || "Not set"}</p>
                    </div>

                    <div className="p-4 rounded-lg bg-gradient-to-r from-primary/10 to-secondary/10 border-2 border-primary">
                      <div className="flex items-center gap-3">
                        <Award className="h-8 w-8 text-primary" />
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Current Level</p>
                          <p className="text-2xl font-bold text-primary">{level}</p>
                        </div>
                      </div>
                      <div className="mt-3">
                        <p className="text-lg font-semibold">{totalPoints} Points</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {totalPoints < 200 ? `${200 - totalPoints} points to next level` : "Maximum level reached!"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Achievements */}
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <Trophy className="h-6 w-6 text-primary" />
                  Achievements & Badges
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Earned {earnedBadges.length} of {badges.length} badges
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {badges.map((badge) => {
                    const Icon = badge.iconComponent;
                    const isEarned = earnedBadges.some(b => b.id === badge.id);
                    
                    return (
                      <div
                        key={badge.id}
                        className={`p-4 rounded-lg border-2 text-center transition-all ${
                          isEarned 
                            ? "bg-card hover:shadow-lg border-primary" 
                            : "bg-muted/30 opacity-50"
                        }`}
                      >
                        <Icon 
                          className="h-12 w-12 mx-auto mb-2" 
                          style={{ color: isEarned ? badge.color : "hsl(var(--muted-foreground))" }}
                        />
                        <h4 className="font-bold text-sm mb-1">{badge.name}</h4>
                        <p className="text-xs text-muted-foreground">{badge.requirement}</p>
                        {isEarned && (
                          <Badge className="mt-2" style={{ backgroundColor: badge.color, color: "white" }}>
                            Earned
                          </Badge>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Journey Progress */}
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-2xl">Respiratory Health Journey</CardTitle>
                <p className="text-sm text-muted-foreground">Your path to better breathing</p>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  {/* Progress Bar */}
                  <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-500"
                      style={{ width: `${Math.min((totalPoints / 200) * 100, 100)}%` }}
                    />
                  </div>
                  
                  {/* Milestones */}
                  <div className="flex justify-between mt-6">
                    <div className="text-center">
                      <div className={`w-12 h-12 rounded-full mx-auto flex items-center justify-center ${totalPoints >= 0 ? 'bg-primary' : 'bg-muted'}`}>
                        <Star className={`h-6 w-6 ${totalPoints >= 0 ? 'text-white' : 'text-muted-foreground'}`} />
                      </div>
                      <p className="text-xs mt-2 font-semibold">Start</p>
                      <p className="text-xs text-muted-foreground">0 pts</p>
                    </div>
                    
                    <div className="text-center">
                      <div className={`w-12 h-12 rounded-full mx-auto flex items-center justify-center ${totalPoints >= 50 ? 'bg-primary' : 'bg-muted'}`}>
                        <Medal className={`h-6 w-6 ${totalPoints >= 50 ? 'text-white' : 'text-muted-foreground'}`} />
                      </div>
                      <p className="text-xs mt-2 font-semibold">Bronze</p>
                      <p className="text-xs text-muted-foreground">50 pts</p>
                    </div>
                    
                    <div className="text-center">
                      <div className={`w-12 h-12 rounded-full mx-auto flex items-center justify-center ${totalPoints >= 100 ? 'bg-secondary' : 'bg-muted'}`}>
                        <Trophy className={`h-6 w-6 ${totalPoints >= 100 ? 'text-white' : 'text-muted-foreground'}`} />
                      </div>
                      <p className="text-xs mt-2 font-semibold">Silver</p>
                      <p className="text-xs text-muted-foreground">100 pts</p>
                    </div>
                    
                    <div className="text-center">
                      <div className={`w-12 h-12 rounded-full mx-auto flex items-center justify-center ${totalPoints >= 200 ? 'bg-yellow-500' : 'bg-muted'}`}>
                        <Crown className={`h-6 w-6 ${totalPoints >= 200 ? 'text-white' : 'text-muted-foreground'}`} />
                      </div>
                      <p className="text-xs mt-2 font-semibold">Gold</p>
                      <p className="text-xs text-muted-foreground">200 pts</p>
                    </div>
                  </div>
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

export default Profile;
