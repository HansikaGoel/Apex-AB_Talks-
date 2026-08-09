import React from "react";
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from "remotion";

export const Scene3_VoiceAudio: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Sub-segments (0-450: Studio Equalizers, 450-990: 500ms Release Buffer, 990-1500: Zero-Lockout Mic)
  const isPart1 = frame < 450;
  const isPart2 = frame >= 450 && frame < 990;
  const isPart3 = frame >= 990;

  // Equalizer wave generators
  const aiEqualizerBars = Array.from({ length: 14 }).map((_, i) => {
    return Math.abs(Math.sin(frame * 0.15 + i * 0.4)) * 60 + 12;
  });

  const candEqualizerBars = Array.from({ length: 14 }).map((_, i) => {
    return Math.abs(Math.cos(frame * 0.18 + i * 0.5)) * 55 + 10;
  });

  // Part 2: 500ms VAD Buffer Meter Calculation
  const bufferFrame = (frame - 450) % 240; // 8s loop
  const bufferFillPercent = Math.min(100, (bufferFrame / 90) * 100); // Fills in 3s (90f at 30fps)
  const isHandOffTriggered = bufferFrame >= 90;

  // Part 3: Zero-Lockout Barge-in Animation
  const bargeFrame = frame - 990;
  const isInterrupted = bargeFrame > 60;
  const bargeSpring = spring({ frame: bargeFrame - 60, fps, config: { damping: 10 } });

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
      {/* PART 1: LIVE DUAL AUDIO EQUALIZERS (Frames 0 - 450) */}
      {isPart1 && (
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
            🎙️ DEMO SCENE #1
          </div>

          <h2 style={{ fontSize: "44px", fontWeight: 900, margin: "0 0 36px 0" }}>
            Live Web Audio Turn-Taking Engine
          </h2>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "40px", width: "100%" }}>
            {/* Left Box: AI Voice Output */}
            <div
              style={{
                background: "rgba(15, 23, 42, 0.85)",
                border: "1px solid rgba(20, 184, 166, 0.4)",
                borderRadius: "24px",
                padding: "36px",
                boxShadow: "0 20px 40px rgba(0, 0, 0, 0.5), 0 0 30px rgba(20, 184, 166, 0.15)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <div style={{ fontSize: "14px", fontWeight: 800, color: "#14b8a6", letterSpacing: "1px" }}>
                AI INTERVIEWER VOICE STREAM (TTS)
              </div>

              {/* Equalizer Bars */}
              <div style={{ display: "flex", alignItems: "flex-end", gap: "8px", height: "120px", marginTop: "30px" }}>
                {aiEqualizerBars.map((height, i) => (
                  <div
                    key={i}
                    style={{
                      width: "12px",
                      height: `${height}px`,
                      background: "linear-gradient(to top, #14b8a6, #2dd4bf)",
                      borderRadius: "6px",
                      boxShadow: "0 0 10px rgba(20, 184, 166, 0.5)",
                    }}
                  />
                ))}
              </div>

              <div style={{ marginTop: "24px", fontSize: "14px", color: "#cbd5e1", fontWeight: 600 }}>
                Status: <span style={{ color: "#22c55e" }}>STREAMING 24kHz AUDIO</span>
              </div>
            </div>

            {/* Right Box: Candidate Mic Input */}
            <div
              style={{
                background: "rgba(15, 23, 42, 0.85)",
                border: "1px solid rgba(56, 189, 248, 0.4)",
                borderRadius: "24px",
                padding: "36px",
                boxShadow: "0 20px 40px rgba(0, 0, 0, 0.5), 0 0 30px rgba(56, 189, 248, 0.15)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <div style={{ fontSize: "14px", fontWeight: 800, color: "#38bdf8", letterSpacing: "1px" }}>
                CANDIDATE MICROPHONE (VAD ACTIVE)
              </div>

              {/* Equalizer Bars */}
              <div style={{ display: "flex", alignItems: "flex-end", gap: "8px", height: "120px", marginTop: "30px" }}>
                {candEqualizerBars.map((height, i) => (
                  <div
                    key={i}
                    style={{
                      width: "12px",
                      height: `${height}px`,
                      background: "linear-gradient(to top, #0284c7, #38bdf8)",
                      borderRadius: "6px",
                      boxShadow: "0 0 10px rgba(56, 189, 248, 0.5)",
                    }}
                  />
                ))}
              </div>

              <div style={{ marginTop: "24px", fontSize: "14px", color: "#cbd5e1", fontWeight: 600 }}>
                Status: <span style={{ color: "#38bdf8" }}>LISTENING FOR PAUSE</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PART 2: 500ms RELEASE BUFFER VAD (Frames 450 - 990) */}
      {isPart2 && (
        <div style={{ width: "100%", maxWidth: "1200px", display: "flex", flexDirection: "column", alignItems: "center" }}>
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
            ⏱️ DEMO SCENE #2
          </div>

          <h2 style={{ fontSize: "44px", fontWeight: 900, margin: "0 0 24px 0" }}>
            500ms Release Buffer (Voice Activity Detection)
          </h2>

          <p style={{ fontSize: "20px", color: "#cbd5e1", marginBottom: "40px", textAlign: "center" }}>
            Prevents awkward interruptions during natural candidate speech pauses while guaranteeing ultra-low latency hand-offs.
          </p>

          {/* VAD Gauge Panel */}
          <div
            style={{
              width: "100%",
              background: "rgba(15, 23, 42, 0.9)",
              border: "1px solid rgba(20, 184, 166, 0.3)",
              borderRadius: "24px",
              padding: "40px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              boxShadow: "0 20px 50px rgba(0, 0, 0, 0.5)",
            }}
          >
            <div style={{ fontSize: "16px", fontWeight: 800, color: "#94a3b8", letterSpacing: "1px", marginBottom: "20px" }}>
              SILENCE DETECTION TIMELINE
            </div>

            {/* Meter Bar */}
            <div style={{ width: "100%", height: "24px", backgroundColor: "#020617", borderRadius: "12px", padding: "4px", overflow: "hidden", border: "1px solid rgba(255, 255, 255, 0.1)" }}>
              <div
                style={{
                  width: `${bufferFillPercent}%`,
                  height: "100%",
                  background: isHandOffTriggered
                    ? "linear-gradient(to right, #22c55e, #4ade80)"
                    : "linear-gradient(to right, #14b8a6, #38bdf8)",
                  borderRadius: "8px",
                  boxShadow: "0 0 20px rgba(20, 184, 166, 0.8)",
                  transition: "width 0.1s linear",
                }}
              />
            </div>

            {/* Readouts */}
            <div style={{ display: "flex", justifyContent: "space-between", width: "100%", marginTop: "16px", fontSize: "14px", fontWeight: 700, color: "#cbd5e1" }}>
              <span>0ms (Pause Start)</span>
              <span style={{ color: "#14b8a6" }}>250ms (Buffer Hold)</span>
              <span style={{ color: "#22c55e" }}>500ms (Release Trigger)</span>
            </div>

            {/* Hand-Off State Pill */}
            <div
              style={{
                marginTop: "32px",
                padding: "12px 32px",
                borderRadius: "30px",
                backgroundColor: isHandOffTriggered ? "rgba(34, 197, 94, 0.2)" : "rgba(15, 23, 42, 0.8)",
                border: `2px solid ${isHandOffTriggered ? "#22c55e" : "#334155"}`,
                color: isHandOffTriggered ? "#22c55e" : "#94a3b8",
                fontSize: "18px",
                fontWeight: 800,
                letterSpacing: "1px",
                boxShadow: isHandOffTriggered ? "0 0 30px rgba(34, 197, 94, 0.4)" : "none",
              }}
            >
              {isHandOffTriggered ? "⚡ 500MS BUFFER REACHED → TURN HANDED TO AI" : "⏳ MONITORING CANDIDATE PAUSE..."}
            </div>
          </div>
        </div>
      )}

      {/* PART 3: ZERO-LOCKOUT MIC (BARGE-IN) (Frames 990 - 1500) */}
      {isPart3 && (
        <div style={{ width: "100%", maxWidth: "1300px", display: "flex", flexDirection: "column", alignItems: "center" }}>
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
            ⚡ DEMO SCENE #3
          </div>

          <h2 style={{ fontSize: "44px", fontWeight: 900, margin: "0 0 32px 0" }}>
            Zero-Lockout Microphone & Instant Barge-In
          </h2>

          {/* Barge-In Studio Card */}
          <div
            style={{
              width: "100%",
              background: "rgba(15, 23, 42, 0.9)",
              border: `2px solid ${isInterrupted ? "#22c55e" : "rgba(56, 189, 248, 0.3)"}`,
              borderRadius: "24px",
              padding: "36px",
              boxShadow: isInterrupted ? "0 0 50px rgba(34, 197, 94, 0.3)" : "0 20px 40px rgba(0,0,0,0.5)",
              display: "flex",
              flexDirection: "column",
              gap: "24px",
            }}
          >
            {/* Live Streaming Transcript */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* AI Message */}
              <div style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
                <div style={{ padding: "6px 14px", borderRadius: "8px", background: "rgba(20, 184, 166, 0.2)", color: "#14b8a6", fontSize: "12px", fontWeight: 800 }}>
                  AI INTERVIEWER
                </div>
                <div style={{ fontSize: "18px", color: isInterrupted ? "#64748b" : "#f8fafc", textDecoration: isInterrupted ? "line-through" : "none" }}>
                  "For your system design, how would you rebalance database keys when write volume spikes by 10x..."
                </div>
              </div>

              {/* Candidate Interruption */}
              {isInterrupted && (
                <div
                  style={{
                    transform: `scale(${bargeSpring})`,
                    display: "flex",
                    gap: "16px",
                    alignItems: "flex-start",
                    background: "rgba(34, 197, 94, 0.1)",
                    padding: "16px",
                    borderRadius: "12px",
                    border: "1px solid rgba(34, 197, 94, 0.4)",
                  }}
                >
                  <div style={{ padding: "6px 14px", borderRadius: "8px", background: "rgba(34, 197, 94, 0.2)", color: "#22c55e", fontSize: "12px", fontWeight: 800 }}>
                    CANDIDATE [BARGE-IN]
                  </div>
                  <div style={{ fontSize: "18px", color: "#f8fafc", fontWeight: 600 }}>
                    "I would implement consistent hashing with 256 virtual nodes per physical shard to eliminate key hotspots."
                  </div>
                </div>
              )}
            </div>

            {/* Status Footer */}
            <div style={{ borderTop: "1px solid rgba(255, 255, 255, 0.1)", paddingTop: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ width: "12px", height: "12px", borderRadius: "50%", backgroundColor: isInterrupted ? "#22c55e" : "#38bdf8", boxShadow: `0 0 10px ${isInterrupted ? "#22c55e" : "#38bdf8"}` }} />
                <span style={{ fontSize: "15px", fontWeight: 700, color: "#cbd5e1" }}>
                  {isInterrupted ? "ZERO-LOCKOUT BARGE-IN DETECTED (<18ms LATENCY)" : "AI SPEAKING (MIC LISTENING FOR INTERRUPT)"}
                </span>
              </div>

              <div style={{ fontSize: "14px", fontWeight: 800, color: "#22c55e", background: "rgba(34, 197, 94, 0.15)", padding: "6px 16px", borderRadius: "8px" }}>
                FULL DUPLEX AUDIO
              </div>
            </div>
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};
