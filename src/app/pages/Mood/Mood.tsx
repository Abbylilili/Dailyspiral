import type { FC } from 'react';
import { useState, useEffect, useMemo } from 'react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, parseISO } from 'date-fns';
import { zhCN, enUS } from 'date-fns/locale';
import { toast } from 'sonner';
import { Calendar as CalendarIcon, TrendingUp, Music, Sparkles, Activity, Phone, Coffee } from 'lucide-react';
import { ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, AreaChart, Area } from 'recharts';
import useMoods from '@/app/pages/Mood/hooks/useMoods/useMoods';
import MoodLogger from '@/app/pages/Mood/components/MoodLogger/MoodLogger';
import LiquidHeart from '@/app/pages/Mood/animations/LiquidHeart/LiquidHeart';
import { getRecommendations } from '@/app/pages/Mood/utils/recommendations/recommendations';
import { useTheme } from '@/app/contexts/ThemeContext';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { getGenderPreference, saveGenderPreference } from '@/app/lib/storage';
import { Card, CardContent } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/app/components/ui/popover';
import { Calendar } from '@/app/components/ui/calendar';
import { cn } from '@/app/components/ui/utils';
import { getMoodConfig } from '@/app/lib/moodConfig';
import { Dialog } from '@/app/components/ui/dialog';
import { getDailyContent } from '@/app/services/ai';

