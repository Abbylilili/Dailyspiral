import type { FC } from 'react';
import { Card, CardContent } from "@/app/components/ui/card";
import { Slider } from "@/app/components/ui/slider";
import { Textarea } from "@/app/components/ui/textarea";
import { Button } from "@/app/components/ui/button";
import { getMoodConfig } from "@/app/lib/moodConfig";
import { useTheme } from "@/app/contexts/ThemeContext";
import { cn } from "@/app/components/ui/utils";
import type { Gender } from "@/app/lib/storage";

interface MoodLoggerProps {
  mood: number;
  note: string;
  gender: Gender;
  onMoodChange: (val: number) => void;
  onNoteChange: (val: string) => void;
  onSave: () => void;
}

const MoodLogger: FC<MoodLoggerProps> = ({ mood, note, gender, onMoodChange, onNoteChange, onSave }) => {
  const { theme } = useTheme();
  const config = getMoodConfig(mood);

  return (
    <Card className={cn("border-0 overflow-hidden relative flex-1 min-h-[420px] transition-all", 
        theme === 'ocean' ? "bg-slate-800/50 text-slate-100" : "glass-card bg-white/70 backdrop-blur-xl shadow-xl"
    )}>
      <div className={cn("absolute inset-0 opacity-10 transition-colors duration-500", config.color)} />
      
      <CardContent className="pt-12 pb-10 px-10 flex flex-col items-center text-center relative z-10 h-full justify-center">
        <div className="mb-8 transform transition-transform duration-500 hover:scale-105">
          {config.illustration ? (
            <div className={cn("w-56 h-56 overflow-hidden shadow-2xl relative group", theme === 'ink' ? "rounded-2xl border-4 border-black" : "rounded-[3rem] ring-8 ring-white/20")}>
              <img src={config.illustration[gender]} alt={config.label} className="w-full h-full object-cover saturate-125" />
            </div>
          ) : (
            <div className="text-[8rem] filter drop-shadow-2xl">{config.emoji}</div>
          )}
        </div>
        
        <h3 className={cn("text-2xl font-bold mb-8", theme === 'ocean' ? "text-white" : "text-gray-800")}>{config.label}</h3>

        <div className="w-full px-6 mb-8">
          <style>
            {`
              .neon-thumb {
                position: relative;
                z-index: 10;
                border: 2px solid ${theme === 'ink' ? '#000' : theme === 'ocean' ? '#fff' : '#e5e7eb'} !important;
                transition: all 0.2s ease;
              }
              .neon-thumb:hover {
                background-color: transparent !important;
                border-color: transparent !important;
                transform: scale(1.5);
              }
              .neon-thumb:hover::after {
                content: "⭐️";
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -55%);
                font-size: 16px;
              }
            `}
          </style>
          <Slider 
            value={[mood]} 
            onValueChange={(v) => onMoodChange(v[0])} 
            min={1} 
            max={10} 
            step={1} 
            className="w-full"
            rangeClassName={cn(
                theme === 'ocean' ? "bg-gradient-to-r from-pink-500 to-purple-600" :
                "bg-gradient-to-r from-pink-500 to-purple-600"
            )}
            trackClassName={theme === 'ocean' ? "bg-slate-700" : ""}
            thumbClassName="neon-thumb w-6 h-6 bg-white shadow-lg"
          />
          <div className="flex justify-between text-xs mt-2 opacity-40 font-bold">
            <span>Very Bad</span>
            <span>Excellent</span>
          </div>
        </div>

        <div className="w-full space-y-4">
          <Textarea
            placeholder="How are you feeling today?"
            value={note}
            onChange={(e) => onNoteChange(e.target.value)}
            rows={2}
            className={cn("border-0 resize-none text-center text-lg p-4 rounded-2xl",
                theme === 'ocean' ? "bg-slate-900/50 text-white" : "bg-white/50"
            )}
          />
          <Button onClick={onSave} className={cn("w-full h-14 text-xl font-bold rounded-2xl shadow-lg transition-all active:scale-[0.98]")}>Save Record</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default MoodLogger;
