import type { FC } from 'react';
import { useState, useEffect } from 'react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from 'date-fns';
import { toast } from 'sonner';
import { Calendar as CalendarIcon, TrendingUp, BarChart2 } from 'lucide-react';
import { ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, AreaChart, Area } from 'recharts';
import useMoods from '@/app/pages/Mood/hooks/useMoods/useMoods';
import MoodLogger from '@/app/pages/Mood/components/MoodLogger/MoodLogger';
import LiquidHeart from '@/app/pages/Mood/animations/LiquidHeart/LiquidHeart';
import { getRecommendations } from '@/app/pages/Mood/utils/recommendations/recommendations';
import { useTheme } from '@/app/contexts/ThemeContext';
import { getGenderPreference, saveGenderPreference } from '@/app/lib/storage';
import { Card, CardContent } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/app/components/ui/popover';
import { Calendar } from '@/app/components/ui/calendar';
import { cn } from '@/app/components/ui/utils';
import { getMoodConfig } from '@/app/lib/moodConfig';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';

const Mood: FC = () => {
  const { theme } = useTheme();
  const { data: moods, addMood, isLoading } = useMoods();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [mood, setMood] = useState(5);
  const [note, setNote] = useState("");
  const [gender, setGender] = useState<'boy' | 'girl'>(() => getGenderPreference() || 'girl');
  const [isTrendOpen, setIsTrendOpen] = useState(false);

  // Preload mood illustrations for instant rendering
  useEffect(() => {
    [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].forEach(score => {
      const config = getMoodConfig(score);
      if (config.illustration) {
        const imgBoy = new Image(); imgBoy.src = config.illustration.boy;
        const imgGirl = new Image(); imgGirl.src = config.illustration.girl;
      }
    });
  }, []);

  const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
  const todayStr = format(new Date(), 'yyyy-MM-dd');

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

  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });
  const recs = getRecommendations(mood, theme);

  const trendData = weekDays.map(day => {
      const dStr = format(day, 'yyyy-MM-dd');
      const entry = moods.find(m => m.date === dStr);
      return {
          day: format(day, 'EEE'),
          mood: entry ? entry.mood : null,
      };
  });

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
                        const isFuture = dayStr > todayStr;
                        const dayEntry = moods.find(m => m.date === dayStr);
                        const isSelected = isSameDay(day, selectedDate);
                        const dayConfig = dayEntry ? getMoodConfig(dayEntry.mood) : null;
                        return (
                            <div 
                              key={dayStr} 
                              onClick={() => !isFuture && setSelectedDate(day)} 
                              className={cn(
                                "flex flex-col items-center gap-3 transition-all", 
                                isFuture ? "opacity-20 cursor-not-allowed grayscale pointer-events-none" : "cursor-pointer",
                                isSelected ? "scale-110" : "opacity-70"
                              )}
                            >
                                <div className={cn("w-12 h-12 flex items-center justify-center text-xl shadow-sm rounded-2xl overflow-hidden", isSelected && "ring-2 ring-purple-400")}>
                                    {dayConfig ? (dayConfig.illustration ? <img src={dayConfig.illustration[gender]} className="w-full h-full object-cover" decoding="async" loading="eager" /> : dayConfig.emoji) : <span className="text-gray-300 text-sm">•</span>}
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

              <Button 
                onClick={() => setIsTrendOpen(true)}
                variant="ghost" 
                size="sm"
                className="absolute bottom-6 left-8 z-20 rounded-full bg-white/50 backdrop-blur-md hover:bg-white/80 transition-all shadow-sm"
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                Mood Trend
              </Button>
            </CardContent>
          </Card>

          <Dialog open={isTrendOpen} onOpenChange={setIsTrendOpen}>
            <DialogContent className="max-w-2xl bg-white/90 backdrop-blur-2xl border-0 rounded-[2.5rem] p-8 shadow-2xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-black tracking-tight mb-4 flex items-center gap-2">
                  <TrendingUp className="text-purple-500" />
                  Weekly Mood Analysis
                </DialogTitle>
              </DialogHeader>
              <div className="h-[300px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorMood" x1="0" y1="0" x2="0" y2="100%">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                    <XAxis 
                        dataKey="day" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fontSize: 12, fontWeight: '600', fill: '#6b7280'}}
                        interval={0}
                    />
                    <YAxis domain={[0, 10]} axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: '600', fill: '#6b7280'}} ticks={[0, 2, 4, 6, 8, 10]} />
                    <Tooltip 
                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)', padding: '12px' }}
                        itemStyle={{ fontWeight: 'bold', color: '#8b5cf6' }}
                        cursor={{ stroke: '#8b5cf6', strokeWidth: 2, strokeDasharray: '5 5' }}
                    />
                    <Area 
                        type="monotone" 
                        dataKey="mood" 
                        stroke="#8b5cf6" 
                        strokeWidth={4} 
                        fillOpacity={1} 
                        fill="url(#colorMood)" 
                        dot={{ r: 6, fill: '#8b5cf6', strokeWidth: 2, stroke: '#fff' }} 
                        activeDot={{ r: 8, strokeWidth: 0 }}
                        connectNulls
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-6 p-4 bg-purple-50 rounded-2xl border border-purple-100">
                <p className="text-sm text-purple-900 font-medium leading-relaxed">
                  ✨ Your average mood this week is <span className="font-bold">{(moods.filter(m => weekDays.some(wd => format(wd, 'yyyy-MM-dd') === m.date)).reduce((acc, curr) => acc + curr.mood, 0) / (moods.filter(m => weekDays.some(wd => format(wd, 'yyyy-MM-dd') === m.date)).length || 1)).toFixed(1)}/10</span>. Keep tracking to see more insights!
                </p>
              </div>
            </DialogContent>
          </Dialog>

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
