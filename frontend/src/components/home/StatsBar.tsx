import { stats } from "@/components/constants/home-data";

export function StatsBar() {
  return (
    <section className="border-y border-border/80 bg-card/70 backdrop-blur-sm">
      <div
        className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 grid grid-cols-2 divide-x divide-y divide-border/80 lg:grid-cols-4 lg:divide-y-0"
      >
        {stats.map((s) => (
          <div
            key={s.label}
            className="flex flex-col items-center gap-1 py-9 text-center"
          >
            <span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-3xl font-extrabold text-transparent md:text-4xl">
              {s.value}
            </span>
            <span className="text-sm font-semibold text-foreground">
              {s.label}
            </span>
            <span className="text-xs text-muted-foreground">{s.sub}</span>
          </div>
        ))}
      </div>
    </section>
  );
}