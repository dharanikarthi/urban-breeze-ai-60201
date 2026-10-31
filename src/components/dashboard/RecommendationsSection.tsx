/**
 * RecommendationsSection
 *
 * Daily health tasks that adapt to the current live AQI from IoTContext.
 * Tasks are personalised based on how clean/polluted the air is right now.
 */
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Award, Sparkles, Wind } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useIoT } from "@/contexts/IoTContext";

interface Task {
  id: string;
  title: string;
  points: number;
  completed: boolean;
}

// Base tasks regardless of AQI
const baseTasks: Task[] = [
  { id: "1", title: "Practice deep breathing for 10 minutes",   points: 10, completed: false },
  { id: "2", title: "Drink 8 glasses of water today",           points: 10, completed: false },
  { id: "3", title: "Try Anulom Vilom Yoga (5 minutes)",        points: 15, completed: false },
];

// Extra tasks shown when AQI > 100
const highAqiTasks: Task[] = [
  { id: "4", title: "Avoid outdoor workouts — stay indoors",    points: 5,  completed: false },
  { id: "5", title: "Run air purifier on high setting",         points: 5,  completed: false },
  { id: "6", title: "Wear N95 mask before stepping outside",    points: 10, completed: false },
];

// Extra tasks shown when AQI <= 100
const goodAirTasks: Task[] = [
  { id: "4", title: "Go for a 20-minute outdoor walk",          points: 15, completed: false },
  { id: "5", title: "Open windows for fresh air ventilation",   points: 5,  completed: false },
];

const quotes = [
  "Every breath you take mindfully is a step toward better health.",
  "Clean air, clear mind, healthy life.",
  "Your lungs deserve the best care. Start today!",
  "Small daily actions lead to big health improvements.",
];

const RecommendationsSection = () => {
  const { data } = useIoT();
  const aqi = data?.aqi ?? 0;

  // Choose task set based on current AQI
  const taskSet = aqi > 100
    ? [...baseTasks, ...highAqiTasks]
    : [...baseTasks, ...goodAirTasks];

  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem("dailyTasks");
    if (saved) {
      const parsed: Task[] = JSON.parse(saved);
      // Merge saved completion state onto current task set
      return taskSet.map(t => ({
        ...t,
        completed: parsed.find(p => p.id === t.id)?.completed ?? false,
      }));
    }
    return taskSet;
  });

  const [totalPoints, setTotalPoints] = useState(() => {
    const saved = localStorage.getItem("totalPoints");
    return saved ? parseInt(saved) : 0;
  });

  // Re-evaluate task list if AQI bucket changes
  const aqiBucket = aqi > 100 ? "high" : "low";
  useEffect(() => {
    setTasks(prev =>
      taskSet.map(t => ({
        ...t,
        completed: prev.find(p => p.id === t.id)?.completed ?? false,
      }))
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aqiBucket]);

  useEffect(() => {
    localStorage.setItem("dailyTasks",   JSON.stringify(tasks));
    localStorage.setItem("totalPoints",  totalPoints.toString());
  }, [tasks, totalPoints]);

  const completedTasks = tasks.filter(t => t.completed).length;
  const progress       = (completedTasks / tasks.length) * 100;
  const todayPoints    = tasks.filter(t => t.completed).reduce((s, t) => s + t.points, 0);

  const handleTaskToggle = (taskId: string) => {
    setTasks(prev => prev.map(task => {
      if (task.id === taskId && !task.completed) {
        setTotalPoints(pts => pts + task.points);
        toast({ title: "Task Completed! 🎉", description: `You earned ${task.points} points!` });
        return { ...task, completed: true };
      }
      return task;
    }));
  };

  const badge =
    totalPoints >= 100 ? { label: "Expert",       color: "hsl(var(--aqi-good))" } :
    totalPoints >= 50  ? { label: "Intermediate",  color: "hsl(var(--primary))" } :
                         { label: "Beginner",       color: "hsl(var(--muted-foreground))" };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="text-xl">Daily Health Tasks</CardTitle>
          <div className="flex items-center gap-2">
            {aqi > 100 && (
              <Badge variant="outline" className="text-xs gap-1 border-orange-400 text-orange-600">
                <Wind className="h-3 w-3" /> High-AQI mode
              </Badge>
            )}
            <Badge style={{ backgroundColor: badge.color, color: "white" }} className="flex items-center gap-1">
              <Award className="h-3 w-3" /> {badge.label}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Progress */}
        <div className="p-4 rounded-lg bg-gradient-to-r from-primary/10 to-secondary/10 border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Today's Progress</span>
            <span className="text-2xl font-bold text-primary">{todayPoints} pts</span>
          </div>
          <Progress value={progress} className="h-2 mb-2" />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{completedTasks} of {tasks.length} tasks completed</span>
            <span className="flex items-center gap-1">
              <Sparkles className="h-3 w-3" /> Total: {totalPoints} pts
            </span>
          </div>
        </div>

        {/* Task list */}
        <div className="space-y-3">
          {tasks.map(task => (
            <div
              key={task.id}
              className={`flex items-start gap-3 p-3 rounded-lg border transition-all hover:bg-muted/50 ${
                task.completed ? "bg-muted/30" : "bg-card"
              }`}
            >
              <Checkbox
                id={task.id}
                checked={task.completed}
                onCheckedChange={() => handleTaskToggle(task.id)}
                className="mt-1"
              />
              <label
                htmlFor={task.id}
                className={`flex-1 text-sm cursor-pointer ${task.completed ? "line-through text-muted-foreground" : ""}`}
              >
                {task.title}
              </label>
              <Badge variant="outline" className="text-xs flex-shrink-0">+{task.points}</Badge>
            </div>
          ))}
        </div>

        {/* Motivational quote */}
        <div className="p-4 rounded-lg bg-muted/50 border-l-4 border-primary">
          <p className="text-sm italic text-muted-foreground">
            "{quotes[Math.floor(Math.random() * quotes.length)]}"
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default RecommendationsSection;
