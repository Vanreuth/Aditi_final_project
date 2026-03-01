"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, BookOpen, Loader2, Star, Users, Zap } from "lucide-react";
import { useLocale } from "@/components/locale-provider";
import { Button } from "@/components/ui/button";
import { type CourseDto, fetchCourses } from "@/lib/api";
import { platformStats, courses as staticCourses, roadmapStages } from "./_data";

const nextStages = roadmapStages.slice(0, 3);

// Map course title keywords to gradient + icon
function getCourseVisual(title: string): { bg: string; icon: string } {
	const t = title.toLowerCase();
	if (t.includes("html")) return { bg: "bg-gradient-to-br from-orange-500 via-red-400 to-pink-500", icon: "🌐" };
	if (t.includes("css")) return { bg: "bg-gradient-to-br from-blue-500 via-cyan-400 to-teal-400", icon: "🎨" };
	if (t.includes("javascript") || t.includes("js")) return { bg: "bg-gradient-to-br from-yellow-400 via-amber-400 to-orange-400", icon: "⚡" };
	if (t.includes("next")) return { bg: "bg-gradient-to-br from-slate-700 via-slate-600 to-slate-500", icon: "▲" };
	if (t.includes("react")) return { bg: "bg-gradient-to-br from-sky-500 via-blue-400 to-indigo-500", icon: "⚛️" };
	if (t.includes("spring") || t.includes("java")) return { bg: "bg-gradient-to-br from-green-500 via-emerald-400 to-teal-500", icon: "🍃" };
	if (t.includes("docker") || t.includes("devops")) return { bg: "bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-500", icon: "🐳" };
	return { bg: "bg-gradient-to-br from-violet-500 via-purple-400 to-indigo-500", icon: "📚" };
}

const copy = {
	en: {
		badge: "🚀 Start your IT career journey today",
		title: "Learn Software Engineering",
		titleHighlight: "with ADUTI Learning",
		subtitle: "Free Khmer-language courses: HTML, CSS, JavaScript, React, Next.js, Spring Boot, Docker and more.",
		exploreCourses: "Explore Courses",
		viewRoadmap: "View Roadmap",
		topics: ["HTML", "CSS", "JavaScript", "React", "Next.js", "Spring Boot", "Docker"],
		featured: "Featured",
		popular: "Free Courses in Khmer",
		seeAll: "See all courses",
		roadmapPreview: "Learning Roadmap",
		roadmapTitle: "How your learning journey is structured",
		roadmapBody: "Each phase is outcome-based with a specific project so you can demonstrate practical capability after every stage.",
		openRoadmap: "Open Full Roadmap",
		ctaTitle: "Ready to start learning for free?",
		ctaBody: "All courses are free and in Khmer language. Start today.",
		ctaButton: "Start Learning Now",
		free: "FREE",
		lessons: "lessons",
		learners: "learners",
	},
	km: {
		badge: "🚀 ចាប់ផ្តើមដំណើរអាជីព IT របស់អ្នកថ្ងៃនេះ",
		title: "រៀនវិស្វកម្មកម្មវិធី",
		titleHighlight: "ជាមួយ ADUTI Learning",
		subtitle: "វគ្គសិក្សាឥតគិតថ្លៃ ជាភាសាខ្មែរ: HTML, CSS, JavaScript, React, Next.js, Spring Boot, Docker និងច្រើនទៀត",
		exploreCourses: "មើលវគ្គសិក្សា",
		viewRoadmap: "មើលផែនទីសិក្សា",
		topics: ["HTML", "CSS", "JavaScript", "React", "Next.js", "Spring Boot", "Docker"],
		featured: "ពេញនិយម",
		popular: "វគ្គសិក្សាឥតគិតថ្លៃ ជាភាសាខ្មែរ",
		seeAll: "មើលវគ្គទាំងអស់",
		roadmapPreview: "ផែនទីសិក្សា",
		roadmapTitle: "របៀបរៀបចំដំណើរសិក្សារបស់អ្នក",
		roadmapBody: "ដំណាក់កាលនីមួយៗផ្អែកលើលទ្ធផល និងមានគម្រោងជាក់លាក់",
		openRoadmap: "បើកផែនទីពេញលេញ",
		ctaTitle: "រួចរាល់ហើយឬនៅ ដើម្បីចាប់ផ្តើមរៀនឥតគិតថ្លៃ?",
		ctaBody: "វគ្គសិក្សាទាំងអស់ ឥតគិតថ្លៃ ជាភាសាខ្មែរ ចាប់ផ្តើមថ្ងៃនេះ",
		ctaButton: "ចាប់ផ្តើមរៀន",
		free: "ឥតគិតថ្លៃ",
		lessons: "មេរៀន",
		learners: "អ្នកសិក្សា",
	},
} as const;

