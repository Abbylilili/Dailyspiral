import { Link } from "react-router";
import { Home } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { useTheme } from "@/app/contexts/ThemeContext";
import { cn } from "@/app/components/ui/utils";

export default function NotFound() {
  const { theme } = useTheme();
  
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <h1 className={cn("text-8xl font-black bg-clip-text text-transparent mb-6 drop-shadow-sm",
          theme === 'ocean' ? "bg-gradient-to-r from-cyan-400 to-blue-500" :
          theme === 'ink' ? "text-black" :
          "bg-gradient-to-r from-purple-600 to-pink-600"
      )}>404</h1>
      <p className={cn("text-xl font-medium mb-8", theme === 'ocean' ? "text-slate-400" : "text-muted-foreground")}>Page Not Found</p>
      <Link to="/">
        <Button className={cn("flex items-center gap-2 h-12 px-6 rounded-full text-lg",
            theme === 'ocean' ? "bg-cyan-600 text-white hover:bg-cyan-500" :
            theme === 'ink' ? "bg-black text-white hover:bg-gray-800" :
            "bg-black text-white hover:bg-gray-800"
        )}>
          <Home className="w-5 h-5" />
          返回主页
        </Button>
      </Link>
    </div>
  );
}
