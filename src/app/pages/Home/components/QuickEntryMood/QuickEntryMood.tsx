import type { FC } from 'react';
import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Heart } from "lucide-react";
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
  const [gender] = useState<'boy' | 'girl'>(() => getGenderPreference() || 'girl');
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

  return (
    <Card className={cn("rounded-[2.5rem] overflow-hidden transition-all duration-300 hover:shadow-2xl h-[320px]", getCardClass())}>
      <CardContent className="p-10 h-full flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-black text-2xl uppercase tracking-tighter">{t("home.recordMood")}</h3>
            <p className="text-[11px] font-black uppercase opacity-40 tracking-widest mt-1">{t("home.mood")}</p>
          </div>
          <div className="text-4xl font-black tracking-tighter">{mood}<span className="text-sm opacity-30">/10</span></div>
        </div>

        <div className="flex flex-col items-center gap-4">
          <div className={cn("w-24 h-24 rounded-full overflow-hidden shadow-lg border-2 border-white transition-all duration-500", moodConfig.color)}>
            {moodConfig.illustration ? (
              <img src={moodConfig.illustration[gender]} className="w-full h-full object-cover" alt="Mood" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-4xl">{moodConfig.emoji}</div>
            )}
          </div>
          <input 
            type="range" min="1" max="10" step="1" value={mood} 
            onChange={(e) => setMood(parseInt(e.target.value))}
            className="w-full h-1.5 bg-black/5 rounded-lg appearance-none cursor-pointer accent-black"
          />
        </div>

        <Button onClick={handleSave} className="w-full h-14 bg-black hover:bg-gray-800 text-white rounded-2xl font-black text-xs tracking-widest uppercase shadow-lg transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 mt-2">
          <Heart className="w-5 h-5 fill-current" />
          {t("mood.saveRecord")}
        </Button>
      </CardContent>
    </Card>
  );
};

export default QuickEntryMood;
