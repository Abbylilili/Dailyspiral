import type { FC } from 'react';
import { useState, useRef, useEffect } from 'react';
import { format, parseISO, differenceInMinutes, addMinutes } from 'date-fns';
import { cn } from '@/app/components/ui/utils';
import type { DailyPlanEntry } from '@/app/lib/storage';

interface DayViewProps {
  currentDate: Date;
  plans: DailyPlanEntry[];
  onEdit?: (plan: DailyPlanEntry) => void;
  onTimeClick?: (hour: number) => void;
  onUpdatePlan?: (plan: DailyPlanEntry) => void;
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const HOUR_HEIGHT = 80;
const MINUTE_HEIGHT = HOUR_HEIGHT / 60;

export const DayView: FC<DayViewProps> = ({ currentDate, plans, onEdit, onTimeClick, onUpdatePlan }) => {
  const dateStr = format(currentDate, 'yyyy-MM-dd');
  const dayPlans = plans.filter(p => p.date === dateStr);
  
  // Dragging state
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState(0); 
  const isDraggingRef = useRef(false); // Using ref for immediate access in event handlers
  const startY = useRef(0);

  const getPosition = (timeStr: string) => {
    const time = parseISO(timeStr);
    const hours = time.getHours();
    const minutes = time.getMinutes();
    return (hours * 60 + minutes) * MINUTE_HEIGHT;
  };

  const getHeight = (start: string, end: string) => {
    const duration = differenceInMinutes(parseISO(end), parseISO(start));
    return duration * MINUTE_HEIGHT;
  };

  const handleMouseDown = (e: React.MouseEvent, plan: DailyPlanEntry) => {
    e.stopPropagation();
    setDraggingId(plan.id);
    isDraggingRef.current = false; // Reset on every mouse down
    startY.current = e.clientY;
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!draggingId) return;
      
      const deltaY = e.clientY - startY.current;
      
      // Move threshold: only consider dragging if moved more than 5px
      if (!isDraggingRef.current && Math.abs(deltaY) > 5) {
        isDraggingRef.current = true;
      }

      if (isDraggingRef.current) {
        const snappedDeltaY = Math.round(deltaY / 20) * 20;
        setDragOffset(snappedDeltaY);
      }
    };

    const handleMouseUp = () => {
      if (!draggingId) return;

      if (isDraggingRef.current && dragOffset !== 0) {
        const plan = dayPlans.find(p => p.id === draggingId);
        if (plan) {
          const minutesMoved = dragOffset / MINUTE_HEIGHT;
          const newStart = addMinutes(parseISO(plan.startTime), minutesMoved);
          const newEnd = addMinutes(parseISO(plan.endTime), minutesMoved);
          
          onUpdatePlan?.({
            ...plan,
            startTime: newStart.toISOString(),
            endTime: newEnd.toISOString()
          });
        }
      }

      // Cleanup
      setDraggingId(null);
      setDragOffset(0);
      // Small timeout to ensure the click handler doesn't trigger immediately after mouseUp
      setTimeout(() => {
        isDraggingRef.current = false;
      }, 50);
    };

    if (draggingId) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggingId, dragOffset, dayPlans, onUpdatePlan]);

  return (
    <div className="relative flex flex-col h-full select-none bg-transparent">
      <div className="flex-1 overflow-y-auto relative h-[600px] pr-2 scrollbar-hide pt-6">
        {/* Time markers and clickable slots */}
        {HOURS.map(hour => (
          <div 
            key={hour} 
            onClick={() => {
                if (!isDraggingRef.current) onTimeClick?.(hour);
            }}
            className="relative flex h-[80px] border-b border-slate-50 group cursor-pointer hover:bg-blue-50/20 transition-colors"
          >
            <div className="w-14 flex justify-end pr-4 -mt-2.5">
              <span className="text-[10px] font-black text-slate-300 group-hover:text-blue-500 transition-colors tracking-tighter">
                {`${hour}:00`}
              </span>
            </div>
            <div className="flex-1" />
          </div>
        ))}

        {/* Events */}
        <div className="absolute top-6 left-14 right-2 bottom-0 pointer-events-none">
          {dayPlans.map(plan => {
            const isTargetDragging = draggingId === plan.id;
            const top = getPosition(plan.startTime) + (isTargetDragging ? dragOffset : 0);
            const height = Math.max(getHeight(plan.startTime, plan.endTime), 24);
            
            return (
              <div 
                key={plan.id}
                onMouseDown={(e) => handleMouseDown(e, plan)}
                onClick={(e) => {
                  e.stopPropagation();
                  if (!isDraggingRef.current) {
                    onEdit?.(plan);
                  }
                }}
                className={cn(
                  "absolute left-0 right-0 rounded-2xl px-4 border-l-[6px] shadow-sm cursor-grab pointer-events-auto transition-all overflow-hidden flex flex-col justify-center",
                  isTargetDragging ? "z-50 opacity-90 scale-[1.02] shadow-2xl cursor-grabbing" : "z-10 hover:scale-[1.01] shadow-md"
                )}
                style={{ 
                  top: `${top}px`, 
                  height: `${height}px`, 
                  backgroundColor: isTargetDragging ? plan.color : `${plan.color}15`, 
                  borderLeftColor: plan.color,
                  color: isTargetDragging ? 'white' : plan.color,
                  transition: isTargetDragging ? 'none' : 'all 0.2s'
                }}
              >
                <div className="text-sm font-black truncate leading-none">{plan.title}</div>
                {height > 55 && (
                  <div className={cn("text-[9px] font-black mt-1 uppercase tracking-widest", isTargetDragging ? "text-white/80" : "opacity-60")}>
                    {format(parseISO(plan.startTime), 'HH:mm')}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DayView;
