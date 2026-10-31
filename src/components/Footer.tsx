import { Link } from "react-router-dom";
import { Wind, Instagram, Linkedin, Twitter } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-muted/50 border-t border-border py-8 sm:py-10 md:py-12">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 mb-6 sm:mb-8">
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center gap-2">
              <Wind className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              <span className="text-base sm:text-lg font-bold">Urban Breeze</span>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground">
              AI-powered air quality monitoring for healthier urban living.
            </p>
            <div className="flex items-center gap-3">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" 
                 className="hover:text-primary transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer"
                 className="hover:text-primary transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"
                 className="hover:text-primary transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Quick Links</h3>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li><Link to="/" className="text-muted-foreground hover:text-primary transition-colors">Home</Link></li>
              <li><Link to="/dashboard" className="text-muted-foreground hover:text-primary transition-colors">Dashboard</Link></li>
              <li><Link to="/contact" className="text-muted-foreground hover:text-primary transition-colors">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Features</h3>
            <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground">
              <li>Real-Time Monitoring</li>
              <li>AI Forecasting</li>
              <li>Health Insights</li>
              <li>Smart Alerts</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Contact</h3>
            <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground">
              <li>Chennai, Tamil Nadu</li>
              <li>India</li>
              <li>contact@urbanbreeze.ai</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border pt-6 sm:pt-8 text-center">
          <p className="text-xs sm:text-sm text-muted-foreground mb-2">
            © 2025 Urban Breeze. All Rights Reserved.
          </p>
          <p className="text-xs sm:text-sm italic text-muted-foreground">
            "Cleaner air begins with smarter insights."
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;