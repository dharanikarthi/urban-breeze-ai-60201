import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";

const plans = [
  {
    name: "Basic",
    price: "₹500",
    period: "/month",
    description: "Perfect for individuals starting their air quality journey",
    features: [
      "Real-time AQI data for your location",
      "Basic pollution alerts",
      "Mobile & web access",
      "Daily AQI reports",
      "Email support"
    ],
    highlighted: false
  },
  {
    name: "Premium",
    price: "₹1,500",
    period: "/month",
    description: "Complete health protection with personalized insights",
    features: [
      "Everything in Basic",
      "7-day AI-powered forecasts",
      "Personalized health insights",
      "Yoga & lifestyle recommendations",
      "Advanced alerts (SMS + Email + In-App)",
      "Priority support",
      "Historical data access"
    ],
    highlighted: true
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "Tailored solutions for organizations and smart cities",
    features: [
      "Everything in Premium",
      "Bulk sensor deployment",
      "Custom analytics dashboard",
      "API access",
      "City-wide integration",
      "Dedicated account manager",
      "White-label options"
    ],
    highlighted: false
  }
];

const PricingSection = () => {
  return (
    <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-b from-muted/30 to-background">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-8 sm:mb-10 md:mb-12 animate-fade-in">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Pricing & Plans
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
            Choose the perfect plan for your air quality monitoring needs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 max-w-6xl mx-auto mb-8 sm:mb-12">
          {plans.map((plan, index) => (
            <Card 
              key={index}
              className={`relative ${
                plan.highlighted 
                  ? "border-primary shadow-xl md:scale-105 z-10" 
                  : "border-border"
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary to-secondary text-primary-foreground px-3 sm:px-4 py-1 rounded-full text-xs sm:text-sm font-semibold">
                  Most Popular
                </div>
              )}
              <CardHeader className="pb-4">
                <CardTitle className="text-xl sm:text-2xl">{plan.name}</CardTitle>
                <CardDescription className="text-sm sm:text-base">{plan.description}</CardDescription>
                <div className="mt-3 sm:mt-4">
                  <span className="text-3xl sm:text-4xl font-bold">{plan.price}</span>
                  <span className="text-sm sm:text-base text-muted-foreground">{plan.period}</span>
                </div>
              </CardHeader>
              <CardContent className="pb-4">
                <ul className="space-y-2 sm:space-y-3">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="h-4 w-4 sm:h-5 sm:w-5 text-secondary shrink-0 mt-0.5" />
                      <span className="text-xs sm:text-sm leading-relaxed">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full min-h-[44px]" 
                  variant={plan.highlighted ? "default" : "outline"}
                  asChild
                >
                  <Link to="/contact">
                    {plan.name === "Enterprise" ? "Contact Sales" : "Subscribe Now"}
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <Card className="max-w-3xl mx-auto border-2 border-secondary">
          <CardHeader>
            <CardTitle className="text-xl sm:text-2xl">Mobile AQI Sensor Devices</CardTitle>
            <CardDescription className="text-sm sm:text-base">
              Deploy your own air quality monitoring sensors
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="text-base sm:text-lg font-semibold mb-2">Starting at ₹5,000</p>
                <ul className="space-y-1 text-xs sm:text-sm text-muted-foreground">
                  <li>• Real-time PM2.5, PM10, CO, NO₂, O₃ monitoring</li>
                  <li>• GPS-enabled mobile tracking</li>
                  <li>• Cloud data synchronization</li>
                  <li>• 1-year warranty included</li>
                </ul>
              </div>
              <Button asChild className="w-full sm:w-auto min-h-[44px] flex-shrink-0">
                <Link to="/contact">Buy Sensor</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default PricingSection;