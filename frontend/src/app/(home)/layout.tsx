"use client";

import Link from "next/link";
import { JetBrains_Mono, Kantumruy_Pro, Poppins } from "next/font/google";
import { BookOpenCheck, Compass, Info, Map, MessageSquare, Moon, Sun } from "lucide-react";
import { LocaleProvider, useLocale } from "@/components/locale-provider";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

const poppins = Poppins({
	subsets: ["latin"],
	weight: ["400", "500", "600", "700"],
	variable: "--font-poppins",
});

const khmer = Kantumruy_Pro({
	subsets: ["khmer", "latin"],
	weight: ["400", "500", "600", "700"],
	variable: "--font-khmer-pro",
});

const mono = JetBrains_Mono({
	subsets: ["latin"],
	weight: ["400", "500", "700"],
	variable: "--font-jb-mono",
});

const navItems = [
	{ href: "/", label: { en: "Home", km: "ទំព័រដើម" }, icon: Compass },
	{ href: "/courses", label: { en: "Courses", km: "វគ្គសិក្សា" }, icon: BookOpenCheck },
	{ href: "/roadmap", label: { en: "Roadmap", km: "ផែនទីសិក្សា" }, icon: Map },
	{ href: "/about", label: { en: "About", km: "អំពីយើង" }, icon: Info },
	{ href: "/contact", label: { en: "Contact", km: "ទំនាក់ទំនង" }, icon: MessageSquare },
] as const;

const copy = {
	en: {
		brand: "ADUTI",
		platform: "Learning Platform",
		start: "Start Learning",
		footerTagline: "Practical IT education for real engineering careers.",
		footerLinks: "Quick Links",
		footerContact: "Contact",
		footerEmail: "support@adutilearning.com",
		footerRights: "© 2025 ADUTI Learning. All rights reserved.",
	},
	km: {
		brand: "ADUTI",
		platform: "វេទិកាសិក្សា",
		start: "ចាប់ផ្តើមរៀន",
		footerTagline: "ការសិក្សា IT បែបអនុវត្ត សម្រាប់អាជីពវិស្វករពិតប្រាកដ។",
		footerLinks: "តំណភ្ជាប់",
		footerContact: "ទំនាក់ទំនង",
		footerEmail: "support@adutilearning.com",
		footerRights: "© 2025 ADUTI Learning. រក្សាសិទ្ធិទាំងអស់។",
	},
} as const;

export default function HomeLayout({ children }: { children: React.ReactNode }) {
	return (
		<LocaleProvider>
			<HomeShell>{children}</HomeShell>
		</LocaleProvider>
	);
}

