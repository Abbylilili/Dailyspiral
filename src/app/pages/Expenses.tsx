import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Plus, Trash2, TrendingUp, TrendingDown, Calendar as CalendarIcon, Edit2, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "../components/ui/dialog";
import { getExpenses, saveExpense, deleteExpense, ExpenseEntry } from "../lib/storage";
import { format, startOfMonth, endOfMonth, parseISO } from "date-fns";
import { toast } from "sonner";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { Popover, PopoverContent, PopoverTrigger } from "../components/ui/popover";
import { Calendar } from "../components/ui/calendar";
import { cn } from "../components/ui/utils";
import { useTheme } from "../contexts/ThemeContext";
import pandaNormal from "figma:asset/a4c9998f92ac8efc75741168c966849b86d3b9ee.png";
import moneyBagImg from "figma:asset/116797c8578059e006b0df4f57eff1f2767b2538.png";

// Daily Spiral Color Palette (Pastel/Soft)
const PASTEL_COLORS = [
    "#FFB5A7", // Soft Pink/Orange
    "#FCD5CE", // Pale Pink
    "#F8EDEB", // Off White
    "#F9DCC4", // Peach
    "#FEC89A", // Soft Orange
    "#9BF6FF", // Soft Cyan
    "#A0C4FF", // Soft Blue
    "#BDB2FF", // Soft Purple
    "#FFC6FF", // Pink/Purple
    "#CAFFBF", // Soft Green
    "#FDFFB6", // Soft Yellow
];

// Ocean Theme Palette (Neon/Deep)
const OCEAN_COLORS = [
    "#06b6d4", // Cyan 500
    "#3b82f6", // Blue 500
    "#8b5cf6", // Violet 500
    "#ec4899", // Pink 500
    "#14b8a6", // Teal 500
    "#6366f1", // Indigo 500
    "#f43f5e", // Rose 500
    "#0ea5e9", // Sky 500
    "#a855f7", // Purple 500
    "#22d3ee", // Cyan 400
];

// Ink Theme Palette (Monochrome/High Contrast)
const INK_COLORS = [
    "#000000", // Black
    "#404040", // Neutral 700
    "#737373", // Neutral 500
    "#a3a3a3", // Neutral 400
    "#d4d4d4", // Neutral 300
    "#171717", // Neutral 900
    "#525252", // Neutral 600
    "#262626", // Neutral 800
];

// Zen Theme Palette (Natural/Earthy)
const ZEN_COLORS = [
    "#34d399", // Emerald 400
    "#fbbf24", // Amber 400
    "#a78bfa", // Violet 400
    "#60a5fa", // Blue 400
    "#f87171", // Red 400
    "#2dd4bf", // Teal 400
    "#fb923c", // Orange 400
    "#86efac", // Green 300
    "#fdba74", // Orange 300
    "#93c5fd", // Blue 300
];

const CATEGORIES = [
  { value: "food", label: "🍜 Food", color: "#FF9F1C" }, // Warm Orange
  { value: "transport", label: "🚗 Transport", color: "#2EC4B6" }, // Teal
  { value: "shopping", label: "🛍️ Shopping", color: "#FF5400" }, // Bright Orange/Red
  { value: "entertainment", label: "🎬 Entertainment", color: "#CBF3F0" }, // Light Teal -> will use a darker version for text
  { value: "health", label: "💊 Health", color: "#2B2D42" }, // Dark Blue
  { value: "other", label: "📦 Other", color: "#8D99AE" }, // Grey Blue
];

// Mapping helper to get colors for charts based on theme
const getChartColor = (index: number, theme: string) => {
    switch (theme) {
        case 'ocean': return OCEAN_COLORS[index % OCEAN_COLORS.length];
        case 'ink': return INK_COLORS[index % INK_COLORS.length];
        case 'zen': return ZEN_COLORS[index % ZEN_COLORS.length];
        default: return PASTEL_COLORS[index % PASTEL_COLORS.length];
    }
};

const PandaAnimation = () => {
    const { theme } = useTheme();

    // Only show Panda in Ink theme
    if (theme !== 'ink') return null;

    // High contrast grayscale + masking to isolate the panda
    // Ink mode is light, so we use Multiply to make white transparent
    // Filter chain: Turn Pink background -> White, Dark Panda -> Black
    const imageStyle = { 
        filter: 'grayscale(100%) brightness(120%) contrast(200%)', 
        mixBlendMode: 'multiply' as const,
        WebkitMaskImage: 'radial-gradient(circle at center, black 40%, transparent 70%)',
        maskImage: 'radial-gradient(circle at center, black 40%, transparent 70%)'
    };

    return (
        <div className="absolute inset-0 pointer-events-none z-0">
            {/* 
                Position calculation:
                Container Height: 250px
                Legend Height: 36px
                Chart Center Y: (250 - 36) / 2 = 107px
                107px / 250px ≈ 42.8%
            */}
            <div className="absolute left-[52%] top-[43%] -translate-x-1/2 -translate-y-1/2 w-48 h-48 flex items-center justify-center">
                 <img 
                    src={pandaNormal} 
                    alt="Panda" 
                    style={imageStyle}
                    className="w-full h-full object-contain opacity-90"
                />
            </div>
        </div>
    );
};

