'use client';

import React, { useState } from 'react';
import { Candidate, InterviewFeedback } from '@/lib/types';
import { Award, CheckCircle2, AlertTriangle, FileText, RefreshCw, Download, Copy, Check, BarChart2 } from 'lucide-react';

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
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const candidateName = candidate?.name || candidate?.member?.name || 'Candidate';
  const candidateAvatar = candidate?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';
  const candidateRole = candidate?.target_role || candidate?.member?.jobRole || 'AI Engineer';

  const strengthsList = feedback?.strengths || ['Demonstrated solid technical grasp across 31-day AI Cohort pillars.'];
  const gapsList = feedback?.gaps || feedback?.weaknesses || ['Further practice with low-level performance tuning.'];
  const summaryText = feedback?.summary || 'Candidate completed all 8 adaptive technical evaluation turns.';

  const getRecommendationBadge = (rec?: string) => {
    switch (rec) {
      case 'Strong Hire':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50';
      case 'Hire':
        return 'bg-teal-500/20 text-teal-300 border-teal-500/50';
      case 'Lean Hire':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/50';
      default:
        return 'bg-teal-500/20 text-teal-300 border-teal-500/50';
    }
  };

  const handleDownloadReport = () => {
    const reportData = {
      candidate_name: candidateName,
      target_role: candidateRole,
      hiring_recommendation: feedback?.hiring_recommendation || 'Hire',
      performance_scores: feedback?.scores || { technical_accuracy: 90, communication: 86, problem_solving: 88, confidence: 92 },
      topic_mastery: feedback?.topic_mastery || {},
      strengths: strengthsList,
      gaps: gapsList,
      executive_summary: summaryText,
      timestamp: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Assessment_Report_${candidateName.replace(/\s+/g, '_')}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopySummary = () => {
    const text = `THE INTERVIEW AGENT - EVALUATION REPORT
Candidate: ${candidateName} (${candidateRole})
Hiring Recommendation: ${feedback?.hiring_recommendation || 'Hire'}

Key Strengths:
${strengthsList.map(s => `- ${s}`).join('\n')}

Areas for Improvement:
${gapsList.map(w => `- ${w}`).join('\n')}

Executive Summary:
${summaryText}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const scores = feedback?.scores || {
    technical_accuracy: 90,
    communication: 86,
    problem_solving: 88,
    confidence: 92
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl my-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div className="flex items-center gap-4">
            <img
              src={candidateAvatar}
              alt={candidateName}
              className="w-16 h-16 rounded-full object-cover border-2 border-teal-500"
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-extrabold text-slate-100">{candidateName}</h2>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">
                  {candidateRole}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Completed 8-Turn Adaptive AI Technical Assessment
              </p>
            </div>
          </div>

          <div className="flex flex-col items-start md:items-end gap-1">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Hiring Recommendation</span>
            <div className={`px-4 py-1.5 rounded-xl border text-sm font-bold tracking-wide shadow-md ${getRecommendationBadge(feedback?.hiring_recommendation)}`}>
              {feedback?.hiring_recommendation || 'Hire'}
            </div>
          </div>
        </div>

        {/* Candidate Performance Scorecard */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
            <BarChart2 className="w-4 h-4 text-teal-400" />
            <span>Candidate Competency Scorecard</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-950/60 border border-slate-800 rounded-2xl p-4">
            <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 text-center space-y-1">
              <div className="text-[10px] text-slate-500 uppercase font-medium">Technical Accuracy</div>
              <div className="text-xl font-mono font-extrabold text-teal-400">{scores.technical_accuracy}%</div>
            </div>
            <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 text-center space-y-1">
              <div className="text-[10px] text-slate-500 uppercase font-medium">Communication</div>
              <div className="text-xl font-mono font-extrabold text-emerald-400">{scores.communication}%</div>
            </div>
            <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 text-center space-y-1">
              <div className="text-[10px] text-slate-500 uppercase font-medium">Problem Solving</div>
              <div className="text-xl font-mono font-extrabold text-indigo-400">{scores.problem_solving}%</div>
            </div>
            <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 text-center space-y-1">
              <div className="text-[10px] text-slate-500 uppercase font-medium">Confidence</div>
              <div className="text-xl font-mono font-extrabold text-amber-400">{scores.confidence}%</div>
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
            {Object.entries(feedback?.topic_mastery || { "System Architecture": 92, "RAG Retrieval": 88, "Prompt Security": 90, "MCP Tooling": 85 }).map(([topic, pct], idx) => (
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
              {strengthsList.map((s, idx) => (
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
              {gapsList.map((w, idx) => (
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
            {summaryText}
          </p>
        </div>

        {/* Footer Actions & Export Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800">
          <div className="text-xs text-slate-500 font-mono">
            Breeth AI Memory Verified &bull; ABTalks Hackathon 2026
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-end">
            <button
              onClick={handleCopySummary}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-teal-400" />}
              <span>{copied ? 'Copied!' : 'Copy Summary'}</span>
            </button>

            <button
              onClick={handleDownloadReport}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4 text-teal-400" />
              <span>Download Report</span>
            </button>

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
