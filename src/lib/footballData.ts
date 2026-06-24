// Integración con football-data.org para sincronizar marcadores del Mundial.
// Plan gratuito: requiere un token personal (FOOTBALL_DATA_TOKEN).
// Una sola llamada trae los 104 partidos (grupos + eliminatorias).

// Normaliza un nombre: minúsculas, sin acentos, sin signos.
function norm(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z ]/g, "")
    .trim();
}

// Código FIFA (tla) → nombre en español (tal como está en la BD).
const FIFA_TO_ES: Record<string, string> = {
  MEX: "México", RSA: "Sudáfrica", KOR: "Corea del Sur", CZE: "República Checa",
  CAN: "Canadá", BIH: "Bosnia y Herzegovina", USA: "Estados Unidos", PAR: "Paraguay",
  QAT: "Qatar", SUI: "Suiza", BRA: "Brasil", MAR: "Marruecos", HAI: "Haití",
  SCO: "Escocia", AUS: "Australia", TUR: "Turquía", GER: "Alemania", CUW: "Curazao",
  NED: "Países Bajos", JPN: "Japón", CIV: "Costa de Marfil", ECU: "Ecuador",
  SWE: "Suecia", TUN: "Túnez", ESP: "España", CPV: "Cabo Verde", BEL: "Bélgica",
  EGY: "Egipto", KSA: "Arabia Saudita", URU: "Uruguay", IRN: "Irán", NZL: "Nueva Zelanda",
  FRA: "Francia", SEN: "Senegal", IRQ: "Irak", NOR: "Noruega", ARG: "Argentina",
  ALG: "Argelia", AUT: "Austria", JOR: "Jordania", POR: "Portugal", COD: "RD Congo",
  ENG: "Inglaterra", CRO: "Croacia", GHA: "Ghana", PAN: "Panamá", UZB: "Uzbekistán",
  COL: "Colombia",
};

// Nombre en inglés (normalizado) → español. Respaldo si el código no llega.
const NAME_TO_ES: Record<string, string> = {
  mexico: "México", "south africa": "Sudáfrica", "south korea": "Corea del Sur",
  "korea republic": "Corea del Sur", "czech republic": "República Checa", czechia: "República Checa",
  canada: "Canadá", "bosnia and herzegovina": "Bosnia y Herzegovina", "bosniaherzegovina": "Bosnia y Herzegovina",
  "united states": "Estados Unidos", usa: "Estados Unidos", paraguay: "Paraguay", qatar: "Qatar",
  switzerland: "Suiza", brazil: "Brasil", morocco: "Marruecos", haiti: "Haití",
  scotland: "Escocia", australia: "Australia", turkey: "Turquía", turkiye: "Turquía",
  germany: "Alemania", curacao: "Curazao", netherlands: "Países Bajos", japan: "Japón",
  "ivory coast": "Costa de Marfil", "cote divoire": "Costa de Marfil", ecuador: "Ecuador",
  sweden: "Suecia", tunisia: "Túnez", spain: "España", "cape verde": "Cabo Verde",
  belgium: "Bélgica", egypt: "Egipto", "saudi arabia": "Arabia Saudita", uruguay: "Uruguay",
  iran: "Irán", "new zealand": "Nueva Zelanda", france: "Francia", senegal: "Senegal",
  iraq: "Irak", norway: "Noruega", argentina: "Argentina", algeria: "Argelia",
  austria: "Austria", jordan: "Jordania", portugal: "Portugal", "dr congo": "RD Congo",
  "congo dr": "RD Congo", "democratic republic of congo": "RD Congo", england: "Inglaterra",
  croatia: "Croacia", ghana: "Ghana", panama: "Panamá", uzbekistan: "Uzbekistán",
  colombia: "Colombia",
};

// Fase de football-data → texto en español para el campo stage.
const STAGE_TO_ES: Record<string, string> = {
  LAST_16: "Octavos de final",
  QUARTER_FINALS: "Cuartos de final",
  SEMI_FINALS: "Semifinal",
  THIRD_PLACE: "Tercer lugar",
  FINAL: "Final",
};

type ApiTeam = { name?: string | null; tla?: string | null } | null;

// Traduce un equipo de la API a su nombre en español, o null si no se reconoce.
export function teamToEs(team: ApiTeam): string | null {
  if (!team) return null;
  if (team.tla && FIFA_TO_ES[team.tla]) return FIFA_TO_ES[team.tla];
  if (team.name && NAME_TO_ES[norm(team.name)]) return NAME_TO_ES[norm(team.name)];
  return null;
}

export type SyncMatch = {
  homeEs: string | null;
  awayEs: string | null;
  homeScore: number | null;
  awayScore: number | null;
  finished: boolean;
  isKnockout: boolean;
  stageEs: string; // solo relevante para eliminatorias
  utcDate: string;
  rawHome: string;
  rawAway: string;
};

// Llama a football-data.org y devuelve los partidos normalizados.
export async function fetchWorldCupMatches(token: string): Promise<SyncMatch[]> {
  const res = await fetch(
    "https://api.football-data.org/v4/competitions/WC/matches",
    { headers: { "X-Auth-Token": token }, cache: "no-store" }
  );
  if (!res.ok) {
    throw new Error(`football-data.org respondió ${res.status}`);
  }
  const data = await res.json();
  const matches = Array.isArray(data?.matches) ? data.matches : [];

  return matches.map((m: any): SyncMatch => {
    const ft = m?.score?.fullTime ?? {};
    const stage = String(m?.stage ?? "");
    return {
      homeEs: teamToEs(m?.homeTeam),
      awayEs: teamToEs(m?.awayTeam),
      homeScore: typeof ft.home === "number" ? ft.home : null,
      awayScore: typeof ft.away === "number" ? ft.away : null,
      finished: m?.status === "FINISHED",
      isKnockout: stage in STAGE_TO_ES,
      stageEs: STAGE_TO_ES[stage] ?? "Fase de grupos",
      utcDate: String(m?.utcDate ?? ""),
      rawHome: String(m?.homeTeam?.name ?? "?"),
      rawAway: String(m?.awayTeam?.name ?? "?"),
    };
  });
}

// Clave única de un partido por su par de equipos (sin importar orden).
export function pairKey(a: string, b: string): string {
  return [a, b].sort().join(" | ");
}
