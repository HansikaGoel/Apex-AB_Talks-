import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";

export const GlobalOverlay: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const totalSeconds = Math.floor(frame / fps);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const timeFormatted = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

  const progressPercent = Math.min(100, (frame / durationInFrames) * 100);

  // Scene tag determination based on current frame
  let sceneTag = "SCENE 1 / 5: LEGACY HIRING PAIN";
  let sceneColor = "#ef4444"; // Red for pain
  if (frame >= 1050 && frame < 2250) {
    sceneTag = "SCENE 2 / 5: FEATURE REVEAL & BREETH AI";
    sceneColor = "#14b8a6"; // Teal
  } else if (frame >= 2250 && frame < 3750) {
    sceneTag = "SCENE 3 / 5: LIVE VOICE & TURN-TAKING";
    sceneColor = "#38bdf8"; // Cyan
  } else if (frame >= 3750 && frame < 4950) {
    sceneTag = "SCENE 4 / 5: REAL-TIME ANALYTICS";
    sceneColor = "#22c55e"; // Emerald
  } else if (frame >= 4950) {
    sceneTag = "SCENE 5 / 5: HACKATHON 2026 FINALE";
    sceneColor = "#a855f7"; // Purple / Gold
  }

  // Floating background particles offset
  const particleOffset = (frame * 0.5) % 1080;
  const pulseOpacity = 0.4 + Math.sin(frame * 0.05) * 0.15;

  return (
    <AbsoluteFill style={{ pointerEvents: "none", zIndex: 100 }}>
      {/* Background Ambient Glow Orbs */}
      <div
        style={{
          position: "absolute",
          top: "-200px",
          left: "-200px",
          width: "700px",
          height: "700px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(20, 184, 166, 0.15) 0%, rgba(2, 6, 23, 0) 70%)",
          filter: "blur(60px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-200px",
          right: "-200px",
          width: "700px",
          height: "700px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(56, 189, 248, 0.12) 0%, rgba(2, 6, 23, 0) 70%)",
          filter: "blur(60px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "40%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "900px",
          height: "900px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(34, 197, 94, 0.06) 0%, rgba(2, 6, 23, 0) 70%)",
          filter: "blur(80px)",
        }}
      />

      {/* Grid Pattern */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px),
                            linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
          opacity: 0.6,
        }}
      />

      {/* Floating Light Grid Vertices */}
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.25 }}>
        <circle cx="240" cy={(180 + particleOffset) % 1080} r="2" fill="#14b8a6" />
        <circle cx="720" cy={(420 + particleOffset * 1.2) % 1080} r="2.5" fill="#38bdf8" />
        <circle cx="1200" cy={(720 + particleOffset * 0.8) % 1080} r="2" fill="#22c55e" />
        <circle cx="1680" cy={(300 + particleOffset * 1.5) % 1080} r="3" fill="#14b8a6" />
      </svg>

      {/* HUD Top Header */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "80px",
          padding: "0 40px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "linear-gradient(to bottom, rgba(2, 6, 23, 0.9) 0%, rgba(2, 6, 23, 0) 100%)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
          backdropFilter: "blur(8px)",
          fontFamily: "'Inter', system-ui, sans-serif",
        }}
      >
        {/* Left: Brand / App Title */}
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "10px",
              background: "linear-gradient(135deg, #14b8a6 0%, #38bdf8 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 20px rgba(20, 184, 166, 0.5)",
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#020617" strokeWidth="2.5">
              <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z" />
              <circle cx="12" cy="12" r="3" fill="#020617" />
            </svg>
          </div>
          <div>
            <div style={{ fontSize: "18px", fontWeight: 800, color: "#f8fafc", letterSpacing: "0.5px" }}>
              THE INTERVIEW AGENT
            </div>
            <div style={{ fontSize: "11px", color: "#14b8a6", fontWeight: 600, letterSpacing: "1px" }}>
              BREETH AI ENGINE v2.6
            </div>
          </div>
        </div>

        {/* Center: Current Scene Badge */}
        <div
          style={{
            padding: "6px 18px",
            borderRadius: "20px",
            background: "rgba(15, 23, 42, 0.8)",
            border: `1px solid ${sceneColor}44`,
            boxShadow: `0 0 15px ${sceneColor}22`,
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <div
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              backgroundColor: sceneColor,
              boxShadow: `0 0 10px ${sceneColor}`,
            }}
          />
          <span
            style={{
              fontSize: "13px",
              fontWeight: 700,
              color: "#f8fafc",
              letterSpacing: "1px",
              textTransform: "uppercase",
            }}
          >
            {sceneTag}
          </span>
        </div>

        {/* Right: Timecode & Tech Spec Status */}
        <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "12px",
              fontWeight: 600,
              color: "#94a3b8",
            }}
          >
            <div
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                backgroundColor: "#22c55e",
                opacity: pulseOpacity,
              }}
            />
            <span>30 FPS | 1080p</span>
          </div>

          <div
            style={{
              fontSize: "16px",
              fontWeight: 700,
              color: "#38bdf8",
              fontFamily: "monospace",
              background: "rgba(15, 23, 42, 0.6)",
              padding: "4px 12px",
              borderRadius: "6px",
              border: "1px solid rgba(56, 189, 248, 0.2)",
            }}
          >
            {timeFormatted} <span style={{ color: "#64748b" }}>/ 03:30</span>
          </div>
        </div>
      </div>

      {/* Bottom Footer Progress Bar */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "40px",
          background: "rgba(2, 6, 23, 0.95)",
          borderTop: "1px solid rgba(255, 255, 255, 0.08)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          fontFamily: "'Inter', system-ui, sans-serif",
        }}
      >
        {/* Timeline Scene Labels */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "0 20px 4px 20px",
            fontSize: "11px",
            fontWeight: 600,
            color: "#64748b",
          }}
        >
          <span style={{ color: frame < 1050 ? "#ef4444" : "#94a3b8" }}>01. Legacy Hiring</span>
          <span style={{ color: frame >= 1050 && frame < 2250 ? "#14b8a6" : "#94a3b8" }}>02. Feature Reveal</span>
          <span style={{ color: frame >= 2250 && frame < 3750 ? "#38bdf8" : "#94a3b8" }}>03. Voice Turn-Taking</span>
          <span style={{ color: frame >= 3750 && frame < 4950 ? "#22c55e" : "#94a3b8" }}>04. Real-Time Analytics</span>
          <span style={{ color: frame >= 4950 ? "#a855f7" : "#94a3b8" }}>05. Hackathon Finale</span>
        </div>

        {/* Progress Bar Track */}
        <div style={{ position: "relative", width: "100%", height: "6px", backgroundColor: "#0f172a" }}>
          {/* Progress Bar Fill */}
          <div
            style={{
              width: `${progressPercent}%`,
              height: "100%",
              background: "linear-gradient(to right, #14b8a6, #38bdf8, #22c55e)",
              boxShadow: "0 0 12px rgba(20, 184, 166, 0.8)",
              transition: "width 0.1s linear",
            }}
          />

          {/* Timeline Tick Markers */}
          <div style={{ position: "absolute", top: 0, left: "16.7%", width: "2px", height: "100%", backgroundColor: "#334155" }} />
          <div style={{ position: "absolute", top: 0, left: "35.7%", width: "2px", height: "100%", backgroundColor: "#334155" }} />
          <div style={{ position: "absolute", top: 0, left: "59.5%", width: "2px", height: "100%", backgroundColor: "#334155" }} />
          <div style={{ position: "absolute", top: 0, left: "78.6%", width: "2px", height: "100%", backgroundColor: "#334155" }} />
        </div>
      </div>
    </AbsoluteFill>
  );
};
