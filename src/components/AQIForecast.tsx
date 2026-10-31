import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const forecastData = [
  { day: "Mon", aqi: 75 },
  { day: "Tue", aqi: 82 },
  { day: "Wed", aqi: 68 },
  { day: "Thu", aqi: 95 },
  { day: "Fri", aqi: 88 },
  { day: "Sat", aqi: 72 },
  { day: "Sun", aqi: 65 }
];

const AQIForecast = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>7-Day AI Forecast</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={forecastData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="day" 
              stroke="hsl(var(--muted-foreground))"
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))"
              label={{ value: 'AQI', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px"
              }}
            />
            <Line 
              type="monotone" 
              dataKey="aqi" 
              stroke="hsl(var(--primary))" 
              strokeWidth={3}
              dot={{ fill: "hsl(var(--primary))", r: 5 }}
              activeDot={{ r: 7 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default AQIForecast;