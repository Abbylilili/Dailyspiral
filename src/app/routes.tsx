import { createBrowserRouter, Outlet, Navigate } from "react-router";
import { useState, useEffect } from "react";
import { supabase } from "./lib/supabase";
import { Home } from "./pages/Home";
import { Expenses } from "./pages/Expenses";
import { Mood } from "./pages/Mood";
import { Habits } from "./pages/Habits";
import { Insights } from "./pages/Insights";
import { Settings } from "./pages/Settings";
import { NotFound } from "./pages/NotFound";
import Login from "./pages/Login";
import { Layout } from "./components/Layout";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import { Toaster } from "./components/ui/sonner";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check initial session
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

  // During initial load, we still render children to prevent white flash.
  // The children (Layout) will handle their own data loading states.
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
          { path: "insights", Component: Insights },
          { path: "settings", Component: Settings },
          { path: "*", Component: NotFound },
        ],
      },
    ],
  },
]);
