import * as React from "react";
import { cn } from "@/app/components/ui/utils";

// --- 基础子组件 (保留灵活性) ---

export const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
  )
);
CardHeader.displayName = "CardHeader";

export const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn("text-lg font-bold leading-none tracking-tight", className)} {...props} />
  )
);
CardTitle.displayName = "CardTitle";

export const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("text-sm text-muted-foreground opacity-70", className)} {...props} />
  )
);
CardDescription.displayName = "CardDescription";

export const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
  )
);
CardContent.displayName = "CardContent";

export const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center p-6 pt-0", className)} {...props} />
  )
);
CardFooter.displayName = "CardFooter";

// --- 主组件接口 (支持配置模式) ---

export interface CardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'content'> {
  header?: React.ReactNode;
  tag?: React.ReactNode;
  description?: React.ReactNode;
  content?: React.ReactNode;
  footer?: React.ReactNode;
  headerClassName?: string;
  contentClassName?: string;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, header, tag, description, content, footer, headerClassName, contentClassName, children, ...props }, ref) => {
    // 检查是否使用了配置模式
    const isConfigMode = !!(header || tag || description || content || footer);

    return (
      <div
        ref={ref}
        className={cn("rounded-2xl border bg-card text-card-foreground shadow-sm overflow-hidden", className)}
        {...props}
      >
        {isConfigMode ? (
          <>
            {(header || tag || description) && (
              <CardHeader className={headerClassName}>
                <div className="flex items-center justify-between">
                  {header && <CardTitle>{header}</CardTitle>}
                  {tag && <div className="text-xs font-medium opacity-60">{tag}</div>}
                </div>
                {description && <CardDescription>{description}</CardDescription>}
              </CardHeader>
            )}
            {content && <CardContent className={contentClassName}>{content}</CardContent>}
            {children && <CardContent className={contentClassName}>{children}</CardContent>}
            {footer && <CardFooter>{footer}</CardFooter>}
          </>
        ) : (
          children
        )}
      </div>
    );
  }
);
Card.displayName = "Card";
