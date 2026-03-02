import Link from "next/link";
import { ArrowRight, Milestone } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { roadmapPaths } from "@/components/constants/home-data";

export function RoadmapSection() {
  return (
    <section className="bg-gradient-to-br from-slate-50 via-blue-50/30 to-violet-50/30 py-20 dark:from-slate-950 dark:via-blue-950/10 dark:to-violet-950/10">
      <div className="container-app">
        <div className="mb-12 text-center">
          <Badge className="mb-3 border-violet-200/60 bg-violet-50 text-violet-700 dark:border-violet-500/30 dark:bg-violet-500/10 dark:text-violet-300">
            <Milestone className="mr-1.5 h-3 w-3" />
            ផ្លូវវិជ្ជាជីវៈ
          </Badge>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white md:text-4xl">
            ជ្រើស{" "}
            <span className="bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">
              Career Path
            </span>{" "}
            ណា?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-slate-500 dark:text-slate-400">
            យើងបង្កើត roadmap ជាជំហានច្បាស់ ដើម្បីជួយអ្នកក្លាយជា developer ក្នុង 6–12 ខែ
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {roadmapPaths.map((path, pi) => (
            <RoadmapCard key={path.title} path={path} index={pi} />
          ))}
        </div>
      </div>
    </section>
  );
}

type RoadmapPath = (typeof roadmapPaths)[number];

function RoadmapCard({ path, index }: { path: RoadmapPath; index: number }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-all duration-300 hover:shadow-lg dark:border-white/10 dark:bg-slate-900/70">
      <div className={`bg-gradient-to-r ${path.color} p-5 text-white`}>
        <p className="text-xs font-medium uppercase tracking-widest opacity-75">
          ផ្លូវ {index + 1}
        </p>
        <h3 className="mt-1 text-lg font-bold">{path.title}</h3>
      </div>

      <ul className="divide-y divide-slate-100 dark:divide-white/8">
        {path.steps.map((step, si) => (
          <li key={step} className="flex items-center gap-3 px-5 py-3.5">
            <span
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${path.color} text-xs font-bold text-white`}
            >
              {si + 1}
            </span>
            <span className="text-sm text-slate-700 dark:text-slate-300">{step}</span>
          </li>
        ))}
      </ul>

      <div className="border-t border-slate-100 p-4 dark:border-white/8">
        <Link
          href="/roadmap"
          className={`inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r ${path.color} py-2.5 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90`}
        >
          ចាប់ផ្តើម Path នេះ
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}