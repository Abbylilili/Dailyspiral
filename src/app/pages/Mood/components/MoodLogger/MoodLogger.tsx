import type { FC } from 'react';
import { useState } from 'react';
import { Card, CardContent } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Textarea } from "@/app/components/ui/textarea";
import { Smile, Save, Star } from "lucide-react";
import { useTheme } from "@/app/contexts/ThemeContext";
import { useLanguage } from "@/app/contexts/LanguageContext";
import { cn } from "@/app/components/ui/utils";
import { getMoodConfig } from "@/app/lib/moodConfig";

interface MoodLoggerProps {
  mood: number;
  note: string;
  gender: 'boy' | 'girl';
  onMoodChange: (mood: number) => void;
  onNoteChange: (note: string) => void;
  onSave: () => Promise<void>;
}

const MoodLogger: FC<MoodLoggerProps> = ({ mood, note, gender, onMoodChange, onNoteChange, onSave }) => {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const moodConfig = getMoodConfig(mood);
  const [isPressing, setIsPressing] = useState(false);

  // 计算星星的位置百分比 (1-10 映射到 0-100)
  const progressPercent = ((mood - 1) / 9) * 100;

  return (
    <Card className={cn("p-8 rounded-[2.5rem] border-0 shadow-xl", 
        theme === 'ocean' ? "bg-slate-800/50 text-white" : 
        theme === 'zen' ? "bg-white" : 
        theme === 'ink' ? "bg-white border-2 border-black" : 
        "bg-white/80")}>
      <CardContent className="p-0 space-y-8">
        <div className="flex flex-col items-center gap-6">
          <div className="flex items-center gap-2 self-start">
            <Smile className="w-5 h-5 text-yellow-500" />
            <h3 className="font-black text-xl uppercase tracking-tighter">{t("mood.howAreYou")}</h3>
          </div>
          
          <div className="flex flex-col items-center w-full">
            <div className={cn("w-32 h-32 rounded-full overflow-hidden shadow-2xl border-4 transition-all duration-500 mb-4 bg-white/10", moodConfig.color.replace('bg-', 'bg-opacity-20 bg-'))}>
              {moodConfig.illustration ? (
                <img src={moodConfig.illustration[gender]} className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-700" alt="Mood" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-5xl">{moodConfig.emoji}</div>
              )}
            </div>
            <div className="text-4xl font-black tracking-tighter">{mood}/10</div>
            <p className="text-xs font-bold opacity-50 uppercase mt-1 tracking-widest">{t(moodConfig.label)}</p>
          </div>

          <div className="w-full space-y-4">
            <div className="flex justify-between items-center px-2">
              <span className="text-[10px] font-black uppercase opacity-40">{t("mood.veryBad")}</span>
              <span className="text-[10px] font-black uppercase opacity-40">{t("mood.excellent")}</span>
            </div>
            
            <div className="relative w-full h-10 flex items-center">
                {/* 原生滑块交互层 */}
                <input 
                    type="range" min="1" max="10" step="1" value={mood} 
                    onChange={(e) => onMoodChange(parseInt(e.target.value))}
                    onMouseDown={() => setIsPressing(true)}
                    onMouseUp={() => setIsPressing(false)}
                    onTouchStart={() => setIsPressing(true)}
                    onTouchEnd={() => setIsPressing(false)}
                    className="mood-slider absolute inset-0 z-20 w-full h-full cursor-pointer transition-none"
                    style={{ "--range-progress": `${progressPercent}%` } as any}
                />
                
                {/* 自定义星星滑块 - 极端强制瞬间位移，无视任何 CSS */}
                <div 
                    className="absolute pointer-events-none z-30 flex items-center justify-center"
                    style={{ 
                        left: `calc(${progressPercent}% - 12px)`, 
                        width: '24px',
                        height: '24px',
                        transition: 'none !important', // 强力禁止
                        WebkitTransition: 'none !important'
                    }}
                >
                    <Star 
                        className={cn(
                            "w-6 h-6 fill-yellow-400 stroke-none drop-shadow-[0_0_8px_rgba(250,204,21,0.6)] !transition-none",
                            isPressing ? "scale-125" : "scale-100"
                        )} 
                        style={{ transition: 'none !important' }}
                    />
                </div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase text-slate-400 ml-1">{t("mood.addNote")}</label>
          <Textarea 
            placeholder={t("mood.placeholder")} value={note} onChange={(e) => onNoteChange(e.target.value)}
            className={cn("min-h-[120px] rounded-2xl border-0 font-bold p-4 resize-none focus-visible:ring-2 focus-visible:ring-black/5", 
                theme === 'ocean' ? "bg-slate-900/50" : "bg-slate-50")}/>
        </div>

        <Button onClick={onSave} className="w-full h-14 bg-black hover:bg-gray-800 text-white rounded-full font-black text-xs tracking-widest uppercase shadow-xl transition-all hover:scale-[1.02] active:scale-95">
          <Save className="w-4 h-4 mr-2" />
          {t("mood.saveRecord")}
        </Button>
      </CardContent>
    </Card>
  );
};

export default MoodLogger;
