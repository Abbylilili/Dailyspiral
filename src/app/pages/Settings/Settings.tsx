import { useState, useEffect } from "react";
import { Download, Trash2, Info, User, LogOut } from "lucide-react";
import { supabase } from "@/app/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { AlertDialog } from "@/app/components/ui/alert-dialog";
import { exportAllData, clearAllData } from "@/app/lib/storage";
import { toast } from "sonner";
import { useLanguage } from "@/app/contexts/LanguageContext";
import { useTheme } from "@/app/contexts/ThemeContext";
import { cn } from "@/app/components/ui/utils";

export default function Settings() {
  const { t } = useLanguage();
  const { theme } = useTheme();
  const [isExporting, setIsExporting] = useState(false);
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
  
  const getCardClass = () => {
     switch(theme) {
         case 'ocean': return "bg-slate-800/50 border-0 text-white backdrop-blur-xl shadow-xl";
         case 'ink': return "bg-white border-2 border-black text-black shadow-[6px_6px_0px_0px_black] rounded-xl";
         case 'zen': return "bg-white border-0 shadow-lg shadow-emerald-50/50 rounded-3xl";
         default: return "glass-card border-0 rounded-[2rem]";
     }
  };

  const getSectionClass = (color: string) => {
      if (theme === 'ocean') return `bg-${color}-900/20 border-0 text-white`;
      if (theme === 'zen') return `bg-${color}-50 border-0 text-${color}-900 rounded-lg shadow-sm`;
      if (theme === 'ink') return "bg-white border-2 border-black text-black rounded-lg";
      return `bg-${color}-50 border-${color}-200 text-${color}-900 border rounded-lg`;
  };

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      exportAllData().then(data => {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `dailyspiral-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setIsExporting(false);
        toast.success(t("settings.dataExported"));
      });
    }, 500);
  };
  
  const handleClearData = () => {
    clearAllData();
    toast.success(t("settings.dataCleared"));
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };
  
  return (
    <div className="space-y-8 max-w-6xl mx-auto p-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <h2 className={cn("text-4xl font-black tracking-tighter uppercase bg-clip-text text-transparent",
            theme === 'ocean' ? "bg-gradient-to-r from-cyan-400 to-blue-500" :
            theme === 'ink' ? "text-black" :
            theme === 'zen' ? "bg-gradient-to-r from-emerald-600 to-teal-600" :
            "bg-gradient-to-r from-purple-600 to-pink-600"
        )}>{t("settings.title")}</h2>
      </div>

      <Card className={cn(getCardClass())}>
        <CardHeader>
          <CardTitle className={cn("flex items-center gap-2 text-xl font-bold", theme === 'ocean' && "text-white")}>
            <User className="w-5 h-5 text-purple-500" />
            {t("settings.dataManagement")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className={cn("flex items-center justify-between p-6 rounded-2xl", 
              theme === 'ocean' ? "bg-slate-900/50" : 
              theme === 'ink' ? "border-2 border-black" :
              "bg-gray-50"
          )}>
            <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white font-black text-2xl shadow-lg">
                    {user?.email?.[0].toUpperCase() || "U"}
                </div>
                <div>
                    <p className={cn("font-black text-lg", theme === 'ocean' ? "text-white" : "text-gray-800")}>
                        {user?.email}
                    </p>
                    <p className="text-xs font-bold opacity-50 uppercase tracking-widest">Personal Account</p>
                </div>
            </div>
            <Button variant="ghost" onClick={handleSignOut} className="text-red-500 hover:text-red-600 hover:bg-red-50 font-bold px-6 h-12 rounded-xl">
                <LogOut className="w-4 h-4 mr-2" /> {t("common.delete")}
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Card className={cn(getCardClass())}>
        <CardHeader>
          <CardTitle className={cn("flex items-center gap-2 text-xl font-bold", theme === 'ocean' && "text-white")}>
            <Info className="w-5 h-5 text-blue-500" />
            {t("settings.about")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className={cn("font-black text-2xl mb-2", theme === 'ocean' && "text-white")}>{t("app.name")}</h3>
            <p className={cn("text-lg font-medium opacity-80 leading-relaxed", theme === 'ocean' ? "text-slate-300" : "text-gray-600")}>
              {t("settings.description")}
            </p>
          </div>
          
          <div className={cn("p-6 rounded-3xl", getSectionClass('purple'))}>
            <h4 className={cn("font-black mb-4 uppercase tracking-widest text-sm", theme === 'ocean' ? "text-purple-300" : "text-purple-900")}>{t("welcome.features")}</h4>
            <ul className={cn("space-y-3 text-base font-bold", theme === 'ocean' ? "text-purple-200" : "text-purple-800")}>
              <li className="flex items-start gap-3"><span className="text-purple-500">•</span>{t("welcome.expenseSystem")}</li>
              <li className="flex items-start gap-3"><span className="text-purple-500">•</span>{t("welcome.moodDiary")}</li>
              <li className="flex items-start gap-3"><span className="text-purple-500">•</span>{t("welcome.habitTracking")}</li>
              <li className="flex items-start gap-3"><span className="text-purple-500">•</span>{t("welcome.aiInsights")}</li>
            </ul>
          </div>
          
          <div className={cn("text-sm font-bold opacity-60 flex justify-between items-center px-2", theme === 'ocean' ? "text-slate-400" : "text-gray-600")}>
            <span>{t("settings.version")}: 1.0.0</span>
            <span>DAILY SPIRAL © 2026</span>
          </div>
        </CardContent>
      </Card>
      
      <Card className={cn(getCardClass())}>
        <CardHeader><CardTitle className={cn("text-xl font-bold", theme === 'ocean' && "text-white")}>{t("settings.dataManagement")}</CardTitle></CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-6">
          <div className={cn("p-6 rounded-3xl flex flex-col justify-between gap-4", getSectionClass('blue'))}>
            <div>
              <h4 className="font-black text-lg">{t("settings.exportData")}</h4>
              <p className="text-sm font-medium opacity-70 mt-1">{t("settings.exportDesc")}</p>
            </div>
            <Button onClick={handleExport} disabled={isExporting} className="w-full h-12 bg-black hover:bg-gray-800 text-white rounded-2xl font-black text-xs tracking-widest uppercase shadow-lg transition-all hover:scale-[1.02] active:scale-95">
              <Download className="w-4 h-4 mr-2" /> {isExporting ? t("settings.exporting") : t("settings.export")}
            </Button>
          </div>
          
          <div className={cn("p-6 rounded-3xl flex flex-col justify-between gap-4", getSectionClass('red'))}>
            <div>
              <h4 className="font-black text-lg">{t("settings.clearData")}</h4>
              <p className="text-sm font-medium opacity-70 mt-1">{t("settings.clearDesc")}</p>
            </div>
            <AlertDialog
              trigger={
                <Button className="w-full h-12 bg-black hover:bg-red-600 text-white rounded-2xl font-black text-xs tracking-widest uppercase shadow-lg transition-all hover:scale-[1.02] active:scale-95">
                  <Trash2 className="w-4 h-4 mr-2" /> {t("settings.clear")}
                </Button>
              }
              title={t("settings.confirmClear")}
              description={t("settings.confirmClearDesc")}
              cancelText={t("settings.cancel")}
              actionText={t("settings.confirmClearButton")}
              onAction={handleClearData}
              actionClassName="bg-red-600 hover:bg-red-700 font-black"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
