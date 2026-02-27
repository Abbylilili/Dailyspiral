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
    // === 100% Original High-Fidelity Styles ===
    const pastelNoise = `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.5'/%3E%3C/svg%3E")`;
    const pastelCommon = {
        backgroundSize: 'cover',
        backgroundBlendMode: 'overlay, normal, normal, normal, normal' as const, 
        border: 'none',
    };

    const pastelWarm = { ...pastelCommon, backgroundImage: `${pastelNoise}, radial-gradient(at 10% 10%, rgba(255, 183, 178, 0.8) 0px, transparent 50%), radial-gradient(at 90% 90%, rgba(255, 218, 193, 0.8) 0px, transparent 50%), linear-gradient(135deg, #fff0f0 0%, #ffdfd4 100%)` };
    const pastelFresh = { ...pastelCommon, backgroundImage: `${pastelNoise}, radial-gradient(at 0% 0%, rgba(162, 210, 255, 0.7) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(205, 240, 234, 0.8) 0px, transparent 50%), linear-gradient(135deg, #e0f7fa 0%, #e8f5e9 100%)` };
    const pastelDreamy = { ...pastelCommon, backgroundImage: `${pastelNoise}, radial-gradient(at 20% 20%, rgba(224, 195, 252, 0.8) 0px, transparent 50%), radial-gradient(at 80% 80%, rgba(199, 206, 234, 0.8) 0px, transparent 50%), linear-gradient(135deg, #f3e8ff 0%, #e0e7ff 100%)` };
    const pastelEnergy = { ...pastelCommon, backgroundImage: `${pastelNoise}, radial-gradient(at 0% 100%, rgba(253, 253, 150, 0.6) 0px, transparent 50%), radial-gradient(at 100% 0%, rgba(255, 255, 210, 0.8) 0px, transparent 50%), linear-gradient(135deg, #fff9c4 0%, #fff3e0 100%)` };

    const oceanCommon = { backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.5)' };
    const inkCommon = { backgroundColor: '#ffffff', border: '2px solid #000000', boxShadow: '4px 4px 0px 0px #000000', borderRadius: '1rem' };

    const getStyle = (p: any, o: any, i: any) => { if (theme === 'ocean') return o; if (theme === 'ink') return i; return p; };

    if (mood <= 3) {
        return [
            { icon: <CloudRain className="text-indigo-500" />, title: t("mood.rec.comfortPlaylist"), subtitle: t("mood.rec.music20min"), style: getStyle(pastelWarm, oceanCommon, inkCommon) },
            { icon: <Wind className="text-teal-600" />, title: t("mood.rec.deepBreathing"), subtitle: t("mood.rec.wellness5min"), style: getStyle(pastelFresh, oceanCommon, inkCommon) },
            { icon: <BookOpen className="text-violet-500" />, title: t("mood.rec.ventJournal"), subtitle: t("mood.rec.writing10min"), style: getStyle(pastelDreamy, oceanCommon, inkCommon) },
        ];
    } else if (mood <= 6) {
        return [
            { icon: <Coffee className="text-stone-600" />, title: t("mood.rec.lofiBeats"), subtitle: t("mood.rec.musicFocus"), style: getStyle(pastelWarm, oceanCommon, inkCommon) },
            { icon: <Activity className="text-emerald-600" />, title: t("mood.rec.shortWalk"), subtitle: t("mood.rec.health15min"), style: getStyle(pastelFresh, oceanCommon, inkCommon) },
            { icon: <BookOpen className="text-indigo-500" />, title: t("mood.rec.readChapter"), subtitle: t("mood.rec.relax15min"), style: getStyle(pastelDreamy, oceanCommon, inkCommon) },
        ];
    }
    
    return [
        { icon: <Sun className="text-amber-500" />, title: t("mood.rec.upbeatHits"), subtitle: t("mood.rec.musicEnergy"), style: getStyle(pastelEnergy, oceanCommon, inkCommon) },
        { icon: <Activity className="text-rose-500" />, title: t("mood.rec.quickWorkout"), subtitle: t("mood.rec.fitness20min"), style: getStyle(pastelWarm, oceanCommon, inkCommon) },
        { icon: <Phone className="text-sky-500" />, title: t("mood.rec.callFriend"), subtitle: t("mood.rec.social10min"), style: getStyle(pastelFresh, oceanCommon, inkCommon) },
    ];
};
