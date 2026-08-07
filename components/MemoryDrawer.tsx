'use client';

import React from 'react';
import { MemoryEpisode } from '@/lib/types';
import { Brain, Database, Sparkles, X, Activity, CheckCircle, AlertTriangle } from 'lucide-react';

interface MemoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  recalledMemories: MemoryEpisode[];
  followUpReasoning?: string;
  candidateName: string;
}

export const MemoryDrawer: React.FC<MemoryDrawerProps> = ({
  isOpen,
  onClose,
  recalledMemories,
  followUpReasoning,
  candidateName,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="w-full max-w-lg bg-slate-900 border-l border-slate-800 h-full p-6 overflow-y-auto space-y-6 shadow-2xl flex flex-col justify-between">
        <div className="space-y-6">
          {/* Top Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-teal-500/10 border border-teal-500/30 text-teal-400">
                <Brain className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-100 text-base">Breeth AI Memory Inspector</h3>
                <p className="text-xs text-slate-400">Persistent Episode Intent & Recall Engine</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Agent Reasoning Box */}
          {followUpReasoning && (
            <div className="rounded-xl bg-gradient-to-r from-teal-950/60 to-slate-900 border border-teal-800/40 p-4 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-teal-400 uppercase tracking-wider">
                <Sparkles className="w-4 h-4" />
                <span>Agent Question Selection Reasoning</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed italic">
                "{followUpReasoning}"
              </p>
            </div>
          )}

          {/* Recalled Episode Memories List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-400 uppercase">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-teal-400" />
                <span>Hybrid Search Memories ({recalledMemories.length})</span>
              </div>
              <span className="text-[10px] text-teal-400 font-mono">Candidate: {candidateName}</span>
            </div>

            {recalledMemories.length === 0 ? (
              <div className="p-6 rounded-xl border border-dashed border-slate-800 text-center space-y-2">
                <Activity className="w-6 h-6 text-slate-600 mx-auto" />
                <p className="text-xs text-slate-400">
                  No past memory episodes recalled for current turn query. Answer will be committed to Breeth AI upon submit.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {recalledMemories.map((mem, idx) => (
                  <div
                    key={mem.id || idx}
                    className="rounded-xl bg-slate-950/80 border border-slate-800 p-4 space-y-3 text-xs"
                  >
                    <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                      <span>Episode ID: {mem.id.slice(0, 10)}...</span>
                      <span>{new Date(mem.timestamp).toLocaleTimeString()}</span>
                    </div>

                    <div>
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">Question Answered:</div>
                      <div className="text-slate-200 font-medium line-clamp-2">{mem.question}</div>
                    </div>

                    <div>
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">Candidate Answer:</div>
                      <div className="text-slate-300 italic bg-slate-900 p-2 rounded border border-slate-800/60 line-clamp-3">
                        "{mem.answer}"
                      </div>
                    </div>

                    {/* Extracted Intent Details */}
                    {mem.intent && (
                      <div className="pt-2 border-t border-slate-800/60 space-y-2">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-teal-400 font-semibold uppercase">Extracted Intent:</span>
                          <span className="px-2 py-0.5 rounded bg-teal-950 text-teal-300 border border-teal-800 font-mono">
                            Depth: {mem.intent.perceived_depth}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-300">
                          {mem.intent.key_intent}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {mem.intent.technical_concepts_mentioned.map((kw, i) => (
                            <span key={i} className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">
                              {kw}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer info */}
        <div className="pt-4 border-t border-slate-800 text-center text-[11px] text-slate-500">
          Breeth AI API v1 &bull; Episode Memory & Intent Layer
        </div>
      </div>
    </div>
  );
};
