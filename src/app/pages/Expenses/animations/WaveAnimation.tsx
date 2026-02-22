import type { FC } from 'react';
import { motion } from "motion/react";
import { useTheme } from "@/app/contexts/ThemeContext";

const WaveAnimation: FC = () => {
    const { theme } = useTheme();
    if (theme !== 'ocean') return null;

    return (
        <div className="absolute inset-0 pointer-events-none z-0">
             <div className="absolute left-1/2 top-[43%] -translate-x-1/2 -translate-y-1/2 w-32 h-32 flex items-center justify-center overflow-hidden rounded-full">
                <svg width="100%" height="100%" viewBox="0 0 100 100" className="overflow-hidden rounded-full">
                    <defs>
                        <linearGradient id="waveGradient1" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#a5f3fc" /><stop offset="100%" stopColor="#22d3ee" /></linearGradient>
                         <linearGradient id="waveGradient2" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#60a5fa" /><stop offset="100%" stopColor="#3b82f6" /></linearGradient>
                         <linearGradient id="waveGradient3" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#1d4ed8" /><stop offset="100%" stopColor="#1e3a8a" /></linearGradient>
                    </defs>
                    <motion.path d="M-100,60 C-50,50 0,70 50,60 S 150,50 200,60 V 120 H -100 Z" fill="url(#waveGradient1)" initial={{ x: 0 }} animate={{ x: -100 }} transition={{ duration: 5, repeat: Infinity, ease: "linear" }} />
                    <motion.path d="M-100,70 C-50,80 0,60 50,70 S 150,80 200,70 V 120 H -100 Z" fill="url(#waveGradient2)" initial={{ x: 0 }} animate={{ x: -100 }} transition={{ duration: 3.5, repeat: Infinity, ease: "linear" }} style={{ opacity: 0.8 }} />
                    <motion.path d="M-100,80 C-50,70 0,90 50,80 S 150,70 200,80 V 120 H -100 Z" fill="url(#waveGradient3)" initial={{ x: 0 }} animate={{ x: -100 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} />
                    <motion.circle cx="70" cy="30" r="8" fill="#fef08a" initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5, duration: 1 }} />
                </svg>
             </div>
        </div>
    );
};

export default WaveAnimation;
