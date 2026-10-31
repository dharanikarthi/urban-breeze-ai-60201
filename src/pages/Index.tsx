import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import PricingSection from "@/components/PricingSection";
import SmartCitySection from "@/components/SmartCitySection";
import Footer from "@/components/Footer";
import HealthProfileModal from "@/components/HealthProfileModal";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <HealthProfileModal />
      <Navigation />
      <HeroSection />
      <FeaturesSection />
      <PricingSection />
      <SmartCitySection />
      <Footer />
    </div>
  );
};

export default Index;