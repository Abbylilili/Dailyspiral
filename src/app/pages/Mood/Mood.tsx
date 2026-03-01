import type { FC } from 'react';
import { useState, useEffect, useMemo, useRef, memo } from 'react';
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

// 使用 memo 保护动画组件，防止父组件 state 更新导致其重绘闪烁
const MemoizedLiquidHeart = memo(LiquidHeart);

const Mood: FC = () => {
  const { theme } = useTheme();
  const { t, language } = useLanguage();
  const locale = language === 'zh' ? zhCN : enUS;
  const { data: moods, addMood } = useMoods();
  
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [mood, setMood] = useState(5);
  const [note, setNote] = useState("");
  const [gender, setGender] = useState<'boy' | 'girl'>(() => {
    const pref = getGenderPreference();
    if (pref === 'boy' || pref === 'girl') return pref;
    return 'girl';
  });
  const [isTrendOpen, setIsTrendOpen] = useState(false);
  const [aiMusic, setAiMusic] = useState<any[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  
  const lastDateRef = useRef(selectedDateStr);

  const updateGender = (newGender: 'boy' | 'girl') => {
    setGender(newGender);
    saveGenderPreference(newGender);
  };

  useEffect(() => {
    const isDateChanged = lastDateRef.current !== selectedDateStr;
    const entry = moods.find(m => m.date === selectedDateStr);
    
    // 关键修复：只有在日期切换时才重置 AI 建议和状态
    if (isDateChanged) {
      if (entry) {
        setMood(entry.mood);
        setNote(entry.note || "");
      } else {
        setMood(5);
        setNote("");
      }
      setAiMusic([]);
      lastDateRef.current = selectedDateStr;
    }
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
      console.warn("AI logic not ready");
    } finally {
      setIsAiLoading(false);
    }
  };

  const weekStart = useMemo(() => startOfWeek(selectedDate, { weekStartsOn: 1 }), [selectedDate]);
  const weekEnd = useMemo(() => endOfWeek(selectedDate, { weekStartsOn: 1 }), [selectedDate]);
  const weekDays = useMemo(() => eachDayOfInterval({ start: weekStart, end: weekEnd }), [weekStart, weekEnd]);
  
  const staticRecs = useMemo(() => getRecommendations(mood, theme, t), [mood, theme, t]);

  const trendData = useMemo(() => weekDays.map(day => {
      const dStr = format(day, 'yyyy-MM-dd');
      const entry = moods.find(m => m.date === dStr);
      return { date: dStr, mood: entry ? entry.mood : null };
  }), [weekDays, moods]);

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
              
              <MemoizedLiquidHeart percentage={mood * 10} status={mood >= 8 ? "Amazing" : mood >= 5 ? "Good" : "Rough"} />

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
            <div className="grid gap-4 min-h-[200px] relative">
              {/* 核心修复：始终渲染内容，不进行组件替换 */}
              {aiMusic.length > 0 ? (
                aiMusic.map((song, i) => (
                  <a key={i} href={`https://open.spotify.com/search/${encodeURIComponent(song.title + ' ' + song.artist)}`} target="_blank" rel="noreferrer" 
                     className={cn(
                       "p-5 flex items-center gap-5 rounded-[2rem] shadow-sm hover:scale-[1.02] transition-all cursor-pointer group relative overflow-hidden border-0",
                       theme === 'ocean' ? "bg-slate-800/50 text-white" : 
                       theme === 'zen' ? "bg-emerald-50/50" : 
                       theme === 'ink' ? "bg-white border-2 border-black" : "bg-white"
                     )}
                     style={theme === 'pastel' ? {
                       backgroundImage: `${staticRecs[0]?.style?.backgroundImage.split(',')[0]}, linear-gradient(135deg, #f3e8ff 0%, #e0e7ff 100%)`,
                       backgroundSize: 'cover',
                       backgroundBlendMode: 'overlay, normal',
                       color: '#4F46E5'
                     } : undefined}>
                    <div className={cn(
                      "w-14 h-14 flex items-center justify-center rounded-2xl shadow-lg transition-colors text-white text-2xl z-10",
                      theme === 'ocean' ? "bg-cyan-600 group-hover:bg-cyan-500" : "bg-slate-900 group-hover:bg-green-500"
                    )}><Music className="w-6 h-6" /></div>
                    <div className="flex-1 min-w-0 z-10">
                      <div className={cn("text-[9px] font-black uppercase mb-1 tracking-widest", theme === 'ocean' ? "text-cyan-400" : "text-blue-500")}>{t("mood.musicRecommendation")}</div>
                      <h4 className={cn("font-black text-lg uppercase truncate leading-none", theme === 'ocean' ? "text-white" : "text-slate-900")}>《{song.title}》</h4>
                      <p className={cn("text-[10px] font-black uppercase mt-1 truncate", theme === 'ocean' ? "text-white/40" : "opacity-40")}>{song.artist}</p>
                      <p className={cn("text-[9px] font-bold mt-2 line-clamp-1 italic", theme === 'ocean' ? "text-white/60" : "text-slate-400")}>"{song.reason}"</p>
                    </div>
                  </a>
                ))
              ) : (
                staticRecs.map((rec, i) => (
                  <div key={i} className="p-5 flex items-center gap-5 rounded-[2rem] shadow-sm hover:scale-[1.02] transition-all relative overflow-hidden" style={rec.style}>
                    <div className="w-14 h-14 flex items-center justify-center bg-white/40 backdrop-blur-md rounded-2xl shadow-inner text-2xl z-10">{rec.icon}</div>
                    <div className="flex-1 min-w-0 z-10">
                      <div className={cn("text-[9px] font-black uppercase mb-1 tracking-widest", theme === 'ocean' ? "text-cyan-400" : "text-amber-600")}>RECOMMENDED</div>
                      <h4 className={cn("font-black text-lg uppercase truncate", theme === 'ocean' ? "text-white" : "text-slate-900")}>{rec.title}</h4>
                      <p className={cn("text-[10px] font-bold mt-1", theme === 'ocean' ? "text-white/60" : "text-slate-500")}>{rec.subtitle}</p>
                    </div>
                  </div>
                ))
              )}
              
              {/* 加载动画作为覆盖层，不破坏列表结构 */}
              {isAiLoading && (
                <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/10 backdrop-blur-[2px] rounded-[2.5rem] animate-in fade-in duration-300">
                  <div className="bg-black/80 p-4 rounded-3xl shadow-2xl flex items-center gap-3">
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                    <span className="text-[10px] font-black text-white uppercase tracking-widest">{t("insights.analyzing")}</span>
                  </div>
                </div>
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
