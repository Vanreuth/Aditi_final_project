"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  ChevronRight,
  Search,
  Settings,
  LogOut,
  Bell,
  User,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/theme-toggle";
import { AppSwitcher } from "./shared/app-switcher";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Topbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [notifOpen, setNotifOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  // CMD+K shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
        setTimeout(() => searchRef.current?.focus(), 50);
      }
      if (e.key === "Escape") {
        setSearchOpen(false);
        setSearchValue("");
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const initials =
    user?.username
      ?.split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) ?? "AD";

  return (
    <div className="flex items-center gap-2 sm:gap-2.5">
      {/* ── Search ─────────────────────────────────── */}
      <div className="relative hidden sm:flex items-center">
        {searchOpen ? (
          /* Expanded search */
          <div
            className={cn(
              "flex h-10 w-72 items-center gap-2 rounded-2xl px-3",
              "border border-border/70 bg-background/70",
              "ring-1 ring-primary/15 shadow-lg shadow-black/5 backdrop-blur-xl",
              "transition-all duration-200",
            )}
          >
            <Search className="size-4 shrink-0 text-primary/70" />
            <input
              ref={searchRef}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Search anything..."
              className="flex-1 bg-transparent text-[13px] text-foreground placeholder:text-muted-foreground outline-none"
            />
            <button
              onClick={() => {
                setSearchOpen(false);
                setSearchValue("");
              }}
              className="shrink-0 text-muted-foreground transition-colors hover:text-foreground"
            >
              <X className="size-3.5" />
            </button>
          </div>
        ) : (
          /* Collapsed search pill */
          <button
            onClick={() => {
              setSearchOpen(true);
              setTimeout(() => searchRef.current?.focus(), 50);
            }}
            className={cn(
              "group flex h-10 items-center gap-2 rounded-2xl px-3",
              "border border-border/65 bg-background/55 text-muted-foreground",
              "shadow-sm backdrop-blur-sm transition-all duration-150",
              "hover:border-primary/25 hover:bg-accent/60 hover:text-foreground",
            )}
          >
            <Search className="size-4" />
            <span className="text-[12px] font-medium hidden lg:block">
              Search
            </span>
            {/* CMD+K badge */}
            <div className="items-center gap-0.5 hidden lg:flex ml-1">
              <kbd
                className={cn(
                  "flex h-4 w-4 items-center justify-center rounded text-[9px] font-bold",
                  "border border-border/70 bg-muted/60 text-muted-foreground",
                )}
              >
                ⌘
              </kbd>
              <kbd
                className={cn(
                  "flex h-4 w-4 items-center justify-center rounded text-[9px] font-bold",
                  "border border-border/70 bg-muted/60 text-muted-foreground",
                )}
              >
                K
              </kbd>
            </div>
          </button>
        )}
      </div>

      {/* ── Notifications ───────────────────────────── */}
      <DropdownMenu open={notifOpen} onOpenChange={setNotifOpen}>
        <DropdownMenuTrigger asChild>
          <button
            className={cn(
              "relative flex h-9 w-9 items-center justify-center rounded-xl",
              "border border-border/60 bg-background/55 text-muted-foreground",
              "transition-all duration-150",
              "hover:border-primary/20 hover:bg-accent/65 hover:text-foreground",
            )}
          >
            <Bell className="size-4" strokeWidth={1.75} />
            {/* Unread dot */}
            <span className="absolute right-2 top-2 size-2 rounded-full bg-primary ring-2 ring-background" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          sideOffset={8}
          className="w-80 overflow-hidden rounded-2xl border-border/70 bg-background/95 p-0 shadow-2xl shadow-black/10 backdrop-blur-xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
            <span className="text-[13px] font-semibold text-foreground">
              Notifications
            </span>
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
              3 new
            </span>
          </div>
          {/* Notification items */}
          {[
            {
              title: "New user registered",
              time: "2m ago",
              dot: "bg-blue-400",
            },
            {
              title: "Report generated",
              time: "1h ago",
              dot: "bg-emerald-400",
            },
            { title: "Security alert", time: "3h ago", dot: "bg-amber-400" },
          ].map((n, i) => (
            <div
              key={i}
              className="flex cursor-pointer items-start gap-3 border-b border-border/45 px-4 py-3 transition-colors last:border-0 hover:bg-accent/45"
            >
              <span
                className={cn("mt-1.5 size-1.5 rounded-full shrink-0", n.dot)}
              />
              <div className="flex-1 min-w-0">
                <p className="truncate text-[12px] font-medium text-foreground/90">
                  {n.title}
                </p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  {n.time}
                </p>
              </div>
            </div>
          ))}
          <div className="px-4 py-2.5">
            <button className="w-full text-center text-[11px] text-muted-foreground transition-colors hover:text-primary">
              View all notifications
            </button>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* ── App Switcher ─────────────────────────────── */}
      <AppSwitcher />

      {/* ── Theme Toggle ─────────────────────────────── */}
      <div className={cn("[&>button]:transition-all [&>button]:duration-150")}>
        <ThemeToggle />
      </div>

      {/* Divider */}
      <div className="mx-0.5 hidden h-6 w-px bg-border/60 sm:block" />

      {/* ── User Avatar / Profile Dropdown ───────────── */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className={cn(
              "relative flex h-10 items-center gap-2 rounded-2xl border border-border/60 bg-background/55 px-1.5 pr-2",
              "shadow-sm backdrop-blur-sm hover:border-primary/20 hover:bg-accent/65",
              "transition-all duration-150 outline-none",
            )}
          >
            <Avatar className="size-7 rounded-xl">
              <AvatarImage src={user?.profilePicture} />
              <AvatarFallback className="rounded-xl bg-primary/10 text-[11px] font-bold text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="hidden text-left md:block">
              <p className="max-w-28 truncate text-[12px] font-semibold text-foreground">
                {user?.username}
              </p>
              <p className="max-w-28 truncate text-[10px] text-muted-foreground">
                {user?.email}
              </p>
            </div>
            <ChevronRight className="hidden size-3.5 text-muted-foreground md:block" />
            {/* Online presence */}
            <span className="absolute -bottom-0.5 left-7 size-2 rounded-full bg-emerald-500 ring-2 ring-background" />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          sideOffset={8}
          className="w-60 rounded-2xl border-border/70 bg-background/95 p-1.5 shadow-2xl shadow-black/10 backdrop-blur-xl"
        >
          {/* User info */}
          <div className="px-2 py-2 mb-1">
            <p className="truncate text-[13px] font-semibold text-foreground">
              {user?.username}
            </p>
            <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
              {user?.email}
            </p>
          </div>
          <div className="mx-0.5 mb-1 h-px bg-border/60" />

          <DropdownMenuItem
            className="cursor-pointer gap-2.5 rounded-xl px-2.5 py-2 text-[13px] text-muted-foreground focus:bg-accent focus:text-foreground"
            onClick={() => router.push("/dashboard/profile")}
          >
            <User className="size-4 text-muted-foreground" strokeWidth={1.5} />
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer gap-2.5 rounded-xl px-2.5 py-2 text-[13px] text-muted-foreground focus:bg-accent focus:text-foreground"
            onClick={() => router.push("/dashboard/settings")}
          >
            <Settings
              className="size-4 text-muted-foreground"
              strokeWidth={1.5}
            />
            Settings
          </DropdownMenuItem>

          <div className="mx-0.5 my-1 h-px bg-border/60" />

          <DropdownMenuItem
            onClick={() => logout()}
            className="cursor-pointer gap-2.5 rounded-xl px-2.5 py-2 text-[13px] text-red-500 focus:bg-red-500/10 focus:text-red-500"
          >
            <LogOut className="size-4" strokeWidth={1.5} />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
