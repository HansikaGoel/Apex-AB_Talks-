import { NextResponse } from 'next/server';
import { agentEngine } from '@/lib/agent-engine';

export async function GET() {
  const curriculum = agentEngine.getCurriculum();
  return NextResponse.json(curriculum);
}
