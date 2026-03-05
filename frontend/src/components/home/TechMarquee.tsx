import { techMarquee } from "@/components/constants/home-data";

export function TechMarquee() {
  // Duplicate for seamless infinite scroll
  const items = [...techMarquee, ...techMarquee];

  return (
    <section className="overflow-hidden border-y border-border bg-muted/50 py-5">
      <div className="flex w-max animate-marquee gap-6">
        {items.map((t, i) => (
          <div
            key={`${t.name}-${i}`}
            className="flex shrink-0 items-center gap-2 rounded-full border border-border bg-card px-4 py-2 shadow-sm"
          >
            <span className="text-lg leading-none">{t.icon}</span>
              <span className="whitespace-nowrap text-xs font-semibold text-muted-foreground">
              {t.name}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}