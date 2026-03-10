"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { fetchAllData } from "@/lib/api";
import { calculateOpponentDistance } from "@/lib/algorithm";
import { usePolling } from "@/hooks/usePolling";
import FlunkyballField from "@/components/FlunkyballField";
import PunchAnimation from "@/components/PunchAnimation";
import VictoryAnimation from "@/components/VictoryAnimation";
import { Game, Trainee } from "@/lib/types";

interface PunchEntry {
  traineeName: string;
  avatarUrl: string | null;
}

interface VictoryEntry {
  winnerName: string;
  winnerAvatar: string | null;
}

function findLosingTrainee(
  game: Game,
  trainees: Trainee[]
): PunchEntry | null {
  const trainee = trainees.find((t) => t.id === game.trainee_id);
  if (!trainee) return null;
  return {
    traineeName: trainee.name,
    avatarUrl: trainee.avatar_url,
  };
}

function findWinningTrainee(
  game: Game,
  trainees: Trainee[]
): VictoryEntry | null {
  const winner = trainees.find((t) => t.id === game.trainee_id);
  if (!winner) return null;
  return {
    winnerName: winner.name,
    winnerAvatar: winner.avatar_url,
  };
}

export default function BeamerPage() {
  const fetcher = useCallback(() => fetchAllData(), []);
  const { data } = usePolling(fetcher, 3000);

  const seenGameIdsRef = useRef<Set<string> | null>(null);
  const [punchQueue, setPunchQueue] = useState<PunchEntry[]>([]);
  const [currentPunch, setCurrentPunch] = useState<PunchEntry | null>(null);
  const punchKeyRef = useRef(0);

  const [victoryQueue, setVictoryQueue] = useState<VictoryEntry[]>([]);
  const [currentVictory, setCurrentVictory] = useState<VictoryEntry | null>(
    null
  );
  const victoryKeyRef = useRef(0);

  useEffect(() => {
    if (!data) return;

    const { games, trainees } = data;
    const allCurrentIds = new Set(games.map((g) => g.id));

    if (seenGameIdsRef.current !== null) {
      const newPunches: PunchEntry[] = [];
      const newVictories: VictoryEntry[] = [];

      for (const game of games) {
        if (!seenGameIdsRef.current.has(game.id)) {
          if (game.winner === "group") {
            const entry = findLosingTrainee(game, trainees);
            if (entry) newPunches.push(entry);
          } else {
            const entry = findWinningTrainee(game, trainees);
            if (entry) newVictories.push(entry);
          }
        }
      }
      if (newPunches.length > 0) {
        setPunchQueue((prev) => [...prev, ...newPunches]);
      }
      if (newVictories.length > 0) {
        setVictoryQueue((prev) => [...prev, ...newVictories]);
      }
    }

    seenGameIdsRef.current = allCurrentIds;
  }, [data]);

  // Punch queue processor
  useEffect(() => {
    if (currentPunch === null && currentVictory === null && punchQueue.length > 0) {
      punchKeyRef.current += 1;
      setCurrentPunch(punchQueue[0]);
      setPunchQueue((prev) => prev.slice(1));
    }
  }, [currentPunch, currentVictory, punchQueue]);

  // Victory queue processor (only plays when no punch is active)
  useEffect(() => {
    if (
      currentPunch === null &&
      currentVictory === null &&
      punchQueue.length === 0 &&
      victoryQueue.length > 0
    ) {
      victoryKeyRef.current += 1;
      setCurrentVictory(victoryQueue[0]);
      setVictoryQueue((prev) => prev.slice(1));
    }
  }, [currentPunch, currentVictory, punchQueue, victoryQueue]);

  const dismissPunch = useCallback(() => {
    setCurrentPunch(null);
  }, []);

  const dismissVictory = useCallback(() => {
    setCurrentVictory(null);
  }, []);

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
      {currentPunch && (
        <PunchAnimation
          key={punchKeyRef.current}
          onComplete={dismissPunch}
          avatarUrl={currentPunch.avatarUrl}
          traineeName={currentPunch.traineeName}
        />
      )}

      {currentVictory && (
        <VictoryAnimation
          key={victoryKeyRef.current}
          onComplete={dismissVictory}
          winnerName={currentVictory.winnerName}
          winnerAvatar={currentVictory.winnerAvatar}
        />
      )}

      {/* Title Bar */}
      <div className="flex items-center justify-between px-8 py-4">
        <h1 className="text-4xl font-extrabold text-white tracking-tight">
          SCHLAG DEN <span className="text-amber-400">TRAINEE</span>
        </h1>
        <div className="flex items-center gap-6">
          {(punchQueue.length > 0 || victoryQueue.length > 0) && (
            <div className="text-amber-400 text-sm font-bold animate-pulse">
              +{punchQueue.length + victoryQueue.length} wartend
            </div>
          )}
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
          trainees={trainees}
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
