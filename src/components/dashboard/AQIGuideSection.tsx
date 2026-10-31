import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Info, Wind, Heart, AlertTriangle, AlertOctagon, Skull } from "lucide-react";

const aqiLevels = [
  {
    range: "0-50",
    label: "Good",
    color: "hsl(var(--aqi-good))",
    icon: Heart,
    description: "Air quality is satisfactory, safe for everyone.",
    emoji: "😊"
  },
  {
    range: "51-100",
    label: "Moderate",
    color: "hsl(var(--aqi-moderate))",
    icon: Wind,
    description: "Acceptable; some pollutants may affect sensitive people.",
    emoji: "😐"
  },
  {
    range: "101-150",
    label: "Unhealthy for Sensitive",
    color: "hsl(var(--aqi-unhealthy-sensitive))",
    icon: Info,
    description: "May cause irritation or breathing difficulty.",
    emoji: "😷"
  },
  {
    range: "151-200",
    label: "Unhealthy",
    color: "hsl(var(--aqi-unhealthy))",
    icon: AlertTriangle,
    description: "Everyone may experience some health effects.",
    emoji: "😨"
  },
  {
    range: "201-300",
    label: "Very Unhealthy",
    color: "hsl(var(--aqi-very-unhealthy))",
    icon: AlertOctagon,
    description: "Health warnings; avoid outdoor activities.",
    emoji: "🚨"
  },
  {
    range: "301-500",
    label: "Hazardous",
    color: "hsl(var(--aqi-hazardous))",
    icon: Skull,
    description: "Emergency conditions; everyone should avoid outdoor exposure.",
    emoji: "☠️"
  }
];

const AQIGuideSection = () => {
  return (
    <Card className="hover:shadow-lg transition-shadow border-2">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Info className="h-6 w-6 text-primary" />
          <CardTitle className="text-2xl">Understand Your AQI</CardTitle>
        </div>
        <p className="text-base text-muted-foreground mt-2">
          Learn what air quality index numbers mean for your health
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Color Bar Legend */}
        <div className="relative w-full h-8 rounded-lg overflow-hidden flex">
          {aqiLevels.map((level, idx) => (
            <div
              key={idx}
              style={{ 
                backgroundColor: level.color,
                flex: idx === aqiLevels.length - 1 ? 2 : 1
              }}
              className="flex items-center justify-center text-white text-xs font-semibold"
            >
              {level.range}
            </div>
          ))}
        </div>

        {/* Detailed Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          {aqiLevels.map((level) => {
            const Icon = level.icon;
            return (
              <div
                key={level.label}
                className="p-4 rounded-lg border-2 bg-card hover:shadow-md transition-all"
                style={{ borderLeftWidth: "6px", borderLeftColor: level.color }}
              >
                <div className="flex items-start gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-3xl">{level.emoji}</span>
                    <Icon className="h-6 w-6" style={{ color: level.color }} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge 
                        style={{ 
                          backgroundColor: level.color,
                          color: "white"
                        }}
                        className="text-sm font-bold"
                      >
                        {level.range}
                      </Badge>
                      <h4 className="font-bold text-lg">{level.label}</h4>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {level.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default AQIGuideSection;
