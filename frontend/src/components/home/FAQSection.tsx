import { Layers3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { faqs } from "@/components/constants/home-data";

export function FAQSection() {
  return (
    <section className="border-y border-border bg-muted/30 py-20">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <Badge className="mb-3 border-emerald-200/60 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
            <Layers3 className="mr-1.5 h-3 w-3" />
            FAQ
          </Badge>
          <h2 className="text-3xl font-bold text-foreground md:text-4xl">
            សំណួរ{" "}
            <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              ញឹកញាប់
            </span>
          </h2>
        </div>

        <div className="mx-auto max-w-3xl divide-y divide-border">
          {faqs.map((faq, i) => (
            <details
              key={i}
              className="group py-5 [&_summary::-webkit-details-marker]:hidden"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
                <span className="font-semibold text-foreground">{faq.q}</span>
                <span className="ml-4 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border text-muted-foreground transition-transform duration-200 group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {faq.a}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}