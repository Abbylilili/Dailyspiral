import { createBrowserRouter, Outlet, Navigate } from "react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/app/lib/supabase";
import { Home } from "@/app/pages/Home";
import { Expenses } from "@/app/pages/Expenses";
import { Mood } from "@/app/pages/Mood";
import { Habits } from "@/app/pages/Habits";
import DailyPlan from "@/app/pages/DailyPlan";
import { Insights } from "@/app/pages/Insights";
import { Settings } from "@/app/pages/Settings";
import { NotFound } from "@/app/pages/NotFound";
import { Login } from "@/app/pages/Login";
import { Layout } from "@/app/components/Layout";
import { ThemeProvider } from "@/app/contexts/ThemeContext";
import { LanguageProvider } from "@/app/contexts/LanguageContext";
import { Toaster } from "@/app/components/ui/sonner";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) return <>{children}</>; 
  if (!session) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function Root() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <Outlet />
        <Toaster />
      </LanguageProvider>
    </ThemeProvider>
  );
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    children: [
      {
        path: "login",
        element: <Login />,
      },
      {
        element: (
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        ),
        children: [
          { index: true, Component: Home },
          { path: "expenses", Component: Expenses },
          { path: "mood", Component: Mood },
          { path: "habits", Component: Habits },
          { path: "plan", Component: DailyPlan },
          { path: "insights", Component: Insights },
          { path: "settings", Component: Settings },
          { path: "*", Component: NotFound },
        ],
      },
    ],
  },
]);
