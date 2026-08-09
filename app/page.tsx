'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Candidate } from '@/lib/types';
import { CandidateDashboard } from '@/components/CandidateDashboard';
import { CandidateSetup } from '@/components/CandidateSetup';
import { LiveInterviewRoom } from '@/components/LiveInterviewRoom';
import { LandingSplash } from '@/components/LandingSplash';
import { Loader2 } from 'lucide-react';

function PageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Default step based on URL query param: '?step=setup' -> 1, default -> 0
  const urlStep = searchParams.get('step');
  const initialStep = urlStep === 'setup' || urlStep === '1' || urlStep === 'candidates' ? 1 : 0;

  const [currentStep, setCurrentStep] = useState<number>(initialStep);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(true);

  // Synchronize URL search params with active step state
  useEffect(() => {
    if (urlStep === 'setup' || urlStep === '1' || urlStep === 'candidates') {
      setCurrentStep(1);
    } else if (urlStep === 'landing' || urlStep === '0') {
      setCurrentStep(0);
    }
  }, [urlStep]);

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

  // Step 0: Hero Landing Splash
  if (currentStep === 0) {
    return <LandingSplash onDismiss={() => setCurrentStep(1)} />;
  }

  if (loading) {
    return (
      <main className="h-screen w-screen overflow-hidden flex flex-col items-center justify-center m-0 p-0 bg-slate-950">
        <Loader2 className="w-8 h-8 text-teal-400 animate-spin" />
        <p className="text-xs text-slate-400 font-mono mt-4">Initializing The Interview Agent & Breeth AI Memory Layer...</p>
      </main>
    );
  }

  return (
    <main className="h-screen w-screen overflow-hidden flex flex-col m-0 p-0 bg-slate-950">
      {currentStep === 1 ? (
        <div className="w-full h-full overflow-y-auto p-4 md:p-6">
          <CandidateSetup
            candidates={candidates}
            selectedCandidateId={selectedCandidate?.id || selectedCandidate?.member?.id || null}
            onSelectCandidate={(cand) => setSelectedCandidate(cand)}
            onLaunchInterview={(customCand) => {
              if (customCand) setSelectedCandidate(customCand);
              setCurrentStep(2);
            }}
          />
        </div>
      ) : (
        selectedCandidate && (
          <LiveInterviewRoom
            candidate={selectedCandidate}
            onBackToDashboard={() => setCurrentStep(1)}
          />
        )
      )}
    </main>
  );
}

export default function Home() {
  return (
    <Suspense
      fallback={
        <main className="h-screen w-screen overflow-hidden flex flex-col items-center justify-center m-0 p-0 bg-slate-950">
          <Loader2 className="w-8 h-8 text-teal-400 animate-spin" />
          <p className="text-xs text-slate-400 font-mono mt-4">Loading Page...</p>
        </main>
      }
    >
      <PageContent />
    </Suspense>
  );
}
