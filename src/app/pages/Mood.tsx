import { useState, useEffect } from "react";
import { Heart, Music, Calendar as CalendarIcon, ChevronLeft, ChevronRight, Frown, Meh, Smile, Play, MoreHorizontal, Moon, Coffee, Utensils, Activity, BookOpen, Phone, Wind, CheckCircle2, CloudRain, Sun, ArrowUpRight, TrendingUp, Palette } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Slider } from "../components/ui/slider";
import { Textarea } from "../components/ui/textarea";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import { getMoods, saveMood, MoodEntry, getGenderPreference, saveGenderPreference } from "../lib/storage";
import { getQuoteForMood } from "../lib/quotes";
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, isWithinInterval, startOfDay, endOfDay, parseISO } from "date-fns";
import { toast } from "sonner";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "../components/ui/popover";
import { Calendar } from "../components/ui/calendar";
import { cn } from "../components/ui/utils";
import { useLanguage } from "../contexts/LanguageContext";
import { useTheme, Theme } from "../contexts/ThemeContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "../components/ui/dropdown-menu";

import { MOOD_EMOJIS, getMoodConfig, Gender, MoodConfig } from "../lib/moodConfig";

import pandaHeartEyes from "figma:asset/07adfa527d7df4b1c4e40ffdecd8ece4d50d1475.png";
import pandaWink from "figma:asset/f0f4102b92fca1513959a78f69420953a89ddd72.png";
import pandaTongue from "figma:asset/da2819d8483af1d1ad14bb4adf08507059ea40df.png";

// --- Data & Config ---

