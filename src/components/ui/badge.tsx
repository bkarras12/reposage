import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "secondary" | "success" | "warning" | "destructive";
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        {
          "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900": variant === "default",
          "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200": variant === "secondary",
          "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200": variant === "success",
          "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200": variant === "warning",
          "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200": variant === "destructive",
        },
        className
      )}
      {...props}
    />
  );
}
