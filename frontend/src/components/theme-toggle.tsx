"use client";

import type { ComponentType } from "react";
import { CheckIcon, Heart, Moon, Sparkles, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type AppTheme = "light" | "dark" | "aurora" | "sakura";

const themes: Array<{
  value: AppTheme;
  label: string;
  icon: ComponentType<{ className?: string }>;
}> = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "aurora", label: "Aurora", icon: Sparkles },
  { value: "sakura", label: "Sakura", icon: Heart },
];

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const currentTheme: AppTheme =
    theme && themes.some((item) => item.value === theme as AppTheme)
      ? (theme as AppTheme)
      : "light";
  const TriggerIcon = themes.find((item) => item.value === currentTheme)?.icon ?? Sun;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-xl border border-border/60 bg-background/55 text-foreground/75 shadow-sm backdrop-blur-sm transition-all hover:border-primary/30 hover:bg-accent/70 hover:text-foreground"
        >
          <TriggerIcon className="h-[1.05rem] w-[1.05rem]" />
          <span className="sr-only">Change theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-56 rounded-2xl border-border/70 bg-background/95 p-1.5 shadow-xl backdrop-blur-xl"
      >
        <DropdownMenuLabel className="px-2 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Theme Mode
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {themes.map((themeOption) => {
          const Icon = themeOption.icon;
          const isActive = currentTheme === themeOption.value;

          return (
            <DropdownMenuItem
              key={themeOption.value}
              onClick={() => setTheme(themeOption.value)}
              className={cn(
                "mt-1 flex items-center justify-between rounded-xl px-3 py-2.5",
                "border border-transparent transition-all",
                isActive
                  ? "border-primary/20 bg-primary/10 text-foreground"
                  : "text-muted-foreground hover:border-border/70 hover:bg-accent/50 hover:text-foreground"
              )}
            >
              <span className="flex items-center gap-2">
                <Icon className="h-4 w-4" />
                {themeOption.label}
              </span>
              {isActive ? <CheckIcon className="h-4 w-4" /> : null}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
