"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme, type ThemePreset } from "@/hooks/use-theme";
import { CheckIcon, Palette } from "lucide-react";

const themes: { value: ThemePreset; label: string; color: string }[] = [
  { value: "default", label: "Default", color: "bg-zinc-900" },
  { value: "ocean", label: "Ocean", color: "bg-blue-600" },
  { value: "forest", label: "Forest", color: "bg-green-600" },
  { value: "sunset", label: "Sunset", color: "bg-orange-500" },
  { value: "purple", label: "Purple", color: "bg-purple-600" },
  { value: "rose", label: "Rose", color: "bg-rose-500" },
];

export function ThemeSwitcher() {
  const { theme, changeTheme, mounted } = useTheme();

  if (!mounted) {
    return null;
  }
  const currentTheme = themes.find((t) => t.value === theme);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center justify-center rounded-full p-2 hover:text-primary transition-colors">
          <Palette
            size="22"
            className={`transition-colors ${currentTheme?.color.replace(
              "bg-",
              "text-"
            )}`}
          />
          <span className="sr-only">Change theme</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Theme Presets</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {themes.map((themeOption) => (
          <DropdownMenuItem
            key={themeOption.value}
            onClick={() => changeTheme(themeOption.value)}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <div className={`size-4 rounded-full ${themeOption.color}`} />
              <span>{themeOption.label}</span>
            </div>
            {theme === themeOption.value && <CheckIcon className="size-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
