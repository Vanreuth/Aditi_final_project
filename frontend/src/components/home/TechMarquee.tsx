import { techMarquee } from "@/components/constants/home-data";

export function TechMarquee() {
  // Duplicate for seamless infinite scroll
  const items = [...techMarquee, ...techMarquee];

  return (
    <section className="overflow-hidden border-y border-slate-100 bg-slate-50/80 py-5 dark:border-white/8 dark:bg-slate-950/50">
      <div className="flex w-max animate-marquee gap-6">
        {items.map((t, i) => (
          <div
            key={`${t.name}-${i}`}
            className="flex shrink-0 items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 shadow-sm dark:border-white/10 dark:bg-slate-900/80"
          >
            <span className="text-lg leading-none">{t.icon}</span>
            <span className="whitespace-nowrap text-xs font-semibold text-slate-600 dark:text-slate-300">
              {t.name}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}