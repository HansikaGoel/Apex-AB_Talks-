'use client';

import React, { useState, useEffect } from 'react';
import { Candidate } from '@/lib/types';
import { CandidateDashboard } from '@/components/CandidateDashboard';
import { LiveInterviewRoom } from '@/components/LiveInterviewRoom';
import { LandingSplash } from '@/components/LandingSplash';
import { Loader2 } from 'lucide-react';

export default function Home() {
  const [showSplash, setShowSplash] = useState(true);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [viewState, setViewState] = useState<'dashboard' | 'interview'>('dashboard');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCandidates() {
      try {
        const res = await fetch('/api/candidates');
        const data = await res.json();
        const list: Candidate[] = Array.isArray(data) ? data : (data?.candidates || []);
        setCandidates(list);
        if (list.length > 0) {
          setSelectedCandidate(list[0]);
        }
      } catch (err) {
        console.error('Failed to load candidate profiles:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchCandidates();
  }, []);

  if (showSplash) {
    return <LandingSplash onDismiss={() => setShowSplash(false)} />;
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="w-8 h-8 text-teal-400 animate-spin" />
        <p className="text-xs text-slate-400 font-mono">Initializing The Interview Agent & Breeth AI Memory Layer...</p>
      </div>
    );
  }

  return (
    <div className="w-full animate-fadeIn">
      {viewState === 'dashboard' ? (
        <CandidateDashboard
          candidates={candidates}
          selectedCandidateId={selectedCandidate?.id || selectedCandidate?.member?.id || null}
          onSelectCandidate={(cand) => setSelectedCandidate(cand)}
          onStartInterview={() => setViewState('interview')}
        />
      ) : (
        selectedCandidate && (
          <LiveInterviewRoom
            candidate={selectedCandidate}
            onBackToDashboard={() => setViewState('dashboard')}
          />
        )
      )}
    </div>
  );
}
