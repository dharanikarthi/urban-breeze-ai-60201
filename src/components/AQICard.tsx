import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface AQICardProps {
  value: number;
  location: string;
  pollutants: {
    pm25: number;
    pm10: number;
    co: number;
    no2: number;
    o3: number;
  };
}

const getAQICategory = (aqi: number) => {
  if (aqi <= 50) return { label: "Good", color: "hsl(var(--aqi-good))" };
  if (aqi <= 100) return { label: "Moderate", color: "hsl(var(--aqi-moderate))" };
  if (aqi <= 150) return { label: "Unhealthy for Sensitive", color: "hsl(var(--aqi-unhealthy-sensitive))" };
  if (aqi <= 200) return { label: "Unhealthy", color: "hsl(var(--aqi-unhealthy))" };
  if (aqi <= 300) return { label: "Very Unhealthy", color: "hsl(var(--aqi-very-unhealthy))" };
  return { label: "Hazardous", color: "hsl(var(--aqi-hazardous))" };
};

const AQICard = ({ value, location, pollutants }: AQICardProps) => {
  const category = getAQICategory(value);

  return (
    <Card className="border-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">{location}</CardTitle>
          <Badge style={{ backgroundColor: category.color, color: "white" }}>
            {category.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <div className="text-5xl font-bold mb-2" style={{ color: category.color }}>
            {value}
          </div>
          <p className="text-sm text-muted-foreground">Air Quality Index</p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">PM2.5</span>
            <span className="font-medium">{pollutants.pm25} μg/m³</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">PM10</span>
            <span className="font-medium">{pollutants.pm10} μg/m³</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">CO</span>
            <span className="font-medium">{pollutants.co} ppm</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">NO₂</span>
            <span className="font-medium">{pollutants.no2} ppb</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">O₃</span>
            <span className="font-medium">{pollutants.o3} ppb</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AQICard;