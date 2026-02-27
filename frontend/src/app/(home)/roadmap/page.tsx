import { CheckCircle2, Goal, TimerReset } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { roadmapStages } from "../_data";

export default function RoadmapPage() {
	return (
		<div className="space-y-8">
			<section className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm shadow-slate-200/70 md:p-9 dark:border-white/10 dark:bg-slate-900/70 dark:shadow-black/20">
				<p className="text-sm uppercase tracking-[0.14em] text-cyan-700 dark:text-cyan-200">Learning Roadmap</p>
				<h1 className="mt-2 text-3xl font-bold md:text-5xl">A step-by-step plan from fundamentals to production-ready delivery.</h1>
				<p className="mt-3 max-w-3xl text-slate-600 md:text-lg dark:text-slate-300">
					The roadmap removes guesswork by giving you a clear sequence, expected outcomes, and project milestones for every phase.
				</p>
			</section>

			<section className="grid gap-4 md:grid-cols-3">
				<QuickStat icon={Goal} label="Outcome Driven" value="1 portfolio project per phase" />
				<QuickStat icon={TimerReset} label="Study Rhythm" value="5 to 7 focused hours each week" />
				<QuickStat icon={CheckCircle2} label="Review Cadence" value="Weekly checkpoints and mentor feedback" />
			</section>

			<section className="space-y-5">
				{roadmapStages.map((stage, index) => (
					<Card key={stage.id} className="border-slate-200 bg-white/85 shadow-sm shadow-slate-200/70 dark:border-white/10 dark:bg-slate-900/70 dark:shadow-black/20">
						<CardHeader>
							<div className="mb-3 flex flex-wrap items-center justify-between gap-3">
								<div className="flex items-center gap-3">
									<div className="grid h-9 w-9 place-items-center rounded-full bg-cyan-500/15 text-cyan-700 dark:text-cyan-100">{index + 1}</div>
									<CardTitle>{stage.title}</CardTitle>
								</div>
								<Badge variant="outline" className="border-cyan-700/25 bg-cyan-500/10 text-cyan-700 dark:border-cyan-200/30 dark:bg-cyan-400/10 dark:text-cyan-100">
									{stage.window}
								</Badge>
							</div>
							<CardDescription className="text-slate-600 dark:text-slate-300">{stage.focus}</CardDescription>
						</CardHeader>
						<CardContent className="grid gap-5 md:grid-cols-[1.1fr_0.9fr]">
							<div>
								<p className="mb-2 text-sm font-semibold text-slate-900 dark:text-slate-100">Expected outcomes</p>
								<ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
									{stage.outcomes.map((outcome) => (
										<li key={outcome} className="flex gap-2">
											<span className="mt-1 h-2 w-2 rounded-full bg-cyan-500 dark:bg-cyan-300" />
											<span>{outcome}</span>
										</li>
									))}
								</ul>
							</div>
							<div className="rounded-xl border border-cyan-700/20 bg-cyan-500/10 p-4 dark:border-cyan-200/25 dark:bg-cyan-400/10">
								<p className="text-xs uppercase tracking-[0.12em] text-cyan-700 dark:text-cyan-200">Milestone Project</p>
								<p className="mt-2 font-medium text-slate-900 dark:text-slate-100">{stage.project}</p>
							</div>
						</CardContent>
					</Card>
				))}
			</section>
		</div>
	);
}

function QuickStat({
	icon: Icon,
	label,
	value,
}: {
	icon: React.ComponentType<{ className?: string }>;
	label: string;
	value: string;
}) {
	return (
		<Card className="border-slate-200 bg-white/85 shadow-sm shadow-slate-200/70 dark:border-white/10 dark:bg-slate-900/70 dark:shadow-black/20">
			<CardHeader>
				<div className="mb-2 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-500/15 text-cyan-700 dark:text-cyan-100">
					<Icon className="h-4 w-4" />
				</div>
				<CardDescription className="text-slate-600 dark:text-slate-300">{label}</CardDescription>
				<CardTitle className="text-lg">{value}</CardTitle>
			</CardHeader>
		</Card>
	);
}
