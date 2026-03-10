"use client";

import { useState, useEffect, useCallback } from "react";
import { Trainee, Game } from "@/lib/types";
import {
  fetchTrainees,
  fetchGamesByTrainee,
  submitGameResult,
} from "@/lib/api";
import Link from "next/link";

type Phase = "select" | "selectStartGroup" | "play" | "done";

function getGroupRotation(
  startGroup: number,
  allGroups: number[]
): number[] {
  const sorted = [...allGroups].sort((a, b) => a - b);
  const startIdx = sorted.indexOf(startGroup);
  if (startIdx === -1) return sorted;
  return [...sorted.slice(startIdx), ...sorted.slice(0, startIdx)];
}

export default function InputPage() {
  const [phase, setPhase] = useState<Phase>("select");
  const [trainees, setTrainees] = useState<Trainee[]>([]);
  const [selectedTrainee, setSelectedTrainee] = useState<Trainee | null>(null);
  const [existingGames, setExistingGames] = useState<Game[]>([]);
  const [groupRotation, setGroupRotation] = useState<number[]>([]);
  const [currentGroupNumber, setCurrentGroupNumber] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [lastResult, setLastResult] = useState<"trainee" | "group" | null>(
    null
  );

  const totalGroups = trainees.length;
  const allGroupNumbers = trainees.map((t) => t.sort_order);

  useEffect(() => {
    fetchTrainees().then(setTrainees);
  }, []);

  const selectTrainee = useCallback(
    async (trainee: Trainee) => {
      setSelectedTrainee(trainee);
      const games = await fetchGamesByTrainee(trainee.id);
      setExistingGames(games);
      setLastResult(null);

      if (games.length >= trainees.length) {
        setPhase("done");
      } else {
        setPhase("selectStartGroup");
      }
    },
    [trainees]
  );

  const startWithGroup = (startGroup: number) => {
    const rotation = getGroupRotation(startGroup, allGroupNumbers);
    setGroupRotation(rotation);

    const playedGroups = new Set(existingGames.map((g) => g.group_number));
    const nextGroup = rotation.find((gn) => !playedGroups.has(gn));

    if (nextGroup === undefined) {
      setPhase("done");
    } else {
      setCurrentGroupNumber(nextGroup);
      setPhase("play");
    }
  };

  const handleResult = async (winner: "trainee" | "group") => {
    if (!selectedTrainee) return;
    setSubmitting(true);
    try {
      const game = await submitGameResult(
        selectedTrainee.id,
        currentGroupNumber,
        winner
      );
      setLastResult(winner);
      const updatedGames = [...existingGames, game];
      setExistingGames(updatedGames);

      setTimeout(() => {
        const playedGroups = new Set(updatedGames.map((g) => g.group_number));
        const nextGroup = groupRotation.find((gn) => !playedGroups.has(gn));

        if (nextGroup === undefined) {
          setPhase("done");
        } else {
          setCurrentGroupNumber(nextGroup);
          setLastResult(null);
        }
      }, 1500);
    } catch {
      alert("Fehler beim Speichern!");
    }
    setSubmitting(false);
  };

  const goBack = () => {
    setPhase("select");
    setSelectedTrainee(null);
    setExistingGames([]);
    setGroupRotation([]);
    setLastResult(null);
  };

  if (trainees.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-6">
        <p className="text-lg">Laden...</p>
        <Link
          href="/admin"
          className="mt-4 text-blue-400 underline text-sm"
        >
          Zum Admin
        </Link>
      </div>
    );
  }

  /* ───── Phase: Trainee auswaehlen ───── */
  if (phase === "select") {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-6">
        <h1 className="text-2xl font-bold text-center mb-6">
          Wer bist du?
        </h1>
        <div className="max-w-md mx-auto space-y-3">
          {trainees.map((t) => (
            <button
              key={t.id}
              onClick={() => selectTrainee(t)}
              className="w-full flex items-center gap-4 p-4 bg-gray-800 hover:bg-gray-700 rounded-xl active:scale-[0.98] transition-transform cursor-pointer"
            >
              <span className="w-12 h-12 flex items-center justify-center bg-blue-600 rounded-full text-lg font-bold">
                {t.sort_order}
              </span>
              <div className="text-left">
                <p className="font-semibold text-lg">{t.name}</p>
                <p className="text-gray-400 text-sm">
                  spielt gegen {totalGroups} Gruppen
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  /* ───── Phase: Startgruppe waehlen ───── */
  if (phase === "selectStartGroup") {
    const playedGroups = new Set(existingGames.map((g) => g.group_number));

    return (
      <div className="min-h-screen bg-gray-900 text-white p-6">
        <div className="max-w-md mx-auto">
          <button
            onClick={goBack}
            className="text-gray-400 hover:text-white text-sm mb-4 cursor-pointer"
          >
            ← Zurueck
          </button>
          <h1 className="text-xl font-bold text-center mb-2">
            {selectedTrainee?.name}
          </h1>
          <p className="text-center text-gray-400 mb-6">
            Gegen welche Gruppe startest du?
          </p>
          <p className="text-center text-gray-500 text-xs mb-4">
            Von hier aus wird aufwaerts durchgezaehlt (z.B. 3 → 4 → 5 → 1 → 2)
          </p>
          <div className="grid grid-cols-2 gap-3">
            {allGroupNumbers.map((gn) => {
              const alreadyPlayed = playedGroups.has(gn);
              return (
                <button
                  key={gn}
                  onClick={() => startWithGroup(gn)}
                  className={`p-4 rounded-xl text-center transition-all cursor-pointer active:scale-[0.97] ${
                    alreadyPlayed
                      ? "bg-gray-800 border-2 border-gray-700 opacity-60"
                      : "bg-amber-600 hover:bg-amber-500 border-2 border-amber-500"
                  }`}
                >
                  <p className="text-2xl font-bold">{gn}</p>
                  <p className="text-sm mt-1">
                    {alreadyPlayed ? "Bereits gespielt" : `Gruppe ${gn}`}
                  </p>
                </button>
              );
            })}
          </div>
          {existingGames.length > 0 && (
            <p className="text-center text-gray-500 text-xs mt-4">
              {existingGames.length} / {totalGroups} Spiele bereits gespielt
              — bereits gespielte Gruppen werden uebersprungen
            </p>
          )}
        </div>
      </div>
    );
  }

  /* ───── Phase: Fertig ───── */
  if (phase === "done") {
    const traineeWins = existingGames.filter(
      (g) => g.winner === "trainee"
    ).length;
    const groupWins = existingGames.filter(
      (g) => g.winner === "group"
    ).length;

    return (
      <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-6">
        <div className="text-center space-y-4">
          <div className="text-6xl mb-4">
            {traineeWins > groupWins ? "🏆" : traineeWins === groupWins ? "🤝" : "😤"}
          </div>
          <h1 className="text-2xl font-bold">
            Alle Spiele abgeschlossen!
          </h1>
          <p className="text-gray-400">
            {selectedTrainee?.name} gegen alle {totalGroups} Gruppen
          </p>
          <div className="flex gap-8 justify-center mt-6">
            <div className="text-center">
              <p className="text-4xl font-bold text-blue-400">
                {traineeWins}
              </p>
              <p className="text-sm text-gray-400">Trainee</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-amber-400">
                {groupWins}
              </p>
              <p className="text-sm text-gray-400">Gruppen</p>
            </div>
          </div>

          <div className="mt-6 space-y-2 max-w-xs mx-auto">
            {(groupRotation.length > 0 ? groupRotation : allGroupNumbers).map(
              (groupNum) => {
                const game = existingGames.find(
                  (g) => g.group_number === groupNum
                );
                return (
                  <div
                    key={groupNum}
                    className={`flex items-center justify-between px-4 py-2 rounded-lg text-sm ${
                      game?.winner === "trainee"
                        ? "bg-blue-900/40 text-blue-300"
                        : game?.winner === "group"
                        ? "bg-amber-900/40 text-amber-300"
                        : "bg-gray-800 text-gray-500"
                    }`}
                  >
                    <span>Gruppe {groupNum}</span>
                    <span className="font-bold">
                      {game
                        ? game.winner === "trainee"
                          ? "Gewonnen"
                          : "Verloren"
                        : "—"}
                    </span>
                  </div>
                );
              }
            )}
          </div>

          <button
            onClick={goBack}
            className="mt-8 px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-xl font-medium cursor-pointer"
          >
            Zurueck zur Auswahl
          </button>
        </div>
      </div>
    );
  }

  /* ───── Phase: Spielen ───── */
  const gamesPlayedCount = existingGames.length;

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      {/* Header */}
      <div className="p-4 text-center border-b border-gray-800 relative">
        <button
          onClick={goBack}
          className="absolute left-4 top-4 text-gray-400 hover:text-white text-sm cursor-pointer"
        >
          ← Zurueck
        </button>
        <p className="text-gray-400 text-sm">
          {selectedTrainee?.name}
        </p>
        <p className="text-2xl font-bold mt-1 text-amber-400">
          vs. Gruppe {currentGroupNumber}
        </p>
        <p className="text-gray-500 text-sm mt-1">
          Spiel {gamesPlayedCount + 1} von {totalGroups}
        </p>
        {/* Rotation preview */}
        <div className="flex justify-center gap-1.5 mt-3">
          {groupRotation.map((gn) => {
            const played = existingGames.some((g) => g.group_number === gn);
            const isCurrent = gn === currentGroupNumber;
            let cls = "w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center ";
            if (isCurrent) cls += "bg-amber-500 text-white ring-2 ring-amber-300";
            else if (played) cls += "bg-gray-700 text-gray-500";
            else cls += "bg-gray-800 text-gray-400";
            return (
              <span key={gn} className={cls}>
                {gn}
              </span>
            );
          })}
        </div>
      </div>

      {/* Result feedback */}
      {lastResult && (
        <div
          className={`p-4 text-center text-lg font-bold ${
            lastResult === "trainee"
              ? "bg-blue-900/50 text-blue-300"
              : "bg-amber-900/50 text-amber-300"
          }`}
        >
          {lastResult === "trainee"
            ? `${selectedTrainee?.name} gewinnt gegen Gruppe ${currentGroupNumber}!`
            : `Gruppe ${currentGroupNumber} gewinnt!`}
        </div>
      )}

      {/* Buttons */}
      <div className="flex-1 flex flex-col items-center justify-center gap-6 p-6">
        <button
          onClick={() => handleResult("trainee")}
          disabled={submitting || lastResult !== null}
          className="w-full max-w-sm h-32 bg-blue-600 hover:bg-blue-500 active:scale-[0.97] disabled:opacity-50 rounded-2xl text-2xl font-bold transition-all cursor-pointer"
        >
          Ich habe gewonnen
        </button>
        <div className="text-gray-600 text-sm font-medium">— oder —</div>
        <button
          onClick={() => handleResult("group")}
          disabled={submitting || lastResult !== null}
          className="w-full max-w-sm h-32 bg-amber-600 hover:bg-amber-500 active:scale-[0.97] disabled:opacity-50 rounded-2xl text-2xl font-bold transition-all cursor-pointer"
        >
          Gegner hat gewonnen
        </button>
      </div>

      {/* Score summary */}
      <div className="p-4 border-t border-gray-800 flex justify-center gap-8">
        <div className="text-center">
          <p className="text-2xl font-bold text-blue-400">
            {existingGames.filter((g) => g.winner === "trainee").length}
          </p>
          <p className="text-xs text-gray-500">Trainee</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-amber-400">
            {existingGames.filter((g) => g.winner === "group").length}
          </p>
          <p className="text-xs text-gray-500">Gruppen</p>
        </div>
      </div>
    </div>
  );
}
