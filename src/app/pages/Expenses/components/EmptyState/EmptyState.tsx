import type { FC } from 'react';
import { motion } from "motion/react";
import moneyBagImg from "figma:asset/116797c8578059e006b0df4f57eff1f2767b2538.png";

export const EmptyStateDaisy: FC = () => {
    return (
        <div className="w-24 h-24 mx-auto mb-4 relative flex items-center justify-center">
            <svg width="100" height="100" viewBox="0 0 100 100" className="overflow-visible">
                <defs>
                    <linearGradient id="es-petalGradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#ffffff" /><stop offset="100%" stopColor="#fff7ed" /> </linearGradient>
                    <radialGradient id="es-centerGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%"><stop offset="0%" stopColor="#facc15" /><stop offset="100%" stopColor="#ea580c" /></radialGradient>
                    <filter id="es-dropshadow" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur in="SourceAlpha" stdDeviation="1" /><feOffset dx="0" dy="1" result="offsetblur" /><feComponentTransfer><feFuncA type="linear" slope="0.2" /></feComponentTransfer><feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge></filter>
                </defs>
                <g transform="translate(50, 50)">
                        {Array.from({ length: 12 }).map((_, i) => (
                            <g key={i} transform={`rotate(${-30 * i})`}>
                                <motion.path d="M0,0 C8,-15 12,-35 0,-42 C-12,-35 -8,-15 0,0" fill="url(#es-petalGradient)" stroke="#fce7f3" strokeWidth="0.5" filter="url(#es-dropshadow)" initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: i * 0.08, duration: 0.6, type: "spring", stiffness: 100 }} style={{ transformOrigin: "0px 0px" }} />
                            </g>
                        ))}
                        <motion.circle cx="0" cy="0" r="9" fill="url(#es-centerGradient)" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.0, duration: 0.4 }} />
                </g>
            </svg>
        </div>
    );
};

const EmptyState: FC = () => {
    return (
        <div className="flex flex-col items-center justify-center py-20 min-h-[400px]">
             <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1, y: [0, -10, 0] }} transition={{ scale: { duration: 0.5 }, opacity: { duration: 0.5 }, y: { duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.5 } }} className="w-64 h-64 relative mb-6">
                <div className="absolute inset-0 bg-yellow-400/20 blur-[60px] rounded-full animate-pulse" />
                <img src={moneyBagImg} alt="No expenses" className="w-full h-full object-contain relative z-10 drop-shadow-2xl" />
                <motion.div animate={{ y: [0, -20, 0], opacity: [0, 1, 0] }} transition={{ duration: 2, repeat: Infinity, delay: 0 }} className="absolute top-0 right-10 text-4xl">✨</motion.div>
                <motion.div animate={{ y: [0, -15, 0], opacity: [0, 1, 0] }} transition={{ duration: 2.5, repeat: Infinity, delay: 1 }} className="absolute bottom-10 left-10 text-3xl">💰</motion.div>
            </motion.div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">No expenses yet</h3>
            <p className="text-gray-500 mb-8 max-w-xs text-center">Your spending history is clean! Add your first record to see insights.</p>
        </div>
    );
};

export default EmptyState;
