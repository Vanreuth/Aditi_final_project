"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { courseCategories, courses } from "../_data";

const levelOrder = { Beginner: 1, Intermediate: 2, Advanced: 3 } as const;
const levels = ["All", "Beginner", "Intermediate", "Advanced"] as const;
const categories = ["All", ...courseCategories] as const;

type LevelFilter = (typeof levels)[number];
type CategoryFilter = (typeof categories)[number];

export default function CoursesPage() {
	const [query, setQuery] = useState("");
	const [level, setLevel] = useState<LevelFilter>("All");
	const [category, setCategory] = useState<CategoryFilter>("All");

	const sortedCourses = useMemo(
		() => [...courses].sort((a, b) => levelOrder[a.level] - levelOrder[b.level]),
		[]
	);

	const filteredCourses = useMemo(() => {
		const keyword = query.trim().toLowerCase();
		return sortedCourses.filter((course) => {
			const matchesLevel = level === "All" || course.level === level;
			const matchesCategory = category === "All" || course.category === category;
			const matchesQuery =
				keyword.length === 0 ||
				course.title.toLowerCase().includes(keyword) ||
				course.summary.toLowerCase().includes(keyword) ||
				course.skills.some((skill) => skill.toLowerCase().includes(keyword));
			return matchesLevel && matchesCategory && matchesQuery;
		});
	}, [category, level, query, sortedCourses]);

	const clearFilters = () => {
		setQuery("");
		setLevel("All");
		setCategory("All");
	};

	return (
		<div className="space-y-8">
			<section className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm shadow-slate-200/70 md:p-9 dark:border-white/10 dark:bg-slate-900/70 dark:shadow-black/25">
				<p className="text-sm uppercase tracking-[0.14em] text-cyan-700 dark:text-cyan-200">Course Catalog</p>
				<h1 className="mt-2 text-3xl font-bold md:text-5xl">Practical tracks for frontend, backend, and cloud.</h1>
				<p className="mt-3 max-w-3xl text-slate-600 md:text-lg dark:text-slate-300">
					Courses are structured for progressive growth. Filter by level and category to find the fastest path for your current skill stage.
				</p>
				<div className="mt-5 flex flex-wrap gap-2">
					{courseCategories.map((item) => (
						<Badge
							key={item}
							variant="outline"
							className="border-cyan-700/25 bg-cyan-500/10 text-cyan-700 dark:border-cyan-200/30 dark:bg-cyan-400/10 dark:text-cyan-100"
						>
							{item}
						</Badge>
					))}
				</div>
			</section>

			<section className="space-y-4 rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm shadow-slate-200/70 dark:border-white/10 dark:bg-slate-900/65 dark:shadow-black/25 md:p-5">
				<div className="grid gap-3 md:grid-cols-[1fr_auto]">
					<div className="relative">
						<Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
						<Input
							placeholder="Search by title, summary, or skill"
							value={query}
							onChange={(event) => setQuery(event.target.value)}
							className="border-slate-300 bg-white pl-9 dark:border-white/15 dark:bg-slate-900/70"
						/>
					</div>
					<Button
						variant="outline"
						className="border-slate-300 bg-white hover:bg-slate-100 dark:border-white/20 dark:bg-white/5 dark:hover:bg-white/10"
						onClick={clearFilters}
					>
						Clear filters
					</Button>
				</div>

				<div className="space-y-3">
					<div className="flex flex-wrap gap-2">
						{levels.map((item) => (
							<button
								key={item}
								type="button"
								onClick={() => setLevel(item)}
								className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
									level === item
										? "border-cyan-500 bg-cyan-500/15 text-cyan-700 dark:border-cyan-300 dark:text-cyan-100"
										: "border-slate-300 bg-white text-slate-700 hover:border-cyan-300 hover:bg-cyan-50 dark:border-white/20 dark:bg-slate-900/80 dark:text-slate-200 dark:hover:border-cyan-300/40 dark:hover:bg-cyan-400/10"
								}`}
							>
								{item}
							</button>
						))}
					</div>
					<div className="flex flex-wrap gap-2">
						{categories.map((item) => (
							<button
								key={item}
								type="button"
								onClick={() => setCategory(item)}
								className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
									category === item
										? "border-emerald-500 bg-emerald-500/15 text-emerald-700 dark:border-emerald-300 dark:text-emerald-100"
										: "border-slate-300 bg-white text-slate-700 hover:border-emerald-300 hover:bg-emerald-50 dark:border-white/20 dark:bg-slate-900/80 dark:text-slate-200 dark:hover:border-emerald-300/40 dark:hover:bg-emerald-400/10"
								}`}
							>
								{item}
							</button>
						))}
					</div>
				</div>
				<p className="text-sm text-slate-500 dark:text-slate-300">
					Showing {filteredCourses.length} of {courses.length} courses
				</p>
			</section>

			<section className="grid gap-6 xl:grid-cols-[1.6fr_0.8fr]">
				<div className="grid gap-5 md:grid-cols-2">
					{filteredCourses.length > 0 ? (
						filteredCourses.map((course) => (
							<Card
								key={course.id}
								className="border-slate-200 bg-white/85 shadow-sm shadow-slate-200/70 transition hover:-translate-y-1 hover:border-cyan-300/60 dark:border-white/10 dark:bg-slate-900/70 dark:shadow-black/20 dark:hover:border-cyan-200/30"
							>
								<CardHeader>
									<div className="mb-2 flex items-center justify-between gap-3">
										<Badge variant="secondary">{course.level}</Badge>
										<Badge variant="outline" className="border-slate-300 text-slate-700 dark:border-white/20 dark:text-slate-300">
											{course.category}
										</Badge>
									</div>
									<CardTitle>{course.title}</CardTitle>
									<CardDescription className="text-slate-600 dark:text-slate-300">{course.summary}</CardDescription>
								</CardHeader>
								<CardContent>
									<div className="grid grid-cols-2 gap-2 text-sm text-slate-600 dark:text-slate-300">
										<p>Duration: {course.duration}</p>
										<p>Lessons: {course.lessons}</p>
										<p>Learners: {course.students.toLocaleString()}</p>
										<p>Rating: {course.rating.toFixed(1)}</p>
									</div>
									<Separator className="my-4 bg-slate-200 dark:bg-white/10" />
									<div className="mb-4 flex flex-wrap gap-2">
										{course.skills.map((skill) => (
											<Badge
												key={skill}
												variant="outline"
												className="border-cyan-700/25 bg-cyan-500/10 text-cyan-700 dark:border-cyan-200/25 dark:bg-cyan-400/10 dark:text-cyan-100"
											>
												{skill}
											</Badge>
										))}
									</div>
									<div className="flex items-center justify-between">
										<p className="text-lg font-semibold text-cyan-700 dark:text-cyan-100">{course.price}</p>
										<Button className="bg-gradient-to-r from-cyan-400 to-emerald-400 text-slate-950 hover:from-cyan-300 hover:to-emerald-300">
											Enroll now
										</Button>
									</div>
								</CardContent>
							</Card>
						))
					) : (
						<Card className="border-dashed border-slate-300 bg-white/80 md:col-span-2 dark:border-white/15 dark:bg-slate-900/60">
							<CardHeader>
								<CardTitle>No courses match your filters</CardTitle>
								<CardDescription className="text-slate-600 dark:text-slate-300">
									Try removing some filters or search with a broader keyword.
								</CardDescription>
							</CardHeader>
							<CardContent>
								<Button
									variant="outline"
									className="border-slate-300 bg-white hover:bg-slate-100 dark:border-white/20 dark:bg-white/5 dark:hover:bg-white/10"
									onClick={clearFilters}
								>
									Reset filters
								</Button>
							</CardContent>
						</Card>
					)}
				</div>

				<aside className="space-y-5">
					<Card className="border-slate-200 bg-white/80 shadow-sm shadow-slate-200/70 dark:border-white/10 dark:bg-slate-900/70 dark:shadow-black/20">
						<CardHeader>
							<CardTitle>How to choose your first course</CardTitle>
							<CardDescription className="text-slate-600 dark:text-slate-300">
								A simple way to avoid jumping between random tutorials.
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4 text-sm text-slate-600 dark:text-slate-300">
							<div>
								<p className="font-medium text-slate-900 dark:text-slate-100">1. Match your current level</p>
								<p>Start with Beginner if you cannot build a complete mini-project alone.</p>
							</div>
							<div>
								<p className="font-medium text-slate-900 dark:text-slate-100">2. Pick one target track</p>
								<p>Commit to one category for at least 4 weeks before switching focus.</p>
							</div>
							<div>
								<p className="font-medium text-slate-900 dark:text-slate-100">3. Build while learning</p>
								<p>Every week should end with an artifact in your portfolio repository.</p>
							</div>
						</CardContent>
					</Card>

					<Card className="border-cyan-700/20 bg-gradient-to-br from-cyan-500/12 to-emerald-500/12 dark:border-cyan-200/20 dark:from-cyan-400/15 dark:to-indigo-400/15">
						<CardHeader>
							<CardTitle>Need guidance?</CardTitle>
							<CardDescription className="text-slate-700 dark:text-slate-200">
								Get a personalized course sequence based on your goal.
							</CardDescription>
						</CardHeader>
						<CardContent>
							<Button
								asChild
								className="w-full bg-slate-900 text-white hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-white"
							>
								<Link href="/contact">Talk to an advisor</Link>
							</Button>
						</CardContent>
					</Card>
				</aside>
			</section>
		</div>
	);
}
