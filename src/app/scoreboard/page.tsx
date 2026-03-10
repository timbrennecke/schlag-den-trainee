"use client";

import { useCallback } from "react";
import { Trainee, Game, TraineeStats } from "@/lib/types";
import { fetchAllData } from "@/lib/api";
import { calculateOpponentDistance } from "@/lib/algorithm";
import { usePolling } from "@/hooks/usePolling";
import Link from "next/link";

function buildStats(trainees: Trainee[], games: Game[]): TraineeStats[] {
  return trainees.map((trainee) => {
    const traineeGames = games.filter((g) => g.trainee_id === trainee.id);
    const wins = traineeGames.filter((g) => g.winner === "trainee").length;
    const losses = traineeGames.filter((g) => g.winner === "group").length;
    return {
      trainee,
      wins,
      losses,
      gamesPlayed: traineeGames.length,
      games: traineeGames.sort((a, b) => a.group_number - b.group_number),
    };
  });
}

export default function ScoreboardPage() {
  const fetcher = useCallback(() => fetchAllData(), []);
  const { data } = usePolling(fetcher, 5000);

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-lg text-gray-600">Laden...</p>
      </div>
    );
  }

  const { config, trainees, games } = data;
  const stats = buildStats(trainees, games);
  const totalTraineeWins = games.filter((g) => g.winner === "trainee").length;
  const totalGroupWins = games.filter((g) => g.winner === "group").length;
  const totalGamesPlayed = games.length;
  const totalGamesExpected = trainees.length * trainees.length;
  const opponentDistance = calculateOpponentDistance(
    config,
    trainees.length,
    totalGroupWins
  );
  const allGroupNumbers = trainees.map((t) => t.sort_order);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Scoreboard</h1>
          <div className="flex gap-2">
            <Link
              href="/admin"
              className="px-3 py-1.5 text-sm bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
            >
              Admin
            </Link>
            <Link
              href="/beamer"
              className="px-3 py-1.5 text-sm bg-gray-900 text-white rounded-lg hover:bg-gray-700"
            >
              Beamer
            </Link>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
            <p className="text-3xl font-bold text-blue-600">
              {totalTraineeWins}
            </p>
            <p className="text-sm text-gray-500 mt-1">Trainee-Siege</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
            <p className="text-3xl font-bold text-amber-600">
              {totalGroupWins}
            </p>
            <p className="text-sm text-gray-500 mt-1">Gegner-Siege</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
            <p className="text-3xl font-bold text-gray-900">
              {totalGamesPlayed}/{totalGamesExpected}
            </p>
            <p className="text-sm text-gray-500 mt-1">Spiele gespielt</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
            <p className="text-3xl font-bold text-emerald-600">
              {opponentDistance.toFixed(1)}m
            </p>
            <p className="text-sm text-gray-500 mt-1">Gegner-Distanz</p>
          </div>
        </div>

        {/* Distance comparison */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Gegner: {opponentDistance.toFixed(1)}m
            </span>
            <span className="text-sm font-medium text-gray-700">
              Trainees: {config.trainee_distance.toFixed(1)}m
            </span>
          </div>
          <div className="relative h-4 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="absolute left-0 top-0 h-full bg-amber-500 rounded-full transition-all duration-1000"
              style={{
                width: `${Math.max(
                  5,
                  ((config.opponent_base_distance - opponentDistance) /
                    (config.opponent_base_distance -
                      config.trainee_distance)) *
                    100
                )}%`,
              }}
            />
            <div
              className="absolute top-0 h-full w-0.5 bg-blue-600"
              style={{
                left: `${
                  ((config.opponent_base_distance - config.trainee_distance) /
                    (config.opponent_base_distance - 0.5)) *
                  100
                }%`,
              }}
            />
          </div>
          <div className="flex justify-between mt-1 text-xs text-gray-400">
            <span>{config.opponent_base_distance}m (Start)</span>
            <span>{config.trainee_distance}m (Trainee)</span>
          </div>
        </div>

        {/* Per-Trainee Results */}
        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-gray-900">
            Ergebnisse pro Trainee
          </h2>
          {stats.map((s) => (
            <div
              key={s.trainee.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 flex items-center justify-center bg-blue-100 text-blue-800 rounded-full font-bold">
                    T{s.trainee.sort_order}
                  </span>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {s.trainee.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {s.gamesPlayed} / {trainees.length} Spiele absolviert
                    </p>
                  </div>
                </div>
                <div className="flex gap-4 text-center">
                  <div>
                    <p className="text-xl font-bold text-blue-600">{s.wins}</p>
                    <p className="text-xs text-gray-400">Siege</p>
                  </div>
                  <div>
                    <p className="text-xl font-bold text-amber-600">
                      {s.losses}
                    </p>
                    <p className="text-xs text-gray-400">Niederlagen</p>
                  </div>
                </div>
              </div>
              {/* Game results per group */}
              <div className="flex gap-2 flex-wrap">
                {allGroupNumbers.map((groupNum) => {
                  const game = s.games.find(
                    (g) => g.group_number === groupNum
                  );
                  let bgClass = "bg-gray-100 text-gray-400 border-gray-200";
                  let label = `G${groupNum}`;
                  if (game?.winner === "trainee") {
                    bgClass =
                      "bg-blue-100 text-blue-700 border-blue-300";
                    label = `G${groupNum} ✓`;
                  }
                  if (game?.winner === "group") {
                    bgClass =
                      "bg-amber-100 text-amber-700 border-amber-300";
                    label = `G${groupNum} ✗`;
                  }
                  return (
                    <span
                      key={groupNum}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${bgClass}`}
                      title={`Gruppe ${groupNum}: ${
                        game
                          ? game.winner === "trainee"
                            ? "Trainee gewonnen"
                            : "Gruppe gewonnen"
                          : "Noch nicht gespielt"
                      }`}
                    >
                      {label}
                    </span>
                  );
                })}
              </div>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
