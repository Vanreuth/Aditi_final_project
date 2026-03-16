"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { ArrowRight, LogIn, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/hooks/useAuth";
import { getDefaultAppRoute } from "@/types/api";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "ទំព័រដើម" },
  { href: "/courses", label: "វគ្គសិក្សា" },
  { href: "/roadmap", label: "ផែនទីសិក្សា" },
  { href: "/about", label: "អំពីយើង" },
  { href: "/contact", label: "ទំនាក់ទំនង" },
];

export default function Navbar() {
  const { user } = useAuth();
  const pathname = usePathname();
  const isAuthPage = pathname?.startsWith("/login") || pathname?.startsWith("/register");

  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const authHref = user ? getDefaultAppRoute(user.roles ?? []) : "/login";
  const authLabel = user ? "គណនីរបស់ខ្ញុំ" : "ចូលគណនី";

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10);
    handler();
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, [pathname]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-50">
      <div
        className={cn(
          "border-b border-black/10 transition-all duration-300",
          scrolled
            ? "bg-background/95 backdrop-blur-xl shadow-sm"
            : "bg-background/88 backdrop-blur-md"
        )}
      >
        <div className="container-app flex h-[84px] items-center justify-between gap-4">
          <Link href="/" className="group inline-flex items-center gap-3">
            <div className="relative">
              <div className="relative h-12 w-12 rounded-xl p-[4px]">
                <Image
                  src="/growth.png"
                  alt="CodeGrowthKH"
                  width={120}
                  height={120}
                  className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
                />
              </div>
            </div>
            <div className="leading-none">
              <p className="bg-gradient-to-r from-green-600 via-emerald-500 to-blue-600 bg-clip-text text-[18px] font-bold tracking-tight text-transparent">
                CodeGrowthKH
              </p>
              <p className="text-[11px] text-muted-foreground transition group-hover:text-foreground/80">
                រៀនកូដជាភាសាខ្មែរ
              </p>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-9">
            {navItems.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group relative py-2 text-[14px] font-medium transition"
                >
                  <span
                    className={cn(
                      active
                        ? "text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {item.label}
                  </span>
                  <span
                    className={cn(
                      "absolute left-0 -bottom-[3px] h-[2px] w-full rounded-full transition-all",
                      active
                        ? "bg-gradient-to-r from-green-500 via-emerald-500 to-blue-500 opacity-100"
                        : "bg-foreground/20 opacity-0 group-hover:opacity-100"
                    )}
                  />
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />
            <Link
              href={authHref}
              className="hidden items-center gap-1.5 rounded-full px-3 py-2 text-sm text-muted-foreground transition hover:bg-muted/70 hover:text-foreground sm:flex"
            >
              {user ? (
                user.profilePicture ? (
                  <Image
                    src={user.profilePicture}
                    alt={user.username ?? "Profile"}
                    width={32}
                    height={32}
                    className="h-8 w-8 rounded-full object-cover ring-2 ring-emerald-400/40 hover:ring-emerald-500/70 transition"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center ring-2 ring-emerald-400/40">
                    <span className="text-white text-xs font-bold uppercase">
                      {(user.username ?? "U").charAt(0)}
                    </span>
                  </div>
                )
              ) : (
                <>
                  <LogIn className="h-4 w-4" />
                  {authLabel}
                </>
              )}
            </Link>

            <Button
              asChild
              className={cn(
                "hidden rounded-full border-0 bg-gradient-to-r from-green-500 via-emerald-500 to-blue-500 px-5 text-white shadow-none sm:flex",
                isAuthPage && "md:px-6"
              )}
            >
              <Link href="/courses">
                ចាប់ផ្តើមរៀន
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>

            <button
              onClick={() => setOpen(!open)}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-border/60 bg-background/90 hover:bg-muted lg:hidden"
              aria-label={open ? "Close menu" : "Open menu"}
            >
              {open ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </div>

      <div
        className={cn(
          "overflow-hidden border-b border-black/10 bg-background/95 transition-all lg:hidden",
          open ? "max-h-[400px]" : "max-h-0"
        )}
      >
        <div className="container-app space-y-2 py-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block rounded-xl px-4 py-3 text-sm hover:bg-muted"
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          ))}

          <Link
            href={authHref}
            className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm text-muted-foreground hover:bg-muted"
            onClick={() => setOpen(false)}
          >
            <LogIn className="h-4 w-4" />
            {authLabel}
          </Link>

          <Button
            asChild
            className="w-full rounded-full bg-gradient-to-r from-green-500 via-emerald-500 to-blue-500"
          >
            <Link href="/courses" onClick={() => setOpen(false)}>
              ចាប់ផ្តើមរៀន
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