const DaisyAnimation = () => {
    const { theme } = useTheme();

    // Only show Daisy in Pastel theme (which is default)
    if (theme === 'ocean' || theme === 'ink' || theme === 'zen') return null;

    // White Daisy with Golden Center (matching the provided illustration style)
    // Petals: White -> Warm White
    // Center: Yellow -> Orange
    // Animation: Unfold counter-clockwise
    
    return (
        <div className="absolute inset-0 pointer-events-none z-0">
             <div className="absolute left-1/2 top-[43%] -translate-x-1/2 -translate-y-1/2 w-48 h-48 flex items-center justify-center">
                <svg width="100" height="100" viewBox="0 0 100 100" className="overflow-visible">
                    <defs>
                        <linearGradient id="petalGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#ffffff" />
                            <stop offset="100%" stopColor="#fff7ed" /> 
                        </linearGradient>
                         <radialGradient id="centerGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                            <stop offset="0%" stopColor="#facc15" />
                            <stop offset="100%" stopColor="#ea580c" />
                        </radialGradient>
                        <filter id="dropshadow" x="-20%" y="-20%" width="140%" height="140%">
                            <feGaussianBlur in="SourceAlpha" stdDeviation="1" />
                            <feOffset dx="0" dy="1" result="offsetblur" />
                            <feComponentTransfer>
                                <feFuncA type="linear" slope="0.2" />
                            </feComponentTransfer>
                            <feMerge> 
                                <feMergeNode />
                                <feMergeNode in="SourceGraphic" /> 
                            </feMerge>
                        </filter>
                    </defs>
                    <g transform="translate(50, 50)">
                         {Array.from({ length: 12 }).map((_, i) => (
                             <g key={i} transform={`rotate(${-30 * i})`}>
                                 <motion.path
                                    // Rounder tip using cubic bezier curves
                                    // Start (0,0) -> Control1 (8,-15) -> Control2 (12,-35) -> Tip (0,-42) -> Control3 (-12,-35) -> Control4 (-8,-15) -> End (0,0)
                                    d="M0,0 C8,-15 12,-35 0,-42 C-12,-35 -8,-15 0,0"
                                    fill="url(#petalGradient)"
                                    stroke="#fce7f3" 
                                    strokeWidth="0.5"
                                    filter="url(#dropshadow)"
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ 
                                        delay: i * 0.08, 
                                        duration: 0.6,
                                        type: "spring",
                                        stiffness: 100
                                    }}
                                    style={{ transformOrigin: "0px 0px" }}
                                 />
                             </g>
                         ))}
                         <motion.circle 
                            cx="0" cy="0" r="9" 
                            fill="url(#centerGradient)"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 1.0, duration: 0.4 }}
                         />
                    </g>
                </svg>
             </div>
        </div>
    );
};

const BambooAnimation = () => {
    const { theme } = useTheme();

    if (theme !== 'zen') return null;

    // Bamboo Shoot Animation
    // Concept: Overlapping sheaths rising up (sprouting)
    // Colors: Fresh greens (Light -> Dark)
    
    return (
        <div className="absolute inset-0 pointer-events-none z-0">
             <div className="absolute left-1/2 top-[43%] -translate-x-1/2 -translate-y-1/2 w-32 h-32 flex items-center justify-center overflow-hidden">
                <svg width="100%" height="100%" viewBox="0 0 100 100" className="overflow-visible">
                    <defs>
                        <linearGradient id="shootBaseGreen" x1="0" x2="1" y1="0" y2="0">
                            <stop offset="0%" stopColor="#3f6212" /> {/* Dark Green */}
                            <stop offset="50%" stopColor="#4d7c0f" /> 
                            <stop offset="100%" stopColor="#3f6212" />
                        </linearGradient>
                        <linearGradient id="shootMidGreen" x1="0" x2="1" y1="0" y2="0">
                            <stop offset="0%" stopColor="#65a30d" /> {/* Lime 600 */}
                            <stop offset="50%" stopColor="#84cc16" /> {/* Lime 500 */}
                            <stop offset="100%" stopColor="#65a30d" />
                        </linearGradient>
                         <linearGradient id="shootTipGreen" x1="0" x2="1" y1="0" y2="0">
                            <stop offset="0%" stopColor="#10b981" /> {/* Emerald 500 */}
                            <stop offset="50%" stopColor="#34d399" /> {/* Emerald 400 */}
                            <stop offset="100%" stopColor="#10b981" />
                        </linearGradient>
                        <filter id="bambooShadow" x="-20%" y="-20%" width="140%" height="140%">
                            <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.2"/>
                        </filter>
                    </defs>
                    
                    {/* Centered Group: Positioned at the bottom center. Scaled up. */}
                    <g transform="translate(50, 78) scale(0.9)">
                        {/* Right tiny shoot (decorative) - Green */}
                        <motion.path
                            d="M20,15 Q30,-5 20,-20 Q10,-5 20,15"
                            fill="url(#shootMidGreen)"
                            filter="url(#bambooShadow)"
                            initial={{ scale: 0 }}
                            animate={{ scale: 0.6 }}
                            transition={{ delay: 0.4, duration: 0.5, type: "spring" }}
                        />

                        {/* Main Shoot - Layered construction - All Green Gradients */}
                        
                        {/* Base Sheath (Darker Green) */}
                        <motion.path 
                            d="M-20,20 Q-15,-10 0,-15 Q15,-10 20,20 Q0,25 -20,20" 
                            fill="url(#shootBaseGreen)"
                            filter="url(#bambooShadow)"
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.6, type: "spring", damping: 12 }}
                        />

                        {/* Middle Sheath (Mid Green) */}
                        <motion.path 
                            d="M-15,5 Q-10,-25 0,-30 Q10,-25 15,5"
                            fill="url(#shootMidGreen)"
                            filter="url(#bambooShadow)"
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.1, duration: 0.6, type: "spring", damping: 12 }}
                        />

                        {/* Top Tip (The "Mao Jian") (Lightest/Brightest Green) */}
                        <motion.path 
                            d="M-10,-10 Q0,-50 10,-10 Q0,-5 -10,-10"
                            fill="url(#shootTipGreen)"
                            filter="url(#bambooShadow)"
                            initial={{ y: 30, opacity: 0, scale: 0.5 }}
                            animate={{ y: 0, opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2, duration: 0.7, type: "spring", bounce: 0.5 }}
                        />
                        
                        {/* Dew drop on tip */}
                        <motion.circle
                            cx="0" cy="-48" r="2"
                            fill="#e0f2fe"
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 0.8, scale: 1 }}
                            transition={{ delay: 0.8, duration: 0.3 }}
                        />
                    </g>
                </svg>
             </div>
        </div>
    );
};

