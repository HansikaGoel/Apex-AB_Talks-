'use client';

import React from 'react';
import { Layers, CheckCircle2 } from 'lucide-react';

interface TopicCoverageBarProps {
  currentStep: number;
  totalSteps: number;
  coveredTopics: string[];
}

export const TopicCoverageBar: React.FC<TopicCoverageBarProps> = ({
  currentStep,
  totalSteps,
  coveredTopics,
}) => {
  const percentage = Math.min(Math.round((currentStep / totalSteps) * 100), 100);

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-3 shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
          <Layers className="w-4 h-4 text-teal-400" />
          <span>Interview Progress</span>
          <span className="text-teal-400 font-mono">
            Question {currentStep} of {totalSteps}
          </span>
        </div>
        <span className="text-xs font-mono font-bold text-teal-400">{percentage}%</span>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden relative">
        <div
          className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 transition-all duration-500 rounded-full"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Topic Badges */}
      <div className="flex flex-wrap items-center gap-1.5 pt-1">
        <span className="text-[11px] text-slate-500 font-medium mr-1">Covered Topics:</span>
        {coveredTopics.map((topic, idx) => (
          <div
            key={idx}
            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-teal-950/70 border border-teal-800/60 text-teal-300 text-[11px] font-medium"
          >
            <CheckCircle2 className="w-3 h-3 text-teal-400" />
            <span>{topic}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
