import type { FC } from 'react';
import { motion } from "motion/react";
import { useTheme } from "@/app/contexts/ThemeContext";

const BambooAnimation: FC = () => {
    const { theme } = useTheme();
    if (theme !== 'zen') return null;
    
    return (
        <div className="absolute inset-0 pointer-events-none z-0">
             <div className="absolute left-1/2 top-[43%] -translate-x-1/2 -translate-y-1/2 w-32 h-32 flex items-center justify-center overflow-hidden">
                <svg width="100%" height="100%" viewBox="0 0 100 100" className="overflow-visible">
                    <defs>
                        <linearGradient id="shootBaseGreen" x1="0" x2="1" y1="0" y2="0"><stop offset="0%" stopColor="#3f6212" /><stop offset="50%" stopColor="#4d7c0f" /><stop offset="100%" stopColor="#3f6212" /></linearGradient>
                        <linearGradient id="shootMidGreen" x1="0" x2="1" y1="0" y2="0"><stop offset="0%" stopColor="#65a30d" /><stop offset="50%" stopColor="#84cc16" /><stop offset="100%" stopColor="#65a30d" /></linearGradient>
                        <linearGradient id="shootTipGreen" x1="0" x2="1" y1="0" y2="0"><stop offset="0%" stopColor="#10b981" /><stop offset="50%" stopColor="#34d399" /><stop offset="100%" stopColor="#10b981" /></linearGradient>
                    </defs>
                    <g transform="translate(50, 78) scale(0.9)">
                        <motion.path d="M20,15 Q30,-5 20,-20 Q10,-5 20,15" fill="url(#shootMidGreen)" initial={{ scale: 0 }} animate={{ scale: 0.6 }} transition={{ delay: 0.4, duration: 0.5, type: "spring" }} />
                        <motion.path d="M-20,20 Q-15,-10 0,-15 Q15,-10 20,20 Q0,25 -20,20" fill="url(#shootBaseGreen)" initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6, type: "spring" }} />
                        <motion.path d="M-15,5 Q-10,-25 0,-30 Q10,-25 15,5" fill="url(#shootMidGreen)" initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1, duration: 0.6, type: "spring" }} />
                        <motion.path d="M-10,-10 Q0,-50 10,-10 Q0,-5 -10,-10" fill="url(#shootTipGreen)" initial={{ y: 30, opacity: 0, scale: 0.5 }} animate={{ y: 0, opacity: 1, scale: 1 }} transition={{ delay: 0.2, duration: 0.7, type: "spring" }} />
                    </g>
                </svg>
             </div>
        </div>
    );
};

export default BambooAnimation;
