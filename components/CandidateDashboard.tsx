'use client';

import React from 'react';
import { Candidate } from '@/lib/types';
import { UserCheck, Award, AlertCircle, ChevronRight, Sparkles, BookOpen, Layers } from 'lucide-react';

interface CandidateDashboardProps {
  candidates: Candidate[];
  selectedCandidateId: string | null;
  onSelectCandidate: (candidate: Candidate) => void;
  onStartInterview: () => void;
}

export const CandidateDashboard: React.FC<CandidateDashboardProps> = ({
  candidates,
  selectedCandidateId,
  onSelectCandidate,
  onStartInterview,
}) => {
  const activeCandidate = candidates.find(c => c.id === selectedCandidateId) || candidates[0];

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 border border-slate-800 p-8 text-white shadow-2xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-400 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              ABTalks Hackathon - AI Cohort Evaluator
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-100">
              The Interview Agent
            </h1>
            <p className="text-slate-400 text-sm md:text-base max-w-2xl">
              Conduct multi-turn, adaptive technical interviews powered by <span className="text-teal-400 font-medium">Breeth AI Memory & Intent Layer</span>. Select a candidate from the 31-day AI Cohort to launch probing evaluation.
            </p>
          </div>

          {activeCandidate && (
            <button
              onClick={onStartInterview}
              className="flex items-center gap-3 px-6 py-3.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-slate-950 font-bold shadow-lg shadow-teal-500/20 hover:shadow-teal-500/40 transition-all duration-200 cursor-pointer text-sm whitespace-nowrap"
            >
              <span>Launch Interview for {activeCandidate.name.split(' ')[0]}</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Candidate Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {candidates.map((candidate) => {
          const isSelected = candidate.id === selectedCandidateId;
          const completedCount = candidate.completed_days.length;
          const skippedCount = candidate.skipped_days.length;

          return (
            <div
              key={candidate.id}
              onClick={() => onSelectCandidate(candidate)}
              className={`relative rounded-2xl p-6 transition-all duration-300 cursor-pointer border flex flex-col justify-between ${
                isSelected
                  ? 'bg-slate-900/90 border-teal-500 shadow-xl shadow-teal-500/10 ring-1 ring-teal-500/50 scale-[1.02]'
                  : 'bg-slate-900/40 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
              }`}
            >
              <div className="space-y-4">
                {/* Avatar & Basic Info */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={candidate.avatar}
                      alt={candidate.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-teal-500/40"
                    />
                    <div>
                      <h3 className="font-bold text-slate-100 text-base">{candidate.name}</h3>
                      <p className="text-xs text-teal-400 font-medium">{candidate.target_role}</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-md bg-slate-800 text-xs font-mono font-bold text-slate-300 border border-slate-700">
                    Grade: {candidate.cohort_grade}
                  </span>
                </div>

                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {candidate.bio}
                </p>

                {/* Cohort Stats */}
                <div className="pt-2 grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-2 flex items-center gap-2">
                    <BookOpen className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase">Completed</div>
                      <div className="font-semibold text-slate-200">{completedCount} / 31 Days</div>
                    </div>
                  </div>
                  <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-2 flex items-center gap-2">
                    <Layers className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase">Skipped</div>
                      <div className="font-semibold text-slate-200">{skippedCount} Modules</div>
                    </div>
                  </div>
                </div>

                {/* Strengths & Focus Tags */}
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
                    <UserCheck className="w-3.5 h-3.5 text-teal-400" />
                    <span>Known Strengths:</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {candidate.known_strengths.map((str, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded bg-teal-950/60 text-teal-300 border border-teal-800/50 text-[10px]"
                      >
                        {str}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                    <span>Focus Gaps for Agent:</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {candidate.focus_areas.map((fa, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded bg-amber-950/50 text-amber-300 border border-amber-800/40 text-[10px]"
                      >
                        {fa}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className={`font-semibold ${isSelected ? 'text-teal-400' : 'text-slate-500'}`}>
                  {isSelected ? 'Selected Profile' : 'Click to select'}
                </span>
                <ChevronRight className={`w-4 h-4 transition-transform ${isSelected ? 'translate-x-1 text-teal-400' : 'text-slate-600'}`} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Candidate Detailed Preview Card */}
      {activeCandidate && (
        <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400">
              <Award className="w-8 h-8" />
            </div>
            <div>
              <div className="text-xs text-slate-400">Ready to Evaluate</div>
              <h4 className="text-lg font-bold text-slate-100">{activeCandidate.name} &bull; {activeCandidate.target_role}</h4>
              <p className="text-xs text-slate-400 mt-0.5">
                The agent will dynamically select 8 probing questions across curriculum days, recording memory intent via Breeth AI.
              </p>
            </div>
          </div>
          <button
            onClick={onStartInterview}
            className="w-full md:w-auto px-8 py-3.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold shadow-lg shadow-teal-500/20 transition-all text-sm cursor-pointer whitespace-nowrap"
          >
            Start Live Interview
          </button>
        </div>
      )}
    </div>
  );
};
