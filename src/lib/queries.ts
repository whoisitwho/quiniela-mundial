import { supabase, supabaseAdmin } from "./supabase";
import type {
  Match,
  Player,
  Prediction,
  LeaderboardRow,
  PredictionWithPoints,
} from "./types";

// ── Lecturas públicas (anon): partidos, jugadores, tabla ──

export async function getMatches(): Promise<Match[]> {
  const { data, error } = await supabase
    .from("matches")
    .select("*")
    .order("kickoff_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function getMatch(id: string): Promise<Match | null> {
  const { data, error } = await supabase
    .from("matches")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function getPlayers(): Promise<Player[]> {
  const { data, error } = await supabase
    .from("players")
    .select("id, name, created_at")
    .order("name");
  if (error) throw error;
  return data ?? [];
}

export async function getLeaderboard(): Promise<LeaderboardRow[]> {
  const { data, error } = await supabase.from("leaderboard").select("*");
  if (error) throw error;
  return data ?? [];
}

// ── Lecturas de predicciones (solo servidor, con service role) ──
// Las predicciones NO son legibles con la llave pública: así nadie puede
// espiarlas antes de que el partido inicie.

export async function getMatchPredictions(
  matchId: string
): Promise<PredictionWithPoints[]> {
  const { data, error } = await supabaseAdmin()
    .from("prediction_points")
    .select("*, player:players(name)")
    .eq("match_id", matchId);
  if (error) throw error;
  return (data ?? []).sort(
    (a, b) =>
      (b.points ?? -1) - (a.points ?? -1) ||
      (a.player?.name ?? "").localeCompare(b.player?.name ?? "")
  );
}

export async function getPlayerById(id: string): Promise<Player | null> {
  const { data, error } = await supabaseAdmin()
    .from("players")
    .select("id, name, created_at")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function getPlayerPredictions(
  playerId: string
): Promise<Prediction[]> {
  const { data, error } = await supabaseAdmin()
    .from("predictions")
    .select("*")
    .eq("player_id", playerId);
  if (error) throw error;
  return data ?? [];
}
