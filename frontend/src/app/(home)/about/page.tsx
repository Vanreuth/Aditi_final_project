import { Handshake, Layers3, ShieldCheck, Target } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { platformStats, teamHighlights } from "../_data";

const values = [
	{
		title: "Project-first learning",
		description:
			"Every module ends with a practical output you can add to your portfolio.",
		icon: Layers3,
	},
	{
		title: "Engineering discipline",
		description:
			"We emphasize architecture decisions, testing habits, and production-level thinking.",
		icon: ShieldCheck,
	},
	{
		title: "Career alignment",
		description:
			"Curriculum design maps to common software engineering role expectations.",
		icon: Target,
	},
	{
		title: "Mentor partnership",
		description:
			"Learners receive direction and feedback loops from active practitioners.",
		icon: Handshake,
	},
];

export default function AboutPage() {
	return (
		<div className="space-y-8">
			<section className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm shadow-slate-200/70 md:p-9 dark:border-white/10 dark:bg-slate-900/70 dark:shadow-black/20">
				<Badge className="border-cyan-700/25 bg-cyan-500/10 text-cyan-700 dark:border-cyan-200/30 dark:bg-cyan-400/15 dark:text-cyan-100">
					About the Platform
				</Badge>
				<h1 className="mt-3 text-3xl font-bold md:text-5xl">We help learners become reliable software engineers, not just tutorial followers.</h1>
				<p className="mt-3 max-w-3xl text-slate-600 md:text-lg dark:text-slate-300">
					ADUTI Learning is designed to bridge the gap between classroom-style learning and real development work by combining guided courses, roadmap sequencing, and continuous project execution.
				</p>
			</section>

			<section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
				{platformStats.map((stat) => (
					<Card key={stat.label} className="border-slate-200 bg-white/85 shadow-sm shadow-slate-200/70 dark:border-white/10 dark:bg-slate-900/70 dark:shadow-black/20">
						<CardHeader className="gap-1">
							<CardDescription className="text-slate-500 dark:text-slate-300">{stat.label}</CardDescription>
							<CardTitle className="text-2xl text-cyan-700 dark:text-cyan-100">{stat.value}</CardTitle>
						</CardHeader>
					</Card>
				))}
			</section>

			<section className="grid gap-5 md:grid-cols-2">
				{values.map((value) => (
					<Card key={value.title} className="border-slate-200 bg-white/85 shadow-sm shadow-slate-200/70 dark:border-white/10 dark:bg-slate-900/70 dark:shadow-black/20">
						<CardHeader>
							<div className="mb-2 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-500/15 text-cyan-700 dark:text-cyan-100">
								<value.icon className="h-4 w-4" />
							</div>
							<CardTitle>{value.title}</CardTitle>
							<CardDescription className="text-slate-600 dark:text-slate-300">{value.description}</CardDescription>
						</CardHeader>
					</Card>
				))}
			</section>

			<section className="space-y-4">
				<div>
					<p className="text-sm uppercase tracking-[0.14em] text-cyan-700 dark:text-cyan-200">Mentor Team</p>
					<h2 className="mt-2 text-2xl font-semibold">People guiding your learning journey</h2>
				</div>
				<div className="grid gap-5 md:grid-cols-3">
					{teamHighlights.map((member) => (
						<Card key={member.name} className="border-slate-200 bg-white/85 shadow-sm shadow-slate-200/70 dark:border-white/10 dark:bg-slate-900/70 dark:shadow-black/20">
							<CardHeader>
								<CardTitle>{member.name}</CardTitle>
								<CardDescription className="text-cyan-700 dark:text-cyan-200">{member.role}</CardDescription>
							</CardHeader>
							<CardContent>
								<p className="text-sm text-slate-600 dark:text-slate-300">{member.summary}</p>
							</CardContent>
						</Card>
					))}
				</div>
			</section>
		</div>
	);
}
