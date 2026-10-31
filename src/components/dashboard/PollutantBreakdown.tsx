import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import { LineChart, Line, ResponsiveContainer } from "recharts";
import { AQILocation } from "@/services/csvService";

interface Pollutant {
  name: string;
  value: number;
  unit: string;
  safeLimit: number;
  description: string;
  trend: number[];
  healthImpact: string;
  icon: string;
}

interface PollutantBreakdownProps {
  locationData?: AQILocation;
  location: string;
}

const PollutantBreakdown = ({ locationData, location }: PollutantBreakdownProps) => {
  // Generate trend data based on current value
  const generateTrend = (value: number) => {
    const trend = [];
    for (let i = 0; i < 7; i++) {
      const variation = (Math.random() - 0.5) * value * 0.1;
      trend.push(Math.max(0, value + variation));
    }
    return trend;
  };

  const pollutants: Pollutant[] = locationData ? [
    {
      name: "PM2.5",
      value: locationData.pollutants.pm25,
      unit: "μg/m³",
      safeLimit: 35,
      description: "Fine particulate matter that can penetrate deep into lungs and bloodstream",
      healthImpact: locationData.pollutants.pm25 > 35 ? "Moderate – May cause discomfort for sensitive groups" : "Good – Safe for most people",
      icon: "🫁",
      trend: generateTrend(locationData.pollutants.pm25)
    },
    {
      name: "PM10",
      value: locationData.pollutants.pm10,
      unit: "μg/m³",
      safeLimit: 150,
      description: "Coarse particulate matter from dust, pollen, and mold",
      healthImpact: locationData.pollutants.pm10 > 150 ? "Moderate – May affect sensitive individuals" : "Good – Safe for most people",
      icon: "💨",
      trend: generateTrend(locationData.pollutants.pm10)
    },
    {
      name: "CO",
      value: locationData.pollutants.co,
      unit: "ppm",
      safeLimit: 9,
      description: "Carbon monoxide from vehicle exhaust and combustion",
      healthImpact: locationData.pollutants.co > 9 ? "Unhealthy – Reduce outdoor exposure" : "Good – No immediate health concerns",
      icon: "🚗",
      trend: generateTrend(locationData.pollutants.co)
    },
    {
      name: "NO₂",
      value: locationData.pollutants.no2,
      unit: "ppb",
      safeLimit: 100,
      description: "Nitrogen dioxide from traffic emissions and industrial sources",
      healthImpact: locationData.pollutants.no2 > 100 ? "Moderate – May affect respiratory health" : "Good – Within safe limits",
      icon: "🏭",
      trend: generateTrend(locationData.pollutants.no2)
    },
    {
      name: "O₃",
      value: locationData.pollutants.o3,
      unit: "ppb",
      safeLimit: 70,
      description: "Ground-level ozone formed by sunlight reacting with pollutants",
      healthImpact: locationData.pollutants.o3 > 70 ? "Moderate – May cause breathing discomfort" : "Good – Safe ozone levels",
      icon: "☀️",
      trend: generateTrend(locationData.pollutants.o3)
    }
  ] : [];
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="text-lg sm:text-xl">Pollutant Breakdown - {location}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          {pollutants.map((pollutant) => {
            const isAboveLimit = pollutant.value > pollutant.safeLimit;
            const trendData = pollutant.trend.map((value, index) => ({ value }));
            
            return (
              <div 
                key={pollutant.name} 
                className="p-4 sm:p-5 rounded-lg border-2 bg-card hover:shadow-md transition-all animate-fade-in"
              >
                <div className="flex items-start justify-between mb-3 sm:mb-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl sm:text-2xl flex-shrink-0">{pollutant.icon}</span>
                      <h4 className="font-bold text-base sm:text-lg truncate">{pollutant.name}</h4>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            <p className="text-sm">{pollutant.description}</p>
                            <p className="text-xs mt-1 text-muted-foreground">
                              Safe limit: {pollutant.safeLimit} {pollutant.unit}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <div className="flex items-baseline gap-2 mb-2">
                      <span className={`text-2xl sm:text-3xl font-bold ${isAboveLimit ? 'text-red-500' : 'text-green-500'}`}>
                        {pollutant.value}
                      </span>
                      <span className="text-sm sm:text-base text-muted-foreground font-medium">{pollutant.unit}</span>
                    </div>
                    <Badge 
                      variant="outline"
                      style={{ 
                        backgroundColor: isAboveLimit ? "hsl(var(--aqi-unhealthy) / 0.1)" : "hsl(var(--aqi-good) / 0.1)",
                        borderColor: isAboveLimit ? "hsl(var(--aqi-unhealthy))" : "hsl(var(--aqi-good))",
                        color: isAboveLimit ? "hsl(var(--aqi-unhealthy))" : "hsl(var(--aqi-good))"
                      }}
                      className="text-[10px] sm:text-xs font-semibold"
                    >
                      {isAboveLimit ? "Above safe limit" : "Within safe limit"}
                    </Badge>
                  </div>
                  <ResponsiveContainer width={60} height={40} className="hidden sm:block">
                    <LineChart data={trendData}>
                      <Line 
                        type="monotone" 
                        dataKey="value" 
                        stroke={isAboveLimit ? "hsl(var(--aqi-unhealthy))" : "hsl(var(--aqi-good))"} 
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="relative w-full h-2 sm:h-3 bg-muted rounded-full overflow-hidden mb-2 sm:mb-3">
                  <div
                    className="h-full transition-all duration-500"
                    style={{ 
                      width: `${Math.min((pollutant.value / pollutant.safeLimit) * 100, 100)}%`,
                      backgroundColor: isAboveLimit ? "hsl(var(--aqi-unhealthy))" : "hsl(var(--aqi-good))"
                    }}
                  />
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {pollutant.healthImpact}
                </p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default PollutantBreakdown;
