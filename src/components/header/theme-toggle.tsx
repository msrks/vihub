"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useTransition } from "react";

export function ThemeToggle({ className }: { className?: string }) {
  const { setTheme, theme } = useTheme();
  const [, startTransition] = useTransition();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => {
        startTransition(() => {
          setTheme(theme === "light" ? "dark" : "light");
        });
      }}
      className={cn("group text-muted-foreground", className)}
    >
      <Sun className="size-5 scale-100 transition-all dark:scale-0" />
      <Moon className="absolute size-5  scale-0 transition-all dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
