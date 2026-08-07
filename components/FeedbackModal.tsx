'use client';

import React from 'react';
import { Candidate, InterviewFeedback } from '@/lib/types';
import { Award, CheckCircle2, AlertTriangle, FileText, RefreshCw, Star, Check } from 'lucide-react';

interface FeedbackModalProps {
  isOpen: boolean;
  candidate: Candidate;
  feedback?: InterviewFeedback;
  onRestart: () => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  candidate,
  feedback,
  onRestart,
}) => {
  if (!isOpen || !feedback) return null;

  const getRecommendationBadge = (rec: string) => {
    switch (rec) {
      case 'Strong Hire':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50';
      case 'Hire':
        return 'bg-teal-500/20 text-teal-300 border-teal-500/50';
      case 'Lean Hire':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/50';
      default:
        return 'bg-rose-500/20 text-rose-300 border-rose-500/50';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl my-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div className="flex items-center gap-4">
            <img
              src={candidate.avatar}
              alt={candidate.name}
              className="w-16 h-16 rounded-full object-cover border-2 border-teal-500"
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-extrabold text-slate-100">{candidate.name}</h2>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">
                  {candidate.target_role}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Completed 8-Turn Adaptive AI Technical Interview Assessment
              </p>
            </div>
          </div>

          <div className="flex flex-col items-start md:items-end gap-1">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Hiring Recommendation</span>
            <div className={`px-4 py-1.5 rounded-xl border text-sm font-bold tracking-wide shadow-md ${getRecommendationBadge(feedback.hiring_recommendation)}`}>
              {feedback.hiring_recommendation}
            </div>
          </div>
        </div>

        {/* Cohort Topic Mastery Grid */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
            <Award className="w-4 h-4 text-teal-400" />
            <span>Cohort Topic Mastery Breakdown</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-950/60 border border-slate-800 rounded-2xl p-5">
            {Object.entries(feedback.topic_mastery || {}).map(([topic, pct], idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-slate-300">{topic}</span>
                  <span className="text-teal-400 font-mono font-bold">{pct}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 rounded-full"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Strengths & Improvement Areas Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Key Strengths */}
          <div className="rounded-2xl bg-slate-950/60 border border-emerald-950/60 p-5 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Demonstrated Key Strengths</span>
            </div>
            <ul className="space-y-2">
              {feedback.strengths.map((s, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-300 leading-relaxed">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Areas for Improvement */}
          <div className="rounded-2xl bg-slate-950/60 border border-amber-950/60 p-5 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Areas for Growth & Improvement</span>
            </div>
            <ul className="space-y-2">
              {feedback.weaknesses.map((w, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-300 leading-relaxed">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                  <span>{w}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="rounded-2xl bg-slate-950/60 border border-slate-800 p-5 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
            <FileText className="w-4 h-4 text-teal-400" />
            <span>Executive Evaluation Summary</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
            {feedback.summary}
          </p>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <div className="text-xs text-slate-500 font-mono">
            Breeth AI Memory Verified &bull; ABTalks Hackathon 2026
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onRestart}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold shadow-lg shadow-teal-500/20 text-xs cursor-pointer transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Evaluate Another Candidate</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
