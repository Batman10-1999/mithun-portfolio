import { useEffect, useState } from "react";
import { MARKERS, type SectionId } from "@/lib/portfolio-data";
import { themeFor } from "@/lib/planet-themes";

/** CURRENT LOCATION: EARTH → TRAVELING → MARS → MARS // PROJECTS */
export function LocationIndicator({ section }: { section: SectionId | null }) {
  const [traveling, setTraveling] = useState(false);

  useEffect(() => {
    if (!section) return;
    setTraveling(true);
    const timer = window.setTimeout(() => setTraveling(false), 1800);
    return () => window.clearTimeout(timer);
  }, [section]);

  const theme = themeFor(section);
  const planet = theme.planet.toUpperCase();
  const label = MARKERS.find((m) => m.id === section)?.label.toUpperCase();

  const text = !section
    ? "CURRENT LOCATION: EARTH"
    : traveling
      ? `TRAVELING → ${planet}`
      : `${planet} // ${label}`;

  return (
    <p
      role="status"
      aria-live="polite"
      className="font-mono text-[10px] tracking-[0.25em] text-white/55 uppercase"
    >
      <span
        aria-hidden
        className="mr-2 inline-block h-1.5 w-1.5 rounded-full align-middle transition-colors duration-[1600ms]"
        style={{ background: theme.accent }}
      />
      {text}
    </p>
  );
}
