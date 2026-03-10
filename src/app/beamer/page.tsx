"use client";

import { useCallback } from "react";
import { fetchAllData } from "@/lib/api";
import { calculateOpponentDistance } from "@/lib/algorithm";
import { usePolling } from "@/hooks/usePolling";
import FlunkyballField from "@/components/FlunkyballField";

export default function BeamerPage() {
  const fetcher = useCallback(() => fetchAllData(), []);
  const { data } = usePolling(fetcher, 3000);

  if (!data) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-2xl animate-pulse">
          Schlag den Trainee wird geladen...
        </div>
      </div>
    );
  }

  const { config, trainees, games } = data;
  const traineeWins = games.filter((g) => g.winner === "trainee").length;
  const groupWins = games.filter((g) => g.winner === "group").length;
  const totalGames = trainees.length * trainees.length;
  const gamesPlayed = games.length;
  const opponentDistance = calculateOpponentDistance(
    config,
    trainees.length,
    groupWins
  );

  return (
    <div className="min-h-screen bg-black flex flex-col overflow-hidden">
      {/* Title Bar */}
      <div className="flex items-center justify-between px-8 py-4">
        <h1 className="text-4xl font-extrabold text-white tracking-tight">
          SCHLAG DEN <span className="text-amber-400">TRAINEE</span>
        </h1>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <span className="text-gray-500 text-sm block">Fortschritt</span>
            <span className="text-white text-xl font-bold">
              {gamesPlayed} / {totalGames} Spiele
            </span>
          </div>
        </div>
      </div>

      {/* Main Field */}
      <div className="flex-1 flex items-center justify-center px-8 pb-4">
        <FlunkyballField
          config={config}
          opponentDistance={opponentDistance}
          totalTrainees={trainees.length}
          traineeWins={traineeWins}
          groupWins={groupWins}
        />
      </div>

      {/* Bottom Stats Bar */}
      <div className="flex items-center justify-between px-8 py-4 bg-gray-950 border-t border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 rounded-full bg-blue-500" />
          <span className="text-blue-400 font-bold text-lg">Trainees</span>
          <span className="text-white text-3xl font-extrabold ml-2">
            {traineeWins}
          </span>
        </div>

        <div className="flex flex-col items-center">
          <span className="text-gray-500 text-xs uppercase tracking-wider">
            Gegner-Distanz
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-emerald-400 text-4xl font-extrabold">
              {opponentDistance.toFixed(1)}
            </span>
            <span className="text-emerald-600 text-lg">m</span>
          </div>
          <span className="text-gray-600 text-xs">
            (Start: {config.opponent_base_distance}m / Trainee:{" "}
            {config.trainee_distance}m)
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-white text-3xl font-extrabold mr-2">
            {groupWins}
          </span>
          <span className="text-amber-400 font-bold text-lg">Gegner</span>
          <div className="w-4 h-4 rounded-full bg-amber-500" />
        </div>
      </div>
    </div>
  );
}
