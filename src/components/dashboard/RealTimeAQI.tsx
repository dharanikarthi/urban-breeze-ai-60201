import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock } from "lucide-react";

interface RealTimeAQIProps {
  value: number;
  location: string;
  pollutants: {
    pm25: number;
    pm10: number;
    co: number;
    no2: number;
    o3: number;
  };
  lastUpdated: Date;
}

const getAQICategory = (aqi: number) => {
  if (aqi <= 50) return { label: "Good", color: "hsl(var(--aqi-good))", bg: "bg-[hsl(var(--aqi-good))]", emoji: "😊" };
  if (aqi <= 100) return { label: "Moderate", color: "hsl(var(--aqi-moderate))", bg: "bg-[hsl(var(--aqi-moderate))]", emoji: "😐" };
  if (aqi <= 150) return { label: "Unhealthy for Sensitive", color: "hsl(var(--aqi-unhealthy-sensitive))", bg: "bg-[hsl(var(--aqi-unhealthy-sensitive))]", emoji: "😷" };
  if (aqi <= 200) return { label: "Unhealthy", color: "hsl(var(--aqi-unhealthy))", bg: "bg-[hsl(var(--aqi-unhealthy))]", emoji: "😨" };
  if (aqi <= 300) return { label: "Very Unhealthy", color: "hsl(var(--aqi-very-unhealthy))", bg: "bg-[hsl(var(--aqi-very-unhealthy))]", emoji: "🚨" };
  return { label: "Hazardous", color: "hsl(var(--aqi-hazardous))", bg: "bg-[hsl(var(--aqi-hazardous))]", emoji: "☠️" };
};

const RealTimeAQI = ({ value, location, pollutants, lastUpdated }: RealTimeAQIProps) => {
  const category = getAQICategory(value);
  const percentage = Math.min((value / 300) * 100, 100);

  return (
    <Card 
      className="border-2 hover:shadow-lg transition-shadow"
      style={{ borderLeftWidth: "6px", borderLeftColor: category.color }}
    >
      <CardHeader 
        className="rounded-t-lg pb-3 sm:pb-4" 
        style={{ backgroundColor: `${category.color}15` }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
            <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-primary flex-shrink-0" />
            <span className="truncate">{location}</span>
          </CardTitle>
          <Badge style={{ backgroundColor: category.color, color: "white" }} className="text-xs sm:text-sm px-2 sm:px-3 py-1 w-fit">
            {category.label}
          </Badge>
        </div>
        <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground mt-2">
          <Clock className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
          <span className="truncate">Last updated: {lastUpdated.toLocaleTimeString()}</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 sm:space-y-6 pt-4 sm:pt-6">
        <div>
          <div className="flex items-center gap-3 sm:gap-4 mb-4">
            <span className="text-5xl sm:text-6xl md:text-7xl">{category.emoji}</span>
            <div>
              <div className="text-5xl sm:text-6xl md:text-7xl font-bold" style={{ color: category.color }}>
                {value}
              </div>
              <p className="text-sm sm:text-base text-muted-foreground font-medium">Air Quality Index</p>
            </div>
          </div>
          
          {/* Color-coded bar */}
          <div className="relative w-full h-2 sm:h-3 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full transition-all duration-500 rounded-full"
              style={{ 
                width: `${percentage}%`,
                backgroundColor: category.color
              }}
            />
          </div>
          <div className="flex justify-between text-[10px] sm:text-xs text-muted-foreground mt-2">
            <span>0</span>
            <span>50</span>
            <span>100</span>
            <span>150</span>
            <span>200</span>
            <span>300+</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <div className="p-3 sm:p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors border">
            <div className="text-xs sm:text-sm text-muted-foreground mb-1 font-medium">🫁 PM2.5</div>
            <div className="text-xl sm:text-2xl font-bold">{pollutants.pm25}</div>
            <div className="text-[10px] sm:text-xs text-muted-foreground">μg/m³</div>
          </div>
          <div className="p-3 sm:p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors border">
            <div className="text-xs sm:text-sm text-muted-foreground mb-1 font-medium">💨 PM10</div>
            <div className="text-xl sm:text-2xl font-bold">{pollutants.pm10}</div>
            <div className="text-[10px] sm:text-xs text-muted-foreground">μg/m³</div>
          </div>
          <div className="p-3 sm:p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors border">
            <div className="text-xs sm:text-sm text-muted-foreground mb-1 font-medium">🚗 CO</div>
            <div className="text-xl sm:text-2xl font-bold">{pollutants.co}</div>
            <div className="text-[10px] sm:text-xs text-muted-foreground">ppm</div>
          </div>
          <div className="p-3 sm:p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors border">
            <div className="text-xs sm:text-sm text-muted-foreground mb-1 font-medium">🏭 NO₂</div>
            <div className="text-xl sm:text-2xl font-bold">{pollutants.no2}</div>
            <div className="text-[10px] sm:text-xs text-muted-foreground">ppb</div>
          </div>
          <div className="p-3 sm:p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors border col-span-2">
            <div className="text-xs sm:text-sm text-muted-foreground mb-1 font-medium">☀️ O₃</div>
            <div className="text-xl sm:text-2xl font-bold">{pollutants.o3}</div>
            <div className="text-[10px] sm:text-xs text-muted-foreground">ppb</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RealTimeAQI;
