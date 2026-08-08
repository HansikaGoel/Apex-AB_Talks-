'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  Award,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  BarChart3,
  User,
  ShieldCheck,
  Brain,
  Sparkles,
  Download,
  Clock,
  Layers
} from 'lucide-react';

interface HistoryRecord {
  id: string;
  date: string;
  candidateName: string;
  candidateRole: string;
  scores: {
    technical_accuracy: number;
    communication: number;
    problem_solving: number;
    confidence: number;
  };
  hiring_recommendation: string;
  strengths: string[];
  weaknesses: string[];
  summary: string;
}

export default function AnalyticsDashboardPage() {
  const [history, setHistory] = useState<HistoryRecord[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const storedStr = localStorage.getItem('interview_history');
        if (storedStr) {
          setHistory(JSON.parse(storedStr));
        } else {
          // Default initial sample records if no local storage records exist yet
          const sampleRecords: HistoryRecord[] = [
            {
              id: 'session_sample_1',
              date: '2026-08-08',
              candidateName: 'Alex Rivera',
              candidateRole: 'Senior AI Systems Architect',
              scores: {
                technical_accuracy: 94,
                communication: 90,
                problem_solving: 92,
                confidence: 95
              },
              hiring_recommendation: 'Strong Hire',
              strengths: [
                'Expert command of vLLM PagedAttention & GPU memory bandwidth tuning.',
                'Articulated clear trade-offs between dense BM25 and sparse vector hybrid retrieval.',
                'Exceptional communication and system design structuring under SLA constraints.'
              ],
              weaknesses: [
                'Could further optimize edge deployment quantization for ARM micro-nodes.',
                'Needs deeper practical experience with continuous evaluation frameworks like Ragas.'
              ],
              summary: 'Alex demonstrated exceptional technical mastery across all 8 adaptive turns. Highly recommended for the Senior AI Systems Architect role.'
            },
            {
              id: 'session_sample_2',
              date: '2026-08-05',
              candidateName: 'Sarah Johnson',
              candidateRole: 'Senior Data Engineer',
              scores: {
                technical_accuracy: 88,
                communication: 86,
                problem_solving: 87,
                confidence: 89
              },
              hiring_recommendation: 'Hire',
              strengths: [
                'Solid vector database indexing experience with ChromaDB & Pinecone HNSW tuning.',
                'Clear understanding of semantic chunking strategies for enterprise doc search.'
              ],
              weaknesses: [
                'Needs deeper understanding of cross-encoder reranker latency trade-offs.',
                'Can improve error handling in multi-agent supervisory routing loops.'
              ],
              summary: 'Sarah showed strong data engineering foundations and good understanding of RAG retrieval pipelines.'
            }
          ];
          setHistory(sampleRecords);
        }
      } catch (e) {
        console.warn('Failed to load interview history:', e);
      }
    }
  }, []);

  const latestRecord = history[0] || null;

  // Calculate average improvement metrics across sessions
  const calculateOverallScore = (rec: HistoryRecord) => {
    const s = rec.scores;
    return Math.round((s.technical_accuracy + s.communication + s.problem_solving + s.confidence) / 4);
  };

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
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-sans space-y-8">
      {/* Top Navigation Header */}
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-colors flex items-center gap-2 text-xs font-semibold"
          >
            <ArrowLeft className="w-4 h-4 text-teal-400" />
            <span>Back to Live Interview Room</span>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight">
                Candidate Evaluation Analytics
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-teal-950 text-teal-300 border border-teal-800 text-xs font-mono font-bold">
                Breeth AI Engine
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Historical interview sessions, skill progression trends & candidate competency scorecards
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2 text-xs font-mono text-slate-300">
            <Layers className="w-4 h-4 text-teal-400" />
            <span>Total Evaluations: <strong className="text-teal-400">{history.length}</strong></span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-8">
        {/* Latest Completed Session Scorecard */}
        {latestRecord && (
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-teal-950 border-2 border-teal-500 flex items-center justify-center text-teal-400 font-extrabold text-xl shadow-lg">
                  {latestRecord.candidateName.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-extrabold text-slate-100">{latestRecord.candidateName}</h2>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-teal-300 font-mono">
                      {latestRecord.candidateRole}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>Latest Assessment Date: {latestRecord.date}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Hiring Recommendation</div>
                  <div className={`px-4 py-1.5 rounded-xl border text-sm font-bold tracking-wide shadow-md mt-1 ${getRecommendationBadge(latestRecord.hiring_recommendation)}`}>
                    {latestRecord.hiring_recommendation}
                  </div>
                </div>
                <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 text-center min-w-[5rem]">
                  <div className="text-[10px] text-slate-500 uppercase font-medium">Overall Score</div>
                  <div className="text-2xl font-mono font-extrabold text-teal-400">{calculateOverallScore(latestRecord)}%</div>
                </div>
              </div>
            </div>

            {/* Score Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800 space-y-1 text-center">
                <span className="text-xs text-slate-400 font-medium">Technical Accuracy</span>
                <div className="text-2xl font-mono font-extrabold text-teal-400">{latestRecord.scores.technical_accuracy}%</div>
                <div className="w-full h-1.5 rounded-full bg-slate-800 mt-2 overflow-hidden">
                  <div className="h-full bg-teal-500 rounded-full" style={{ width: `${latestRecord.scores.technical_accuracy}%` }} />
                </div>
              </div>
              <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800 space-y-1 text-center">
                <span className="text-xs text-slate-400 font-medium">Communication</span>
                <div className="text-2xl font-mono font-extrabold text-emerald-400">{latestRecord.scores.communication}%</div>
                <div className="w-full h-1.5 rounded-full bg-slate-800 mt-2 overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${latestRecord.scores.communication}%` }} />
                </div>
              </div>
              <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800 space-y-1 text-center">
                <span className="text-xs text-slate-400 font-medium">Problem Solving</span>
                <div className="text-2xl font-mono font-extrabold text-indigo-400">{latestRecord.scores.problem_solving}%</div>
                <div className="w-full h-1.5 rounded-full bg-slate-800 mt-2 overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${latestRecord.scores.problem_solving}%` }} />
                </div>
              </div>
              <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800 space-y-1 text-center">
                <span className="text-xs text-slate-400 font-medium">Confidence</span>
                <div className="text-2xl font-mono font-extrabold text-amber-400">{latestRecord.scores.confidence}%</div>
                <div className="w-full h-1.5 rounded-full bg-slate-800 mt-2 overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: `${latestRecord.scores.confidence}%` }} />
                </div>
              </div>
            </div>

            {/* Strengths & Growth Areas Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-950/60 border border-emerald-950/60 p-5 rounded-2xl space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Demonstrated Strengths</span>
                </div>
                <ul className="space-y-2">
                  {latestRecord.strengths.map((s, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-300 leading-relaxed">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-slate-950/60 border border-amber-950/60 p-5 rounded-2xl space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span>Technical Gaps & Actionable Growth</span>
                </div>
                <ul className="space-y-2">
                  {latestRecord.weaknesses.map((w, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-300 leading-relaxed">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                      <span>{w}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Skill Growth Trends & History Timeline Table */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-xl">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-teal-400" />
              <h2 className="text-lg font-bold text-slate-100">Sequential Session History & Progression Trends</h2>
            </div>
            <span className="text-xs text-slate-400 font-mono">Breeth AI Memory Verified</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px]">
                  <th className="py-3 px-4">DATE</th>
                  <th className="py-3 px-4">CANDIDATE</th>
                  <th className="py-3 px-4">TARGET ROLE</th>
                  <th className="py-3 px-4 text-center">TECH ACCURACY</th>
                  <th className="py-3 px-4 text-center">COMMUNICATION</th>
                  <th className="py-3 px-4 text-center">OVERALL</th>
                  <th className="py-3 px-4 text-right">RECOMMENDATION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {history.map((rec) => {
                  const overall = calculateOverallScore(rec);
                  return (
                    <tr key={rec.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-4 px-4 font-mono text-slate-400">{rec.date}</td>
                      <td className="py-4 px-4 font-bold text-slate-100">{rec.candidateName}</td>
                      <td className="py-4 px-4 text-slate-300">{rec.candidateRole}</td>
                      <td className="py-4 px-4 text-center font-mono font-bold text-teal-400">{rec.scores.technical_accuracy}%</td>
                      <td className="py-4 px-4 text-center font-mono font-bold text-emerald-400">{rec.scores.communication}%</td>
                      <td className="py-4 px-4 text-center font-mono font-extrabold text-slate-100">{overall}%</td>
                      <td className="py-4 px-4 text-right">
                        <span className={`px-3 py-1 rounded-xl border text-[11px] font-bold ${getRecommendationBadge(rec.hiring_recommendation)}`}>
                          {rec.hiring_recommendation}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
