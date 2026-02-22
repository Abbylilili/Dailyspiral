import type { FC } from 'react';
import { motion } from "motion/react";
import { useTheme } from "@/app/contexts/ThemeContext";

const DaisyAnimation: FC = () => {
    const { theme } = useTheme();
    if (theme === 'ocean' || theme === 'ink' || theme === 'zen') return null;
    
    return (
        <div className="absolute inset-0 pointer-events-none z-0">
             <div className="absolute left-1/2 top-[43%] -translate-x-1/2 -translate-y-1/2 w-48 h-48 flex items-center justify-center">
                <svg width="100" height="100" viewBox="0 0 100 100" className="overflow-visible">
                    <defs>
                        <linearGradient id="petalGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#ffffff" /><stop offset="100%" stopColor="#fff7ed" /> 
                        </linearGradient>
                         <radialGradient id="centerGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                            <stop offset="0%" stopColor="#facc15" /><stop offset="100%" stopColor="#ea580c" />
                        </radialGradient>
                        <filter id="dropshadow" x="-20%" y="-20%" width="140%" height="140%">
                            <feGaussianBlur in="SourceAlpha" stdDeviation="1" />
                            <feOffset dx="0" dy="1" result="offsetblur" />
                            <feComponentTransfer><feFuncA type="linear" slope="0.2" /></feComponentTransfer>
                            <feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge>
                        </filter>
                    </defs>
                    <g transform="translate(50, 50)">
                         {Array.from({ length: 12 }).map((_, i) => (
                             <g key={i} transform={`rotate(${-30 * i})`}>
                                 <motion.path
                                    d="M0,0 C8,-15 12,-35 0,-42 C-12,-35 -8,-15 0,0"
                                    fill="url(#petalGradient)" stroke="#fce7f3" strokeWidth="0.5" filter="url(#dropshadow)"
                                    initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: i * 0.08, duration: 0.6, type: "spring", stiffness: 100 }}
                                    style={{ transformOrigin: "0px 0px" }}
                                 />
                             </g>
                         ))}
                         <motion.circle cx="0" cy="0" r="9" fill="url(#centerGradient)" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.0, duration: 0.4 }} />
                    </g>
                </svg>
             </div>
        </div>
    );
};

export default DaisyAnimation;
