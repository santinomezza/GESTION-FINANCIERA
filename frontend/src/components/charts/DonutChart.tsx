'use client'
import React from 'react';

interface DonutChartProps {
  progress: number; // 0-100
  size?: number; // diameter in px
  strokeWidth?: number;
  color?: string; // primary color of progress arc
  backgroundColor?: string; // background circle color
  showValue?: boolean; // show percentage in center
  label?: string; // optional label below value
}

export default function DonutChart({
  progress,
  size = 120,
  strokeWidth = 8,
  color = '#0ea5e9', // teal-500 (accent)
  backgroundColor = '#e5e7eb',
  showValue = true,
  label,
}: DonutChartProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;
  const center = size / 2;


  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress arc */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-500 ease-out"
        />
      </svg>
      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {showValue && (
          <span className="text-2xl font-bold" style={{ color }}>
            {progress.toFixed(0)}%
          </span>
        )}
        {label && (
          <span className="text-xs text-gray-500 mt-1">{label}</span>
        )}
      </div>
    </div>
  );
}
