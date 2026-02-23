"use client";

import { useTheme } from "@/app/contexts/ThemeContext";
import { Toaster as Sonner, ToasterProps } from "sonner";
import { cn } from "@/app/components/ui/utils";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme } = useTheme();

  const getThemeStyles = () => {
    switch(theme) {
      case 'ocean':
        return {
          "--normal-bg": "#0f172a", 
          "--normal-border": "rgba(255,255,255,0.1)",
          "--normal-text": "#fff",
          "--success-bg": "#06b6d4", 
          "--success-text": "#0f172a",
        };
      case 'ink':
        return {
          "--normal-bg": "#fff",
          "--normal-border": "#000",
          "--normal-text": "#000",
          "--success-bg": "#000",
          "--success-text": "#fff",
        };
      case 'zen':
        return {
          "--normal-bg": "#f0fdf4", 
          "--normal-border": "#d1fae5", 
          "--normal-text": "#064e3b", 
          "--success-bg": "#059669", 
          "--success-text": "#fff",
        };
      default: // Pastel 模式优化
        return {
          "--normal-bg": "rgba(255, 255, 255, 0.92)",
          "--normal-border": "rgba(255, 255, 255, 0.8)",
          "--normal-text": "#581c87", 
          "--success-bg": "#a855f7", 
          "--success-text": "#fff",
          "--error-bg": "#ec4899", 
          "--error-text": "#fff",
        };
    }
  };

  return (
    <>
      <style>
        {`
          [data-sonner-toaster] {
            top: 50% !important;
            left: 50% !important;
            transform: translate(-50%, -50%) !important;
            bottom: auto !important;
          }
          [data-sonner-toaster] [data-sonner-toast] {
            --y: 0px !important;
            margin-left: auto !important;
            margin-right: auto !important;
            transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) !important;
          }
          /* 弹出时的微小缩放效果 */
          [data-sonner-toast][data-opened="true"] {
            scale: 1.05;
          }
        `}
      </style>
      <Sonner
        theme={theme === 'ocean' ? 'dark' : 'light'}
        className="toaster group"
        position="top-center"
        duration={1000} // 缩短显示时间到 1 秒
        toastOptions={{
          style: getThemeStyles() as React.CSSProperties,
          className: cn(
            "font-black text-center pointer-events-auto transition-all duration-500",
            "flex items-center justify-center min-w-[260px] min-h-[70px] text-lg",
            // Pastel 模式：极致圆润 + 玻璃质感
            theme !== 'ocean' && theme !== 'ink' && theme !== 'zen' && 
            "backdrop-blur-3xl border-white shadow-[0_20px_60px_-10px_rgba(168,85,247,0.3)] rounded-[3rem] px-12 py-6",
            // 其他模式
            theme === 'ocean' && "rounded-[2rem] border border-white/10 shadow-[0_0_50px_rgba(6,182,212,0.4)] backdrop-blur-2xl px-10 py-6",
            theme === 'ink' && "rounded-none border-[4px] border-black shadow-[10px_10px_0px_0px_black] px-10 py-6",
            theme === 'zen' && "rounded-full border border-emerald-100 shadow-2xl px-14 py-6"
          )
        }}
        {...props}
      />
    </>
  );
};

export { Toaster };
