"use client";

import { useEffect, useState } from "react";

export default function RadialStat({
  value,
  percent,
  label,
  sublabel,
  colorFrom,
  colorTo,
  size = 128,
}: {
  value: string | number;
  percent: number;
  label: string;
  sublabel?: string;
  colorFrom: string;
  colorTo: string;
  size?: number;
}) {
  const [animatedPercent, setAnimatedPercent] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setAnimatedPercent(Math.min(100, Math.max(0, percent))), 100);
    return () => clearTimeout(t);
  }, [percent]);

  const stroke = 10;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animatedPercent / 100) * circumference;
  const gradId = `radial-${label.replace(/\s+/g, "-")}`;

  return (
    <div className="card flex flex-col items-center text-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <defs>
            <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={colorFrom} />
              <stop offset="100%" stopColor={colorTo} />
            </linearGradient>
          </defs>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            className="text-ink-100 dark:text-white/10"
            strokeWidth={stroke}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={`url(#${gradId})`}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 1.1s cubic-bezier(0.34, 1.56, 0.64, 1)" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display font-extrabold text-2xl">{value}</span>
        </div>
      </div>
      <p className="mt-3 text-sm font-medium text-ink-700 dark:text-white/80">{label}</p>
      {sublabel && <p className="text-[11px] text-ink-400 mt-0.5">{sublabel}</p>}
    </div>
  );
}
