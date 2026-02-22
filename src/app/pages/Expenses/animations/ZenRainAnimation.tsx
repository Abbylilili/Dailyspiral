import type { FC } from 'react';
import { motion } from "motion/react";
import { useTheme } from "@/app/contexts/ThemeContext";

const ZenRainAnimation: FC = () => {
    const { theme } = useTheme();
    if (theme !== 'zen') return null;

    const drops = Array.from({ length: 6 }).map((_, i) => ({
        id: i,
        x: Math.random() * 20 + 65,
        delay: Math.random() * 2,
        duration: 0.8 + Math.random() * 0.4
    }));

    return (
        <div className="absolute left-1/2 top-[43%] -translate-x-1/2 -translate-y-1/2 w-32 h-32 pointer-events-none z-10">
            <svg width="100%" height="100%" viewBox="0 0 100 100" className="overflow-visible">
                 <defs><filter id="cloudShadow" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.1"/></filter></defs>
                 <g transform="translate(-12, -2)">
                     <motion.path d="M65,20 Q65,15 70,15 Q73,12 77,13 Q80,10 83,13 Q90,13 90,20 Q93,22 91,26 H 67 Q63,24 65,20" fill="#e2e8f0" filter="url(#cloudShadow)" initial={{ opacity: 0, scale: 0.8, y: -10, x: 10 }} animate={{ opacity: 0.95, scale: 1, y: 0, x: 0 }} transition={{ duration: 1, ease: "easeOut" }} />
                     {drops.map((drop) => (
                        <motion.line key={drop.id} x1={drop.x} y1="30" x2={drop.x} y2="34" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" initial={{ y: 0, opacity: 0 }} animate={{ y: 20, opacity: [0, 1, 0] }} transition={{ duration: drop.duration, repeat: Infinity, delay: drop.delay, ease: "linear" }} />
                     ))}
                 </g>
            </svg>
        </div>
    );
};

export default ZenRainAnimation;
