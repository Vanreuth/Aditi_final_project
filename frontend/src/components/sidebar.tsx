"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  LayoutDashboard,
  Settings,
  Users,
  BarChart3,
  FileText,
  MessageSquare,
  Shield,
  HelpCircle,
  LogOut,
  BookOpen,
  Layers,
  TableOfContents,
  ChartBarBig,
  ChevronRight,
  ChevronsUpDown,
  Building2,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const sidebarGroups = [
  {
    title: "Overview",
    items: [
      { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard, badge: null },
      { title: "Analytics", href: "/dashboard/analytics", icon: BarChart3, badge: null },
      { title: "Settings", href: "/dashboard/settings", icon: Settings, badge: null },
    ],
  },
  {
    title: "People",
    items: [
      { title: "Users", href: "/dashboard/users", icon: Users, badge: null },
    ],
  },
  {
    title: "Content",
    items: [
      { title: "Categories", href: "/dashboard/categories", icon: Layers, badge: null },
      { title: "Courses", href: "/dashboard/courses", icon: BookOpen, badge: null },
      { title: "Chapters", href: "/dashboard/chapters", icon: TableOfContents, badge: null },
      { title: "Lessons", href: "/dashboard/lessons", icon: ChartBarBig, badge: null },
      { title: "Documents", href: "/dashboard/documents", icon: FileText, badge: null },
    ],
  },
  {
    title: "System",
    items: [
      { title: "Messages", href: "/dashboard/messages", icon: MessageSquare, badge: null },
      { title: "Security", href: "/dashboard/security", icon: Shield, badge: null },
      { title: "Help", href: "/dashboard/help", icon: HelpCircle, badge: null },
    ],
  },
];

interface SidebarProps {
  onMobileClose?: () => void;
  isMobile?: boolean;
}

