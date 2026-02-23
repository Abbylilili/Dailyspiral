import { useMemo } from "react";
import type { Habit, HabitEntry } from "@/app/lib/storage";
import { format, getDaysInMonth } from "date-fns";

interface HabitCircularViewProps {
  habits: Habit[];
  entries: HabitEntry[];
  year: number;
  month: number;
  onToggleHabit?: (habitId: string, date: string) => void;
}

export function HabitCircularView({ habits, entries, year, month, onToggleHabit }: HabitCircularViewProps) {
  const daysInMonth = getDaysInMonth(new Date(year, month - 1));
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  
  const trackHeight = 24;
  const minInnerRadius = 80;
  const baseOuterRadius = 240;
  const requiredOuterRadius = minInnerRadius + (Math.max(habits.length, 6) * trackHeight);
  const outerRadius = Math.max(baseOuterRadius, requiredOuterRadius);
  const padding = 320;
  const svgSize = (outerRadius * 2) + padding;
  const centerX = svgSize / 2; 
  const centerY = svgSize / 2;
  
  const startAngle = -Math.PI / 2;
  const totalAngle = (300 * Math.PI) / 180;
  const anglePerDay = totalAngle / daysInMonth;
  
  const dateRingRadius = outerRadius + 28;
  const dateTrackHeight = 20;
  const currentDay = (new Date().getFullYear() === year && new Date().getMonth() + 1 === month) ? new Date().getDate() : -1;
  
  const dateRing = useMemo(() => {
    const elements: JSX.Element[] = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const dayAngle = startAngle + (day - 1) * anglePerDay;
      const nextAngle = startAngle + day * anglePerDay;
      const midAngle = (dayAngle + nextAngle) / 2;
      
      const x1 = centerX + dateRingRadius * Math.cos(dayAngle);
      const y1 = centerY + dateRingRadius * Math.sin(dayAngle);
      const x2 = centerX + dateRingRadius * Math.cos(nextAngle);
      const y2 = centerY + dateRingRadius * Math.sin(nextAngle);
      const x3 = centerX + (dateRingRadius - dateTrackHeight) * Math.cos(nextAngle);
      const y3 = centerY + (dateRingRadius - dateTrackHeight) * Math.sin(nextAngle);
      const x4 = centerX + (dateRingRadius - dateTrackHeight) * Math.cos(dayAngle);
      const y4 = centerY + (dateRingRadius - dateTrackHeight) * Math.sin(dayAngle);
      
      const pathData = `M ${x1} ${y1} A ${dateRingRadius} ${dateRingRadius} 0 0 1 ${x2} ${y2} L ${x3} ${y3} A ${dateRingRadius - dateTrackHeight} ${dateRingRadius - dateTrackHeight} 0 0 0 ${x4} ${y4} Z`;
      const isToday = day === currentDay;

      elements.push(
        <g key={`date-${day}`}>
          <path d={pathData} fill={isToday ? "#FF3B30" : "#e5e7eb"} stroke="#ffffff" strokeWidth={0.5} />
          <text x={centerX + (dateRingRadius - 10) * Math.cos(midAngle)} y={centerY + (dateRingRadius - 10) * Math.sin(midAngle)} textAnchor="middle" dominantBaseline="middle" className={cn(isToday ? "fill-white font-bold" : "fill-gray-600")} fontSize={isToday ? "12" : "10"} transform={`rotate(${(midAngle * 180) / Math.PI + 90}, ${centerX + (dateRingRadius - 10) * Math.cos(midAngle)}, ${centerY + (dateRingRadius - 10) * Math.sin(midAngle)})`}>{day}</text>
        </g>
      );
    }
    return elements;
  }, [daysInMonth, anglePerDay, dateRingRadius, centerX, centerY, currentDay]);
  
  const renderSpiralHabits = useMemo(() => {
    const elements: JSX.Element[] = [];
    habits.forEach((habit, habitIndex) => {
      const trackRadius = outerRadius - habitIndex * trackHeight;
      const innerR = trackRadius - trackHeight + 1;
      const outerR = trackRadius - 1;
      
      for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = format(new Date(year, month - 1, day), 'yyyy-MM-dd');
        const completed = entries.find(e => e.habitId === habit.id && e.date === dateStr)?.completed ?? false;
        const isFuture = dateStr > todayStr;
        
        const dayAngle = startAngle + (day - 1) * anglePerDay;
        const nextAngle = startAngle + day * anglePerDay;
        const x1 = centerX + outerR * Math.cos(dayAngle);
        const y1 = centerY + outerR * Math.sin(dayAngle);
        const x2 = centerX + outerR * Math.cos(nextAngle);
        const y2 = centerY + outerR * Math.sin(nextAngle);
        const x3 = centerX + innerR * Math.cos(nextAngle);
        const y3 = centerY + innerR * Math.sin(nextAngle);
        const x4 = centerX + innerR * Math.cos(dayAngle);
        const y4 = centerY + innerR * Math.sin(dayAngle);
        
        const pathData = `M ${x1} ${y1} A ${outerR} ${outerR} 0 0 1 ${x2} ${y2} L ${x3} ${y3} A ${innerR} ${innerR} 0 0 0 ${x4} ${y4} Z`;
        
        elements.push(
          <path
            key={`${habit.id}-${day}`}
            d={pathData}
            fill={completed ? habit.color : '#f3f4f6'}
            fillOpacity={isFuture ? 0.3 : 1}
            stroke="#ffffff"
            strokeWidth={0.5}
            className={`transition-all ${isFuture ? 'cursor-not-allowed' : 'hover:opacity-80 cursor-pointer'}`}
            onClick={isFuture ? undefined : () => onToggleHabit?.(habit.id, dateStr)}
          />
        );
      }
    });
    return elements;
  }, [habits, entries, daysInMonth, year, month, anglePerDay, outerRadius, centerX, centerY, onToggleHabit]);
  
  const habitLabels = useMemo(() => {
    return habits.map((habit, i) => {
      const r = outerRadius - i * trackHeight - trackHeight / 2;
      const x = centerX + r * Math.cos(startAngle);
      const y = centerY + r * Math.sin(startAngle);
      return (
        <g key={`label-${habit.id}`}>
          <line x1={x} y1={y} x2={x - 160} y2={y} stroke="#9ca3af" strokeWidth={1.5} />
          <circle cx={x} cy={y} r={2} fill={habit.color} />
          <text x={x - 150} y={y - 5} className="fill-muted-foreground font-medium text-sm">{habit.name}</text>
        </g>
      );
    });
  }, [habits, outerRadius, centerX, centerY]);
  
  return (
    <div className="flex flex-col items-center">
      <svg width={svgSize} height={svgSize} viewBox={`0 0 ${svgSize} ${svgSize}`} className="max-w-full h-auto">
        <defs><linearGradient id="textGradient" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#8B5CF6" /><stop offset="100%" stopColor="#EC4899" /></linearGradient></defs>
        {dateRing}{renderSpiralHabits}{habitLabels}
        <text x={centerX} y={centerY - 10} textAnchor="middle" dominantBaseline="middle" fill="url(#textGradient)" className="text-5xl font-bold">{format(new Date(year, month - 1), 'MMM')}</text>
        <text x={centerX} y={centerY + 25} textAnchor="middle" dominantBaseline="middle" fill="url(#textGradient)" className="text-2xl font-medium opacity-80">{year}</text>
      </svg>
    </div>
  );
}

function cn(...classes: any[]) { return classes.filter(Boolean).join(' '); }
