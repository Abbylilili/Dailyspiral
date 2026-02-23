"use client";

import type { FC, ReactNode } from "react";
import { Root, Portal, Overlay, Content, Title, Description, Close, Trigger } from "@radix-ui/react-dialog";
import { tv } from "tailwind-variants";
import { XIcon } from "lucide-react";
import { useTheme } from "@/app/contexts/ThemeContext";
import { cn } from "@/app/components/ui/utils";

const dialog = tv({
  slots: {
    overlay: "fixed inset-0 z-50 bg-black/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
    content: "fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-6 border p-8 duration-300 sm:max-w-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
    header: "flex flex-col gap-3 text-center sm:text-left",
    title: "text-xl font-bold tracking-tight",
    description: "text-sm leading-relaxed opacity-70",
    close: "absolute top-4 right-4 rounded-full p-1 transition-opacity hover:opacity-100 opacity-50"
  },
  variants: {
    theme: {
      ocean: {
        overlay: "bg-slate-955/80 backdrop-blur-md",
        content: "bg-slate-900 border-white/10 text-white shadow-[0_0_50px_-12px_rgba(6,182,212,0.5)] rounded-2xl",
        title: "text-cyan-400",
        close: "text-slate-400 hover:text-white"
      },
      ink: {
        overlay: "bg-black/40",
        content: "bg-white border-2 border-black text-black shadow-[8px_8px_0px_0px_black] rounded-xl",
        title: "uppercase tracking-wider font-black",
        close: "text-black"
      },
      zen: {
        content: "bg-white border-emerald-100 text-emerald-950 shadow-xl rounded-[2rem]",
        title: "text-emerald-800",
        close: "text-emerald-700"
      },
      pastel: {
        content: "bg-white border-gray-200 text-gray-900 shadow-2xl rounded-3xl",
        close: "text-gray-400 hover:text-black"
      }
    }
  },
  defaultVariants: { theme: 'pastel' }
});

export interface DialogProps {
  trigger?: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
}

export const Dialog: FC<DialogProps> = ({
  trigger, title, description, children, open, onOpenChange, className
}) => {
  const { theme } = useTheme();
  const s = dialog({ theme: (['ocean', 'ink', 'zen'].includes(theme) ? theme : 'pastel') as any });

  return (
    <Root open={open} onOpenChange={onOpenChange}>
      {trigger && <Trigger asChild>{trigger}</Trigger>}
      <Portal>
        <Overlay className={s.overlay()} />
        <Content className={cn(s.content(), className)}>
          {(title || description) && (
            <div className={s.header()}>
              {title && <Title className={s.title()}>{title}</Title>}
              {description && <Description className={s.description()}>{description}</Description>}
            </div>
          )}
          {children}
          <Close className={s.close()}>
            <XIcon className="w-4 h-4" />
          </Close>
        </Content>
      </Portal>
    </Root>
  );
};
