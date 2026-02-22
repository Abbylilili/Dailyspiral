import { useState, useEffect } from "react";
import { Plus, Trash2, CheckSquare, ChevronLeft, ChevronRight, Edit2, Settings, Calendar as CalendarIcon, Pencil } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "../components/ui/dialog";
import { getHabits, saveHabit, deleteHabit, Habit, getHabitEntries, toggleHabitEntry, isHabitCompleted } from "../lib/storage";
import { format, eachDayOfInterval, startOfWeek, endOfWeek, subWeeks, isSameDay, subDays, addWeeks, subYears, addYears, startOfMonth, addMonths, subMonths } from "date-fns";
import { toast } from "sonner";
import { useLanguage } from "../contexts/LanguageContext";
import { useTheme } from "../contexts/ThemeContext";
import { HabitCircularView } from "../components/HabitCircularView";
import { HabitYearView } from "../components/HabitYearView";
import { cn } from "../components/ui/utils";
import { useLocation } from "react-router";
import { Popover, PopoverContent, PopoverTrigger } from "../components/ui/popover";
import { Calendar } from "../components/ui/calendar";

const COLORS = [
  "#FF9500", // iOS Orange
  "#34C759", // iOS Green
  "#5856D6", // iOS Indigo
  "#007AFF", // iOS Blue
  "#FF2D55", // iOS Pink
  "#AF52DE", // iOS Purple
  "#FF3B30", // iOS Red
  "#5AC8FA", // iOS Teal
  "#FFCC00", // iOS Yellow
  "#8E8E93"  // iOS Gray
];

type ViewMode = "week" | "month" | "year";

