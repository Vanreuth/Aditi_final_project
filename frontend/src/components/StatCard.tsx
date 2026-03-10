"use client";

import { LucideIcon, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface Trend {
  value: number;
  isPositive: boolean;
}

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: number | string;
  color?: string;
  loading?: boolean;
  trend?: Trend;
  className?: string;
}

export const StatCard = ({
  icon: Icon,
  label,
  value,
  color = "#6366f1",
  loading,
  trend,
  className,
}: StatCardProps) => {
  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center gap-4 p-5">
          <Skeleton className="h-12 w-12 rounded-xl" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-7 w-20" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`overflow-hidden ${className}`}>
      <CardContent className="flex items-center gap-4 p-5">
        {/* Icon */}
        <div
          className="h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: `${color}18` }}
        >
          <Icon className="h-6 w-6" style={{ color }} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
            {label}
          </p>

          <div className="flex items-end gap-2 mt-1">
            <p className="text-2xl font-bold leading-none">{value}</p>

            {trend && (
              <span
                className={`text-xs font-semibold flex items-center ${
                  trend.isPositive ? "text-emerald-600" : "text-red-500"
                }`}
              >
                <TrendingUp
                  className={`h-3 w-3 mr-1 ${
                    !trend.isPositive ? "rotate-180" : ""
                  }`}
                />
                {trend.value}%
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};