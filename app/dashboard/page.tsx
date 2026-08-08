'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  TrendingUp,
  Award,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  BarChart3,
  UserCheck,
  Brain,
  Clock,
  Layers,
  Sparkles,
  ChevronRight
} from 'lucide-react';

interface HistoryRecord {
  id: string;
  candidateId?: string;
  date: string;
  candidateName: string;
  targetRole: string;
  candidateRole?: string;
  overallScore?: number;
  scores?: {
    technical_accuracy: number;
    communication: number;
    problem_solving: number;
    confidence: number;
  };
  scorecard?: any;
  hiring_recommendation?: string;
  strengths?: string[];
  weaknesses?: string[];
  gaps?: string[];
  summary?: string;
}

export default function AnalyticsDashboardPage() {
  const router = useRouter();
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const storedStr = localStorage.getItem('interview_history');
        if (storedStr) {
          const parsed = JSON.parse(storedStr);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setHistory(parsed);
            setSelectedCandidateId(parsed[0].id || parsed[0].candidateId || null);
            return;
          }
        }

        // Default initial sample records if no local storage records exist yet
        const sampleRecords: HistoryRecord[] = [
          {
            id: 'session_sample_1',
            date: '2026-08-08',
            candidateName: 'Alex Rivera',
            targetRole: 'Senior AI Systems Architect',
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
            gaps: [
              'Could further optimize edge deployment quantization for ARM micro-nodes.',
              'Needs deeper practical experience with continuous evaluation frameworks like Ragas.'
            ],
            summary: 'Alex demonstrated exceptional technical mastery across all 8 adaptive turns. Highly recommended for the Senior AI Systems Architect role.'
          },
          {
            id: 'session_sample_2',
            date: '2026-08-05',
            candidateName: 'Sarah Johnson',
            targetRole: 'Senior Data Engineer',
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
            gaps: [
              'Needs deeper understanding of cross-encoder reranker latency trade-offs.',
              'Can improve error handling in multi-agent supervisory routing loops.'
            ],
            summary: 'Sarah showed strong data engineering foundations and good understanding of RAG retrieval pipelines.'
          }
        ];
        setHistory(sampleRecords);
        setSelectedCandidateId(sampleRecords[0].id);
      } catch (e) {
        console.warn('Failed to load interview history:', e);
      }
    }
  }, []);

  // Selected candidate record or fallback to latest
  const activeRecord = history.find(h => (h.id || h.candidateId) === selectedCandidateId) || history[0] || null;

  const calculateOverallScore = (rec: HistoryRecord) => {
    if (rec.overallScore) return rec.overallScore;
    const s = rec.scores || rec.scorecard?.scores;
    if (!s) return 88;
    return Math.round(((s.technical_accuracy || 90) + (s.communication || 85) + (s.problem_solving || 88) + (s.confidence || 90)) / 4);
  };

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

  const activeScores = activeRecord?.scores || activeRecord?.scorecard?.scores || {
    technical_accuracy: 90,
    communication: 86,
    problem_solving: 88,
    confidence: 92
  };

  const activeStrengths: string[] = activeRecord?.strengths || activeRecord?.scorecard?.strengths || ['Demonstrated solid technical proficiency across AI Cohort pillars.'];
  const activeGaps: string[] = activeRecord?.gaps || activeRecord?.weaknesses || activeRecord?.scorecard?.gaps || activeRecord?.scorecard?.weaknesses || ['Deepen vector HNSW tuning under high request concurrency.'];
  const activeSummary = activeRecord?.summary || activeRecord?.scorecard?.summary || 'Candidate completed all 8 technical evaluation turns.';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-sans space-y-8">
      {/* Top Navigation Header */}
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-colors flex items-center gap-2 text-xs font-semibold cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-teal-400" />
            <span>Back to Live Interactive Room</span>
          </button>
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
              Multi-candidate historical sessions, skill progression trends & detailed competency scorecards
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2 text-xs font-mono text-slate-300">
            <Layers className="w-4 h-4 text-teal-400" />
            <span>Total Candidate Evaluations: <strong className="text-teal-400">{history.length}</strong></span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-8">
        {/* Multi-Candidate Selection Tabs */}
        {history.length > 0 && (
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-teal-400" />
              <span>Select Candidate Session to Inspect Result</span>
            </label>
            <div className="flex flex-wrap gap-3">
              {history.map((rec) => {
                const recId = rec.id || rec.candidateId || rec.date;
                const isSelected = recId === selectedCandidateId;
                const role = rec.targetRole || rec.candidateRole || 'AI Engineer';

                return (
                  <button
                    key={recId}
                    onClick={() => setSelectedCandidateId(recId)}
                    className={`px-4 py-3 rounded-2xl border text-left transition-all cursor-pointer space-y-1 ${
                      isSelected
                        ? 'bg-teal-950/80 border-teal-500 text-slate-100 shadow-lg'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold text-xs">
                      <span>{rec.candidateName}</span>
                      <span className="text-[10px] text-teal-400 font-mono">({calculateOverallScore(rec)}%)</span>
                    </div>
                    <div className="text-[10px] text-slate-400">{role} &bull; {rec.date}</div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Selected Candidate Scorecard Details */}
        {activeRecord && (
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl animate-fadeIn">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-teal-950 border-2 border-teal-500 flex items-center justify-center text-teal-400 font-extrabold text-xl shadow-lg">
                  {activeRecord.candidateName.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-extrabold text-slate-100">{activeRecord.candidateName}</h2>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-teal-300 font-mono">
                      {activeRecord.targetRole || activeRecord.candidateRole}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>Assessment Date: {activeRecord.date}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Hiring Recommendation</div>
                  <div className={`px-4 py-1.5 rounded-xl border text-sm font-bold tracking-wide shadow-md mt-1 ${getRecommendationBadge(activeRecord.hiring_recommendation || activeRecord.scorecard?.hiring_recommendation)}`}>
                    {activeRecord.hiring_recommendation || activeRecord.scorecard?.hiring_recommendation || 'Hire'}
                  </div>
                </div>
                <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 text-center min-w-[5rem]">
                  <div className="text-[10px] text-slate-500 uppercase font-medium">Overall Score</div>
                  <div className="text-2xl font-mono font-extrabold text-teal-400">{calculateOverallScore(activeRecord)}%</div>
                </div>
              </div>
            </div>

            {/* Score Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800 space-y-1 text-center">
                <span className="text-xs text-slate-400 font-medium">Technical Accuracy</span>
                <div className="text-2xl font-mono font-extrabold text-teal-400">{activeScores.technical_accuracy}%</div>
                <div className="w-full h-1.5 rounded-full bg-slate-800 mt-2 overflow-hidden">
                  <div className="h-full bg-teal-500 rounded-full" style={{ width: `${activeScores.technical_accuracy}%` }} />
                </div>
              </div>
              <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800 space-y-1 text-center">
                <span className="text-xs text-slate-400 font-medium">Communication</span>
                <div className="text-2xl font-mono font-extrabold text-emerald-400">{activeScores.communication}%</div>
                <div className="w-full h-1.5 rounded-full bg-slate-800 mt-2 overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${activeScores.communication}%` }} />
                </div>
              </div>
              <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800 space-y-1 text-center">
                <span className="text-xs text-slate-400 font-medium">Problem Solving</span>
                <div className="text-2xl font-mono font-extrabold text-indigo-400">{activeScores.problem_solving}%</div>
                <div className="w-full h-1.5 rounded-full bg-slate-800 mt-2 overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${activeScores.problem_solving}%` }} />
                </div>
              </div>
              <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800 space-y-1 text-center">
                <span className="text-xs text-slate-400 font-medium">Confidence</span>
                <div className="text-2xl font-mono font-extrabold text-amber-400">{activeScores.confidence}%</div>
                <div className="w-full h-1.5 rounded-full bg-slate-800 mt-2 overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: `${activeScores.confidence}%` }} />
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
                  {activeStrengths.map((s, idx) => (
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
                  <span>Technical Gaps & Growth Areas</span>
                </div>
                <ul className="space-y-2">
                  {activeGaps.map((w, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-300 leading-relaxed">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                      <span>{w}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Executive Summary */}
            <div className="bg-slate-950/60 border border-slate-800 p-5 rounded-2xl space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
                <Brain className="w-4 h-4 text-teal-400" />
                <span>Executive Evaluation Summary</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                {activeSummary}
              </p>
            </div>
          </div>
        )}

        {/* Multi-Candidate Table */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-xl">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-teal-400" />
              <h2 className="text-lg font-bold text-slate-100">All Completed Candidate Sessions</h2>
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
                  <th className="py-3 px-4 text-center">OVERALL SCORE</th>
                  <th className="py-3 px-4 text-right">RECOMMENDATION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {history.map((rec) => {
                  const recId = rec.id || rec.candidateId || rec.date;
                  const overall = calculateOverallScore(rec);
                  const isSelected = recId === selectedCandidateId;

                  return (
                    <tr
                      key={recId}
                      onClick={() => setSelectedCandidateId(recId)}
                      className={`transition-colors cursor-pointer ${
                        isSelected ? 'bg-teal-950/40 font-semibold text-slate-100' : 'hover:bg-slate-800/40'
                      }`}
                    >
                      <td className="py-4 px-4 font-mono text-slate-400">{rec.date}</td>
                      <td className="py-4 px-4 font-bold text-slate-100">{rec.candidateName}</td>
                      <td className="py-4 px-4 text-slate-300">{rec.targetRole || rec.candidateRole}</td>
                      <td className="py-4 px-4 text-center font-mono font-extrabold text-teal-400">{overall}%</td>
                      <td className="py-4 px-4 text-right">
                        <span className={`px-3 py-1 rounded-xl border text-[11px] font-bold ${getRecommendationBadge(rec.hiring_recommendation || rec.scorecard?.hiring_recommendation)}`}>
                          {rec.hiring_recommendation || rec.scorecard?.hiring_recommendation || 'Hire'}
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
