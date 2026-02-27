"use client";

import Link from "next/link";
import { JetBrains_Mono, Kantumruy_Pro, Poppins } from "next/font/google";
import { BookOpenCheck, Compass, Info, Map, MessageSquare, Sparkles } from "lucide-react";
import { LocaleProvider, useLocale } from "@/components/locale-provider";
import { ThemeToggle } from "@/components/theme-toggle";
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
	{ href: "/#roadmap", label: { en: "Roadmap Preview", km: "មើលផែនទីសង្ខេប" }, icon: Map },
	{ href: "/about", label: { en: "About", km: "អំពីយើង" }, icon: Info },
	{ href: "/contact", label: { en: "Contact", km: "ទំនាក់ទំនង" }, icon: MessageSquare },
] as const;

const copy = {
	en: {
		platform: "IT Learning Platform",
		start: "Start Learning",
		mission: "Mission",
		missionBody:
			"Practical, project-first IT education that maps directly to real engineering roles.",
		focus: "Focus Areas",
		areas: [
			"Frontend and UI engineering",
			"Backend API architecture",
			"DevOps and deployment readiness",
		],
		platformTitle: "Platform",
		platformBody:
			"Built for structured growth from fundamentals to production systems.",
	},
	km: {
		platform: "វេទិកាសិក្សា IT",
		start: "ចាប់ផ្តើមរៀន",
		mission: "បេសកកម្ម",
		missionBody:
			"ការសិក្សា IT បែបអនុវត្តផ្ទាល់ ដែលភ្ជាប់ទៅតួនាទីវិស្វករផ្នែកបច្ចេកវិទ្យាពិតប្រាកដ។",
		focus: "ផ្នែកសំខាន់ៗ",
		areas: ["វិស្វកម្ម Frontend និង UI", "ស្ថាបត្យកម្ម Backend API", "DevOps និងការដាក់ឲ្យដំណើរការ"],
		platformTitle: "វេទិកា",
		platformBody: "បង្កើតឡើងសម្រាប់ការលូតលាស់ជាលំដាប់ ចាប់ពីមូលដ្ឋានរហូតដល់ production។",
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
	const t = copy[locale];

	return (
		<div
			className={`${mono.variable} ${locale === "km" ? khmer.className : poppins.className} relative min-h-screen overflow-x-clip bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100`}
		>
			<div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.16),_transparent_44%),radial-gradient(circle_at_top_right,_rgba(16,185,129,0.12),_transparent_36%)] dark:bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.18),_transparent_44%),radial-gradient(circle_at_top_right,_rgba(59,130,246,0.16),_transparent_36%),linear-gradient(180deg,_#020617_0%,_#020617_64%,_#000_100%)]" />
			<div className="container-app relative z-10 py-6 md:py-8">
				<header className="sticky top-3 z-40 rounded-2xl border border-slate-200/80 bg-white/85 px-4 py-3 shadow-sm shadow-slate-200/70 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/75 dark:shadow-black/30 md:px-6">
					<div className="flex flex-wrap items-center justify-between gap-4">
						<Link href="/" className="flex items-center gap-3">
							<div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-cyan-300 to-emerald-300 text-slate-900 shadow-lg shadow-cyan-500/20">
								<Sparkles className="h-5 w-5" />
							</div>
							<div>
								<p className="text-xs uppercase tracking-[0.18em] text-cyan-600 dark:text-cyan-200">ADUTI</p>
								<p className="text-base font-semibold">{t.platform}</p>
							</div>
						</Link>

						<nav className="hidden flex-wrap items-center gap-2 lg:flex">
							{navItems.map((item) => (
								<Link
									key={item.href}
									href={item.href}
									className="inline-flex items-center gap-2 rounded-full border border-transparent px-3 py-2 text-sm text-slate-600 transition hover:border-cyan-500/30 hover:bg-cyan-500/10 hover:text-cyan-700 dark:text-slate-200 dark:hover:border-cyan-300/40 dark:hover:bg-cyan-400/10 dark:hover:text-cyan-100"
								>
									<item.icon className="h-4 w-4" />
									{item.label[locale]}
								</Link>
							))}
						</nav>

						<div className="flex items-center gap-2">
							<div className="inline-flex rounded-md border border-slate-300 bg-white p-0.5 dark:border-white/20 dark:bg-slate-900/80">
								<button
									type="button"
									onClick={() => setLocale("en")}
									className={`rounded px-2 py-1 text-xs font-semibold transition ${
										locale === "en"
											? "bg-cyan-500/15 text-cyan-700 dark:text-cyan-100"
											: "text-slate-600 dark:text-slate-300"
									}`}
								>
									EN
								</button>
								<button
									type="button"
									onClick={() => setLocale("km")}
									className={`rounded px-2 py-1 text-xs font-semibold transition ${
										locale === "km"
											? "bg-cyan-500/15 text-cyan-700 dark:text-cyan-100"
											: "text-slate-600 dark:text-slate-300"
									}`}
								>
									ខ្មែរ
								</button>
							</div>
							<ThemeToggle />
							<Button
								asChild
								className="bg-gradient-to-r from-cyan-400 to-emerald-400 text-slate-950 hover:from-cyan-300 hover:to-emerald-300"
							>
								<Link href="/courses">{t.start}</Link>
							</Button>
						</div>
					</div>

					<nav className="mt-3 flex flex-wrap items-center gap-2 lg:hidden">
						{navItems.map((item) => (
							<Link
								key={`mobile-${item.href}`}
								href={item.href}
								className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 transition hover:border-cyan-300 hover:bg-cyan-50 dark:border-white/15 dark:bg-slate-900/80 dark:text-slate-200 dark:hover:border-cyan-300/40 dark:hover:bg-cyan-400/10"
							>
								<item.icon className="h-3.5 w-3.5" />
								{item.label[locale]}
							</Link>
						))}
					</nav>
				</header>

				<main className="mt-7 pb-10">{children}</main>

				<footer className="mt-10 rounded-2xl border border-slate-200/80 bg-white/75 px-5 py-8 shadow-sm shadow-slate-200/70 backdrop-blur-lg dark:border-white/10 dark:bg-slate-950/65 dark:shadow-black/30 md:px-7">
					<div className="grid gap-8 md:grid-cols-3">
						<div>
							<p className="text-sm uppercase tracking-[0.16em] text-cyan-700 dark:text-cyan-200">{t.mission}</p>
							<p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{t.missionBody}</p>
						</div>
						<div>
							<p className="text-sm uppercase tracking-[0.16em] text-cyan-700 dark:text-cyan-200">{t.focus}</p>
							<ul className="mt-2 space-y-1 text-sm text-slate-600 dark:text-slate-300">
								{t.areas.map((area) => (
									<li key={area}>{area}</li>
								))}
							</ul>
						</div>
						<div>
							<p className="text-sm uppercase tracking-[0.16em] text-cyan-700 dark:text-cyan-200">{t.platformTitle}</p>
							<p className="mt-2 font-[var(--font-jb-mono)] text-xs text-slate-500 dark:text-slate-400">{t.platformBody}</p>
						</div>
					</div>
				</footer>
			</div>
		</div>
	);
}
