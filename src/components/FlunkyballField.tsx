"use client";

import { Config, Trainee } from "@/lib/types";

interface FlunkyballFieldProps {
  config: Config;
  opponentDistance: number;
  trainees: Trainee[];
  traineeWins: number;
  groupWins: number;
}

export default function FlunkyballField({
  config,
  opponentDistance,
  trainees,
  traineeWins,
  groupWins,
}: FlunkyballFieldProps) {
  const svgWidth = 1200;
  const svgHeight = 600;
  const fieldPadding = 100;
  const bottleX = svgWidth / 2;
  const bottleY = svgHeight / 2;
  const playerRadius = 20;

  const maxDisplayDistance =
    Math.max(config.opponent_base_distance, config.trainee_distance) * 1.15;
  const availableHalfWidth = svgWidth / 2 - fieldPadding;
  const pxPerMeter = availableHalfWidth / maxDisplayDistance;

  const traineeX = bottleX - config.trainee_distance * pxPerMeter;
  const opponentX = bottleX + opponentDistance * pxPerMeter;
  const opponentStartX = bottleX + config.opponent_base_distance * pxPerMeter;

  const playerCount = Math.max(trainees.length, 3);
  const playerSpacing = Math.min(
    (svgHeight - 200) / (playerCount - 1),
    60
  );
  const totalPlayersHeight = (playerCount - 1) * playerSpacing;
  const playersStartY = bottleY - totalPlayersHeight / 2;

  const arrowY = svgHeight - 50;

  return (
    <svg
      viewBox={`0 0 ${svgWidth} ${svgHeight}`}
      className="w-full h-full"
      style={{ maxHeight: "70vh" }}
    >
      {/* Clip path definitions for circular images */}
      <defs>
        {trainees.map((t, i) => (
          <clipPath key={`clip-t-${i}`} id={`clip-trainee-${i}`}>
            <circle
              cx={traineeX}
              cy={playersStartY + i * playerSpacing}
              r={playerRadius}
            />
          </clipPath>
        ))}
      </defs>

      {/* Field background */}
      <rect
        x="20"
        y="20"
        width={svgWidth - 40}
        height={svgHeight - 40}
        rx="16"
        fill="#1a2a1a"
        stroke="#2d5a2d"
        strokeWidth="3"
      />

      {/* Field grass texture lines */}
      {Array.from({ length: 15 }, (_, i) => (
        <line
          key={`grass-${i}`}
          x1={20 + ((svgWidth - 40) / 14) * i}
          y1="20"
          x2={20 + ((svgWidth - 40) / 14) * i}
          y2={svgHeight - 20}
          stroke="#244d24"
          strokeWidth="1"
          opacity="0.25"
        />
      ))}

      {/* Center line through bottle */}
      <line
        x1={bottleX}
        y1="30"
        x2={bottleX}
        y2={svgHeight - 30}
        stroke="#3d7a3d"
        strokeWidth="2"
        strokeDasharray="8,6"
      />

      {/* Trainee position line */}
      <line
        x1={traineeX}
        y1="50"
        x2={traineeX}
        y2={svgHeight - 70}
        stroke="#4488ff"
        strokeWidth="1.5"
        strokeDasharray="4,4"
        opacity="0.4"
      />

      {/* Opponent current position line */}
      <line
        x1={opponentX}
        y1="50"
        x2={opponentX}
        y2={svgHeight - 70}
        stroke="#ffaa00"
        strokeWidth="1.5"
        strokeDasharray="4,4"
        opacity="0.4"
        className="transition-all duration-[1500ms] ease-out"
      />

      {/* Ghost: opponent start position */}
      {Math.abs(opponentStartX - opponentX) > 5 && (
        <line
          x1={opponentStartX}
          y1="50"
          x2={opponentStartX}
          y2={svgHeight - 70}
          stroke="#555"
          strokeWidth="1"
          strokeDasharray="2,6"
          opacity="0.25"
        />
      )}

      {/* Bottle */}
      <g>
        <ellipse
          cx={bottleX}
          cy={bottleY + 12}
          rx="10"
          ry="6"
          fill="#5a3a1a"
          opacity="0.5"
        />
        <rect
          x={bottleX - 7}
          y={bottleY - 18}
          width="14"
          height="30"
          rx="4"
          fill="#27ae60"
          stroke="#1e8449"
          strokeWidth="1.5"
        />
        <rect
          x={bottleX - 4}
          y={bottleY - 26}
          width="8"
          height="10"
          rx="2"
          fill="#2ecc71"
          stroke="#27ae60"
          strokeWidth="1"
        />
      </g>

      {/* Trainee players (left side) */}
      {Array.from({ length: playerCount }, (_, i) => {
        const cy = playersStartY + i * playerSpacing;
        const trainee = trainees[i];
        const hasAvatar = trainee?.avatar_url;
        return (
          <g key={`trainee-${i}`}>
            {/* Background circle */}
            <circle
              cx={traineeX}
              cy={cy}
              r={playerRadius}
              fill="#3b82f6"
              stroke="#1d4ed8"
              strokeWidth="2.5"
            />
            {hasAvatar ? (
              <image
                href={trainee.avatar_url!}
                x={traineeX - playerRadius}
                y={cy - playerRadius}
                width={playerRadius * 2}
                height={playerRadius * 2}
                clipPath={`url(#clip-trainee-${i})`}
                preserveAspectRatio="xMidYMid slice"
              />
            ) : (
              <text
                x={traineeX}
                y={cy + 5}
                textAnchor="middle"
                fill="white"
                fontSize="12"
                fontWeight="bold"
              >
                T{i + 1}
              </text>
            )}
            {/* Border on top of image */}
            {hasAvatar && (
              <circle
                cx={traineeX}
                cy={cy}
                r={playerRadius}
                fill="none"
                stroke="#1d4ed8"
                strokeWidth="2.5"
              />
            )}
          </g>
        );
      })}

      {/* Opponent players (right side) */}
      {Array.from({ length: playerCount }, (_, i) => {
        const cy = playersStartY + i * playerSpacing;
        return (
          <g
            key={`opponent-${i}`}
            className="transition-all duration-[1500ms] ease-out"
          >
            <circle
              cx={opponentX}
              cy={cy}
              r={playerRadius}
              fill="#f59e0b"
              stroke="#b45309"
              strokeWidth="2.5"
              className="transition-all duration-[1500ms] ease-out"
            />
            <text
              x={opponentX}
              y={cy + 5}
              textAnchor="middle"
              fill="white"
              fontSize="12"
              fontWeight="bold"
              className="transition-all duration-[1500ms] ease-out"
            >
              G{i + 1}
            </text>
          </g>
        );
      })}

      {/* Team Labels top */}
      <text
        x={traineeX}
        y="48"
        textAnchor="middle"
        fill="#60a5fa"
        fontSize="15"
        fontWeight="bold"
      >
        TRAINEES ({config.trainee_distance.toFixed(1)}m)
      </text>

      <text
        x={opponentX}
        y="48"
        textAnchor="middle"
        fill="#fbbf24"
        fontSize="15"
        fontWeight="bold"
        className="transition-all duration-[1500ms] ease-out"
      >
        GEGNER ({opponentDistance.toFixed(1)}m)
      </text>

      {/* Distance arrow at the bottom */}
      <g>
        <line
          x1={traineeX}
          y1={arrowY}
          x2={opponentX}
          y2={arrowY}
          stroke="#aaa"
          strokeWidth="1.5"
          className="transition-all duration-[1500ms] ease-out"
        />
        <line
          x1={traineeX}
          y1={arrowY - 6}
          x2={traineeX}
          y2={arrowY + 6}
          stroke="#60a5fa"
          strokeWidth="2"
        />
        <line
          x1={opponentX}
          y1={arrowY - 6}
          x2={opponentX}
          y2={arrowY + 6}
          stroke="#fbbf24"
          strokeWidth="2"
          className="transition-all duration-[1500ms] ease-out"
        />
        <line
          x1={bottleX}
          y1={arrowY - 4}
          x2={bottleX}
          y2={arrowY + 4}
          stroke="#2ecc71"
          strokeWidth="2"
        />
      </g>

      {/* Score display */}
      <g>
        <rect
          x={bottleX - 90}
          y={svgHeight - 100}
          width="180"
          height="38"
          rx="10"
          fill="rgba(0,0,0,0.7)"
        />
        <text
          x={bottleX - 35}
          y={svgHeight - 75}
          textAnchor="middle"
          fill="#60a5fa"
          fontSize="22"
          fontWeight="bold"
        >
          {traineeWins}
        </text>
        <text
          x={bottleX}
          y={svgHeight - 76}
          textAnchor="middle"
          fill="#555"
          fontSize="18"
        >
          :
        </text>
        <text
          x={bottleX + 35}
          y={svgHeight - 75}
          textAnchor="middle"
          fill="#fbbf24"
          fontSize="22"
          fontWeight="bold"
        >
          {groupWins}
        </text>
      </g>
    </svg>
  );
}
