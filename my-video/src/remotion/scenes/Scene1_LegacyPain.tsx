import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

export const Scene1_LegacyPain: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance animations
  const titleOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });
  const titleScale = spring({ frame, fps, config: { damping: 12, mass: 0.8 } });

  // Sub-segment timing (in frames relative to Scene 1)
  const isPart1 = frame < 300;
  const isPart2 = frame >= 300 && frame < 750;
  const isPart3 = frame >= 750;

  // Counter animations for Part 1
  const metric1 = Math.floor(interpolate(frame, [30, 90], [0, 82], { extrapolateRight: "clamp" }));
  const metric2 = Math.floor(interpolate(frame, [45, 105], [0, 14], { extrapolateRight: "clamp" }));
  const metric3 = Math.floor(interpolate(frame, [60, 120], [0, 15], { extrapolateRight: "clamp" }));

  // Part 2 Card Animations
  const card1Progress = spring({ frame: frame - 300, fps, config: { damping: 14 } });
  const card2Progress = spring({ frame: frame - 380, fps, config: { damping: 14 } });
  const card3Progress = spring({ frame: frame - 460, fps, config: { damping: 14 } });

  // Stamp effect
  const stampOpacity = interpolate(frame, [600, 615], [0, 1], { extrapolateRight: "clamp" });
  const stampScale = spring({ frame: frame - 600, fps, config: { damping: 10, mass: 1.2 } });

  // Part 3 Solution Reveal Animation
  const part3Opacity = interpolate(frame, [750, 780], [0, 1], { extrapolateRight: "clamp" });
  const part3Scale = spring({ frame: frame - 750, fps, config: { damping: 12 } });

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
      {/* PART 1: THE CRITICAL FLAW & BIG METRICS (Frames 0 - 300) */}
      {isPart1 && (
        <div
          style={{
            opacity: titleOpacity,
            transform: `scale(${titleScale})`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            width: "100%",
            maxWidth: "1400px",
          }}
        >
          {/* Danger Tag */}
          <div
            style={{
              padding: "8px 24px",
              borderRadius: "30px",
              background: "rgba(239, 68, 68, 0.15)",
              border: "1px solid rgba(239, 68, 68, 0.4)",
              color: "#ef4444",
              fontSize: "14px",
              fontWeight: 800,
              letterSpacing: "2px",
              textTransform: "uppercase",
              marginBottom: "24px",
              boxShadow: "0 0 20px rgba(239, 68, 68, 0.3)",
            }}
          >
            ⚠️ THE HIRING CRISIS
          </div>

          <h1
            style={{
              fontSize: "64px",
              fontWeight: 900,
              letterSpacing: "-1.5px",
              lineHeight: 1.1,
              margin: 0,
              background: "linear-gradient(to bottom, #ffffff 0%, #cbd5e1 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            TECHNICAL HIRING IS <span style={{ color: "#ef4444", WebkitTextFillColor: "#ef4444" }}>BROKEN</span>
          </h1>

          <p style={{ fontSize: "24px", color: "#94a3b8", marginTop: "16px", maxWidth: "900px", lineHeight: 1.5 }}>
            Legacy engineering interviews rely on static algorithmic puzzles, subjective human grading, and slow feedback loops.
          </p>

          {/* 3 Metric Cards Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "32px", width: "100%", marginTop: "60px" }}>
            {/* Card 1 */}
            <div
              style={{
                background: "rgba(15, 23, 42, 0.8)",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                borderRadius: "20px",
                padding: "36px",
                textAlign: "center",
                boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5)",
              }}
            >
              <div style={{ fontSize: "72px", fontWeight: 900, color: "#ef4444", fontFamily: "monospace" }}>
                {metric1}%
              </div>
              <div style={{ fontSize: "18px", fontWeight: 700, color: "#f8fafc", marginTop: "10px" }}>
                Candidate Frustration
              </div>
              <div style={{ fontSize: "14px", color: "#64748b", marginTop: "8px" }}>
                Candidates abandon pipelines due to irrelevant coding tests.
              </div>
            </div>

            {/* Card 2 */}
            <div
              style={{
                background: "rgba(15, 23, 42, 0.8)",
                border: "1px solid rgba(245, 158, 11, 0.3)",
                borderRadius: "20px",
                padding: "36px",
                textAlign: "center",
                boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5)",
              }}
            >
              <div style={{ fontSize: "72px", fontWeight: 900, color: "#f59e0b", fontFamily: "monospace" }}>
                {metric2} DAYS
              </div>
              <div style={{ fontSize: "18px", fontWeight: 700, color: "#f8fafc", marginTop: "10px" }}>
                Average Delay
              </div>
              <div style={{ fontSize: "14px", color: "#64748b", marginTop: "8px" }}>
                Wasted waiting for engineers to write manual review notes.
              </div>
            </div>

            {/* Card 3 */}
            <div
              style={{
                background: "rgba(15, 23, 42, 0.8)",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                borderRadius: "20px",
                padding: "36px",
                textAlign: "center",
                boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5)",
              }}
            >
              <div style={{ fontSize: "72px", fontWeight: 900, color: "#ef4444", fontFamily: "monospace" }}>
                ${metric3}K+
              </div>
              <div style={{ fontSize: "18px", fontWeight: 700, color: "#f8fafc", marginTop: "10px" }}>
                Cost Per Bad Hire
              </div>
              <div style={{ fontSize: "14px", color: "#64748b", marginTop: "8px" }}>
                Lost in engineering time, mishires, and onboarding overhead.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PART 2: 3 DETAILED PROBLEM CARDS & STAMP (Frames 300 - 750) */}
      {isPart2 && (
        <div style={{ width: "100%", maxWidth: "1400px", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <h2 style={{ fontSize: "42px", fontWeight: 800, marginBottom: "40px", color: "#f8fafc" }}>
            3 Core Failures of Legacy Technical Hiring
          </h2>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "32px", width: "100%" }}>
            {/* Card 1: Static Quizzes */}
            <div
              style={{
                transform: `scale(${card1Progress})`,
                background: "rgba(15, 23, 42, 0.9)",
                border: "2px solid rgba(239, 68, 68, 0.5)",
                borderRadius: "20px",
                padding: "32px",
                position: "relative",
                overflow: "hidden",
                boxShadow: "0 0 30px rgba(239, 68, 68, 0.15)",
              }}
            >
              <div style={{ fontSize: "36px", marginBottom: "16px" }}>📝</div>
              <h3 style={{ fontSize: "22px", fontWeight: 700, color: "#ef4444", margin: "0 0 12px 0" }}>
                1. Static LeetCode Quizzes
              </h3>
              <p style={{ fontSize: "15px", color: "#cbd5e1", lineHeight: 1.6, margin: 0 }}>
                Rote algorithm puzzles test memorization rather than real-world system architecture, collaborative design, or clean coding standards.
              </p>
              <div style={{ marginTop: "20px", padding: "8px 12px", background: "rgba(239, 68, 68, 0.1)", borderRadius: "8px", color: "#fca5a5", fontSize: "13px", fontWeight: 600 }}>
                ❌ High Leaks & Copy-Paste Fraud
              </div>
            </div>

            {/* Card 2: Human Bias */}
            <div
              style={{
                transform: `scale(${card2Progress})`,
                background: "rgba(15, 23, 42, 0.9)",
                border: "2px solid rgba(245, 158, 11, 0.5)",
                borderRadius: "20px",
                padding: "32px",
                position: "relative",
                overflow: "hidden",
                boxShadow: "0 0 30px rgba(245, 158, 11, 0.15)",
              }}
            >
              <div style={{ fontSize: "36px", marginBottom: "16px" }}>🧠</div>
              <h3 style={{ fontSize: "22px", fontWeight: 700, color: "#f59e0b", margin: "0 0 12px 0" }}>
                2. Human Bias & Fatigue
              </h3>
              <p style={{ fontSize: "15px", color: "#cbd5e1", lineHeight: 1.6, margin: 0 }}>
                Human interviewers have off days, varying standards, and subconscious biases that lead to inconsistent candidate evaluation.
              </p>
              <div style={{ marginTop: "20px", padding: "8px 12px", background: "rgba(245, 158, 11, 0.1)", borderRadius: "8px", color: "#fcd34d", fontSize: "13px", fontWeight: 600 }}>
                ❌ Unstandardized Grading Rubrics
              </div>
            </div>

            {/* Card 3: Manual Scoring */}
            <div
              style={{
                transform: `scale(${card3Progress})`,
                background: "rgba(15, 23, 42, 0.9)",
                border: "2px solid rgba(239, 68, 68, 0.5)",
                borderRadius: "20px",
                padding: "32px",
                position: "relative",
                overflow: "hidden",
                boxShadow: "0 0 30px rgba(239, 68, 68, 0.15)",
              }}
            >
              <div style={{ fontSize: "36px", marginBottom: "16px" }}>⏳</div>
              <h3 style={{ fontSize: "22px", fontWeight: 700, color: "#ef4444", margin: "0 0 12px 0" }}>
                3. Manual Scoring Bottlenecks
              </h3>
              <p style={{ fontSize: "15px", color: "#cbd5e1", lineHeight: 1.6, margin: 0 }}>
                Senior engineering leads waste hours every week writing evaluation notes instead of shipping mission-critical features.
              </p>
              <div style={{ marginTop: "20px", padding: "8px 12px", background: "rgba(239, 68, 68, 0.1)", borderRadius: "8px", color: "#fca5a5", fontSize: "13px", fontWeight: 600 }}>
                ❌ Slow Feedback Loop (2+ Weeks)
              </div>
            </div>
          </div>

          {/* Large Animated Overlay Stamp */}
          {frame >= 600 && (
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: `translate(-50%, -50%) rotate(-12deg) scale(${stampScale})`,
                opacity: stampOpacity,
                border: "8px solid #ef4444",
                borderRadius: "20px",
                padding: "20px 60px",
                backgroundColor: "rgba(2, 6, 23, 0.9)",
                color: "#ef4444",
                fontSize: "56px",
                fontWeight: 900,
                letterSpacing: "4px",
                boxShadow: "0 0 80px rgba(239, 68, 68, 0.8)",
                pointerEvents: "none",
                textAlign: "center",
              }}
            >
              OUTDATED & INEFFICIENT
            </div>
          )}
        </div>
      )}

      {/* PART 3: VISION & PARADIGM SHIFT (Frames 750 - 1050) */}
      {isPart3 && (
        <div
          style={{
            opacity: part3Opacity,
            transform: `scale(${part3Scale})`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            maxWidth: "1100px",
          }}
        >
          <div
            style={{
              padding: "10px 28px",
              borderRadius: "30px",
              background: "rgba(20, 184, 166, 0.15)",
              border: "1px solid rgba(20, 184, 166, 0.4)",
              color: "#14b8a6",
              fontSize: "14px",
              fontWeight: 800,
              letterSpacing: "2px",
              marginBottom: "32px",
              boxShadow: "0 0 30px rgba(20, 184, 166, 0.3)",
            }}
          >
            ⚡ THE NEW PARADIGM
          </div>

          <h2
            style={{
              fontSize: "56px",
              fontWeight: 900,
              letterSpacing: "-1px",
              lineHeight: 1.2,
              margin: 0,
              background: "linear-gradient(to right, #14b8a6, #38bdf8, #22c55e)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            THERE IS A BETTER WAY.
          </h2>

          <p style={{ fontSize: "28px", color: "#cbd5e1", marginTop: "24px", lineHeight: 1.5, fontWeight: 500 }}>
            What if interviews were conducted by an <span style={{ color: "#38bdf8", fontWeight: 700 }}>Autonomous AI Agent</span> with long-term memory, real-time voice turn-taking, and instant objective scoring?
          </p>
        </div>
      )}
    </AbsoluteFill>
  );
};
