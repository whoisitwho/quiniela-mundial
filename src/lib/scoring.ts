// ─────────────────────────────────────────────────────────────
//  Lógica de puntuación de la quiniela (fuente de verdad en TS)
//  3 pts → marcador exacto
//  1 pt  → acierta el resultado (gana local / gana visita / empate)
//  0 pts → cualquier otro caso
//  Existe una función gemela en SQL (match_points) para los cálculos
//  en la base de datos. Ambas deben mantenerse idénticas.
// ─────────────────────────────────────────────────────────────

export type Outcome = "HOME" | "AWAY" | "DRAW";

/** Convierte un marcador en su resultado (quién gana / empate). */
export function outcome(home: number, away: number): Outcome {
  if (home > away) return "HOME";
  if (home < away) return "AWAY";
  return "DRAW";
}

/**
 * Calcula los puntos de UNA predicción contra el marcador real.
 *
 * @returns 3 | 1 | 0  cuando el partido ya tiene marcador real.
 *          null       cuando el partido aún no se juega (no puntúa todavía).
 */
export function calcPoints(
  predHome: number | null | undefined,
  predAway: number | null | undefined,
  realHome: number | null | undefined,
  realAway: number | null | undefined
): number | null {
  // Partido sin marcador real → todavía no se reparten puntos.
  if (realHome == null || realAway == null) return null;

  // El jugador no registró predicción → 0.
  if (predHome == null || predAway == null) return 0;

  // Marcador exacto.
  if (predHome === realHome && predAway === realAway) return 3;

  // Mismo resultado (ganador o empate) pero distinto marcador.
  if (outcome(predHome, predAway) === outcome(realHome, realAway)) return 1;

  // Falló el resultado.
  return 0;
}
