'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Candidate, MemoryEpisode, InterviewFeedback } from '@/lib/types';
import { TopicCoverageBar } from './TopicCoverageBar';
import { MemoryDrawer } from './MemoryDrawer';
import { FeedbackModal } from './FeedbackModal';
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
  HelpCircle,
  CheckCircle2,
  Radio
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
  const [isRecording, setIsRecording] = useState(false);
  const [sessionId] = useState(`session_${candidate.id}_${Date.now()}`);

  const chatBottomRef = useRef<HTMLDivElement>(null);

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
            candidate_id: candidate.id,
            session_id: sessionId,
            message: ''
          })
        });
        const data = await res.json();
        setMessages([
          {
            id: `msg_${Date.now()}`,
            sender: 'agent',
            text: data.next_question,
            reasoning: data.follow_up_reasoning,
            timestamp: new Date().toLocaleTimeString(),
            domain: data.covered_topics?.[0] || 'Prompt Engineering'
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
  }, [candidate.id, sessionId]);

  // Submit Candidate Answer
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || loading || isCompleted) return;

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
          candidate_id: candidate.id,
          session_id: sessionId,
          message: userText
        })
      });

      const data = await res.json();

      setCurrentStep(data.current_step || currentStep + 1);
      if (data.covered_topics) setCoveredTopics(data.covered_topics);
      if (data.recalled_memories) setRecalledMemories(data.recalled_memories);
      if (data.follow_up_reasoning) setLatestReasoning(data.follow_up_reasoning);

      // Add agent response message
      const agentMsg: ChatMessage = {
        id: `msg_agent_${Date.now()}`,
        sender: 'agent',
        text: data.next_question,
        reasoning: data.follow_up_reasoning,
        timestamp: new Date().toLocaleTimeString(),
        domain: data.covered_topics?.[data.covered_topics.length - 1]
      };

      setMessages(prev => [...prev, agentMsg]);

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

  // Toggle Simulated Voice Recording / Speech Input
  const toggleRecording = () => {
    if (!isRecording) {
      setIsRecording(true);
      // Simulate live audio transcription snippet for testing voice interview experience
      const sampleVoiceTranscripts = [
        "In high-scale vector databases, we tune HNSW graph parameters m and ef_construction to optimize search recall while controlling memory overhead.",
        "When designing ReAct loops, I implement strict iteration depth limits and fallback schema parsers to safeguard against infinite loops.",
        "Model Context Protocol (MCP) standardizes host-to-tool JSON-RPC transport over SSE or Stdio, decoupling client integration logic."
      ];
      const randomTranscript = sampleVoiceTranscripts[Math.floor(Math.random() * sampleVoiceTranscripts.length)];
      setTimeout(() => {
        setInputText(randomTranscript);
        setIsRecording(false);
      }, 2500);
    } else {
      setIsRecording(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col h-[calc(100vh-6rem)] animate-fadeIn space-y-4">
      {/* Top Header Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <button
            onClick={onBackToDashboard}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title="Back to Candidate Dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <img
            src={candidate.avatar}
            alt={candidate.name}
            className="w-10 h-10 rounded-full object-cover border-2 border-teal-500"
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-slate-100 text-base">{candidate.name}</h2>
              <span className="text-[10px] px-2 py-0.5 rounded bg-teal-950 text-teal-300 border border-teal-800 font-mono">
                {candidate.target_role}
              </span>
            </div>
            <p className="text-xs text-slate-400">Evaluating 31-Day AI Cohort Mastery</p>
          </div>
        </div>

        {/* Live Breeth Memory Inspector Trigger Button */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <button
            onClick={() => setIsMemoryOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-teal-950 to-slate-900 hover:from-teal-900 border border-teal-700/50 text-teal-300 text-xs font-semibold shadow-lg transition-all cursor-pointer"
          >
            <Brain className="w-4 h-4 text-teal-400 animate-pulse" />
            <span>Breeth AI Memory Inspector</span>
            {recalledMemories.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-teal-500 text-slate-950 font-mono text-[10px] font-bold">
                {recalledMemories.length}
              </span>
            )}
          </button>
        </div>
      </div>

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
                  {msg.sender === 'agent' ? 'Dr. Aris Thorne (AI Evaluator)' : candidate.name}
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

              {/* Reasoning Dropdown preview for Agent messages */}
              {msg.reasoning && (
                <div className="text-[11px] text-slate-400 bg-slate-950/60 border border-slate-800/80 rounded-xl p-2.5 flex items-start gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-teal-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-teal-400 font-semibold">Agent Reasoning: </span>
                    <span className="italic">{msg.reasoning}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-3 text-xs text-teal-400 font-medium p-4 rounded-2xl bg-slate-900/60 border border-slate-800 w-fit animate-pulse">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Breeth AI Episode Memory & Intent Querying...</span>
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* Answer Input Box */}
      <form onSubmit={handleSendMessage} className="relative bg-slate-900 border border-slate-800 rounded-2xl p-3 shadow-xl">
        <div className="flex items-center gap-2">
          {/* Simulated Voice Recording Trigger */}
          <button
            type="button"
            onClick={toggleRecording}
            className={`p-3 rounded-xl transition-all cursor-pointer ${
              isRecording
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500 animate-pulse'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
            }`}
            title="Simulate Voice Input / Speech-to-Text"
          >
            {isRecording ? <Radio className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
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
                ? 'Interview completed. Click View Feedback Report.'
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
        candidateName={candidate.name}
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
