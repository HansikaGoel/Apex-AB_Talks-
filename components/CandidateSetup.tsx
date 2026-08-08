'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Candidate } from '@/lib/types';
import { Sparkles, UserCheck, Layers, BookOpen, ChevronRight, CheckCircle2, AlertCircle, BarChart3 } from 'lucide-react';

interface CandidateSetupProps {
  candidates: Candidate[];
  selectedCandidateId: string | null;
  onSelectCandidate: (cand: Candidate) => void;
  onLaunchInterview: (customCandidate?: Candidate) => void;
}

export const CandidateSetup: React.FC<CandidateSetupProps> = ({
  candidates,
  selectedCandidateId,
  onSelectCandidate,
  onLaunchInterview,
}) => {
  const getCandidateId = (c: any) => c?.id || c?.member?.id || '';
  const activeCandidate = candidates.find(c => getCandidateId(c) === selectedCandidateId) || candidates[0];

  const [targetRole, setTargetRole] = useState(activeCandidate?.target_role || activeCandidate?.member?.jobRole || 'AI Systems Architect');
  const [completedMissions, setCompletedMissions] = useState<string[]>([
    'RAG & Vector Retrieval',
    'Prompt Engineering & Injection Defense',
    'Agentic AI & Tool Execution'
  ]);
  const [skippedTopics, setSkippedTopics] = useState<string[]>([
    'Model Context Protocol (MCP)',
    'vLLM PagedAttention & Quantization'
  ]);

  const pillars = [
    'RAG & Hybrid Vector Retrieval',
    'Vector Databases (HNSW / Indexing)',
    'Prompt Engineering & Injection Defense',
    'Agentic AI & Tool Execution',
    'Model Context Protocol (MCP)',
    'AI Deployment (vLLM / Quantization)',
    'Production AI Systems & Evaluation'
  ];

  const toggleMission = (pillar: string) => {
    if (completedMissions.includes(pillar)) {
      setCompletedMissions(completedMissions.filter(p => p !== pillar));
      if (!skippedTopics.includes(pillar)) setSkippedTopics([...skippedTopics, pillar]);
    } else {
      setCompletedMissions([...completedMissions, pillar]);
      setSkippedTopics(skippedTopics.filter(p => p !== pillar));
    }
  };

  const handleLaunchCustom = () => {
    const customCand: Candidate = {
      ...activeCandidate,
      target_role: targetRole,
      completed_missions: completedMissions,
      skipped_topics: skippedTopics,
      known_strengths: completedMissions,
      focus_areas: skippedTopics
    };
    onLaunchInterview(customCand);
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 animate-fadeIn p-4 md:p-6 bg-slate-900/90 border border-slate-800 rounded-3xl shadow-2xl">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-400 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            Official 31-Day AI Cohort Profile Setup
          </div>
          <h2 className="text-2xl font-extrabold text-slate-100 mt-2">
            Configure Candidate & Curriculum Context
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Select a synthetic AI Cohort candidate profile or customize mission progress across the 7 Core Pillars.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-5 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-teal-300 font-semibold border border-slate-700 transition-all text-xs whitespace-nowrap cursor-pointer"
          >
            <BarChart3 className="w-4 h-4 text-teal-400" />
            <span>Analytics Dashboard</span>
          </Link>
          <button
            onClick={handleLaunchCustom}
            className="flex items-center gap-3 px-6 py-3.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 font-extrabold text-sm shadow-xl shadow-teal-500/20 hover:scale-105 transition-all cursor-pointer whitespace-nowrap"
          >
            <span>Launch Technical Assessment</span>
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Candidate Profile Selection */}
      <div className="space-y-3">
        <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <UserCheck className="w-4 h-4 text-teal-400" />
          <span>Select Cohort Candidate Profile</span>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {candidates.map((cand) => {
            const cid = getCandidateId(cand);
            const isSelected = cid === selectedCandidateId;
            const cName = cand.name || cand.member?.name || 'Candidate';
            const cRole = cand.target_role || cand.member?.jobRole || 'AI Engineer';

            return (
              <div
                key={cid}
                onClick={() => {
                  onSelectCandidate(cand);
                  setTargetRole(cRole);
                }}
                className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                  isSelected
                    ? 'bg-teal-950/60 border-teal-500 text-slate-100 shadow-lg'
                    : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-slate-100">{cName}</h4>
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-teal-400" />}
                </div>
                <span className="inline-block px-2 py-0.5 rounded bg-slate-900 text-[10px] font-mono text-teal-300 border border-slate-800">
                  {cRole}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 7 Core Curriculum Pillars Configuration */}
      <div className="space-y-3">
        <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <Layers className="w-4 h-4 text-teal-400" />
          <span>7 Core Pillars Curriculum Progress</span>
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-slate-950/70 border border-slate-800 p-4 rounded-2xl">
          {pillars.map((pillar, idx) => {
            const isPassed = completedMissions.includes(pillar);

            return (
              <div
                key={idx}
                onClick={() => toggleMission(pillar)}
                className={`p-3 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                  isPassed
                    ? 'bg-teal-950/40 border-teal-700/60 text-slate-200'
                    : 'bg-slate-900/60 border-slate-800 text-slate-500 hover:text-slate-300'
                }`}
              >
                <div className="flex items-center gap-3 text-xs font-medium">
                  <span className={`w-2 h-2 rounded-full ${isPassed ? 'bg-teal-400' : 'bg-slate-700'}`} />
                  <span>{pillar}</span>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                  isPassed ? 'bg-teal-900 text-teal-300' : 'bg-slate-800 text-amber-400'
                }`}>
                  {isPassed ? 'Passed Mission' : 'Skipped / Topic Gap'}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
