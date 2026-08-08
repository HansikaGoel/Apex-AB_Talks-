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
  Clock
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
}

export const LiveInterviewRoom: React.FC<LiveInterviewRoomProps> = ({
  candidate,
  onBackToDashboard,
}) => {
  const candidateId = candidate?.id || candidate?.member?.id || 'CAND-001';
  const candidateName = candidate?.name || candidate?.member?.name || 'Candidate';
  const candidateAvatar = candidate?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';
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

  // Hackathon Controls State: Persona & Speech Speed
  const [persona, setPersona] = useState<'Strict Tech Lead' | 'Encouraging Mentor'>('Strict Tech Lead');
  const [voiceSpeed, setVoiceSpeed] = useState<number>(1.0);
  const [speechEnabled, setSpeechEnabled] = useState<boolean>(true);

  // 5-Minute Per-Question Countdown Timer State (300 seconds)
  const [timeLeft, setTimeLeft] = useState<number>(300);

  // Audio / Mic State
  const [isRecording, setIsRecording] = useState(false);
  const [micStream, setMicStream] = useState<MediaStream | null>(null);
  const [micError, setMicError] = useState<string | null>(null);

  const chatBottomRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const isRecordingRef = useRef<boolean>(false);

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

  // Format seconds into MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 5-Minute Countdown Timer Hook with Auto-Advance Capability
  useEffect(() => {
    if (!hasStarted || loading || isCompleted) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Auto-advance turn when 5-minute timer expires
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

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Robust Text-to-Speech (TTS) Function Implementation
  const speakText = (text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    
    // Cancel any ongoing or pending speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = voiceSpeed;
    utterance.pitch = persona === 'Strict Tech Lead' ? 0.95 : 1.05;

    // Pause mic during AI playback and resume upon completion
    utterance.onstart = () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
    };

    utterance.onend = () => {
      if (isRecordingRef.current) {
        setTimeout(() => {
          startAudioCapture();
        }, 200);
      }
    };
    
    // Pick an English voice if available
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => v.lang.startsWith('en') || v.lang.includes('US') || v.lang.includes('GB')) || voices[0];
    if (preferredVoice) utterance.voice = preferredVoice;

    window.speechSynthesis.speak(utterance);
  };

  // Microphone Audio Capture Handler (User-Gesture Triggered)
  const startAudioCapture = async () => {
    if (isRecordingRef.current) return;
    setMicError(null);

    try {
      // 1. Direct user-gesture mic permission request
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setMicStream(stream);
      setIsRecording(true);
      isRecordingRef.current = true;

      // 2. Web Speech Recognition setup
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        if (recognitionRef.current) {
          try { recognitionRef.current.stop(); } catch (e) {}
        }
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.maxAlternatives = 1;
        recognition.lang = 'en-US';

        // Real-time transcript accumulator pattern
        recognition.onresult = (event: any) => {
          let interimTranscript = '';
          let finalTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript + ' ';
            } else {
              interimTranscript += event.results[i][0].transcript;
            }
          }

          setInputText((prev) => {
            const combined = (finalTranscript + interimTranscript).trim();
            return combined.length > 0 ? combined : prev;
          });
        };

        recognition.onend = () => {
          // Keep mic active on end while interview is active (prevents timeout on natural pauses)
          if (isRecordingRef.current) {
            try { recognition.start(); } catch (e) {}
          }
        };

        recognition.onerror = (e: any) => {
          console.warn('Speech recognition notice:', e.error);
        };

        recognition.start();
        recognitionRef.current = recognition;
      } else {
        // Fallback simulation text snippet if browser speech recognition is unequipped
        const sampleVoiceTranscripts = [
          "In high-scale vector databases, we tune HNSW graph parameters m and ef_construction to optimize search recall while controlling memory overhead.",
          "When designing ReAct loops, I implement strict iteration depth limits and fallback schema parsers to safeguard against infinite loops.",
          "Model Context Protocol (MCP) standardizes host-to-tool JSON-RPC transport over SSE or Stdio, decoupling client integration logic."
        ];
        const randomTranscript = sampleVoiceTranscripts[Math.floor(Math.random() * sampleVoiceTranscripts.length)];
        setTimeout(() => {
          setInputText(randomTranscript);
        }, 1500);
      }
    } catch (err: any) {
      console.warn('Microphone permission notice:', err);
      setMicError('Microphone access was denied or is blocked by browser media settings. You can type technical responses below.');
      setIsRecording(false);
      isRecordingRef.current = false;
    }
  };

  const stopAudioCapture = () => {
    isRecordingRef.current = false;
    setIsRecording(false);
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
      recognitionRef.current = null;
    }
    if (micStream) {
      micStream.getTracks().forEach(t => t.stop());
      setMicStream(null);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopAudioCapture();
    } else {
      startAudioCapture();
    }
  };

  // Initial load of first question
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

  // Handle explicit user gesture click to launch room, enable mic & speak opening question out loud
  const handleLaunchInterviewAndEnableMic = async () => {
    setHasStarted(true);
    setSpeechEnabled(true);

    // Unlock speechSynthesis context on direct click gesture
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    await startAudioCapture();

    // Immediately speak the opening question out loud
    if (messages.length > 0 && messages[0]?.text) {
      speakText(messages[0].text);
    }
  };

  // Submit Candidate Answer
  const handleSendMessage = async (e?: React.FormEvent, textOverride?: string) => {
    if (e && typeof e !== 'string' && 'preventDefault' in e) e.preventDefault();
    const userText = (textOverride || inputText).trim();
    if (!userText || loading || isCompleted) return;

    setInputText('');
    setTimeLeft(300);

    // Add candidate message to chat
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

      // Add agent response message
      const agentMsg: ChatMessage = {
        id: `msg_agent_${Date.now()}`,
        sender: 'agent',
        text: agentResponse,
        reasoning: data.follow_up_reasoning,
        timestamp: new Date().toLocaleTimeString(),
        domain: data.covered_topics?.[data.covered_topics.length - 1]
      };

      setMessages(prev => [...prev, agentMsg]);

      if (speechEnabled) speakText(agentResponse);

      if (data.interview_status === 'completed' || data.feedback || data.done) {
        setIsCompleted(true);
        setFeedback(data.feedback);
        stopAudioCapture();

        // Save session history for Candidate Analytics Dashboard (/dashboard)
        if (typeof window !== 'undefined') {
          try {
            const existingHistoryStr = localStorage.getItem('interview_history') || '[]';
            const existingHistory = JSON.parse(existingHistoryStr);
            const newRecord = {
              id: sessionId,
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
      } else {
        // Clean turn transition reset: clear input state and restart speech recognition for Turn 2, 3, etc.
        setInputText('');
        if (recognitionRef.current) {
          try { recognitionRef.current.stop(); } catch (e) {}
        }
        if (isRecordingRef.current) {
          setTimeout(() => {
            startAudioCapture();
          }, 300);
        }
      }
    } catch (err) {
      console.error('Failed to process interview turn:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full max-w-6xl mx-auto flex flex-col h-[calc(100vh-6rem)] animate-fadeIn space-y-4">
      {/* Entry Modal Overlay for User-Gesture Mic Activation & Speech Unlock */}
      {!hasStarted && (
        <div className="absolute inset-0 z-40 bg-black/85 backdrop-blur-md rounded-2xl flex flex-col items-center justify-center p-6 text-center space-y-6 animate-fadeIn">
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
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <button
            onClick={() => {
              stopAudioCapture();
              onBackToDashboard();
            }}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
            title="Back to Candidate Dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <img
            src={candidateAvatar}
            alt={candidateName}
            className="w-10 h-10 rounded-full object-cover border-2 border-teal-500"
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-slate-100 text-base">{candidateName}</h2>
              <span className="text-[10px] px-2 py-0.5 rounded bg-teal-950 text-teal-300 border border-teal-800 font-mono">
                {candidateRole}
              </span>
            </div>
            <p className="text-xs text-slate-400">Evaluating 31-Day AI Cohort Mastery</p>
          </div>
        </div>

        {/* Persona & Voice Speed Toggles + Breeth AI Inspector */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end text-xs">
          {/* 5-Minute Per-Question Countdown Timer Badge */}
          <div className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 font-mono text-xs font-bold transition-all shadow-sm ${
            timeLeft < 60
              ? 'bg-rose-950/80 text-rose-400 border-rose-800 animate-pulse'
              : 'bg-slate-950 border-slate-800 text-teal-300'
          }`}>
            <Clock className={`w-3.5 h-3.5 ${timeLeft < 60 ? 'text-rose-400' : 'text-teal-400'}`} />
            <span>{formatTime(timeLeft)}</span>
          </div>

          {/* Persona Selector */}
          <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-xl p-1">
            <button
              onClick={() => setPersona('Strict Tech Lead')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                persona === 'Strict Tech Lead' ? 'bg-teal-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Strict Lead
            </button>
            <button
              onClick={() => setPersona('Encouraging Mentor')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                persona === 'Encouraging Mentor' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Mentor
            </button>
          </div>

          {/* Voice Speed Toggle */}
          <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-xl p-1 font-mono">
            {[0.9, 1.0, 1.25].map((speed) => (
              <button
                key={speed}
                onClick={() => setVoiceSpeed(speed)}
                className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors cursor-pointer ${
                  voiceSpeed === speed ? 'bg-slate-800 text-teal-400 border border-teal-500/50' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {speed}x
              </button>
            ))}
          </div>

          {/* Speech Synthesis Mute Toggle */}
          <button
            onClick={() => setSpeechEnabled(!speechEnabled)}
            className={`p-2 rounded-xl border transition-colors cursor-pointer ${
              speechEnabled
                ? 'bg-teal-950 text-teal-400 border-teal-800'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
            title={speechEnabled ? 'Disable Agent Speech Read-Aloud' : 'Enable Agent Speech Read-Aloud'}
          >
            {speechEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Breeth AI Inspector Button */}
          <button
            onClick={() => setIsMemoryOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-teal-950 to-slate-900 hover:from-teal-900 border border-teal-700/50 text-teal-300 font-semibold shadow-lg transition-all cursor-pointer"
          >
            <Brain className="w-4 h-4 text-teal-400 animate-pulse" />
            <span>Breeth AI Inspector</span>
            {recalledMemories.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-teal-500 text-slate-950 font-mono text-[10px] font-bold">
                {recalledMemories.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Permission Error Banner */}
      {micError && (
        <div className="bg-rose-950/60 border border-rose-800/80 rounded-xl p-3 text-xs text-rose-300 flex items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{micError}</span>
          </div>
          <button onClick={() => setMicError(null)} className="text-rose-400 hover:text-rose-200 font-bold cursor-pointer">
            Dismiss
          </button>
        </div>
      )}

      {/* Progress Bar */}
      <TopicCoverageBar
        currentStep={currentStep}
        totalSteps={totalSteps}
        coveredTopics={coveredTopics}
      />

      {/* Chat Timeline */}
      <div className="flex-1 bg-slate-900/60 border border-slate-800 rounded-2xl p-4 md:p-6 overflow-y-auto space-y-4 shadow-inner">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 max-w-3xl ${
              msg.sender === 'candidate' ? 'ml-auto flex-row-reverse' : 'mr-auto'
            }`}
          >
            {/* Avatar Icon */}
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 border ${
                msg.sender === 'agent'
                  ? 'bg-teal-950 border-teal-500 text-teal-400'
                  : 'bg-slate-800 border-slate-700 text-slate-200'
              }`}
            >
              {msg.sender === 'agent' ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
            </div>

            {/* Bubble */}
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
                className={`p-4 rounded-2xl text-sm leading-relaxed ${
                  msg.sender === 'agent'
                    ? 'bg-slate-900 border border-slate-800 text-slate-200 shadow-md'
                    : 'bg-teal-600 text-slate-950 font-medium shadow-lg'
                }`}
              >
                {msg.text}
              </div>

              {/* Reasoning & Injected Memory Tag */}
              {msg.reasoning && (
                <div className="text-[11px] text-slate-400 bg-slate-950/60 border border-slate-800/80 rounded-xl p-2.5 space-y-1">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                    <span className="text-teal-400 font-semibold">Agent Reasoning: </span>
                    <span className="italic">{msg.reasoning}</span>
                  </div>
                  {recalledMemories.length > 0 && msg.sender === 'agent' && (
                    <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 pt-1 font-mono">
                      <Brain className="w-3 h-3" />
                      <span>Injected Breeth Memory Episode: "{recalledMemories[0].intent?.key_intent || recalledMemories[0].answer.slice(0, 40)}"</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-3 text-xs text-teal-400 font-medium p-4 rounded-2xl bg-slate-900/60 border border-slate-800 w-fit animate-pulse">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Breeth AI Memory & Intent Querying...</span>
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* Answer Input Box & Audio Controls */}
      <form onSubmit={handleSendMessage} className="relative bg-slate-900 border border-slate-800 rounded-2xl p-3 shadow-xl space-y-2">
        {/* Audio Recording Active Visualizer Bar */}
        {isRecording && (
          <div className="flex items-center justify-between px-2 pb-1 border-b border-slate-800">
            <AudioVisualizer isRecording={isRecording} audioStream={micStream} />
            <span className="text-[11px] text-teal-400 font-mono animate-pulse">Live Microphone Capturing...</span>
          </div>
        )}

        <div className="flex items-center gap-2">
          {/* Microphone Capture Button */}
          <button
            type="button"
            onClick={toggleRecording}
            className={`p-3 rounded-xl transition-all cursor-pointer ${
              isRecording
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500 animate-pulse'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
            }`}
            title={isRecording ? 'Stop Voice Recording' : 'Start Audio Microphone Recording'}
          >
            {isRecording ? <Radio className="w-5 h-5 text-rose-400" /> : <Mic className="w-5 h-5" />}
          </button>

          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={loading || isCompleted}
            placeholder={
              isRecording
                ? 'Listening to candidate voice input in real time...'
                : isCompleted
                ? 'Interview completed. View Feedback Report.'
                : 'Type detailed technical response or use voice input...'
            }
            className="flex-1 bg-transparent px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
          />

          <button
            type="submit"
            disabled={!inputText.trim() || loading || isCompleted}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-teal-500 hover:bg-teal-400 disabled:opacity-40 disabled:hover:bg-teal-500 text-slate-950 font-bold text-xs transition-all cursor-pointer shadow-lg shadow-teal-500/20"
          >
            <span>Send Response</span>
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>

      {/* Memory Inspector Drawer */}
      <MemoryDrawer
        isOpen={isMemoryOpen}
        onClose={() => setIsMemoryOpen(false)}
        recalledMemories={recalledMemories}
        followUpReasoning={latestReasoning}
        candidateName={candidateName}
      />

      {/* Evaluation Feedback Modal */}
      <FeedbackModal
        isOpen={isCompleted}
        candidate={candidate}
        feedback={feedback}
        onRestart={() => {
          stopAudioCapture();
          onBackToDashboard();
        }}
      />
    </div>
  );
};
