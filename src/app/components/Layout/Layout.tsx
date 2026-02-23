import { Outlet, Link, useLocation } from "react-router";
import { Home, Wallet, Heart, CheckSquare, TrendingUp, Settings, Languages, Palette, LogOut, User } from "lucide-react";
import { supabase } from "@/app/lib/supabase";
import { useState, useEffect } from "react";
import { cn } from "@/app/components/ui/utils";
import { WelcomeDialog } from "@/app/components/WelcomeDialog";
import { FloatingBubbles } from "@/app/components/FloatingBubbles";
import { useLanguage } from "@/app/contexts/LanguageContext";
import { useTheme, Theme } from "@/app/contexts/ThemeContext";
import { Button } from "@/app/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/app/components/ui/dropdown-menu";

export function Layout() {
  const location = useLocation();
  const { language, setLanguage, t } = useLanguage();
  const { theme, setTheme } = useTheme();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };
  
  const navItems = [
    { path: "/", icon: Home, label: t("nav.home") },
    { path: "/expenses", icon: Wallet, label: t("nav.expenses") },
    { path: "/mood", icon: Heart, label: t("nav.mood") },
    { path: "/habits", icon: CheckSquare, label: t("nav.habits") },
    { path: "/insights", icon: TrendingUp, label: t("nav.insights") },
    { path: "/settings", icon: Settings, label: t("nav.settings") },
  ];
  
  const currentDate = new Date();
  const formattedDate = language === "zh" 
    ? currentDate.toLocaleDateString('zh-CN', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        weekday: 'long'
      })
    : currentDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
  
  // Theme Helpers
  const getContainerClass = () => {
      switch(theme) {
          case 'ocean': return "bg-slate-900 text-slate-100";
          case 'ink': return "bg-white text-black";
          case 'zen': return "bg-transparent text-slate-800"; // Background handled by FloatingBubbles variant="zen"
          default: return "text-gray-900"; // Pastel background handled via inline style
      }
  };

  const pastelStyle = {
      backgroundColor: 'transparent', // Make transparent to reveal FloatingBubbles
      backgroundImage: 'none',
  };

  const getHeaderClass = () => {
      switch(theme) {
          case 'ocean': return "border-white/10 bg-slate-900/80 backdrop-blur-xl text-white";
          case 'ink': return "border-b-2 border-black bg-white text-black";
          case 'zen': return "border-b border-gray-200/50 bg-white/70 backdrop-blur-xl text-gray-800";
          default: return "border-white/20 bg-white/60 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60";
      }
  };

  const getMobileNavClass = () => {
      switch(theme) {
          case 'ocean': return "bg-slate-800/80 backdrop-blur-xl border border-white/10 text-white";
          case 'ink': return "bg-white border-t-2 border-black text-black rounded-none";
          case 'zen': return "bg-white/90 border-t border-gray-100 shadow-xl rounded-t-3xl backdrop-blur-lg text-gray-800";
          default: return "bg-white/80 backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl";
      }
  };
  
  return (
    <div 
        className={cn("min-h-screen relative overflow-hidden transition-colors duration-500", getContainerClass())}
        style={theme === 'pastel' ? pastelStyle : undefined}
    >
      {theme === 'pastel' && <FloatingBubbles variant="pastel" />}
      {theme === 'zen' && <FloatingBubbles variant="zen" />}
      <WelcomeDialog />
      
      {/* Header */}
      <header className={cn("fixed top-0 z-50 w-full border-b transition-colors duration-500", getHeaderClass())}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className={cn("w-10 h-10 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform", 
                  theme === 'ink' ? "bg-white border-2 border-black rounded-lg" : 
                  theme === 'ocean' ? "bg-cyan-500 rounded-xl" :
                  theme === 'zen' ? "bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-emerald-200" :
                  "bg-black rounded-xl"
              )}>
                <span className={cn("text-xl font-bold tracking-tighter",
                    theme === 'ink' ? "text-black" : "text-white"
                )}>DS</span>
              </div>
              <div className="flex flex-col justify-center">
                <h1 className={cn("text-lg font-bold tracking-tight leading-none transition-colors", 
                    theme === 'zen' ? "text-emerald-900" : "text-foreground"
                )}>
                  {t("app.name")}
                </h1>
                <p className={cn("text-[10px] font-medium uppercase tracking-wider leading-none mt-1 transition-colors", 
                    theme === 'zen' ? "text-emerald-600/70" : "text-muted-foreground"
                )}>{t("app.subtitle")}</p>
              </div>
            </Link>
            
            {/* Desktop Navigation */}
            <nav className={cn("hidden md:flex items-center gap-1 p-1 rounded-full backdrop-blur-md", 
                theme === 'ocean' ? "bg-slate-800/50" : 
                theme === 'ink' ? "bg-transparent border border-black rounded-lg p-0 gap-0 overflow-hidden" :
                "bg-black/5"
            )}>
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                let activeClass = "text-black bg-white shadow-sm";
                let inactiveClass = "text-muted-foreground hover:text-foreground hover:bg-white/50";

                if (theme === 'ocean') {
                    activeClass = "text-white bg-cyan-600 shadow-lg shadow-cyan-500/20";
                    inactiveClass = "text-slate-400 hover:text-white hover:bg-white/10";
                } else if (theme === 'ink') {
                    activeClass = "text-white bg-black rounded-none";
                    inactiveClass = "text-black hover:bg-gray-200 rounded-none";
                } else if (theme === 'zen') {
                    activeClass = "bg-[#dcfce7] text-[#166534] shadow-sm font-semibold";
                    inactiveClass = "text-gray-500 hover:bg-gray-100/50 hover:text-gray-900";
                }

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 transition-all font-medium text-sm",
                      theme !== 'ink' && "rounded-full",
                      isActive ? activeClass : inactiveClass
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
            
            {/* Right Side - Date & Language & Theme */}
            <div className="flex items-center gap-4">
              <div className={cn("hidden lg:block text-sm font-medium", theme === 'ocean' ? "text-slate-400" : "text-muted-foreground")}>
                {formattedDate}
              </div>
              
              {/* Theme Switcher */}
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className={cn("rounded-full w-10 h-10 transition-all", 
                      theme === 'ocean' ? "hover:bg-slate-800 text-slate-300" : 
                      theme === 'ink' ? "hover:bg-black hover:text-white border border-transparent hover:border-black rounded-lg" :
                      theme === 'zen' ? "bg-white border border-gray-200 shadow-sm hover:shadow-md text-gray-600 hover:text-green-700" :
                      "hover:bg-black/5"
                  )}>
                    <Palette className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className={cn("w-48",
                    theme === 'ocean' ? "bg-slate-800 border-white/10 text-white rounded-xl" :
                    theme === 'ink' ? "bg-white border-2 border-black rounded-lg shadow-[4px_4px_0px_0px_black]" :
                    theme === 'zen' ? "bg-white border border-gray-100 shadow-xl rounded-2xl text-gray-800" :
                    "glass-card rounded-xl border-0"
                )}>
                    <DropdownMenuLabel>Color Theme</DropdownMenuLabel>
                    <DropdownMenuSeparator className={theme === 'ocean' ? "bg-white/10" : ""} />
                    <DropdownMenuRadioGroup value={theme} onValueChange={(v) => setTheme(v as Theme)}>
                        <DropdownMenuRadioItem value="pastel" className={cn(theme === 'ocean' ? "focus:bg-slate-700 focus:text-white" : "")}>
                            <span className="w-3 h-3 rounded-full bg-gradient-to-br from-pink-200 to-purple-200 mr-2 border"/> 
                            Pastel
                        </DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="ocean" className={cn(theme === 'ocean' ? "focus:bg-slate-700 focus:text-white" : "")}>
                            <span className="w-3 h-3 rounded-full bg-slate-800 mr-2 border border-cyan-500"/>
                            Ocean
                        </DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="ink" className={cn(theme === 'ocean' ? "focus:bg-slate-700 focus:text-white" : "")}>
                            <span className="w-3 h-3 rounded-full bg-white mr-2 border-2 border-black"/>
                            Ink
                        </DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="zen" className={cn(theme === 'ocean' ? "focus:bg-slate-700 focus:text-white" : "focus:bg-[#dcfce7] focus:text-[#166534]")}>
                            <span className="w-3 h-3 rounded-full bg-[#dcfce7] mr-2 border border-[#166534]"/>
                            Zen
                        </DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Language Switcher */}
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className={cn("rounded-full w-10 h-10 transition-all", 
                      theme === 'ocean' ? "hover:bg-slate-800 text-slate-300" : 
                      theme === 'ink' ? "hover:bg-black hover:text-white border border-transparent hover:border-black rounded-lg" :
                      theme === 'zen' ? "bg-white border border-gray-200 shadow-sm hover:shadow-md text-gray-600 hover:text-green-700" :
                      "hover:bg-black/5"
                  )}>
                    <Languages className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className={cn("p-2",
                    theme === 'ocean' ? "bg-slate-800 border-white/10 text-white rounded-xl" :
                    theme === 'ink' ? "bg-white border-2 border-black rounded-lg shadow-[4px_4px_0px_0px_black]" :
                    "glass-card rounded-xl border-0"
                )}>
                  <DropdownMenuItem 
                    onClick={() => setLanguage("en")}
                    className={cn("rounded-lg focus:bg-black/5", 
                        language === "en" && (theme === 'ocean' ? "bg-slate-700" : "bg-black/5 font-medium"),
                        theme === 'ocean' && "focus:bg-slate-700"
                    )}
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-lg">🇺🇸</span>
                      English
                    </span>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => setLanguage("zh")}
                    className={cn("rounded-lg focus:bg-black/5", 
                        language === "zh" && (theme === 'ocean' ? "bg-slate-700" : "bg-black/5 font-medium"),
                        theme === 'ocean' && "focus:bg-slate-700"
                    )}
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-lg">🇨🇳</span>
                      中文
                    </span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              {/* User Profile & Logout */}
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className={cn("rounded-full w-10 h-10 transition-all", 
                      theme === 'ocean' ? "hover:bg-slate-800 text-slate-300" : 
                      theme === 'ink' ? "hover:bg-black hover:text-white border border-transparent hover:border-black rounded-lg" :
                      theme === 'zen' ? "bg-white border border-gray-200 shadow-sm hover:shadow-md text-gray-600 hover:text-green-700" :
                      "hover:bg-black/5"
                  )}>
                    <User className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className={cn("w-56",
                    theme === 'ocean' ? "bg-slate-800 border-white/10 text-white rounded-xl" :
                    theme === 'ink' ? "bg-white border-2 border-black rounded-lg shadow-[4px_4px_0px_0px_black]" :
                    theme === 'zen' ? "bg-white border border-gray-100 shadow-xl rounded-2xl text-gray-800" :
                    "glass-card rounded-xl border-0"
                )}>
                    <DropdownMenuLabel>Account</DropdownMenuLabel>
                    <div className="px-2 pb-2 text-xs opacity-60 truncate">
                        {user?.email}
                    </div>
                    <DropdownMenuSeparator className={theme === 'ocean' ? "bg-white/10" : ""} />
                    <DropdownMenuItem 
                        onClick={handleSignOut}
                        className={cn("text-red-500 focus:text-red-600 focus:bg-red-50", theme === 'ocean' && "focus:bg-red-900/30")}
                    >
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign Out
                    </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-24 md:pb-8">
        <Outlet />
      </main>
      
      {/* Bottom Navigation (Mobile) */}
      <nav className={cn("md:hidden fixed bottom-6 left-4 right-4 z-50", getMobileNavClass())}>
        <div className="flex items-center justify-around px-2 py-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            let activeClass = "text-white bg-black shadow-lg scale-110";
            let inactiveClass = "text-muted-foreground hover:text-foreground hover:bg-black/5";

            if (theme === 'ocean') {
                activeClass = "text-white bg-cyan-600 shadow-[0_0_15px_rgba(8,145,178,0.5)] scale-110";
                inactiveClass = "text-slate-400 hover:text-white";
            } else if (theme === 'ink') {
                activeClass = "text-white bg-black rounded-lg scale-100";
                inactiveClass = "text-black hover:bg-gray-100";
            } else if (theme === 'zen') {
                activeClass = "text-[#166534] bg-[#dcfce7] rounded-xl shadow-sm scale-105";
                inactiveClass = "text-gray-400 hover:text-gray-600";
            }

            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex flex-col items-center gap-1 w-12 h-12 justify-center rounded-2xl transition-all",
                  theme === 'ink' && "rounded-lg",
                  isActive ? activeClass : inactiveClass
                )}
              >
                <Icon className="w-5 h-5" />
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}