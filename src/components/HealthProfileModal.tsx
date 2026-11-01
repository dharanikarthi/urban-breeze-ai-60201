/**
 * HealthProfileModal — simplified one-time setup.
 * Shows once per user, never again after submit.
 *
 * Fields: Name (pre-filled) + Health Conditions (optional)
 * Location auto-detected via GPS.
 */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { getHealthProfile, saveHealthProfile } from "@/services/authService";
import { getCurrentPosition, getNearestLocation } from "@/services/geoLocationService";
import { MapPin, Loader2, LocateFixed, Check } from "lucide-react";

const CONDITIONS = ["Asthma", "Allergies", "COPD", "Heart issues", "None"];

const HealthProfileModal = () => {
  const [open, setOpen]             = useState(false);
  const [name, setName]             = useState("");
  const [conditions, setConditions] = useState<string[]>([]);
  const [location, setLocation]     = useState("");
  const [geoState, setGeoState]     = useState<"idle" | "detecting" | "done" | "denied">("idle");
  const [saving, setSaving]         = useState(false);

  const { toast }  = useToast();
  const { user }   = useAuth();
  const navigate   = useNavigate();

  const detectLocation = async () => {
    setGeoState("detecting");
    try {
      const pos     = await getCurrentPosition();
      const nearest = getNearestLocation(pos.coords.latitude, pos.coords.longitude);
      setLocation(nearest);
      setGeoState("done");
    } catch {
      setGeoState("denied");
      setLocation("Velachery");
    }
  };

  useEffect(() => {
    if (!user) return;
    setName(user.name);
    const existing = getHealthProfile(user.id);
    if (!existing) {
      setOpen(true);
      detectLocation();
    }
  }, [user]);

  const toggleCondition = (c: string) => {
    if (c === "None") {
      setConditions(prev => prev.includes("None") ? [] : ["None"]);
      return;
    }
    setConditions(prev =>
      prev.includes(c)
        ? prev.filter(x => x !== c)
        : [...prev.filter(x => x !== "None"), c]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast({ title: "Name required", description: "Please enter your name.", variant: "destructive" });
      return;
    }
    setSaving(true);
    const profile = {
      name:           name.trim(),
      age:            "",
      gender:         "",
      location:       location || "Velachery",
      conditions,
      healthCondition: conditions.filter(c => c !== "None").join(", "),
      activityLevel:  "moderate",
      alertType:      "inapp",
    };
    saveHealthProfile(user!.id, profile);
    localStorage.setItem("healthProfile", JSON.stringify(profile));
    setOpen(false);
    setSaving(false);
    toast({ title: "All set! 🎉", description: "Taking you to the dashboard." });
    navigate("/dashboard");
  };

  return (
    <Dialog open={open} onOpenChange={() => { /* block close */ }}>
      <DialogContent
        className="max-w-md w-[95vw] sm:w-full"
        onInteractOutside={e => e.preventDefault()}
        onEscapeKeyDown={e => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Welcome, {user?.name?.split(" ")[0] || "there"}! 👋
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Quick setup — takes 10 seconds.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-2">

          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="modal-name">Your name</Label>
            <Input
              id="modal-name"
              placeholder="Name"
              value={name}
              onChange={e => setName(e.target.value)}
              className="h-11"
              autoFocus
            />
          </div>

          {/* Location — auto-detected */}
          <div className="space-y-1.5">
            <Label className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-primary" /> Your location
            </Label>
            <div className="flex items-center gap-2 h-11 px-3 rounded-lg border bg-muted/30 text-sm">
              {geoState === "detecting" ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground flex-shrink-0" />
                  <span className="text-muted-foreground">Detecting…</span>
                </>
              ) : (
                <>
                  <span className="flex-1 font-medium">{location || "—"}</span>
                  {geoState === "done" && (
                    <span className="text-xs text-green-600 flex items-center gap-1">
                      <LocateFixed className="h-3 w-3" /> GPS
                    </span>
                  )}
                  {geoState === "denied" && (
                    <span className="text-xs text-muted-foreground">Default</span>
                  )}
                </>
              )}
            </div>
            {geoState === "denied" && (
              <p className="text-xs text-muted-foreground">
                Location access denied — using Velachery as default. Change anytime in Settings.
              </p>
            )}
          </div>

          {/* Health conditions — plain div checkboxes, no Radix Checkbox */}
          <div className="space-y-2">
            <Label>
              Any health conditions?{" "}
              <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>
            <div className="grid grid-cols-2 gap-2">
              {CONDITIONS.map(c => {
                const selected = conditions.includes(c);
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => toggleCondition(c)}
                    className={`flex items-center gap-2.5 p-2.5 rounded-lg border text-sm text-left transition-all
                      ${selected
                        ? "border-primary bg-primary/10 font-semibold text-primary"
                        : "border-border bg-card hover:bg-muted/50 text-foreground"
                      }`}
                  >
                    {/* Custom tick box */}
                    <span className={`h-4 w-4 rounded flex-shrink-0 border flex items-center justify-center transition-colors
                      ${selected ? "bg-primary border-primary" : "border-muted-foreground"}`}
                    >
                      {selected && <Check className="h-3 w-3 text-primary-foreground" strokeWidth={3} />}
                    </span>
                    {c}
                  </button>
                );
              })}
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-11 text-base font-semibold"
            disabled={saving}
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Go to Dashboard →
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default HealthProfileModal;
