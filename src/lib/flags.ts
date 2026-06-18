// Mapeo de cada selección (nombre tal como está en la BD) a su código de
// bandera para flagcdn.com. Inglaterra/Escocia usan los códigos del Reino Unido.

const CODES: Record<string, string> = {
  "México": "mx",
  "Sudáfrica": "za",
  "Corea del Sur": "kr",
  "República Checa": "cz",
  "Canadá": "ca",
  "Bosnia y Herzegovina": "ba",
  "Estados Unidos": "us",
  "Paraguay": "py",
  "Qatar": "qa",
  "Suiza": "ch",
  "Brasil": "br",
  "Marruecos": "ma",
  "Haití": "ht",
  "Escocia": "gb-sct",
  "Australia": "au",
  "Turquía": "tr",
  "Alemania": "de",
  "Curazao": "cw",
  "Países Bajos": "nl",
  "Japón": "jp",
  "Costa de Marfil": "ci",
  "Ecuador": "ec",
  "Suecia": "se",
  "Túnez": "tn",
  "España": "es",
  "Cabo Verde": "cv",
  "Bélgica": "be",
  "Egipto": "eg",
  "Arabia Saudita": "sa",
  "Uruguay": "uy",
  "Irán": "ir",
  "Nueva Zelanda": "nz",
  "Francia": "fr",
  "Senegal": "sn",
  "Irak": "iq",
  "Noruega": "no",
  "Argentina": "ar",
  "Argelia": "dz",
  "Austria": "at",
  "Jordania": "jo",
  "Portugal": "pt",
  "RD Congo": "cd",
  "Inglaterra": "gb-eng",
  "Croacia": "hr",
  "Ghana": "gh",
  "Panamá": "pa",
  "Uzbekistán": "uz",
  "Colombia": "co",
};

// Devuelve la URL de la bandera (PNG nítido) o null si no hay mapeo.
export function flagUrl(team: string, width = 80): string | null {
  const code = CODES[team];
  return code ? `https://flagcdn.com/w${width}/${code}.png` : null;
}
