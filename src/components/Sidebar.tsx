import { Home, LayoutDashboard, Lightbulb, User, Settings } from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useIoT } from "@/contexts/IoTContext";

const navigation = [
  { name: "Home",      href: "/",          icon: Home },
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Insights",  href: "/insights",  icon: Lightbulb },
  { name: "Profile",   href: "/profile",   icon: User },
  { name: "Settings",  href: "/settings",  icon: Settings },
];

/** Tiny coloured dot reflecting hardware connection state */
const HardwareDot = ({ className = "" }: { className?: string }) => {
  const { status, hardwareOnline } = useIoT();

  if (status === "idle" || status === "loading") {
    return <span className={cn("h-2 w-2 rounded-full bg-yellow-400 animate-pulse", className)} title="Connecting…" />;
  }
  if (status === "error") {
    return <span className={cn("h-2 w-2 rounded-full bg-red-500", className)} title="Sensor error" />;
  }
  if (status === "stale" || !hardwareOnline) {
    return <span className={cn("h-2 w-2 rounded-full bg-amber-400", className)} title="Hardware offline" />;
  }
  // Online & fresh
  return (
    <span className={cn("relative flex h-2 w-2", className)} title="Hardware online">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
    </span>
  );
};

const Sidebar = () => {
  const { status, hardwareOnline, data } = useIoT();

  const statusLabel =
    status === "idle" || status === "loading" ? "Connecting…" :
    status === "error" ? "Sensor error" :
    (status === "stale" || !hardwareOnline) ? "HW offline" :
    `AQI ${data?.aqi ?? "—"}`;

  const statusColor =
    status === "ok" && hardwareOnline
      ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300"
      : status === "error"
      ? "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400"
      : "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300";

  return (
    <>
      {/* ── Desktop sidebar ── */}
      <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:border-r lg:bg-card/50 lg:backdrop-blur-sm z-40">
        <div className="flex flex-col flex-grow pt-6 overflow-y-auto">
          <div className="flex flex-col px-6 mb-6">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Urban Breeze
            </h1>
            {/* Hardware status strip */}
            <div className={cn("mt-2 flex items-center gap-2 text-xs px-2 py-1.5 rounded-md", statusColor)}>
              <HardwareDot className="flex-shrink-0" />
              <span className="truncate font-medium">{statusLabel}</span>
            </div>
          </div>

          <nav className="flex-1 px-3 space-y-1">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  cn(
                    "flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )
                }
              >
                <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                {item.name}
                {/* Live dot next to Dashboard */}
                {item.href === "/dashboard" && (
                  <span className="ml-auto">
                    <HardwareDot />
                  </span>
                )}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>

      {/* ── Mobile bottom navigation bar ── */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-t border-border"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        <div className="flex items-center justify-around h-16">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground"
                )
              }
            >
              {({ isActive }) => (
                <>
                  <div className={cn("p-1.5 rounded-xl transition-all relative", isActive ? "bg-primary/15 scale-110" : "")}>
                    <item.icon className="h-5 w-5" />
                    {item.href === "/dashboard" && (
                      <span className="absolute -top-0.5 -right-0.5">
                        <HardwareDot />
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] font-medium leading-none">{item.name}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </>
  );
};

export default Sidebar;
