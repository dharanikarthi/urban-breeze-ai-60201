import { Building2, Heart, Leaf, Bus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const initiatives = [
  {
    icon: Building2,
    title: "City Planning",
    description: "Data-driven urban development decisions"
  },
  {
    icon: Heart,
    title: "Healthcare",
    description: "Preventive health management systems"
  },
  {
    icon: Leaf,
    title: "Sustainability",
    description: "Environmental impact monitoring"
  },
  {
    icon: Bus,
    title: "Public Transport",
    description: "Vehicle-mounted sensor integration"
  }
];

const SmartCitySection = () => {
  return (
    <section className="py-20 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Empowering Cleaner, Smarter Cities
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            This platform supports smart city initiatives by helping citizens, planners, and health authorities 
            make data-driven decisions to improve air quality and public health.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {initiatives.map((item, index) => (
            <Card 
              key={index}
              className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-2 hover:border-primary/50"
            >
              <CardContent className="pt-6 text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <item.icon className="h-8 w-8 text-primary-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SmartCitySection;