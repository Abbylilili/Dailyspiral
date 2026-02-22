import { createBrowserRouter, Outlet } from "react-router";
import { Home } from "./pages/Home";
import { Expenses } from "./pages/Expenses";
import { Mood } from "./pages/Mood";
import { Habits } from "./pages/Habits";
import { Insights } from "./pages/Insights";
import { Settings } from "./pages/Settings";
import { NotFound } from "./pages/NotFound";
import { Layout } from "./components/Layout";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import { Toaster } from "./components/ui/sonner";

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
        element: <Layout />,
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
