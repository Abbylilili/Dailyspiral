import type { FC } from 'react';
import { useTheme } from "@/app/contexts/ThemeContext";
import { cn } from "@/app/components/ui/utils";

interface LiquidHeartProps {
  percentage: number;
  status: string;
}

const LiquidHeart: FC<LiquidHeartProps> = ({ percentage, status }) => {
  const { theme } = useTheme();
  // Map 0-100 percentage to SVG Y coordinate (22 is empty, 2 is full)
  const liquidY = 22 - (percentage / 100) * 20;

  // Longer path (72 units) to prevent gaps during animation translation
  const wavePathA = "M0 0 Q 6 -1.5 12 0 T 24 0 T 36 0 T 48 0 T 60 0 T 72 0 V 40 H 0 Z";
  const wavePathB = "M0 0 Q 6 2 12 0 T 24 0 T 36 0 T 48 0 T 60 0 T 72 0 V 40 H 0 Z";

  return (
    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 flex items-center justify-center z-0">
         <svg viewBox="0 0 24 24" className="w-full h-full drop-shadow-2xl overflow-visible">
            <defs>
                <path id="heartPath" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                <clipPath id="heartClip"><use href="#heartPath" /></clipPath>
                
                <linearGradient id="heartGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor={theme === 'ocean' ? "#06b6d4" : theme === 'zen' ? "#34d399" : "#fbbf24"} />
                    <stop offset="100%" stopColor={theme === 'ocean' ? "#2563eb" : theme === 'zen' ? "#059669" : "#d97706"} />
                </linearGradient>

                <linearGradient id="glassShine" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="white" stopOpacity="0.9" />
                    <stop offset="20%" stopColor="white" stopOpacity="0.4" />
                    <stop offset="50%" stopColor="white" stopOpacity="0.1" />
                    <stop offset="100%" stopColor="white" stopOpacity="0" />
                </linearGradient>
            </defs>

            {/* Background of the heart */}
            <use 
              href="#heartPath" 
              className={theme === 'ocean' ? "fill-slate-700" : (theme === 'ink' ? "fill-white" : "fill-gray-100")} 
              stroke={theme === 'ink' ? "black" : "rgba(0,0,0,0.05)"} 
              strokeWidth={theme === 'ink' ? "1.5" : "0.5"} 
            />

            {/* Animated Liquid */}
            <g clipPath="url(#heartClip)">
                {/* Back wave */}
                <path 
                  fill={theme === 'ocean' ? "#0891b2" : (theme === 'zen' ? "#a7f3d0" : (theme === 'ink' ? "#333" : "#FCD34D"))} 
                  fillOpacity={theme === 'ink' ? "0.2" : "0.6"} 
                  d={wavePathA}
                >
                    <animateTransform attributeName="transform" type="translate" from={`0 ${liquidY}`} to={`-24 ${liquidY}`} dur="6s" repeatCount="indefinite" />
                </path>
                {/* Front wave */}
                <path 
                  fill={theme === 'ink' ? "black" : "url(#heartGrad)"} 
                  d={wavePathB}
                >
                    <animateTransform attributeName="transform" type="translate" from={`-5 ${liquidY}`} to={`-29 ${liquidY}`} dur="4s" repeatCount="indefinite" />
                </path>
            </g>

            {/* Glass effect (disabled for ink for cleaner look) */}
            {theme !== 'ink' && <use href="#heartPath" fill="url(#glassShine)" style={{ mixBlendMode: 'overlay' }} />}
            
            {/* Bold outline */}
            <use 
              href="#heartPath" 
              fill="none" 
              stroke={theme === 'ink' ? "black" : "white"} 
              strokeWidth={theme === 'ink' ? "1.5" : "0.3"} 
              strokeOpacity={theme === 'ink' ? "1" : "0.8"} 
            />
         </svg>
         
         <div className="absolute inset-0 flex flex-col items-center justify-center pt-2">
             <span className={cn("text-6xl font-black drop-shadow-sm transition-colors", theme === 'ink' ? "text-white" : "text-white")}>
               {percentage}%
             </span>
             <span className={cn("text-xs font-black mt-2 px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg border transition-all", 
                theme === 'ink' ? "bg-black text-white border-black" : "bg-black/20 text-white border-white/20 backdrop-blur-md"
             )}>
               {status}
             </span>
         </div>
    </div>
  );
};

export default LiquidHeart;
