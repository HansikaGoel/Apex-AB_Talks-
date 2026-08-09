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

  // Automated Re-initialization Effect on Question / Turn Step Change
  useEffect(() => {
    if (!hasStarted || isCompleted) return;

    // Clear candidate input for new question turn
    setInputText('');

    // If candidate enabled microphone, re-initialize recognition for Question 2+
    if (isMicEnabledRef.current && !loading && !isAISpeakingRef.current) {
      const restartMic = async () => {
        try {
          if (recognitionRef.current) {
            try { recognitionRef.current.stop(); } catch (e) {}
          }
          await startAudioCapture();
        } catch (err) {
          console.error("Failed to re-initialize microphone on turn change:", err);
        }
      };

      const timer = setTimeout(() => {
        restartMic();
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [currentStep]);

  // Robust Text-to-Speech (TTS) Function Implementation
  const speakText = (text: string, onComplete?: () => void) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      if (onComplete) onComplete();
      return;
    }
    
    // 1. Pause microphone to prevent hearing TTS output
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
    }

    // 2. Cancel any ongoing or pending speech
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

      // 3. Automatically resume Candidate Mic 500ms AFTER AI finishes speaking
      if (isMicEnabledRef.current && !loading && !isCompleted) {
        setTimeout(() => {
          startAudioCapture();
        }, 500);
      }

      if (onComplete) onComplete();
    };
    
    // Pick an English voice if available
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => v.lang.startsWith('en') || v.lang.includes('US') || v.lang.includes('GB')) || voices[0];
    if (preferredVoice) utterance.voice = preferredVoice;

    window.speechSynthesis.speak(utterance);
  };

  // Real-Time Speech Input Streaming Setup
  const startAudioCapture = async () => {
    if (isAISpeakingRef.current) return; // Block mic while AI speaks

    setMicError(null);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setMicStream(stream);
      }

      const SpeechRecognition = typeof window !== 'undefined' &&
        ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);

      if (SpeechRecognition) {
        if (recognitionRef.current) {
          try { recognitionRef.current.stop(); } catch (e) {}
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

        // Live speech result accumulator pattern: handles final + interim speech streaming
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
          console.warn('Speech recognition notice:', event.error);
          if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
            setMicError('Microphone permission was denied. Please check your browser microphone settings.');
            setIsRecording(false);
            isRecordingRef.current = false;
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
            try {
              recognition.start();
            } catch (err) {
              console.warn('Could not auto-restart speech recognition:', err);
            }
          } else {
            setIsRecording(false);
          }
        };

        recognitionRef.current = recognition;
        recognition.start();
        isMicEnabledRef.current = true;
      } else {
        // Fallback simulation if SpeechRecognition Web API is unsupported
        setIsRecording(true);
        isRecordingRef.current = true;
        isMicEnabledRef.current = true;
        const sampleVoiceTranscripts = [
          "I prioritize dense vector search using HNSW indexing with m=16 and ef_construction=200 for low latency QPS.",
          "For prompt engineering, I implement strict CoT schemas and wrap user inputs in xml delimiters to block prompt injection.",
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
      isMicEnabledRef.current = false;
    }
  };

  // Comprehensive Audio Reset & Stack Tear-Down Routine
  const purgeAudioStack = () => {
    // 1. Cancel SpeechSynthesis
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    // 2. Abort SpeechRecognition & remove event listeners
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.abort();
      } catch (e) {}
      recognitionRef.current = null;
    }

    // 3. Stop active media stream tracks
    if (micStream) {
      micStream.getTracks().forEach(t => t.stop());
      setMicStream(null);
    }

    // 4. Reset audio state flags
    isAISpeakingRef.current = false;
    isMicEnabledRef.current = false;
    isRecordingRef.current = false;
    setIsAISpeaking(false);
    setIsRecording(false);
  };

  // Component unmount cleanup
  useEffect(() => {
    return () => {
      purgeAudioStack();
    };
  }, []);

  const stopAudioCapture = () => {
    purgeAudioStack();
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopAudioCapture();
    } else {
      startAudioCapture();
    }
  };

  // Explicit End Interview Handler with Confirmation
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
          message: 'Candidate requested to conclude evaluation early.',
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

  // Unblock Audio & Launch Interview on Direct Click Gesture
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
    <div className="h-screen w-screen overflow-hidden flex flex-col justify-between p-3 sm:p-4 bg-slate-950 gap-3 text-slate-100 font-sans select-none">
      {/* Entry Modal Overlay for User-Gesture Mic Activation & Speech Unlock */}
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

      {/* Top Profile Header Card (Fixed Height ~20%) */}
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

        {/* Header Controls & Active Timer Badge */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end text-xs">
          {/* 5-Minute Per-Question Countdown Timer Badge */}
          <div className={`px-3 py-1 rounded-xl border flex items-center gap-1.5 font-mono text-xs font-bold transition-all shadow-sm ${
            timeLeft < 60
              ? 'bg-rose-950/80 text-rose-400 border-rose-800 animate-pulse'
              : 'bg-slate-950 border-slate-800 text-teal-300'
          }`}>
            <Clock className={`w-3.5 h-3.5 ${timeLeft < 60 ? 'text-rose-400' : 'text-teal-400'}`} />
            <span>{formatTime(timeLeft)}</span>
          </div>

          {/* Persona Selector */}
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

          {/* Voice Speed Toggle */}
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

          {/* Speech Synthesis Mute Toggle */}
          <button
            onClick={() => setSpeechEnabled(!speechEnabled)}
            className={`p-1.5 rounded-xl border transition-colors cursor-pointer ${
              speechEnabled
                ? 'bg-teal-950 text-teal-400 border-teal-800'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
            title={speechEnabled ? 'Disable Agent Speech Read-Aloud' : 'Enable Agent Speech Read-Aloud'}
          >
            {speechEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>

          {/* Breeth AI Inspector Button */}
          <button
            onClick={() => setIsMemoryOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-teal-950 to-slate-900 hover:from-teal-900 border border-teal-700/50 text-teal-300 font-semibold shadow-lg transition-all cursor-pointer text-xs"
          >
            <Brain className="w-3.5 h-3.5 text-teal-400 animate-pulse" />
            <span>Breeth AI</span>
            {recalledMemories.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-teal-500 text-slate-950 font-mono text-[10px] font-bold">
                {recalledMemories.length}
              </span>
            )}
          </button>

          {/* Prominent End Interview Button */}
          <button
            onClick={handleEndInterview}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-950/80 hover:bg-rose-900 border border-rose-800 text-rose-300 font-bold shadow-lg transition-all cursor-pointer text-xs"
            title="Conclude Interview & View Final Evaluation Report"
          >
            <Power className="w-3.5 h-3.5 text-rose-400" />
            <span>End Interview</span>
          </button>
        </div>
      </div>

      {/* Permission Error Banner */}
      {micError && (
        <div className="shrink-0 bg-rose-950/60 border border-rose-800/80 rounded-xl p-2 px-3 text-xs text-rose-300 flex items-center justify-between gap-3 animate-fadeIn my-1">
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
      <div className="shrink-0 my-1">
        <TopicCoverageBar
          currentStep={currentStep}
          totalSteps={totalSteps}
          coveredTopics={coveredTopics}
        />
      </div>

      {/* Middle Question & Chat Timeline (Flex Growing Area - ONLY this section scrolls) */}
      <div className="flex-1 min-h-0 bg-slate-900/60 border border-slate-800 rounded-xl p-4 overflow-y-auto space-y-4 shadow-inner flex flex-col justify-between">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 max-w-3xl ${
              msg.sender === 'candidate' ? 'ml-auto flex-row-reverse' : 'mr-auto'
            }`}
          >
            {/* Avatar Icon */}
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${
                msg.sender === 'agent'
                  ? 'bg-teal-950 border-teal-500 text-teal-400'
                  : 'bg-slate-800 border-slate-700 text-slate-200'
              }`}
            >
              {msg.sender === 'agent' ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
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
                className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
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
          <div className="flex items-center gap-3 text-xs text-teal-400 font-medium p-3 rounded-2xl bg-slate-900/60 border border-slate-800 w-fit animate-pulse">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Breeth AI Memory & Intent Querying...</span>
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* Fixed Bottom Answer Input Box & Audio Controls */}
      <form onSubmit={handleSendMessage} className="shrink-0 bg-slate-900 border border-slate-800 rounded-2xl p-2.5 shadow-xl space-y-2">
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
            className={`p-2.5 rounded-xl transition-all cursor-pointer ${
              isRecording
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500 animate-pulse'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
            }`}
            title={isRecording ? 'Stop Voice Recording' : 'Start Audio Microphone Recording'}
          >
            {isRecording ? <Radio className="w-4 h-4 text-rose-400" /> : <Mic className="w-4 h-4" />}
          </button>

          {/* Text Input Area */}
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={isRecording ? 'Listening... Speak your answer into microphone...' : 'Type candidate technical answer here...'}
            disabled={loading || isCompleted}
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-colors disabled:opacity-50"
          />

          {/* Submit Button */}
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

      {/* Memory Drawer Side Panel */}
      <MemoryDrawer
        isOpen={isMemoryOpen}
        onClose={() => setIsMemoryOpen(false)}
        recalledMemories={recalledMemories}
        candidateName={candidateName}
      />

      {/* Final Evaluation Report Modal */}
      {isCompleted && feedback && (
        <FeedbackModal
          isOpen={isCompleted}
          candidate={candidate}
          feedback={feedback}
          onRestart={onBackToDashboard}
        />
      )}
    </div>
  );
};
