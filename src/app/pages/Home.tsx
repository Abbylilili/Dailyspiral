import { useState, useEffect } from "react";
import { Link } from "react-router";
import { Wallet, Heart, CheckSquare, TrendingUp, Sparkles, Check, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Slider } from "../components/ui/slider";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { getMoods, saveMood, getExpenses, saveExpense, getHabits, isHabitCompleted, toggleHabitEntry, getGenderPreference } from "../lib/storage";
import { getMoodConfig, Gender } from "../lib/moodConfig";
import { getQuoteForMood, getRandomQuote } from "../lib/quotes";
import { initializeDemoData } from "../lib/demoData";
import { format } from "date-fns";
import { toast } from "sonner";
import { useLanguage } from "../contexts/LanguageContext";
import { useTheme } from "../contexts/ThemeContext";
import { cn } from "../components/ui/utils";
import fireworksImg from "figma:asset/766123dbe46a048342d0df8cdb7c65195d865734.png";

const CATEGORIES = [
  { value: "food", label: "🍜 Food", color: "#ef4444" },
  { value: "transport", label: "🚗 Transport", color: "#f59e0b" },
  { value: "shopping", label: "🛍️ Shopping", color: "#ec4899" },
  { value: "entertainment", label: "🎬 Entertainment", color: "#8b5cf6" },
  { value: "health", label: "💊 Health", color: "#10b981" },
  { value: "other", label: "📦 Other", color: "#6b7280" },
];