const Mood: FC = () => {
  const { theme } = useTheme();
  const { t, language } = useLanguage();
  const locale = language === 'zh' ? zhCN : enUS;
  const { data: moods, addMood } = useMoods();
  
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [mood, setMood] = useState(5);
  const [note, setNote] = useState("");
  const [gender, setGender] = useState<'boy' | 'girl'>(() => getGenderPreference() || 'girl');
  const [isTrendOpen, setIsTrendOpen] = useState(false);
  const [aiMusic, setAiMusic] = useState<any[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
  const todayStr = format(new Date(), 'yyyy-MM-dd');

  useEffect(() => {
    const entry = moods.find(m => m.date === selectedDateStr);
    if (entry) { setMood(entry.mood); setNote(entry.note || ""); } 
    else { setMood(5); setNote(""); }
    setAiMusic([]); 
  }, [selectedDateStr, moods]);

  const handleSave = async () => {
    await addMood({ id: selectedDateStr, date: selectedDateStr, mood, note });
    toast.success(t("mood.saved"));
    setIsAiLoading(true);
    try {
      const { data } = await getDailyContent({
        lang: language === 'zh' ? 'zh-CN' : 'en',
        userData: { mood, note, completion: 0.5 }
      });
      if (data?.music) setAiMusic(data.music);
    } catch (err) {
      console.warn("AI logic not ready, using fallback");
    } finally {
      setIsAiLoading(false);
    }
  };

  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });
  const staticRecs = getRecommendations(mood, theme, t);

  const trendData = weekDays.map(day => {
      const dStr = format(day, 'yyyy-MM-dd');
      const entry = moods.find(m => m.date === dStr);
      return { date: dStr, mood: entry ? entry.mood : null };
  });

  // Enhanced dynamic fallback recommendations
  const dynamicRecs = useMemo(() => {
    const isZh = language === 'zh';
    if (mood <= 3) return [
      { icon: <Music className="text-indigo-500" />, title: isZh ? "《Comforting Sounds》" : "Comforting Sounds", subtitle: isZh ? "音乐 • 舒缓" : "Music • Soothing", artist: "Chill Mix" },
      { icon: <Coffee className="text-stone-500" />, title: isZh ? "深呼吸练习" : "Deep Breathing", subtitle: isZh ? "身心健康 • 5分钟" : "Wellness • 5 min" }
    ];
    if (mood <= 7) return [
      { icon: <Music className="text-blue-500" />, title: isZh ? "《Focus Beats》" : "Focus Beats", subtitle: isZh ? "音乐 • 专注" : "Music • Focus", artist: "Lofi Girl" },
      { icon: <Activity className="text-emerald-500" />, title: isZh ? "公园漫步" : "Short Walk", subtitle: isZh ? "健康 • 15分钟" : "Health • 15 min" }
    ];
    return [
      { icon: <Music className="text-pink-500" />, title: isZh ? "《Golden Hour》" : "Golden Hour", subtitle: isZh ? "音乐 • 能量" : "Music • Energy", artist: "JVKE" },
      { icon: <Activity className="text-rose-500" />, title: isZh ? "燃脂拉伸" : "Quick Workout", subtitle: isZh ? "健身 • 20分钟" : "Fitness • 20 min" }
    ];
  }, [mood, language]);

  const getCardClass = () => {
    switch(theme) {
        case 'ocean': return "bg-slate-800/50 border-0 text-white backdrop-blur-xl shadow-xl";
        case 'ink': return "bg-white border-2 border-black text-black shadow-[6px_6px_0px_0px_black]";
        case 'zen': return "bg-white border-0 shadow-lg shadow-emerald-50/50";
        default: return "glass-card border-0 bg-white/70 shadow-xl";
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto p-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <h2 className={cn("text-4xl font-black tracking-tighter uppercase bg-clip-text text-transparent",
          theme === 'ocean' ? "bg-gradient-to-r from-cyan-400 to-blue-500" :
          theme === 'ink' ? "text-black" : "bg-gradient-to-r from-purple-600 to-pink-600"
        )}>{t("mood.howAreYou")}</h2>
        <Popover>
          <PopoverTrigger asChild><Button variant="outline" className="rounded-full h-12 w-12 p-0 border-0 shadow-sm bg-white transition-transform hover:scale-110 active:scale-90"><CalendarIcon className="w-5 h-5 text-black" /></Button></PopoverTrigger>
          <PopoverContent className="w-auto p-0 border-0 shadow-2xl" align="end">
            <Calendar mode="single" selected={selectedDate} onSelect={(d: Date | undefined) => d && setSelectedDate(d)} initialFocus />
          </PopoverContent>
        </Popover>
      </div>
      
      <div className="grid md:grid-cols-2 gap-10">
        <div className="flex flex-col gap-8">
            <Card className={cn("p-8 rounded-[2.5rem]", getCardClass())}>
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-black text-xl uppercase tracking-tighter">{t("mood.moodHistory")}</h3>
                    <div className={cn("flex p-1 rounded-full border shadow-sm bg-white/60")}>
                        {['girl', 'boy'].map(g => ( <button key={g} onClick={() => updateGender(g as any)} className={cn("px-4 py-1 rounded-full text-[10px] font-black uppercase transition-all", gender === g ? "bg-black text-white" : "opacity-50")}>{g === 'girl' ? '👧' : '👦'}</button> ))}
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
                            <div key={dayStr} onClick={() => !isFuture && setSelectedDate(day)} className={cn("flex flex-col items-center gap-3 transition-all", isFuture ? "opacity-20 pointer-events-none" : "cursor-pointer", isSelected ? "scale-110" : "opacity-70 hover:opacity-100")}>
                                <div className={cn("w-12 h-12 flex items-center justify-center text-xl shadow-sm rounded-2xl overflow-hidden bg-white/5 border border-white/10", isSelected && (theme === 'ocean' ? "ring-2 ring-cyan-400" : "ring-2 ring-purple-400"))}>
                                    {dayConfig ? (dayConfig.illustration ? <img src={dayConfig.illustration[gender]} className="w-full h-full object-cover" /> : dayConfig.emoji) : <span className="text-gray-300 text-sm">•</span>}
                                </div>
                                <span className="text-[10px] font-black opacity-60 uppercase">{format(day, 'EEE', { locale })}</span>
                            </div>
                        );
                    })}
                </div>
            </Card>
            <MoodLogger mood={mood} note={note} gender={gender} onMoodChange={setMood} onNoteChange={setNote} onSave={handleSave} />
        </div>

        <div className="flex flex-col gap-8">
          <Card className={cn("relative flex-1 min-h-[380px] border-0 rounded-[3rem] shadow-xl overflow-hidden", 
            theme === 'ocean' ? "bg-slate-800/50" : theme === 'zen' ? "bg-emerald-50/50" : theme === 'ink' ? "bg-white border-2 border-black" : "bg-[#FFF8F0]")}>
            <CardContent className="p-0 h-full relative">
              <div className="absolute top-8 left-8 z-10"><h4 className={cn("font-black text-xl uppercase tracking-tighter", theme === 'ocean' ? "text-white" : "text-gray-800")}>{t("mood.bestDay")}</h4></div>
              
              <LiquidHeart percentage={mood * 10} status={mood >= 8 ? "Amazing" : mood >= 5 ? "Good" : "Rough"} />

              <Button onClick={() => setIsTrendOpen(true)} className="absolute bottom-6 left-8 z-20 rounded-full bg-black hover:bg-gray-800 text-white transition-all shadow-lg font-black text-[10px] uppercase tracking-widest px-6 h-10">
                <TrendingUp className="w-3.5 h-3.5 mr-2" /> {t("mood.weeklyTrend")}
              </Button>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <h3 className="font-black text-xl uppercase tracking-tighter flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              {t("mood.dailyRecommendations")}
            </h3>
            <div className="grid gap-4">
              {isAiLoading ? (
                <div className="p-12 flex flex-col items-center justify-center bg-white/40 rounded-[2.5rem] border border-dashed border-slate-200 animate-pulse">
                  <div className="animate-spin w-8 h-8 border-4 border-slate-900 border-t-transparent rounded-full mb-4" />
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-40">{t("insights.analyzing")}</p>
                </div>
              ) : aiMusic.length > 0 ? (
                aiMusic.map((song, i) => (
                  <a key={i} href={`https://open.spotify.com/search/${encodeURIComponent(song.title + ' ' + song.artist)}`} target="_blank" rel="noreferrer" 
                     className="p-5 flex items-center gap-5 bg-white rounded-[2rem] shadow-sm border border-white/40 hover:scale-[1.02] transition-all cursor-pointer group">
                    <div className="w-14 h-14 flex items-center justify-center bg-slate-900 rounded-2xl shadow-lg group-hover:bg-green-500 transition-colors text-white text-2xl"><Music className="w-6 h-6" /></div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[9px] font-black uppercase text-blue-500 mb-1 tracking-widest">{t("mood.musicRecommendation")}</div>
                      <h4 className="font-black text-lg uppercase truncate leading-none text-slate-900">《{song.title}》</h4>
                      <p className="text-[10px] font-black uppercase opacity-40 mt-1 truncate">{song.artist}</p>
                      <p className="text-[9px] font-bold text-slate-400 mt-2 line-clamp-1 italic italic">"{song.reason}"</p>
                    </div>
                  </a>
                ))
              ) : (
                dynamicRecs.map((rec, i) => (
                  <div key={i} className="p-5 flex items-center gap-5 bg-white rounded-[2rem] shadow-sm border border-white/40 hover:scale-[1.02] transition-all">
                    <div className="w-14 h-14 flex items-center justify-center bg-slate-50 rounded-2xl shadow-inner text-2xl">{rec.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[9px] font-black uppercase text-amber-500 mb-1 tracking-widest">RECOMMENDED</div>
                      <h4 className="font-black text-lg uppercase truncate">{rec.title}</h4>
                      {rec.artist && <p className="text-[10px] font-black uppercase opacity-40">{rec.artist}</p>}
                      <p className="text-[10px] font-bold text-slate-400 mt-1">{rec.subtitle}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
      
      <Dialog open={isTrendOpen} onOpenChange={setIsTrendOpen} title={( <div className="text-2xl font-black uppercase tracking-tighter flex items-center gap-2"><TrendingUp className="text-purple-500" /> {t("mood.weeklyTrend")} </div> )} className="max-w-2xl">
        <div className="h-[300px] w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <defs><linearGradient id="colorMood" x1="0" y1="0" x2="0" y2="100%"><stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/><stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tickFormatter={(str) => format(parseISO(str), 'EEE', { locale })} tick={{fontSize: 10, fontWeight: '900', fill: '#6b7280'}} interval={0} />
              <YAxis domain={[0, 10]} axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: '900', fill: '#6b7280'}} ticks={[0, 2, 4, 6, 8, 10]} />
              <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }} labelFormatter={(str) => format(parseISO(str), 'PPPP', { locale })} itemStyle={{ fontWeight: 'bold', color: '#8b5cf6' }} />
              <Area type="monotone" dataKey="mood" stroke="#8b5cf6" strokeWidth={4} fillOpacity={1} fill="url(#colorMood)" dot={{ r: 6, fill: '#8b5cf6', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8, strokeWidth: 0 }} connectNulls />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Dialog>
    </div>
  );
};

export default Mood;
