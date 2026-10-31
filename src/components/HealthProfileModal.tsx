import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { getHealthProfile, saveHealthProfile } from "@/services/authService";

interface HealthProfile {
  name: string;
  age: string;
  gender: string;
  location: string;
  conditions: string[];
  activityLevel: string;
  alertType: string;
}

const tamilNaduLocations = [
  "Velachery", "Tambaram", "Anna Nagar", "T. Nagar", "Adyar",
  "Mylapore", "Guindy", "Porur", "Chromepet", "Pallavaram",
  "Sholinganallur", "OMR", "Perungudi", "Koyambedu", "Ambattur",
  "Coimbatore", "Madurai", "Trichy", "Salem", "Tirunelveli"
];

const conditions = ["Asthma", "Allergies", "COPD", "Heart issues", "None"];

const HealthProfileModal = () => {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const [profile, setProfile] = useState<HealthProfile>({
    name: "", age: "", gender: "", location: "",
    conditions: [], activityLevel: "", alertType: ""
  });

  useEffect(() => {
    if (!user) return;
    // Pre-fill name from account
    setProfile(prev => ({ ...prev, name: user.name }));
    // Show quiz only if this user hasn't completed it yet
    const existing = getHealthProfile(user.id);
    if (!existing) setOpen(true);
  }, [user]);

  const handleConditionToggle = (condition: string) => {
    setProfile(prev => ({
      ...prev,
      conditions: prev.conditions.includes(condition)
        ? prev.conditions.filter(c => c !== condition)
        : [...prev.conditions, condition]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile.name || !profile.age || !profile.gender || !profile.location ||
        !profile.activityLevel || !profile.alertType || profile.conditions.length === 0) {
      toast({ title: "Incomplete Profile", description: "Please fill in all fields.", variant: "destructive" });
      return;
    }
    const profileToSave = { ...profile, healthCondition: profile.conditions.join(", ") };
    // Save per-user and also to legacy key for dashboard compatibility
    saveHealthProfile(user!.id, profileToSave);
    localStorage.setItem("healthProfile", JSON.stringify(profileToSave));
    setOpen(false);
    toast({ title: "Profile Saved! 🎉", description: "Your personalized dashboard is ready." });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        className="max-w-2xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl">
            Welcome, {user?.name}! 👋
          </DialogTitle>
          <DialogDescription className="text-sm sm:text-base">
            Let's personalize your experience. Answer a few quick questions for customized air quality insights.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Name *</Label>
              <Input id="name" placeholder="Your name" value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })} className="h-11" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="age">Age *</Label>
              <Input id="age" type="number" placeholder="Your age" value={profile.age}
                onChange={(e) => setProfile({ ...profile, age: e.target.value })} className="h-11" />
            </div>
            <div className="space-y-1.5">
              <Label>Gender *</Label>
              <Select value={profile.gender} onValueChange={(v) => setProfile({ ...profile, gender: v })}>
                <SelectTrigger className="h-11"><SelectValue placeholder="Select gender" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Location *</Label>
              <Select value={profile.location} onValueChange={(v) => setProfile({ ...profile, location: v })}>
                <SelectTrigger className="h-11"><SelectValue placeholder="Select location" /></SelectTrigger>
                <SelectContent>
                  {tamilNaduLocations.map(loc => (
                    <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Health Conditions *</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {conditions.map(condition => (
                <div
                  key={condition}
                  className="flex items-center gap-2 min-h-[44px] p-2 rounded-lg border hover:bg-muted/50 cursor-pointer select-none"
                  onClick={() => handleConditionToggle(condition)}
                >
                  <Checkbox
                    id={condition}
                    checked={profile.conditions.includes(condition)}
                    className="h-5 w-5 pointer-events-none"
                  />
                  <span className="text-sm flex-1">{condition}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Activity Level *</Label>
            <Select value={profile.activityLevel} onValueChange={(v) => setProfile({ ...profile, activityLevel: v })}>
              <SelectTrigger className="h-11"><SelectValue placeholder="Select activity level" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low — mostly indoors</SelectItem>
                <SelectItem value="moderate">Moderate — some outdoor activity</SelectItem>
                <SelectItem value="active">Active — regular outdoor exercise</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Preferred Alert Type *</Label>
            <Select value={profile.alertType} onValueChange={(v) => setProfile({ ...profile, alertType: v })}>
              <SelectTrigger className="h-11"><SelectValue placeholder="Select alert type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="sms">SMS</SelectItem>
                <SelectItem value="inapp">In-App Notification</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" className="w-full h-12 text-base font-semibold">
            Complete Profile & Go to Dashboard →
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default HealthProfileModal;