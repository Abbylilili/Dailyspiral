"use client";

import type { FC, ReactNode } from "react";
import { Root, Portal, Overlay, Content, Title, Description, Action, Cancel, Trigger } from "@radix-ui/react-alert-dialog";
import { tv } from "tailwind-variants";
import { useTheme } from "@/app/contexts/ThemeContext";
import { cn } from "@/app/components/ui/utils";

const alertDialog = tv({
  slots: {
    overlay: "fixed inset-0 z-50 bg-black/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
    content: "fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-6 border p-8 duration-300 sm:max-w-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
    header: "flex flex-col gap-3 text-center sm:text-left",
    footer: "flex flex-col-reverse gap-3 sm:flex-row sm:justify-end mt-2",
    title: "text-xl font-bold tracking-tight",
    description: "text-sm leading-relaxed opacity-70",
    action: "inline-flex items-center justify-center px-6 py-2.5 font-bold transition-all active:scale-95 disabled:opacity-50",
    cancel: "inline-flex items-center justify-center px-6 py-2.5 transition-all active:scale-95 disabled:opacity-50"
  },
  variants: {
    theme: {
      ocean: {
        overlay: "bg-slate-955/80 backdrop-blur-md",
        content: "bg-slate-900 border-white/10 text-white shadow-[0_0_50px_-12px_rgba(6,182,212,0.5)] rounded-2xl",
        title: "text-cyan-400",
        action: "bg-cyan-500 hover:bg-cyan-400 text-slate-900 rounded-xl",
        cancel: "bg-slate-800 hover:bg-slate-700 text-white rounded-xl"
      },
      ink: {
        overlay: "bg-black/40",
        content: "bg-white border-2 border-black text-black shadow-[8px_8px_0px_0px_black] rounded-xl",
        title: "uppercase tracking-wider font-black",
        action: "bg-black hover:bg-gray-800 text-white rounded-lg uppercase tracking-widest font-black shadow-[4px_4px_0px_0px_gray]",
        cancel: "bg-white border-2 border-black text-black rounded-lg uppercase tracking-widest font-black"
      },
      zen: {
        content: "bg-white border-emerald-100 text-emerald-950 shadow-xl rounded-[2rem]",
        title: "text-emerald-800",
        action: "bg-emerald-600 hover:bg-emerald-500 text-white rounded-full",
        cancel: "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-full"
      },
      pastel: {
        content: "bg-white border-gray-200 text-gray-900 shadow-2xl rounded-3xl",
        action: "bg-black text-white rounded-2xl",
        cancel: "bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl"
      }
    }
  },
  defaultVariants: { theme: 'pastel' }
});

export interface AlertDialogProps {
  trigger?: ReactNode;
  title: ReactNode;
  description: ReactNode;
  actionText?: ReactNode;
  cancelText?: ReactNode;
  onAction?: () => void;
  onCancel?: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const AlertDialog: FC<AlertDialogProps> = ({
  trigger, title, description, actionText, cancelText, onAction, onCancel, open, onOpenChange
}) => {
  const { theme } = useTheme();
  const s = alertDialog({ theme: (['ocean', 'ink', 'zen'].includes(theme) ? theme : 'pastel') as any });

  return (
    <Root open={open} onOpenChange={onOpenChange}>
      {trigger && <Trigger asChild>{trigger}</Trigger>}
      <Portal>
        <Overlay className={s.overlay()} />
        <Content className={s.content()}>
          <div className={s.header()}>
            <Title className={s.title()}>{title}</Title>
            <Description className={s.description()}>{description}</Description>
          </div>
          <div className={s.footer()}>
            {cancelText && <Cancel asChild><button className={s.cancel()} onClick={onCancel}>{cancelText}</button></Cancel>}
            {actionText && <Action asChild><button className={s.action()} onClick={onAction}>{actionText}</button></Action>}
          </div>
        </Content>
      </Portal>
    </Root>
  );
};
