# Technical Specification Document - "The Interview Agent"

**Project Title**: The Interview Agent  
**Hackathon Event**: ABTalks Hackathon 2026  
**Architecture Paradigm**: Adaptive Multi-Turn AI Interviewer with Breeth Memory & Intent Layer  
**Framework**: Next.js 14 (App Router), React 18, Tailwind CSS, TypeScript  

---

## 1. System Architecture & Overview

The Interview Agent evaluates technical candidates across a 31-day AI Cohort curriculum covering 7 Core Pillars (RAG, Vector Indexing, Prompt Security, Agentic Tooling, MCP, vLLM Quantization, and Production Evaluation).

```
 ┌─────────────────────────────────────────────────────────┐
 │                   Next.js 14 App Router                 │
 └────────────────────────────┬────────────────────────────┘
                              │
         ┌────────────────────┼────────────────────┐
         ▼                    ▼                    ▼
 ┌───────────────┐    ┌───────────────┐    ┌───────────────┐
 │  Landing &    │    │ Candidate Hub │    │  Live Room    │
 │ Hero Splash   │    │ (Step 1 Setup)│    │ (100vh Layout)│
 └───────────────┘    └───────────────┘    └───────┬───────┘
                                                   │
                                                   ▼
                                        ┌────────────────────┐
                                        │  Web Speech API    │
                                        │ (STT & Voice TTS)  │
                                        └──────────┬─────────┘
                                                   │
                                                   ▼
 ┌─────────────────────────────────────────────────────────┐
 │      API Engine (`/api/interview`) & Agent Engine       │
 └────────────────────────────┬────────────────────────────┘
                              │
         ┌────────────────────┴────────────────────┐
         ▼                                         ▼
 ┌───────────────────────────┐         ┌───────────────────────┐
 │ Google Gemini 1.5 Pro/Flash│         │ Breeth AI Memory &    │
 │ (Adaptive Turns & Report) │         │ Intent Vector Layer   │
 └───────────────────────────┘         └───────────────────────┘
```

---

## 2. API Specifications & Contracts

### A. Candidate Assessment Turn & Evaluation (`POST /api/interview`)

**Request Payload:**
```json
{
  "candidate_id": "CAND-001",
  "session_id": "session_CAND-001_1770590000000",
  "message": "I prioritize dense vector search using HNSW indexing with m=16 and ef_construction=200 for low latency QPS.",
  "persona": "Strict Tech Lead",
  "done": false
}
```

**Turn Response Schema (`in_progress`):**
```json
{
  "reply": "Follow-up question response.",
  "done": false,
  "next_question": "Explain how you manage context window overflow when injecting multi-turn tool call logs into MCP servers.",
  "follow_up_reasoning": "Candidate answered HNSW index parameters accurately. Probing deeper into Model Context Protocol context window management.",
  "interview_status": "in_progress",
  "current_step": 2,
  "total_steps": 8,
  "covered_topics": [
    "Prompt Engineering & Security",
    "Vector Databases (HNSW / Indexing)"
  ],
  "recalled_memories": [
    {
      "id": "mem_1770590000",
      "sessionId": "session_CAND-001_1770590000000",
      "candidateId": "CAND-001",
      "question": "What parameters do you tune in vector databases?",
      "answer": "HNSW m=16 ef_construction=200",
      "intent": {
        "technical_concepts_mentioned": ["HNSW", "ef_construction"],
        "perceived_depth": "High",
        "key_intent": "Demonstrated vector indexing proficiency.",
        "flags": []
      }
    }
  ]
}
```

**Evaluation Response Schema (`completed` / `done: true`):**
```json
{
  "done": true,
  "interview_status": "completed",
  "current_step": 8,
  "total_steps": 8,
  "feedback": {
    "summary": "Candidate demonstrated strong command across vector search, prompt security, and multi-agent routing. Recommended for Senior AI Systems Architect role.",
    "hiring_recommendation": "Strong Hire",
    "scores": {
      "technical_accuracy": 92,
      "communication": 88,
      "problem_solving": 90,
      "confidence": 94
    },
    "topic_mastery": {
      "System Architecture": 92,
      "RAG Retrieval": 90,
      "Prompt Security": 94,
      "MCP Tooling": 86
    },
    "strengths": [
      "Articulated exact HNSW graph construction trade-offs.",
      "Implemented strict CoT schemas with XML delimiters for prompt injection defense."
    ],
    "gaps": [
      "Can further optimize low-bit quantization on ARM edge nodes."
    ]
  }
}
```

---

### B. Synthetic Candidates Roster (`GET /api/candidates`)

**Response Schema:**
```json
[
  {
    "id": "CAND-001",
    "name": "Sarah Johnson",
    "target_role": "Senior Data Engineer",
    "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    "completed_missions": ["5 / 7 (RAG, Vector Indexing, MCP)"],
    "attempts": 2,
    "skipped_topics": ["Low-Level HNSW Quantization"],
    "learning_signals": ["Strong Prompt Security", "Needs HNSW Tuning"],
    "known_strengths": ["Vector Search", "Prompt Security"],
    "focus_areas": ["MCP Context Window"],
    "cohort_grade": "A+"
  }
]
```

---

### C. 31-Day Curriculum Modules (`GET /api/curriculum`)

**Response Schema:**
```json
[
  {
    "day": 7,
    "domain": "Vector Retrieval",
    "title": "Embeddings & HNSW Vector Databases",
    "concepts": ["Cosine Distance", "Dot Product", "HNSW Graphs", "Quantization"],
    "sample_questions": [
      "Compare flat vector indexing versus HNSW approximate nearest neighbor search under high QPS."
    ]
  }
]
```

---

## 3. Web Audio & Speech Synchronization Engine

1. **Sequential Channel Locking**:
   - `isAISpeakingRef`: Locks microphone activation during SpeechSynthesis playback.
   - `utterance.onend`: Releases lock and triggers 300ms delayed `startAudioCapture()` to resume microphone recording.
2. **Persistent Microphone Retention (`isMicEnabledRef`)**:
   - Maintains microphone activation state across Turn 1 through Turn 8 transitions.
3. **Explicit Teardown Routine (`purgeAudioStack`)**:
   - Aborts SpeechRecognition instance (`recognition.abort()`).
   - Cancels SpeechSynthesis queue (`speechSynthesis.cancel()`).
   - Stops MediaStream audio tracks (`track.stop()`).

---

## 4. Setup, Environment & Build Instructions

### Prerequisites
- Node.js 18.x or Node.js 20.x
- Environment Key in `.env.local`:
  ```bash
  GEMINI_API_KEY="your_google_gemini_api_key"
  ```

### Build Commands
```bash
# Install dependencies
npm install

# Run locally in development mode
npm run dev

# Build production bundle
npm run build

# Start production server
npm run start
```