export function Habits() {
  const { t } = useLanguage();
  const { theme } = useTheme();
  const location = useLocation();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isManageOpen, setIsManageOpen] = useState(false);
  const [habitName, setHabitName] = useState("");
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  
  // Unified date state
  const [selectedDate, setSelectedDate] = useState(new Date());

  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);

  // Theme Helpers
  const getCardClass = () => {
     switch(theme) {
         case 'ocean': return "bg-slate-800/50 border-0 text-white backdrop-blur-xl shadow-xl";
         case 'ink': return "bg-white border-2 border-black text-black shadow-[6px_6px_0px_0px_black] rounded-xl";
         case 'zen': return "bg-white border-0 shadow-xl shadow-emerald-50/50 rounded-3xl";
         default: return "glass-card border-0 rounded-3xl";
     }
  };

  const getButtonClass = () => {
      switch(theme) {
          case 'ocean': return "bg-cyan-500 text-slate-900 hover:bg-cyan-400";
          case 'ink': return "bg-black text-white hover:bg-gray-800 border-2 border-transparent hover:border-black rounded-lg";
          default: return "bg-black text-white hover:bg-gray-800 shadow-lg";
      }
  };
  
  const getDialogClass = () => {
      switch(theme) {
          case 'ocean': return "bg-slate-800 border border-white/10 text-white shadow-2xl";
          case 'ink': return "bg-white border-2 border-black text-black shadow-[8px_8px_0px_0px_black] rounded-xl";
          default: return "bg-white/90 backdrop-blur-2xl border-0 shadow-2xl sm:rounded-3xl";
      }
  };

  useEffect(() => {
    loadHabits();
    
    // Check for view mode in URL params
    const searchParams = new URLSearchParams(location.search);
    const view = searchParams.get('view');
    if (view && (view === 'week' || view === 'month' || view === 'year')) {
      setViewMode(view as ViewMode);
    } else if (view === 'day') {
       setViewMode('week');
    }
  }, [location.search]);
  
  const loadHabits = () => {
    const data = getHabits();
    setHabits(data);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!habitName.trim()) {
      toast.error(t("habits.enterName"));
      return;
    }
    
    if (editingHabit) {
        // Edit existing habit
        const updatedHabit: Habit = {
            ...editingHabit,
            name: habitName.trim(),
            color: selectedColor,
        };
        saveHabit(updatedHabit);
        setEditingHabit(null);
        toast.success(t("habits.updated") || "Habit updated");
    } else {
        // Create new habit
        const habit: Habit = {
          id: `habit-${Date.now()}`,
          name: habitName.trim(),
          color: selectedColor,
          createdAt: new Date().toISOString(),
        };
        saveHabit(habit);
        toast.success(t("habits.added"));
    }
    
    loadHabits();
    setIsDialogOpen(false);
    setHabitName("");
    setSelectedColor(COLORS[0]);
  };
  
  const handleDelete = (id: string) => {
    deleteHabit(id);
    loadHabits();
    toast.success(t("habits.deleted"));
  };

  const openEditDialog = (habit: Habit) => {
      setEditingHabit(habit);
      setHabitName(habit.name);
      setSelectedColor(habit.color);
      setIsManageOpen(false); // Close manage dialog
      setIsDialogOpen(true); // Open add/edit dialog
  };
  
  const handleToggle = (habitId: string, date: string) => {
    // Prevent toggling future dates
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    if (date > todayStr) {
        toast.error(t("habits.cannotMarkFuture") || "Cannot mark future habits");
        return;
    }

    toggleHabitEntry(habitId, date);
    // Force re-render
    loadHabits();
  };
  
  // Calculate statistics
  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });
  
  const entries = getHabitEntries();
  const totalPossible = habits.length * weekDays.length;
  const totalCompleted = entries.filter(e => {
    const date = new Date(e.date);
    return date >= weekStart && date <= weekEnd && e.completed;
  }).length;
  
  const completionRate = totalPossible > 0 ? (totalCompleted / totalPossible) * 100 : 0;
  
  // Current Streak Calculation (Consecutive days ending today or yesterday)
  const calculateStreak = (habitId: string) => {
    const habitEntries = entries
      .filter(e => e.habitId === habitId && e.completed)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    if (habitEntries.length === 0) return 0;
    
    // Check if the most recent entry is today or yesterday
    const lastEntryDate = new Date(habitEntries[0].date);
    const todayDate = new Date();
    const yesterdayDate = subDays(todayDate, 1);
    
    // Normalize to YYYY-MM-DD for comparison
    const lastEntryStr = format(lastEntryDate, 'yyyy-MM-dd');
    const todayStr = format(todayDate, 'yyyy-MM-dd');
    const yesterdayStr = format(yesterdayDate, 'yyyy-MM-dd');

    if (lastEntryStr !== todayStr && lastEntryStr !== yesterdayStr) {
        return 0;
    }

    let streak = 1;
    let currentDate = lastEntryDate;
    
    for (let i = 1; i < habitEntries.length; i++) {
      const prevDate = new Date(habitEntries[i].date);
      const diffDays = Math.round((currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        streak++;
        currentDate = prevDate;
      } else {
        break;
      }
    }
    
    return streak;
  };
  
  const bestStreak = habits.length > 0 
    ? Math.max(...habits.map(h => calculateStreak(h.id))) 
    : 0;

  // Navigation handlers
  const handlePrev = () => {
    if (viewMode === 'week') setSelectedDate(d => subWeeks(d, 1));
    if (viewMode === 'month') setSelectedDate(d => subMonths(d, 1));
    if (viewMode === 'year') setSelectedDate(d => subYears(d, 1));
  };

  const handleNext = () => {
    if (viewMode === 'week') setSelectedDate(d => addWeeks(d, 1));
    if (viewMode === 'month') setSelectedDate(d => addMonths(d, 1));
    if (viewMode === 'year') setSelectedDate(d => addYears(d, 1));
  };

  // Generate days for Week View
  const currentWeekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const currentWeekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 });
  const currentWeekDays = eachDayOfInterval({
    start: currentWeekStart,
    end: currentWeekEnd
  });
  
  const getHeaderLabel = () => {
    if (viewMode === 'week') {
        if (isSameDay(currentWeekStart, startOfWeek(new Date(), { weekStartsOn: 1 }))) {
            return "This Week";
        }
        return `${format(currentWeekStart, 'MMM d')} - ${format(currentWeekEnd, 'MMM d, yyyy')}`;
    }
    if (viewMode === 'month') return format(selectedDate, 'd, MMMM yyyy');
    if (viewMode === 'year') return format(selectedDate, 'yyyy');
    return "";
  };
  
  return (
    <div className="space-y-8 max-w-6xl mx-auto p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className={cn("text-4xl font-bold bg-clip-text text-transparent",
            theme === 'ocean' ? "bg-gradient-to-r from-cyan-400 to-blue-500" :
            theme === 'ink' ? "text-black font-['Rubik_Dirt'] tracking-wider" :
            theme === 'zen' ? "bg-gradient-to-r from-emerald-600 to-teal-600" :
            "bg-gradient-to-r from-purple-600 to-pink-600"
        )}>
          {t("habits.title")}
        </h2>
        
        <div className="flex gap-3">
             {/* Edit / Manage Button */}
            <Dialog open={isManageOpen} onOpenChange={setIsManageOpen}>
                <DialogTrigger asChild>
                    <Button variant="outline" className={cn("rounded-full h-12 w-12 p-0 border-0 shadow-sm transition-all",
                         theme === 'ocean' ? "bg-slate-800 text-white hover:bg-slate-700" :
                         theme === 'ink' ? "bg-white border-2 border-black hover:bg-gray-100 rounded-lg text-black" :
                         "bg-white/50 hover:bg-white"
                    )}>
                        <Pencil className={cn("w-5 h-5", theme === 'ocean' ? "text-slate-300" : "text-gray-600")} />
                    </Button>
                </DialogTrigger>
                <DialogContent className={cn("max-w-md", getDialogClass())}>
                    <DialogHeader>
                        <DialogTitle className={cn(theme === 'ocean' && "text-white")}>{t("habits.manageHabits") || "Manage Habits"}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3 mt-4">
                        {habits.map(habit => (
                            <div key={habit.id} className={cn("flex items-center justify-between p-3 rounded-xl", 
                                theme === 'ocean' ? "bg-slate-700/50" : 
                                theme === 'ink' ? "border border-black bg-white" :
                                "bg-white/40"
                            )}>
                                <div className="flex items-center gap-3">
                                    <div className={cn("w-4 h-4 rounded-full", theme === 'ink' && "border border-black")} style={{ backgroundColor: habit.color }} />
                                    <span className={cn("font-medium", theme === 'ocean' && "text-white")}>{habit.name}</span>
                                </div>
                                <div className="flex gap-2">
                                    <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-black/5 rounded-full" onClick={() => openEditDialog(habit)}>
                                        <Edit2 className={cn("w-4 h-4", theme === 'ocean' ? "text-slate-400" : "text-gray-600")} />
                                    </Button>
                                    <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-red-50 hover:text-red-500 rounded-full" onClick={() => handleDelete(habit.id)}>
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                        {habits.length === 0 && (
                            <p className={cn("text-center py-4", theme === 'ocean' ? "text-slate-500" : "text-muted-foreground")}>{t("habits.noHabits")}</p>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={isDialogOpen} onOpenChange={(open) => {
                setIsDialogOpen(open);
                if (!open) {
                    setEditingHabit(null);
                    setHabitName("");
                    setSelectedColor(COLORS[0]);
                }
            }}>
            <DialogTrigger asChild>
                <Button className={cn("rounded-full h-12 px-6 shadow-lg transition-all hover:scale-105 active:scale-95", getButtonClass())}>
                <Plus className="w-5 h-5 mr-2" />
                {editingHabit ? t("habits.updateHabit") || "Update" : t("habits.addHabit")}
                </Button>
            </DialogTrigger>
            <DialogContent className={cn(getDialogClass())}>
                <DialogHeader>
                <DialogTitle className={cn("text-2xl", theme === 'ocean' && "text-white")}>{editingHabit ? t("habits.editHabit") || "Edit Habit" : t("habits.addNewHabit")}</DialogTitle>
                <DialogDescription className={cn(theme === 'ocean' && "text-slate-400")}>{t("habits.enterColorDesc")}</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-6 mt-4">
                <div className="space-y-2">
                    <Label className={cn("text-base", theme === 'ocean' && "text-slate-300")}>{t("habits.habitName")}</Label>
                    <Input
                    className={cn("h-12 rounded-xl focus-visible:ring-2 transition-all",
                        theme === 'ocean' ? "bg-slate-700/50 border-0 text-white focus-visible:ring-cyan-500/50 placeholder:text-slate-500" :
                        theme === 'ink' ? "bg-white border-2 border-black text-black rounded-lg" :
                        "bg-white/50 border-0 focus-visible:ring-primary/20"
                    )}
                    placeholder={t("habits.placeholder")}
                    value={habitName}
                    onChange={(e) => setHabitName(e.target.value)}
                    required
                    />
                </div>
                
                <div className="space-y-3">
                    <Label className={cn("text-base", theme === 'ocean' && "text-slate-300")}>{t("habits.selectColor")}</Label>
                    <div className="flex gap-3 flex-wrap">
                    {COLORS.map(color => (
                        <button
                        key={color}
                        type="button"
                        onClick={() => setSelectedColor(color)}
                        className={`w-10 h-10 rounded-full transition-all shadow-sm hover:scale-110 active:scale-95 ${
                            selectedColor === color ? 'ring-2 ring-offset-2 ring-primary scale-110 shadow-md' : ''
                        }`}
                        style={{ backgroundColor: color, border: theme === 'ink' ? '2px solid black' : 'none' }}
                        />
                    ))}
                    </div>
                </div>
                
                <Button type="submit" className={cn("w-full h-12 rounded-xl text-lg font-semibold shadow-md", getButtonClass())}>
                    {t("habits.save")}
                </Button>
                </form>
            </DialogContent>
            </Dialog>
        </div>
      </div>
      
      {/* Statistics */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className={cn("overflow-hidden hover:shadow-lg transition-all duration-300", getCardClass())}>
          <CardContent className="pt-8 pb-8 px-6 flex flex-col items-center justify-center text-center">
            <p className={cn("text-sm mb-2 font-semibold uppercase tracking-wider", theme === 'ocean' ? "text-slate-400" : "text-muted-foreground")}>{t("habits.weeklyCompletion")}</p>
            <div className="flex items-end gap-1">
              <p className={cn("text-5xl font-bold tracking-tighter", theme === 'ocean' ? "text-white" : "text-foreground")}>{completionRate.toFixed(0)}</p>
              <p className={cn("text-2xl font-medium mb-1", theme === 'ocean' ? "text-slate-500" : "text-muted-foreground")}>%</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className={cn("overflow-hidden hover:shadow-lg transition-all duration-300", getCardClass())}>
          <CardContent className="pt-8 pb-8 px-6 flex flex-col items-center justify-center text-center">
            <p className={cn("text-sm mb-2 font-semibold uppercase tracking-wider", theme === 'ocean' ? "text-slate-400" : "text-muted-foreground")}>{t("habits.habitCount")}</p>
            <p className={cn("text-5xl font-bold tracking-tighter", theme === 'ocean' ? "text-white" : "text-foreground")}>{habits.length}</p>
          </CardContent>
        </Card>
        
        <Card className={cn("overflow-hidden hover:shadow-lg transition-all duration-300", getCardClass())}>
          <CardContent className="pt-8 pb-8 px-6 flex flex-col items-center justify-center text-center">
            <p className={cn("text-sm mb-2 font-semibold uppercase tracking-wider", theme === 'ocean' ? "text-slate-400" : "text-muted-foreground")}>{t("habits.longestStreak")}</p>
            <div className="flex items-end gap-1">
              <p className={cn("text-5xl font-bold tracking-tighter", theme === 'ocean' ? "text-white" : "text-foreground")}>{bestStreak}</p>
              <p className={cn("text-xl font-medium mb-1", theme === 'ocean' ? "text-slate-500" : "text-muted-foreground")}>{t("habits.days")}</p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* View Mode Selector */}
      {habits.length > 0 && (
        <Card className={cn("shadow-xl", getCardClass(), theme === 'pastel' && "backdrop-blur-2xl rounded-[2rem]")}>
          <CardHeader className="pb-0 pt-6 px-8 relative z-20">
            <CardTitle className={cn("text-2xl font-bold tracking-tight mb-4", theme === 'ocean' && "text-white")}>{t("habits.tracker")}</CardTitle>
            
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 relative min-h-[40px]">
              
              {/* Date Navigation & Picker - Absolute Centered for Desktop */}
              <div className="flex items-center justify-center gap-2 md:absolute md:left-1/2 md:-translate-x-1/2 w-full md:w-auto z-20">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={handlePrev}
                    className={cn("rounded-full w-8 h-8", 
                        theme === 'ocean' ? "hover:bg-slate-700 text-slate-300" : 
                        "hover:bg-black/5"
                    )}
                >
                    <ChevronLeft className="w-5 h-5" />
                </Button>
                
                <Popover>
                    <PopoverTrigger asChild>
                        <Button 
                            variant="ghost" 
                            className={cn("text-lg font-bold min-w-[140px] text-center tracking-tight transition-all px-2 h-auto py-1.5 rounded-xl",
                                theme === 'ocean' ? "text-white hover:bg-slate-700 hover:text-cyan-400" :
                                "hover:bg-black/5 hover:text-primary"
                            )}
                        >
                            <CalendarIcon className="w-4 h-4 mr-2 opacity-50" />
                            {getHeaderLabel()}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className={cn("w-auto p-0 border-0 shadow-2xl", 
                        theme === 'ocean' ? "bg-slate-800 text-white rounded-xl" :
                        "bg-white/90 backdrop-blur-xl rounded-2xl"
                    )} align="center">
                        <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={(date) => date && setSelectedDate(date)}
                            initialFocus
                            className={cn("p-3", theme === 'ocean' && "dark")}
                        />
                    </PopoverContent>
                </Popover>

                <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleNext}
                    className={cn("rounded-full w-8 h-8", 
                        theme === 'ocean' ? "hover:bg-slate-700 text-slate-300" : 
                        "hover:bg-black/5"
                    )}
                >
                    <ChevronRight className="w-5 h-5" />
                </Button>
              </div>

              {/* View Mode - Right aligned */}
              <div className={cn("flex gap-1 p-1 rounded-full relative z-10 ml-auto w-full md:w-auto justify-center md:justify-end",
                  theme === 'ocean' ? "bg-slate-900/50" :
                  theme === 'ink' ? "bg-gray-100 border border-black rounded-lg" :
                  "bg-muted/50"
              )}>
                {["week", "month", "year"].map((mode) => (
                  <Button
                    key={mode}
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                        e.stopPropagation();
                        setViewMode(mode as ViewMode);
                    }}
                    className={cn("px-4 sm:px-6 transition-all duration-300",
                        theme === 'ink' ? "rounded-md" : "rounded-full",
                        viewMode === mode 
                          ? (theme === 'ocean' ? "bg-cyan-600 text-white shadow-lg" : 
                             theme === 'ink' ? "bg-black text-white" :
                             "bg-white shadow-sm text-black font-semibold")
                          : (theme === 'ocean' ? "text-slate-400 hover:text-white" : 
                             "text-muted-foreground hover:bg-white/50")
                    )}
                  >
                    {mode.charAt(0).toUpperCase() + mode.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-8 pt-0">
            {viewMode === "month" && (
              <div className="animate-in fade-in zoom-in duration-500">
                <div className="md:scale-110 transform md:origin-top md:-mt-32 mb-4 relative z-0 flex justify-center">
                  <HabitCircularView
                    habits={habits}
                    year={selectedDate.getFullYear()}
                    month={selectedDate.getMonth() + 1}
                    onToggleHabit={handleToggle}
                  />
                </div>
              </div>
            )}
            
            {viewMode === "year" && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="grid grid-cols-1 gap-6 mt-2">
                  {habits.map(habit => (
                    <HabitYearView
                      key={habit.id}
                      habit={habit}
                      year={selectedDate.getFullYear()}
                    />
                  ))}
                </div>
              </div>
            )}
            
            {viewMode === "week" && (
              <div className="w-full pb-4 animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-x-auto">
                <table className="w-full border-separate border-spacing-y-2 min-w-[600px]">
                  <thead>
                    <tr>
                      <th className={cn("text-left p-2 font-semibold text-xs uppercase tracking-wider", theme === 'ocean' ? "text-slate-400" : "text-muted-foreground")}>{t("habits.habit")}</th>
                      {currentWeekDays.map(day => (
                        <th key={day.toISOString()} className="text-center p-1">
                          <div className={cn("text-[10px] font-semibold mb-1 uppercase tracking-wide", theme === 'ocean' ? "text-slate-400" : "text-muted-foreground")}>
                            {format(day, 'EEE')}
                          </div>
                          <div className={cn(`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center mx-auto`,
                             isSameDay(day, new Date())
                              ? (theme === 'ocean' ? 'bg-cyan-500 text-black shadow-[0_0_10px_rgba(6,182,212,0.5)]' : theme === 'ink' ? 'bg-black text-white' : 'bg-primary text-primary-foreground shadow-md')
                              : (theme === 'ocean' ? 'text-white' : 'text-foreground')
                          )}>
                            {format(day, 'd')}
                          </div>
                        </th>
                      ))}
                      <th className={cn("text-center p-2 font-semibold text-xs uppercase tracking-wider", theme === 'ocean' ? "text-slate-400" : "text-muted-foreground")}>{t("habits.streak")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {habits.map(habit => {
                      const streak = calculateStreak(habit.id);
                      return (
                        <tr key={habit.id} className="group transition-colors">
                          <td className={cn("p-2 rounded-l-xl backdrop-blur-sm", 
                              theme === 'ocean' ? "bg-white/5 group-hover:bg-white/10" : 
                              theme === 'ink' ? "bg-transparent border-y-2 border-l-2 border-black rounded-none" :
                              "bg-white/40 group-hover:bg-white/60"
                          )}>
                            <div className="flex items-center gap-2">
                              <div
                                className={cn("w-3 h-3 rounded-full shadow-sm shrink-0", theme === 'ink' && "border border-black")}
                                style={{ backgroundColor: habit.color }}
                              />
                              <span className={cn("font-semibold text-sm truncate max-w-[80px] sm:max-w-[120px]", theme === 'ocean' && "text-slate-200")}>{habit.name}</span>
                            </div>
                          </td>
                          {currentWeekDays.map(day => {
                            const dateStr = format(day, 'yyyy-MM-dd');
                            const completed = isHabitCompleted(habit.id, dateStr);
                            return (
                              <td key={dateStr} className={cn("text-center p-1 backdrop-blur-sm",
                                  theme === 'ocean' ? "bg-white/5 group-hover:bg-white/10" :
                                  theme === 'ink' ? "bg-transparent border-y-2 border-black" :
                                  "bg-white/40 group-hover:bg-white/60"
                              )}>
                                <button
                                  onClick={() => handleToggle(habit.id, dateStr)}
                                  className={cn(`w-8 h-8 rounded-lg transition-all duration-300 flex items-center justify-center mx-auto`,
                                    theme === 'ink' && "rounded-sm border border-black",
                                    completed
                                      ? (theme === 'ink' ? 'bg-black text-white shadow-none scale-100' : 'text-white shadow-sm scale-100')
                                      : (theme === 'ocean' ? 'bg-white/5 hover:bg-white/10' : 'bg-black/5 text-transparent hover:bg-black/10 scale-90')
                                  )}
                                  style={{
                                    backgroundColor: completed && theme !== 'ink' ? habit.color : undefined,
                                  }}
                                >
                                  {completed && <CheckSquare className="w-4 h-4" />}
                                </button>
                              </td>
                            );
                          })}
                          <td className={cn("text-center p-2 rounded-r-xl backdrop-blur-sm",
                              theme === 'ocean' ? "bg-white/5 group-hover:bg-white/10" :
                              theme === 'ink' ? "bg-transparent border-y-2 border-r-2 border-black rounded-none" :
                              "bg-white/40 group-hover:bg-white/60"
                          )}>
                            <span className={cn("font-bold text-lg", theme === 'ocean' ? "text-white" : "text-foreground")}>{streak}</span>
                            <span className="text-[10px] text-muted-foreground ml-0.5">🔥</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
      
      {/* Empty State */}
      {habits.length === 0 && (
        <Card className={cn("border-0 text-center py-20", getCardClass())}>
          <CardContent>
            <div className={cn("w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6", 
                theme === 'ocean' ? "bg-slate-800" : "bg-gray-100"
            )}>
              <CheckSquare className={cn("w-12 h-12", theme === 'ocean' ? "text-slate-600" : "text-gray-400")} />
            </div>
            <h3 className={cn("text-2xl font-bold mb-2", theme === 'ocean' && "text-white")}>{t("habits.noHabits")}</h3>
            <p className={cn("mb-8 max-w-md mx-auto", theme === 'ocean' ? "text-slate-400" : "text-muted-foreground")}>{t("habits.subtitle")}</p>
            <Button 
              onClick={() => setIsDialogOpen(true)}
              className={cn("rounded-full h-12 px-8 text-lg font-medium shadow-lg hover:shadow-xl transition-all hover:-translate-y-1", getButtonClass())}
            >
              {t("habits.addFirst")}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
