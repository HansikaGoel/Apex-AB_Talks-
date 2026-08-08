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
  CheckCircle2,
  Sliders,
  Radio,
  FileText
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
  const [speechEnabled, setSpeechEnabled] = useState<boolean>(false);

  // Audio / Mic State
  const [isRecording, setIsRecording] = useState(false);
  const [micStream, setMicStream] = useState<MediaStream | null>(null);
  const [micError, setMicError] = useState<string | null>(null);

  const chatBottomRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

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
        const firstMsg = data.next_question || 'Welcome to the technical evaluation.';
        setMessages([
          {
            id: `msg_${Date.now()}`,
            sender: 'agent',
            text: firstMsg,
            reasoning: data.follow_up_reasoning,
            timestamp: new Date().toLocaleTimeString(),
            domain: data.covered_topics?.[0] || 'Prompt Engineering'
          }
        ]);
        setLatestReasoning(data.follow_up_reasoning || '');
        if (data.covered_topics) setCoveredTopics(data.covered_topics);

        if (speechEnabled) speakText(firstMsg);
      } catch (err) {
        console.error('Failed to load initial interview question:', err);
      } finally {
        setLoading(false);
      }
    }
    loadFirstQuestion();
  }, [candidateId, sessionId, persona]);

  // Text-to-Speech Synthesis for Agent Responses
  const speakText = (text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = voiceSpeed;
    utterance.pitch = persona === 'Strict Tech Lead' ? 0.9 : 1.1;
    window.speechSynthesis.speak(utterance);
  };

  // Microphone Permission Request & Recording Toggle
  const toggleRecording = async () => {
    if (isRecording) {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
      if (micStream) {
        micStream.getTracks().forEach(t => t.stop());
        setMicStream(null);
      }
      setIsRecording(false);
      return;
    }

    setMicError(null);

    try {
      // 1. Request real mic permissions
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setMicStream(stream);
      setIsRecording(true);

      // 2. Web Speech Recognition setup if supported
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
          let transcript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript;
          }
          if (transcript) setInputText(transcript);
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
        }, 2000);
      }
    } catch (err: any) {
      console.warn('Microphone permission request denied or unavailable:', err);
      setMicError('Microphone access was denied or is unavailable. You can type your technical responses below.');
      setIsRecording(false);
    }
  };

  // Submit Candidate Answer
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || loading || isCompleted) return;

    if (isRecording) {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
      if (micStream) {
        micStream.getTracks().forEach(t => t.stop());
        setMicStream(null);
      }
      setIsRecording(false);
    }

    const userText = inputText.trim();
    setInputText('');

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

      if (data.interview_status === 'completed' || data.feedback) {
        setIsCompleted(true);
        setFeedback(data.feedback);
      }
    } catch (err) {
      console.error('Failed to process interview turn:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col h-[calc(100vh-6rem)] animate-fadeIn space-y-4">
      {/* Top Header Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <button
            onClick={onBackToDashboard}
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
          <button onClick={() => setMicError(null)} className="text-rose-400 hover:text-rose-200 font-bold">
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
            title={isRecording ? 'Stop Recording' : 'Start Audio Microphone Recording'}
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
                ? 'Listening to candidate voice input...'
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
        onRestart={onBackToDashboard}
      />
    </div>
  );
};
