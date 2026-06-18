import { flagUrl } from "@/lib/flags";

// Bandera de un equipo. Si no hay mapeo, no rompe: simplemente no muestra nada.
export function Flag({
  team,
  className = "h-5 w-7",
}: {
  team: string;
  className?: string;
}) {
  const url = flagUrl(team);
  if (!url) return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt={team}
      loading="lazy"
      className={`shrink-0 rounded-sm object-cover ring-1 ring-black/30 ${className}`}
    />
  );
}
