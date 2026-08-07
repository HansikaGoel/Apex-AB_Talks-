import { NextRequest, NextResponse } from 'next/server';
import { agentEngine } from '@/lib/agent-engine';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { candidate_id, message, session_id } = body;

    if (!candidate_id) {
      return NextResponse.json(
        { error: 'Missing candidate_id in request payload' },
        { status: 400 }
      );
    }

    const effectiveSessionId = session_id || `session_${candidate_id}_default`;

    // Initial session check if no message provided yet (first question load)
    if (!message || message.trim() === '') {
      const { session, initialQuestion, reasoning } = await agentEngine.getOrStartSession(candidate_id, effectiveSessionId);
      return NextResponse.json({
        next_question: initialQuestion,
        follow_up_reasoning: reasoning,
        interview_status: session.status,
        current_step: session.currentTurn,
        total_steps: session.maxTurns,
        covered_topics: session.coveredTopics,
        recalled_memories: [],
        feedback: session.feedback
      });
    }

    // Process candidate turn
    const result = await agentEngine.processCandidateTurn({
      candidateId: candidate_id,
      sessionId: effectiveSessionId,
      message
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[API /api/interview Error]:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
