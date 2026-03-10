"use client";

import { useEffect, useState, useRef } from "react";

interface PunchAnimationProps {
  onComplete: () => void;
  avatarUrls?: string[];
}

function playPunchSound() {
  try {
    const ctx = new AudioContext();

    // Low thud
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(80, ctx.currentTime);
    osc1.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 0.25);
    gain1.gain.setValueAtTime(1, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
    osc1.connect(gain1).connect(ctx.destination);
    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.3);

    // Noise burst for the "smack"
    const bufferSize = ctx.sampleRate * 0.15;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }
    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.7, ctx.currentTime);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(2000, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.15);
    noise.connect(filter).connect(noiseGain).connect(ctx.destination);
    noise.start(ctx.currentTime);

    // Mid-frequency crack
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "square";
    osc2.frequency.setValueAtTime(300, ctx.currentTime);
    osc2.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.1);
    gain2.gain.setValueAtTime(0.4, ctx.currentTime);
    gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);
    osc2.connect(gain2).connect(ctx.destination);
    osc2.start(ctx.currentTime);
    osc2.stop(ctx.currentTime + 0.12);

    setTimeout(() => ctx.close(), 1000);
  } catch {
    // Audio not available
  }
}

export default function PunchAnimation({
  onComplete,
  avatarUrls,
}: PunchAnimationProps) {
  const [phase, setPhase] = useState<
    "appear" | "windup" | "impact" | "exit"
  >("appear");

  const [randomAvatar] = useState(() => {
    if (!avatarUrls || avatarUrls.length === 0) return null;
    return avatarUrls[Math.floor(Math.random() * avatarUrls.length)];
  });

  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("windup"), 1200);
    const t2 = setTimeout(() => {
      setPhase("impact");
      playPunchSound();
    }, 1800);
    const t3 = setTimeout(() => setPhase("exit"), 2800);
    const t4 = setTimeout(() => onCompleteRef.current(), 4000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isHit = phase === "impact" || phase === "exit";

  return (
    <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center overflow-hidden">
      {/* Dark backdrop */}
      <div
        className={`absolute inset-0 transition-all duration-500 ${
          phase === "appear" || phase === "windup"
            ? "bg-black/60"
            : phase === "impact"
            ? "bg-red-900/50"
            : "bg-black/30"
        }`}
      />

      {/* Flash on impact */}
      {phase === "impact" && (
        <div className="absolute inset-0 bg-white/40 animate-ping" style={{ animationDuration: "0.3s" }} />
      )}

      {/* GESCHLAGEN! text */}
      <div
        className={`absolute text-center transition-all ${
          phase === "impact"
            ? "duration-300 scale-150 opacity-100"
            : phase === "exit"
            ? "duration-500 scale-200 opacity-0"
            : "duration-100 scale-50 opacity-0"
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
          phase === "appear"
            ? "duration-100 translate-x-[60vw] rotate-0 opacity-0"
            : phase === "windup"
            ? "duration-500 translate-x-[12vw] rotate-12 opacity-100"
            : phase === "impact"
            ? "duration-150 -translate-x-[2vw] -rotate-12 opacity-100"
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
          <rect x="180" y="110" width="120" height="55" rx="20" fill="#d4a574" stroke="#b8956a" strokeWidth="3" />
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

      {/* Trainee figure */}
      <div
        className={`absolute transition-all ${
          phase === "appear"
            ? "duration-500 translate-x-0 translate-y-0 rotate-0 scale-100 opacity-100"
            : phase === "windup"
            ? "duration-300 translate-x-0 translate-y-0 rotate-0 scale-100 opacity-100"
            : phase === "impact"
            ? "duration-100 -translate-x-8 rotate-[-15deg] scale-95 opacity-100"
            : "duration-700 -translate-x-[50vw] -translate-y-[10vh] rotate-[-60deg] scale-40 opacity-0"
        }`}
        style={{ zIndex: 50 }}
      >
        <svg
          width="180"
          height="270"
          viewBox="0 0 160 240"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Body */}
          <rect x="50" y="85" width="60" height="90" rx="12" fill="#3b82f6" stroke="#1d4ed8" strokeWidth="3" />
          {/* Head */}
          <circle cx="80" cy="55" r="38" fill="#fcd34d" stroke="#f59e0b" strokeWidth="3" />
          {randomAvatar ? (
            <>
              <defs>
                <clipPath id="head-clip">
                  <circle cx="80" cy="55" r="36" />
                </clipPath>
              </defs>
              <image
                href={randomAvatar}
                x="42"
                y="17"
                width="76"
                height="76"
                clipPath="url(#head-clip)"
                preserveAspectRatio="xMidYMid slice"
              />
              <circle cx="80" cy="55" r="38" fill="none" stroke="#f59e0b" strokeWidth="3" />
              {isHit && (
                <>
                  <circle cx="80" cy="55" r="38" fill="rgba(0,0,0,0.3)" />
                  <text x="60" y="58" fontSize="22" fontWeight="bold" fill="white" stroke="#000" strokeWidth="1">X</text>
                  <text x="88" y="58" fontSize="22" fontWeight="bold" fill="white" stroke="#000" strokeWidth="1">X</text>
                </>
              )}
            </>
          ) : (
            <>
              {/* Eyes */}
              {isHit ? (
                <>
                  <text x="60" y="55" fontSize="20" fontWeight="bold" fill="#111">X</text>
                  <text x="86" y="55" fontSize="20" fontWeight="bold" fill="#111">X</text>
                </>
              ) : phase === "windup" ? (
                <>
                  <circle cx="67" cy="46" r="6" fill="white" stroke="#111" strokeWidth="2" />
                  <circle cx="93" cy="46" r="6" fill="white" stroke="#111" strokeWidth="2" />
                  <circle cx="69" cy="46" r="3" fill="#111" />
                  <circle cx="95" cy="46" r="3" fill="#111" />
                  <line x1="58" y1="34" x2="72" y2="36" stroke="#111" strokeWidth="2.5" strokeLinecap="round" />
                  <line x1="88" y1="36" x2="102" y2="34" stroke="#111" strokeWidth="2.5" strokeLinecap="round" />
                </>
              ) : (
                <>
                  <circle cx="67" cy="48" r="5" fill="#111" />
                  <circle cx="93" cy="48" r="5" fill="#111" />
                </>
              )}
              {/* Mouth */}
              {isHit ? (
                <ellipse cx="80" cy="72" rx="12" ry="7" fill="#111" />
              ) : phase === "windup" ? (
                <ellipse cx="80" cy="72" rx="8" ry="5" fill="#111" />
              ) : (
                <path d="M68 68 Q80 78 92 68" stroke="#111" strokeWidth="2.5" fill="none" />
              )}
            </>
          )}
          {/* "T" on shirt */}
          <text x="68" y="142" fontSize="28" fontWeight="bold" fill="white">T</text>
          {/* Legs */}
          <rect x="55" y="175" width="20" height="50" rx="8" fill="#1e3a5f" stroke="#1a2f4d" strokeWidth="2" />
          <rect x="85" y="175" width="20" height="50" rx="8" fill="#1e3a5f" stroke="#1a2f4d" strokeWidth="2" />
          {/* Arms */}
          {phase === "windup" ? (
            <>
              {/* Arms up in defense */}
              <rect x="28" y="75" width="22" height="14" rx="7" fill="#3b82f6" stroke="#1d4ed8" strokeWidth="2" transform="rotate(-30 39 82)" />
              <rect x="110" y="75" width="22" height="14" rx="7" fill="#3b82f6" stroke="#1d4ed8" strokeWidth="2" transform="rotate(30 121 82)" />
            </>
          ) : (
            <>
              <rect x="25" y="90" width="25" height="14" rx="7" fill="#3b82f6" stroke="#1d4ed8" strokeWidth="2" />
              <rect x="110" y="90" width="25" height="14" rx="7" fill="#3b82f6" stroke="#1d4ed8" strokeWidth="2" />
            </>
          )}
          {/* Stars on impact */}
          {isHit && (
            <>
              <text x="15" y="28" fontSize="24">⭐</text>
              <text x="120" y="22" fontSize="20">💫</text>
              <text x="0" y="62" fontSize="18">✨</text>
              <text x="138" y="55" fontSize="22">⭐</text>
              <text x="30" y="15" fontSize="16">💥</text>
            </>
          )}
        </svg>
      </div>

      {/* Impact particles */}
      {phase === "impact" && (
        <>
          {Array.from({ length: 10 }, (_, i) => {
            const angle = (i / 10) * Math.PI * 2;
            const dist = 150 + Math.random() * 100;
            const tx = Math.cos(angle) * dist;
            const ty = Math.sin(angle) * dist;
            const size = 8 + Math.random() * 12;
            return (
              <div
                key={i}
                className="absolute rounded-full"
                style={{
                  width: size,
                  height: size,
                  backgroundColor: i % 2 === 0 ? "#fbbf24" : "#ef4444",
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
