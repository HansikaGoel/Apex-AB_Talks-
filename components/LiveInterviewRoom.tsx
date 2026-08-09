'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Candidate, MemoryEpisode, InterviewFeedback } from '@/lib/types';
import { TopicCoverageBar } from './TopicCoverageBar';
import { MemoryDrawer } from './MemoryDrawer';
import { FeedbackModal } from './FeedbackModal';
import { AudioVisualizer } from './AudioVisualizer';
import {
  Send,
  Brain,
  Mic,
  MicOff,
  Sparkles,
  ArrowLeft,
  Bot,
  User,
  Loader2,
  Volume2,
  VolumeX,
  AlertTriangle,
  Play,
  CheckCircle2,
  Sliders,
  Radio,
  FileText,
  Clock,
  Power
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'agent' | 'candidate';
  text: string;
  reasoning?: string;
  timestamp: string;
  domain?: string;
}

interface LiveInterviewRoomProps {
  candidate: Candidate;
  onBackToDashboard: () => void;
  onNavigateToConfig?: () => void;
}

export const LiveInterviewRoom: React.FC<LiveInterviewRoomProps> = ({
  candidate,
  onBackToDashboard,
  onNavigateToConfig,
}) => {
  const candidateId = candidate?.id || candidate?.member?.id || 'CAND-001';
  const candidateName = candidate?.name || candidate?.member?.name || 'Candidate';
  const candidateAvatar = candidate?.avatar || candidate?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';
  const candidateRole = candidate?.target_role || candidate?.member?.jobRole || 'AI Engineer';

  const [hasStarted, setHasStarted] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 8;
  const [coveredTopics, setCoveredTopics] = useState<string[]>(['Prompt Engineering']);
  const [recalledMemories, setRecalledMemories] = useState<MemoryEpisode[]>([]);
  const [latestReasoning, setLatestReasoning] = useState<string>('');
  const [isMemoryOpen, setIsMemoryOpen] = useState(false);
  const [feedback, setFeedback] = useState<InterviewFeedback | undefined>();
  const [isCompleted, setIsCompleted] = useState(false);
  const [sessionId] = useState(`session_${candidateId}_${Date.now()}`);

  // Controls State
  const [persona, setPersona] = useState<'Strict Tech Lead' | 'Encouraging Mentor'>('Strict Tech Lead');
  const [voiceSpeed, setVoiceSpeed] = useState<number>(1.0);
  const [speechEnabled, setSpeechEnabled] = useState<boolean>(true);

  // 5-Minute Timer State
  const [timeLeft, setTimeLeft] = useState<number>(300);

  // Audio / Mic State
  const [isRecording, setIsRecording] = useState(false);
  const [micStream, setMicStream] = useState<MediaStream | null>(null);
  const [micError, setMicError] = useState<string | null>(null);

  const chatBottomRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const isRecordingRef = useRef<boolean>(false);
  const isMicEnabledRef = useRef<boolean>(false);
  const isAISpeakingRef = useRef<boolean>(false);
  const [isAISpeaking, setIsAISpeaking] = useState<boolean>(false);

  // Sync ref
  useEffect(() => {
    isRecordingRef.current = isRecording;
  }, [isRecording]);

  // Pre-load Web Speech Synthesis voices
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
    }
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 5-Minute Timer Hook
  useEffect(() => {
    if (!hasStarted || loading || isCompleted) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setTimeout(() => {
            handleTimeExpired();
          }, 0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [hasStarted, loading, isCompleted, currentStep]);

  const handleTimeExpired = () => {
    if (loading || isCompleted) return;
    const currentInput = inputText.trim();
    const textToSubmit = currentInput.length > 0 ? currentInput : 'Candidate did not provide an answer within the 5-minute time limit.';
    handleSendMessage(undefined, textToSubmit);
    setTimeLeft(300);
  };

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // --- STRICT AUDIO TEARDOWN ---
  const purgeAudioStack = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.stop();
        recognitionRef.current.abort();
      } catch (e) {}
      recognitionRef.current = null;
    }

    if (micStream) {
      micStream.getTracks().forEach(t => t.stop());
      setMicStream(null);
    }

    isAISpeakingRef.current = false;
    isMicEnabledRef.current = false;
    isRecordingRef.current = false;
    setIsAISpeaking(false);
    setIsRecording(false);
  };

  useEffect(() => {
    return () => purgeAudioStack();
  }, []);

  // --- INTERVIEWEE MIC START ---
  const startAudioCapture = async () => {
    if (isAISpeakingRef.current) return;

    setMicError(null);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia && !micStream) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setMicStream(stream);
      }

      const SpeechRecognition = typeof window !== 'undefined' &&
        ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);

      if (SpeechRecognition) {
        // Stop any old instance before creating a new one
        if (recognitionRef.current) {
          try {
            recognitionRef.current.onresult = null;
            recognitionRef.current.onerror = null;
            recognitionRef.current.onend = null;
            recognitionRef.current.stop();
            recognitionRef.current.abort();
          } catch (e) {}
          recognitionRef.current = null;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
          setIsRecording(true);
          isRecordingRef.current = true;
          isMicEnabledRef.current = true;
        };

        recognition.onresult = (event: any) => {
          let currentTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript;
          }
          if (currentTranscript.trim()) {
            setInputText(currentTranscript.trim());
          }
        };

        recognition.onerror = (event: any) => {
          if (event.error === 'not-allowed') {
            setMicError('Microphone access denied. Please enable mic permissions.');
            setIsRecording(false);
            isMicEnabledRef.current = false;
          } else if (event.error === 'no-speech') {
            if (!isAISpeakingRef.current && isMicEnabledRef.current && !loading && !isCompleted) {
              setTimeout(() => {
                try { recognition.start(); } catch (e) {}
              }, 300);
            }
          }
        };

        recognition.onend = () => {
          if (isMicEnabledRef.current && !isAISpeakingRef.current && !loading && !isCompleted) {
            try { recognition.start(); } catch (e) {}
          } else {
            setIsRecording(false);
          }
        };

        recognitionRef.current = recognition;
        recognition.start();
        isMicEnabledRef.current = true;
      }
    } catch (err: any) {
      setMicError('Microphone access was denied or unavailable.');
      setIsRecording(false);
      isMicEnabledRef.current = false;
    }
  };

  // --- INTERVIEWER SPEECH (TTS) WITH 500MS HARDWARE RELEASE BUFFER ---
  const speakText = (text: string, onComplete?: () => void) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      if (onComplete) onComplete();
      return;
    }

    // Lock interviewee mic while interviewer speaks
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.stop();
        recognitionRef.current.abort();
      } catch (e) {}
      recognitionRef.current = null;
    }
    setIsRecording(false);

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = voiceSpeed;
    utterance.pitch = persona === 'Strict Tech Lead' ? 0.95 : 1.05;

    utterance.onstart = () => {
      isAISpeakingRef.current = true;
      setIsAISpeaking(true);
    };

    utterance.onend = utterance.onerror = () => {
      isAISpeakingRef.current = false;
      setIsAISpeaking(false);

      // Essential: 500ms hardware release buffer before starting Candidate Mic
      if (isMicEnabledRef.current && !loading && !isCompleted) {
        setTimeout(() => {
          if (!isAISpeakingRef.current) {
            startAudioCapture();
          }
        }, 500);
      }

      if (onComplete) onComplete();
    };

    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => v.lang.startsWith('en') || v.lang.includes('US')) || voices[0];
    if (preferredVoice) utterance.voice = preferredVoice;

    window.speechSynthesis.speak(utterance);
  };

  const toggleRecording = () => {
    if (isRecording) {
      purgeAudioStack();
    } else {
      startAudioCapture();
    }
  };

  // --- END INTERVIEW AND REDIRECT ---
  const handleEndInterview = async () => {
    if (typeof window !== 'undefined' && !window.confirm("Are you sure you want to end this technical evaluation session?")) {
      return;
    }

    purgeAudioStack();
    setLoading(true);
    try {
      const res = await fetch('/api/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidate_id: candidateId,
          session_id: sessionId,
          message: 'Candidate concluded evaluation.',
          done: true,
          persona
        })
      });
      const data = await res.json();
      setIsCompleted(true);
      if (data.feedback) setFeedback(data.feedback);
    } catch (err) {
      console.error('Failed to conclude interview early:', err);
      setIsCompleted(true);
    } finally {
      setLoading(false);
    }
  };

  // Handle modal close / restart redirect
  const handleModalClose = () => {
    purgeAudioStack();
    if (onNavigateToConfig) {
      onNavigateToConfig();
    } else if (onBackToDashboard) {
      onBackToDashboard();
    } else {
      window.location.href = '/?step=setup';
    }
  };

  // Initial load
  useEffect(() => {
    async function loadFirstQuestion() {
      setLoading(true);
      try {
        const res = await fetch('/api/interview', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            candidate_id: candidateId,
            session_id: sessionId,
            message: '',
            persona
          })
        });
        const data = await res.json();
        const firstMsg = data.next_question || `Welcome ${candidateName}. Let us begin evaluating your track.`;
        setMessages([
          {
            id: `msg_${Date.now()}`,
            sender: 'agent',
            text: firstMsg,
            reasoning: data.follow_up_reasoning,
            timestamp: new Date().toLocaleTimeString(),
            domain: data.covered_topics?.[0] || 'Prompt Engineering & Security'
          }
        ]);
        setLatestReasoning(data.follow_up_reasoning || '');
        if (data.covered_topics) setCoveredTopics(data.covered_topics);
      } catch (err) {
        console.error('Failed to load initial interview question:', err);
      } finally {
        setLoading(false);
      }
    }
    loadFirstQuestion();
  }, [candidateId, sessionId, persona]);

  const handleLaunchInterviewAndEnableMic = async () => {
    setHasStarted(true);
    setSpeechEnabled(true);

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    if (messages.length > 0 && messages[0]?.text) {
      speakText(messages[0].text);
    } else {
      await startAudioCapture();
    }
  };

  const handleSendMessage = async (e?: React.FormEvent, textOverride?: string) => {
    if (e && typeof e !== 'string' && 'preventDefault' in e) e.preventDefault();
    const userText = (textOverride || inputText).trim();
    if (!userText || loading || isCompleted) return;

    // Stop mic while awaiting agent response
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.stop();
        recognitionRef.current.abort();
      } catch (err) {}
      recognitionRef.current = null;
    }
    setIsRecording(false);

    setInputText('');
    setTimeLeft(300);

    const userMsg: ChatMessage = {
      id: `msg_cand_${Date.now()}`,
      sender: 'candidate',
      text: userText,
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await fetch('/api/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidate_id: candidateId,
          session_id: sessionId,
          message: userText,
          persona
        })
      });

      const data = await res.json();

      setCurrentStep(data.current_step || currentStep + 1);
      if (data.covered_topics) setCoveredTopics(data.covered_topics);
      if (data.recalled_memories) setRecalledMemories(data.recalled_memories);
      if (data.follow_up_reasoning) setLatestReasoning(data.follow_up_reasoning);

      const agentResponse = data.next_question || 'Thank you for your response.';

      const agentMsg: ChatMessage = {
        id: `msg_agent_${Date.now()}`,
        sender: 'agent',
        text: agentResponse,
        reasoning: data.follow_up_reasoning,
        timestamp: new Date().toLocaleTimeString(),
        domain: data.covered_topics?.[data.covered_topics.length - 1]
      };

      setMessages(prev => [...prev, agentMsg]);

      if (speechEnabled) {
        speakText(agentResponse);
      } else {
        setTimeout(() => startAudioCapture(), 500);
      }

      if (data.interview_status === 'completed' || data.feedback || data.done) {
        setIsCompleted(true);
        setFeedback(data.feedback);
        purgeAudioStack();

        if (typeof window !== 'undefined') {
          try {
            const existingHistoryStr = localStorage.getItem('interview_history') || '[]';
            const existingHistory = JSON.parse(existingHistoryStr);
            const newRecord = {
              id: sessionId,
              candidateId,
              date: new Date().toLocaleDateString(),
              candidateName,
              candidateRole,
              scores: data.feedback?.scores || {
                technical_accuracy: 75,
                communication: 75,
                problem_solving: 75,
                confidence: 75
              },
              hiring_recommendation: data.feedback?.hiring_recommendation || 'Hire',
              strengths: data.feedback?.strengths || [],
              weaknesses: data.feedback?.gaps || data.feedback?.weaknesses || [],
              summary: data.feedback?.summary || 'Assessment completed.'
            };
            localStorage.setItem('interview_history', JSON.stringify([newRecord, ...existingHistory]));
          } catch (e) {
            console.warn('Failed to save session history to localStorage:', e);
          }
        }
      }
    } catch (err) {
      console.error('Failed to process interview turn:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col justify-between p-3 sm:p-4 bg-slate-950 gap-3 text-slate-100 font-sans select-none">
      {!hasStarted && (
        <div className="fixed inset-0 z-40 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center space-y-6 animate-fadeIn">
          <div className="w-16 h-16 rounded-full bg-teal-950 border-2 border-teal-500 flex items-center justify-center text-teal-400 shadow-xl shadow-teal-500/20">
            <Mic className="w-8 h-8 animate-pulse" />
          </div>
          <div className="space-y-2 max-w-md">
            <h3 className="text-2xl font-extrabold text-slate-100">Ready for Technical Evaluation?</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Target Candidate: <span className="font-semibold text-slate-200">{candidateName}</span> ({candidateRole}).
              Click below to unlock AI voice playback, grant microphone access, and launch the real-time session.
            </p>
          </div>
          <button
            onClick={handleLaunchInterviewAndEnableMic}
            className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-400 text-slate-950 font-extrabold text-sm shadow-xl shadow-teal-500/30 hover:scale-105 transition-all cursor-pointer"
          >
            <Play className="w-5 h-5 fill-slate-950" />
            <span>Begin Interview & Enable Microphone</span>
          </button>
        </div>
      )}

      {/* Top Header Card */}
      <div className="shrink-0 bg-slate-900/90 border border-slate-800 rounded-2xl p-3 py-2.5 flex flex-col md:flex-row items-center justify-between gap-3 shadow-xl">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={() => {
              purgeAudioStack();
              onBackToDashboard();
            }}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
            title="Back to Candidate Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <img
            src={candidateAvatar}
            alt={candidateName}
            className="w-9 h-9 rounded-full object-cover border-2 border-teal-500 shrink-0"
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-slate-100 text-sm">{candidateName}</h2>
              <span className="text-[10px] px-2 py-0.5 rounded bg-teal-950 text-teal-300 border border-teal-800 font-mono">
                {candidateRole}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Evaluating 31-Day AI Cohort Mastery</p>
          </div>
        </div>

        {/* Controls Row */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end text-xs">
          <div className={`px-3 py-1 rounded-xl border flex items-center gap-1.5 font-mono text-xs font-bold transition-all shadow-sm ${
            timeLeft < 60
              ? 'bg-rose-950/80 text-rose-400 border-rose-800 animate-pulse'
              : 'bg-slate-950 border-slate-800 text-teal-300'
          }`}>
            <Clock className={`w-3.5 h-3.5 ${timeLeft < 60 ? 'text-rose-400' : 'text-teal-400'}`} />
            <span>{formatTime(timeLeft)}</span>
          </div>

          <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-xl p-1">
            <button
              onClick={() => setPersona('Strict Tech Lead')}
              className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold transition-all cursor-pointer ${
                persona === 'Strict Tech Lead' ? 'bg-teal-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Strict Lead
            </button>
            <button
              onClick={() => setPersona('Encouraging Mentor')}
              className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold transition-all cursor-pointer ${
                persona === 'Encouraging Mentor' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Mentor
            </button>
          </div>

          <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-xl p-1 font-mono">
            {[0.9, 1.0, 1.25].map((speed) => (
              <button
                key={speed}
                onClick={() => setVoiceSpeed(speed)}
                className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition-colors cursor-pointer ${
                  voiceSpeed === speed ? 'bg-slate-800 text-teal-400 border border-teal-500/50' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {speed}x
              </button>
            ))}
          </div>

          <button
            onClick={() => setSpeechEnabled(!speechEnabled)}
            className={`p-1.5 rounded-xl border transition-colors cursor-pointer ${
              speechEnabled
                ? 'bg-teal-950 text-teal-400 border-teal-800'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
          >
            {speechEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={() => setIsMemoryOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-teal-950 to-slate-900 border border-teal-700/50 text-teal-300 font-semibold shadow-lg transition-all cursor-pointer text-xs"
          >
            <Brain className="w-3.5 h-3.5 text-teal-400 animate-pulse" />
            <span>Breeth AI</span>
            {recalledMemories.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-teal-500 text-slate-950 font-mono text-[10px] font-bold">
                {recalledMemories.length}
              </span>
            )}
          </button>

          <button
            onClick={handleEndInterview}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-950/80 hover:bg-rose-900 border border-rose-800 text-rose-300 font-bold shadow-lg transition-all cursor-pointer text-xs"
          >
            <Power className="w-3.5 h-3.5 text-rose-400" />
            <span>End Interview</span>
          </button>
        </div>
      </div>

      {micError && (
        <div className="shrink-0 bg-rose-950/60 border border-rose-800/80 rounded-xl p-2 px-3 text-xs text-rose-300 flex items-center justify-between gap-3 animate-fadeIn my-1">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{micError}</span>
          </div>
          <button onClick={() => setMicError(null)} className="text-rose-400 font-bold cursor-pointer">
            Dismiss
          </button>
        </div>
      )}

      <div className="shrink-0 my-1">
        <TopicCoverageBar
          currentStep={currentStep}
          totalSteps={totalSteps}
          coveredTopics={coveredTopics}
        />
      </div>

      {/* Scrolling Chat Timeline */}
      <div className="flex-1 min-h-0 bg-slate-900/60 border border-slate-800 rounded-xl p-4 overflow-y-auto space-y-4 shadow-inner flex flex-col justify-between">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 max-w-3xl ${
              msg.sender === 'candidate' ? 'ml-auto flex-row-reverse' : 'mr-auto'
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${
                msg.sender === 'agent'
                  ? 'bg-teal-950 border-teal-500 text-teal-400'
                  : 'bg-slate-800 border-slate-700 text-slate-200'
              }`}
            >
              {msg.sender === 'agent' ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-[11px] text-slate-500 px-1">
                <span className="font-semibold text-slate-300">
                  {msg.sender === 'agent' ? `Dr. Aris Thorne (${persona})` : candidateName}
                </span>
                <span>&bull;</span>
                <span>{msg.timestamp}</span>
                {msg.domain && (
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-teal-400 text-[10px] font-mono">
                    {msg.domain}
                  </span>
                )}
              </div>

              <div
                className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                  msg.sender === 'agent'
                    ? 'bg-slate-900 border border-slate-800 text-slate-200 shadow-md'
                    : 'bg-teal-600 text-slate-950 font-medium shadow-lg'
                }`}
              >
                {msg.text}
              </div>

              {msg.reasoning && (
                <div className="text-[11px] text-slate-400 bg-slate-950/60 border border-slate-800/80 rounded-xl p-2.5 space-y-1">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                    <span className="text-teal-400 font-semibold">Agent Reasoning: </span>
                    <span className="italic">{msg.reasoning}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-3 text-xs text-teal-400 font-medium p-3 rounded-2xl bg-slate-900/60 border border-slate-800 w-fit animate-pulse">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Breeth AI Memory & Intent Querying...</span>
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* Answer Input Box */}
      <form onSubmit={handleSendMessage} className="shrink-0 bg-slate-900 border border-slate-800 rounded-2xl p-2.5 shadow-xl space-y-2">
        {isRecording && (
          <div className="flex items-center justify-between px-2 pb-1 border-b border-slate-800">
            <AudioVisualizer isRecording={isRecording} audioStream={micStream} />
            <span className="text-[11px] text-teal-400 font-mono animate-pulse">Live Microphone Capturing...</span>
          </div>
        )}

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleRecording}
            className={`p-2.5 rounded-xl transition-all cursor-pointer ${
              isRecording
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500 animate-pulse'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
            }`}
          >
            {isRecording ? <Radio className="w-4 h-4 text-rose-400" /> : <Mic className="w-4 h-4" />}
          </button>

          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={isRecording ? 'Listening... Speak your answer into microphone...' : 'Type candidate technical answer here...'}
            disabled={loading || isCompleted}
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-colors disabled:opacity-50"
          />

          <button
            type="submit"
            disabled={!inputText.trim() || loading || isCompleted}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 disabled:bg-slate-800 text-slate-950 disabled:text-slate-500 font-bold text-xs shadow-lg transition-all cursor-pointer disabled:cursor-not-allowed"
          >
            <span>Submit</span>
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>

      <MemoryDrawer
        isOpen={isMemoryOpen}
        onClose={() => setIsMemoryOpen(false)}
        recalledMemories={recalledMemories}
        candidateName={candidateName}
      />

      {isCompleted && feedback && (
        <FeedbackModal
          isOpen={isCompleted}
          candidate={candidate}
          feedback={feedback}
          onRestart={handleModalClose}
        />
      )}
    </div>
  );
};