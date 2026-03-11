interface SectionHeaderProps {
  title: string;
  highlight?: string;
  description?: string;
  className?: string;
}

export default function SectionHeader({
  title,
  highlight,
  description,
  className,
}: SectionHeaderProps) {
  return (
    <div className={`mx-auto max-w-4xl text-center ${className}`}>
      
      {/* Accent Line */}
      <div className="mx-auto mb-6 h-1 w-24 rounded-full bg-gradient-to-r from-green-600 via-emerald-600 to-blue-600 shadow-md" />

      {/* Title */}
      <h2 className="text-3xl font-extrabold tracking-tight text-emerald-700 dark:text-emerald-400 md:text-5xl">
        {title}{" "}
        {highlight && (
          <span className="bg-gradient-to-r from-green-600 via-emerald-600 to-blue-600 bg-clip-text text-transparent">
            {highlight}
          </span>
        )}
      </h2>

      {/* Description */}
      {description && (
        <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-slate-600 dark:text-slate-400">
          {description}
        </p>
      )}
    </div>
  );
}