export function Home() {
  const { t } = useLanguage();
  const { theme } = useTheme();
  const today = format(new Date(), 'yyyy-MM-dd');
  const [mood, setMood] = useState(5);
  const [quote, setQuote] = useState(getRandomQuote());
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("food");
  const [todayHabits, setTodayHabits] = useState<Array<{ id: string; name: string; completed: boolean }>>([]);
  
  // New state for extended expense functionality
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [customCategory, setCustomCategory] = useState("");
  const [availableCategories, setAvailableCategories] = useState(CATEGORIES);

  // Theme helpers
  const getCardClass = () => {
      switch(theme) {
          case 'ocean': return "bg-slate-800/50 border-0 text-white backdrop-blur-xl shadow-xl";
          case 'ink': return "bg-white border-2 border-black text-black shadow-[6px_6px_0px_0px_black] rounded-xl";
          case 'zen': return "bg-white border-0 shadow-xl shadow-emerald-50/50 rounded-3xl";
          default: return "glass-card border-0 rounded-2xl";
      }
  };

  const getQuoteCardStyle = () => {
      switch(theme) {
          case 'ocean': return "bg-gradient-to-r from-slate-900 to-slate-800 border-0 text-slate-100 shadow-xl shadow-cyan-900/10 rounded-2xl";
          case 'ink': return "bg-black text-white rounded-xl shadow-[4px_4px_0px_0px_gray]";
          case 'zen': return "bg-[linear-gradient(135deg,#fef9e7_0%,#f0f9e8_50%,#e8f6f3_100%)] border-0 text-[#166534] shadow-[0_4px_20px_rgba(166,195,168,0.15)] rounded-full";
          default: return "bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-[2rem] shadow-lg shadow-purple-500/20";
      }
  };

  const getBottomCardStyle = (type: 'expense' | 'habit' | 'insight') => {
      
      if (theme === 'ink') {
          if (type === 'habit' || type === 'insight') {
             return "bg-white border-black text-black rounded-xl shadow-[4px_4px_0px_0px_black] group";
          }
          return "bg-black border-black text-white rounded-xl shadow-[4px_4px_0px_0px_gray]";
      }

      if (theme === 'zen') {
          switch(type) {
              case 'expense': return "bg-[#FFF7ED] border-0 text-[#9A3412] rounded-2xl";
              case 'habit': return "bg-[#EFF6FF] border-0 text-[#1E40AF] rounded-2xl";
              case 'insight': return "bg-[#FAF5FF] border-0 text-[#6B21A8] rounded-2xl group";
          }
      }

      if (theme === 'ocean') {
           switch(type) {
              case 'expense': return "bg-slate-800 border-0 text-orange-100 rounded-2xl relative overflow-hidden";
              case 'habit': return "bg-slate-800 border-0 text-blue-100 rounded-2xl relative overflow-hidden";
              case 'insight': return "bg-slate-800 border-0 text-violet-100 rounded-2xl group relative overflow-hidden";
          }
      }

      // Default (Pastel)
      switch(type) {
          case 'expense': return "bg-gradient-to-br from-orange-400 to-pink-500 rounded-2xl text-white shadow-lg shadow-orange-500/30";
          case 'habit': return "bg-gradient-to-br from-blue-400 to-cyan-500 rounded-2xl text-white shadow-lg shadow-blue-500/30";
          case 'insight': return "bg-gradient-to-br from-violet-500 to-fuchsia-600 rounded-2xl text-white shadow-lg shadow-violet-500/30 group";
      }
      return "";
  };

  const getInputClass = () => {
     switch(theme) {
         case 'ocean': return "bg-slate-900/60 border-0 text-white placeholder:text-slate-500 rounded-xl";
         case 'ink': return "bg-white border-2 border-black text-black rounded-lg placeholder:text-gray-400";
         default: return "bg-white/40 border-0 rounded-xl";
     }
  };

  const getButtonClass = () => {
      switch(theme) {
          case 'ocean': return "bg-cyan-500 text-slate-900 hover:bg-cyan-400";
          case 'ink': return "bg-black text-white hover:bg-gray-800 rounded-lg border-2 border-transparent active:border-black";
          default: return "bg-black text-white hover:bg-gray-800";
      }
  };

  // Initialize demo data on first load
  useEffect(() => {
    initializeDemoData();
  }, []);
  
  // Load today's mood, habits, and categories
  useEffect(() => {
    const moods = getMoods();
    const todayMood = moods.find(m => m.date === today);
    if (todayMood) {
      setMood(todayMood.mood);
      setQuote(getQuoteForMood(todayMood.mood));
    }
    
    // Load habits
    const habits = getHabits();
    setTodayHabits(habits.map(h => ({
      id: h.id,
      name: h.name,
      completed: isHabitCompleted(h.id, today)
    })));

    // Load custom categories from expenses
    const expenses = getExpenses();
    const existingCats = new Set(CATEGORIES.map(c => c.value));
    const customCats = expenses
        .map(e => e.category)
        .filter(c => !existingCats.has(c) && c !== 'Custom' && c !== 'custom')
        .filter((value, index, self) => self.indexOf(value) === index) // unique
        .map(c => ({ value: c, label: c, color: "#6b7280" }));
    
    setAvailableCategories([...CATEGORIES, ...customCats]);

  }, [today]);
  
  const handleMoodChange = (value: number[]) => {
    const newMood = value[0];
    setMood(newMood);
    setQuote(getQuoteForMood(newMood));
  };

  const handleSaveMood = () => {
    saveMood({
      id: today,
      date: today,
      mood: mood,
    });
    toast.success(t("mood.saved"));
  };
  
  const handleQuickExpense = () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error(t("expenses.enterAmount"));
      return;
    }
    
    const finalCategory = category === "custom" ? (customCategory.trim() || "Custom") : category;

    const expense = {
      id: `${Date.now()}`,
      date: today,
      amount: parseFloat(amount),
      category: finalCategory,
      description: "",
      type: type,
    };
    
    saveExpense(expense);
    setAmount("");
    setCustomCategory("");
    setCategory("food"); // Reset to default
    toast.success(type === 'expense' ? t("expenses.saved") : "Income saved");
    
    // Refresh categories if a new custom one was added
    if (category === "custom" && customCategory) {
       setAvailableCategories(prev => {
           if (prev.some(c => c.value === customCategory)) return prev;
           return [...prev, { value: customCategory, label: customCategory, color: "#6b7280" }];
       });
    }
  };
  
  const handleHabitToggle = (habitId: string) => {
    toggleHabitEntry(habitId, today);
    setTodayHabits(prev => 
      prev.map(h => h.id === habitId ? { ...h, completed: !h.completed } : h)
    );
  };
  
  // Calculate quick stats
  const expenses = getExpenses();
  const thisMonthExpenses = expenses.filter(e => {
    const date = new Date(e.date);
    const now = new Date();
    return date.getMonth() === now.getMonth() && 
           date.getFullYear() === now.getFullYear() &&
           e.type === 'expense';
  });
  const monthTotal = thisMonthExpenses.reduce((sum, e) => sum + e.amount, 0);
  
  const completedHabits = todayHabits.filter(h => h.completed).length;
  const habitProgress = todayHabits.length > 0 ? (completedHabits / todayHabits.length) * 100 : 0;
  
  const savedGender = getGenderPreference();
  const gender: Gender = savedGender || (theme === 'ocean' ? 'boy' : 'girl');
  const moodConfig = getMoodConfig(mood);
  
  return (
    <div className="space-y-8 max-w-6xl mx-auto p-8">
      {/* Daily Quote */}
      <Card className={cn("border-0 shadow-lg transition-all", getQuoteCardStyle())}>
        <CardContent className="py-6 px-6">
          <div className="flex items-center gap-3">
            <Sparkles className={cn("w-5 h-5 flex-shrink-0", 
                theme === 'ink' ? "text-white" : 
                theme === 'zen' ? "text-emerald-600" :
                theme === 'ocean' ? "text-cyan-400" :
                "text-yellow-200"
            )} />
            <div>
              <p className={cn("text-lg mb-1 leading-snug font-['Lora'] italic font-medium tracking-normal",
                  theme === 'ocean' ? "text-slate-100" : ""
              )}>{quote.text}</p>
              {quote.author && (
                <p className={cn("text-sm font-light font-['Lora'] italic", 
                    theme === 'zen' ? "text-emerald-700/70" :
                    theme === 'ocean' ? "text-slate-400" :
                    "opacity-90"
                )}>— {quote.author}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Quick Entry Section */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Mood Tracking */}
        <Card className={cn("flex flex-col h-full", getCardClass())}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Heart className={cn("w-5 h-5", theme === 'ocean' ? "text-pink-400" : "text-pink-500")} />
                {t("home.recordMood")}
              </CardTitle>
              <span className={cn("text-xs font-medium px-2 py-1 rounded-full",
                  theme === 'ocean' ? "bg-pink-900/30 text-pink-300" :
                  theme === 'ink' ? "bg-black text-white" :
                  "bg-pink-100 text-pink-600"
              )}>
                Today
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 flex flex-col flex-1">
            <div className="flex flex-col items-center justify-center py-4">
              <div className={cn("w-24 h-24 rounded-full overflow-hidden shadow-xl mb-3 border-4 transition-all duration-500 relative group bg-white/10", 
                  theme === 'ink' ? "border-black" : "border-white/40",
                  // Use light background color based on mood
                  moodConfig.color.replace('bg-', 'bg-opacity-20 bg-')
              )}>
                 <div className={cn("absolute inset-0 opacity-30", moodConfig.color)}></div>
                 {moodConfig.illustration ? (
                    <img 
                      src={moodConfig.illustration[gender]} 
                      alt={moodConfig.label} 
                      className={cn("w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 saturate-125")} 
                    />
                 ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl">{moodConfig.emoji}</div>
                 )}
              </div>
              <p className={cn("text-2xl font-black bg-clip-text text-transparent filter drop-shadow-sm",
                  theme === 'ocean' ? "bg-gradient-to-r from-pink-400 to-purple-400" :
                  theme === 'ink' ? "text-black" :
                  "bg-gradient-to-r from-pink-600 to-purple-600"
              )}>{mood}/10</p>
            </div>
            <div className="space-y-2 flex-1">
              <Label className={cn(theme === 'ocean' ? "text-slate-400" : "text-muted-foreground")}>{t("mood.howAreYou")}</Label>
              <style>
                {`
                  .neon-thumb {
                    position: relative;
                    z-index: 10;
                    border: 2px solid ${theme === 'ink' ? '#000' : theme === 'ocean' ? '#fff' : '#e5e7eb'} !important;
                    box-shadow: none !important;
                    transition: all 0.2s ease;
                  }
                  .neon-thumb:hover {
                    background-color: transparent !important;
                    border-color: transparent !important;
                    box-shadow: none !important;
                    transform: scale(1.5);
                  }
                  .neon-thumb:hover::after {
                    content: "⭐️";
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -55%);
                    font-size: 16px;
                    line-height: 1;
                    width: max-content;
                    height: max-content;
                    z-index: 20;
                  }
                `}
              </style>
              <Slider
                value={[mood]}
                onValueChange={handleMoodChange}
                min={1}
                max={10}
                step={1}
                className="w-full"
                rangeClassName={cn(
                    theme === 'ocean' ? "bg-gradient-to-r from-pink-500 to-purple-600" :
                    theme === 'ink' ? "bg-black" :
                    "bg-gradient-to-r from-pink-500 to-purple-600"
                )}
                trackClassName={theme === 'ocean' ? "bg-slate-700" : ""}
                thumbClassName={cn("neon-thumb w-5 h-5 transition-all", 
                    theme === 'ocean' ? "bg-white border-white" : 
                    theme === 'ink' ? "bg-black rounded-none border-black" :
                    "bg-white"
                )}
              />
              <div className="flex justify-between text-xs text-muted-foreground font-medium">
                <span>{t("mood.veryBad")}</span>
                <span>{t("mood.excellent")}</span>
              </div>
            </div>
            <div className="mt-auto">
              <Button onClick={handleSaveMood} className={cn("relative w-full h-9 text-sm font-medium rounded-xl shadow-lg transition-transform active:scale-95", getButtonClass())}>
                <Heart className={cn("absolute left-4 w-4 h-4 fill-current", theme === 'ocean' ? "text-white" : "")} />
                <span>Save Mood</span>
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Quick Expense */}
        <Card className={cn("flex flex-col h-full", getCardClass())}>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Wallet className={cn("w-5 h-5", theme === 'ocean' ? "text-green-400" : "text-green-500")} />
              Quick Add
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 flex flex-col flex-1">
            <div className="space-y-2">
                <Label className={cn(theme === 'ocean' ? "text-slate-300" : "text-muted-foreground")}>Type</Label>
                <div className={cn("flex p-1 rounded-xl", theme === 'ocean' ? "bg-slate-900" : "bg-gray-100")}>
                    <button
                        type="button"
                        onClick={() => setType('expense')}
                        className={cn(
                            "flex-1 py-1.5 rounded-lg text-sm font-medium transition-all",
                            type === 'expense' 
                                ? (theme === 'ocean' ? "bg-slate-700 text-red-400 shadow-sm" : theme === 'ink' ? "bg-black text-white" : "bg-white shadow-sm text-red-600")
                                : (theme === 'ocean' ? "text-slate-500 hover:text-slate-300" : "text-gray-500 hover:text-gray-700")
                        )}
                    >
                        Expense
                    </button>
                    <button
                        type="button"
                        onClick={() => setType('income')}
                        className={cn(
                            "flex-1 py-1.5 rounded-lg text-sm font-medium transition-all",
                            type === 'income' 
                                ? (theme === 'ocean' ? "bg-slate-700 text-green-400 shadow-sm" : theme === 'ink' ? "bg-black text-white" : "bg-white shadow-sm text-green-600")
                                : (theme === 'ocean' ? "text-slate-500 hover:text-slate-300" : "text-gray-500 hover:text-gray-700")
                        )}
                    >
                        Income
                    </button>
                </div>
            </div>

            <div className="space-y-2">
              <Label className={cn(theme === 'ocean' ? "text-slate-300" : "text-muted-foreground")}>{t("expenses.amount")}</Label>
              <Input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className={cn("text-lg h-12 focus-visible:ring-1 focus-visible:ring-green-500/50", getInputClass())}
              />
            </div>
            
            <div className="space-y-2 flex-1">
              <Label className={cn(theme === 'ocean' ? "text-slate-300" : "text-muted-foreground")}>{t("expenses.category")}</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className={cn("h-12 focus:ring-1 focus:ring-green-500/50", getInputClass())}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className={cn("max-h-[200px]", 
                    theme === 'ocean' ? "bg-slate-800 border-white/10 text-white" : 
                    theme === 'ink' ? "bg-white border-2 border-black" : 
                    "glass-card border-0"
                )}>
                  {availableCategories.map(cat => (
                    <SelectItem key={cat.value} value={cat.value} className={cn(theme === 'ocean' && "focus:bg-slate-700 focus:text-white")}>
                      {cat.label}
                    </SelectItem>
                  ))}
                  <SelectItem value="custom" className={cn(theme === 'ocean' && "focus:bg-slate-700 focus:text-white")}>✏️ Custom...</SelectItem>
                </SelectContent>
              </Select>
              {category === "custom" && (
                <Input 
                    placeholder="Enter category name"
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    className={cn("h-10 mt-2", getInputClass())}
                    autoFocus
                />
              )}
            </div>
            
            <Button onClick={handleQuickExpense} className={cn("relative w-full h-9 text-sm font-medium rounded-xl shadow-lg transition-transform active:scale-95 mt-auto", getButtonClass())}>
              <Plus className="absolute left-4 w-4 h-4" />
              <span>{type === 'expense' ? t("home.addExpense") : "Add Income"}</span>
            </Button>
          </CardContent>
        </Card>
      </div>
      
      {/* Today's Habits */}
      <Card className={cn(getCardClass())}>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg justify-between w-full">
            <div className="flex items-center gap-2">
              <CheckSquare className={cn("w-5 h-5", theme === 'ocean' ? "text-blue-400" : "text-blue-500")} />
              {t("home.checkHabit")}
            </div>
            <span className={cn("text-xs font-medium px-2 py-1 rounded-full",
                theme === 'ocean' ? "bg-blue-900/50 text-blue-300" :
                theme === 'ink' ? "bg-black text-white" :
                "bg-blue-100 text-blue-600"
            )}>
              Today
            </span>
            {todayHabits.length > 0 && (
              <span className={cn("ml-auto text-sm font-bold px-2 py-1 rounded-full",
                  theme === 'ocean' ? "bg-blue-900/50 text-blue-300" :
                  theme === 'ink' ? "bg-black text-white" :
                  "bg-blue-100 text-blue-600"
              )}>
                {completedHabits}/{todayHabits.length}
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 mb-4">
            {todayHabits.length > 0 ? (
              todayHabits.map(habit => (
                <div
                  key={habit.id}
                  onClick={() => handleHabitToggle(habit.id)}
                  className={cn("flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border group select-none",
                      theme === 'ocean' ? "bg-white/5 hover:bg-white/10 border-transparent hover:border-white/20" :
                      theme === 'ink' ? "bg-transparent border-2 border-black hover:bg-gray-100 rounded-lg" :
                      "hover:bg-white/40 border-transparent hover:border-white/20 bg-white/20 backdrop-blur-sm"
                  )}
                >
                  <div className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 border-2",
                    theme === 'ink' && "rounded-sm border-black",
                    habit.completed 
                      ? (theme === 'ink' ? "bg-black" : "bg-gradient-to-br from-blue-500 to-purple-600 border-transparent shadow-none scale-100") 
                      : (theme === 'ocean' ? "bg-slate-700 border-slate-500" : "bg-white/50 border-gray-300 group-hover:border-blue-300")
                  )}>
                    <Check className={cn(
                      "w-3.5 h-3.5 text-white transition-all duration-300",
                      habit.completed ? "opacity-100 scale-100" : "opacity-0 scale-50"
                    )} strokeWidth={3} />
                  </div>
                  <span className={cn(
                    "font-medium transition-all duration-300",
                    habit.completed ? (theme === 'ocean' ? "text-slate-500" : "text-gray-400") : (theme === 'ocean' ? "text-white" : "text-gray-700")
                  )}>
                    {habit.name}
                  </span>
                </div>
              ))
            ) : (
               <div className={cn("text-center py-6", theme === 'ocean' ? "text-slate-500" : "text-gray-400")}>
                  <p className="text-sm">No habits for today.</p>
                  <Link to="/habits" className={cn("text-sm font-medium hover:underline mt-1 block", theme === 'ocean' ? "text-blue-400" : "text-blue-500")}>
                    Create your first habit
                  </Link>
               </div>
            )}
          </div>
          <Link to="/habits?view=day">
            <Button variant="outline" className={cn("w-full border-0",
                 theme === 'ocean' ? "bg-white/10 hover:bg-white/20 text-white" :
                 theme === 'ink' ? "bg-transparent border-2 border-black hover:bg-black hover:text-white rounded-lg" :
                 "rounded-xl hover:bg-white/50 bg-white/30 backdrop-blur-sm"
            )}>
              View Today's Habits
            </Button>
          </Link>
        </CardContent>
      </Card>
      
      {/* Quick Stats - Colorful Bottom Modules */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card className={cn("border-2 border-transparent shadow-lg transform transition-all hover:scale-105 active:scale-95 duration-300",
            getBottomCardStyle('expense')
        )}>
          {theme === 'ocean' && <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent pointer-events-none" />}
          <CardContent className="p-6 h-full flex flex-col items-center justify-center text-center relative z-10">
            <p className={cn("text-xs font-bold uppercase tracking-wider mb-1", 
                theme === 'zen' ? "text-orange-800/60" : 
                theme === 'ocean' ? "text-orange-200/50" :
                "text-white/80"
            )}>{t("common.thisMonth")} {t("nav.expenses")}</p>
            <p className="text-2xl font-bold">${monthTotal.toFixed(0)}</p>
          </CardContent>
        </Card>
        
        <Card className={cn("border-2 border-transparent shadow-lg transform transition-all hover:scale-105 active:scale-95 duration-300 relative overflow-hidden",
             getBottomCardStyle('habit')
        )}>
          {theme === 'ocean' && <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent pointer-events-none" />}
          {theme === 'ink' && (
             <div className="absolute inset-0 pointer-events-none opacity-80 overflow-hidden rounded-xl">
                <img src={fireworksImg} className="w-full h-full object-contain object-left-top scale-150 origin-top-left -translate-y-5 -translate-x-3" alt="" />
             </div>
          )}
          <CardContent className="p-6 h-full flex flex-col items-center justify-center text-center relative z-10">
            <p className={cn("text-xs font-bold uppercase tracking-wider mb-1", 
                theme === 'ink' ? "text-gray-500" : 
                theme === 'zen' ? "text-blue-800/60" :
                theme === 'ocean' ? "text-blue-200/50" :
                "text-white/80"
            )}>{t("common.today")} {t("nav.habits")}</p>
            <p className={cn("text-2xl font-bold")}>{habitProgress.toFixed(0)}%</p>
          </CardContent>
        </Card>
        
        <Link to="/insights" className="col-span-2 md:col-span-1 group relative block h-full">
          <Card className={cn("border-2 border-transparent h-full transition-all duration-300 hover:shadow-xl hover:scale-[1.02] cursor-pointer flex items-center justify-center overflow-hidden",
              getBottomCardStyle('insight')
          )}>
             {/* Abstract Background Shapes */}
             {theme !== 'zen' && theme !== 'ink' && theme !== 'ocean' && (
                 <>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl transform translate-x-10 -translate-y-10 pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full blur-xl transform -translate-x-5 translate-y-5 pointer-events-none" />
                 </>
             )}
             {theme === 'ocean' && <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-transparent pointer-events-none" />}
             
            <CardContent className="p-6 h-full flex flex-col items-center justify-center text-center relative z-10">
              <p className={cn("text-xs font-bold uppercase tracking-wider mb-1", 
                  theme === 'ink' ? "text-gray-500" : 
                  theme === 'zen' ? "text-violet-800/60" :
                  theme === 'ocean' ? "text-violet-200/50" :
                  "text-white/80"
              )}>
                Click to view
              </p>
              <p className={cn("text-2xl font-bold tracking-tight drop-shadow-sm transition-colors", 
                  theme === 'ink' ? "text-black" : ""
              )}>
                Explore Insights
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
