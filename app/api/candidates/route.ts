import { NextResponse } from 'next/server';
import { agentEngine } from '@/lib/agent-engine';

export async function GET() {
  const candidates = agentEngine.getCandidates();
  return NextResponse.json(candidates);
}
