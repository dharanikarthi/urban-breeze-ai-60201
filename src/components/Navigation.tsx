import { Link, useLocation } from "react-router-dom";
import { Wind } from "lucide-react";
import { Button } from "@/components/ui/button";

const Navigation = () => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <Wind className="h-6 w-6 sm:h-7 sm:w-7 text-primary transition-transform group-hover:scale-110" />
            <span className="text-base sm:text-lg font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Urban Breeze
            </span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/" className={`text-sm font-medium transition-colors hover:text-primary ${isActive("/") ? "text-primary" : "text-foreground/70"}`}>Home</Link>
            <Link to="/dashboard" className={`text-sm font-medium transition-colors hover:text-primary ${isActive("/dashboard") ? "text-primary" : "text-foreground/70"}`}>Dashboard</Link>
            <Link to="/contact" className={`text-sm font-medium transition-colors hover:text-primary ${isActive("/contact") ? "text-primary" : "text-foreground/70"}`}>Contact</Link>
          </div>

          {/* Desktop CTA buttons */}
          <div className="hidden md:flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link to="/dashboard">View Dashboard</Link>
            </Button>
            <Button size="sm" asChild>
              <Link to="/contact">Get Started</Link>
            </Button>
          </div>

          {/* Mobile: single CTA button only — no hamburger */}
          <Button size="sm" asChild className="md:hidden min-h-[36px] px-3 text-xs">
            <Link to="/dashboard">Dashboard →</Link>
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;