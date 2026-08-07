import { MemoryEpisode, BreethSearchQuery } from './types';

const BREETH_API_BASE = process.env.BREETH_API_URL || 'https://api.thebreeth.com/v1';

// In-memory persistent fallback store for development & demo resilience
const localEpisodeStore: MemoryEpisode[] = [];

export class BreethClient {
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.BREETH_API_KEY || '';
  }

  /**
   * Write an interview answer turn into Breeth AI episode memory with extract_intent: true
   */
  async createEpisode(params: {
    sessionId: string;
    candidateId: string;
    question: string;
    answer: string;
    domain: string;
  }): Promise<MemoryEpisode> {
    const timestamp = new Date().toISOString();
    const episodeId = `ep_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    // Default structured intent representation
    const defaultIntent = {
      technical_concepts_mentioned: this.extractKeywords(params.answer),
      perceived_depth: params.answer.length > 200 ? 'High' : params.answer.length > 80 ? 'Medium' : 'Low',
      key_intent: `Candidate addressed ${params.domain} question. Highlighted key concepts: ${this.extractKeywords(params.answer).slice(0, 3).join(', ')}.`,
      flags: params.answer.toLowerCase().includes('don\'t know') || params.answer.length < 40 
        ? [`WEAKNESS_${params.domain.toUpperCase().replace(/\s+/g, '_')}`]
        : [`STRENGTH_${params.domain.toUpperCase().replace(/\s+/g, '_')}`]
    } as MemoryEpisode['intent'];

    const newEpisode: MemoryEpisode = {
      id: episodeId,
      sessionId: params.sessionId,
      candidateId: params.candidateId,
      question: params.question,
      answer: params.answer,
      timestamp,
      intent: defaultIntent
    };

    // Store in local fallback memory store
    localEpisodeStore.push(newEpisode);

    if (!this.apiKey) {
      console.log('[Breeth AI Client - Fallback Mode] Episode written locally with intent:', episodeId);
      return newEpisode;
    }

    try {
      const response = await fetch(`${BREETH_API_BASE}/episodes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'x-api-key': this.apiKey
        },
        body: JSON.stringify({
          session_id: params.sessionId,
          candidate_id: params.candidateId,
          message: `Question: ${params.question}\nCandidate Answer: ${params.answer}`,
          extract_intent: true,
          metadata: {
            domain: params.domain,
            question: params.question
          }
        })
      });

      if (!response.ok) {
        console.warn(`[Breeth AI API warning: ${response.status}] Using localized episode fallback.`);
        return newEpisode;
      }

      const data = await response.json();
      if (data.intent) {
        newEpisode.intent = data.intent;
      }
      return newEpisode;
    } catch (err) {
      console.error('[Breeth AI Error] Falling back to local memory store:', err);
      return newEpisode;
    }
  }

  /**
   * Search historical candidate episode memories using Breeth AI hybrid search
   */
  async searchEpisodes(queryObj: BreethSearchQuery): Promise<MemoryEpisode[]> {
    const { candidateId, query, limit = 4 } = queryObj;

    // Local hybrid keyword & semantic score match fallback
    const matchedLocal = localEpisodeStore
      .filter(ep => ep.candidateId === candidateId)
      .map(ep => {
        const text = `${ep.question} ${ep.answer} ${ep.intent?.key_intent || ''}`.toLowerCase();
        const queryTerms = query.toLowerCase().split(/\s+/);
        const matches = queryTerms.filter(t => t.length > 2 && text.includes(t)).length;
        return { ep, score: matches };
      })
      .sort((a, b) => b.score - a.score)
      .map(item => item.ep)
      .slice(0, limit);

    if (!this.apiKey) {
      console.log(`[Breeth AI Search - Fallback Mode] Retrieved ${matchedLocal.length} episodes for candidate ${candidateId}`);
      return matchedLocal;
    }

    try {
      const response = await fetch(`${BREETH_API_BASE}/episodes/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'x-api-key': this.apiKey
        },
        body: JSON.stringify({
          candidate_id: candidateId,
          query,
          limit,
          hybrid: true
        })
      });

      if (!response.ok) {
        console.warn(`[Breeth AI Search warning: ${response.status}] Returning local matched episodes.`);
        return matchedLocal;
      }

      const data = await response.json();
      if (Array.isArray(data.results)) {
        return data.results.map((r: any) => ({
          id: r.id || `ep_${Math.random()}`,
          sessionId: r.session_id || queryObj.sessionId || 'session',
          candidateId: r.candidate_id || candidateId,
          question: r.metadata?.question || 'Previous Question',
          answer: r.message || r.content || '',
          timestamp: r.created_at || new Date().toISOString(),
          intent: r.intent || undefined
        }));
      }

      return matchedLocal;
    } catch (err) {
      console.error('[Breeth AI Search Error] Returning local memory fallback:', err);
      return matchedLocal;
    }
  }

  private extractKeywords(text: string): string[] {
    const keywords = ['RAG', 'Vector', 'HNSW', 'ReAct', 'MCP', 'Embedding', 'HyDE', 'RRF', 'Guardrails', 'vLLM', 'Prompt', 'Context', 'Chunking'];
    return keywords.filter(kw => text.toLowerCase().includes(kw.toLowerCase()));
  }
}

export const breethClient = new BreethClient();
