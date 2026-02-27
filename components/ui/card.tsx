import * as React from "react";

// 'libs/utils' の代わりに独自に実装
function cn(...classes: (string | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-none border border-theme-500/20 bg-[#0a0a0f]/80 text-white shadow-[inset_0_0_15px_rgba(var(--theme-500),0.05)] relative group/card cyber-glitch",
      className
    )}
    {...props}
  >
    {/* HUD装飾 */}
    <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-theme-500/0 group-hover/card:border-theme-500 transition-colors" />
    <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-theme-500/0 group-hover/card:border-theme-500 transition-colors" />
    {props.children}
  </div>
));
Card.displayName = "Card";

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6 border-b border-theme-500/10 bg-theme-500/5", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-xl font-mono font-black leading-none tracking-[0.2em] uppercase text-white drop-shadow-[0_0_8px_rgba(var(--theme-500),0.5)]",
      className
    )}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-[10px] font-mono uppercase tracking-widest text-theme-500/60", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
};
