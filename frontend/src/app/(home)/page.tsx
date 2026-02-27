"use client";

import Link from "next/link";
import { ArrowRight, ChartNoAxesCombined, Clock3, Rocket, Search, Star, Users } from "lucide-react";
import { useLocale } from "@/components/locale-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { platformStats, courses, roadmapStages } from "./_data";

const featuredCourses = courses.slice(0, 3);
const nextStages = roadmapStages.slice(0, 3);

const copy = {
	en: {
		badge: "Build your IT career with guided tracks",
		title: "Learn software engineering with a roadmap built for real product work.",
		subtitle:
			"From coding basics to secure backend systems, each lesson is mapped to practical outcomes and portfolio-ready delivery.",
		exploreCourses: "Explore Courses",
		viewRoadmap: "View Roadmap",
		topics: ["Frontend", "Backend", "DevOps", "Data"],
		searchTitle: "Search learning topics",
		searchPlaceholder: "Try: spring security, docker, react",
		metricStudy: "Average study time",
		metricUplift: "Completion uplift",
		metricMentor: "Mentor sessions",
		featured: "Featured",
		popular: "Popular courses this month",
		seeAll: "See all courses",
		lessons: "lessons",
		learners: "learners",
		rating: "rating",
		roadmapPreview: "Roadmap Preview",
		roadmapTitle: "How your learning journey is structured",
		roadmapBody:
			"Each phase is outcome-based with a specific project so you can demonstrate practical capability after every stage.",
		openRoadmap: "Open Full Roadmap",
		ctaTitle: "Ready to move from tutorials to real engineering skills?",
		ctaBody: "Talk with the team and get a personalized path based on your current level.",
		ctaButton: "Book a learning consultation",
	},
	km: {
		badge: "កសាងអាជីព IT របស់អ្នកជាមួយផ្លូវសិក្សាដែលមានណែនាំ",
		title: "រៀនវិស្វកម្មកម្មវិធីជាមួយផែនទីសិក្សា ដែលផ្អែកលើការងារផលិតផលពិតប្រាកដ។",
		subtitle:
			"ចាប់ពីមូលដ្ឋានកូដរហូតដល់ backend សុវត្ថិភាព មេរៀននីមួយៗភ្ជាប់នឹងលទ្ធផលអនុវត្ត និង portfolio ពិត។",
		exploreCourses: "មើលវគ្គសិក្សា",
		viewRoadmap: "មើលផែនទីសិក្សា",
		topics: ["Frontend", "Backend", "DevOps", "Data"],
		searchTitle: "ស្វែងរកប្រធានបទសិក្សា",
		searchPlaceholder: "ឧទាហរណ៍៖ spring security, docker, react",
		metricStudy: "ពេលវេលាសិក្សាមធ្យម",
		metricUplift: "អត្រាបញ្ចប់កើនឡើង",
		metricMentor: "វគ្គណែនាំជាមួយមេនទ័រ",
		featured: "វគ្គពេញនិយម",
		popular: "វគ្គសិក្សាពេញនិយមប្រចាំខែ",
		seeAll: "មើលវគ្គទាំងអស់",
		lessons: "មេរៀន",
		learners: "អ្នកសិក្សា",
		rating: "ពិន្ទុ",
		roadmapPreview: "មើលផែនទីសង្ខេប",
		roadmapTitle: "របៀបរៀបចំដំណើរសិក្សារបស់អ្នក",
		roadmapBody:
			"ដំណាក់កាលនីមួយៗផ្អែកលើលទ្ធផល និងមានគម្រោងជាក់លាក់ ដើម្បីបង្ហាញសមត្ថភាពអនុវត្តរបស់អ្នក។",
		openRoadmap: "បើកផែនទីពេញលេញ",
		ctaTitle: "រួចរាល់ហើយឬនៅ ដើម្បីផ្លាស់ពី tutorial ទៅជាជំនាញវិស្វករពិត?",
		ctaBody: "ពិភាក្សាជាមួយក្រុមរបស់យើង ដើម្បីទទួលបានផ្លូវសិក្សាដែលសមស្របនឹងកម្រិតរបស់អ្នក។",
		ctaButton: "កក់ពេលពិគ្រោះផែនការសិក្សា",
	},
} as const;

