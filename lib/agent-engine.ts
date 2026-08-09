import candidatesData from '../data/candidates.json';
import curriculumData from '../data/curriculum.json';
import { Candidate, CurriculumModule, InterviewSession, InterviewTurn } from './types';
import { breethClient } from './breeth';
import { generateAdaptiveQuestion, generateEvaluationReport } from './gemini';

// In-memory active interview sessions store
const activeSessions: Map<string, InterviewSession> = new Map();

const UNIQUE_CANDIDATE_AVATARS: Record<string, string> = {
  "Sarah Johnson": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
  "Alex Turner": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
  "Emily Chen": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  "David Miller": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
  "Michael Brown": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
  "Wendy Foster": "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
  "Ethan Brooks": "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80",
  "Harold Whitfield": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
  "Zara Ahmadi": "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
  "Gerald Combs": "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80",
  "Mia Alvarez": "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80",
  "Chen Wei": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80",
  "Ravi Patel": "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=150&auto=format&fit=crop&q=80",
  "Bethany Cole": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
  "Noah Kim": "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80"
};

export class InterviewAgentEngine {
  /**
   * Fetch synthetic candidates list
   */
  getCandidates(): Candidate[] {
    const raw = candidatesData as any;
    const rawList: any[] = Array.isArray(raw) ? raw : raw?.candidates || [];

    return rawList.map((c, index) => {
      const id = c.id || c.member?.id || `CAND-${index + 1}`;
      const name = c.name || c.member?.name || 'Candidate';
      const target_role = c.target_role || c.member?.jobRole || 'AI Engineer';
      const completed_days = c.completed_days || (c.missions ? c.missions.filter((m: any) => m.passed).map((m: any) => m.day) : []);
      const skipped_days = c.skipped_days || (c.missions ? c.missions.filter((m: any) => m.skipped).map((m: any) => m.day) : []);
      const known_strengths = c.known_strengths || (c.missions ? c.missions.filter((m: any) => m.passed && (m.attempts || 1) <= 2).map((m: any) => m.title).slice(0, 3) : ['AI Systems']);
      const focus_areas = c.focus_areas || (c.missions ? c.missions.filter((m: any) => m.skipped || (m.attempts || 1) > 2).map((m: any) => m.title).slice(0, 3) : ['Model Context Protocol (MCP)']);
      const cohort_grade = c.cohort_grade || (c.signals?.missionsCompleted > 28 ? 'A+' : 'B+');
      const bio = c.bio || `${name} is a ${target_role} with ${c.member?.yearsExperience || 5} years experience (${c.member?.education || 'CS Degree'}).`;
      const avatarUrl = c.avatarUrl || c.avatar || UNIQUE_CANDIDATE_AVATARS[name] || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`;

      const passedMissions = c.missions ? c.missions.filter((m: any) => m.passed) : [];
      const skippedMissions = c.missions ? c.missions.filter((m: any) => m.skipped || m.passed === false) : [];

      const completed_missions = c.completed_missions || [
        `${passedMissions.length > 0 ? passedMissions.length : 5} / 7 (${passedMissions.slice(0, 3).map((m: any) => m.title).join(', ') || 'RAG, Vector Indexing, MCP'})`
      ];

      // Calculate dynamic attempt count dynamically
      const activeCount = Array.from(activeSessions.values()).filter(s => s.candidateId === id).length;
      const attempts = (c.attempts_count || 0) + activeCount + 1;

      const skipped_topics = c.skipped_topics || (skippedMissions.length > 0 ? skippedMissions.map((m: any) => m.title) : ['Low-Level HNSW Quantization']);
      const learning_signals = c.learning_signals || (
        c.signals?.missionsFirstTry > 20
          ? ['Strong Prompt Security', 'Rapid Agentic Architecture Mastery']
          : ['Needs HNSW Tuning', 'Continuous Memory Management']
      );

      return {
        ...c,
        id,
        name,
        avatar: avatarUrl,
        avatarUrl,
        target_role,
        completed_days,
        skipped_days,
        completed_missions,
        attempts,
        skipped_topics,
        learning_signals,
        known_strengths: known_strengths.length > 0 ? known_strengths : ['Agentic AI', 'RAG'],
        focus_areas: focus_areas.length > 0 ? focus_areas : ['MCP', 'Vector Indexing'],
        cohort_grade,
        bio
      };
    });
  }

  /**
   * Fetch 31-day curriculum modules
   */
  getCurriculum(): CurriculumModule[] {
    const raw = curriculumData as any;
    const rawList: any[] = Array.isArray(raw) ? raw : raw?.days || raw?.modules || [];
    return rawList.map(item => ({
      day: item.day || item.n || 1,
      domain: item.domain || item.type || 'AI Architecture',
      title: item.title || 'AI Curriculum Module',
      concepts: item.concepts || item.objectives || [],
      sample_questions: item.sample_questions || item.tools || []
    }));
  }

  /**
   * Get or initialize an interview session for candidate
   */
  async getOrStartSession(candidateId: string, customSessionId?: string, persona: 'Encouraging Mentor' | 'Strict Tech Lead' = 'Strict Tech Lead'): Promise<{ session: InterviewSession; initialQuestion: string; reasoning: string }> {
    const sessionId = customSessionId || `session_${candidateId}_${Date.now()}`;

    if (activeSessions.has(sessionId)) {
      const session = activeSessions.get(sessionId)!;
      const lastTurn = session.turns[session.turns.length - 1];
      return {
        session,
        initialQuestion: lastTurn ? lastTurn.question : 'Welcome. Let us begin.',
        reasoning: lastTurn ? lastTurn.reasoning : 'Initial session loaded.'
      };
    }

    const candidates = this.getCandidates();
    const candidate = candidates.find(c => (c.id || c.member?.id) === candidateId) || candidates[0];
    const roleLower = (candidate.target_role || candidate.member?.jobRole || '').toLowerCase();

    let initialDomain = 'Frontend Engineering & State';
    if (roleLower.includes('frontend') || roleLower.includes('react') || roleLower.includes('ui')) {
      initialDomain = 'Frontend Engineering & State';
    } else if (roleLower.includes('ml') || roleLower.includes('machine learning') || roleLower.includes('ai') || roleLower.includes('model')) {
      initialDomain = 'Machine Learning & Vector RAG';
    } else if (roleLower.includes('devops') || roleLower.includes('cloud') || roleLower.includes('infra') || roleLower.includes('site reliability')) {
      initialDomain = 'DevOps, Kubernetes & Cloud';
    } else if (roleLower.includes('backend') || roleLower.includes('systems') || roleLower.includes('database')) {
      initialDomain = 'Backend Systems & Databases';
    } else if (roleLower.includes('agent') || roleLower.includes('full-stack')) {
      initialDomain = 'Agentic AI & Tool Execution';
    } else if (candidate.focus_areas && candidate.focus_areas.length > 0) {
      initialDomain = candidate.focus_areas[0];
    }

    const { question, reasoning } = await generateAdaptiveQuestion({
      candidate,
      currentTurn: 1,
      coveredTopics: [initialDomain],
      recalledMemories: [],
      targetDomain: initialDomain,
      persona,
      history: []
    });

    const firstTurn: InterviewTurn = {
      turnNumber: 1,
      question,
      reasoning,
      domain: initialDomain,
      timestamp: new Date().toISOString()
    };

    const newSession: InterviewSession = {
      sessionId,
      candidateId: candidate.id || candidate.member?.id || candidateId,
      currentTurn: 1,
      maxTurns: 8,
      status: 'in_progress',
      coveredTopics: [initialDomain],
      persona,
      turns: [firstTurn]
    };

    activeSessions.set(sessionId, newSession);

    return {
      session: newSession,
      initialQuestion: question,
      reasoning
    };
  }

  /**
   * Process candidate's answer and generate next turn or completion feedback
   */
  async processCandidateTurn(params: {
    candidateId: string;
    sessionId: string;
    message: string;
    persona?: 'Encouraging Mentor' | 'Strict Tech Lead';
  }) {
    const { candidateId, sessionId, message, persona } = params;
    const session = activeSessions.get(sessionId) || (await this.getOrStartSession(candidateId, sessionId, persona)).session;
    const candidates = this.getCandidates();
    const candidate = candidates.find(c => (c.id || c.member?.id) === candidateId) || candidates[0];

    const currentTurnObj = session.turns[session.turns.length - 1];
    if (currentTurnObj) {
      currentTurnObj.candidateAnswer = message;
    }

    const domain = currentTurnObj?.domain || 'AI Architecture';

    // 1. Write Episode to Breeth AI Memory with extract_intent: true
    const episode = await breethClient.createEpisode({
      sessionId,
      candidateId,
      question: currentTurnObj?.question || '',
      answer: message,
      domain
    });

    // 2. Query Breeth AI Memory via Hybrid Search for historical candidate context
    const recalledMemories = await breethClient.searchEpisodes({
      candidateId,
      query: message,
      sessionId,
      limit: 3
    });

    if (currentTurnObj) {
      currentTurnObj.recalledMemories = recalledMemories;
    }

    // 3. Check if completed 8 turns
    if (session.currentTurn >= session.maxTurns) {
      session.status = 'completed';

      const history = session.turns.map(t => ({
        question: t.question,
        answer: t.candidateAnswer || '',
        domain: t.domain
      }));

      const feedback = await generateEvaluationReport({
        candidate,
        history,
        memories: recalledMemories
      });

      session.feedback = feedback;
      activeSessions.set(sessionId, session);

      return {
        reply: "Thank you for completing the technical evaluation.",
        done: true,
        next_question: "Thank you for completing the technical evaluation.",
        follow_up_reasoning: "All 8 adaptive technical turns across curriculum domains have been evaluated.",
        interview_status: 'completed' as const,
        current_step: session.currentTurn,
        total_steps: session.maxTurns,
        covered_topics: session.coveredTopics,
        recalled_memories: recalledMemories,
        feedback: {
          summary: feedback.summary,
          strengths: feedback.strengths,
          gaps: feedback.gaps || feedback.weaknesses || [],
          next: feedback.next || ['Review Days 12-14 on hybrid vector search'],
          scores: feedback.scores,
          hiring_recommendation: feedback.hiring_recommendation
        }
      };
    }

    // 4. Determine next domain to cover (at least 4 distinct domains across 8 turns)
    const nextTurnNumber = session.currentTurn + 1;
    const availableDomains = [
      'RAG & Hybrid Vector Retrieval',
      'Vector Databases (HNSW / Indexing)',
      'Prompt Engineering & Security',
      'Agentic AI & Tool Execution',
      'Model Context Protocol (MCP)',
      'AI Deployment (vLLM / Quantization)'
    ];

    const nextDomain = availableDomains.find(d => !session.coveredTopics.includes(d)) || availableDomains[nextTurnNumber % availableDomains.length];

    if (!session.coveredTopics.includes(nextDomain)) {
      session.coveredTopics.push(nextDomain);
    }

    const fullTranscriptHistory: Array<{ role: 'user' | 'model'; content: string }> = [];
    session.turns.forEach(t => {
      fullTranscriptHistory.push({ role: 'model', content: t.question });
      if (t.candidateAnswer) {
        fullTranscriptHistory.push({ role: 'user', content: t.candidateAnswer });
      }
    });

    // 5. Generate next question and follow-up reasoning with full transcript context
    const { question: nextQuestion, reasoning: nextReasoning } = await generateAdaptiveQuestion({
      candidate,
      currentTurn: nextTurnNumber,
      coveredTopics: session.coveredTopics,
      lastAnswer: message,
      recalledMemories,
      targetDomain: nextDomain,
      persona: persona || session.persona || 'Strict Tech Lead',
      history: fullTranscriptHistory as any
    });

    session.currentTurn = nextTurnNumber;
    session.turns.push({
      turnNumber: nextTurnNumber,
      question: nextQuestion,
      reasoning: nextReasoning,
      domain: nextDomain,
      timestamp: new Date().toISOString()
    });

    activeSessions.set(sessionId, session);

    return {
      reply: nextQuestion,
      done: false,
      next_question: nextQuestion,
      follow_up_reasoning: nextReasoning,
      interview_status: 'in_progress' as const,
      current_step: session.currentTurn,
      total_steps: session.maxTurns,
      covered_topics: session.coveredTopics,
      recalled_memories: recalledMemories
    };
  }
}

export const agentEngine = new InterviewAgentEngine();
