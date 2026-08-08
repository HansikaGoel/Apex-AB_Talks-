'use client';

import React, { useEffect, useRef } from 'react';

interface AudioVisualizerProps {
  isRecording: boolean;
  audioStream?: MediaStream | null;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ isRecording, audioStream }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isRecording || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let audioCtx: AudioContext | null = null;
    let analyser: AnalyserNode | null = null;
    let source: MediaStreamAudioSourceNode | null = null;

    if (audioStream) {
      try {
        audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        analyser = audioCtx.createAnalyser();
        analyser.fftSize = 64;
        source = audioCtx.createMediaStreamSource(audioStream);
        source.connect(analyser);
      } catch (err) {
        console.warn('AudioContext creation fallback:', err);
      }
    }

    const bufferLength = analyser ? analyser.frequencyBinCount : 16;
    const dataArray = new Uint8Array(bufferLength);

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (analyser) {
        analyser.getByteFrequencyData(dataArray);
      } else {
        // Fallback procedural animation when mic stream is simulated
        for (let i = 0; i < bufferLength; i++) {
          dataArray[i] = Math.floor(Math.random() * 180 + 40);
        }
      }

      const barWidth = (canvas.width / bufferLength) * 1.8;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height;

        const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
        gradient.addColorStop(0, '#14b8a6');
        gradient.addColorStop(1, '#10b981');

        ctx.fillStyle = gradient;
        ctx.fillRect(x, canvas.height - barHeight, barWidth - 2, barHeight);

        x += barWidth;
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (audioCtx) audioCtx.close();
    };
  }, [isRecording, audioStream]);

  if (!isRecording) return null;

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-teal-950/60 border border-teal-800/60 text-teal-300 text-xs">
      <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
      <span className="font-mono text-[11px] font-semibold">REC</span>
      <canvas ref={canvasRef} width={120} height={20} className="rounded" />
    </div>
  );
};
