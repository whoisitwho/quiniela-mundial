// Tipos que reflejan el esquema de la base de datos y las vistas.

export type Player = {
  id: string;
  name: string;
  created_at: string;
};

export type Match = {
  id: string;
  stage: string;
  home_team: string;
  away_team: string;
  kickoff_at: string;
  home_score: number | null;
  away_score: number | null;
  created_at: string;
};

export type Prediction = {
  id: string;
  match_id: string;
  player_id: string;
  pred_home: number;
  pred_away: number;
  created_at: string;
};

// Fila de la vista `prediction_points` enriquecida con el nombre del jugador.
export type PredictionWithPoints = Prediction & {
  points: number | null;
  player: { name: string } | null;
};

// Fila de la vista `leaderboard`.
export type LeaderboardRow = {
  player_id: string;
  name: string;
  total_points: number;
  exact_hits: number;
  outcome_hits: number;
  played: number;
};

export const isFinished = (m: Match) =>
  m.home_score !== null && m.away_score !== null;