function HomeShell({ children }: { children: React.ReactNode }) {
	const { locale, setLocale } = useLocale();
	const { theme, setTheme } = useTheme();
	const t = copy[locale];

	return (
		<div
			className={`${mono.variable} ${locale === "km" ? khmer.className : poppins.className} relative min-h-screen overflow-x-clip`}
			style={{
				background: theme === "dark"
					? "linear-gradient(135deg, #0f0c29 0%, #1a1040 40%, #24243e 100%)"
					: "linear-gradient(135deg, #f0eeff 0%, #e8e0ff 30%, #f5f0ff 60%, #eef5ff 100%)",
			}}
		>
			{/* Decorative blobs */}
			<div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
				<div
					className="absolute -top-32 -left-32 h-96 w-96 rounded-full opacity-40 blur-3xl"
					style={{ background: "radial-gradient(circle, #a78bfa, #818cf8)" }}
				/>
				<div
					className="absolute top-1/3 -right-24 h-80 w-80 rounded-full opacity-30 blur-3xl"
					style={{ background: "radial-gradient(circle, #c4b5fd, #93c5fd)" }}
				/>
				<div
					className="absolute bottom-1/4 left-1/4 h-64 w-64 rounded-full opacity-25 blur-3xl"
					style={{ background: "radial-gradient(circle, #f0abfc, #a78bfa)" }}
				/>
			</div>

			<div className="relative z-10 mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
				{/* ── Navbar ── */}
				<header className="sticky top-3 z-40 rounded-2xl border border-white/70 bg-white/90 px-4 py-3 shadow-lg shadow-purple-200/30 backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/85 dark:shadow-black/30 md:px-6">
					<div className="flex items-center justify-between gap-4">
						{/* Brand */}
						<Link href="/" className="flex items-center gap-2.5 shrink-0">
							<div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-500 text-white shadow-md shadow-violet-400/30">
								<span className="text-sm font-bold">A</span>
							</div>
							<div className="leading-tight">
								<span className="text-base font-bold">
									<span className="text-violet-600 dark:text-violet-400">{t.brand}</span>
								</span>
								<p className="text-[10px] text-slate-500 dark:text-slate-400 leading-none">{t.platform}</p>
							</div>
						</Link>

						{/* Desktop nav */}
						<nav className="hidden items-center gap-1 lg:flex">
							{navItems.map((item) => (
								<Link
									key={item.href}
									href={item.href}
									className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium text-slate-600 transition-all hover:bg-violet-100 hover:text-violet-700 dark:text-slate-300 dark:hover:bg-violet-900/40 dark:hover:text-violet-300"
								>
									<item.icon className="h-3.5 w-3.5" />
									{item.label[locale]}
								</Link>
							))}
						</nav>

						{/* Right controls */}
						<div className="flex items-center gap-2">
							{/* Locale switcher */}
							<div className="inline-flex rounded-lg border border-slate-200 bg-slate-100 p-0.5 dark:border-white/15 dark:bg-slate-800">
								<button
									type="button"
									onClick={() => setLocale("en")}
									className={`rounded-md px-2.5 py-1 text-xs font-semibold transition ${
										locale === "en"
											? "bg-white text-violet-700 shadow-sm dark:bg-slate-700 dark:text-violet-300"
											: "text-slate-500 dark:text-slate-400"
									}`}
								>
									EN
								</button>
								<button
									type="button"
									onClick={() => setLocale("km")}
									className={`rounded-md px-2.5 py-1 text-xs font-semibold transition ${
										locale === "km"
											? "bg-white text-violet-700 shadow-sm dark:bg-slate-700 dark:text-violet-300"
											: "text-slate-500 dark:text-slate-400"
									}`}
								>
									ខ្មែរ
								</button>
							</div>

							{/* Theme toggle */}
							<button
								type="button"
								onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
								className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-violet-50 hover:text-violet-700 dark:border-white/15 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-violet-900/40 dark:hover:text-violet-300"
							>
								{theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
							</button>

							<Button
								asChild
								className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-400/30 hover:from-violet-500 hover:to-indigo-500"
							>
								<Link href="/courses">{t.start}</Link>
							</Button>
						</div>
					</div>

					{/* Mobile nav */}
					<nav className="mt-3 flex flex-wrap items-center gap-1.5 lg:hidden">
						{navItems.map((item) => (
							<Link
								key={`mobile-${item.href}`}
								href={item.href}
								className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700 dark:border-white/15 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-violet-400/40 dark:hover:bg-violet-900/30"
							>
								<item.icon className="h-3 w-3" />
								{item.label[locale]}
							</Link>
						))}
					</nav>
				</header>

				{/* ── Main content ── */}
				<main className="mt-7 pb-12">{children}</main>

				{/* ── Footer ── */}
				<footer className="rounded-2xl border border-white/60 bg-white/70 px-6 py-8 shadow-sm backdrop-blur-lg dark:border-white/10 dark:bg-slate-900/60 md:px-8">
					<div className="grid gap-8 md:grid-cols-3">
						<div>
							<div className="flex items-center gap-2 mb-3">
								<div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-violet-500 to-indigo-500 text-white text-xs font-bold">
									A
								</div>
								<span className="font-bold text-violet-600 dark:text-violet-400">{t.brand}</span>
							</div>
							<p className="text-sm text-slate-600 dark:text-slate-400">{t.footerTagline}</p>
						</div>
						<div>
							<p className="mb-3 text-sm font-semibold text-slate-800 dark:text-slate-200">{t.footerLinks}</p>
							<ul className="space-y-2">
								{navItems.map((item) => (
									<li key={item.href}>
										<Link
											href={item.href}
											className="text-sm text-slate-600 transition hover:text-violet-600 dark:text-slate-400 dark:hover:text-violet-400"
										>
											{item.label[locale]}
										</Link>
									</li>
								))}
							</ul>
						</div>
						<div>
							<p className="mb-3 text-sm font-semibold text-slate-800 dark:text-slate-200">{t.footerContact}</p>
							<p className="text-sm text-violet-600 dark:text-violet-400">{t.footerEmail}</p>
						</div>
					</div>
					<div className="mt-8 border-t border-slate-200/70 pt-5 text-center text-xs text-slate-500 dark:border-white/10 dark:text-slate-500">
						{t.footerRights}
					</div>
				</footer>
			</div>
		</div>
	);
}
