import { supabase } from "./supabase";
import type {
  Match,
  Player,
  LeaderboardRow,
  PredictionWithPoints,
} from "./types";

// Todos los partidos, ordenados por hora de inicio.
export async function getMatches(): Promise<Match[]> {
  const { data, error } = await supabase
    .from("matches")
    .select("*")
    .order("kickoff_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

// Un partido por id.
export async function getMatch(id: string): Promise<Match | null> {
  const { data, error } = await supabase
    .from("matches")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

// Predicciones de un partido con puntos calculados y nombre del jugador.
export async function getMatchPredictions(
  matchId: string
): Promise<PredictionWithPoints[]> {
  const { data, error } = await supabase
    .from("prediction_points")
    .select("*, player:players(name)")
    .eq("match_id", matchId);
  if (error) throw error;
  // Ordena: primero los que más puntos sacaron, luego por nombre.
  return (data ?? []).sort(
    (a, b) =>
      (b.points ?? -1) - (a.points ?? -1) ||
      (a.player?.name ?? "").localeCompare(b.player?.name ?? "")
  );
}

// Tabla general (vista leaderboard, ya viene ordenada por la BD).
export async function getLeaderboard(): Promise<LeaderboardRow[]> {
  const { data, error } = await supabase.from("leaderboard").select("*");
  if (error) throw error;
  return data ?? [];
}

export async function getPlayers(): Promise<Player[]> {
  const { data, error } = await supabase
    .from("players")
    .select("*")
    .order("name");
  if (error) throw error;
  return data ?? [];
}