const ZenRainAnimation = () => {
    const { theme } = useTheme();
    if (theme !== 'zen') return null;

    // Generate random raindrops
    const drops = Array.from({ length: 6 }).map((_, i) => ({
        id: i,
        x: Math.random() * 20 + 65, // Shifted right (65-85) to match cloud
        delay: Math.random() * 2,
        duration: 0.8 + Math.random() * 0.4
    }));

    // Cloud positioned top-right
    return (
        <div className="absolute left-1/2 top-[43%] -translate-x-1/2 -translate-y-1/2 w-32 h-32 pointer-events-none z-10">
            <svg width="100%" height="100%" viewBox="0 0 100 100" className="overflow-visible">
                 <defs>
                    <filter id="cloudShadow" x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.1"/>
                    </filter>
                 </defs>
                 
                 {/* Group transformed to top-right to avoid overlap with bottom bamboo. Moved down a bit. */}
                 <g transform="translate(-12, -2)">
                     {/* Cloud - Made slightly darker (Slate 200) for better visibility */}
                     <motion.path
                        d="M65,20 Q65,15 70,15 Q73,12 77,13 Q80,10 83,13 Q90,13 90,20 Q93,22 91,26 H 67 Q63,24 65,20"
                        fill="#e2e8f0" 
                        filter="url(#cloudShadow)"
                        initial={{ opacity: 0, scale: 0.8, y: -10, x: 10 }}
                        animate={{ opacity: 0.95, scale: 1, y: 0, x: 0 }}
                        transition={{ duration: 1, ease: "easeOut" }}
                     />
                     
                     {/* Raindrops - Vertical, Gray, Round */}
                     {drops.map((drop) => (
                        <motion.line
                            key={drop.id}
                            x1={drop.x} y1="30"
                            x2={drop.x} y2="34" // Short length
                            stroke="#9ca3af" // Gray 400
                            strokeWidth="1.5" // Thinner for smaller scale
                            strokeLinecap="round"
                            initial={{ y: 0, opacity: 0 }}
                            animate={{ y: 20, opacity: [0, 1, 0] }} // Fall distance
                            transition={{
                                duration: drop.duration,
                                repeat: Infinity,
                                delay: drop.delay,
                                ease: "linear"
                            }}
                        />
                     ))}
                 </g>
            </svg>
        </div>
    );
};

const WaveAnimation = () => {
    const { theme } = useTheme();

    if (theme !== 'ocean') return null;

    return (
        <div className="absolute inset-0 pointer-events-none z-0">
             <div className="absolute left-1/2 top-[43%] -translate-x-1/2 -translate-y-1/2 w-32 h-32 flex items-center justify-center overflow-hidden rounded-full">
                <svg width="100%" height="100%" viewBox="0 0 100 100" className="overflow-hidden rounded-full">
                    <defs>
                        <linearGradient id="waveGradient1" x1="0" x2="0" y1="0" y2="1">
                            <stop offset="0%" stopColor="#a5f3fc" /> {/* Cyan 200 */}
                            <stop offset="100%" stopColor="#22d3ee" /> {/* Cyan 400 */}
                        </linearGradient>
                         <linearGradient id="waveGradient2" x1="0" x2="0" y1="0" y2="1">
                            <stop offset="0%" stopColor="#60a5fa" /> {/* Blue 400 */}
                            <stop offset="100%" stopColor="#3b82f6" /> {/* Blue 500 */}
                        </linearGradient>
                         <linearGradient id="waveGradient3" x1="0" x2="0" y1="0" y2="1">
                            <stop offset="0%" stopColor="#1d4ed8" /> {/* Blue 700 */}
                            <stop offset="100%" stopColor="#1e3a8a" /> {/* Blue 900 */}
                        </linearGradient>
                    </defs>
                    
                    {/* Back Wave (Lightest) */}
                    <motion.path
                        d="M-100,60 C-50,50 0,70 50,60 S 150,50 200,60 V 120 H -100 Z"
                        fill="url(#waveGradient1)"
                        initial={{ x: 0 }}
                        animate={{ x: -100 }}
                        transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                    />
                    
                    {/* Middle Wave */}
                    <motion.path
                        d="M-100,70 C-50,80 0,60 50,70 S 150,80 200,70 V 120 H -100 Z"
                        fill="url(#waveGradient2)"
                        initial={{ x: 0 }}
                        animate={{ x: -100 }}
                        transition={{ duration: 3.5, repeat: Infinity, ease: "linear" }}
                        style={{ opacity: 0.8 }}
                    />

                    {/* Front Wave (Darkest) */}
                    <motion.path
                        d="M-100,80 C-50,70 0,90 50,80 S 150,70 200,80 V 120 H -100 Z"
                        fill="url(#waveGradient3)"
                        initial={{ x: 0 }}
                        animate={{ x: -100 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    />
                    
                    {/* Sun/Moon reflection or bubble */}
                    <motion.circle 
                        cx="70" cy="30" r="8" 
                        fill="#fef08a" 
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.5, duration: 1 }}
                    />
                </svg>
             </div>
        </div>
    );
};

const EmptyStateAnimation = () => {
    return (
        <div className="flex flex-col items-center justify-center py-20 min-h-[400px]">
             <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1, y: [0, -10, 0] }}
                transition={{ 
                    scale: { duration: 0.5 },
                    opacity: { duration: 0.5 },
                    y: { duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.5 }
                }}
                className="w-64 h-64 relative mb-6"
            >
                <div className="absolute inset-0 bg-yellow-400/20 blur-[60px] rounded-full animate-pulse" />
                <img 
                    src={moneyBagImg} 
                    alt="No expenses" 
                    className="w-full h-full object-contain relative z-10 drop-shadow-2xl" 
                />
                
                {/* Floating particles */}
                <motion.div 
                    animate={{ y: [0, -20, 0], opacity: [0, 1, 0] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0 }}
                    className="absolute top-0 right-10 text-4xl"
                >✨</motion.div>
                <motion.div 
                    animate={{ y: [0, -15, 0], opacity: [0, 1, 0] }}
                    transition={{ duration: 2.5, repeat: Infinity, delay: 1 }}
                    className="absolute bottom-10 left-10 text-3xl"
                >💰</motion.div>
            </motion.div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">No expenses yet</h3>
            <p className="text-gray-500 mb-8 max-w-xs text-center">Your spending history is clean! Add your first record to see insights.</p>
        </div>
    );
};

