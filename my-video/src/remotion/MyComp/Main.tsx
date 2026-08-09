import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { GlobalOverlay } from "../components/GlobalOverlay";
import { Scene1_LegacyPain } from "../scenes/Scene1_LegacyPain";
import { Scene2_FeatureReveal } from "../scenes/Scene2_FeatureReveal";
import { Scene3_VoiceAudio } from "../scenes/Scene3_VoiceAudio";
import { Scene4_AnalyticsScorecard } from "../scenes/Scene4_AnalyticsScorecard";
import { Scene5_FinaleCTA } from "../scenes/Scene5_FinaleCTA";

export const Main: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#020617" }}>
      {/* SCENE 1: Legacy Technical Hiring (0s - 35s | 1050 frames) */}
      <Sequence from={0} durationInFrames={1050} name="Scene 1: Legacy Pain">
        <Scene1_LegacyPain />
      </Sequence>

      {/* SCENE 2: Feature Reveal & Breeth AI Engine (35s - 75s | 1200 frames) */}
      <Sequence from={1050} durationInFrames={1200} name="Scene 2: Feature Reveal">
        <Scene2_FeatureReveal />
      </Sequence>

      {/* SCENE 3: Live Web Audio Turn-Taking Demonstration (75s - 125s | 1500 frames) */}
      <Sequence from={2250} durationInFrames={1500} name="Scene 3: Voice Audio">
        <Scene3_VoiceAudio />
      </Sequence>

      {/* SCENE 4: Real-Time Analytics & Dynamic Scorecards (125s - 165s | 1200 frames) */}
      <Sequence from={3750} durationInFrames={1200} name="Scene 4: Real-Time Analytics">
        <Scene4_AnalyticsScorecard />
      </Sequence>

      {/* SCENE 5: ABTalks Hackathon 2026 Title Card & Finale CTA (165s - 210s | 1350 frames) */}
      <Sequence from={4950} durationInFrames={1350} name="Scene 5: Finale & CTA">
        <Scene5_FinaleCTA />
      </Sequence>

      {/* Global Overlay with HUD header, timer, scene tags, progress bar, and ambient glows */}
      <GlobalOverlay />
    </AbsoluteFill>
  );
};
