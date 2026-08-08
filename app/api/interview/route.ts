import { NextRequest, NextResponse } from 'next/server';
import { agentEngine } from '@/lib/agent-engine';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const candidate_id = body.candidate_id || body.candidateId || body.candidate?.id;
    const message = body.message || body.candidateAnswer;
    const session_id = body.session_id || body.sessionId;
    const persona = body.persona;

    if (!candidate_id) {
      return NextResponse.json(
        { error: 'Missing candidate_id in request payload' },
        { status: 400 }
      );
    }

    const effectiveSessionId = session_id || `session_${candidate_id}_default`;

    // Initial session check if no message provided yet (first question load)
    if (!message || message.trim() === '') {
      const { session, initialQuestion, reasoning } = await agentEngine.getOrStartSession(candidate_id, effectiveSessionId, persona);
      return NextResponse.json({
        reply: initialQuestion,
        done: false,
        next_question: initialQuestion,
        follow_up_reasoning: reasoning,
        interview_status: session.status,
        current_step: session.currentTurn,
        total_steps: session.maxTurns,
        covered_topics: session.coveredTopics,
        recalled_memories: [],
        feedback: session.feedback ? {
          summary: session.feedback.summary,
          strengths: session.feedback.strengths,
          gaps: session.feedback.gaps || (session.feedback as any).weaknesses || [],
          next: session.feedback.next || ['Review Days 12-14 on hybrid vector search']
        } : undefined
      });
    }

    // Process candidate turn
    const result = await agentEngine.processCandidateTurn({
      candidateId: candidate_id,
      sessionId: effectiveSessionId,
      message,
      persona
    });

    const isDone = result.done || result.interview_status === 'completed';

    return NextResponse.json({
      reply: result.reply || result.next_question,
      done: isDone,
      next_question: result.next_question,
      follow_up_reasoning: result.follow_up_reasoning,
      interview_status: result.interview_status,
      current_step: result.current_step,
      total_steps: result.total_steps,
      covered_topics: result.covered_topics,
      recalled_memories: result.recalled_memories,
      feedback: isDone && result.feedback ? {
        summary: result.feedback.summary,
        strengths: result.feedback.strengths,
        gaps: result.feedback.gaps || (result.feedback as any).weaknesses || [],
        next: result.feedback.next || ['Review Days 12-14 on hybrid vector search'],
        scores: result.feedback.scores,
        hiring_recommendation: result.feedback.hiring_recommendation
      } : undefined
    });
  } catch (err: any) {
    console.error('API /api/interview Error:', err);
    return NextResponse.json(
      { error: err.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
