import { Activity, Brain, Bell, Smartphone, TrendingUp, Map } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  {
    icon: Activity,
    title: "Real-Time AQI Monitoring",
    description: "Tracks pollution dynamically via sensors on public vehicles with live updates every minute."
  },
  {
    icon: Brain,
    title: "AI-Powered Forecasts",
    description: "Predicts AQI trends for the next week using advanced ARIMA machine learning models."
  },
  {
    icon: TrendingUp,
    title: "Personalized Health Insights",
    description: "Suggests yoga poses, preventive measures, and lifestyle adjustments based on your health profile."
  },
  {
    icon: Smartphone,
    title: "Web & Mobile Access",
    description: "Available on all devices for 24/7 AQI updates wherever you are."
  },
  {
    icon: Bell,
    title: "Smart Alerts",
    description: "Instant notifications when air quality drops to unsafe levels in your area."
  },
  {
    icon: Map,
    title: "Interactive Mapping",
    description: "Visual representation of air quality across all Tamil Nadu regions with detailed pollutant data."
  }
];

const FeaturesSection = () => {
  return (
    <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-8 sm:mb-10 md:mb-12 animate-fade-in">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Key Features
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
            Comprehensive air quality monitoring powered by cutting-edge technology
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-2 hover:border-primary/50"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardHeader className="pb-3 sm:pb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon className="h-5 w-5 sm:h-6 sm:w-6 text-primary-foreground" />
                </div>
                <CardTitle className="text-lg sm:text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm sm:text-base leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;