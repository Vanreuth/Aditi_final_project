"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  Settings,
  LogOut,
  Bell,
  User,
  Command,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
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
      user?.username?.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) ?? "AD";

  return (
      <div className="flex items-center gap-1.5">

        {/* ── Search ─────────────────────────────────── */}
        <div className="relative hidden sm:flex items-center">
          {searchOpen ? (
              /* Expanded search */
              <div className={cn(
                  "flex items-center gap-2 h-8 w-64 rounded-lg px-3",
                  "bg-stone-800/80 border border-stone-700/60",
                  "ring-1 ring-amber-400/20",
                  "transition-all duration-200"
              )}>
                <Search className="size-3.5 shrink-0 text-amber-400/70" />
                <input
                    ref={searchRef}
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    placeholder="Search anything..."
                    className="flex-1 bg-transparent text-[13px] text-stone-200 placeholder:text-stone-600 outline-none"
                />
                <button
                    onClick={() => { setSearchOpen(false); setSearchValue(""); }}
                    className="shrink-0 text-stone-600 hover:text-stone-300 transition-colors"
                >
                  <X className="size-3.5" />
                </button>
              </div>
          ) : (
              /* Collapsed search pill */
              <button
                  onClick={() => { setSearchOpen(true); setTimeout(() => searchRef.current?.focus(), 50); }}
                  className={cn(
                      "flex items-center gap-2 h-8 rounded-lg px-3",
                      "bg-stone-800/40 border border-stone-800/60",
                      "text-stone-600 hover:text-stone-300 hover:bg-stone-800/70 hover:border-stone-700/50",
                      "transition-all duration-150 group"
                  )}
              >
                <Search className="size-3.5" />
                <span className="text-[12px] font-medium hidden lg:block">Search</span>
                {/* CMD+K badge */}
                <div className="items-center gap-0.5 hidden lg:flex ml-1">
                  <kbd className={cn(
                      "flex h-4 w-4 items-center justify-center rounded text-[9px] font-bold",
                      "bg-stone-900 border border-stone-700/60 text-stone-600"
                  )}>⌘</kbd>
                  <kbd className={cn(
                      "flex h-4 w-4 items-center justify-center rounded text-[9px] font-bold",
                      "bg-stone-900 border border-stone-700/60 text-stone-600"
                  )}>K</kbd>
                </div>
              </button>
          )}
        </div>

        {/* ── Notifications ───────────────────────────── */}
        <DropdownMenu open={notifOpen} onOpenChange={setNotifOpen}>
          <DropdownMenuTrigger asChild>
            <button className={cn(
                "relative flex h-8 w-8 items-center justify-center rounded-lg",
                "text-stone-500 hover:text-stone-200",
                "bg-transparent hover:bg-stone-800/70",
                "border border-transparent hover:border-stone-700/50",
                "transition-all duration-150"
            )}>
              <Bell className="size-4" strokeWidth={1.75} />
              {/* Unread dot */}
              <span className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-amber-400 ring-1 ring-[#0a0907]" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
              align="end"
              sideOffset={8}
              className="w-72 rounded-xl p-0 bg-[#1a1612] border-stone-800 shadow-2xl shadow-black/60 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-stone-800/80">
              <span className="text-[13px] font-semibold text-stone-200">Notifications</span>
              <span className="text-[10px] font-bold text-amber-400 bg-amber-400/10 rounded-full px-2 py-0.5">
              3 new
            </span>
            </div>
            {/* Notification items */}
            {[
              { title: "New user registered", time: "2m ago", dot: "bg-blue-400" },
              { title: "Report generated", time: "1h ago", dot: "bg-emerald-400" },
              { title: "Security alert", time: "3h ago", dot: "bg-amber-400" },
            ].map((n, i) => (
                <div
                    key={i}
                    className="flex items-start gap-3 px-4 py-3 hover:bg-stone-800/40 cursor-pointer transition-colors border-b border-stone-800/40 last:border-0"
                >
                  <span className={cn("mt-1.5 size-1.5 rounded-full shrink-0", n.dot)} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] text-stone-300 font-medium truncate">{n.title}</p>
                    <p className="text-[11px] text-stone-600 mt-0.5">{n.time}</p>
                  </div>
                </div>
            ))}
            <div className="px-4 py-2.5">
              <button className="w-full text-[11px] text-stone-600 hover:text-amber-400 text-center transition-colors">
                View all notifications
              </button>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* ── App Switcher ─────────────────────────────── */}
        <AppSwitcher />

        {/* ── Theme Toggle ─────────────────────────────── */}
        <div className={cn(
            "[&>button]:h-8 [&>button]:w-8 [&>button]:rounded-lg",
            "[&>button]:text-stone-500 [&>button]:hover:text-stone-200",
            "[&>button]:hover:bg-stone-800/70",
            "[&>button]:border [&>button]:border-transparent [&>button]:hover:border-stone-700/50",
            "[&>button]:transition-all [&>button]:duration-150"
        )}>
          <ThemeToggle />
        </div>

        {/* Divider */}
        <div className="h-5 w-px bg-stone-800/80 mx-0.5" />

        {/* ── User Avatar / Profile Dropdown ───────────── */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className={cn(
                "relative flex h-8 w-8 items-center justify-center rounded-lg",
                "ring-1 ring-stone-700/50 hover:ring-amber-400/30",
                "transition-all duration-150 outline-none"
            )}>
              <Avatar className="size-full rounded-lg">
                <AvatarImage src={user?.profilePicture} />
                <AvatarFallback className="rounded-lg bg-amber-500/10 text-amber-400 text-[11px] font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              {/* Online presence */}
              <span className="absolute -bottom-0.5 -right-0.5 size-2 rounded-full bg-emerald-500 ring-[1.5px] ring-[#0a0907]" />
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
              align="end"
              sideOffset={8}
              className="w-56 rounded-xl p-1.5 bg-[#1a1612] border-stone-800 shadow-2xl shadow-black/60"
          >
            {/* User info */}
            <div className="px-2 py-2 mb-1">
              <p className="text-[13px] font-semibold text-stone-100 truncate">{user?.username}</p>
              <p className="text-[11px] text-stone-600 truncate mt-0.5">{user?.email}</p>
            </div>
            <div className="h-px bg-stone-800/80 mx-0.5 mb-1" />

            <DropdownMenuItem
                className="rounded-lg px-2.5 py-2 gap-2.5 text-[13px] text-stone-400 cursor-pointer focus:bg-stone-800 focus:text-stone-100"
                onClick={() => router.push("/dashboard/profile")}
            >
              <User className="size-4 text-stone-600" strokeWidth={1.5} />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem
                className="rounded-lg px-2.5 py-2 gap-2.5 text-[13px] text-stone-400 cursor-pointer focus:bg-stone-800 focus:text-stone-100"
                onClick={() => router.push("/dashboard/settings")}
            >
              <Settings className="size-4 text-stone-600" strokeWidth={1.5} />
              Settings
            </DropdownMenuItem>

            <div className="h-px bg-stone-800/80 mx-0.5 my-1" />

            <DropdownMenuItem
                onClick={() => logout()}
                className="rounded-lg px-2.5 py-2 gap-2.5 text-[13px] cursor-pointer text-red-400 focus:bg-red-500/10 focus:text-red-400"
            >
              <LogOut className="size-4" strokeWidth={1.5} />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
  );
}