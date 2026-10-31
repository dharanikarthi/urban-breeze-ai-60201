import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Moon, Sun, LogOut } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const UserProfileHeader = () => {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const profile = JSON.parse(localStorage.getItem("healthProfile") || "{}");

  const getInitials = (name: string) =>
    name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

  const handleLogout = () => {
    logout();
    navigate("/auth");
  };

  return (
    <div className="flex items-center justify-between p-3 sm:p-4 rounded-xl bg-card border">
      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
        <Avatar className="h-9 w-9 sm:h-11 sm:w-11 flex-shrink-0">
          <AvatarFallback className="bg-primary text-primary-foreground text-xs sm:text-sm font-bold">
            {profile.name ? getInitials(profile.name) : "UB"}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <h2 className="text-sm sm:text-base font-semibold truncate leading-tight">
            {user?.name || profile.name || "User"}
          </h2>
          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
            <span className="text-[11px] sm:text-xs text-muted-foreground">
              {profile.age && `${profile.age}y`}
              {profile.age && profile.gender && " · "}
              {profile.gender && profile.gender.charAt(0).toUpperCase() + profile.gender.slice(1)}
            </span>
            {profile.conditions && profile.conditions.length > 0 && (
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">
                {profile.conditions[0]}
              </Badge>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <Button variant="outline" size="icon" onClick={toggleTheme}
          className="rounded-full h-8 w-8 sm:h-9 sm:w-9">
          {theme === "dark"
            ? <Sun className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            : <Moon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
        </Button>
        <Button variant="ghost" size="icon" onClick={handleLogout}
          className="rounded-full h-8 w-8 sm:h-9 sm:w-9 text-muted-foreground hover:text-destructive"
          title="Sign out">
          <LogOut className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </Button>
      </div>
    </div>
  );
};

export default UserProfileHeader;