const EmptyStateDaisy = () => {
    return (
        <div className="w-24 h-24 mx-auto mb-4 relative flex items-center justify-center">
            <svg width="100" height="100" viewBox="0 0 100 100" className="overflow-visible">
                <defs>
                    <linearGradient id="es-petalGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#ffffff" />
                        <stop offset="100%" stopColor="#fff7ed" /> 
                    </linearGradient>
                        <radialGradient id="es-centerGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                        <stop offset="0%" stopColor="#facc15" />
                        <stop offset="100%" stopColor="#ea580c" />
                    </radialGradient>
                    <filter id="es-dropshadow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur in="SourceAlpha" stdDeviation="1" />
                        <feOffset dx="0" dy="1" result="offsetblur" />
                        <feComponentTransfer>
                            <feFuncA type="linear" slope="0.2" />
                        </feComponentTransfer>
                        <feMerge> 
                            <feMergeNode />
                            <feMergeNode in="SourceGraphic" /> 
                        </feMerge>
                    </filter>
                </defs>
                <g transform="translate(50, 50)">
                        {Array.from({ length: 12 }).map((_, i) => (
                            <g key={i} transform={`rotate(${-30 * i})`}>
                                <motion.path
                                d="M0,0 C8,-15 12,-35 0,-42 C-12,-35 -8,-15 0,0"
                                fill="url(#es-petalGradient)"
                                stroke="#fce7f3" 
                                strokeWidth="0.5"
                                filter="url(#es-dropshadow)"
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ 
                                    delay: i * 0.08, 
                                    duration: 0.6,
                                    type: "spring",
                                    stiffness: 100
                                }}
                                style={{ transformOrigin: "0px 0px" }}
                                />
                            </g>
                        ))}
                        <motion.circle 
                        cx="0" cy="0" r="9" 
                        fill="url(#es-centerGradient)"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 1.0, duration: 0.4 }}
                        />
                </g>
            </svg>
        </div>
    );
};

