"use client";

import { useState, useEffect, useCallback } from "react";
import { Config, Trainee } from "@/lib/types";
import {
  fetchConfig,
  updateConfig,
  fetchTrainees,
  addTrainee,
  deleteTrainee,
  deleteAllGames,
  uploadAvatar,
  updateTrainee,
} from "@/lib/api";
import { calculateOpponentDistance } from "@/lib/algorithm";
import Link from "next/link";

export default function AdminPage() {
  const [config, setConfig] = useState<Config | null>(null);
  const [trainees, setTrainees] = useState<Trainee[]>([]);
  const [newTraineeName, setNewTraineeName] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const loadData = useCallback(async () => {
    const [c, t] = await Promise.all([fetchConfig(), fetchTrainees()]);
    setConfig(c);
    setTrainees(t);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const showMessage = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 3000);
  };

  const handleConfigSave = async () => {
    if (!config) return;
    setSaving(true);
    try {
      const updated = await updateConfig({
        algorithm_scale: config.algorithm_scale,
        trainee_distance: config.trainee_distance,
        opponent_base_distance: config.opponent_base_distance,
      });
      setConfig(updated);
      showMessage("Einstellungen gespeichert!");
    } catch {
      showMessage("Fehler beim Speichern!");
    }
    setSaving(false);
  };

  const handleAddTrainee = async () => {
    if (!newTraineeName.trim()) return;
    try {
      const nextOrder = trainees.length > 0
        ? Math.max(...trainees.map((t) => t.sort_order)) + 1
        : 1;
      await addTrainee(newTraineeName.trim(), nextOrder);
      setNewTraineeName("");
      await loadData();
      showMessage("Trainee hinzugefuegt!");
    } catch {
      showMessage("Fehler beim Hinzufuegen!");
    }
  };

  const handleDeleteTrainee = async (id: string) => {
    try {
      await deleteTrainee(id);
      await loadData();
      showMessage("Trainee entfernt!");
    } catch {
      showMessage("Fehler beim Entfernen!");
    }
  };

  const handleAvatarUpload = async (
    trainee: Trainee,
    file: File
  ) => {
    try {
      showMessage("Bild wird hochgeladen...");
      const publicUrl = await uploadAvatar(trainee.id, file);
      await updateTrainee(trainee.id, { avatar_url: publicUrl });
      await loadData();
      showMessage(`Bild fuer ${trainee.name} gespeichert!`);
    } catch {
      showMessage("Fehler beim Hochladen!");
    }
  };

  const handleResetGames = async () => {
    if (!confirm("Wirklich ALLE Spielergebnisse loeschen?")) return;
    try {
      await deleteAllGames();
      showMessage("Alle Ergebnisse zurueckgesetzt!");
    } catch {
      showMessage("Fehler beim Zuruecksetzen!");
    }
  };

  if (!config) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">Laden...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">
            Schlag den Trainee — Admin
          </h1>
          <div className="flex gap-2">
            <Link
              href="/beamer"
              className="px-3 py-1.5 text-sm bg-gray-900 text-white rounded-lg hover:bg-gray-700"
            >
              Beamer
            </Link>
            <Link
              href="/input"
              className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-500"
            >
              Eingabe
            </Link>
            <Link
              href="/scoreboard"
              className="px-3 py-1.5 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-500"
            >
              Scoreboard
            </Link>
          </div>
        </div>

        {message && (
          <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg text-sm font-medium">
            {message}
          </div>
        )}

        {/* Config Section */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Einstellungen
          </h2>
          <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 mb-4 text-sm text-blue-800">
            Jeder Trainee spielt einmal gegen jede Kleingruppe.
            Bei {trainees.length} Trainees = {trainees.length} Gruppen = <strong>{trainees.length} Spiele pro Trainee</strong> ({trainees.length * trainees.length} Spiele gesamt).
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Algorithmus-Skalierung
              </label>
              <input
                type="number"
                min={0.1}
                max={3.0}
                step={0.1}
                value={config.algorithm_scale}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    algorithm_scale: parseFloat(e.target.value) || 1.0,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Trainee-Distanz (m)
              </label>
              <input
                type="number"
                min={1}
                max={30}
                step={0.5}
                value={config.trainee_distance}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    trainee_distance: parseFloat(e.target.value) || 5,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gegner Start-Distanz (m)
              </label>
              <input
                type="number"
                min={2}
                max={50}
                step={0.5}
                value={config.opponent_base_distance}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    opponent_base_distance: parseFloat(e.target.value) || 15,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          {/* Distance Simulator */}
          {trainees.length > 0 && (() => {
            const n = trainees.length;
            const totalGames = n * n;
            const scenarios = [
              { label: "Alle Trainees gewinnen", groupWins: 0 },
              { label: "25% Gegner-Siege", groupWins: Math.round(totalGames * 0.25) },
              { label: "Draw (50/50)", groupWins: Math.round(totalGames * 0.5) },
              { label: "75% Gegner-Siege", groupWins: Math.round(totalGames * 0.75) },
              { label: "Alle Gegner gewinnen", groupWins: totalGames },
            ];
            return (
              <div className="mt-5 bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  Distanz-Vorschau (bei {totalGames} Spielen, {n} Trainees)
                </h3>
                <div className="space-y-2">
                  {scenarios.map((s) => {
                    const dist = calculateOpponentDistance(config, n, s.groupWins);
                    const maxRange = config.opponent_base_distance - 2;
                    const progress = Math.max(0, Math.min(100,
                      ((config.opponent_base_distance - dist) / maxRange) * 100
                    ));
                    const isDraw = s.label.includes("Draw");
                    return (
                      <div key={s.label}>
                        <div className="flex items-center justify-between text-xs mb-0.5">
                          <span className={`${isDraw ? "font-bold text-gray-900" : "text-gray-600"}`}>
                            {s.label} ({s.groupWins}/{totalGames})
                          </span>
                          <span className={`font-mono ${isDraw ? "font-bold text-amber-700 text-sm" : "text-gray-700"}`}>
                            {dist.toFixed(1)}m
                          </span>
                        </div>
                        <div className="relative h-2 bg-gray-200 rounded-full">
                          <div
                            className={`absolute left-0 top-0 h-full rounded-full transition-all duration-300 ${isDraw ? "bg-amber-500" : "bg-amber-400/70"}`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-between mt-2 text-xs text-gray-400">
                  <span>{config.opponent_base_distance}m (Start)</span>
                  <span>{config.trainee_distance}m (Trainee) | 2m (Min)</span>
                </div>
              </div>
            );
          })()}

          <button
            onClick={handleConfigSave}
            disabled={saving}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 disabled:opacity-50 font-medium cursor-pointer"
          >
            {saving ? "Speichern..." : "Einstellungen speichern"}
          </button>
        </section>

        {/* Trainees Section */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Trainees ({trainees.length})
          </h2>
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              placeholder="Name des Trainees"
              value={newTraineeName}
              onChange={(e) => setNewTraineeName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddTrainee()}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              onClick={handleAddTrainee}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 font-medium cursor-pointer"
            >
              Hinzufuegen
            </button>
          </div>
          {trainees.length === 0 ? (
            <p className="text-gray-500 text-sm">
              Noch keine Trainees hinzugefuegt.
            </p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {trainees.map((t) => (
                <li
                  key={t.id}
                  className="flex items-center justify-between py-3"
                >
                  <div className="flex items-center gap-3">
                    {t.avatar_url ? (
                      <img
                        src={t.avatar_url}
                        alt={t.name}
                        className="w-10 h-10 rounded-full object-cover border-2 border-blue-300"
                      />
                    ) : (
                      <span className="w-10 h-10 flex items-center justify-center bg-blue-100 text-blue-800 rounded-full text-sm font-bold">
                        {t.sort_order}
                      </span>
                    )}
                    <div>
                      <span className="text-gray-900 font-medium">{t.name}</span>
                      <span className="text-gray-400 text-sm ml-2">
                        vs. alle {trainees.length} Gruppen
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg cursor-pointer font-medium">
                      {t.avatar_url ? "Bild aendern" : "Bild hochladen"}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleAvatarUpload(t, file);
                          e.target.value = "";
                        }}
                      />
                    </label>
                    <button
                      onClick={() => handleDeleteTrainee(t.id)}
                      className="text-red-500 hover:text-red-700 text-sm font-medium cursor-pointer"
                    >
                      Entfernen
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Reset Section */}
        <section className="bg-white rounded-xl shadow-sm border border-red-200 p-6">
          <h2 className="text-xl font-semibold text-red-700 mb-2">
            Gefahrenzone
          </h2>
          <p className="text-gray-600 text-sm mb-4">
            Alle Spielergebnisse unwiderruflich loeschen. Trainees und
            Einstellungen bleiben erhalten.
          </p>
          <button
            onClick={handleResetGames}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-500 font-medium cursor-pointer"
          >
            Alle Ergebnisse zuruecksetzen
          </button>
        </section>
      </div>
    </div>
  );
}
