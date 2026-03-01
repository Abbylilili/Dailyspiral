import type { ReactNode } from 'react';
import { Music, Wind, BookOpen, Coffee, Activity, Phone, Sun, CloudRain } from "lucide-react";
import type { Theme } from "@/app/contexts/ThemeContext";

export interface Recommendation {
  icon: ReactNode;
  title: string;
  subtitle: string;
  style: any;
}

export const getRecommendations = (mood: number, theme: Theme, t: (key: string) => string): Recommendation[] => {
    // 强化版细闪噪点
    const sparkleNoise = `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.7'/%3E%3C/svg%3E")`;
    
    const commonStyles = {
        backgroundSize: 'cover',
        backgroundBlendMode: 'overlay, screen, normal' as const,
        border: 'none',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative' as const,
    };

    // --- 各主题色彩库 ---
    
    const pastelLib = [
        { 
            ...commonStyles, 
            backgroundImage: `${sparkleNoise}, radial-gradient(circle at 50% 50%, rgba(255,255,255,0.6) 0%, transparent 100%), linear-gradient(135deg, #FEF9C3 0%, #FFF9C4 100%)`, 
            color: '#854D0E',
            boxShadow: '0 10px 25px -5px rgba(254, 249, 195, 0.5)'
        },
        { 
            ...commonStyles, 
            backgroundImage: `${sparkleNoise}, radial-gradient(circle at 80% 20%, rgba(255,255,255,0.8) 0%, transparent 50%), linear-gradient(135deg, #FFF0E6 0%, #FFDFD4 100%)`, 
            color: '#C2410C',
            boxShadow: '0 10px 25px -5px rgba(255, 240, 230, 0.5)'
        },
        { 
            ...commonStyles, 
            backgroundImage: `${sparkleNoise}, radial-gradient(circle at 20% 20%, rgba(255,255,255,0.8) 0%, transparent 50%), linear-gradient(135deg, #E6E6FA 0%, #D8D9FF 100%)`, 
            color: '#4F46E5',
            boxShadow: '0 10px 25px -5px rgba(230, 230, 250, 0.5)'
        }
    ];

    const zenLib = [
        // 1. 淡黄色 (新加入)
        { 
            ...commonStyles, 
            backgroundImage: `${sparkleNoise}, linear-gradient(135deg, #fef9c3 0%, #fef3c7 100%)`, 
            color: '#854d0e',
            boxShadow: '0 10px 20px -5px rgba(254, 243, 199, 0.4)'
        },
        // 2. 薄荷绿 (原第一个)
        { 
            ...commonStyles, 
            backgroundImage: `${sparkleNoise}, linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)`, 
            color: '#166534',
            boxShadow: '0 10px 20px -5px rgba(220, 252, 231, 0.4)'
        },
        // 3. 翠绿/青色 (原第二个)
        { 
            ...commonStyles, 
            backgroundImage: `${sparkleNoise}, linear-gradient(135deg, #ecfdf5 0%, #ccfbf1 100%)`, 
            color: '#0f766e',
            boxShadow: '0 10px 20px -5px rgba(204, 251, 241, 0.4)'
        }
    ];

    const oceanLib = [
        { ...commonStyles, backgroundImage: `${sparkleNoise}, linear-gradient(135deg, #1e293b 0%, #0f172a 100%)`, color: '#94a3b8' },
        { ...commonStyles, backgroundImage: `${sparkleNoise}, linear-gradient(135deg, #1e293b 0%, #0f172a 100%)`, color: '#94a3b8' },
        { ...commonStyles, backgroundImage: `${sparkleNoise}, linear-gradient(135deg, #1e293b 0%, #0f172a 100%)`, color: '#94a3b8' }
    ];

    const getThemeLib = () => {
        switch(theme) {
            case 'ocean': return oceanLib;
            case 'ink': return Array(3).fill({ backgroundColor: '#ffffff', border: '2px solid #000000', boxShadow: '4px 4px 0px 0px #000000', color: '#000000' });
            case 'zen': return zenLib;
            default: return pastelLib;
        }
    };

    const lib = getThemeLib();

    if (mood <= 3) {
        return [
            { icon: <CloudRain className="w-6 h-6" />, title: t("mood.rec.comfortPlaylist"), subtitle: t("mood.rec.music20min"), style: lib[0] },
            { icon: <Wind className="w-6 h-6" />, title: t("mood.rec.deepBreathing"), subtitle: t("mood.rec.wellness5min"), style: lib[1] },
            { icon: <BookOpen className="w-6 h-6" />, title: t("mood.rec.ventJournal"), subtitle: t("mood.rec.writing10min"), style: lib[2] },
        ];
    } else if (mood <= 6) {
        return [
            { icon: <Coffee className="w-6 h-6" />, title: t("mood.rec.lofiBeats"), subtitle: t("mood.rec.musicFocus"), style: lib[0] },
            { icon: <Activity className="w-6 h-6" />, title: t("mood.rec.shortWalk"), subtitle: t("mood.rec.health15min"), style: lib[1] },
            { icon: <BookOpen className="w-6 h-6" />, title: t("mood.rec.readChapter"), subtitle: t("mood.rec.relax15min"), style: lib[2] },
        ];
    }
    
    return [
        { icon: <Sun className="w-6 h-6" />, title: t("mood.rec.upbeatHits"), subtitle: t("mood.rec.musicEnergy"), style: lib[0] },
        { icon: <Activity className="w-6 h-6" />, title: t("mood.rec.quickWorkout"), subtitle: t("mood.rec.fitness20min"), style: lib[1] },
        { icon: <Phone className="w-6 h-6" />, title: t("mood.rec.callFriend"), subtitle: t("mood.rec.social10min"), style: lib[2] },
    ];
};
