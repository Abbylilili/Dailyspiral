import type { FC } from 'react';
import { useTheme } from "@/app/contexts/ThemeContext";

interface LiquidHeartProps {
  percentage: number;
  status: string;
}

const LiquidHeart: FC<LiquidHeartProps> = ({ percentage, status }) => {
  const { theme } = useTheme();
  const liquidY = 22 - (percentage / 100) * 20;

  return (
    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 flex items-center justify-center z-0">
         <svg viewBox="0 0 24 24" className="w-full h-full drop-shadow-2xl overflow-visible">
            <defs>
                <path id="heartPath" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                <clipPath id="heartClip"><use href="#heartPath" /></clipPath>
                <linearGradient id="glassShine" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="white" stopOpacity="0.9" /><stop offset="20%" stopColor="white" stopOpacity="0.4" /><stop offset="50%" stopColor="white" stopOpacity="0.1" /><stop offset="100%" stopColor="white" stopOpacity="0" />
                </linearGradient>
            </defs>

            <use href="#heartPath" className={theme === 'ocean' ? "fill-slate-700" : "fill-gray-100"} stroke={theme === 'ink' ? "black" : "rgba(0,0,0,0.05)"} strokeWidth="0.5" />

            <g clipPath="url(#heartClip)">
                <path fill={theme === 'ocean' ? "#0891b2" : (theme === 'zen' ? "#a7f3d0" : "#FCD34D")} fillOpacity="0.6" d="M0 0 Q 6 -1.5 12 0 T 24 0 T 36 0 T 48 0 V 40 H 0 Z">
                    <animateTransform attributeName="transform" type="translate" from={`0 ${liquidY}`} to={`-24 ${liquidY}`} dur="6s" repeatCount="indefinite" />
                </path>
                <path fill={theme === 'ink' ? "black" : "url(#heartGrad)"} d="M0 0 Q 6 2 12 0 T 24 0 T 36 0 T 48 0 V 40 H 0 Z">
                    <linearGradient id="heartGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor={theme === 'ocean' ? "#06b6d4" : theme === 'zen' ? "#34d399" : "#fbbf24"} /><stop offset="100%" stopColor={theme === 'ocean' ? "#2563eb" : theme === 'zen' ? "#059669" : "#d97706"} />
                    </linearGradient>
                    <animateTransform attributeName="transform" type="translate" from={`-5 ${liquidY}`} to={`-29 ${liquidY}`} dur="4s" repeatCount="indefinite" />
                </path>
            </g>

            {theme !== 'ink' && <use href="#heartPath" fill="url(#glassShine)" style={{ mixBlendMode: 'overlay' }} />}
            <use href="#heartPath" fill="none" stroke={theme === 'ink' ? "black" : "white"} strokeWidth={theme === 'ink' ? "2" : "0.3"} strokeOpacity="0.8" />
         </svg>
         
         <div className="absolute inset-0 flex flex-col items-center justify-center pt-2">
             <span className="text-6xl font-black text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">{percentage}%</span>
             <span className="text-sm font-bold mt-1 px-3 py-1 rounded-full text-white/90 drop-shadow-md bg-black/10 backdrop-blur-sm border border-white/20">{status}</span>
         </div>
    </div>
  );
};

export default LiquidHeart;
