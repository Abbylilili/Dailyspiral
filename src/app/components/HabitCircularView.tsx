import { useMemo } from "react";
import { Habit, isHabitCompleted } from "../lib/storage";
import { format, getDaysInMonth } from "date-fns";

interface HabitCircularViewProps {
  habits: Habit[];
  year: number;
  month: number;
  onToggleHabit?: (habitId: string, date: string) => void;
}

export function HabitCircularView({ habits, year, month, onToggleHabit }: HabitCircularViewProps) {
  const daysInMonth = getDaysInMonth(new Date(year, month - 1));
  
  // Dynamic sizing to accommodate all habits
  const trackHeight = 24;
  const minInnerRadius = 80; // Minimum hole in the center
  const baseOuterRadius = 240;
  
  // Calculate required outer radius to fit all habits while maintaining inner hole
  const requiredOuterRadius = minInnerRadius + (Math.max(habits.length, 6) * trackHeight);
  const outerRadius = Math.max(baseOuterRadius, requiredOuterRadius);
  
  // Calculate SVG size maintaining relative padding
  // Original: 800 size for 240 radius -> 320px total padding (160px per side)
  const padding = 320;
  const svgSize = (outerRadius * 2) + padding;

  // Center the composition perfectly
  const centerX = svgSize / 2; 
  const centerY = svgSize / 2;
  
  const displayHabits = habits; // Show all habits
  
  // Configuration:
  // Start from top (12 o'clock) -> -90 degrees (-PI/2)
  // Draw clockwise for 300 degrees
  const startAngle = -Math.PI / 2;
  const totalDegrees = 300;
  const totalAngle = (totalDegrees * Math.PI) / 180;
  const anglePerDay = totalAngle / daysInMonth;
  
  // Outermost date ring
  const dateRingRadius = outerRadius + 28;
  const dateTrackHeight = 20;
  
  // Current Day Check
  const today = new Date();
  const todayStr = format(today, 'yyyy-MM-dd');
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() + 1 === month;
  const currentDay = isCurrentMonth ? today.getDate() : -1;
  
  // Render date ring (outermost gray ring with all dates)
  const dateRing = useMemo(() => {
    const elements: JSX.Element[] = [];
    const outerR = dateRingRadius;
    const innerR = dateRingRadius - dateTrackHeight;
    
    for (let day = 1; day <= daysInMonth; day++) {
      const dayAngle = startAngle + (day - 1) * anglePerDay;
      const nextAngle = startAngle + day * anglePerDay;
      const midAngle = (dayAngle + nextAngle) / 2;
      
      // Calculate coordinates
      const x1 = centerX + outerR * Math.cos(dayAngle);
      const y1 = centerY + outerR * Math.sin(dayAngle);
      const x2 = centerX + outerR * Math.cos(nextAngle);
      const y2 = centerY + outerR * Math.sin(nextAngle);
      
      const x3 = centerX + innerR * Math.cos(nextAngle);
      const y3 = centerY + innerR * Math.sin(nextAngle);
      const x4 = centerX + innerR * Math.cos(dayAngle);
      const y4 = centerY + innerR * Math.sin(dayAngle);
      
      const largeArcFlag = anglePerDay > Math.PI ? 1 : 0;
      
      const pathData = [
        `M ${x1} ${y1}`,
        `A ${outerR} ${outerR} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
        `L ${x3} ${y3}`,
        `A ${innerR} ${innerR} 0 ${largeArcFlag} 0 ${x4} ${y4}`,
        'Z'
      ].join(' ');
      
      const textRadius = (outerR + innerR) / 2;
      const textX = centerX + textRadius * Math.cos(midAngle);
      const textY = centerY + textRadius * Math.sin(midAngle);
      
      const isToday = day === currentDay;

      elements.push(
        <g key={`date-${day}`}>
          <path
            d={pathData}
            fill={isToday ? "#FF3B30" : "#e5e7eb"} // Red for today, gray for others
            stroke={isToday ? "#FF3B30" : "#ffffff"}
            strokeWidth={isToday ? 2 : 0.5}
            className="transition-colors duration-300"
          />
          <text
            x={textX}
            y={textY}
            textAnchor="middle"
            dominantBaseline="middle"
            className={isToday ? "fill-white font-bold" : "fill-gray-600 font-medium"}
            fontSize={isToday ? "12" : "10"}
            transform={`rotate(${(midAngle * 180) / Math.PI + 90}, ${textX}, ${textY})`}
          >
            {day}
          </text>
        </g>
      );
    }
    
    return elements;
  }, [daysInMonth, startAngle, anglePerDay, dateRingRadius, dateTrackHeight, centerX, centerY, currentDay]);
  
  // Render habit rings
  const renderSpiralHabits = useMemo(() => {
    const elements: JSX.Element[] = [];
    
    displayHabits.forEach((habit, habitIndex) => {
      const trackRadius = outerRadius - habitIndex * trackHeight;
      const innerR = trackRadius - trackHeight + 1;
      const outerR = trackRadius - 1;
      
      for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = format(new Date(year, month - 1, day), 'yyyy-MM-dd');
        const completed = isHabitCompleted(habit.id, dateStr);
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
        
        const largeArcFlag = anglePerDay > Math.PI ? 1 : 0;
        
        const pathData = [
          `M ${x1} ${y1}`,
          `A ${outerR} ${outerR} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
          `L ${x3} ${y3}`,
          `A ${innerR} ${innerR} 0 ${largeArcFlag} 0 ${x4} ${y4}`,
          'Z'
        ].join(' ');
        
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
          >
            <title>{`${habit.name} - ${format(new Date(year, month - 1, day), 'MMM d')}: ${isFuture ? 'Future' : (completed ? 'Completed' : 'Not completed')}`}</title>
          </path>
        );
      }
    });
    
    return elements;
  }, [displayHabits, daysInMonth, year, month, startAngle, anglePerDay, outerRadius, trackHeight, centerX, centerY, onToggleHabit]);
  
  // Labels with parallel gray lines
  const habitLabels = useMemo(() => {
    const elements: JSX.Element[] = [];
    
    displayHabits.forEach((habit, habitIndex) => {
      const trackRadius = outerRadius - habitIndex * trackHeight;
      const midTrackRadius = trackRadius - trackHeight / 2;
      
      // Starting point: Top of the circle (12 o'clock, which is startAngle)
      // We attach the line to the middle of the track at the start angle
      const startX = centerX + midTrackRadius * Math.cos(startAngle);
      const startY = centerY + midTrackRadius * Math.sin(startAngle);
      
      // End point: Pull out to the left
      const lineLength = 160;
      const endX = startX - lineLength;
      const endY = startY; // Horizontal line
      
      // Label position: On top of the line, aligned to the left/middle
      const textX = endX + 10;
      const textY = endY - 5;
      
      elements.push(
        <g key={`label-${habit.id}`}>
          {/* Gray horizontal line */}
          <line
            x1={startX}
            y1={startY}
            x2={endX}
            y2={endY}
            stroke="#9ca3af"
            strokeWidth={1.5}
            strokeLinecap="round"
          />
          
          {/* Connection dot */}
          <circle
            cx={startX}
            cy={startY}
            r={2}
            fill={habit.color}
          />
          
          {/* Habit Name */}
          <text
            x={textX}
            y={textY}
            textAnchor="start"
            className="fill-muted-foreground font-medium text-sm"
          >
            {habit.name}
          </text>
        </g>
      );
    });
    
    return elements;
  }, [displayHabits, outerRadius, trackHeight, startAngle, centerX, centerY]);
  
  return (
    <div className="flex flex-col items-center">
      <svg
        width={svgSize}
        height={svgSize}
        viewBox={`0 0 ${svgSize} ${svgSize}`}
        className="max-w-full h-auto"
      >
        <defs>
          <linearGradient id="textGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8B5CF6" />
            <stop offset="100%" stopColor="#EC4899" />
          </linearGradient>
        </defs>

        {/* Date Ring */}
        {dateRing}
        
        {/* Habits */}
        {renderSpiralHabits}
        
        {/* Labels */}
        {habitLabels}
        
        {/* Center Info */}
        <text
          x={centerX}
          y={centerY - 10}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="url(#textGradient)"
          className="text-5xl font-bold"
          style={{ letterSpacing: '-0.02em' }}
        >
          {format(new Date(year, month - 1), 'MMM')}
        </text>
        <text
          x={centerX}
          y={centerY + 25}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="url(#textGradient)"
          className="text-2xl font-medium opacity-80"
        >
          {year}
        </text>
      </svg>
      
    </div>
  );
}
