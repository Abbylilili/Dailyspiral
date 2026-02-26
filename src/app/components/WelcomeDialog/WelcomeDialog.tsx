import { useState, useEffect } from "react";
import { Sparkles, Wallet, Heart, CheckSquare, TrendingUp } from "lucide-react";
import { Dialog } from "@/app/components/ui/dialog";
import { Button } from "@/app/components/ui/button";
import { useLanguage } from "@/app/contexts/LanguageContext";

export function WelcomeDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useLanguage();
  
  useEffect(() => {
    // Check if user has seen welcome dialog
    const hasSeenWelcome = localStorage.getItem('dailyspiral_welcome_seen');
    if (!hasSeenWelcome) {
      setIsOpen(true);
    }
  }, []);
  
  const handleClose = () => {
    localStorage.setItem('dailyspiral_welcome_seen', 'true');
    setIsOpen(false);
  };
  
  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={setIsOpen}
      title={(
        <div className="text-2xl flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-purple-500" />
          {t("welcome.title")}
        </div>
      )}
      description={t("welcome.description")}
      className="max-w-2xl max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
    >
      <div className="space-y-6 py-4">
        {/* Features */}
        <div className="space-y-3">
          <h3 className="font-bold text-lg">{t("welcome.features")}</h3>
          
          <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
            <Wallet className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
            <div>
              <p className="font-medium text-green-900">{t("welcome.expenseSystem")}</p>
              <p className="text-sm text-green-700">{t("welcome.expenseSystemDesc")}</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-3 bg-pink-50 rounded-lg">
            <Heart className="w-5 h-5 text-pink-600 mt-1 flex-shrink-0" />
            <div>
              <p className="font-medium text-pink-900">{t("welcome.moodDiary")}</p>
              <p className="text-sm text-pink-700">{t("welcome.moodDiaryDesc")}</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
            <CheckSquare className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
            <div>
              <p className="font-medium text-blue-900">{t("welcome.habitTracking")}</p>
              <p className="text-sm text-blue-700">{t("welcome.habitTrackingDesc")}</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
            <TrendingUp className="w-5 h-5 text-purple-600 mt-1 flex-shrink-0" />
            <div>
              <p className="font-medium text-purple-900">{t("welcome.aiInsights")}</p>
              <p className="text-sm text-purple-700">{t("welcome.aiInsightsDesc")}</p>
            </div>
          </div>
        </div>
        
        {/* Unique Features */}
        <div className="space-y-3">
          <h3 className="font-bold text-lg">{t("welcome.highlights")}</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-purple-500 mt-1">✨</span>
              <span><strong>{t("welcome.spiralViz")}</strong> {t("welcome.spiralVizDesc")}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-500 mt-1">✨</span>
              <span><strong>{t("welcome.dailyQuote")}</strong> {t("welcome.dailyQuoteDesc")}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-500 mt-1">✨</span>
              <span><strong>{t("welcome.quickRecord")}</strong> {t("welcome.quickRecordDesc")}</span>
            </li>
          </ul>
        </div>
        
        {/* Privacy */}
        <div className="text-xs text-gray-500 border-t pt-4">
          <p className="mb-2"><strong>{t("welcome.privacyTitle")}</strong></p>
          <p>{t("welcome.privacyText")}</p>
        </div>
        
        {/* CTA */}
        <Button onClick={handleClose} className="w-full" size="lg">
          {t("welcome.getStarted")}
        </Button>
      </div>
    </Dialog>
  );
}