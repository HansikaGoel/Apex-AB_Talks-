import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

export const Scene4_AnalyticsScorecard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Sub-segments (0-420: Dashboard Metrics & Bars, 420-780: Attempt History Trend, 780-1200: A+ Scorecard)
  const isPart1 = frame < 420;
  const isPart2 = frame >= 420 && frame < 780;
  const isPart3 = frame >= 780;

  // Animated counters for Part 1
  const scoreCounter = Math.floor(interpolate(frame, [20, 100], [0, 96], { extrapolateRight: "clamp" }));
  const techCounter = Math.floor(interpolate(frame, [30, 110], [0, 98], { extrapolateRight: "clamp" }));
  const archCounter = Math.floor(interpolate(frame, [40, 120], [0, 95], { extrapolateRight: "clamp" }));
  const commCounter = Math.floor(interpolate(frame, [50, 130], [0, 94], { extrapolateRight: "clamp" }));

  // Part 1 Progress Bar Fills
  const bar1Fill = interpolate(frame, [60, 140], [0, 100], { extrapolateRight: "clamp" });
  const bar2Fill = interpolate(frame, [70, 150], [0, 96], { extrapolateRight: "clamp" });
  const bar3Fill = interpolate(frame, [80, 160], [0, 94], { extrapolateRight: "clamp" });
  const bar4Fill = interpolate(frame, [90, 170], [0, 95], { extrapolateRight: "clamp" });

  // Part 2 Attempt History Trend Animations
  const trendFrame = frame - 420;
  const card1Spring = spring({ frame: trendFrame - 20, fps, config: { damping: 12 } });
  const card2Spring = spring({ frame: trendFrame - 70, fps, config: { damping: 12 } });
  const card3Spring = spring({ frame: trendFrame - 120, fps, config: { damping: 12 } });

  // Part 3 A+ Scorecard Grand Entrance
  const scoreFrame = frame - 780;
  const scorecardScale = spring({ frame: scoreFrame, fps, config: { damping: 10, mass: 0.9 } });
  const badgeScale = spring({ frame: scoreFrame - 40, fps, config: { damping: 8 } });

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
      {/* PART 1: REAL-TIME ANALYTICS DASHBOARD (Frames 0 - 420) */}
      {isPart1 && (
        <div style={{ width: "100%", maxWidth: "1350px", display: "flex", flexDirection: "column", alignItems: "center" }}>
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
            📊 REAL-TIME EVALUATION
          </div>

          <h2 style={{ fontSize: "44px", fontWeight: 900, margin: "0 0 36px 0" }}>
            Real-Time Analytics & Skill Breakdown
          </h2>

          {/* 4 Top Stat Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "24px", width: "100%", marginBottom: "36px" }}>
            <div style={{ background: "rgba(15, 23, 42, 0.85)", border: "1px solid rgba(34, 197, 94, 0.4)", borderRadius: "20px", padding: "24px", textAlign: "center", boxShadow: "0 0 25px rgba(34, 197, 94, 0.15)" }}>
              <div style={{ fontSize: "52px", fontWeight: 900, color: "#22c55e", fontFamily: "monospace" }}>{scoreCounter}/100</div>
              <div style={{ fontSize: "14px", fontWeight: 700, color: "#94a3b8", marginTop: "4px" }}>OVERALL SCORE</div>
            </div>
            <div style={{ background: "rgba(15, 23, 42, 0.85)", border: "1px solid rgba(20, 184, 166, 0.4)", borderRadius: "20px", padding: "24px", textAlign: "center", boxShadow: "0 0 25px rgba(20, 184, 166, 0.15)" }}>
              <div style={{ fontSize: "52px", fontWeight: 900, color: "#14b8a6", fontFamily: "monospace" }}>{techCounter}%</div>
              <div style={{ fontSize: "14px", fontWeight: 700, color: "#94a3b8", marginTop: "4px" }}>TECH FLUENCY</div>
            </div>
            <div style={{ background: "rgba(15, 23, 42, 0.85)", border: "1px solid rgba(56, 189, 248, 0.4)", borderRadius: "20px", padding: "24px", textAlign: "center", boxShadow: "0 0 25px rgba(56, 189, 248, 0.15)" }}>
              <div style={{ fontSize: "52px", fontWeight: 900, color: "#38bdf8", fontFamily: "monospace" }}>{archCounter}%</div>
              <div style={{ fontSize: "14px", fontWeight: 700, color: "#94a3b8", marginTop: "4px" }}>SYSTEM DESIGN</div>
            </div>
            <div style={{ background: "rgba(15, 23, 42, 0.85)", border: "1px solid rgba(168, 85, 247, 0.4)", borderRadius: "20px", padding: "24px", textAlign: "center", boxShadow: "0 0 25px rgba(168, 85, 247, 0.15)" }}>
              <div style={{ fontSize: "52px", fontWeight: 900, color: "#a855f7", fontFamily: "monospace" }}>{commCounter}%</div>
              <div style={{ fontSize: "14px", fontWeight: 700, color: "#94a3b8", marginTop: "4px" }}>COMMUNICATION</div>
            </div>
          </div>

          {/* Skill Progress Bars Panel */}
          <div style={{ width: "100%", background: "rgba(15, 23, 42, 0.85)", border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: "24px", padding: "36px", display: "flex", flexDirection: "column", gap: "20px" }}>
            {/* Bar 1 */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "15px", fontWeight: 700, color: "#f8fafc", marginBottom: "8px" }}>
                <span>Code Correctness & Cleanliness</span>
                <span style={{ color: "#22c55e" }}>100%</span>
              </div>
              <div style={{ width: "100%", height: "12px", backgroundColor: "#020617", borderRadius: "6px", overflow: "hidden" }}>
                <div style={{ width: `${bar1Fill}%`, height: "100%", background: "linear-gradient(to right, #14b8a6, #22c55e)", boxShadow: "0 0 15px rgba(34, 197, 94, 0.5)" }} />
              </div>
            </div>

            {/* Bar 2 */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "15px", fontWeight: 700, color: "#f8fafc", marginBottom: "8px" }}>
                <span>Distributed System Trade-offs</span>
                <span style={{ color: "#14b8a6" }}>96%</span>
              </div>
              <div style={{ width: "100%", height: "12px", backgroundColor: "#020617", borderRadius: "6px", overflow: "hidden" }}>
                <div style={{ width: `${bar2Fill}%`, height: "100%", background: "linear-gradient(to right, #0284c7, #14b8a6)", boxShadow: "0 0 15px rgba(20, 184, 166, 0.5)" }} />
              </div>
            </div>

            {/* Bar 3 */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "15px", fontWeight: 700, color: "#f8fafc", marginBottom: "8px" }}>
                <span>Concurrency & Edge Case Handling</span>
                <span style={{ color: "#38bdf8" }}>94%</span>
              </div>
              <div style={{ width: "100%", height: "12px", backgroundColor: "#020617", borderRadius: "6px", overflow: "hidden" }}>
                <div style={{ width: `${bar3Fill}%`, height: "100%", background: "linear-gradient(to right, #0284c7, #38bdf8)", boxShadow: "0 0 15px rgba(56, 189, 248, 0.5)" }} />
              </div>
            </div>

            {/* Bar 4 */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "15px", fontWeight: 700, color: "#f8fafc", marginBottom: "8px" }}>
                <span>Algorithmic & Problem Solving Depth</span>
                <span style={{ color: "#a855f7" }}>95%</span>
              </div>
              <div style={{ width: "100%", height: "12px", backgroundColor: "#020617", borderRadius: "6px", overflow: "hidden" }}>
                <div style={{ width: `${bar4Fill}%`, height: "100%", background: "linear-gradient(to right, #38bdf8, #a855f7)", boxShadow: "0 0 15px rgba(168, 85, 247, 0.5)" }} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PART 2: ATTEMPT HISTORY TRACKING (Frames 420 - 780) */}
      {isPart2 && (
        <div style={{ width: "100%", maxWidth: "1300px", display: "flex", flexDirection: "column", alignItems: "center" }}>
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
            📈 ATTEMPT HISTORY TRACKING
          </div>

          <h2 style={{ fontSize: "44px", fontWeight: 900, margin: "0 0 36px 0" }}>
            Candidate Progression & Session History
          </h2>

          {/* 3 Attempt Timeline Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "32px", width: "100%" }}>
            {/* Session 1 */}
            <div
              style={{
                transform: `scale(${card1Spring})`,
                background: "rgba(15, 23, 42, 0.85)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "20px",
                padding: "32px",
                boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5)",
              }}
            >
              <div style={{ fontSize: "12px", fontWeight: 800, color: "#64748b" }}>ATTEMPT #1 (DAY 1)</div>
              <div style={{ fontSize: "42px", fontWeight: 900, color: "#cbd5e1", margin: "8px 0" }}>76%</div>
              <div style={{ fontSize: "16px", fontWeight: 700, color: "#94a3b8" }}>Proficient</div>
              <div style={{ fontSize: "13px", color: "#64748b", marginTop: "12px" }}>
                Identified basic cache strategy but struggled with edge-case invalidation.
              </div>
            </div>

            {/* Session 2 */}
            <div
              style={{
                transform: `scale(${card2Spring})`,
                background: "rgba(15, 23, 42, 0.85)",
                border: "1px solid rgba(56, 189, 248, 0.3)",
                borderRadius: "20px",
                padding: "32px",
                boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5)",
              }}
            >
              <div style={{ fontSize: "12px", fontWeight: 800, color: "#38bdf8" }}>ATTEMPT #2 (DAY 4)</div>
              <div style={{ fontSize: "42px", fontWeight: 900, color: "#38bdf8", margin: "8px 0" }}>88%</div>
              <div style={{ fontSize: "16px", fontWeight: 700, color: "#cbd5e1" }}>Advanced Architect</div>
              <div style={{ fontSize: "13px", color: "#94a3b8", marginTop: "12px" }}>
                Integrated token bucket algorithm & explained rate-limit headers clearly.
              </div>
            </div>

            {/* Session 3 */}
            <div
              style={{
                transform: `scale(${card3Spring})`,
                background: "rgba(15, 23, 42, 0.85)",
                border: "2px solid rgba(34, 197, 94, 0.5)",
                borderRadius: "20px",
                padding: "32px",
                boxShadow: "0 0 30px rgba(34, 197, 94, 0.2)",
              }}
            >
              <div style={{ fontSize: "12px", fontWeight: 800, color: "#22c55e" }}>ATTEMPT #3 (CURRENT)</div>
              <div style={{ fontSize: "42px", fontWeight: 900, color: "#22c55e", margin: "8px 0" }}>96%</div>
              <div style={{ fontSize: "16px", fontWeight: 700, color: "#22c55e" }}>Expert Level</div>
              <div style={{ fontSize: "13px", color: "#cbd5e1", marginTop: "12px" }}>
                Flawless distributed system design with instant zero-lockout turn taking.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PART 3: DYNAMIC A+ GRADE SCORECARD REVEAL (Frames 780 - 1200) */}
      {isPart3 && (
        <div style={{ width: "100%", maxWidth: "1100px", display: "flex", flexDirection: "column", alignItems: "center" }}>
          {/* Main Scorecard Panel */}
          <div
            style={{
              transform: `scale(${scorecardScale})`,
              width: "100%",
              background: "rgba(15, 23, 42, 0.95)",
              border: "2px solid rgba(34, 197, 94, 0.6)",
              borderRadius: "28px",
              padding: "48px",
              boxShadow: "0 0 80px rgba(34, 197, 94, 0.3)",
              display: "grid",
              gridTemplateColumns: "240px 1fr",
              gap: "48px",
              alignItems: "center",
            }}
          >
            {/* Left: Giant A+ Stamp Badge */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <div
                style={{
                  transform: `scale(${badgeScale})`,
                  width: "180px",
                  height: "180px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #22c55e 0%, #14b8a6 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "96px",
                  fontWeight: 900,
                  color: "#020617",
                  boxShadow: "0 0 60px rgba(34, 197, 94, 0.8)",
                }}
              >
                A+
              </div>
              <div style={{ marginTop: "16px", fontSize: "14px", fontWeight: 800, color: "#22c55e", letterSpacing: "1px" }}>
                VERIFIED GRADE
              </div>
            </div>

            {/* Right: Detailed Summary & Hiring Recommendation */}
            <div>
              <div style={{ fontSize: "14px", fontWeight: 800, color: "#94a3b8", letterSpacing: "1px" }}>
                OFFICIAL CANDIDATE EVALUATION SCORECARD
              </div>
              <h3 style={{ fontSize: "32px", fontWeight: 900, color: "#f8fafc", margin: "8px 0 20px 0" }}>
                Recommendation: <span style={{ color: "#22c55e" }}>STRONG HIRE</span>
              </h3>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "16px", color: "#cbd5e1" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ color: "#22c55e", fontWeight: 900 }}>✓</span>
                  <span>Code Correctness & Architecture: <strong>100 / 100</strong></span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ color: "#22c55e", fontWeight: 900 }}>✓</span>
                  <span>System Scalability & Trade-offs: <strong>96 / 100</strong></span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ color: "#22c55e", fontWeight: 900 }}>✓</span>
                  <span>Conversational Turn-Taking & Clarity: <strong>94 / 100</strong></span>
                </div>
              </div>

              <div
                style={{
                  marginTop: "24px",
                  padding: "12px 20px",
                  background: "rgba(34, 197, 94, 0.1)",
                  borderRadius: "12px",
                  border: "1px solid rgba(34, 197, 94, 0.3)",
                  color: "#4ade80",
                  fontSize: "14px",
                  fontWeight: 700,
                }}
              >
                🏆 Top 1% Engineering Candidate — Automated Report Generated in 0.4s
              </div>
            </div>
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};
