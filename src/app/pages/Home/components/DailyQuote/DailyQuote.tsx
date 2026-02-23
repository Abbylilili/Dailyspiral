import type { FC } from 'react';
import { Card, CardContent } from "@/app/components/ui/card";
import { Sparkles } from "lucide-react";
import { useTheme } from "@/app/contexts/ThemeContext";
import { cn } from "@/app/components/ui/utils";
import { getQuoteForMood, getRandomQuote } from "@/app/lib/quotes";

interface DailyQuoteProps {
  moodScore: number;
}

const DailyQuote: FC<DailyQuoteProps> = ({ moodScore }) => {
  const { theme } = useTheme();
  const quote = moodScore > 0 ? getQuoteForMood(moodScore) : getRandomQuote();

  const getQuoteCardStyle = () => {
      switch(theme) {
          case 'ocean': return "bg-gradient-to-r from-slate-900 to-slate-800 border-0 text-slate-100 shadow-xl shadow-cyan-900/10 rounded-2xl";
          case 'ink': return "bg-black text-white rounded-xl shadow-[4px_4px_0px_0px_gray]";
          case 'zen': return "bg-[linear-gradient(135deg,#fef9e7_0%,#f0f9e8_50%,#e8f6f3_100%)] border-0 text-[#166534] shadow-[0_4px_20px_rgba(166,195,168,0.15)] rounded-full";
          default: return "bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-[2rem] shadow-lg shadow-purple-500/20";
      }
  };

  return (
    <Card className={cn("border-0 shadow-lg transition-all", getQuoteCardStyle())}>
      <CardContent className="py-6 px-6">
        <div className="flex items-center gap-3">
          <Sparkles className={cn("w-5 h-5 flex-shrink-0", theme === 'ocean' ? "text-cyan-400" : "text-yellow-200")} />
          <div>
            <p className={cn("text-lg mb-1 leading-snug font-['Lora'] italic font-medium")}>{quote.text}</p>
            {quote.author && (
              <p className={cn("text-sm font-light font-['Lora'] italic opacity-90")}>— {quote.author}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DailyQuote;
