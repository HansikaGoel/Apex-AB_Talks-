'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, Brain, Cpu, ShieldCheck, ChevronRight, Zap } from 'lucide-react';

interface LandingSplashProps {
  onDismiss: () => void;
}

export const LandingSplash: React.FC<LandingSplashProps> = ({ onDismiss }) => {
  const [currentTextIdx, setCurrentTextIdx] = useState(0);
  const [fadeState, setFadeState] = useState(true);

  const loadingPhrases = [
    "Initializing Breeth AI Cognitive Engine...",
    "Loading Real-Time Conversational Memory...",
    "Synthesizing AI Technical Recruiter Persona...",
    "Calibrating Enterprise AI Cohort Curriculum Benchmark..."
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setFadeState(false);
      setTimeout(() => {
        setCurrentTextIdx((prev) => (prev + 1) % loadingPhrases.length);
        setFadeState(true);
      }, 300);
    }, 2800);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#07090e] text-slate-100 overflow-hidden select-none">
      {/* Background Ambient Glow Orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-teal-500/15 rounded-full blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 max-w-xl mx-auto px-6 text-center space-y-8 animate-fadeIn">
        {/* Animated Holographic Core */}
        <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-teal-500 to-emerald-400 opacity-20 blur-md animate-ping" />
          <div className="absolute inset-2 rounded-full border border-teal-500/40 animate-[spin_10s_linear_infinite]" />
          <div className="absolute inset-4 rounded-full border border-dashed border-emerald-400/60 animate-[spin_15s_linear_infinite_reverse]" />
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center text-slate-950 font-black text-2xl shadow-xl shadow-teal-500/30">
            <Brain className="w-9 h-9" />
          </div>
        </div>

        {/* Title & Tagline */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-400 text-xs font-semibold uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5" />
            ABTalks Hackathon 2026
          </div>

          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-100 bg-clip-text text-transparent bg-gradient-to-r from-slate-100 via-teal-100 to-emerald-300">
            The Interview Agent
          </h1>

          <p className="text-slate-400 text-sm md:text-base leading-relaxed max-w-md mx-auto">
            Autonomous multi-turn technical recruiter powered by <span className="text-teal-400 font-medium">Breeth AI Memory & Intent Layer</span>.
          </p>
        </div>

        {/* Cycling Loading Message Box */}
        <div className="h-14 flex items-center justify-center">
          <div
            className={`flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-slate-900/90 border border-slate-800 text-xs font-mono text-teal-400 transition-opacity duration-300 shadow-inner ${
              fadeState ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <Zap className="w-4 h-4 text-emerald-400 animate-bounce" />
            <span>{loadingPhrases[currentTextIdx]}</span>
          </div>
        </div>

        {/* Launch Experience Action Button */}
        <div className="pt-2">
          <button
            onClick={onDismiss}
            className="group relative inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-teal-500 via-emerald-500 to-teal-400 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-extrabold text-base shadow-xl shadow-teal-500/25 hover:shadow-teal-500/40 transition-all duration-300 cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <span>Launch Interview Agent</span>
            <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        {/* Feature Badges */}
        <div className="grid grid-cols-3 gap-3 pt-6 text-[11px] text-slate-500 border-t border-slate-900/80">
          <div className="flex items-center justify-center gap-1.5">
            <Brain className="w-3.5 h-3.5 text-teal-400" />
            <span>Breeth AI Memory</span>
          </div>
          <div className="flex items-center justify-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-emerald-400" />
            <span>8 Adaptive Turns</span>
          </div>
          <div className="flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
            <span>Structured Evaluation</span>
          </div>
        </div>
      </div>
    </div>
  );
};
