"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";

type DemoItem = {
  lang: string;
  code: string;
  output: string;
  note: string;
};

const DEMOS: DemoItem[] = [
  {
    lang: "C++",
    code: '#include <iostream>\nusing namespace std;\n\nint main() {\n  cout << "Hello, C++!";\n  return 0;\n}',
    output: "Hello, C++!",
    note: "បង្ហាញ cout សាមញ្ញ",
  },
  {
    lang: "C",
    code: '#include <stdio.h>\n\nint main() {\n  printf("Hello, C!\\n");\n  return 0;\n}',
    output: "Hello, C!",
    note: "ប្រើ printf ក្នុង C",
  },
  {
    lang: "Java",
    code: 'public class Main {\n  public static void main(String[] args) {\n    System.out.println("Hello, Java!");\n  }\n}',
    output: "Hello, Java!",
    note: "System.out.println()",
  },
  {
    lang: "React",
    code: 'export default function App() {\n  return <h1>Hello, React!</h1>;\n}',
    output: "Hello, React!",
    note: "Component សាមញ្ញ",
  },
  {
    lang: "Python",
    code: 'print("Hello, Python!")',
    output: "Hello, Python!",
    note: "print() មួយបន្ទាត់",
  },
  {
    lang: "JavaScript",
    code: 'const name = "ADUTI";\nconsole.log(`Hello, ${name}!`);',
    output: "Hello, ADUTI!",
    note: "Template literal",
  },
  {
    lang: "Go",
    code: 'package main\n\nimport "fmt"\n\nfunc main() {\n  fmt.Println("Hello, Go!")\n}',
    output: "Hello, Go!",
    note: "fmt.Println()",
  },
  {
    lang: "Rust",
    code: 'fn main() {\n  println!("Hello, Rust!");\n}',
    output: "Hello, Rust!",
    note: "println! macro",
  },
];

export function DemoCodeSection() {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);

  const current = DEMOS[index];
  const total = DEMOS.length;

  const prev = () => setIndex((p) => (p - 1 + total) % total);
  const next = () => setIndex((p) => (p + 1) % total);

  useEffect(() => {
    if (!playing) return;
    const timer = setInterval(() => {
      setIndex((p) => (p + 1) % total);
    }, 2400);
    return () => clearInterval(timer);
  }, [playing, total]);

  const progressText = useMemo(() => `${index + 1} / ${total} • ${current.lang}`, [index, total, current.lang]);

  return (
    <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
      <div className="mx-auto max-w-5xl text-center">
        <div className="mx-auto mb-4 h-1 w-24 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500" />
        <h2 className="text-3xl font-black text-foreground md:text-5xl">
          បទពិសោធន៍អន្តរកម្ម
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm text-muted-foreground md:text-base">
          សាកល្បងមើល code និង output ជាក់ស្តែង លើភាសាផ្សេងៗ
        </p>

        <div className="mt-7 flex items-center justify-center gap-3">
          <ControlButton onClick={prev} label="មុន">
            <ChevronLeft className="h-4 w-4" />
          </ControlButton>
          <ControlButton
            onClick={() => setPlaying((p) => !p)}
            label={playing ? "ផ្អាក" : "ចាប់ផ្តើម"}
            active
          >
            {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </ControlButton>
          <ControlButton onClick={next} label="បន្ទាប់">
            <ChevronRight className="h-4 w-4" />
          </ControlButton>
        </div>

        <div className="mt-5 grid gap-4 text-left md:grid-cols-2">
          <Panel title={current.lang} dotColor="bg-blue-300">
            <pre className="overflow-x-auto text-sm leading-7 text-slate-700 dark:text-slate-200">
              <code>{current.code}</code>
            </pre>
          </Panel>
          <Panel title="លទ្ធផល" dotColor="bg-emerald-300">
            <div className="flex h-full min-h-[180px] items-center justify-center text-2xl font-bold text-slate-500 dark:text-slate-300">
              {current.output}
            </div>
          </Panel>
        </div>

        <p className="mt-4 text-sm text-muted-foreground">{current.note}</p>

        <div className="mt-5 flex items-center justify-center gap-2">
          {DEMOS.map((item, i) => (
            <button
              key={`${item.lang}-${i}`}
              type="button"
              onClick={() => setIndex(i)}
              className={`h-2.5 rounded-full transition-all ${
                i === index ? "w-6 bg-blue-500" : "w-2.5 bg-muted-foreground/40"
              }`}
              aria-label={`Switch to ${item.lang}`}
            />
          ))}
        </div>

        <p className="mt-2 text-sm text-muted-foreground">{progressText}</p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
          {DEMOS.map((item, i) => (
            <button
              key={item.lang}
              type="button"
              onClick={() => setIndex(i)}
              className={`rounded-full border px-4 py-1.5 text-sm font-semibold transition ${
                i === index
                  ? "border-blue-600 bg-blue-600 text-white"
                  : "border-border bg-card text-foreground hover:border-primary/50"
              }`}
            >
              {item.lang}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

function ControlButton({
  children,
  label,
  onClick,
  active,
}: {
  children: ReactNode;
  label: string;
  onClick: () => void;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1 rounded-xl border px-4 py-2 text-sm font-semibold transition ${
        active
          ? "border-blue-600 bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
          : "border-border bg-card text-foreground hover:border-border/80"
      }`}
    >
      {children}
      {label}
    </button>
  );
}

function Panel({
  title,
  dotColor,
  children,
}: {
  title: string;
  dotColor: string;
  children: ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="flex items-center gap-2 border-b border-border bg-muted/50 px-4 py-3 text-sm font-semibold text-muted-foreground">
        <span className={`h-2.5 w-2.5 rounded-full ${dotColor}`} />
        {title}
      </div>
      <div className="min-h-[220px] p-5">{children}</div>
    </div>
  );
}
