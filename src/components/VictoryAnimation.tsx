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

function TraineeAvatar({
  name,
  avatarUrl,
  size,
  className,
}: {
  name: string;
  avatarUrl: string | null;
  size: number;
  className?: string;
}) {
  return (
    <div
      className={`flex flex-col items-center ${className ?? ""}`}
      style={{ width: size + 20 }}
    >
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={name}
          className="rounded-full object-cover border-3 border-blue-400"
          style={{ width: size, height: size }}
        />
      ) : (
        <div
          className="rounded-full bg-blue-600 flex items-center justify-center text-white font-bold border-3 border-blue-400"
          style={{ width: size, height: size, fontSize: size * 0.35 }}
        >
          {name.charAt(0).toUpperCase()}
        </div>
      )}
      <span
        className="text-white font-bold mt-1 text-center truncate w-full"
        style={{ fontSize: Math.max(10, size * 0.22) }}
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
          TRAINEE SIEGT!
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
                  ? "ring-4 ring-amber-400 rounded-full shadow-[0_0_40px_rgba(251,191,36,0.5)]"
                  : ""
              }`}
              style={{ borderRadius: "50%" }}
            >
              <TraineeAvatar
                name={winnerName}
                avatarUrl={winnerAvatar}
                size={100}
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
              <TraineeAvatar
                key={`${rowIdx}-${i}`}
                name={t.name}
                avatarUrl={t.avatarUrl}
                size={70}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Winner name highlight */}
      {showCrown && (
        <div className="relative z-10 mt-6 text-center">
          <p className="text-3xl font-extrabold text-amber-400 drop-shadow-[0_0_20px_rgba(251,191,36,0.6)]">
            {winnerName}
          </p>
        </div>
      )}

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
