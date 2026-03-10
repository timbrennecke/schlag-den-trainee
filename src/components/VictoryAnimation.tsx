"use client";

import { useEffect, useState, useRef, useMemo } from "react";

interface VictoryAnimationProps {
  onComplete: () => void;
  winnerName: string;
  winnerAvatar: string | null;
  allTrainees: { name: string; avatarUrl: string | null }[];
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

function TraineeFigure({
  name,
  avatarUrl,
  headSize,
  className,
  isWinner,
}: {
  name: string;
  avatarUrl: string | null;
  headSize: number;
  className?: string;
  isWinner?: boolean;
}) {
  const bodyHeight = headSize * 1.1;
  const bodyWidth = headSize * 0.85;
  const armWidth = headSize * 0.3;
  const legWidth = headSize * 0.32;
  const legHeight = headSize * 0.55;
  const totalWidth = bodyWidth + armWidth * 2 + 10;

  const shirtColor = isWinner ? "#f59e0b" : "#3b82f6";
  const pantsColor = "#1e3a5f";

  return (
    <div
      className={`flex flex-col items-center ${className ?? ""}`}
      style={{ width: Math.max(totalWidth, headSize + 20) }}
    >
      <svg
        width={totalWidth}
        height={headSize + bodyHeight + legHeight + 4}
        viewBox={`0 0 ${totalWidth} ${headSize + bodyHeight + legHeight + 4}`}
      >
        {/* Arms */}
        <rect
          x={totalWidth / 2 - bodyWidth / 2 - armWidth}
          y={headSize + 4}
          width={armWidth}
          height={bodyHeight * 0.7}
          rx={armWidth / 2}
          fill="#f5c6a0"
        />
        <rect
          x={totalWidth / 2 + bodyWidth / 2}
          y={headSize + 4}
          width={armWidth}
          height={bodyHeight * 0.7}
          rx={armWidth / 2}
          fill="#f5c6a0"
        />

        {/* Body / shirt */}
        <rect
          x={totalWidth / 2 - bodyWidth / 2}
          y={headSize + 2}
          width={bodyWidth}
          height={bodyHeight}
          rx={bodyWidth * 0.2}
          fill={shirtColor}
        />

        {/* Legs / pants */}
        <rect
          x={totalWidth / 2 - bodyWidth / 2 + 2}
          y={headSize + bodyHeight}
          width={legWidth}
          height={legHeight}
          rx={legWidth / 3}
          fill={pantsColor}
        />
        <rect
          x={totalWidth / 2 + bodyWidth / 2 - legWidth - 2}
          y={headSize + bodyHeight}
          width={legWidth}
          height={legHeight}
          rx={legWidth / 3}
          fill={pantsColor}
        />

        {/* Head */}
        <defs>
          <clipPath id={`head-${name}`}>
            <circle
              cx={totalWidth / 2}
              cy={headSize / 2}
              r={headSize / 2 - 2}
            />
          </clipPath>
        </defs>
        {avatarUrl ? (
          <image
            href={avatarUrl}
            x={totalWidth / 2 - headSize / 2 + 2}
            y={2}
            width={headSize - 4}
            height={headSize - 4}
            clipPath={`url(#head-${name})`}
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
          stroke={isWinner ? "#fbbf24" : "#60a5fa"}
          strokeWidth={2}
        />
      </svg>
      <span
        className="text-white font-bold text-center truncate w-full mt-0.5"
        style={{ fontSize: Math.max(10, headSize * 0.24) }}
      >
        {name}
      </span>
    </div>
  );
}

export default function VictoryAnimation({
  onComplete,
  winnerName,
  winnerAvatar,
  allTrainees,
}: VictoryAnimationProps) {
  const [phase, setPhase] = useState<
    "build" | "lift" | "celebrate" | "fade"
  >("build");

  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const others = useMemo(
    () => allTrainees.filter((t) => t.name !== winnerName),
    [allTrainees, winnerName]
  );

  // Build pyramid rows from the others
  const pyramidRows = useMemo(() => {
    const rows: { name: string; avatarUrl: string | null }[][] = [];
    const items = [...others];
    let rowSize = Math.max(2, Math.ceil(items.length / 2));
    while (items.length > 0) {
      rows.unshift(items.splice(0, rowSize));
      rowSize = Math.max(1, rowSize - 1);
    }
    return rows;
  }, [others]);

  useEffect(() => {
    playVictoryFanfare();
    const t1 = setTimeout(() => setPhase("lift"), 1200);
    const t2 = setTimeout(() => setPhase("celebrate"), 2200);
    const t3 = setTimeout(() => setPhase("fade"), 5000);
    const t4 = setTimeout(() => onCompleteRef.current(), 6000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showCrown = phase === "celebrate" || phase === "fade";
  const showConfetti = phase === "celebrate";

  return (
    <div
      className={`fixed inset-0 z-50 pointer-events-none flex flex-col items-center justify-center overflow-hidden transition-opacity duration-700 ${
        phase === "fade" ? "opacity-0" : "opacity-100"
      }`}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-950/90 via-black/80 to-blue-950/90" />

      {/* Confetti */}
      {showConfetti &&
        Array.from({ length: 40 }, (_, i) => {
          const x = Math.random() * 100;
          const delay = Math.random() * 2;
          const dur = 2 + Math.random() * 2;
          const colors = [
            "#fbbf24",
            "#3b82f6",
            "#ef4444",
            "#22c55e",
            "#a855f7",
            "#f97316",
          ];
          const color = colors[i % colors.length];
          const size = 6 + Math.random() * 10;
          return (
            <div
              key={i}
              className="absolute rounded-sm"
              style={{
                left: `${x}%`,
                top: -20,
                width: size,
                height: size * 0.6,
                backgroundColor: color,
                animation: `confetti-fall ${dur}s ${delay}s ease-in forwards`,
                transform: `rotate(${Math.random() * 360}deg)`,
              }}
            />
          );
        })}

      {/* Spotlight beams */}
      {(phase === "celebrate" || phase === "lift") && (
        <>
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-0 h-0 opacity-20"
            style={{
              borderLeft: "120px solid transparent",
              borderRight: "120px solid transparent",
              borderTop: "500px solid #fbbf24",
            }}
          />
        </>
      )}

      {/* Title */}
      <div
        className={`relative z-10 text-center mb-8 transition-all duration-700 ${
          phase === "build"
            ? "opacity-0 -translate-y-10"
            : "opacity-100 translate-y-0"
        }`}
      >
        <p className="text-6xl font-black text-white drop-shadow-[0_0_30px_rgba(59,130,246,0.6)] tracking-wider">
          <span className="text-amber-400">{winnerName}</span> gewinnt eine Runde!
        </p>
      </div>

      {/* Pyramid */}
      <div className="relative z-10 flex flex-col items-center gap-2">
        {/* Winner on top */}
        <div
          className={`transition-all duration-1000 ${
            phase === "build"
              ? "opacity-0 translate-y-20 scale-75"
              : phase === "lift"
              ? "opacity-100 translate-y-0 scale-110"
              : "opacity-100 translate-y-0 scale-110"
          }`}
        >
          <div className="relative">
            {showCrown && (
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-4xl animate-bounce">
                👑
              </div>
            )}
            <div
              className={`transition-all duration-500 ${
                showCrown
                  ? "drop-shadow-[0_0_30px_rgba(251,191,36,0.5)]"
                  : ""
              }`}
            >
              <TraineeFigure
                name={winnerName}
                avatarUrl={winnerAvatar}
                headSize={90}
                isWinner
              />
            </div>
          </div>
        </div>

        {/* Pyramid rows (bottom-up, rendered top-down) */}
        {pyramidRows.map((row, rowIdx) => (
          <div
            key={rowIdx}
            className={`flex items-end justify-center gap-3 transition-all duration-700 ${
              phase === "build"
                ? "opacity-0 translate-y-16"
                : "opacity-100 translate-y-0"
            }`}
            style={{
              transitionDelay:
                phase === "build"
                  ? "0ms"
                  : `${(pyramidRows.length - rowIdx) * 200}ms`,
            }}
          >
            {row.map((t, i) => (
              <TraineeFigure
                key={`${rowIdx}-${i}`}
                name={t.name}
                avatarUrl={t.avatarUrl}
                headSize={60}
              />
            ))}
          </div>
        ))}
      </div>

      <style jsx>{`
        @keyframes confetti-fall {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
