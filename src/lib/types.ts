export interface Config {
  id: number;
  algorithm_scale: number;
  trainee_distance: number;
  opponent_base_distance: number;
}

export interface Trainee {
  id: string;
  name: string;
  sort_order: number;
  created_at: string;
}

export interface Game {
  id: string;
  trainee_id: string;
  group_number: number;
  winner: "trainee" | "group";
  created_at: string;
}

export interface TraineeStats {
  trainee: Trainee;
  wins: number;
  losses: number;
  gamesPlayed: number;
  games: Game[];
}
