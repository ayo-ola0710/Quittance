import React from "react";
import { MetricItem } from "../../types/types";

export interface MetricCardProps {
  item: MetricItem;
}

export function MetricCard({ item }: MetricCardProps) {
  const { title, value, unit, breakdown, icon, accent, isLive } = item;

  const glowStyles = {
    primary: "bg-primary/10 group-hover:bg-primary/20",
    tertiary: "bg-tertiary/10 group-hover:bg-tertiary/20",
    secondary: "bg-secondary/15 group-hover:bg-secondary/25",
  }[accent];

  const iconColors = {
    primary: "text-primary bg-surface-container-high",
    tertiary: "text-tertiary bg-surface-container-high",
    secondary: "text-secondary bg-surface-container-high",
  }[accent];

  const liveIconColors = "text-primary bg-primary-container/20";

  const valueColors = {
    primary: isLive ? "text-primary" : "text-on-surface",
    tertiary: "text-tertiary",
    secondary: "text-secondary",
  }[accent];

  const customShadow = isLive
    ? "shadow-[0_0_24px_-8px_rgba(6,182,212,0.25)]"
    : "shadow-md";

  return (
    <div
      className={`relative overflow-hidden p-4 rounded-xl bg-surface-container/70 backdrop-blur-md shadow-md hover:bg-surface-container-high/80 transition-all duration-200 flex flex-col justify-between group ${customShadow}`}
    >
      {/* Ambient decorative blur glow */}
      <div
        className={`absolute -right-6 -top-6 w-24 h-24 rounded-full blur-2xl pointer-events-none transition-all duration-300 ${glowStyles}`}
      />

      <div className="flex items-center justify-between gap-space-sm mb-space-sm">
        {isLive ? (
          <div className="flex items-center gap-space-xs">
            <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
            <span className="font-label-mono-xs text-on-surface-variant uppercase tracking-wider">
              {title}
            </span>
          </div>
        ) : (
          <span className="font-label-mono-xs text-on-surface-variant uppercase tracking-wider">
            {title}
          </span>
        )}

        <div
          className={`w-8 h-8 rounded-lg flex items-center justify-center ${
            isLive ? liveIconColors : iconColors
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">{icon}</span>
        </div>
      </div>

      <div className="flex flex-col gap-space-xs">
        <div className="flex items-baseline gap-space-sm">
          <span
            className={`font-headline-lg font-semibold tracking-tight ${valueColors}`}
          >
            {value}
          </span>
          <span
            className={
              accent === "primary" && !isLive
                ? "font-label-mono-xs text-primary font-medium"
                : accent === "primary" && isLive
                  ? "font-label-mono-xs text-primary font-medium"
                  : accent === "tertiary"
                    ? "font-label-mono-sm text-on-surface"
                    : "font-label-mono-xs text-on-surface-variant"
            }
          >
            {unit}
          </span>
        </div>
        <div className="font-label-mono-xs text-on-surface-variant">
          {breakdown}
        </div>
      </div>
    </div>
  );
}
