import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

export const Scene2_FeatureReveal: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Sub-segment determination (0-420: Setup Card, 420-810: AI Avatar, 810-1200: Memory Engine)
  const isPart1 = frame < 420;
  const isPart2 = frame >= 420 && frame < 810;
  const isPart3 = frame >= 810;

  // Animations for Part 1 (Setup Card)
  const cardSpring = spring({ frame, fps, config: { damping: 14, mass: 0.8 } });
  const promptFade = interpolate(frame, [60, 100], [0, 1], { extrapolateRight: "clamp" });

  // Animations for Part 2 (AI Avatar)
  const avatarFrame = frame - 420;
  const avatarScale = spring({ frame: avatarFrame, fps, config: { damping: 12 } });
  const ringPulse1 = Math.sin(avatarFrame * 0.1) * 15;
  const ringPulse2 = Math.cos(avatarFrame * 0.08) * 20;

  // Animations for Part 3 (Breeth Memory Engine)
  const memoryFrame = frame - 810;
  const coreScale = spring({ frame: memoryFrame, fps, config: { damping: 10 } });
  const node1Spring = spring({ frame: memoryFrame - 40, fps, config: { damping: 12 } });
  const node2Spring = spring({ frame: memoryFrame - 90, fps, config: { damping: 12 } });
  const node3Spring = spring({ frame: memoryFrame - 140, fps, config: { damping: 12 } });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#020617",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "100px 80px 80px 80px",
        fontFamily: "'Inter', system-ui, sans-serif",
        color: "#f8fafc",
      }}
    >
      {/* PART 1: CANDIDATE SETUP CARD (Frames 0 - 420) */}
      {isPart1 && (
        <div style={{ width: "100%", maxWidth: "1300px", display: "flex", flexDirection: "column", alignItems: "center" }}>
          {/* Tag */}
          <div
            style={{
              padding: "6px 20px",
              borderRadius: "20px",
              background: "rgba(20, 184, 166, 0.15)",
              border: "1px solid rgba(20, 184, 166, 0.4)",
              color: "#14b8a6",
              fontSize: "13px",
              fontWeight: 800,
              letterSpacing: "2px",
              marginBottom: "16px",
            }}
          >
            🚀 FEATURE REVEAL #1
          </div>

          <h2 style={{ fontSize: "44px", fontWeight: 900, margin: "0 0 36px 0", color: "#f8fafc" }}>
            Dynamic Candidate Setup & Adaptive Prompts
          </h2>

          {/* Setup Panel UI */}
          <div
            style={{
              transform: `scale(${cardSpring})`,
              width: "100%",
              background: "rgba(15, 23, 42, 0.85)",
              border: "1px solid rgba(20, 184, 166, 0.3)",
              borderRadius: "24px",
              padding: "40px",
              backdropFilter: "blur(12px)",
              boxShadow: "0 20px 50px rgba(0, 0, 0, 0.6), 0 0 40px rgba(20, 184, 166, 0.15)",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "40px",
            }}
          >
            {/* Left Column: Role Details */}
            <div>
              <div style={{ fontSize: "14px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "1px" }}>
                Target Position
              </div>
              <div style={{ fontSize: "28px", fontWeight: 800, color: "#14b8a6", marginTop: "8px" }}>
                Senior Distributed Systems Architect
              </div>

              <div style={{ fontSize: "14px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "1px", marginTop: "24px" }}>
                Required Skill Stack
              </div>
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "10px" }}>
                {["System Design", "Node.js", "Redis", "Kafka", "Kubernetes", "GraphQL"].map((skill, idx) => (
                  <span
                    key={idx}
                    style={{
                      background: "rgba(56, 189, 248, 0.15)",
                      border: "1px solid rgba(56, 189, 248, 0.3)",
                      color: "#38bdf8",
                      padding: "6px 14px",
                      borderRadius: "8px",
                      fontSize: "14px",
                      fontWeight: 600,
                    }}
                  >
                    {skill}
                  </span>
                ))}
              </div>

              <div style={{ fontSize: "14px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "1px", marginTop: "24px" }}>
                Evaluation Rigor Level
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "8px" }}>
                <div style={{ height: "10px", flex: 1, backgroundColor: "#1e293b", borderRadius: "5px", overflow: "hidden" }}>
                  <div style={{ width: "85%", height: "100%", background: "linear-gradient(to right, #14b8a6, #38bdf8)" }} />
                </div>
                <span style={{ fontSize: "14px", fontWeight: 800, color: "#38bdf8" }}>L6 Staff / Architect</span>
              </div>
            </div>

            {/* Right Column: Prompt Injection */}
            <div style={{ opacity: promptFade }}>
              <div style={{ fontSize: "14px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "1px" }}>
                System Persona Prompt
              </div>
              <div
                style={{
                  background: "#020617",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "12px",
                  padding: "18px",
                  marginTop: "10px",
                  fontFamily: "monospace",
                  fontSize: "13px",
                  color: "#cbd5e1",
                  lineHeight: 1.6,
                }}
              >
                <span style={{ color: "#14b8a6" }}>SYSTEM_PROMPT =</span> {`{`}
                <br />
                &nbsp;&nbsp;role: <span style={{ color: "#38bdf8" }}>"Pragmatic Principal Architect"</span>,
                <br />
                &nbsp;&nbsp;focus: <span style={{ color: "#38bdf8" }}>"Scalability & Bottlenecks"</span>,
                <br />
                &nbsp;&nbsp;memory_engine: <span style={{ color: "#22c55e" }}>"BREETH_V2_ENABLED"</span>,
                <br />
                &nbsp;&nbsp;voice_vad_mode: <span style={{ color: "#38bdf8" }}>"FAST_RELEASE_500MS"</span>
                <br />
                {`}`}
              </div>

              <div
                style={{
                  marginTop: "20px",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  background: "rgba(34, 197, 94, 0.1)",
                  padding: "10px 16px",
                  borderRadius: "10px",
                  border: "1px solid rgba(34, 197, 94, 0.3)",
                  color: "#22c55e",
                  fontSize: "14px",
                  fontWeight: 600,
                }}
              >
                <span>✓</span> AI Interviewer Environment Ready
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PART 2: INTERACTIVE AI AVATAR & LIVE VOICE STATE (Frames 420 - 810) */}
      {isPart2 && (
        <div style={{ width: "100%", maxWidth: "1200px", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div
            style={{
              padding: "6px 20px",
              borderRadius: "20px",
              background: "rgba(56, 189, 248, 0.15)",
              border: "1px solid rgba(56, 189, 248, 0.4)",
              color: "#38bdf8",
              fontSize: "13px",
              fontWeight: 800,
              letterSpacing: "2px",
              marginBottom: "16px",
            }}
          >
            🎙️ FEATURE REVEAL #2
          </div>

          <h2 style={{ fontSize: "44px", fontWeight: 900, margin: "0 0 40px 0" }}>
            Voice-Enabled AI Interviewer Avatar
          </h2>

          {/* Avatar Container */}
          <div
            style={{
              transform: `scale(${avatarScale})`,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              position: "relative",
            }}
          >
            {/* Outer Pulsing Rings */}
            <div
              style={{
                position: "absolute",
                width: `${240 + ringPulse1}px`,
                height: `${240 + ringPulse1}px`,
                borderRadius: "50%",
                border: "2px solid rgba(20, 184, 166, 0.4)",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                boxShadow: "0 0 30px rgba(20, 184, 166, 0.2)",
              }}
            />
            <div
              style={{
                position: "absolute",
                width: `${300 + ringPulse2}px`,
                height: `${300 + ringPulse2}px`,
                borderRadius: "50%",
                border: "1px stroke rgba(56, 189, 248, 0.3)",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                borderStyle: "dashed",
              }}
            />

            {/* Core Avatar Circle */}
            <div
              style={{
                width: "180px",
                height: "180px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #14b8a6 0%, #38bdf8 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 0 60px rgba(20, 184, 166, 0.6)",
                zIndex: 2,
              }}
            >
              <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#020617" strokeWidth="2">
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" y1="19" x2="12" y2="22" />
              </svg>
            </div>

            {/* Status Pill Badge */}
            <div
              style={{
                marginTop: "40px",
                padding: "8px 24px",
                borderRadius: "30px",
                background: "rgba(15, 23, 42, 0.9)",
                border: "1px solid rgba(20, 184, 166, 0.4)",
                color: "#14b8a6",
                fontSize: "14px",
                fontWeight: 700,
                letterSpacing: "1px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                boxShadow: "0 10px 25px rgba(0, 0, 0, 0.4)",
              }}
            >
              <div style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#22c55e", boxShadow: "0 0 10px #22c55e" }} />
              STATE: SPEAKING & SYNTHESIZING
            </div>

            {/* Live Speech Bubble */}
            <div
              style={{
                marginTop: "24px",
                background: "rgba(15, 23, 42, 0.85)",
                border: "1px solid rgba(56, 189, 248, 0.3)",
                borderRadius: "16px",
                padding: "20px 32px",
                maxWidth: "700px",
                textAlign: "center",
                fontSize: "18px",
                color: "#cbd5e1",
                fontStyle: "italic",
                boxShadow: "0 10px 30px rgba(0, 0, 0, 0.4)",
              }}
            >
              "Welcome Alex! Let's start by designing a rate-limiting service capable of handling 100,000 requests per second."
            </div>
          </div>
        </div>
      )}

      {/* PART 3: BREETH AI MEMORY ENGINE GRAPH (Frames 810 - 1200) */}
      {isPart3 && (
        <div style={{ width: "100%", maxWidth: "1400px", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div
            style={{
              padding: "6px 20px",
              borderRadius: "20px",
              background: "rgba(34, 197, 94, 0.15)",
              border: "1px solid rgba(34, 197, 94, 0.4)",
              color: "#22c55e",
              fontSize: "13px",
              fontWeight: 800,
              letterSpacing: "2px",
              marginBottom: "16px",
            }}
          >
            🧠 FEATURE REVEAL #3
          </div>

          <h2 style={{ fontSize: "44px", fontWeight: 900, margin: "0 0 36px 0" }}>
            Breeth AI Memory Engine: Zero Context Loss
          </h2>

          {/* Graph Container */}
          <div
            style={{
              width: "100%",
              height: "440px",
              position: "relative",
              background: "rgba(15, 23, 42, 0.8)",
              border: "1px solid rgba(34, 197, 94, 0.3)",
              borderRadius: "24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
            }}
          >
            {/* SVG Connecting Beams */}
            <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
              <line x1="50%" y1="50%" x2="25%" y2="28%" stroke="#14b8a6" strokeWidth="2" strokeDasharray="6 4" />
              <line x1="50%" y1="50%" x2="75%" y2="28%" stroke="#38bdf8" strokeWidth="2" strokeDasharray="6 4" />
              <line x1="50%" y1="50%" x2="50%" y2="78%" stroke="#22c55e" strokeWidth="2" strokeDasharray="6 4" />
            </svg>

            {/* Central Memory Core Node */}
            <div
              style={{
                transform: `scale(${coreScale})`,
                width: "200px",
                height: "200px",
                borderRadius: "50%",
                background: "radial-gradient(circle, #22c55e 0%, #14b8a6 100%)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 0 60px rgba(34, 197, 94, 0.6)",
                zIndex: 10,
                textAlign: "center",
                padding: "20px",
              }}
            >
              <div style={{ fontSize: "28px" }}>🧠</div>
              <div style={{ fontSize: "16px", fontWeight: 900, color: "#020617", marginTop: "4px" }}>
                BREETH AI
              </div>
              <div style={{ fontSize: "11px", fontWeight: 800, color: "#020617", opacity: 0.8 }}>
                MEMORY CORE
              </div>
            </div>

            {/* Satellite Memory Node 1 */}
            <div
              style={{
                transform: `scale(${node1Spring})`,
                position: "absolute",
                top: "20%",
                left: "12%",
                background: "rgba(15, 23, 42, 0.95)",
                border: "1px solid rgba(20, 184, 166, 0.5)",
                borderRadius: "16px",
                padding: "16px 20px",
                maxWidth: "300px",
                boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5)",
              }}
            >
              <div style={{ fontSize: "12px", color: "#14b8a6", fontWeight: 800 }}>TURN 1 RECALL</div>
              <div style={{ fontSize: "14px", color: "#f8fafc", fontWeight: 600, marginTop: "4px" }}>
                Candidate selected Redis cache-aside strategy for low latency.
              </div>
            </div>

            {/* Satellite Memory Node 2 */}
            <div
              style={{
                transform: `scale(${node2Spring})`,
                position: "absolute",
                top: "20%",
                right: "12%",
                background: "rgba(15, 23, 42, 0.95)",
                border: "1px solid rgba(56, 189, 248, 0.5)",
                borderRadius: "16px",
                padding: "16px 20px",
                maxWidth: "300px",
                boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5)",
              }}
            >
              <div style={{ fontSize: "12px", color: "#38bdf8", fontWeight: 800 }}>TURN 3 RECALL</div>
              <div style={{ fontSize: "14px", color: "#f8fafc", fontWeight: 600, marginTop: "4px" }}>
                Compared Token Bucket vs Leaky Bucket algorithms accurately.
              </div>
            </div>

            {/* Satellite Memory Node 3 */}
            <div
              style={{
                transform: `scale(${node3Spring})`,
                position: "absolute",
                bottom: "10%",
                left: "36%",
                right: "36%",
                background: "rgba(15, 23, 42, 0.95)",
                border: "1px solid rgba(34, 197, 94, 0.5)",
                borderRadius: "16px",
                padding: "16px 20px",
                textAlign: "center",
                boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5)",
              }}
            >
              <div style={{ fontSize: "12px", color: "#22c55e", fontWeight: 800 }}>CROSS-TURN KNOWLEDGE GRAPH</div>
              <div style={{ fontSize: "14px", color: "#f8fafc", fontWeight: 600, marginTop: "4px" }}>
                Seamlessly connects past answers to deep follow-up questions.
              </div>
            </div>
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};
