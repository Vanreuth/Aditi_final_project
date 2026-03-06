import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { levelOptions, levelLabels, type LevelOption } from "./PdfCourseCard";

interface PdfFilterBarProps {
  query: string;
  onQueryChange: (v: string) => void;
  selectedLevel: LevelOption;
  onLevelChange: (v: LevelOption) => void;
  totalCount: number;
}

export function PdfFilterBar({
  query,
  onQueryChange,
  selectedLevel,
  onLevelChange,
  totalCount,
}: PdfFilterBarProps) {
  return (
    <section className="space-y-4 rounded-2xl border border-border bg-card/80 p-4 shadow-sm backdrop-blur-sm">
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="ស្វែងរកឈ្មោះវគ្គ ឬប្រភេទ..."
          className="h-11 border-border bg-card pl-9"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {levelOptions.map((level) => (
          <button
            key={level}
            type="button"
            onClick={() => onLevelChange(level)}
            className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${
              selectedLevel === level
                ? "border-blue-500 bg-blue-600 text-white shadow-sm shadow-blue-400/30"
                : "border-border bg-background text-foreground hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 dark:hover:border-blue-500/40 dark:hover:bg-blue-900/30"
            }`}
          >
            {levelLabels[level]}
          </button>
        ))}
      </div>

      <p className="text-xs text-muted-foreground">
        បង្ហាញ <span className="font-semibold text-foreground">{totalCount}</span> វគ្គសិក្សា
      </p>
    </section>
  );
}
