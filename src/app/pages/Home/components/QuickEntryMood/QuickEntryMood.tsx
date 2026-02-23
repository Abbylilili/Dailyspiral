import type { FC } from 'react';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Slider } from "@/app/components/ui/slider";
import { Button } from "@/app/components/ui/button";
import { Heart } from "lucide-react";
import { useTheme } from "@/app/contexts/ThemeContext";
import { cn } from "@/app/components/ui/utils";
import { getMoodConfig } from "@/app/lib/moodConfig";
import { saveMood, getGenderPreference } from "@/app/lib/storage";
import { toast } from "sonner";

interface QuickEntryMoodProps {
  initialMood: number;
  date: string;
  onRefresh: () => void;
}

const QuickEntryMood: FC<QuickEntryMoodProps> = ({ initialMood, date, onRefresh }) => {
  const { theme } = useTheme();
  const [mood, setMood] = useState(initialMood);
  const gender = getGenderPreference() || 'girl';
  const moodConfig = getMoodConfig(mood);

  const handleSave = async () => {
    // Non-blocking save
    saveMood({ id: date, date, mood });
    toast.success("Mood saved!");
    // We can call onRefresh to sync everything else, 
    // but the local change is already "effective" visually because of the local state
    onRefresh();
  };

  const getCardClass = () => {
      switch(theme) {
          case 'ocean': return "bg-slate-800/50 border-0 text-white backdrop-blur-xl shadow-xl";
          case 'ink': return "bg-white border-2 border-black text-black shadow-[6px_6px_0px_0px_black] rounded-xl";
          default: return "glass-card border-0 rounded-2xl shadow-xl";
      }
  };

  const getButtonClass = () => {
      switch(theme) {
          case 'ocean': return "bg-cyan-500 text-slate-900 hover:bg-cyan-400";
          case 'ink': return "bg-black text-white hover:bg-gray-800 rounded-lg";
          default: return "bg-black text-white hover:bg-gray-800";
      }
  };

  return (
    <Card className={cn("flex flex-col h-full", getCardClass())}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Heart className={cn("w-5 h-5", theme === 'ocean' ? "text-pink-400" : "text-pink-500")} />
            Record Mood
          </CardTitle>
          <span className="text-xs font-medium opacity-60">Today</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 flex flex-col flex-1">
        <div className="flex flex-col items-center justify-center py-4">
          <div className={cn("w-24 h-24 rounded-full overflow-hidden shadow-xl mb-3 border-4 transition-all duration-500 relative bg-white/10", moodConfig.color.replace('bg-', 'bg-opacity-20 bg-'))}>
             {moodConfig.illustration ? (
                <img src={moodConfig.illustration[gender]} alt={moodConfig.label} className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-700 saturate-125" />
             ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl">{moodConfig.emoji}</div>
             )}
          </div>
          <p className="text-2xl font-black">{mood}/10</p>
        </div>
        
        <div className="space-y-2 flex-1">
          <style>
            {`
              .neon-thumb-home {
                position: relative;
                z-index: 10;
                border: 2px solid ${theme === 'ink' ? '#000' : theme === 'ocean' ? '#fff' : '#e5e7eb'} !important;
                transition: all 0.2s ease;
              }
              .neon-thumb-home:hover {
                background-color: transparent !important;
                border-color: transparent !important;
                transform: scale(1.5);
              }
              .neon-thumb-home:hover::after {
                content: "⭐️";
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -55%);
                font-size: 14px;
              }
            `}
          </style>
          <Slider 
            value={[mood]} 
            onValueChange={(v) => setMood(v[0])} 
            min={1} 
            max={10} 
            step={1} 
            rangeClassName="bg-gradient-to-r from-pink-500 to-purple-600"
            trackClassName={theme === 'ocean' ? "bg-slate-700" : ""}
            thumbClassName="neon-thumb-home w-6 h-6 bg-white shadow-lg" 
          />
          <div className="flex justify-between text-[10px] font-bold opacity-40 uppercase">
            <span>Very Bad</span>
            <span>Excellent</span>
          </div>
        </div>

        <Button onClick={handleSave} className={cn("relative w-full h-10 text-sm font-bold rounded-xl shadow-lg mt-auto active:scale-95", getButtonClass())}>
          <Heart className="absolute left-4 w-4 h-4 fill-current" />
          <span>Save Mood</span>
        </Button>
      </CardContent>
    </Card>
  );
};

export default QuickEntryMood;