export function Expenses() {
  const { theme } = useTheme();
  const [expenses, setExpenses] = useState<ExpenseEntry[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState<any>(null);
  
  // Theme Helpers
  const getCardClass = () => {
     switch(theme) {
         case 'ocean': return "bg-slate-800/50 border-0 text-white backdrop-blur-xl shadow-xl";
         case 'ink': return "bg-white border-2 border-black text-black shadow-[6px_6px_0px_0px_black] rounded-xl";
         default: return "glass-card border-0 rounded-[2rem]";
     }
  };

  const getZenCardStyle = (type: 'expense' | 'income' | 'balance' | 'count') => {
      if (theme !== 'zen') return {};
      
      // Zen Theme Palette: Even lighter, softer "Particle Gradient" feel
      // Using very subtle radial gradients
      
      const styles = {
          expense: { // Gray (Stone) - Very faint
              background: 'radial-gradient(circle at 0% 0%, #fafaf9 0%, #f5f5f4 100%)',
              border: '0',
              boxShadow: '0 4px 20px -2px rgba(120, 113, 108, 0.05)',
              color: '#57534e' 
          },
          income: { // Green (Emerald) - Very faint
              background: 'radial-gradient(circle at 0% 0%, #f0fdf4 0%, #dcfce7 100%)',
              border: '0',
              boxShadow: '0 4px 20px -2px rgba(16, 185, 129, 0.05)',
              color: '#15803d'
          },
          balance: { // Yellow (Amber) - Very faint
              background: 'radial-gradient(circle at 0% 0%, #fffbeb 0%, #fef3c7 100%)',
              border: '0',
              boxShadow: '0 4px 20px -2px rgba(245, 158, 11, 0.05)',
              color: '#b45309'
          },
          count: { // White/Ghost
              background: 'radial-gradient(circle at 0% 0%, #ffffff 0%, #fafafa 100%)',
              border: '0',
              boxShadow: '0 4px 20px -2px rgba(113, 113, 122, 0.05)',
              color: '#71717a'
          }
      };

      return {
          ...styles[type],
          borderRadius: '1.5rem', 
          position: 'relative' as const,
          overflow: 'hidden' as const
      };
  };

  const getButtonClass = () => {
      switch(theme) {
          case 'ocean': return "bg-cyan-500 text-slate-900 hover:bg-cyan-400";
          case 'ink': return "bg-black text-white hover:bg-gray-800 border-2 border-transparent active:border-black rounded-lg";
          default: return "bg-black text-white hover:bg-gray-800 shadow-lg";
      }
  };

  const getInputClass = () => {
     switch(theme) {
         case 'ocean': return "bg-slate-900/60 border-0 text-white placeholder:text-slate-500 rounded-xl";
         case 'ink': return "bg-white border-2 border-black text-black rounded-lg placeholder:text-gray-400";
         default: return "bg-white/50 border-0 rounded-xl";
     }
  };
  
  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("food");
  const [customCategory, setCustomCategory] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  
  useEffect(() => {
    loadExpenses();
  }, []);
  
  const loadExpenses = () => {
    const data = getExpenses();
    setExpenses(data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  };
  
  const handleOpenDialog = (expense?: ExpenseEntry) => {
    if (expense) {
        setEditingId(expense.id);
        setAmount(expense.amount.toString());
        setType(expense.type);
        setDate(expense.date);
        setDescription(expense.description || "");
        
        // Check if category exists in predefined list
        const isPredefined = CATEGORIES.some(c => c.value === expense.category);
        if (isPredefined) {
            setCategory(expense.category);
            setCustomCategory("");
        } else {
            setCategory("custom");
            setCustomCategory(expense.category);
        }
    } else {
        resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    
    const finalCategory = category === "custom" ? (customCategory.trim() || "Custom") : category;

    const expense: ExpenseEntry = {
      id: editingId || `${Date.now()}`,
      date,
      amount: parseFloat(amount),
      category: finalCategory,
      description,
      type,
    };
    
    saveExpense(expense);
    loadExpenses();
    setIsDialogOpen(false);
    resetForm();
    toast.success(editingId ? "Transaction updated" : (type === 'expense' ? "Expense saved" : "Income saved"));
  };
  
  const handleDelete = (id: string) => {
    deleteExpense(id);
    loadExpenses();
    toast.success("Deleted");
  };
  
  const resetForm = () => {
    setEditingId(null);
    setAmount("");
    setCategory("food");
    setCustomCategory("");
    setDescription("");
    setType('expense');
    setDate(format(new Date(), 'yyyy-MM-dd'));
  };
  
  // Calculate statistics
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  
  const thisMonthExpenses = expenses.filter(e => {
    const eDate = new Date(e.date);
    return eDate >= monthStart && eDate <= monthEnd;
  });
  
  const totalExpense = thisMonthExpenses
    .filter(e => e.type === 'expense')
    .reduce((sum, e) => sum + e.amount, 0);
  
  const totalIncome = thisMonthExpenses
    .filter(e => e.type === 'income')
    .reduce((sum, e) => sum + e.amount, 0);
  
  const balance = totalIncome - totalExpense;
  
  // Category breakdown logic
  const categoryMap = new Map<string, { value: number, color: string, label: string }>();

  thisMonthExpenses.filter(e => e.type === 'expense').forEach((e, index) => {
      const predefined = CATEGORIES.find(c => c.value === e.category);
      const key = e.category;
      
      // Use pastel palette for charts
      const color = getChartColor(Array.from(categoryMap.keys()).length, theme); // deterministic color based on order
      
      const current = categoryMap.get(key) || { 
          value: 0, 
          color: color, 
          label: predefined ? predefined.label : e.category 
      };
      
      current.value += e.amount;
      categoryMap.set(key, current);
  });

  const categoryData = Array.from(categoryMap.entries()).map(([key, data]) => ({
      name: data.label,
      value: data.value,
      color: data.color
  })).sort((a, b) => b.value - a.value);
  
  // Last month comparison
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
  
  const lastMonthExpense = expenses
    .filter(e => {
      const eDate = new Date(e.date);
      return eDate >= lastMonthStart && eDate <= lastMonthEnd && e.type === 'expense';
    })
    .reduce((sum, e) => sum + e.amount, 0);
  
  const percentageChange = lastMonthExpense > 0 
    ? ((totalExpense - lastMonthExpense) / lastMonthExpense) * 100 
    : 0;
  
  return (
    <div className="space-y-8 max-w-6xl mx-auto p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className={cn("text-4xl font-bold bg-clip-text text-transparent",
            theme === 'ocean' ? "bg-gradient-to-r from-cyan-400 to-blue-500" :
            theme === 'ink' ? "text-black font-['Rubik_Dirt'] tracking-wider" :
            theme === 'zen' ? "bg-gradient-to-r from-emerald-600 to-teal-600" :
            "bg-gradient-to-r from-purple-600 to-pink-600"
        )}>Expenses</h2>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()} className={cn("relative flex items-center justify-center rounded-full h-12 px-6 transition-transform active:scale-95 w-48", getButtonClass())}>
              <Plus className="absolute left-5 w-5 h-5" />
              <span>Add Record</span>
            </Button>
          </DialogTrigger>
          <DialogContent className={cn("max-w-md", 
              theme === 'ocean' ? "bg-slate-800 border border-white/10 text-white shadow-2xl" :
              theme === 'ink' ? "bg-white border-2 border-black text-black shadow-[8px_8px_0px_0px_black] rounded-xl" :
              "glass-card bg-white/80 backdrop-blur-2xl border-white/20 shadow-2xl sm:rounded-3xl"
          )}>
            <DialogHeader>
              <DialogTitle className={cn(theme === 'ocean' && "text-white")}>{editingId ? "Edit Transaction" : "Add Transaction"}</DialogTitle>
              <DialogDescription className={cn(theme === 'ocean' && "text-slate-400")}>Record your income or expense</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-5 mt-2">
              <div className="space-y-2">
                <Label className={cn(theme === 'ocean' && "text-slate-300")}>Type</Label>
                <div className={cn("flex p-1 rounded-xl", theme === 'ocean' ? "bg-slate-900" : "bg-gray-100")}>
                    <button
                        type="button"
                        onClick={() => setType('expense')}
                        className={cn(
                            "flex-1 py-2 rounded-lg text-sm font-medium transition-all",
                            type === 'expense' 
                                ? (theme === 'ocean' ? "bg-slate-700 text-red-400 shadow-sm" : theme === 'ink' ? "bg-black text-white" : "bg-white shadow-sm text-red-600")
                                : (theme === 'ocean' ? "text-slate-500 hover:text-slate-300" : "text-gray-500 hover:text-gray-700")
                        )}
                    >
                        Expense
                    </button>
                    <button
                        type="button"
                        onClick={() => setType('income')}
                        className={cn(
                            "flex-1 py-2 rounded-lg text-sm font-medium transition-all",
                            type === 'income' 
                                ? (theme === 'ocean' ? "bg-slate-700 text-green-400 shadow-sm" : theme === 'ink' ? "bg-black text-white" : "bg-white shadow-sm text-green-600")
                                : (theme === 'ocean' ? "text-slate-500 hover:text-slate-300" : "text-gray-500 hover:text-gray-700")
                        )}
                    >
                        Income
                    </button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label className={cn(theme === 'ocean' && "text-slate-300")}>Amount ($)</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  className={cn("text-2xl h-14 focus-visible:ring-2 focus-visible:ring-primary/20 text-center font-bold", getInputClass())}
                />
              </div>
              
              {type === 'expense' && (
                <div className="space-y-2">
                  <Label className={cn(theme === 'ocean' && "text-slate-300")}>Category</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className={cn("h-12 focus:ring-2 focus:ring-primary/20", getInputClass())}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className={cn("max-h-[300px]", 
                        theme === 'ocean' ? "bg-slate-800 border-white/10 text-white" : 
                        theme === 'ink' ? "bg-white border-2 border-black" : 
                        "glass-card border-0"
                    )}>
                      {CATEGORIES.map(cat => (
                        <SelectItem key={cat.value} value={cat.value} className={cn(theme === 'ocean' && "focus:bg-slate-700 focus:text-white")}>
                          {cat.label}
                        </SelectItem>
                      ))}
                      <SelectItem value="custom" className={cn(theme === 'ocean' && "focus:bg-slate-700 focus:text-white")}>✏️ Custom...</SelectItem>
                    </SelectContent>
                  </Select>
                  {category === "custom" && (
                    <Input 
                        placeholder="Enter category name"
                        value={customCategory}
                        onChange={(e) => setCustomCategory(e.target.value)}
                        className={cn("h-12 mt-2", getInputClass())}
                        autoFocus
                    />
                  )}
                </div>
              )}
              
              <div className="space-y-2">
                <Label className={cn(theme === 'ocean' && "text-slate-300")}>Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "relative w-full font-normal h-12 hover:bg-white/80",
                        !date && "text-muted-foreground",
                        getInputClass()
                      )}
                    >
                      <CalendarIcon className="absolute left-4 h-4 w-4" />
                      {date ? format(parseISO(date), "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className={cn("w-auto p-0 shadow-2xl overflow-hidden", 
                      theme === 'ocean' ? "bg-slate-800 border-white/10 text-white rounded-xl" :
                      "rounded-2xl border-0 glass-card"
                  )} align="center">
                     <div className={cn("p-4", theme === 'ocean' ? "bg-slate-800" : "bg-white/60 backdrop-blur-xl")}>
                        <Calendar
                          mode="single"
                          selected={parseISO(date)}
                          onSelect={(d) => d && setDate(format(d, 'yyyy-MM-dd'))}
                          initialFocus
                          className={cn("rounded-xl border-0", theme === 'ocean' && "dark")}
                        />
                     </div>
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-2">
                <Label className={cn(theme === 'ocean' && "text-slate-300")}>Note</Label>
                <Input
                  placeholder="Optional note"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className={cn("h-12", getInputClass())}
                />
              </div>
              
              <Button type="submit" className={cn("w-full h-12 rounded-xl text-lg font-bold shadow-lg mt-4", getButtonClass())}>
                {editingId ? "Update Transaction" : "Save Transaction"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className={cn("hover:shadow-xl transition-all duration-300", getCardClass())} style={getZenCardStyle('expense')}>
          <CardContent className="pt-8 pb-8 flex flex-col items-center justify-center text-center">
            <div className={cn("w-10 h-10 rounded-full flex items-center justify-center mb-3", theme === 'ocean' ? "bg-red-900/30" : "bg-red-50")}>
                <TrendingDown className="w-5 h-5 text-red-500" />
            </div>
            <p className={cn("text-xs font-bold uppercase tracking-wider mb-1", theme === 'ocean' ? "text-slate-400" : "text-muted-foreground")}>Expenses</p>
            <p className={cn("text-3xl font-bold", theme === 'ocean' ? "text-white" : "text-foreground")}>${totalExpense.toFixed(2)}</p>
            {percentageChange !== 0 && (
              <div className={cn("flex items-center gap-1 mt-2 text-sm px-2 py-0.5 rounded-full", theme === 'ocean' ? "bg-slate-700" : "bg-white/50")}>
                {percentageChange > 0 ? (
                    <span className="text-red-500 font-medium">+{percentageChange.toFixed(1)}%</span>
                ) : (
                    <span className="text-green-500 font-medium">{percentageChange.toFixed(1)}%</span>
                )}
                <span className={cn("text-xs", theme === 'ocean' ? "text-slate-400" : "text-muted-foreground")}>vs last month</span>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card className={cn("hover:shadow-xl transition-all duration-300", getCardClass())} style={getZenCardStyle('income')}>
          <CardContent className="pt-8 pb-8 flex flex-col items-center justify-center text-center">
            <div className={cn("w-10 h-10 rounded-full flex items-center justify-center mb-3", theme === 'ocean' ? "bg-green-900/30" : "bg-green-50")}>
                <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <p className={cn("text-xs font-bold uppercase tracking-wider mb-1", theme === 'ocean' ? "text-slate-400" : "text-muted-foreground")}>Income</p>
            <p className={cn("text-3xl font-bold", theme === 'ocean' ? "text-white" : "text-foreground")}>${totalIncome.toFixed(2)}</p>
          </CardContent>
        </Card>
        
        <Card className={cn("hover:shadow-xl transition-all duration-300", getCardClass())} style={getZenCardStyle('balance')}>
          <CardContent className="pt-8 pb-8 flex flex-col items-center justify-center text-center">
            <div className={cn("w-10 h-10 rounded-full flex items-center justify-center mb-3", theme === 'ocean' ? "bg-blue-900/30" : "bg-blue-50")}>
                <div className="w-5 h-5 text-blue-500 font-bold flex items-center justify-center">$</div>
            </div>
            <p className={cn("text-xs font-bold uppercase tracking-wider mb-1", theme === 'ocean' ? "text-slate-400" : "text-muted-foreground")}>Balance</p>
            <p className={`text-3xl font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${balance.toFixed(2)}
            </p>
          </CardContent>
        </Card>
        
        <Card className={cn("hover:shadow-xl transition-all duration-300", getCardClass())} style={getZenCardStyle('count')}>
          <CardContent className="pt-8 pb-8 flex flex-col items-center justify-center text-center">
             <div className={cn("w-10 h-10 rounded-full flex items-center justify-center mb-3", theme === 'ocean' ? "bg-purple-900/30" : "bg-purple-50")}>
                <div className="w-5 h-5 text-purple-500 font-bold flex items-center justify-center">#</div>
            </div>
            <p className={cn("text-xs font-bold uppercase tracking-wider mb-1", theme === 'ocean' ? "text-slate-400" : "text-muted-foreground")}>Count</p>
            <p className={cn("text-3xl font-bold", theme === 'ocean' ? "text-white" : "text-foreground")}>{thisMonthExpenses.length}</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Charts or Empty State */}
      {categoryData.length > 0 && (
        <div className="grid md:grid-cols-2 gap-4">
          <Card className={cn("hover:shadow-xl transition-all duration-300", getCardClass())}>
            <CardHeader className="pb-0">
              <CardTitle className={cn(theme === 'ocean' && "text-white")}>Spending by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative h-[250px] w-full">
                <PandaAnimation />
                <DaisyAnimation />
                <BambooAnimation />
                <ZenRainAnimation />
                <WaveAnimation />
                
                {/* Custom Tooltip Overlay - positioned top left of the chart area */}
                {hoveredCategory && (
                    <div className={cn(
                        "absolute top-0 right-0 z-20 p-3 rounded-xl shadow-lg border backdrop-blur-sm pointer-events-none transition-all duration-200 animate-in fade-in zoom-in-95",
                        theme === 'ocean' 
                            ? "bg-slate-800/90 border-slate-700 text-white" 
                            : "bg-white/90 border-gray-100 text-gray-800"
                    )}>
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: hoveredCategory.color }} />
                            <span className="text-sm font-semibold">{hoveredCategory.name}</span>
                        </div>
                        <div className="text-xl font-bold">
                            ${Number(hoveredCategory.value).toFixed(2)}
                        </div>
                        <div className={cn("text-xs mt-0.5", theme === 'ocean' ? "text-slate-400" : "text-gray-500")}>
                            {((hoveredCategory.value / (expenses.reduce((acc, curr) => acc + curr.amount, 0) || 1)) * 100).toFixed(1)}% of total
                        </div>
                    </div>
                )}

                <ResponsiveContainer width="100%" height="100%" className="z-10 relative">
                  <PieChart>
                  <Pie
                    data={categoryData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={90}
                    paddingAngle={5}
                    stroke={theme === 'ocean' ? "rgba(0,0,0,0)" : "#fff"}
                    onMouseEnter={(data) => setHoveredCategory(data)}
                    onMouseLeave={() => setHoveredCategory(null)}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <Legend 
                    verticalAlign="bottom" 
                    height={36}
                    iconType="circle"
                    formatter={(value) => <span className={cn("text-xs font-medium ml-1", theme === 'ocean' ? "text-slate-400" : "text-gray-500")}>{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <Card className={cn("hover:shadow-xl transition-all duration-300", getCardClass())}>
            <CardHeader className="pb-0">
              <CardTitle className={cn(theme === 'ocean' && "text-white")}>Spending Details</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'ocean' ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)"} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tickFormatter={(val) => val.split(' ')[0]} tick={{ fill: theme === 'ocean' ? '#94a3b8' : '#666' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: theme === 'ocean' ? '#94a3b8' : '#666' }} />
                  <Tooltip 
                    cursor={{fill: theme === 'ocean' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}}
                    contentStyle={{ 
                        borderRadius: '12px', 
                        border: 'none', 
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                        backgroundColor: theme === 'ocean' ? '#1e293b' : '#fff',
                        color: theme === 'ocean' ? '#fff' : '#000'
                    }}
                  />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* Recent Transactions */}
      <Card className={cn("shadow-lg mb-4", getCardClass())}>
        <CardHeader className="pb-2">
          <CardTitle className={cn(theme === 'ocean' && "text-white")}>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {expenses.length === 0 ? (
            <div className="text-center py-6">
                <EmptyStateDaisy />
                <p className={cn("mb-1 text-xs", theme === 'ocean' ? "text-slate-400" : "text-gray-500")}>No transactions yet</p>
                <p className={cn("text-[10px]", theme === 'ocean' ? "text-slate-500" : "text-gray-400")}>Add your first record</p>
            </div>
          ) : (
            <div className="space-y-1">
              {expenses.slice(0, 5).map((expense, index) => {
                const cat = CATEGORIES.find(c => c.value === expense.category);
                const isCustom = !cat;
                
                // Extract text name for display and initial
                const displayName = isCustom 
                    ? expense.category 
                    : (cat.label.includes(' ') ? cat.label.split(' ').slice(1).join(' ') : cat.label);
                
                const firstLetter = displayName.charAt(0).toUpperCase();
                
                const color = (isCustom || theme !== 'pastel')
                    ? getChartColor(isCustom ? index : CATEGORIES.findIndex(c => c.value === expense.category), theme)
                    : (cat.color === "#CBF3F0" ? "#2EC4B6" : cat.color);
                
                // For Ocean/Ink themes, use existing logic. For Pastel/Zen, use the new "Particle Gradient" style (White card + Colored Gradient Bar)
                const isZenTheme = theme === 'zen'; 
                
                return (
                  <div
                    key={expense.id}
                    className={cn(
                        "relative flex items-center justify-between py-3 px-4 transition-all duration-200 group overflow-hidden mb-2",
                        theme === 'ocean' ? "bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl" : 
                        theme === 'ink' ? "bg-transparent border-b border-gray-200 hover:bg-gray-50 rounded-none px-2 mb-0" :
                        isZenTheme 
                            ? "hover:brightness-95 border-0 shadow-sm rounded-2xl py-4" // Zen style: More rectangular but rounded
                            : "hover:bg-white/60 bg-white/40 hover:border-white/50 rounded-2xl" // Revert Pastel to old style (glass-like)
                    )}
                    style={isZenTheme ? {
                        // Zen List Item: White with very subtle gradient and left colored bar (simulated)
                        background: '#ffffff',
                        boxShadow: `inset 4px 0 0 0 ${color}`, // Left colored bar using inset shadow to mimic the image
                        border: '1px solid rgba(0,0,0,0.03)',
                        color: '#44403c'
                    } : undefined}
                  >
                    {/* Left Gradient Bar for Zen Theme - REMOVED to match the image which has full gradient background instead */}
                    {/* isZenTheme && ... */}

                    <div className={cn("flex items-center gap-3", isZenTheme && "ml-3")}> {/* Extra margin left for the bar */}
                      <div
                        className={cn("w-10 h-10 rounded-full flex items-center justify-center text-lg shadow-sm transition-transform group-hover:scale-105", theme === 'ink' && "border border-black rounded-lg w-8 h-8 text-sm font-bold")}
                        style={{ 
                            background: theme === 'ink' ? '#fff' : (isZenTheme ? '#f5f5f4' : `${color}20`), // Zen uses very light gray background for icon
                            color: theme === 'ink' ? '#000' : color,
                            boxShadow: isZenTheme ? 'none' : 'none', 
                            // Revert Pastel size/shape if not Zen/Ink/Ocean
                            width: (!isZenTheme && theme !== 'ink') ? '2rem' : undefined,
                            height: (!isZenTheme && theme !== 'ink') ? '2rem' : undefined,
                            borderRadius: (!isZenTheme && theme !== 'ink') ? '0.5rem' : (isZenTheme ? '999px' : undefined), 
                            fontSize: (!isZenTheme && theme !== 'ink') ? '0.875rem' : undefined
                        }}
                      >
                         {/* For Zen theme, use emoji. For others, revert to letter unless specifically wanted */}
                         {theme === 'ink' ? firstLetter : (
                             isZenTheme ? (!isCustom ? cat.label.split(' ')[0] : firstLetter) : firstLetter
                         )}
                      </div>
                      <div>
                        <p className={cn("font-bold text-sm", theme === 'ocean' ? "text-slate-200" : (isZenTheme ? "text-slate-700" : "text-gray-800"))}>
                          {displayName}
                        </p>
                        <p className={cn("text-[10px] font-medium mt-0.5", theme === 'ocean' ? "text-slate-500" : (isZenTheme ? "text-slate-500" : "text-muted-foreground"))}>
                          {format(new Date(expense.date), 'MMM dd')}
                          {expense.description && ` · ${expense.description}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className={`font-bold text-sm mr-2 ${expense.type === 'expense' ? 'text-red-500' : 'text-green-600'}`}>
                        {expense.type === 'expense' ? '-' : '+'}${expense.amount.toFixed(2)}
                      </p>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenDialog(expense)}
                            className={cn("h-6 w-6 rounded-full",
                                theme === 'ocean' ? "text-slate-400 hover:text-blue-400 hover:bg-blue-900/30" : 
                                "text-gray-400 hover:text-blue-500 hover:bg-blue-50"
                            )}
                        >
                            <Edit2 className="w-3 h-3" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(expense.id)}
                            className={cn("h-6 w-6 rounded-full",
                                theme === 'ocean' ? "text-slate-400 hover:text-red-400 hover:bg-red-900/30" : 
                                "text-gray-400 hover:text-red-500 hover:bg-red-50"
                            )}
                        >
                            <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {expenses.length > 5 && (
                <div className="pt-1 flex justify-center">
                    <Button 
                        variant="ghost" 
                        onClick={() => setIsHistoryOpen(true)}
                        className={cn("text-xs font-semibold rounded-full h-7 px-4 transition-all",
                            theme === 'ocean' ? "text-slate-400 hover:text-white hover:bg-slate-700" :
                            "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                        )}
                    >
                        View All
                    </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* All Transactions Dialog */}
      <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
        <DialogContent className={cn("max-w-2xl max-h-[80vh] overflow-y-auto",
            theme === 'ocean' ? "bg-slate-800 border-white/10 text-white" :
            theme === 'ink' ? "bg-white border-2 border-black" :
            "glass-card bg-white/80 backdrop-blur-2xl border-white/20"
        )}>
            <DialogHeader>
                <DialogTitle className={cn(theme === 'ocean' && "text-white")}>Transaction History</DialogTitle>
            </DialogHeader>
            <div className="space-y-2 mt-4">
                {expenses.length === 0 ? (
                    <p className="text-center text-muted-foreground">No records found.</p>
                ) : (
                    expenses.map(expense => (
                        <div key={expense.id} className={cn("flex justify-between items-center p-3 rounded-xl border transition-colors",
                            theme === 'ocean' ? "bg-slate-900/50 border-white/5 hover:bg-slate-900" : 
                            theme === 'ink' ? "bg-white border-black hover:bg-gray-50" :
                            "bg-white/50 border-transparent hover:border-gray-200 hover:bg-white/80"
                        )}>
                            <div>
                                <p className={cn("font-bold", theme === 'ocean' ? "text-slate-200" : "text-gray-800")}>{expense.category === 'Custom' ? 'Custom' : expense.category}</p>
                                <p className="text-xs text-muted-foreground">{format(new Date(expense.date), 'PPP')}</p>
                            </div>
                            <span className={cn("font-bold", expense.type === 'expense' ? "text-red-500" : "text-green-600")}>
                                {expense.type === 'expense' ? '-' : '+'}${expense.amount.toFixed(2)}
                            </span>
                        </div>
                    ))
                )}
            </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}