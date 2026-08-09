import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

export const Scene5_FinaleCTA: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Sub-segments (0-450: Hackathon Title, 450-900: 4 Pillars Grid, 900-1350: CTA & Fade Out)
  const isPart1 = frame < 450;
  const isPart2 = frame >= 450 && frame < 900;
  const isPart3 = frame >= 900;

  // Animations for Part 1
  const titleSpring = spring({ frame, fps, config: { damping: 10, mass: 0.8 } });

  // Animations for Part 2 (4 Pillars Grid)
  const gridFrame = frame - 450;
  const p1Spring = spring({ frame: gridFrame - 20, fps, config: { damping: 12 } });
  const p2Spring = spring({ frame: gridFrame - 60, fps, config: { damping: 12 } });
  const p3Spring = spring({ frame: gridFrame - 100, fps, config: { damping: 12 } });
  const p4Spring = spring({ frame: gridFrame - 140, fps, config: { damping: 12 } });

  // Animations for Part 3 (CTA & Fade Out)
  const ctaFrame = frame - 900;
  const ctaSpring = spring({ frame: ctaFrame, fps, config: { damping: 10 } });
  const fadeOutOpacity = interpolate(frame, [1250, 1350], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

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
        opacity: fadeOutOpacity,
      }}
    >
      {/* PART 1: HACKATHON TITLE CARD (Frames 0 - 450) */}
      {isPart1 && (
        <div
          style={{
            transform: `scale(${titleSpring})`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            maxWidth: "1200px",
          }}
        >
          {/* Hackathon Badge */}
          <div
            style={{
              padding: "10px 32px",
              borderRadius: "30px",
              background: "linear-gradient(135deg, rgba(168, 85, 247, 0.2) 0%, rgba(56, 189, 248, 0.2) 100%)",
              border: "1px solid rgba(168, 85, 247, 0.5)",
              color: "#c084fc",
              fontSize: "16px",
              fontWeight: 800,
              letterSpacing: "3px",
              textTransform: "uppercase",
              marginBottom: "32px",
              boxShadow: "0 0 30px rgba(168, 85, 247, 0.3)",
            }}
          >
            🏆 ABTALKS HACKATHON 2026 PRESENTATION
          </div>

          <h1
            style={{
              fontSize: "76px",
              fontWeight: 900,
              letterSpacing: "-2px",
              lineHeight: 1.1,
              margin: 0,
              background: "linear-gradient(to right, #14b8a6, #38bdf8, #22c55e)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            THE INTERVIEW AGENT
          </h1>

          <p style={{ fontSize: "28px", color: "#cbd5e1", marginTop: "20px", fontWeight: 600 }}>
            Reimagining Technical Hiring for the AI Era
          </p>

          {/* Central Emblem Glow */}
          <div
            style={{
              marginTop: "48px",
              width: "120px",
              height: "120px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #14b8a6 0%, #38bdf8 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 60px rgba(20, 184, 166, 0.8)",
            }}
          >
            <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#020617" strokeWidth="2.5">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </div>
        </div>
      )}

      {/* PART 2: 4 PILLARS OF INNOVATION (Frames 450 - 900) */}
      {isPart2 && (
        <div style={{ width: "100%", maxWidth: "1350px", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <h2 style={{ fontSize: "48px", fontWeight: 900, margin: "0 0 40px 0", textAlign: "center" }}>
            The 4 Technological Pillars
          </h2>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "32px", width: "100%" }}>
            {/* Pillar 1 */}
            <div
              style={{
                transform: `scale(${p1Spring})`,
                background: "rgba(15, 23, 42, 0.9)",
                border: "1px solid rgba(20, 184, 166, 0.4)",
                borderRadius: "24px",
                padding: "36px",
                boxShadow: "0 10px 30px rgba(20, 184, 166, 0.15)",
                display: "flex",
                gap: "20px",
                alignItems: "flex-start",
              }}
            >
              <div style={{ fontSize: "40px" }}>🧠</div>
              <div>
                <h3 style={{ fontSize: "22px", fontWeight: 800, color: "#14b8a6", margin: "0 0 8px 0" }}>
                  Breeth AI Memory Engine
                </h3>
                <p style={{ fontSize: "15px", color: "#cbd5e1", margin: 0, lineHeight: 1.5 }}>
                  Full-session context retention & cross-turn knowledge graphs to evaluate system design depth.
                </p>
              </div>
            </div>

            {/* Pillar 2 */}
            <div
              style={{
                transform: `scale(${p2Spring})`,
                background: "rgba(15, 23, 42, 0.9)",
                border: "1px solid rgba(56, 189, 248, 0.4)",
                borderRadius: "24px",
                padding: "36px",
                boxShadow: "0 10px 30px rgba(56, 189, 248, 0.15)",
                display: "flex",
                gap: "20px",
                alignItems: "flex-start",
              }}
            >
              <div style={{ fontSize: "40px" }}>🎙️</div>
              <div>
                <h3 style={{ fontSize: "22px", fontWeight: 800, color: "#38bdf8", margin: "0 0 8px 0" }}>
                  500ms VAD Release Buffer
                </h3>
                <p style={{ fontSize: "15px", color: "#cbd5e1", margin: 0, lineHeight: 1.5 }}>
                  Human-grade conversational pace without awkward silences or artificial hand-off delays.
                </p>
              </div>
            </div>

            {/* Pillar 3 */}
            <div
              style={{
                transform: `scale(${p3Spring})`,
                background: "rgba(15, 23, 42, 0.9)",
                border: "1px solid rgba(34, 197, 94, 0.4)",
                borderRadius: "24px",
                padding: "36px",
                boxShadow: "0 10px 30px rgba(34, 197, 94, 0.15)",
                display: "flex",
                gap: "20px",
                alignItems: "flex-start",
              }}
            >
              <div style={{ fontSize: "40px" }}>⚡</div>
              <div>
                <h3 style={{ fontSize: "22px", fontWeight: 800, color: "#22c55e", margin: "0 0 8px 0" }}>
                  Zero-Lockout Microphone
                </h3>
                <p style={{ fontSize: "15px", color: "#cbd5e1", margin: 0, lineHeight: 1.5 }}>
                  Instant barge-in capability halting AI speech synthesis in under 18ms for natural interaction.
                </p>
              </div>
            </div>

            {/* Pillar 4 */}
            <div
              style={{
                transform: `scale(${p4Spring})`,
                background: "rgba(15, 23, 42, 0.9)",
                border: "1px solid rgba(168, 85, 247, 0.4)",
                borderRadius: "24px",
                padding: "36px",
                boxShadow: "0 10px 30px rgba(168, 85, 247, 0.15)",
                display: "flex",
                gap: "20px",
                alignItems: "flex-start",
              }}
            >
              <div style={{ fontSize: "40px" }}>📊</div>
              <div>
                <h3 style={{ fontSize: "22px", fontWeight: 800, color: "#a855f7", margin: "0 0 8px 0" }}>
                  Real-Time Analytics & A+ Cards
                </h3>
                <p style={{ fontSize: "15px", color: "#cbd5e1", margin: 0, lineHeight: 1.5 }}>
                  Automated objective scoring, attempt trend tracking, and verified candidate scorecards.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PART 3: CALL TO ACTION FINALE (Frames 900 - 1350) */}
      {isPart3 && (
        <div
          style={{
            transform: `scale(${ctaSpring})`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            maxWidth: "1100px",
          }}
        >
          <h2 style={{ fontSize: "52px", fontWeight: 900, margin: "0 0 20px 0", color: "#f8fafc" }}>
            Ready to Transform Your Technical Hiring?
          </h2>

          <p style={{ fontSize: "22px", color: "#94a3b8", marginBottom: "40px" }}>
            Experience the live interactive demo and explore our open-source architecture.
          </p>

          {/* URL CTA Box */}
          <div
            style={{
              padding: "20px 48px",
              borderRadius: "20px",
              background: "linear-gradient(135deg, rgba(20, 184, 166, 0.2) 0%, rgba(56, 189, 248, 0.2) 100%)",
              border: "2px solid #14b8a6",
              boxShadow: "0 0 50px rgba(20, 184, 166, 0.4)",
              fontSize: "24px",
              fontWeight: 800,
              color: "#38bdf8",
              fontFamily: "monospace",
              letterSpacing: "1px",
            }}
          >
            github.com/abtalks-hackathon-2026/the-interview-agent
          </div>

          <div style={{ marginTop: "48px", fontSize: "15px", color: "#64748b", fontWeight: 600 }}>
            Built for ABTalks Hackathon 2026 • Thank You For Watching!
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};
