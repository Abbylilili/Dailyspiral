import type { FC } from 'react';
import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Heart, Star } from "lucide-react";
import { useTheme } from "@/app/contexts/ThemeContext";
import { useLanguage } from "@/app/contexts/LanguageContext";
import { cn } from "@/app/components/ui/utils";
import { getMoodConfig } from "@/app/lib/moodConfig";
import { getGenderPreference, saveMood } from "@/app/lib/storage";
import { toast } from "sonner";

interface QuickEntryMoodProps {
  initialMood?: number;
  date: string;
  onRefresh?: () => void;
}

const QuickEntryMood: FC<QuickEntryMoodProps> = ({ initialMood = 5, date, onRefresh }) => {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const [mood, setMood] = useState(initialMood);
  const [isPressing, setIsPressing] = useState(false);
  const [gender] = useState<'boy' | 'girl'>(() => {
    const pref = getGenderPreference();
    return (pref === 'boy' || pref === 'girl') ? pref : 'girl';
  });
  const moodConfig = getMoodConfig(mood);

  useEffect(() => {
    setMood(initialMood);
  }, [initialMood, date]);

  const handleSave = async () => {
    await saveMood({ id: date, date, mood, note: "" });
    toast.success(t("mood.saved"));
    onRefresh?.();
  };

  const getCardClass = () => {
    switch(theme) {
        case 'ocean': return "bg-slate-800/50 border-0 text-white backdrop-blur-xl shadow-xl";
        case 'ink': return "bg-white border-2 border-black text-black shadow-[6px_6px_0px_0px_black]";
        case 'zen': return "bg-white border-0 shadow-lg shadow-emerald-50/50";
        default: return "glass-card border-0 bg-white/70 shadow-xl";
    }
  };

  // 计算星星的位置百分比 (1-10 映射到 0-100)
  const progressPercent = ((mood - 1) / 9) * 100;

  return (
    <Card className={cn("rounded-[2.5rem] overflow-hidden transition-all duration-300 hover:shadow-2xl h-full min-h-[380px] flex flex-col", getCardClass())}>
      <CardContent className="p-8 pt-10 pb-10 flex-1 flex flex-col">
        <div className="flex justify-between items-start h-16">
          <div>
            <h3 className="font-black text-2xl uppercase tracking-tighter leading-none">{t("home.recordMood")}</h3>
          </div>
          <div className="text-4xl font-black tracking-tighter leading-none">{mood}<span className="text-sm opacity-30">/10</span></div>
        </div>

        <div className="flex flex-col items-center gap-6 mt-2 mb-8 px-2">
          <div className={cn("w-24 h-24 rounded-full overflow-hidden shadow-lg border-2 border-white transition-all duration-500", moodConfig.color)}>
            {moodConfig.illustration ? (
              <img src={moodConfig.illustration[gender]} className="w-full h-full object-cover" alt="Mood" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-4xl">{moodConfig.emoji}</div>
            )}
          </div>
          
          <div className="relative w-full h-10 flex items-center mt-2">
            <input 
              type="range" min="1" max="10" step="1" value={mood} 
              onChange={(e) => setMood(parseInt(e.target.value))}
              onMouseDown={() => setIsPressing(true)}
              onMouseUp={() => setIsPressing(false)}
              onTouchStart={() => setIsPressing(true)}
              onTouchEnd={() => setIsPressing(false)}
              className="mood-slider absolute inset-0 z-20 w-full h-full cursor-pointer"
              style={{ "--range-progress": `${progressPercent}%` } as any}
            />
            
            <div 
              className="absolute pointer-events-none transition-all duration-150 ease-out z-30 flex items-center justify-center"
              style={{ 
                left: `calc(${progressPercent}% - 12px)`, 
                width: '24px',
                height: '24px'
              }}
            >
              <Star 
                className={cn(
                  "w-6 h-6 fill-yellow-400 stroke-none drop-shadow-[0_0_8px_rgba(250,204,21,0.6)] transition-transform duration-200",
                  isPressing ? "scale-125" : "scale-100"
                )} 
              />
            </div>
          </div>
        </div>

        <Button onClick={handleSave} className="w-full h-14 bg-black hover:bg-gray-800 text-white rounded-2xl font-black text-xs tracking-widest uppercase shadow-lg transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 mt-auto">
          <Heart className="w-5 h-5 fill-current" />
          {t("mood.saveRecord")}
        </Button>
      </CardContent>
    </Card>
  );
};

export default QuickEntryMood;
