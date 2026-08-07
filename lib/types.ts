export interface Candidate {
  id: string;
  name: string;
  avatar: string;
  target_role: string;
  completed_days: number[];
  skipped_days: number[];
  known_strengths: string[];
  focus_areas: string[];
  cohort_grade: string;
  bio: string;
}

export interface CurriculumModule {
  day: number;
  domain: string;
  title: string;
  concepts: string[];
  sample_questions: string[];
}

export interface MemoryEpisode {
  id: string;
  sessionId: string;
  candidateId: string;
  question: string;
  answer: string;
  timestamp: string;
  intent?: {
    technical_concepts_mentioned: string[];
    perceived_depth: 'High' | 'Medium' | 'Low';
    key_intent: string;
    flags: string[];
  };
}

export interface BreethSearchQuery {
  query: string;
  candidateId: string;
  sessionId?: string;
  limit?: number;
}

export interface BreethSearchResult {
  episodes: MemoryEpisode[];
  relevanceScore: number;
}

export interface InterviewTurn {
  turnNumber: number;
  question: string;
  reasoning: string;
  candidateAnswer?: string;
  domain: string;
  recalledMemories?: MemoryEpisode[];
  timestamp: string;
}

export interface InterviewFeedback {
  strengths: string[];
  weaknesses: string[];
  topic_mastery: Record<string, number>;
  hiring_recommendation: 'Strong Hire' | 'Hire' | 'Lean Hire' | 'No Hire';
  summary: string;
}

export interface InterviewSession {
  sessionId: string;
  candidateId: string;
  currentTurn: number;
  maxTurns: number;
  status: 'in_progress' | 'completed';
  coveredTopics: string[];
  turns: InterviewTurn[];
  feedback?: InterviewFeedback;
}

export interface APIInterviewRequest {
  candidate_id: string;
  message?: string;
  session_id?: string;
}

export interface APIInterviewResponse {
  next_question: string;
  follow_up_reasoning: string;
  interview_status: 'in_progress' | 'completed';
  current_step: number;
  total_steps: number;
  covered_topics: string[];
  recalled_memories?: MemoryEpisode[];
  feedback?: InterviewFeedback;
}
