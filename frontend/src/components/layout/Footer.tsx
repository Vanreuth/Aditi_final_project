import Link from "next/link";
import { Facebook, GraduationCap, Mail, MapPin, Phone, Youtube } from "lucide-react";

const quickLinks = [
  { href: "/", label: "ទំព័រដើម", en: "Home" },
  { href: "/courses", label: "វគ្គសិក្សា", en: "Courses" },
  { href: "/roadmap", label: "ផែនទីសិក្សា", en: "Roadmap" },
  { href: "/about", label: "អំពីយើង", en: "About" },
  { href: "/contact", label: "ទំនាក់ទំនង", en: "Contact" },
];

const techStack = ["HTML & CSS", "JavaScript", "React", "Next.js", "Spring Boot", "Docker"];

export default function Footer() {
  return (
    <footer className="relative mt-24 overflow-hidden border-t border-blue-100/80 dark:border-white/10">
      {/* Subtle decorative gradient */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-blue-50/60 via-indigo-50/30 to-violet-50/50 dark:from-slate-950 dark:via-blue-950/15 dark:to-violet-950/15" />

      <div className="relative">
        {/* Main footer grid */}
        <div className="container-app grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-[1.4fr_0.8fr_0.8fr_1fr]">
          {/* Brand column */}
          <div className="space-y-4">
            <Link href="/" className="group inline-flex items-center gap-2.5">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 text-white shadow-md shadow-blue-500/25 transition-transform group-hover:scale-105">
                <GraduationCap className="h-4.5 w-4.5" />
              </div>
              <span className="text-base font-bold text-slate-900 dark:text-white">ADUTI Learning</span>
            </Link>
            <p className="max-w-xs text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              វេទិកាសិក្សាដែលផ្តោតលើការអនុវត្តជាក់ស្តែង សម្រាប់អ្នកចង់ក្លាយជា
              Frontend, Backend និង Fullstack Developer។
            </p>
            {/* Social links */}
            <div className="flex items-center gap-2 pt-1">
              {[
                { href: "#", icon: Facebook, label: "Facebook" },
                { href: "#", icon: Youtube, label: "YouTube" },
              ].map(({ href, icon: Icon, label }) => (
                <Link
                  key={label}
                  href={href}
                  aria-label={label}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition-all hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600 dark:border-white/15 dark:bg-slate-900/60 dark:text-slate-400 dark:hover:border-blue-500/40 dark:hover:bg-blue-950/40 dark:hover:text-blue-300"
                >
                  <Icon className="h-3.5 w-3.5" />
                </Link>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">Links</p>
            <ul className="space-y-2.5">
              {quickLinks.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="group inline-flex items-center gap-1.5 text-sm text-slate-600 transition-colors hover:text-blue-700 dark:text-slate-400 dark:hover:text-blue-300"
                  >
                    <span className="h-1 w-1 rounded-full bg-slate-300 transition-colors group-hover:bg-blue-500 dark:bg-slate-600 dark:group-hover:bg-blue-400" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Courses */}
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">Courses</p>
            <ul className="space-y-2.5">
              {techStack.map((name) => (
                <li key={name}>
                  <Link
                    href="/courses"
                    className="group inline-flex items-center gap-1.5 text-sm text-slate-600 transition-colors hover:text-blue-700 dark:text-slate-400 dark:hover:text-blue-300"
                  >
                    <span className="h-1 w-1 rounded-full bg-slate-300 transition-colors group-hover:bg-blue-500 dark:bg-slate-600 dark:group-hover:bg-blue-400" />
                    {name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">Contact</p>
            <div className="space-y-3">
              {[
                { icon: Mail, value: "hello@adutilearning.com" },
                { icon: Phone, value: "+855 12 345 678" },
                { icon: MapPin, value: "Phnom Penh, Cambodia" },
              ].map(({ icon: Icon, value }) => (
                <div key={value} className="flex items-start gap-2.5 text-sm text-slate-600 dark:text-slate-400">
                  <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-500 dark:text-blue-400" />
                  <span>{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-blue-100/60 dark:border-white/8">
          <div className="container-app flex flex-col items-center justify-between gap-2 py-4 sm:flex-row">
            <p className="text-xs text-slate-500 dark:text-slate-500">
              © {new Date().getFullYear()} ADUTI Learning. All rights reserved.
            </p>
            <div className="flex items-center gap-4 text-xs text-slate-400 dark:text-slate-600">
              <Link href="#" className="hover:text-slate-600 dark:hover:text-slate-400">Privacy Policy</Link>
              <Link href="#" className="hover:text-slate-600 dark:hover:text-slate-400">Terms of Service</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
