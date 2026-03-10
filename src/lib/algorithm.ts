import { Config } from "./types";

const MIN_DISTANCE = 2.0;

export function calculateOpponentDistance(
  config: Config,
  totalTrainees: number,
  groupWins: number
): number {
  // Each trainee plays against every group once -> N*N total games
  const totalGames = totalTrainees * totalTrainees;
  if (totalGames === 0) return config.opponent_base_distance;

  const winRatio = groupWins / totalGames;
  const maxReduction =
    config.opponent_base_distance - config.trainee_distance;
  const distance =
    config.opponent_base_distance -
    winRatio * maxReduction * config.algorithm_scale;

  return Math.max(distance, MIN_DISTANCE);
}
