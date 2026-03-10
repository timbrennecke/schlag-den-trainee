"use client";

import { useEffect, useState } from "react";

interface PunchAnimationProps {
  onComplete: () => void;
}

export default function PunchAnimation({ onComplete }: PunchAnimationProps) {
  const [phase, setPhase] = useState<"enter" | "impact" | "exit">("enter");

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("impact"), 400);
    const t2 = setTimeout(() => setPhase("exit"), 1200);
    const t3 = setTimeout(() => onComplete(), 2400);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center overflow-hidden">
      {/* Flash on impact */}
      {phase === "impact" && (
        <div className="absolute inset-0 bg-red-600/30 animate-pulse" />
      )}

      {/* SCHLAG! text */}
      <div
        className={`absolute text-center transition-all duration-300 ${
          phase === "impact"
            ? "scale-150 opacity-100"
            : phase === "exit"
            ? "scale-200 opacity-0"
            : "scale-50 opacity-0"
        }`}
        style={{ zIndex: 52 }}
      >
        <p className="text-8xl font-black text-white drop-shadow-[0_0_40px_rgba(255,0,0,0.8)] tracking-wider">
          GESCHLAGEN!
        </p>
      </div>

      {/* Boxing glove from right */}
      <div
        className={`absolute transition-all ease-out ${
          phase === "enter"
            ? "duration-400 translate-x-[50vw] rotate-0"
            : phase === "impact"
            ? "duration-200 translate-x-0 -rotate-12"
            : "duration-500 -translate-x-[60vw] rotate-45 opacity-0"
        }`}
        style={{ zIndex: 51 }}
      >
        <svg
          width="280"
          height="280"
          viewBox="0 0 280 280"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Arm */}
          <rect
            x="180"
            y="110"
            width="120"
            height="55"
            rx="20"
            fill="#d4a574"
            stroke="#b8956a"
            strokeWidth="3"
          />
          {/* Wrist band */}
          <rect x="165" y="105" width="25" height="65" rx="6" fill="#ffffff" stroke="#ddd" strokeWidth="2" />
          {/* Glove body */}
          <ellipse cx="100" cy="140" rx="95" ry="80" fill="#dc2626" stroke="#991b1b" strokeWidth="4" />
          {/* Glove shine */}
          <ellipse cx="75" cy="115" rx="40" ry="25" fill="#ef4444" opacity="0.6" />
          {/* Thumb */}
          <ellipse cx="155" cy="95" rx="30" ry="22" fill="#dc2626" stroke="#991b1b" strokeWidth="3" transform="rotate(-20 155 95)" />
          {/* Lacing */}
          <line x1="70" y1="130" x2="130" y2="130" stroke="#fca5a5" strokeWidth="3" />
          <line x1="80" y1="115" x2="80" y2="145" stroke="#fca5a5" strokeWidth="2" />
          <line x1="100" y1="115" x2="100" y2="145" stroke="#fca5a5" strokeWidth="2" />
          <line x1="120" y1="118" x2="120" y2="142" stroke="#fca5a5" strokeWidth="2" />
        </svg>
      </div>

      {/* Trainee figure (center, gets hit) */}
      <div
        className={`absolute transition-all ${
          phase === "enter"
            ? "duration-100 translate-x-0 rotate-0 scale-100"
            : phase === "impact"
            ? "duration-150 -translate-x-16 rotate-[-15deg] scale-95"
            : "duration-500 -translate-x-[40vw] rotate-[-45deg] scale-50 opacity-0"
        }`}
        style={{ zIndex: 50 }}
      >
        <svg
          width="160"
          height="240"
          viewBox="0 0 160 240"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Body */}
          <rect x="50" y="85" width="60" height="90" rx="12" fill="#3b82f6" stroke="#1d4ed8" strokeWidth="3" />
          {/* Head */}
          <circle cx="80" cy="55" r="38" fill="#fcd34d" stroke="#f59e0b" strokeWidth="3" />
          {/* Eyes */}
          {phase === "impact" || phase === "exit" ? (
            <>
              <text x="62" y="55" fontSize="18" fill="#111">X</text>
              <text x="85" y="55" fontSize="18" fill="#111">X</text>
            </>
          ) : (
            <>
              <circle cx="67" cy="48" r="5" fill="#111" />
              <circle cx="93" cy="48" r="5" fill="#111" />
            </>
          )}
          {/* Mouth */}
          {phase === "impact" || phase === "exit" ? (
            <ellipse cx="80" cy="70" rx="10" ry="6" fill="#111" />
          ) : (
            <path d="M68 68 Q80 78 92 68" stroke="#111" strokeWidth="2.5" fill="none" />
          )}
          {/* "T" on shirt */}
          <text x="68" y="140" fontSize="28" fontWeight="bold" fill="white">T</text>
          {/* Legs */}
          <rect x="55" y="175" width="20" height="50" rx="8" fill="#1e3a5f" stroke="#1a2f4d" strokeWidth="2" />
          <rect x="85" y="175" width="20" height="50" rx="8" fill="#1e3a5f" stroke="#1a2f4d" strokeWidth="2" />
          {/* Arms */}
          <rect x="25" y="90" width="25" height="14" rx="7" fill="#3b82f6" stroke="#1d4ed8" strokeWidth="2" />
          <rect x="110" y="90" width="25" height="14" rx="7" fill="#3b82f6" stroke="#1d4ed8" strokeWidth="2" />
          {/* Stars on impact */}
          {(phase === "impact" || phase === "exit") && (
            <>
              <text x="20" y="30" fontSize="22">⭐</text>
              <text x="120" y="25" fontSize="18">💫</text>
              <text x="5" y="60" fontSize="16">✨</text>
              <text x="135" y="55" fontSize="20">⭐</text>
            </>
          )}
        </svg>
      </div>

      {/* Impact particles */}
      {phase === "impact" && (
        <>
          {Array.from({ length: 8 }, (_, i) => {
            const angle = (i / 8) * Math.PI * 2;
            const tx = Math.cos(angle) * 200;
            const ty = Math.sin(angle) * 200;
            return (
              <div
                key={i}
                className="absolute w-4 h-4 bg-amber-400 rounded-full"
                style={{
                  animation: "particle 0.8s ease-out forwards",
                  ["--tx" as string]: `${tx}px`,
                  ["--ty" as string]: `${ty}px`,
                }}
              />
            );
          })}
        </>
      )}

      <style jsx>{`
        @keyframes particle {
          0% {
            transform: translate(0, 0) scale(1);
            opacity: 1;
          }
          100% {
            transform: translate(var(--tx), var(--ty)) scale(0);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
