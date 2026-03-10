"use client";

import { useEffect, useState, useRef } from "react";

interface VictoryAnimationProps {
  onComplete: () => void;
  winnerName: string;
  winnerAvatar: string | null;
}

function playVictoryFanfare() {
  try {
    const ctx = new AudioContext();
    const t = ctx.currentTime;

    const notes = [
      { freq: 392, start: 0, dur: 0.15 },
      { freq: 440, start: 0.15, dur: 0.15 },
      { freq: 523, start: 0.3, dur: 0.15 },
      { freq: 659, start: 0.45, dur: 0.3 },
      { freq: 523, start: 0.8, dur: 0.15 },
      { freq: 659, start: 0.95, dur: 0.5 },
      { freq: 784, start: 1.5, dur: 0.8 },
    ];

    for (const note of notes) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(note.freq, t + note.start);
      gain.gain.setValueAtTime(0, t + note.start);
      gain.gain.linearRampToValueAtTime(0.4, t + note.start + 0.02);
      gain.gain.setValueAtTime(0.4, t + note.start + note.dur * 0.7);
      gain.gain.exponentialRampToValueAtTime(0.01, t + note.start + note.dur);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t + note.start);
      osc.stop(t + note.start + note.dur + 0.05);

      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(note.freq * 2, t + note.start);
      gain2.gain.setValueAtTime(0, t + note.start);
      gain2.gain.linearRampToValueAtTime(0.15, t + note.start + 0.02);
      gain2.gain.exponentialRampToValueAtTime(0.01, t + note.start + note.dur);
      osc2.connect(gain2).connect(ctx.destination);
      osc2.start(t + note.start);
      osc2.stop(t + note.start + note.dur + 0.05);
    }

    setTimeout(() => ctx.close(), 4000);
  } catch {
    // Audio not available
  }
}

const KISS_COUNT = 12;

function generateKisses() {
  return Array.from({ length: KISS_COUNT }, (_, i) => {
    const angle = (i / KISS_COUNT) * 360 + (Math.random() - 0.5) * 30;
    const rad = (angle * Math.PI) / 180;
    const distance = 120 + Math.random() * 180;
    const tx = Math.cos(rad) * distance;
    const ty = Math.sin(rad) * distance - 60;
    const delay = 0.3 + Math.random() * 2.5;
    const size = 24 + Math.random() * 20;
    return { tx, ty, delay, size, angle };
  });
}

