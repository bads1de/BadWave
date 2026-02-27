"use client";

import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";

import { cn } from "@/libs/utils";

const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-none border border-theme-500/20 shadow-[0_0_10px_rgba(var(--theme-500),0.1)] group/avatar cyber-glitch",
      className
    )}
    {...props}
  >
    {/* 角の装飾 */}
    <div className="absolute top-0 right-0 w-1 h-1 border-t border-r border-theme-500/40 group-hover/avatar:border-theme-500 transition-colors" />
    <div className="absolute bottom-0 left-0 w-1 h-1 border-b border-l border-theme-500/40 group-hover/avatar:border-theme-500 transition-colors" />
    {props.children}
  </AvatarPrimitive.Root>
));
Avatar.displayName = AvatarPrimitive.Root.displayName;

const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    className={cn("aspect-square h-full w-full object-cover transition-all duration-700 group-hover/avatar:scale-110 opacity-80 group-hover/avatar:opacity-60", className)}
    {...props}
  />
));
AvatarImage.displayName = AvatarPrimitive.Image.displayName;

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(
      "flex h-full w-full items-center justify-center rounded-none bg-theme-900 text-theme-500 font-mono text-xs font-black",
      className
    )}
    {...props}
  />
));
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName;

export { Avatar, AvatarImage, AvatarFallback };