// Config moved to shared file
const getRecommendations = (mood: number, theme: Theme) => {
    // Define Base Styles per Theme
    
    // === THEME 1: PASTEL (Original) ===
    const pastelNoise = `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.5'/%3E%3C/svg%3E")`;
    const pastelCommon = {
        backgroundSize: 'cover',
        backgroundBlendMode: 'overlay, normal, normal, normal, normal', 
        border: 'none',
    };
    // Pastel Gradients
    const pastelWarm = { ...pastelCommon, backgroundImage: `${pastelNoise}, radial-gradient(at 10% 10%, rgba(255, 183, 178, 0.8) 0px, transparent 50%), radial-gradient(at 90% 90%, rgba(255, 218, 193, 0.8) 0px, transparent 50%), linear-gradient(135deg, #fff0f0 0%, #ffdfd4 100%)` };
    const pastelFresh = { ...pastelCommon, backgroundImage: `${pastelNoise}, radial-gradient(at 0% 0%, rgba(162, 210, 255, 0.7) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(205, 240, 234, 0.8) 0px, transparent 50%), linear-gradient(135deg, #e0f7fa 0%, #e8f5e9 100%)` };
    const pastelDreamy = { ...pastelCommon, backgroundImage: `${pastelNoise}, radial-gradient(at 20% 20%, rgba(224, 195, 252, 0.8) 0px, transparent 50%), radial-gradient(at 80% 80%, rgba(199, 206, 234, 0.8) 0px, transparent 50%), linear-gradient(135deg, #f3e8ff 0%, #e0e7ff 100%)` };
    const pastelEnergy = { ...pastelCommon, backgroundImage: `${pastelNoise}, radial-gradient(at 0% 100%, rgba(253, 253, 150, 0.6) 0px, transparent 50%), radial-gradient(at 100% 0%, rgba(255, 255, 210, 0.8) 0px, transparent 50%), linear-gradient(135deg, #fff9c4 0%, #fff3e0 100%)` };


    // === THEME 2: OCEAN (Boy / Dark Mode) ===
    // Deep blues, neons, glassmorphism
    const oceanCommon = {
        backgroundColor: '#1e293b', // Slate 800 base
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.5)',
    };
    // Ocean Gradients (Darker, richer)
    const oceanWarm = { ...oceanCommon, backgroundImage: `linear-gradient(135deg, rgba(244, 63, 94, 0.1) 0%, rgba(30, 41, 59, 0) 100%)` }; // Rose glow
    const oceanFresh = { ...oceanCommon, backgroundImage: `linear-gradient(135deg, rgba(14, 165, 233, 0.1) 0%, rgba(30, 41, 59, 0) 100%)` }; // Sky glow
    const oceanDreamy = { ...oceanCommon, backgroundImage: `linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(30, 41, 59, 0) 100%)` }; // Violet glow
    const oceanEnergy = { ...oceanCommon, backgroundImage: `linear-gradient(135deg, rgba(234, 179, 8, 0.1) 0%, rgba(30, 41, 59, 0) 100%)` }; // Yellow glow


    // === THEME 3: INK (Black & White) ===
    // Brutalist, high contrast, borders
    const inkCommon = {
        backgroundColor: '#ffffff',
        border: '2px solid #000000',
        boxShadow: '4px 4px 0px 0px #000000',
        borderRadius: '1rem', // Sharper
    };
    const inkWarm = { ...inkCommon };
    const inkFresh = { ...inkCommon };
    const inkDreamy = { ...inkCommon };
    const inkEnergy = { ...inkCommon };

    // === THEME 4: ZEN (Wellness / Nature) ===
    // Clean, white, pastel green accents, soft shadows
    const zenCommon = {
        backgroundColor: '#ffffff',
        border: '0', 
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.025)',
        borderRadius: '1.5rem',
    };
    const zenWarm = { ...zenCommon, borderLeft: '6px solid #fbbf24' }; 
    const zenFresh = { ...zenCommon, borderLeft: '6px solid #34d399' }; 
    const zenDreamy = { ...zenCommon, borderLeft: '6px solid #a78bfa' }; 
    const zenEnergy = { ...zenCommon, borderLeft: '6px solid #f87171' };


    // Helper to select style based on theme
    const getStyle = (p: any, o: any, i: any, z: any) => {
        if (theme === 'ocean') return o;
        if (theme === 'ink') return i;
        if (theme === 'zen') return z;
        return p;
    };

    // Helper to get Icon Color Class based on theme
    const getIconClass = (baseColor: string) => {
        if (theme === 'ocean') return "text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]";
        if (theme === 'ink') return "text-white";
        if (theme === 'zen') return baseColor.replace('/80', '');
        return `${baseColor} mix-blend-multiply`; // Pastel default
    };

    // Helper for Panda Icons in Ink Theme
    const renderPandaIcon = (src: string) => (
        <div className="w-8 h-8 relative flex items-center justify-center overflow-hidden">
            <img 
                src={src} 
                alt="Panda" 
                className="w-full h-full object-contain filter grayscale invert contrast-125"
                style={{ mixBlendMode: 'screen' }}
            />
        </div>
    );

    if (mood <= 3) {
        return [
            { 
                icon: theme === 'ink' ? renderPandaIcon(pandaHeartEyes) : <CloudRain className={`w-5 h-5 ${getIconClass("text-indigo-500/80")}`} />, 
                title: "Comforting Playlist", 
                subtitle: "Music • 20 min", 
                style: getStyle(pastelWarm, oceanWarm, inkWarm, zenWarm) 
            },
            { 
                icon: theme === 'ink' ? renderPandaIcon(pandaWink) : <Wind className={`w-5 h-5 ${getIconClass("text-teal-600/80")}`} />, 
                title: "Deep Breathing", 
                subtitle: "Wellness • 5 min", 
                style: getStyle(pastelFresh, oceanFresh, inkFresh, zenFresh) 
            },
            { 
                icon: theme === 'ink' ? renderPandaIcon(pandaTongue) : <BookOpen className={`w-5 h-5 ${getIconClass("text-violet-500/80")}`} />, 
                title: "Vent Journaling", 
                subtitle: "Writing • 10 min", 
                style: getStyle(pastelDreamy, oceanDreamy, inkDreamy, zenDreamy) 
            },
        ];
    } else if (mood <= 6) {
        return [
            { 
                icon: theme === 'ink' ? renderPandaIcon(pandaWink) : <Coffee className={`w-5 h-5 ${getIconClass("text-stone-600/80")}`} />, 
                title: "Lo-Fi Beats", 
                subtitle: "Music • Focus", 
                style: getStyle(pastelWarm, oceanWarm, inkWarm, zenWarm) 
            },
            { 
                icon: theme === 'ink' ? renderPandaIcon(pandaHeartEyes) : <Activity className={`w-5 h-5 ${getIconClass("text-emerald-600/80")}`} />, 
                title: "Short Walk", 
                subtitle: "Health • 15 min", 
                style: getStyle(pastelFresh, oceanFresh, inkFresh, zenFresh) 
            },
            { 
                icon: theme === 'ink' ? renderPandaIcon(pandaTongue) : <BookOpen className={`w-5 h-5 ${getIconClass("text-indigo-500/80")}`} />, 
                title: "Read a Chapter", 
                subtitle: "Relax • 15 min", 
                style: getStyle(pastelDreamy, oceanDreamy, inkDreamy, zenDreamy) 
            },
        ];
    } else if (mood <= 8) {
         return [
            { 
                icon: theme === 'ink' ? renderPandaIcon(pandaHeartEyes) : <Music className={`w-5 h-5 ${getIconClass("text-pink-500/80")}`} />, 
                title: "Indie Pop Mix", 
                subtitle: "Music • 30 min", 
                style: getStyle(pastelWarm, oceanWarm, inkWarm, zenWarm) 
            },
            { 
                icon: theme === 'ink' ? renderPandaIcon(pandaWink) : <CheckCircle2 className={`w-5 h-5 ${getIconClass("text-teal-600/80")}`} />, 
                title: "Gratitude Log", 
                subtitle: "Journal • 5 min", 
                style: getStyle(pastelFresh, oceanFresh, inkFresh, zenFresh) 
            },
            { 
                icon: theme === 'ink' ? renderPandaIcon(pandaTongue) : <Phone className={`w-5 h-5 ${getIconClass("text-violet-500/80")}`} />, 
                title: "Call a Friend", 
                subtitle: "Social • 10 min", 
                style: getStyle(pastelDreamy, oceanDreamy, inkDreamy, zenDreamy) 
            },
        ];
    } else {
        return [
             { 
                 icon: theme === 'ink' ? renderPandaIcon(pandaTongue) : <Sun className={`w-5 h-5 ${getIconClass("text-amber-500/80")}`} />, 
                 title: "Upbeat Hits", 
                 subtitle: "Music • Energy", 
                 style: getStyle(pastelEnergy, oceanEnergy, inkEnergy, zenEnergy) 
             },
             { 
                 icon: theme === 'ink' ? renderPandaIcon(pandaHeartEyes) : <Activity className={`w-5 h-5 ${getIconClass("text-rose-500/80")}`} />, 
                 title: "Quick Workout", 
                 subtitle: "Fitness • 20 min", 
                 style: getStyle(pastelWarm, oceanWarm, inkWarm, zenWarm) 
             },
             { 
                 icon: theme === 'ink' ? renderPandaIcon(pandaWink) : <PlaneIconWrapper className={`w-5 h-5 ${getIconClass("text-sky-500/80")}`} />, 
                 title: "Plan a Trip", 
                 subtitle: "Goal • 15 min", 
                 style: getStyle(pastelFresh, oceanFresh, inkFresh, zenFresh) 
             },
        ];
    }
};