export default function VictoryAnimation({
  onComplete,
  winnerName,
  winnerAvatar,
}: VictoryAnimationProps) {
  const [phase, setPhase] = useState<"appear" | "jump" | "fade">("appear");
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;
  const kissesRef = useRef(generateKisses());

  useEffect(() => {
    playVictoryFanfare();
    const t1 = setTimeout(() => setPhase("jump"), 800);
    const t2 = setTimeout(() => setPhase("fade"), 5000);
    const t3 = setTimeout(() => onCompleteRef.current(), 6000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isJumping = phase === "jump" || phase === "fade";
  const headSize = 110;
  const bodyHeight = headSize * 1.1;
  const bodyWidth = headSize * 0.85;
  const armWidth = headSize * 0.3;
  const legWidth = headSize * 0.32;
  const legHeight = headSize * 0.55;
  const totalWidth = bodyWidth + armWidth * 2 + 10;
  const totalHeight = headSize + bodyHeight + legHeight + 4;

  return (
    <div
      className={`fixed inset-0 z-50 pointer-events-none flex flex-col items-center justify-center overflow-hidden transition-opacity duration-700 ${
        phase === "fade" ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-blue-950/90 via-black/80 to-blue-950/90" />

      {/* Spotlight */}
      {isJumping && (
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-0 h-0 opacity-20"
          style={{
            borderLeft: "150px solid transparent",
            borderRight: "150px solid transparent",
            borderTop: "600px solid #fbbf24",
          }}
        />
      )}

      {/* Title */}
      <div
        className={`relative z-10 text-center mb-10 transition-all duration-700 ${
          phase === "appear"
            ? "opacity-0 -translate-y-10"
            : "opacity-100 translate-y-0"
        }`}
      >
        <p className="text-6xl font-black text-white drop-shadow-[0_0_30px_rgba(59,130,246,0.6)] tracking-wider">
          <span className="text-amber-400">{winnerName}</span> gewinnt eine
          Runde!
        </p>
      </div>

      {/* Winner figure + kisses container */}
      <div
        className={`relative z-10 transition-all duration-700 ${
          phase === "appear"
            ? "opacity-0 translate-y-32 scale-75"
            : "opacity-100 translate-y-0 scale-100"
        }`}
      >
        {/* Kisses flying out */}
        {isJumping &&
          kissesRef.current.map((k, i) => (
            <div
              key={i}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
              style={{
                animation: `kiss-fly 1.4s ${k.delay}s ease-out forwards`,
                opacity: 0,
                ["--kiss-tx" as string]: `${k.tx}px`,
                ["--kiss-ty" as string]: `${k.ty}px`,
                fontSize: k.size,
              }}
            >
              💋
            </div>
          ))}

        {/* Jumping figure */}
        <div className={isJumping ? "animate-victory-jump" : ""}>
          <svg
            width={totalWidth}
            height={totalHeight}
            viewBox={`0 0 ${totalWidth} ${totalHeight}`}
          >
            {/* Arms raised */}
            <rect
              x={totalWidth / 2 - bodyWidth / 2 - armWidth - 4}
              y={headSize - 10}
              width={armWidth}
              height={bodyHeight * 0.7}
              rx={armWidth / 2}
              fill="#f5c6a0"
              className={isJumping ? "animate-wave-left" : ""}
              style={{ transformOrigin: `${totalWidth / 2 - bodyWidth / 2}px ${headSize + 4}px` }}
            />
            <rect
              x={totalWidth / 2 + bodyWidth / 2 + 4}
              y={headSize - 10}
              width={armWidth}
              height={bodyHeight * 0.7}
              rx={armWidth / 2}
              fill="#f5c6a0"
              className={isJumping ? "animate-wave-right" : ""}
              style={{ transformOrigin: `${totalWidth / 2 + bodyWidth / 2}px ${headSize + 4}px` }}
            />

            {/* Body / gold shirt */}
            <rect
              x={totalWidth / 2 - bodyWidth / 2}
              y={headSize + 2}
              width={bodyWidth}
              height={bodyHeight}
              rx={bodyWidth * 0.2}
              fill="#f59e0b"
            />

            {/* Legs */}
            <rect
              x={totalWidth / 2 - bodyWidth / 2 + 2}
              y={headSize + bodyHeight}
              width={legWidth}
              height={legHeight}
              rx={legWidth / 3}
              fill="#1e3a5f"
            />
            <rect
              x={totalWidth / 2 + bodyWidth / 2 - legWidth - 2}
              y={headSize + bodyHeight}
              width={legWidth}
              height={legHeight}
              rx={legWidth / 3}
              fill="#1e3a5f"
            />

            {/* Head */}
            <defs>
              <clipPath id="winner-head-clip">
                <circle
                  cx={totalWidth / 2}
                  cy={headSize / 2}
                  r={headSize / 2 - 2}
                />
              </clipPath>
            </defs>
            {winnerAvatar ? (
              <image
                href={winnerAvatar}
                x={totalWidth / 2 - headSize / 2 + 2}
                y={2}
                width={headSize - 4}
                height={headSize - 4}
                clipPath="url(#winner-head-clip)"
                preserveAspectRatio="xMidYMid slice"
              />
            ) : (
              <circle
                cx={totalWidth / 2}
                cy={headSize / 2}
                r={headSize / 2 - 2}
                fill="#f5c6a0"
              />
            )}
            <circle
              cx={totalWidth / 2}
              cy={headSize / 2}
              r={headSize / 2 - 1}
              fill="none"
              stroke="#fbbf24"
              strokeWidth={3}
            />
          </svg>
        </div>
      </div>

      <style jsx>{`
        @keyframes kiss-fly {
          0% {
            transform: translate(-50%, -50%) scale(0);
            opacity: 0;
          }
          20% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
          100% {
            transform: translate(
                calc(-50% + var(--kiss-tx)),
                calc(-50% + var(--kiss-ty))
              )
              scale(0.4);
            opacity: 0;
          }
        }
        @keyframes victory-jump {
          0%,
          100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-40px);
          }
          60% {
            transform: translateY(-40px);
          }
        }
        :global(.animate-victory-jump) {
          animation: victory-jump 0.6s ease-in-out infinite;
        }
        @keyframes wave-left {
          0%,
          100% {
            transform: rotate(0deg);
          }
          50% {
            transform: rotate(-25deg);
          }
        }
        @keyframes wave-right {
          0%,
          100% {
            transform: rotate(0deg);
          }
          50% {
            transform: rotate(25deg);
          }
        }
        :global(.animate-wave-left) {
          animation: wave-left 0.5s ease-in-out infinite;
        }
        :global(.animate-wave-right) {
          animation: wave-right 0.5s ease-in-out infinite 0.15s;
        }
      `}</style>
    </div>
  );
}
