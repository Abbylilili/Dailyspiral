import type { FC } from 'react';
import { useState, useEffect } from 'react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from 'date-fns';
import { toast } from 'sonner';
import { Calendar as CalendarIcon } from 'lucide-react';
import useMoods from './hooks/useMoods';
import MoodLogger from './components/MoodLogger';
import LiquidHeart from './animations/LiquidHeart';
import { getRecommendations } from './utils/recommendations';
import { useTheme } from '@/app/contexts/ThemeContext';
import { getGenderPreference, saveGenderPreference } from '@/app/lib/storage';
import { Card, CardContent } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/app/components/ui/popover';
import { Calendar } from '@/app/components/ui/calendar';
import { cn } from '@/app/components/ui/utils';
import { getMoodConfig } from '@/app/lib/moodConfig';

const Mood: FC = () => {
  const { theme } = useTheme();
  const { data: moods, addMood, isLoading } = useMoods();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [mood, setMood] = useState(5);
  const [note, setNote] = useState("");
  const [gender, setGender] = useState<'boy' | 'girl'>(() => getGenderPreference() || 'girl');

  const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');

  useEffect(() => {
    const entry = moods.find(m => m.date === selectedDateStr);
    if (entry) { setMood(entry.mood); setNote(entry.note || ""); } 
    else { setMood(5); setNote(""); }
  }, [selectedDateStr, moods]);

  const handleSave = async () => {
    await addMood({ id: selectedDateStr, date: selectedDateStr, mood, note });
    toast.success("Mood saved!");
  };

  const updateGender = (g: 'boy' | 'girl') => { setGender(g); saveGenderPreference(g); };

  // No loading guard

  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });
  const recs = getRecommendations(mood, theme);

  return (
    <div className="space-y-8 max-w-6xl mx-auto p-8">
      <div className="flex items-center justify-between">
        <h2 className={cn("text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600")}>How are you?</h2>
        <Popover>
          <PopoverTrigger asChild><Button variant="outline" className="rounded-full h-12 w-12 p-0 border-0 shadow-sm"><CalendarIcon className="w-5 h-5" /></Button></PopoverTrigger>
          <PopoverContent className="w-auto p-0 border-0 shadow-2xl" align="end"><Calendar mode="single" selected={selectedDate} onSelect={(d) => d && setSelectedDate(d)} initialFocus /></PopoverContent>
        </Popover>
      </div>
      
      <div className="grid md:grid-cols-2 gap-10">
        <div className="flex flex-col gap-8">
            <Card className={cn("border-0 p-8 glass-card bg-white/70 rounded-[2.5rem] shadow-xl")}>
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-xl">Mood History</h3>
                    <div className="flex p-1 bg-white/60 rounded-full border border-white/40 shadow-sm">
                        {['girl', 'boy'].map(g => ( <button key={g} onClick={() => updateGender(g as any)} className={cn("px-3 py-1 rounded-full text-xs font-bold transition-all", gender === g ? "bg-white text-pink-500 shadow-sm" : "opacity-50")}>{g.charAt(0).toUpperCase() + g.slice(1)}</button> ))}
                    </div>
                </div>
                <div className="grid grid-cols-7 gap-3">
                    {weekDays.map(day => {
                        const dayStr = format(day, 'yyyy-MM-dd');
                        const dayEntry = moods.find(m => m.date === dayStr);
                        const isSelected = isSameDay(day, selectedDate);
                        const dayConfig = dayEntry ? getMoodConfig(dayEntry.mood) : null;
                        return (
                            <div key={dayStr} onClick={() => setSelectedDate(day)} className={cn("flex flex-col items-center gap-3 cursor-pointer transition-all", isSelected ? "scale-110" : "opacity-70")}>
                                <div className={cn("w-12 h-12 flex items-center justify-center text-xl shadow-sm rounded-2xl overflow-hidden", isSelected && "ring-2 ring-purple-400")}>
                                    {dayConfig ? (dayConfig.illustration ? <img src={dayConfig.illustration[gender]} className="w-full h-full object-cover" /> : dayConfig.emoji) : <span className="text-gray-300 text-sm">•</span>}
                                </div>
                                <span className="text-[10px] font-bold opacity-60 uppercase">{format(day, 'EEE')}</span>
                            </div>
                        );
                    })}
                </div>
            </Card>
            <MoodLogger mood={mood} note={note} gender={gender} onMoodChange={setMood} onNoteChange={setNote} onSave={handleSave} />
        </div>

        <div className="flex flex-col gap-8">
          <Card className="relative flex-1 min-h-[380px] bg-[#FFF8F0] border-0 rounded-[3rem] shadow-lg overflow-hidden">
            <CardContent className="p-0 h-full relative">
              <div className="absolute top-8 left-8 z-10"><h4 className="font-bold text-xl">Weekly Mood Journey</h4></div>
              <LiquidHeart percentage={mood * 10} status={mood >= 8 ? "Amazing" : mood >= 5 ? "Good" : "Rough"} />
            </CardContent>
          </Card>
          <div className="space-y-4">
            <h3 className="font-bold text-xl">Recommended for You</h3>
            <div className="grid gap-4">
              {recs.map((rec, i) => (
                <div key={i} className="p-5 flex items-center gap-5 bg-white rounded-[2rem] shadow-sm border border-white/40 hover:scale-[1.02] transition-all cursor-pointer" style={rec.style}>
                  <div className="w-14 h-14 flex items-center justify-center bg-white/60 rounded-2xl shadow-sm">{rec.icon}</div>
                  <div><h4 className="font-bold text-lg">{rec.title}</h4><p className="text-xs font-bold opacity-60">{rec.subtitle}</p></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Mood;