const PlaneIconWrapper = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M2 12h20"/><path d="M13 2l9 10-9 10"/><path d="M2 12l5-5m0 10l-5-5"/></svg> 
);

export function Mood() {
  const { t } = useLanguage();
  const { theme, setTheme } = useTheme();
  const [moods, setMoods] = useState<MoodEntry[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [mood, setMood] = useState(5);
  const [note, setNote] = useState("");
  const [quote, setQuote] = useState(getQuoteForMood(5));
  const [isJourneyOpen, setIsJourneyOpen] = useState(false);
  const [gender, setGender] = useState<Gender>(() => {
    const saved = getGenderPreference();
    if (saved) return saved;
    return theme === 'ocean' ? 'boy' : 'girl';
  });

  const updateGender = (newGender: Gender) => {
    setGender(newGender);
    saveGenderPreference(newGender);
  };
  
  const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
  
  // Dynamic Theme Classes
  const getContainerClass = () => {
      switch(theme) {
          case 'ocean': return "bg-slate-900 text-slate-100 selection:bg-cyan-500 selection:text-slate-900";
          case 'ink': return "bg-white text-black selection:bg-black selection:text-white";
          case 'zen': return "bg-transparent text-slate-800 selection:bg-emerald-200 selection:text-emerald-900";
          default: return "bg-transparent text-gray-900 selection:bg-pink-200 selection:text-gray-900";
      }
  };

  const getCardClass = () => {
     switch (theme) {
        case 'ocean': return "bg-slate-800/50 border-0 text-slate-100 shadow-2xl backdrop-blur-xl";
        case 'ink': return "bg-white border-2 border-black text-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-xl";
        case 'zen': return "bg-white border-0 shadow-xl shadow-gray-200/50 rounded-3xl";
        default: return "glass-card border-0 bg-white/70 backdrop-blur-xl shadow-xl";
     }
  };

  const getButtonClass = () => {
      switch (theme) {
          case 'ocean': return "bg-cyan-500 text-slate-900 hover:bg-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.5)]";
          case 'ink': return "bg-black text-white hover:bg-gray-800 shadow-[4px_4px_0px_0px_rgba(128,128,128,1)] border-2 border-black rounded-xl";
          case 'zen': return "bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-900/20 rounded-xl";
          default: return "bg-black text-white hover:bg-gray-800 shadow-lg";
      }
  };

  useEffect(() => {
    loadMoods();
  }, []);
  
  useEffect(() => {
    const entry = moods.find(m => m.date === selectedDateStr);
    if (entry) {
      setMood(entry.mood);
      setNote(entry.note || "");
      setQuote(getQuoteForMood(entry.mood));
    } else {
      setMood(5);
      setNote("");
      setQuote(getQuoteForMood(5));
    }
  }, [selectedDateStr, moods]);
  
  const loadMoods = () => {
    const data = getMoods();
    setMoods(data);
  };
  
  const handleSave = () => {
    const entry: MoodEntry = {
      id: selectedDateStr,
      date: selectedDateStr,
      mood,
      note: note.trim() || undefined,
    };
    
    saveMood(entry);
    loadMoods();
    toast.success(t("mood.saved") || "Mood saved");
  };
  
  const handleMoodChange = (value: number[]) => {
    const newMood = value[0];
    setMood(newMood);
    setQuote(getQuoteForMood(newMood));
  };

  // Week Logic (7 Days)
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd }); 

  // Mood Journey Logic
  const weekMoods = moods.filter(m => {
      const d = new Date(m.date);
      return isWithinInterval(d, { start: startOfDay(weekStart), end: endOfDay(weekEnd) });
  });

  const avgMood = weekMoods.length > 0 
      ? weekMoods.reduce((acc, m) => acc + m.mood, 0) / weekMoods.length 
      : 0;
  
  const moodPercentage = Math.round((avgMood / 10) * 100);
  
  const liquidY = 22 - (moodPercentage / 100) * 20;

  let moodStatus = "No data yet";
  if (weekMoods.length > 0) {
      if (moodPercentage >= 80) moodStatus = "Feeling amazing";
      else if (moodPercentage >= 60) moodStatus = "Feeling good";
      else if (moodPercentage >= 40) moodStatus = "Feeling okay";
      else moodStatus = "Having a rough week";
  }

  const currentMoodConfig = getMoodConfig(mood);
  const recommendations = getRecommendations(mood, theme);

  return (
    <div className={cn("transition-colors duration-500 ease-in-out min-h-screen", getContainerClass())}>
    <div className="space-y-8 max-w-6xl mx-auto p-8">
      {/* Header Section */}
      <style>
        {`
            @keyframes blob {
                0% { transform: translate(0px, 0px) scale(1); }
                33% { transform: translate(30px, -50px) scale(1.1); }
                66% { transform: translate(-20px, 20px) scale(0.9); }
                100% { transform: translate(0px, 0px) scale(1); }
            }
            .animate-blob {
                animation: blob 7s infinite;
            }
            .animation-delay-2000 {
                animation-delay: 2s;
            }
        `}
      </style>
      <div className="flex items-center justify-between">
        <h2 className={cn("text-4xl font-bold bg-clip-text text-transparent", 
            theme === 'ocean' ? "bg-gradient-to-r from-cyan-400 to-blue-500" : 
            theme === 'ink' ? "text-black font-['Rubik_Dirt'] tracking-wider" :
            theme === 'zen' ? "bg-gradient-to-r from-emerald-600 to-teal-600" :
            "bg-gradient-to-r from-purple-600 to-pink-600"
        )}>
          {t("mood.howAreYou")}
        </h2>
        
        <div className="flex items-center gap-2">
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("rounded-full h-12 w-12 p-0 border-0 shadow-sm", 
                        theme === 'ocean' ? "bg-slate-800 text-white hover:bg-slate-700" : 
                        theme === 'ink' ? "bg-white border-2 border-black text-black hover:bg-gray-100" :
                        theme === 'zen' ? "bg-white border border-gray-100 text-gray-600 shadow-md" :
                        "bg-white/60 hover:bg-white text-gray-600"
                    )}>
                        <CalendarIcon className={cn("w-5 h-5", theme === 'ocean' ? "text-cyan-400" : "text-gray-600")} />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className={cn("w-auto p-0 border-0 rounded-2xl shadow-2xl", theme === 'ocean' ? "bg-slate-800 text-white" : "bg-white/90 backdrop-blur-xl")} align="end">
                    <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={(date) => date && setSelectedDate(date)}
                        initialFocus
                        className={cn("p-3", theme === 'ocean' && "dark")}
                    />
                </PopoverContent>
            </Popover>
        </div>
      </div>

      {/* Main Grid: Left (Mood Log) vs Right (Journey & Recommendations) */}
      <div className="grid md:grid-cols-2 gap-10 items-stretch">
          
          {/* Left Column: Mood Logging */}
          <div className="flex flex-col gap-8">
            
            {/* Mood History Strip (7 Days) - Wrapped in Card */}
            <Card className={cn("border-0 p-8", getCardClass(), theme === 'pastel' && "rounded-[2.5rem]", theme === 'ocean' && "rounded-[2rem]")}>
                <div className="flex items-center justify-between mb-6">
                    <h3 className={cn("font-bold text-xl", theme === 'ocean' ? "text-white" : "")}>Mood History</h3>
                    
                    {/* Gender Toggle Pill (Moved here) */}
                    <div className={cn("flex items-center p-1 rounded-full border shadow-sm h-10",
                        theme === 'ocean' ? "bg-slate-800 border-slate-700" : 
                        theme === 'ink' ? "bg-white border-2 border-black" :
                        theme === 'zen' ? "bg-white border-0" :
                        "bg-white/60 border-white/40 backdrop-blur-sm"
                    )}>
                        <button
                            onClick={() => updateGender('girl')}
                            className={cn("px-3 py-1 rounded-full text-xs font-bold transition-all",
                                gender === 'girl' 
                                    ? (theme === 'ocean' ? "bg-pink-500 text-white" : theme === 'ink' ? "bg-black text-white" : theme === 'zen' ? "bg-slate-900 text-white" : "bg-white text-pink-500 shadow-sm")
                                    : (theme === 'ocean' ? "text-slate-400 hover:text-white" : "text-muted-foreground hover:text-foreground")
                            )}
                        >
                            Girl
                        </button>
                        <button
                            onClick={() => updateGender('boy')}
                            className={cn("px-3 py-1 rounded-full text-xs font-bold transition-all",
                                gender === 'boy' 
                                    ? (theme === 'ocean' ? "bg-blue-500 text-white" : theme === 'ink' ? "bg-black text-white" : theme === 'zen' ? "bg-slate-900 text-white" : "bg-white text-blue-500 shadow-sm")
                                    : (theme === 'ocean' ? "text-slate-400 hover:text-white" : "text-muted-foreground hover:text-foreground")
                            )}
                        >
                            Boy
                        </button>
                    </div>
                </div>
                <div className="grid grid-cols-7 gap-3">
                    {weekDays.map(day => {
                        const dayStr = format(day, 'yyyy-MM-dd');
                        const dayEntry = moods.find(m => m.date === dayStr);
                        const isSelected = isSameDay(day, selectedDate);
                        const dayConfig = dayEntry ? getMoodConfig(dayEntry.mood) : null;
                        
                        return (
                            <div 
                                key={dayStr}
                                onClick={() => setSelectedDate(day)}
                                className={cn(
                                    "flex flex-col items-center gap-3 cursor-pointer transition-all duration-300",
                                    isSelected ? "scale-110" : "opacity-70 hover:opacity-100"
                                )}
                            >
                                <div className={cn(
                                    "w-12 h-12 flex items-center justify-center text-xl shadow-sm transition-all overflow-hidden",
                                    theme === 'ink' ? "rounded-lg border border-black" : "rounded-2xl",
                                    dayConfig && !dayConfig.illustration ? dayConfig.color : (theme === 'ocean' ? "bg-slate-700" : theme === 'zen' ? "bg-white border-0" : "bg-gray-100"),
                                    isSelected ? (theme === 'ocean' ? "ring-2 ring-cyan-400" : (theme === 'ink' ? "bg-black text-white" : theme === 'zen' ? "ring-2 ring-emerald-400 bg-emerald-50" : "ring-2 ring-offset-2 ring-black/10")) : ""
                                )}>
                                    {dayConfig ? (
                                        dayConfig.illustration ? (
                                             <img src={dayConfig.illustration[gender]} alt={dayConfig.label} className={cn("w-full h-full object-cover", "saturate-125")} />
                                        ) : (
                                            dayConfig.emoji
                                        )
                                    ) : <span className="text-gray-300 text-sm">•</span>}
                                </div>
                                <span className={cn("text-xs font-bold opacity-60 uppercase tracking-wide", theme === 'zen' && isSelected && "text-emerald-600 opacity-100")}>{format(day, 'EEE')}</span>
                            </div>
                        );
                    })}
                </div>
            </Card>

            {/* Main Mood Input Card */}
            <Card className={cn("border-0 overflow-hidden relative flex-1 min-h-[420px] transition-all", getCardClass(), theme === 'pastel' && "rounded-[3rem]", theme === 'ocean' && "rounded-[2.5rem]")}>
                 <div className={cn("absolute inset-0 transition-colors duration-500", 
                    theme === 'ink' ? 'opacity-0' : theme === 'zen' ? 'opacity-0' : 'opacity-10',
                    currentMoodConfig.color
                 )} />
                 
                 <CardContent className="pt-12 pb-10 px-10 flex flex-col items-center text-center relative z-10 h-full justify-center">
                    <div className="mb-8 transform transition-transform duration-500 hover:scale-105 cursor-grab active:cursor-grabbing">
                        {currentMoodConfig.illustration ? (
                            <div className={cn(
                                "w-56 h-56 overflow-hidden shadow-2xl relative group",
                                theme === 'ink' ? "rounded-2xl border-4 border-black" : 
                                theme === 'zen' ? "rounded-full ring-8 ring-white shadow-emerald-100" :
                                "rounded-[3rem] ring-8 ring-white/20"
                            )}>
                                <div className={cn(
                                    "absolute inset-0 opacity-20 transition-colors duration-500 z-0",
                                    currentMoodConfig.color
                                )} />
                                <img 
                                    src={currentMoodConfig.illustration[gender]} 
                                    alt={currentMoodConfig.label}
                                    className="w-full h-full object-cover relative z-10 transition-transform duration-700 group-hover:scale-110 saturate-125"
                                />
                            </div>
                        ) : (
                            <div className="text-[8rem] leading-none filter drop-shadow-2xl">
                                {currentMoodConfig.emoji}
                            </div>
                        )}
                    </div>
                    
                    <h3 className={cn("text-2xl font-bold mb-8", theme === 'ocean' ? "text-white" : "text-gray-800")}>{currentMoodConfig.label}</h3>

                    <div className="w-full px-6 mb-8">
                        <Slider
                            value={[mood]}
                            onValueChange={handleMoodChange}
                            min={1}
                            max={10}
                            step={1}
                            className="w-full"
                            trackClassName={cn("h-4", theme === 'ocean' ? "bg-slate-700" : "bg-gray-100")}
                            rangeClassName={cn("h-4 transition-colors", 
                                theme === 'ocean' ? "bg-cyan-500" : 
                                theme === 'ink' ? "bg-black" : 
                                theme === 'zen' ? "bg-gradient-to-r from-emerald-400 to-teal-500" :
                                currentMoodConfig.color.replace('bg-', 'bg-opacity-50 bg-')
                            )}
                            thumbClassName={cn("h-8 w-8 shadow-lg border-2", 
                                theme === 'ocean' ? "bg-slate-900 border-cyan-500" : 
                                theme === 'ink' ? "bg-black border-black rounded-none" : 
                                theme === 'zen' ? "bg-white border-emerald-500 rounded-full" :
                                "bg-white border-gray-100"
                            )}
                        />
                    </div>

                    <div className="w-full space-y-4">
                        <Textarea
                            placeholder={t("mood.placeholder")}
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            rows={2}
                            className={cn("border-0 resize-none focus-visible:ring-2 focus-visible:ring-primary/10 text-center text-lg p-4",
                                theme === 'ocean' ? "bg-slate-900/50 text-white placeholder:text-slate-500 rounded-xl" : 
                                theme === 'ink' ? "bg-gray-100 text-black rounded-lg border-2 border-gray-200" :
                                theme === 'zen' ? "bg-gray-50 border border-gray-200 focus:bg-white transition-all rounded-xl" :
                                "bg-white/50 rounded-2xl"
                            )}
                        />
                        
                        <Button 
                            onClick={handleSave} 
                            className={cn("w-full h-14 text-xl font-bold transition-all hover:scale-[1.02] active:scale-[0.98]", 
                                getButtonClass(),
                                theme === 'pastel' && "rounded-2xl",
                                theme === 'ocean' && "rounded-2xl"
                            )}
                        >
                            {t("mood.saveRecord")}
                        </Button>
                    </div>
                 </CardContent>
            </Card>
          </div>

          {/* Right Column: Mood Journey & Recommendations */}
          <div className="flex flex-col gap-8 h-full">
            
            {/* Mood Journey Card */}
            <Card className={cn("border-0 overflow-hidden relative flex-1 min-h-[380px]", 
                theme === 'ocean' ? "bg-slate-800 shadow-xl rounded-[2.5rem] border border-white/5" :
                theme === 'ink' ? "bg-white border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-xl" :
                theme === 'zen' ? "bg-white border border-gray-100 shadow-xl shadow-emerald-50/50 rounded-3xl" :
                "bg-[#FFF8F0] shadow-lg rounded-[3rem]"
            )}>
                <CardContent className="p-0 h-full relative">
                    {/* Top Left: Title */}
                    <div className="absolute top-8 left-8 z-10">
                        <h4 className={cn("font-bold text-xl", theme === 'ocean' ? "text-white" : theme === 'zen' ? "text-emerald-950" : "")}>Weekly Mood Journey</h4>
                    </div>

                    {/* Center: Animated 3D Liquid Heart */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 flex items-center justify-center z-0">
                         <svg viewBox="0 0 24 24" className="w-full h-full drop-shadow-2xl overflow-visible">
                            <defs>
                                <path id="heartPath" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                                
                                <clipPath id="heartClip">
                                    <use href="#heartPath" />
                                </clipPath>

                                {/* 3D Shine Gradient */}
                                <linearGradient id="glassShine" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="white" stopOpacity="0.9" />
                                    <stop offset="20%" stopColor="white" stopOpacity="0.4" />
                                    <stop offset="50%" stopColor="white" stopOpacity="0.1" />
                                    <stop offset="100%" stopColor="white" stopOpacity="0" />
                                </linearGradient>
                            </defs>

                            {/* Container Base (Background) */}
                            <use href="#heartPath" 
                                className={theme === 'ocean' ? "fill-slate-700" : (theme === 'ink' ? "fill-white" : theme === 'zen' ? "fill-gray-50" : "fill-gray-100")} 
                                stroke={theme === 'ink' ? "black" : "rgba(0,0,0,0.05)"} 
                                strokeWidth={theme === 'ink' ? "1" : "0.5"} 
                            />

                            {/* Liquid Animation Group */}
                            <g clipPath="url(#heartClip)">
                                {/* Back Wave (Slower, Lighter) */}
                                <path 
                                    fill={theme === 'ocean' ? "#0891b2" : (theme === 'ink' ? "#333" : theme === 'zen' ? "#a7f3d0" : "#FCD34D")} 
                                    fillOpacity={theme === 'ink' ? "0.3" : "0.6"}
                                    d="M0 0 Q 6 -1.5 12 0 T 24 0 T 36 0 T 48 0 V 40 H 0 Z"
                                >
                                    <animateTransform 
                                        attributeName="transform" 
                                        type="translate" 
                                        from={`0 ${liquidY}`} 
                                        to={`-24 ${liquidY}`} 
                                        dur="6s" 
                                        repeatCount="indefinite" 
                                    />
                                </path>

                                {/* Front Wave (Faster, Vibrant) */}
                                <path 
                                    fill={theme === 'ink' ? "black" : "url(#heartGrad)"} 
                                    d="M0 0 Q 6 2 12 0 T 24 0 T 36 0 T 48 0 V 40 H 0 Z"
                                >
                                    <linearGradient id="heartGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                                        <stop offset="0%" stopColor={theme === 'ocean' ? "#06b6d4" : theme === 'zen' ? "#34d399" : "#fbbf24"} />
                                        <stop offset="100%" stopColor={theme === 'ocean' ? "#2563eb" : theme === 'zen' ? "#059669" : "#d97706"} />
                                    </linearGradient>
                                    <animateTransform 
                                        attributeName="transform" 
                                        type="translate" 
                                        from={`-5 ${liquidY}`} 
                                        to={`-29 ${liquidY}`} 
                                        dur="4s" 
                                        repeatCount="indefinite" 
                                    />
                                </path>
                            </g>

                            {/* 3D Glass Overlay (Shine) - Only for non-Ink themes */}
                            {theme !== 'ink' && <use href="#heartPath" fill="url(#glassShine)" style={{ mixBlendMode: 'overlay' }} />}
                            
                            {/* Rim Highlight */}
                            <use href="#heartPath" fill="none" stroke={theme === 'ink' ? "black" : "white"} strokeWidth={theme === 'ink' ? "2" : "0.3"} strokeOpacity={theme === 'ink' ? "1" : "0.8"} />
                         </svg>
                         
                         <div className="absolute inset-0 flex flex-col items-center justify-center pt-2">
                             <span className={cn("text-6xl font-black filter", 
                                theme === 'ink' ? "text-white mix-blend-difference" : 
                                theme === 'zen' ? "text-white drop-shadow-md" :
                                "text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]"
                             )}>{moodPercentage}%</span>
                             <span className={cn("text-sm font-bold mt-1 px-3 py-1 rounded-full",
                                theme === 'ocean' ? "text-slate-200 bg-slate-900/50 border border-slate-700" :
                                theme === 'ink' ? "text-black bg-white border border-black" :
                                theme === 'zen' ? "text-emerald-800 bg-white/80 backdrop-blur-sm border border-emerald-100" :
                                "text-white/90 drop-shadow-md bg-black/10 backdrop-blur-sm border border-white/20"
                             )}>
                                {moodStatus.split(' ')[1] || 'Okay'}
                             </span>
                         </div>
                    </div>

                    {/* Bottom Left: Button */}
                    <div className="absolute bottom-8 left-8 z-10">
                        <Button 
                            variant="secondary" 
                            className={cn("rounded-full w-16 h-16 p-0 shadow-xl transition-all flex items-center justify-center",
                                theme === 'ocean' ? "bg-slate-700 hover:bg-slate-600 hover:scale-110" :
                                theme === 'ink' ? "bg-white border-2 border-black hover:bg-gray-100 hover:shadow-none translate-x-0 translate-y-0 active:translate-x-1 active:translate-y-1" :
                                theme === 'zen' ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100 shadow-none border border-emerald-100" :
                                "bg-white hover:bg-gray-50 hover:scale-110"
                            )}
                            onClick={() => setIsJourneyOpen(true)}
                            aria-label="View Insights"
                        >
                            <TrendingUp className={cn("w-8 h-8", 
                                theme === 'ocean' ? "text-cyan-400" : 
                                theme === 'ink' ? "text-black" : 
                                theme === 'zen' ? "text-emerald-600" :
                                "text-[#8B5CF6]"
                            )} />
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Recommended for You */}
            <div className="flex flex-col gap-5">
                <div className="flex items-center justify-between"> 
                    <h3 className={cn("font-bold text-xl", theme === 'ocean' ? "text-white" : theme === 'zen' ? "text-slate-800" : "")}>Recommended for You</h3>
                </div>

                <div className="flex flex-col gap-4">
                    {recommendations.map((rec, index) => (
                        <Card key={index} className={cn("transition-all shrink-0 relative isolate", 
                            theme === 'ink' ? "border-2 border-black rounded-xl hover:translate-x-1 hover:translate-y-[-4px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" : 
                            theme === 'zen' ? "bg-white border border-gray-100 shadow-sm hover:shadow-md rounded-2xl" :
                            "border-0 shadow-sm overflow-hidden group cursor-pointer hover:shadow-lg hover:scale-[1.02] rounded-[2rem]",
                        )} style={rec.style}>
                            
                            {/* Inner white glow border effect - Only for Pastel */}
                            {theme === 'pastel' && <div className="absolute inset-0 border border-white/40 rounded-[2rem] pointer-events-none z-20"></div>}

                            <div className={cn("p-5 flex items-center h-full relative z-10")}>
                                <div className="flex items-center gap-5 w-full">
                                    <div className={cn("w-14 h-14 flex items-center justify-center text-xl shrink-0 transition-transform duration-300 group-hover:scale-110",
                                        theme === 'ocean' ? "bg-slate-800/80 rounded-2xl text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)] border border-white/10" :
                                        theme === 'ink' ? "bg-black text-white rounded-lg border-2 border-transparent" :
                                        theme === 'zen' ? "bg-gray-50 text-emerald-600 rounded-xl" :
                                        "bg-white/60 backdrop-blur-md rounded-2xl shadow-sm border border-white/40"
                                    )}>
                                        {rec.icon}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className={cn("font-bold text-lg leading-tight mb-1 truncate",
                                            theme === 'ocean' ? "text-white drop-shadow-md" : 
                                            theme === 'ink' ? "text-black" :
                                            theme === 'zen' ? "text-slate-800" :
                                            "text-gray-800/90 drop-shadow-sm"
                                        )}>{rec.title}</h4>
                                        <div className="flex items-center gap-2">
                                            <span className={cn("px-2 py-0.5 font-bold uppercase tracking-wider text-[10px]",
                                                theme === 'ocean' ? "bg-slate-900/60 text-cyan-300 rounded-md border border-cyan-500/30" :
                                                theme === 'ink' ? "bg-black text-white rounded-none" :
                                                theme === 'zen' ? "bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-md" :
                                                "rounded-md bg-white/40 backdrop-blur-md text-gray-700/80 border border-white/20 shadow-sm"
                                            )}>
                                                {rec.subtitle.split('•')[0].trim()}
                                            </span>
                                            <span className={cn("text-xs font-bold",
                                                theme === 'ocean' ? "text-slate-400" :
                                                theme === 'ink' ? "text-gray-600" :
                                                theme === 'zen' ? "text-slate-400" :
                                                "text-gray-700/60"
                                            )}>
                                                {rec.subtitle.split('•')[1]?.trim() || '15 min'}
                                            </span>
                                        </div>
                                    </div>
                                    <ChevronRight className={cn("w-5 h-5 transition-transform group-hover:translate-x-1",
                                        theme === 'ocean' ? "text-cyan-500" :
                                        theme === 'ink' ? "text-black" :
                                        theme === 'zen' ? "text-emerald-500" :
                                        "text-gray-600/40"
                                    )} />
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
          </div>
        {/* Mood Journey Dialog */}
      <Dialog open={isJourneyOpen} onOpenChange={setIsJourneyOpen}>
        <DialogContent className={cn("max-w-3xl border-0 p-8 shadow-2xl overflow-hidden", 
            theme === 'ocean' ? "bg-slate-900/90 backdrop-blur-xl border border-white/10 text-white" : 
            theme === 'ink' ? "bg-white border-4 border-black text-black rounded-xl" : 
            theme === 'zen' ? "bg-white/95 backdrop-blur-xl border border-gray-100 text-slate-800 rounded-3xl" :
            "bg-white/90 backdrop-blur-xl rounded-3xl"
        )}>
            <DialogHeader className="mb-6">
                <DialogTitle className={cn("text-3xl font-bold", 
                    theme === 'ocean' ? "text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500" : 
                    theme === 'ink' ? "text-black uppercase tracking-widest" :
                    theme === 'zen' ? "text-emerald-800" :
                    "text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600"
                )}>Weekly Mood Analysis</DialogTitle>
                <DialogDescription className={cn("text-lg", theme === 'ocean' ? "text-slate-400" : "text-muted-foreground")}>
                    Here's how your mood has been fluctuating over the past week.
                </DialogDescription>
            </DialogHeader>
            
            <div className={cn("h-[350px] w-full mt-4 rounded-2xl p-4 transition-all", 
                theme === 'ocean' ? "bg-slate-800/50" : 
                theme === 'ink' ? "bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" :
                theme === 'zen' ? "bg-emerald-50/50 border border-emerald-100" :
                "bg-white/50 shadow-inner"
            )}>
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={weekDays.map(day => {
                        const dayStr = format(day, 'yyyy-MM-dd');
                        const entry = moods.find(m => m.date === dayStr);
                        return {
                            date: format(day, 'EEE'),
                            mood: entry ? entry.mood : 0 // 0 for missing data
                        };
                    })}>
                        <defs>
                            <linearGradient id="moodGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={theme === 'ocean' ? "#06b6d4" : theme === 'ink' ? "#000" : theme === 'zen' ? "#10b981" : "#8b5cf6"} stopOpacity={0.8}/>
                                <stop offset="95%" stopColor={theme === 'ocean' ? "#06b6d4" : theme === 'ink' ? "#000" : theme === 'zen' ? "#10b981" : "#8b5cf6"} stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <XAxis 
                            dataKey="date" 
                            stroke={theme === 'ocean' ? "#94a3b8" : "#888888"}
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            dy={10}
                        />
                        <YAxis
                            stroke={theme === 'ocean' ? "#94a3b8" : "#888888"}
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            domain={[0, 10]}
                            ticks={[0, 2, 4, 6, 8, 10]}
                            dx={-10}
                        />
                        <CartesianGrid strokeDasharray={theme === 'ink' ? "0" : "3 3"} vertical={false} stroke={theme === 'ocean' ? "#334155" : theme === 'ink' ? "#e5e5e5" : "#e5e7eb"} />
                        <Tooltip
                            contentStyle={{ 
                                backgroundColor: theme === 'ocean' ? '#1e293b' : '#fff',
                                borderColor: theme === 'ocean' ? '#334155' : theme === 'ink' ? '#000' : '#e5e7eb',
                                color: theme === 'ocean' ? '#fff' : '#000',
                                borderRadius: theme === 'ink' ? '0px' : '12px',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                border: theme === 'ink' ? '2px solid black' : '1px solid #e5e7eb'
                            }}
                            cursor={{ stroke: theme === 'ocean' ? '#06b6d4' : theme === 'ink' ? '#000' : '#8b5cf6', strokeWidth: 2 }}
                        />
                        <Area 
                            type="monotone" 
                            dataKey="mood" 
                            stroke={theme === 'ocean' ? "#06b6d4" : theme === 'ink' ? "#000" : theme === 'zen' ? "#10b981" : "#8b5cf6"} 
                            fillOpacity={1} 
                            fill="url(#moodGradient)" 
                            strokeWidth={3}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
            
            <div className="grid grid-cols-3 gap-6 mt-8">
                {[
                    { label: "Average", value: weekMoods.length > 0 ? (weekMoods.reduce((a, b) => a + b.mood, 0) / weekMoods.length).toFixed(1) : "-" },
                    { label: "High", value: weekMoods.length > 0 ? Math.max(...weekMoods.map(m => m.mood)) : "-" },
                    { label: "Low", value: weekMoods.length > 0 ? Math.min(...weekMoods.map(m => m.mood)) : "-" }
                ].map((stat, i) => (
                    <div key={i} className={cn("p-6 rounded-2xl text-center transition-all", 
                        theme === 'ocean' ? "bg-slate-800/50 border border-white/5" : 
                        theme === 'ink' ? "bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]" : 
                        theme === 'zen' ? "bg-emerald-50/50 border border-emerald-100" :
                        "bg-gray-50/80 hover:bg-white hover:shadow-lg"
                    )}>
                        <div className={cn("text-sm font-bold uppercase tracking-wider mb-2", theme === 'ocean' ? "text-slate-400" : "text-muted-foreground")}>{stat.label}</div>
                        <div className={cn("text-4xl font-black", theme === 'ocean' ? "text-white" : "text-foreground")}>{stat.value}</div>
                    </div>
                ))}
            </div>
        </DialogContent>
      </Dialog>
    </div>
    </div>
    </div>
  );
}