export const CATEGORIES = [
  { value: "food", label: "Food", icon: "🍜", color: "#FF9F1C" },
  { value: "transport", label: "Transport", icon: "🚗", color: "#2EC4B6" },
  { value: "shopping", label: "Shopping", icon: "🛍️", color: "#FF5400" },
  { value: "entertainment", label: "Entertainment", icon: "🎬", color: "#CBF3F0" },
  { value: "health", label: "Health", icon: "💊", color: "#2B2D42" },
  { value: "other", label: "Other", icon: "📦", color: "#8D99AE" },
];

export const PASTEL_COLORS = ["#FFB5A7", "#FCD5CE", "#F8EDEB", "#F9DCC4", "#FEC89A", "#9BF6FF", "#A0C4FF", "#BDB2FF", "#FFC6FF", "#CAFFBF", "#FDFFB6"];
export const OCEAN_COLORS = ["#06b6d4", "#3b82f6", "#8b5cf6", "#ec4899", "#14b8a6", "#6366f1", "#f43f5e", "#0ea5e9", "#a855f7", "#22d3ee"];
export const INK_COLORS = ["#000000", "#404040", "#737373", "#a3a3a3", "#d4d4d4", "#171717", "#525252", "#262626"];
export const ZEN_COLORS = ["#34d399", "#fbbf24", "#a78bfa", "#60a5fa", "#f87171", "#2dd4bf", "#fb923c", "#86efac", "#fdba74", "#93c5fd"];

export const getChartColor = (index: number, theme: string) => {
    switch (theme) {
        case 'ocean': return OCEAN_COLORS[index % OCEAN_COLORS.length];
        case 'ink': return INK_COLORS[index % INK_COLORS.length];
        case 'zen': return ZEN_COLORS[index % ZEN_COLORS.length];
        default: return PASTEL_COLORS[index % PASTEL_COLORS.length];
    }
};