export default function HomePage() {
	const { locale } = useLocale();
	const t = copy[locale];

	return (
		<div className="space-y-8">
			<section className="grid gap-6 rounded-3xl border border-slate-200 bg-white/75 p-6 shadow-sm shadow-slate-200/70 backdrop-blur md:grid-cols-[1.2fr_0.8fr] md:p-9 dark:border-white/10 dark:bg-slate-900/70 dark:shadow-black/25">
				<div className="space-y-5">
					<Badge className="border-cyan-600/20 bg-cyan-500/10 text-cyan-700 dark:border-cyan-200/30 dark:bg-cyan-400/15 dark:text-cyan-100">
						{t.badge}
					</Badge>
					<h1 className="text-balance text-3xl font-bold leading-tight text-slate-900 md:text-5xl dark:text-white">
						{t.title}
					</h1>
					<p className="max-w-2xl text-slate-600 md:text-lg dark:text-slate-300">{t.subtitle}</p>
					<div className="flex flex-wrap gap-3">
						<Button asChild className="bg-gradient-to-r from-cyan-400 to-emerald-400 text-slate-950 hover:from-cyan-300 hover:to-emerald-300">
							<Link href="/courses">{t.exploreCourses}</Link>
						</Button>
						<Button asChild variant="outline" className="border-slate-300 bg-white hover:bg-slate-100 dark:border-white/20 dark:bg-white/5 dark:hover:bg-white/10">
							<Link href="/roadmap">{t.viewRoadmap}</Link>
						</Button>
					</div>
					<div className="flex flex-wrap gap-2 pt-1">
						{t.topics.map((topic) => (
							<span
								key={topic}
								className="rounded-full border border-slate-300/80 bg-white px-3 py-1 text-xs text-slate-700 dark:border-white/15 dark:bg-slate-950/60 dark:text-slate-200"
							>
								#{topic}
							</span>
						))}
					</div>
				</div>
				<div className="space-y-4 rounded-2xl border border-slate-200/90 bg-slate-50/90 p-5 backdrop-blur-lg dark:border-white/10 dark:bg-slate-950/65">
					<p className="text-sm font-medium text-slate-700 dark:text-slate-200">{t.searchTitle}</p>
					<div className="relative">
						<Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
						<Input
							placeholder={t.searchPlaceholder}
							className="border-slate-300 bg-white pl-9 dark:border-white/15 dark:bg-slate-900/70"
						/>
					</div>
					<div className="grid gap-3">
						<MiniMetric icon={Clock3} label={t.metricStudy} value="5 hrs/week" />
						<MiniMetric icon={ChartNoAxesCombined} label={t.metricUplift} value="+37%" />
						<MiniMetric icon={Users} label={t.metricMentor} value="2x/month" />
					</div>
				</div>
			</section>

			<section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
				{platformStats.map((stat) => (
					<Card key={stat.label} className="border-slate-200 bg-white/80 shadow-sm shadow-slate-200/70 dark:border-white/10 dark:bg-slate-900/70 dark:shadow-black/20">
						<CardHeader className="gap-1">
							<CardDescription className="text-slate-500 dark:text-slate-300">{stat.label}</CardDescription>
							<CardTitle className="text-3xl text-cyan-700 dark:text-cyan-100">{stat.value}</CardTitle>
						</CardHeader>
					</Card>
				))}
			</section>

			<section className="space-y-4">
				<div className="flex flex-wrap items-center justify-between gap-3">
					<div>
						<p className="text-sm uppercase tracking-[0.14em] text-cyan-700 dark:text-cyan-200">{t.featured}</p>
						<h2 className="text-2xl font-semibold">{t.popular}</h2>
					</div>
					<Button asChild variant="ghost" className="text-cyan-700 hover:bg-cyan-500/10 dark:text-cyan-100 dark:hover:bg-cyan-400/10">
						<Link href="/courses">
							{t.seeAll} <ArrowRight className="ml-2 h-4 w-4" />
						</Link>
					</Button>
				</div>
				<div className="grid gap-5 md:grid-cols-3">
					{featuredCourses.map((course) => (
						<Card
							key={course.id}
							className="border-slate-200 bg-white/85 shadow-sm shadow-slate-200/70 transition hover:-translate-y-1 hover:border-cyan-300/60 dark:border-white/10 dark:bg-slate-900/70 dark:shadow-black/20 dark:hover:border-cyan-200/30"
						>
							<CardHeader>
								<div className="mb-2 flex items-center justify-between">
									<Badge variant="secondary">{course.level}</Badge>
									<p className="text-sm text-cyan-700 dark:text-cyan-200">{course.price}</p>
								</div>
								<CardTitle>{course.title}</CardTitle>
								<CardDescription className="text-slate-600 dark:text-slate-300">{course.summary}</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="mb-4 flex items-center justify-between text-sm text-slate-600 dark:text-slate-300">
									<span>{course.duration}</span>
									<span>
										{course.lessons} {t.lessons}
									</span>
									<span>
										{course.students.toLocaleString()} {t.learners}
									</span>
								</div>
								<div className="flex items-center gap-2 text-amber-300">
									<Star className="h-4 w-4 fill-amber-300" />
									{course.rating.toFixed(1)} {t.rating}
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			</section>

			<section
				id="roadmap"
				className="scroll-mt-28 grid gap-6 rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm shadow-slate-200/70 md:grid-cols-[1fr_1fr] dark:border-white/10 dark:bg-slate-900/70 dark:shadow-black/20"
			>
				<div>
					<p className="text-sm uppercase tracking-[0.14em] text-cyan-700 dark:text-cyan-200">{t.roadmapPreview}</p>
					<h2 className="mt-2 text-2xl font-semibold">{t.roadmapTitle}</h2>
					<p className="mt-3 text-slate-600 dark:text-slate-300">{t.roadmapBody}</p>
					<Button asChild className="mt-5 bg-gradient-to-r from-cyan-400 to-emerald-400 text-slate-950 hover:from-cyan-300 hover:to-emerald-300">
						<Link href="/roadmap">{t.openRoadmap}</Link>
					</Button>
				</div>
				<div className="space-y-3">
					{nextStages.map((stage, index) => (
						<div key={stage.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-slate-950/65">
							<div className="mb-2 flex items-center gap-2">
								<div className="grid h-7 w-7 place-items-center rounded-full bg-cyan-500/20 text-cyan-700 dark:text-cyan-100">{index + 1}</div>
								<p className="font-medium">{stage.title}</p>
							</div>
							<p className="text-sm text-slate-600 dark:text-slate-300">{stage.focus}</p>
						</div>
					))}
				</div>
			</section>

			<section className="rounded-3xl border border-cyan-600/20 bg-gradient-to-r from-cyan-500/12 to-emerald-500/12 p-6 text-center md:p-8 dark:border-cyan-200/20 dark:from-cyan-400/15 dark:to-indigo-400/15">
				<div className="mx-auto max-w-2xl">
					<Rocket className="mx-auto h-8 w-8 text-cyan-700 dark:text-cyan-200" />
					<h3 className="mt-3 text-2xl font-semibold">{t.ctaTitle}</h3>
					<p className="mt-2 text-slate-600 dark:text-slate-300">{t.ctaBody}</p>
					<Button asChild className="mt-5 bg-slate-900 text-white hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-white">
						<Link href="/contact">{t.ctaButton}</Link>
					</Button>
				</div>
			</section>
		</div>
	);
}

function MiniMetric({
	icon: Icon,
	label,
	value,
}: {
	icon: React.ComponentType<{ className?: string }>;
	label: string;
	value: string;
}) {
	return (
		<div className="rounded-lg border border-slate-200 bg-white p-3 dark:border-white/10 dark:bg-slate-900/70">
			<div className="flex items-center justify-between gap-3">
				<div>
					<p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
					<p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{value}</p>
				</div>
				<Icon className="h-4 w-4 text-cyan-700 dark:text-cyan-200" />
			</div>
		</div>
	);
}
