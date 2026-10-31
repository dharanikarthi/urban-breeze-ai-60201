import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Heart, Wind } from "lucide-react";

const HealthInsights = () => {
  const profile = JSON.parse(localStorage.getItem("healthProfile") || "{}");
  
  const insights = [
    {
      title: "Today's Recommendation",
      description: profile.activityLevel === "active" 
        ? "Air quality is moderate. Consider indoor workouts today."
        : "Good time for a short walk, but avoid heavy outdoor activities.",
      icon: Heart
    },
    {
      title: "Yoga & Breathing",
      description: "Try Pranayama breathing exercises to strengthen lung capacity and reduce pollution effects.",
      icon: Wind
    }
  ];

  return (
    <div className="space-y-4">
      <Alert className="border-2 border-primary/50 bg-primary/5">
        <AlertCircle className="h-4 w-4 text-primary" />
        <AlertDescription className="text-sm">
          <strong>Alert:</strong> High PM2.5 detected in your area. Stay indoors if possible.
        </AlertDescription>
      </Alert>

      {insights.map((insight, index) => (
        <Card key={index}>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <insight.icon className="h-5 w-5 text-primary" />
              {insight.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{insight.description}</p>
          </CardContent>
        </Card>
      ))}

      {profile.name && (
        <Card className="bg-gradient-to-br from-secondary/10 to-primary/10 border-2">
          <CardHeader>
            <CardTitle className="text-lg">Your Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Name:</span>
              <span className="font-medium">{profile.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Location:</span>
              <span className="font-medium">{profile.location}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Activity Level:</span>
              <span className="font-medium capitalize">{profile.activityLevel}</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default HealthInsights;