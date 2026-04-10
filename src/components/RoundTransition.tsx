"use client";

import { useEffect, useState } from "react";
import { Trainee } from "@/lib/types";

interface RoundTransitionProps {
  trainees: Trainee[];
  roundNumber: number;
  onDismiss: () => void;
}

function getGroupForTrainee(
  sortOrder: number,
  round: number,
  totalTrainees: number
): number {
  return ((sortOrder - 1 + round - 1) % totalTrainees) + 1;
}

export default function RoundTransition({
  trainees,
  roundNumber,
  onDismiss,
}: RoundTransitionProps) {
  const [phase, setPhase] = useState<"enter" | "lines" | "ready">("enter");
  const n = trainees.length;

  const centerX = 500;
  const centerY = 400;
  const innerRadius = 140;
  const outerRadius = 300;

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("lines"), 800 + n * 150);
    const t2 = setTimeout(() => setPhase("ready"), 800 + n * 150 + 600);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [n]);

  const assignments = trainees.map((t, i) => {
    const sortOrder = i + 1;
    const groupNumber = getGroupForTrainee(sortOrder, roundNumber, n);

    const traineeAngle = (2 * Math.PI * i) / n - Math.PI / 2;
    const tx = centerX + innerRadius * Math.cos(traineeAngle);
    const ty = centerY + innerRadius * Math.sin(traineeAngle);

    const gx = centerX + outerRadius * Math.cos(traineeAngle);
    const gy = centerY + outerRadius * Math.sin(traineeAngle);

    return { trainee: t, sortOrder, groupNumber, tx, ty, gx, gy, traineeAngle };
  });

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center cursor-pointer"
      style={{ background: "rgba(0, 0, 0, 0.92)" }}
      onClick={onDismiss}
    >
      <h2
        className="text-5xl font-extrabold text-white mb-2 tracking-tight"
        style={{
          animation: "rtFadeIn 0.6s ease-out both",
        }}
      >
        RUNDE {roundNumber}
      </h2>
      <p
        className="text-gray-400 text-lg mb-8"
        style={{
          animation: "rtFadeIn 0.6s ease-out 0.3s both",
        }}
      >
        Naechste Zuordnung
      </p>

      <svg viewBox="0 0 1000 800" className="w-full max-w-4xl" style={{ maxHeight: "70vh" }}>
        <defs>
          {assignments.map((a, i) => (
            <clipPath key={`clip-rt-${i}`} id={`clip-rt-${i}`}>
              <circle cx={a.tx} cy={a.ty} r={38} />
            </clipPath>
          ))}
        </defs>

        {/* Connection lines from groups to trainees */}
        {assignments.map((a, i) => {
          const dx = a.tx - a.gx;
          const dy = a.ty - a.gy;
          const len = Math.sqrt(dx * dx + dy * dy);
          const nx = dx / len;
          const ny = dy / len;
          const startX = a.gx + nx * 28;
          const startY = a.gy + ny * 28;
          const endX = a.tx - nx * 42;
          const endY = a.ty - ny * 42;

          return (
            <g key={`line-${i}`}>
              <line
                x1={startX}
                y1={startY}
                x2={endX}
                y2={endY}
                stroke="#fbbf24"
                strokeWidth="2"
                opacity={phase === "enter" ? 0 : 0.6}
                style={{
                  transition: "opacity 0.5s ease-out",
                  transitionDelay: `${i * 80}ms`,
                }}
              />
              {/* Arrow head */}
              <polygon
                points={(() => {
                  const arrowLen = 10;
                  const arrowWidth = 6;
                  const ax = endX;
                  const ay = endY;
                  const p1x = ax + nx * arrowLen + ny * arrowWidth;
                  const p1y = ay + ny * arrowLen - nx * arrowWidth;
                  const p2x = ax + nx * arrowLen - ny * arrowWidth;
                  const p2y = ay + ny * arrowLen + nx * arrowWidth;
                  return `${ax},${ay} ${p1x},${p1y} ${p2x},${p2y}`;
                })()}
                fill="#fbbf24"
                opacity={phase === "enter" ? 0 : 0.6}
                style={{
                  transition: "opacity 0.5s ease-out",
                  transitionDelay: `${i * 80}ms`,
                }}
              />
            </g>
          );
        })}

        {/* Group labels (outer ring, positioned at their assigned trainee's angle) */}
        {assignments.map((a, i) => (
          <g
            key={`group-${i}`}
            style={{
              animation: `rtFadeIn 0.4s ease-out ${400 + i * 100}ms both`,
            }}
          >
            <circle cx={a.gx} cy={a.gy} r={26} fill="#b45309" opacity={0.9} />
            <text
              x={a.gx}
              y={a.gy - 2}
              textAnchor="middle"
              fill="white"
              fontSize="10"
              fontWeight="bold"
            >
              Gruppe
            </text>
            <text
              x={a.gx}
              y={a.gy + 14}
              textAnchor="middle"
              fill="white"
              fontSize="16"
              fontWeight="bold"
            >
              {a.groupNumber}
            </text>
          </g>
        ))}

        {/* Trainee dots (inner ring) */}
        {assignments.map((a, i) => (
          <g
            key={`trainee-${i}`}
            style={{
              animation: `rtFadeIn 0.5s ease-out ${i * 150}ms both`,
            }}
          >
            <circle
              cx={a.tx}
              cy={a.ty}
              r={40}
              fill="#1d4ed8"
              stroke="#3b82f6"
              strokeWidth="3"
            />
            {a.trainee.avatar_url ? (
              <>
                <image
                  href={a.trainee.avatar_url}
                  x={a.tx - 38}
                  y={a.ty - 38}
                  width={76}
                  height={76}
                  clipPath={`url(#clip-rt-${i})`}
                  preserveAspectRatio="xMidYMid slice"
                />
                <circle
                  cx={a.tx}
                  cy={a.ty}
                  r={40}
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="3"
                />
              </>
            ) : (
              <text
                x={a.tx}
                y={a.ty + 6}
                textAnchor="middle"
                fill="white"
                fontSize="18"
                fontWeight="bold"
              >
                {a.sortOrder}
              </text>
            )}
            {/* Name label below dot */}
            <text
              x={a.tx}
              y={a.ty + 55}
              textAnchor="middle"
              fill="white"
              fontSize="14"
              fontWeight="600"
            >
              {a.trainee.name}
            </text>
          </g>
        ))}
      </svg>

      <p
        className="text-gray-500 text-sm mt-4"
        style={{
          animation: `rtFadeIn 0.5s ease-out ${800 + n * 150 + 800}ms both`,
        }}
      >
        Klicken zum Fortfahren
      </p>

      <style>{`
        @keyframes rtFadeIn {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}
