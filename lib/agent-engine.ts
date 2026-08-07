import candidatesData from '../data/candidates.json';
import curriculumData from '../data/curriculum.json';
import { Candidate, CurriculumModule, InterviewSession, InterviewTurn } from './types';
import { breethClient } from './breeth';
import { generateAdaptiveQuestion, generateEvaluationReport } from './gemini';

// In-memory active interview sessions store
const activeSessions: Map<string, InterviewSession> = new Map();

export class InterviewAgentEngine {
  /**
   * Fetch synthetic candidates list
   */
  getCandidates(): Candidate[] {
    return candidatesData as Candidate[];
  }

  /**
   * Fetch 31-day curriculum modules
   */
  getCurriculum(): CurriculumModule[] {
    return curriculumData as CurriculumModule[];
  }

  /**
   * Get or initialize an interview session for candidate
   */
  async getOrStartSession(candidateId: string, customSessionId?: string): Promise<{ session: InterviewSession; initialQuestion: string; reasoning: string }> {
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

    const candidate = (candidatesData as Candidate[]).find(c => c.id === candidateId) || candidatesData[0];
    const initialDomain = candidate.focus_areas[0] || 'Prompt Engineering';

    const { question, reasoning } = await generateAdaptiveQuestion({
      candidate,
      currentTurn: 1,
      coveredTopics: [initialDomain],
      recalledMemories: [],
      targetDomain: initialDomain
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
      candidateId: candidate.id,
      currentTurn: 1,
      maxTurns: 8,
      status: 'in_progress',
      coveredTopics: [initialDomain],
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
  }) {
    const { candidateId, sessionId, message } = params;
    const session = activeSessions.get(sessionId) || (await this.getOrStartSession(candidateId, sessionId)).session;
    const candidate = (candidatesData as Candidate[]).find(c => c.id === candidateId) || candidatesData[0];

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
        next_question: "Interview Completed. Thank you!",
        follow_up_reasoning: "All 8 adaptive technical turns across curriculum domains have been evaluated.",
        interview_status: 'completed' as const,
        current_step: session.currentTurn,
        total_steps: session.maxTurns,
        covered_topics: session.coveredTopics,
        recalled_memories: recalledMemories,
        feedback
      };
    }

    // 4. Determine next domain to cover (at least 4 distinct domains across 8 turns)
    const nextTurnNumber = session.currentTurn + 1;
    const availableDomains = [
      'Prompt Engineering & Security',
      'Embeddings & Vector Databases',
      'Advanced RAG Systems',
      'Agentic AI & Tool Execution',
      'Model Context Protocol (MCP)',
      'Enterprise AI Deployment'
    ];

    const nextDomain = availableDomains.find(d => !session.coveredTopics.includes(d)) || availableDomains[nextTurnNumber % availableDomains.length];

    if (!session.coveredTopics.includes(nextDomain)) {
      session.coveredTopics.push(nextDomain);
    }

    // 5. Generate next question and follow-up reasoning
    const { question: nextQuestion, reasoning: nextReasoning } = await generateAdaptiveQuestion({
      candidate,
      currentTurn: nextTurnNumber,
      coveredTopics: session.coveredTopics,
      lastAnswer: message,
      recalledMemories,
      targetDomain: nextDomain
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