export default function HomePage() {
	const { locale } = useLocale();
	const t = copy[locale];

	const [apiCourses, setApiCourses] = useState<CourseDto[] | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		fetchCourses(0, 6)
			.then((page) => setApiCourses(page.content))
			.catch(() => setApiCourses(null))
			.finally(() => setLoading(false));
	}, []);

	// Use API courses if available, else fallback to static
	const featuredCourses: CourseDto[] = apiCourses && apiCourses.length > 0
		? apiCourses.slice(0, 6)
		: staticCourses.slice(0, 6).map((c) => ({
			id: c.id,
			title: c.title,
			slug: c.slug,
			description: c.summary,
			thumbnail: null,
			price: 0,
			level: c.level.toUpperCase(),
			language: "Khmer",
			status: "PUBLISHED",
			isFeatured: true,
			totalLessons: c.lessons,
			enrolledCount: c.students,
			avgRating: c.rating,
			createdAt: new Date().toISOString(),
			updatedAt: null,
			publishedAt: null,
			instructorId: 1,
			instructorName: "Admin",
			categoryId: 1,
			categoryName: c.category,
		} as CourseDto));

	return (
		<div className="space-y-12">
			{/* ── Hero ── */}
			<section className="relative overflow-hidden rounded-3xl border border-white/60 bg-white/60 px-6 py-12 text-center shadow-xl shadow-violet-200/30 backdrop-blur-sm dark:border-white/10 dark:bg-slate-900/50 dark:shadow-black/30 md:px-12 md:py-16">
				<div className="pointer-events-none absolute -top-16 -left-16 h-48 w-48 rounded-full bg-violet-300/30 blur-2xl dark:bg-violet-700/20" />
				<div className="pointer-events-none absolute -bottom-12 -right-12 h-40 w-40 rounded-full bg-indigo-300/30 blur-2xl dark:bg-indigo-700/20" />

				<div className="relative">
					<span className="inline-block rounded-full border border-violet-200 bg-violet-100 px-4 py-1.5 text-sm font-medium text-violet-700 dark:border-violet-700/40 dark:bg-violet-900/40 dark:text-violet-300">
						{t.badge}
					</span>

					<h1 className="mt-5 text-4xl font-extrabold leading-tight tracking-tight text-slate-900 dark:text-white md:text-6xl">
						{t.title}
						<br />
						<span className="bg-gradient-to-r from-violet-600 via-purple-500 to-indigo-600 bg-clip-text text-transparent dark:from-violet-400 dark:via-purple-300 dark:to-indigo-400">
							{t.titleHighlight}
						</span>
					</h1>

					<p className="mx-auto mt-5 max-w-2xl text-slate-600 dark:text-slate-300 md:text-lg">
						{t.subtitle}
					</p>

					<div className="mt-7 flex flex-wrap items-center justify-center gap-3">
						<Button
							asChild
							size="lg"
							className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-400/30 hover:from-violet-500 hover:to-indigo-500"
						>
							<Link href="/courses">
								{t.exploreCourses} <ArrowRight className="ml-2 h-4 w-4" />
							</Link>
						</Button>
						<Button
							asChild
							size="lg"
							variant="outline"
							className="border-violet-300 bg-white/80 text-violet-700 hover:bg-violet-50 dark:border-violet-700/40 dark:bg-white/5 dark:text-violet-300 dark:hover:bg-violet-900/30"
						>
							<Link href="/roadmap">{t.viewRoadmap}</Link>
						</Button>
					</div>

					<div className="mt-6 flex flex-wrap items-center justify-center gap-2">
						{t.topics.map((topic) => (
							<span
								key={topic}
								className="rounded-full border border-violet-200/80 bg-violet-50 px-3 py-1 text-xs font-medium text-violet-700 dark:border-violet-700/30 dark:bg-violet-900/30 dark:text-violet-300"
							>
								#{topic}
							</span>
						))}
					</div>
				</div>
			</section>

			{/* ── Stats ── */}
			<section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
				{platformStats.map((stat) => (
					<div
						key={stat.label}
						className="flex items-center gap-4 rounded-2xl border border-white/60 bg-white/70 px-5 py-4 shadow-sm shadow-violet-100/50 backdrop-blur-sm dark:border-white/10 dark:bg-slate-900/50 dark:shadow-black/20"
					>
						<span className="text-3xl">{stat.icon}</span>
						<div>
							<p className="text-2xl font-bold text-violet-700 dark:text-violet-300">{stat.value}</p>
							<p className="text-xs text-slate-500 dark:text-slate-400">{stat.label}</p>
						</div>
					</div>
				))}
			</section>

			{/* ── Featured Courses ── */}
			<section className="space-y-5">
				<div className="flex flex-wrap items-center justify-between gap-3">
					<div>
						<p className="text-xs font-semibold uppercase tracking-widest text-violet-600 dark:text-violet-400">
							{t.featured}
						</p>
						<h2 className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{t.popular}</h2>
					</div>
					<Button
						asChild
						variant="ghost"
						className="text-violet-600 hover:bg-violet-100 hover:text-violet-700 dark:text-violet-400 dark:hover:bg-violet-900/30"
					>
						<Link href="/courses">
							{t.seeAll} <ArrowRight className="ml-1.5 h-4 w-4" />
						</Link>
					</Button>
				</div>

				{loading ? (
					<div className="flex items-center justify-center py-16">
						<Loader2 className="h-7 w-7 animate-spin text-violet-500" />
					</div>
				) : (
					<div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
						{featuredCourses.map((course) => {
							const { bg, icon } = getCourseVisual(course.title);
							const isFree = !course.price || course.price === 0;
							return (
								<Link
									key={course.id}
									href={`/courses/${course.slug}`}
									className="group overflow-hidden rounded-2xl border border-white/60 bg-white/80 shadow-md shadow-violet-100/40 transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-violet-200/50 dark:border-white/10 dark:bg-slate-900/60 dark:shadow-black/20 dark:hover:shadow-violet-900/30"
								>
									{/* Thumbnail */}
									<div className={`relative h-40 ${bg} flex items-center justify-center`}>
										{course.thumbnail ? (
											// eslint-disable-next-line @next/next/no-img-element
											<img src={course.thumbnail} alt={course.title} className="h-full w-full object-cover" />
										) : (
											<span className="text-6xl drop-shadow-lg">{icon}</span>
										)}
										{isFree && (
											<span className="absolute top-3 right-3 rounded-full bg-green-500 px-2.5 py-0.5 text-xs font-bold text-white shadow">
												FREE
											</span>
										)}
										<span className="absolute bottom-3 left-3 rounded-full bg-black/30 px-2.5 py-0.5 text-xs font-medium text-white backdrop-blur-sm">
											{course.categoryName}
										</span>
									</div>

									{/* Content */}
									<div className="p-4">
										<div className="mb-2 flex items-center justify-between">
											<span className="rounded-full bg-violet-100 px-2.5 py-0.5 text-xs font-semibold text-violet-700 dark:bg-violet-900/40 dark:text-violet-300">
												{course.level === "BEGINNER" ? "ចាប់ផ្តើម" : course.level === "INTERMEDIATE" ? "មធ្យម" : course.level}
											</span>
											<p className="text-sm font-semibold text-violet-700 dark:text-violet-300">
												{isFree ? (locale === "km" ? "ឥតគិតថ្លៃ" : "Free") : `$${course.price}`}
											</p>
										</div>
										<h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">{course.title}</h3>
										<p className="mt-1 text-sm text-slate-600 dark:text-slate-400 line-clamp-2">{course.description}</p>
										<div className="mt-3 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
											<span className="flex items-center gap-1">
												<BookOpen className="h-3.5 w-3.5" />
												{course.totalLessons || 0} {t.lessons}
											</span>
											<span className="flex items-center gap-1">
												<Users className="h-3.5 w-3.5" />
												{(course.enrolledCount || 0).toLocaleString()}
											</span>
											{(course.avgRating || 0) > 0 && (
												<span className="flex items-center gap-1 text-amber-500">
													<Star className="h-3.5 w-3.5 fill-amber-400" />
													{course.avgRating.toFixed(1)}
												</span>
											)}
										</div>
									</div>
								</Link>
							);
						})}
					</div>
				)}
			</section>

			{/* ── Roadmap Preview ── */}
			<section className="grid gap-6 rounded-3xl border border-white/60 bg-white/60 p-6 shadow-lg shadow-violet-100/40 backdrop-blur-sm dark:border-white/10 dark:bg-slate-900/50 dark:shadow-black/20 md:grid-cols-2 md:p-8">
				<div>
					<p className="text-xs font-semibold uppercase tracking-widest text-violet-600 dark:text-violet-400">
						{t.roadmapPreview}
					</p>
					<h2 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">{t.roadmapTitle}</h2>
					<p className="mt-3 text-slate-600 dark:text-slate-400">{t.roadmapBody}</p>
					<Button
						asChild
						className="mt-6 bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-400/30 hover:from-violet-500 hover:to-indigo-500"
					>
						<Link href="/roadmap">{t.openRoadmap}</Link>
					</Button>
				</div>
				<div className="space-y-3">
					{nextStages.map((stage, index) => (
						<div
							key={stage.id}
							className="rounded-xl border border-violet-100 bg-violet-50/80 p-4 dark:border-violet-800/30 dark:bg-violet-900/20"
						>
							<div className="mb-1.5 flex items-center gap-2.5">
								<div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 text-xs font-bold text-white shadow-sm">
									{index + 1}
								</div>
								<p className="font-semibold text-slate-900 dark:text-white">{stage.title}</p>
							</div>
							<p className="ml-9 text-sm text-slate-600 dark:text-slate-400">{stage.focus}</p>
						</div>
					))}
				</div>
			</section>

			{/* ── CTA ── */}
			<section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 p-8 text-center text-white shadow-xl shadow-violet-400/30 md:p-12">
				<div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.15),_transparent_60%)]" />
				<div className="relative">
					<Zap className="mx-auto h-10 w-10 text-yellow-300 drop-shadow" />
					<h3 className="mt-3 text-2xl font-bold md:text-3xl">{t.ctaTitle}</h3>
					<p className="mt-2 text-violet-200">{t.ctaBody}</p>
					<Button
						asChild
						size="lg"
						className="mt-6 bg-white text-violet-700 shadow-lg hover:bg-violet-50"
					>
						<Link href="/courses">{t.ctaButton}</Link>
					</Button>
				</div>
			</section>
		</div>
	);
}
