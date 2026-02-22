import React, { createContext, useContext, useState, useEffect } from "react";

type Language = "en" | "zh";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // App Name
    "app.name": "Daily Spiral",
    "app.subtitle": "Life Management",
    
    // Navigation
    "nav.home": "Home",
    "nav.expenses": "Expenses",
    "nav.mood": "Mood",
    "nav.habits": "Habits",
    "nav.insights": "Insights",
    "nav.settings": "Settings",
    
    // Home Page
    "home.welcome": "Welcome Back",
    "home.quickActions": "Quick Actions",
    "home.addExpense": "Add Expense",
    "home.recordMood": "Record Mood",
    "home.checkHabit": "Check Habit",
    "home.todaysSummary": "Today's Summary",
    "home.expenses": "Expenses",
    "home.mood": "Mood",
    "home.habits": "Habits Completed",
    "home.recentActivity": "Recent Activity",
    "home.noActivity": "No activity yet",
    "home.dailyQuote": "Daily Quote",
    
    // Expenses
    "expenses.title": "Expense Tracking",
    "expenses.subtitle": "Track your income and spending",
    "expenses.addRecord": "Add Record",
    "expenses.addExpenseRecord": "Add Expense Record",
    "expenses.type": "Type",
    "expenses.expense": "Expense",
    "expenses.income": "Income",
    "expenses.amount": "Amount",
    "expenses.category": "Category",
    "expenses.date": "Date",
    "expenses.note": "Note",
    "expenses.save": "Save",
    "expenses.totalExpense": "Total Expense",
    "expenses.totalIncome": "Total Income",
    "expenses.balance": "Balance",
    "expenses.transactions": "Transactions",
    "expenses.monthlyTrend": "Monthly Trend",
    "expenses.categoryBreakdown": "Category Breakdown",
    "expenses.recentTransactions": "Recent Transactions",
    "expenses.noTransactions": "No transactions yet",
    "expenses.addFirst": "Add your first transaction",
    "expenses.delete": "Delete",
    "expenses.deleted": "Record deleted",
    "expenses.saved": "Record saved",
    "expenses.enterAmount": "Please enter amount",
    "expenses.selectCategory": "Please select category",
    
    // Categories
    "category.food": "Food",
    "category.transport": "Transport",
    "category.shopping": "Shopping",
    "category.entertainment": "Entertainment",
    "category.utilities": "Utilities",
    "category.health": "Health",
    "category.salary": "Salary",
    "category.bonus": "Bonus",
    "category.investment": "Investment",
    "category.other": "Other",
    
    // Mood
    "mood.title": "Mood Diary",
    "mood.subtitle": "Track your emotional journey",
    "mood.selectDate": "Select Date",
    "mood.howAreYou": "How are you feeling?",
    "mood.veryBad": "Very Bad",
    "mood.excellent": "Excellent",
    "mood.addNote": "Add a note (optional)",
    "mood.placeholder": "What happened today? How do you feel?",
    "mood.saveRecord": "Save Record",
    "mood.musicRecommendation": "Music Recommendation",
    "mood.basedOnMood": "Based on your mood",
    "mood.monthlyTrend": "Monthly Mood Trend",
    "mood.avgMood": "Average Mood",
    "mood.bestDay": "Best Day",
    "mood.saved": "Mood record saved",
    
    // Mood Playlists
    "playlist.melancholic": "Melancholic Moments",
    "playlist.melancholicDesc": "Lo-fi & Ambient",
    "playlist.coffee": "Coffee Shop Vibes",
    "playlist.coffeeDesc": "Acoustic & Chill",
    "playlist.indie": "Indie Afternoon",
    "playlist.indieDesc": "Uplifting Indie",
    "playlist.happy": "Happy Pop",
    "playlist.happyDesc": "Feel-good Hits",
    "playlist.energy": "Energy Boost",
    "playlist.energyDesc": "Upbeat & Dance",
    
    // Habits
    "habits.title": "Habit Tracking",
    "habits.subtitle": "Build better habits, become a better you",
    "habits.addHabit": "Add Habit",
    "habits.addNewHabit": "Add New Habit",
    "habits.habitName": "Habit Name",
    "habits.placeholder": "e.g., Exercise 30 minutes daily",
    "habits.selectColor": "Select Color",
    "habits.save": "Save",
    "habits.weeklyCompletion": "Weekly Completion",
    "habits.habitCount": "Habit Count",
    "habits.longestStreak": "Longest Streak",
    "habits.days": "days",
    "habits.tracker": "Habit Tracker",
    "habits.habit": "Habit",
    "habits.streak": "Streak",
    "habits.noHabits": "No habits added yet",
    "habits.addFirst": "Add your first habit",
    "habits.added": "Habit added",
    "habits.deleted": "Habit deleted",
    "habits.enterName": "Please enter habit name",
    "habits.enterColorDesc": "Enter habit name and select a color",
    
    // Insights
    "insights.title": "AI Insights",
    "insights.subtitle": "Discover patterns in your life data",
    "insights.weeklyReport": "Weekly Report",
    "insights.generateReport": "Generate Report",
    "insights.generating": "Generating...",
    "insights.analyzing": "Analyzing your data...",
    "insights.noData": "No data yet",
    "insights.noDataDesc": "Start recording your expenses, moods, and habits to generate insights.",
    "insights.dataRange": "Data Range",
    "insights.to": "to",
    "insights.overview": "Overview",
    "insights.moodAnalysis": "Mood Analysis",
    "insights.expenseInsights": "Expense Insights",
    "insights.habitProgress": "Habit Progress",
    "insights.recommendations": "Recommendations",
    
    // Settings
    "settings.title": "Settings",
    "settings.subtitle": "Manage your data and preferences",
    "settings.dataManagement": "Data Management",
    "settings.exportData": "Export Data",
    "settings.exportDesc": "Download all your data as a JSON file",
    "settings.export": "Export",
    "settings.exporting": "Exporting...",
    "settings.clearData": "Clear All Data",
    "settings.clearDesc": "Permanently delete all your records",
    "settings.clear": "Clear",
    "settings.about": "About",
    "settings.version": "Version",
    "settings.description": "A comprehensive life management tool integrating expense tracking, mood diary, habit tracking, and AI insights.",
    "settings.privacy": "Privacy",
    "settings.privacyDesc": "All data is stored locally in your browser and never uploaded to any server.",
    "settings.confirmClear": "Confirm clearing all data?",
    "settings.confirmClearDesc": "This will permanently delete all expense, mood, and habit records. This action cannot be undone. We recommend exporting your data before clearing.",
    "settings.cancel": "Cancel",
    "settings.confirmClearButton": "Confirm Clear",
    "settings.dataCleared": "All data cleared",
    "settings.dataExported": "Data exported successfully",
    
    // Welcome Dialog
    "welcome.title": "Welcome to Daily Spiral",
    "welcome.description": "A comprehensive life management tool integrating expense tracking, mood diary, habit tracking, and AI insights.",
    "welcome.features": "Core Features",
    "welcome.expenseSystem": "Expense System",
    "welcome.expenseSystemDesc": "Simple entry, monthly statistics, at a glance",
    "welcome.moodDiary": "Mood Diary",
    "welcome.moodDiaryDesc": "1-10 scale rating, track emotional trends, music recommendations",
    "welcome.habitTracking": "Habit Tracking",
    "welcome.habitTrackingDesc": "Visual tracker, build lasting good habits",
    "welcome.aiInsights": "AI Weekly Insights",
    "welcome.aiInsightsDesc": "Discover correlations between emotions and spending, generate personalized advice",
    "welcome.highlights": "Unique Features",
    "welcome.spiralViz": "Spiral Visualization:",
    "welcome.spiralVizDesc": "Unique polar coordinate growth chart, artistic display of life trajectory",
    "welcome.dailyQuote": "Daily Quote:",
    "welcome.dailyQuoteDesc": "Smart mood-based encouragement",
    "welcome.quickRecord": "60-Second Record:",
    "welcome.quickRecordDesc": "Quick actions, complete core recording in one minute",
    "welcome.demoNotice": "Demo Notice:",
    "welcome.demoNoticeDesc": "To help you quickly experience the features, we've prepared 14 days of sample data. You can clear this data anytime in settings.",
    "welcome.privacyTitle": "Privacy Protection:",
    "welcome.privacyText": "All data is stored only in your browser locally and will not be uploaded to any server. You can export or delete data at any time.",
    "welcome.getStarted": "Get Started",
    
    // Common
    "common.loading": "Loading...",
    "common.save": "Save",
    "common.cancel": "Cancel",
    "common.delete": "Delete",
    "common.edit": "Edit",
    "common.close": "Close",
    "common.confirm": "Confirm",
    "common.back": "Back",
    "common.next": "Next",
    "common.previous": "Previous",
    "common.search": "Search",
    "common.filter": "Filter",
    "common.sort": "Sort",
    "common.today": "Today",
    "common.yesterday": "Yesterday",
    "common.thisWeek": "This Week",
    "common.thisMonth": "This Month",
    "common.total": "Total",
  },
  zh: {
    // App Name
    "app.name": "每日生活记",
    "app.subtitle": "生活管理",
    
    // Navigation
    "nav.home": "主页",
    "nav.expenses": "记账",
    "nav.mood": "心情",
    "nav.habits": "习惯",
    "nav.insights": "洞察",
    "nav.settings": "设置",
    
    // Home Page
    "home.welcome": "欢迎回来",
    "home.quickActions": "快速操作",
    "home.addExpense": "添加支出",
    "home.recordMood": "记录心情",
    "home.checkHabit": "打卡习惯",
    "home.todaysSummary": "今日摘要",
    "home.expenses": "支出",
    "home.mood": "心情",
    "home.habits": "习惯完成",
    "home.recentActivity": "最近活动",
    "home.noActivity": "暂无活动",
    "home.dailyQuote": "每日一句",
    
    // Expenses
    "expenses.title": "支出追踪",
    "expenses.subtitle": "记录您的收入和支出",
    "expenses.addRecord": "添加记录",
    "expenses.addExpenseRecord": "添加收支记录",
    "expenses.type": "类型",
    "expenses.expense": "支出",
    "expenses.income": "收入",
    "expenses.amount": "金额",
    "expenses.category": "分类",
    "expenses.date": "日期",
    "expenses.note": "备注",
    "expenses.save": "保存",
    "expenses.totalExpense": "总支出",
    "expenses.totalIncome": "总收入",
    "expenses.balance": "结余",
    "expenses.transactions": "笔交易",
    "expenses.monthlyTrend": "月度趋势",
    "expenses.categoryBreakdown": "分类占比",
    "expenses.recentTransactions": "最近交易",
    "expenses.noTransactions": "还没有交易记录",
    "expenses.addFirst": "添加第一笔交易",
    "expenses.delete": "删除",
    "expenses.deleted": "记录已删除",
    "expenses.saved": "记录已保存",
    "expenses.enterAmount": "请输入金额",
    "expenses.selectCategory": "请选择分类",
    
    // Categories
    "category.food": "餐饮",
    "category.transport": "交通",
    "category.shopping": "购物",
    "category.entertainment": "娱乐",
    "category.utilities": "生活缴费",
    "category.health": "医疗",
    "category.salary": "工资",
    "category.bonus": "奖金",
    "category.investment": "投资收益",
    "category.other": "其他",
    
    // Mood
    "mood.title": "心情日记",
    "mood.subtitle": "追踪您的情绪旅程",
    "mood.selectDate": "选择日期",
    "mood.howAreYou": "今天感觉如何？",
    "mood.veryBad": "很糟",
    "mood.excellent": "超棒",
    "mood.addNote": "添加笔记（可选）",
    "mood.placeholder": "今天发生了什么？你的感受如何？",
    "mood.saveRecord": "保存记录",
    "mood.musicRecommendation": "音乐推荐",
    "mood.basedOnMood": "根据你的心情",
    "mood.monthlyTrend": "月度心情趋势",
    "mood.avgMood": "平均心情",
    "mood.bestDay": "最佳日期",
    "mood.saved": "心情记录已保存",
    
    // Mood Playlists
    "playlist.melancholic": "忧郁时刻",
    "playlist.melancholicDesc": "Lo-fi & 氛围音乐",
    "playlist.coffee": "咖啡馆氛围",
    "playlist.coffeeDesc": "原声 & 放松",
    "playlist.indie": "独立音乐下午",
    "playlist.indieDesc": "振奋人心的独立音乐",
    "playlist.happy": "快乐流行",
    "playlist.happyDesc": "感觉良好的热门歌曲",
    "playlist.energy": "能量提升",
    "playlist.energyDesc": "欢快 & 舞曲",
    
    // Habits
    "habits.title": "习惯打卡",
    "habits.subtitle": "培养良好习惯，成就更好的自己",
    "habits.addHabit": "添加习惯",
    "habits.addNewHabit": "添加新习惯",
    "habits.habitName": "习惯名称",
    "habits.placeholder": "例如：每天运动30分钟",
    "habits.selectColor": "选择颜色",
    "habits.save": "保存",
    "habits.weeklyCompletion": "本周完成率",
    "habits.habitCount": "习惯数量",
    "habits.longestStreak": "最长连续",
    "habits.days": "天",
    "habits.tracker": "习惯打卡表",
    "habits.habit": "习惯",
    "habits.streak": "连续",
    "habits.noHabits": "还没有添加习惯",
    "habits.addFirst": "添加第一个习惯",
    "habits.added": "习惯已添加",
    "habits.deleted": "习惯已删除",
    "habits.enterName": "请输入习惯名称",
    "habits.enterColorDesc": "输入习惯名称并选择颜色",
    
    // Insights
    "insights.title": "AI 洞察",
    "insights.subtitle": "发现您的生活数据中的模式",
    "insights.weeklyReport": "周度报告",
    "insights.generateReport": "生成报告",
    "insights.generating": "生成中...",
    "insights.analyzing": "分析数据中...",
    "insights.noData": "暂无数据",
    "insights.noDataDesc": "开始记录您的支出、心情和习惯以生成洞察报告。",
    "insights.dataRange": "数据范围",
    "insights.to": "至",
    "insights.overview": "总览",
    "insights.moodAnalysis": "心情分析",
    "insights.expenseInsights": "支出洞察",
    "insights.habitProgress": "习惯进度",
    "insights.recommendations": "建议",
    
    // Settings
    "settings.title": "设置",
    "settings.subtitle": "管理您的数据和偏好",
    "settings.dataManagement": "数据管理",
    "settings.exportData": "导出数据",
    "settings.exportDesc": "将所有数据下载为 JSON 文件",
    "settings.export": "导出",
    "settings.exporting": "导出中...",
    "settings.clearData": "清除所有数据",
    "settings.clearDesc": "永久删除所有记录",
    "settings.clear": "清除",
    "settings.about": "关于",
    "settings.version": "版本",
    "settings.description": "一款融合记账、情绪记录、习惯打卡与 AI 深度反馈的全维度个人生活管理工具。",
    "settings.privacy": "隐私",
    "settings.privacyDesc": "所有数据仅存储在您的浏览器本地，不会上传到任何服务器。",
    "settings.confirmClear": "确认清除所有数据？",
    "settings.confirmClearDesc": "此操作将永久删除所有记账、心情、习惯记录。此操作不可恢复。建议在清除前先导出数据作为备份。",
    "settings.cancel": "取消",
    "settings.confirmClearButton": "确认清除",
    "settings.dataCleared": "所有数据已清除",
    "settings.dataExported": "数据导出成功",
    
    // Welcome Dialog
    "welcome.title": "欢迎使用每日生活记",
    "welcome.description": "一款融合记账、情绪记录、习惯打卡与 AI 深度反馈的全维度个人生活管理工具。",
    "welcome.features": "核心功能",
    "welcome.expenseSystem": "记账系统",
    "welcome.expenseSystemDesc": "极简录入，月度统计，一目了然",
    "welcome.moodDiary": "心情日记",
    "welcome.moodDiaryDesc": "1-10分评分，追踪情绪趋势，音乐推荐陪伴",
    "welcome.habitTracking": "习惯打卡",
    "welcome.habitTrackingDesc": "可视化打卡表，培养持续好习惯",
    "welcome.aiInsights": "AI 周度洞察",
    "welcome.aiInsightsDesc": "挖掘情绪与消费关联，生成个性化建议",
    "welcome.highlights": "独特亮点",
    "welcome.spiralViz": "螺旋可视化：",
    "welcome.spiralVizDesc": "独特的极坐标生长图，艺术化展示生活轨迹",
    "welcome.dailyQuote": "每日一句：",
    "welcome.dailyQuoteDesc": "基于心情智能推荐鼓励语",
    "welcome.quickRecord": "60秒记录：",
    "welcome.quickRecordDesc": "快速入口，一分钟完成核心记录",
    "welcome.demoNotice": "💡 提示：",
    "welcome.demoNoticeDesc": "为了让你快速体验功能，我们已为你准备了最近14天的示例数据。你可以随时在设置中清除这些数据。",
    "welcome.privacyTitle": "隐私保护：",
    "welcome.privacyText": "所有数据仅存储在你的浏览器本地，不会上传到任何服务器。你可以随时导出或删除数据。",
    "welcome.getStarted": "开始使用",
    
    // Common
    "common.loading": "加载中...",
    "common.save": "保存",
    "common.cancel": "取消",
    "common.delete": "删除",
    "common.edit": "编辑",
    "common.close": "关闭",
    "common.confirm": "确认",
    "common.back": "返回",
    "common.next": "下一步",
    "common.previous": "上一步",
    "common.search": "搜索",
    "common.filter": "筛选",
    "common.sort": "排序",
    "common.today": "今天",
    "common.yesterday": "昨天",
    "common.thisWeek": "本周",
    "common.thisMonth": "本月",
    "common.total": "总计",
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem("dailyspiral_language");
    return (saved as Language) || "en";
  });

  useEffect(() => {
    localStorage.setItem("dailyspiral_language", language);
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
