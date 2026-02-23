import type { FC } from 'react';
import { useState } from 'react';
import { Plus } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Dialog } from "@/app/components/ui/dialog";
import { useTheme } from "@/app/contexts/ThemeContext";
import { cn } from "@/app/components/ui/utils";
import type { Habit } from "@/app/lib/storage";

interface HabitHeaderProps {
  onAdd: (habit: Habit) => Promise<void>;
  habits: Habit[];
  onDelete: (id: string) => Promise<void>;
}

const COLORS = ["#FF9500", "#34C759", "#5856D6", "#007AFF", "#FF2D55", "#AF52DE", "#FF3B30", "#5AC8FA", "#FFCC00", "#8E8E93"];

const HabitHeader: FC<HabitHeaderProps> = ({ onAdd }) => {
  const { theme } = useTheme();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [habitName, setHabitName] = useState("");
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    await onAdd({
      id: `habit-${Date.now()}`,
      name: habitName,
      color: selectedColor,
      createdAt: new Date().toISOString()
    });
    setHabitName("");
    setIsAddOpen(false);
  };

  return (
    <div className="flex items-center justify-between">
      <h2 className={cn("text-4xl font-bold bg-clip-text text-transparent",
          theme === 'ocean' ? "bg-gradient-to-r from-cyan-400 to-blue-500" : "bg-gradient-to-r from-purple-600 to-pink-600"
      )}>Habits</h2>
      
      <div className="flex gap-3">
        <Dialog 
          open={isAddOpen} 
          onOpenChange={setIsAddOpen}
          trigger={
            <Button className="rounded-full h-12 px-6">
              <Plus className="w-5 h-5 mr-2" /> Add Habit
            </Button>
          }
          title="New Habit"
        >
          <form onSubmit={handleAdd} className="space-y-6 mt-4">
            <input 
              className="w-full h-12 p-4 rounded-xl bg-gray-100 border-0" 
              placeholder="What habit?" 
              value={habitName} 
              onChange={e => setHabitName(e.target.value)} 
              required 
            />
            <div className="flex gap-2 flex-wrap">
              {COLORS.map(c => (
                <button 
                  key={c} 
                  type="button" 
                  onClick={() => setSelectedColor(c)}
                  className={cn("w-8 h-8 rounded-full border-2", selectedColor === c ? "border-black" : "border-transparent")}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
            <Button type="submit" className="w-full h-12">Save Habit</Button>
          </form>
        </Dialog>
      </div>
    </div>
  );
};

export default HabitHeader;
