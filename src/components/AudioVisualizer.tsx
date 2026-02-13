'use client';

import { useEffect, useRef } from 'react';

interface AudioVisualizerProps {
  audioLevel: number;
  isActive: boolean;
  isAgentSpeaking: boolean;
  className?: string;
}

export function AudioVisualizer({
  audioLevel,
  isActive,
  isAgentSpeaking,
  className = '',
}: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const barsRef = useRef<number[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Initialize bars
    const barCount = 40;
    if (barsRef.current.length === 0) {
      barsRef.current = new Array(barCount).fill(0);
    }

    const animate = () => {
      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);

      const bars = barsRef.current;
      const barWidth = width / barCount;
      const gap = 2;

      for (let i = 0; i < barCount; i++) {
        // Calculate target height based on audio level and position
        const distanceFromCenter = Math.abs(i - barCount / 2) / (barCount / 2);
        const targetHeight = isActive
          ? (audioLevel * (1 - distanceFromCenter * 0.5) + Math.random() * 0.1) * height * 0.8
          : height * 0.05;

        // Smooth animation
        bars[i] += (targetHeight - bars[i]) * 0.15;
        bars[i] = Math.max(bars[i], height * 0.03);

        const barHeight = bars[i];
        const x = i * barWidth + gap / 2;
        const y = (height - barHeight) / 2;

        // Create gradient based on state
        const gradient = ctx.createLinearGradient(x, y, x, y + barHeight);
        
        if (isAgentSpeaking) {
          // Cyan/teal gradient when agent is speaking
          gradient.addColorStop(0, 'rgba(6, 182, 212, 0.9)');
          gradient.addColorStop(0.5, 'rgba(34, 211, 238, 1)');
          gradient.addColorStop(1, 'rgba(6, 182, 212, 0.9)');
        } else if (isActive) {
          // Purple/blue gradient when user might be speaking
          gradient.addColorStop(0, 'rgba(139, 92, 246, 0.9)');
          gradient.addColorStop(0.5, 'rgba(167, 139, 250, 1)');
          gradient.addColorStop(1, 'rgba(139, 92, 246, 0.9)');
        } else {
          // Dim gray when idle
          gradient.addColorStop(0, 'rgba(75, 85, 99, 0.5)');
          gradient.addColorStop(0.5, 'rgba(107, 114, 128, 0.6)');
          gradient.addColorStop(1, 'rgba(75, 85, 99, 0.5)');
        }

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth - gap, barHeight, 4);
        ctx.fill();

        // Add glow effect when active
        if (isActive && audioLevel > 0.1) {
          ctx.shadowColor = isAgentSpeaking ? 'rgba(6, 182, 212, 0.5)' : 'rgba(139, 92, 246, 0.5)';
          ctx.shadowBlur = 10;
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [audioLevel, isActive, isAgentSpeaking]);

  return (
    <div className={`relative ${className}`}>
      <canvas
        ref={canvasRef}
        width={400}
        height={120}
        className="w-full h-full"
      />
      {/* Reflection effect */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent pointer-events-none" />
    </div>
  );
}
