import { useState } from "react";
import { Download, Trash2, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../components/ui/alert-dialog";
import { exportAllData, clearAllData } from "../lib/storage";
import { toast } from "sonner";
import { useLanguage } from "../contexts/LanguageContext";
import { useTheme } from "../contexts/ThemeContext";
import { cn } from "../components/ui/utils";

export function Settings() {
  const { t } = useLanguage();
  const { theme } = useTheme();
  const [isExporting, setIsExporting] = useState(false);
  
  // Theme Helper
  const getCardClass = () => {
     switch(theme) {
         case 'ocean': return "bg-slate-800/50 border-0 text-white backdrop-blur-xl shadow-xl";
         case 'ink': return "bg-white border-2 border-black text-black shadow-[6px_6px_0px_0px_black] rounded-xl";
         case 'zen': return "bg-white border-0 shadow-lg shadow-emerald-50/50 rounded-3xl";
         default: return "glass-card border-0";
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
      const data = exportAllData();
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
    <div className="space-y-8 max-w-6xl mx-auto p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className={cn("text-4xl font-bold bg-clip-text text-transparent",
            theme === 'ocean' ? "bg-gradient-to-r from-cyan-400 to-blue-500" :
            theme === 'ink' ? "text-black font-['Rubik_Dirt'] tracking-wider" :
            theme === 'zen' ? "bg-gradient-to-r from-emerald-600 to-teal-600" :
            "bg-gradient-to-r from-purple-600 to-pink-600"
        )}>{t("settings.title")}</h2>
      </div>
      
      {/* About */}
      <Card className={cn(getCardClass())}>
        <CardHeader>
          <CardTitle className={cn("flex items-center gap-2", theme === 'ocean' && "text-white")}>
            <Info className="w-5 h-5 text-blue-500" />
            {t("settings.about")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className={cn("font-bold text-lg mb-2", theme === 'ocean' && "text-white")}>{t("app.name")}</h3>
            <p className={cn("mb-4", theme === 'ocean' ? "text-slate-300" : "text-gray-600")}>
              {t("settings.description")}
            </p>
          </div>
          
          <div className={cn("p-4", getSectionClass('purple'))}>
            <h4 className={cn("font-bold mb-2", theme === 'ocean' ? "text-purple-300" : "text-purple-900")}>{t("welcome.features")}</h4>
            <ul className={cn("space-y-2 text-sm", theme === 'ocean' ? "text-purple-200" : "text-purple-800")}>
              <li className="flex items-start gap-2">
                <span className="text-purple-500 mt-1">•</span>
                <span><strong>{t("welcome.expenseSystem")}:</strong> {t("welcome.expenseSystemDesc")}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-500 mt-1">•</span>
                <span><strong>{t("welcome.moodDiary")}:</strong> {t("welcome.moodDiaryDesc")}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-500 mt-1">•</span>
                <span><strong>{t("welcome.habitTracking")}:</strong> {t("welcome.habitTrackingDesc")}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-500 mt-1">•</span>
                <span><strong>{t("welcome.aiInsights")}:</strong> {t("welcome.aiInsightsDesc")}</span>
              </li>
            </ul>
          </div>
          
          <div className={cn("text-sm", theme === 'ocean' ? "text-slate-400" : "text-gray-600")}>
            <p className="mb-2"><strong>{t("settings.version")}:</strong> MVP 1.0</p>
            <p className="mb-2"><strong>{t("settings.privacy")}:</strong></p>
            <p>{t("settings.privacyDesc")}</p>
          </div>
        </CardContent>
      </Card>
      
      {/* Data Management */}
      <Card className={cn(getCardClass())}>
        <CardHeader>
          <CardTitle className={cn(theme === 'ocean' && "text-white")}>{t("settings.dataManagement")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className={cn("flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4", getSectionClass('blue'))}>
            <div>
              <h4 className={cn("font-bold", theme === 'ocean' ? "text-blue-300" : "text-blue-900")}>{t("settings.exportData")}</h4>
              <p className={cn("text-sm mt-1", theme === 'ocean' ? "text-blue-200" : "text-blue-700")}>
                {t("settings.exportDesc")}
              </p>
            </div>
            <Button 
              onClick={handleExport} 
              disabled={isExporting}
              className={cn("flex items-center gap-2 w-full md:w-auto", 
                  theme === 'ocean' ? "bg-blue-600 text-white hover:bg-blue-500" : 
                  theme === 'ink' ? "bg-black text-white hover:bg-gray-800" :
                  ""
              )}
            >
              <Download className="w-4 h-4" />
              {isExporting ? t("settings.exporting") : t("settings.export")}
            </Button>
          </div>
          
          <div className={cn("flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4", getSectionClass('red'))}>
            <div>
              <h4 className={cn("font-bold", theme === 'ocean' ? "text-red-300" : "text-red-900")}>{t("settings.clearData")}</h4>
              <p className={cn("text-sm mt-1", theme === 'ocean' ? "text-red-200" : "text-red-700")}>
                {t("settings.clearDesc")}
              </p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className={cn("flex items-center gap-2 w-full md:w-auto", theme === 'ink' && "bg-black text-white hover:bg-red-600")}>
                  <Trash2 className="w-4 h-4" />
                  {t("settings.clear")}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className={cn(
                  theme === 'ocean' ? "bg-slate-800 border-white/10 text-white" :
                  theme === 'ink' ? "bg-white border-2 border-black rounded-xl" :
                  "glass-card bg-white/90 backdrop-blur-xl"
              )}>
                <AlertDialogHeader>
                  <AlertDialogTitle className={cn(theme === 'ocean' && "text-white")}>{t("settings.confirmClear")}</AlertDialogTitle>
                  <AlertDialogDescription className={cn(theme === 'ocean' && "text-slate-400")}>
                    {t("settings.confirmClearDesc")}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className={cn(theme === 'ocean' && "bg-slate-700 text-white hover:bg-slate-600 border-0")}>{t("settings.cancel")}</AlertDialogCancel>
                  <AlertDialogAction onClick={handleClearData} className="bg-red-600 hover:bg-red-700">
                    {t("settings.confirmClearButton")}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}