export function AppSidebar({ onMobileClose, isMobile = false }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const isActiveLink = (href: string): boolean => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const handleLinkClick = () => onMobileClose?.();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Signed out successfully");
      router.push("/login");
    } catch {
      toast.error("Sign out failed");
    }
  };

  return (
      <Sidebar
          collapsible="icon"
          variant="sidebar"
          className={cn(
              "border-r border-[#2a2520]/60",
              "bg-[#0f0d0b]",
              "[--sidebar-background:theme(colors.stone.950)]",
              "[--sidebar-foreground:theme(colors.stone.300)]",
              "[--sidebar-accent:theme(colors.stone.800)]",
              "[--sidebar-accent-foreground:theme(colors.amber.400)]",
              "[--sidebar-border:theme(colors.stone.800)]",
          )}
      >
        {/* ─── Header / Logo ───────────────────────── */}
        <SidebarHeader className="border-b border-[#2a2520]/80 px-2 py-3">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                  size="lg"
                  asChild
                  className="h-12 rounded-xl hover:bg-stone-800/60 transition-all duration-200 data-[active=true]:bg-stone-800"
              >
                <Link href="/dashboard" onClick={handleLinkClick}>
                  {/* Logo mark */}
                  <div className="flex aspect-square size-9 items-center justify-center rounded-lg bg-amber-500/10 border border-amber-500/20 ring-1 ring-amber-400/10">
                    <Building2 className="size-5 text-amber-400" strokeWidth={1.5} />
                  </div>
                  <div className="grid flex-1 text-left leading-tight group-data-[collapsible=icon]:hidden">
                  <span className="truncate text-[13px] font-semibold tracking-tight text-stone-100">
                    Camtop Property
                  </span>
                    <span className="truncate text-[10px] text-stone-500 font-medium tracking-widest uppercase">
                    Valuation & Advisory
                  </span>
                  </div>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        {/* ─── Navigation ──────────────────────────── */}
        <SidebarContent className="px-2 py-3 gap-0">
          {sidebarGroups.map((group, gi) => (
              <SidebarGroup key={group.title} className={gi > 0 ? "mt-4" : ""}>
                {/* Group label — hidden when collapsed */}
                <SidebarGroupLabel className={cn(
                    "mb-1.5 px-2 text-[9px] font-bold uppercase tracking-[0.18em]",
                    "text-stone-600 group-data-[collapsible=icon]:hidden"
                )}>
                  {group.title}
                </SidebarGroupLabel>

                <SidebarGroupContent>
                  <SidebarMenu className="gap-0.5">
                    {group.items.map((item) => {
                      const isActive = isActiveLink(item.href);
                      const Icon = item.icon;

                      return (
                          <SidebarMenuItem key={item.href}>
                            <SidebarMenuButton
                                asChild
                                isActive={isActive}
                                tooltip={item.title}
                                onClick={handleLinkClick}
                                className={cn(
                                    "h-9 rounded-lg px-2.5 gap-2.5",
                                    "text-stone-400 text-[13px] font-medium",
                                    "transition-all duration-150",
                                    "hover:bg-stone-800/70 hover:text-stone-100",
                                    isActive && [
                                      "bg-gradient-to-r from-amber-500/15 to-transparent",
                                      "text-amber-400 font-semibold",
                                      "border-l-2 border-amber-400 rounded-l-none",
                                      "hover:bg-amber-500/15 hover:text-amber-300",
                                    ]
                                )}
                            >
                              <Link href={item.href}>
                                <Icon
                                    className={cn(
                                        "size-4 shrink-0 transition-colors",
                                        isActive ? "text-amber-400" : "text-stone-500"
                                    )}
                                    strokeWidth={isActive ? 2 : 1.75}
                                />
                                <span>{item.title}</span>
                              </Link>
                            </SidebarMenuButton>

                            {item.badge && (
                                <SidebarMenuAction className="pointer-events-none right-2">
                          <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-500/20 px-1 text-[9px] font-bold text-amber-400">
                            {item.badge}
                          </span>
                                </SidebarMenuAction>
                            )}
                          </SidebarMenuItem>
                      );
                    })}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
          ))}
        </SidebarContent>

        {/* ─── Footer / User ───────────────────────── */}
        <SidebarFooter className="border-t border-[#2a2520]/80 p-2">
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu open={userMenuOpen} onOpenChange={setUserMenuOpen}>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton
                      size="lg"
                      className={cn(
                          "h-11 rounded-xl px-2 gap-3",
                          "hover:bg-stone-800/60 transition-all duration-200",
                          "ring-1 ring-transparent hover:ring-stone-700/50"
                      )}
                  >
                    {/* Avatar with presence dot */}
                    <div className="relative shrink-0">
                      <Avatar className="h-8 w-8 rounded-lg ring-1 ring-stone-700/50">
                        <AvatarImage src={user?.profilePicture || undefined} alt={user?.username} />
                        <AvatarFallback className="rounded-lg bg-amber-500/10 text-amber-400 text-xs font-bold">
                          {user?.username?.slice(0, 2)?.toUpperCase() ?? "U"}
                        </AvatarFallback>
                      </Avatar>
                      <span className="absolute -bottom-0.5 -right-0.5 size-2 rounded-full bg-emerald-500 ring-2 ring-[#0f0d0b]" />
                    </div>

                    <div className="grid flex-1 text-left leading-tight group-data-[collapsible=icon]:hidden">
                    <span className="truncate text-[13px] font-semibold text-stone-200">
                      {user?.username}
                    </span>
                      <span className="truncate text-[10px] text-stone-500">{user?.email}</span>
                    </div>

                    <ChevronsUpDown className="ml-auto size-3.5 text-stone-600 group-data-[collapsible=icon]:hidden" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                    className={cn(
                        "w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-xl p-1.5",
                        "bg-[#1a1612] border-stone-800 shadow-2xl shadow-black/60"
                    )}
                    side={isMobile ? "bottom" : "right"}
                    align="end"
                    sideOffset={6}
                >
                  {/* User info header */}
                  <div className="flex items-center gap-2.5 px-2 py-2 mb-1">
                    <Avatar className="h-9 w-9 rounded-lg ring-1 ring-stone-700/50">
                      <AvatarImage src={user?.profilePicture || undefined} alt={user?.username} />
                      <AvatarFallback className="rounded-lg bg-amber-500/10 text-amber-400 text-xs font-bold">
                        {user?.username?.slice(0, 2)?.toUpperCase() ?? "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left">
                      <span className="text-[13px] font-semibold text-stone-100">{user?.username}</span>
                      <span className="text-[11px] text-stone-500 truncate">{user?.email}</span>
                    </div>
                  </div>

                  <div className="h-px bg-stone-800/80 mx-1 mb-1" />

                  <DropdownMenuItem
                      onClick={() => { setUserMenuOpen(false); router.push("/dashboard/settings"); }}
                      className="rounded-lg px-2.5 py-2 gap-2.5 text-stone-300 text-[13px] cursor-pointer focus:bg-stone-800 focus:text-stone-100"
                  >
                    <Settings className="size-4 text-stone-500" strokeWidth={1.5} />
                    Settings
                  </DropdownMenuItem>

                  <div className="h-px bg-stone-800/80 mx-1 my-1" />

                  <DropdownMenuItem
                      onClick={handleLogout}
                      className="rounded-lg px-2.5 py-2 gap-2.5 text-[13px] cursor-pointer text-red-400 focus:bg-red-500/10 focus:text-red-400"
                  >
                    <LogOut className="size-4" strokeWidth={1.5} />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>

        <SidebarRail className="after:bg-stone-700/30 hover:after:bg-amber-400/30" />
      </Sidebar>
  );
}