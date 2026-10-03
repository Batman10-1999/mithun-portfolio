import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DiscoveryPanel, type DiscoveryDetail } from "@/components/discovery/DiscoveryPanel";
import { LocationIndicator } from "@/components/discovery/LocationIndicator";
import { MARKERS, type SectionId } from "@/lib/portfolio-data";
import { themeFor } from "@/lib/planet-themes";

const Scene = lazy(() => import("@/components/cosmos/Scene"));
const Intro = lazy(() => import("@/components/cosmos/Intro"));
const Warp = lazy(() => import("@/components/cosmos/Warp"));

type Phase = "intro" | "landing" | "warp" | "earth";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Mithun S — Interactive 3D Portfolio" },
      {
        name: "description",
        content:
          "Explore the portfolio of Mithun S through an interactive 3D Earth: about, skills, projects, education, experience and contact.",
      },
      { property: "og:title", content: "Mithun S — Interactive 3D Portfolio" },
      {
        property: "og:description",
        content:
          "An interactive globe navigating the work of Mithun S — software, web development and data.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Portfolio,
});

function Portfolio() {
  const [mounted, setMounted] = useState(false);
  const [phase, setPhase] = useState<Phase>("intro");
  const [section, setSection] = useState<SectionId | null>(null);
  const [preview, setPreview] = useState<SectionId | null>(null);
  const [detail, setDetail] = useState<DiscoveryDetail>(null);
  const [warpFading, setWarpFading] = useState(false);
  const closeTimer = useRef<number | null>(null);
  const activeSection = section ?? preview;
  const theme = themeFor(activeSection);
  const showScene = mounted && (phase === "warp" || phase === "earth");

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSection(null);
        setPreview(null);
        setDetail(null);
      }
      if (phase === "earth" && (e.key === "ArrowRight" || e.key === "ArrowLeft")) {
        const current = activeSection
          ? MARKERS.findIndex((marker) => marker.id === activeSection)
          : -1;
        const step = e.key === "ArrowRight" ? 1 : -1;
        const next = (current + step + MARKERS.length) % MARKERS.length;
        const marker = MARKERS[next];
        if (marker) {
          setSection(marker.id);
          setPreview(null);
          setDetail(null);
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeSection, phase]);

  useEffect(
    () => () => {
      if (closeTimer.current !== null) window.clearTimeout(closeTimer.current);
    },
    [],
  );

  const previewSection = (id: SectionId) => {
    if (closeTimer.current !== null) window.clearTimeout(closeTimer.current);
    if (!section) setPreview(id);
    if (id !== activeSection) setDetail(null);
  };

  const leavePreview = () => {
    if (section) return;
    closeTimer.current = window.setTimeout(() => setPreview(null), 260);
  };

  const selectSection = (id: SectionId) => {
    setSection((current) => (current === id ? null : id));
    setPreview(null);
    setDetail(null);
  };

  const enter = () => {
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setPhase("earth");
      return;
    }
    setWarpFading(true);
    setPhase("warp");
  };

  return (
    <MotionConfig reducedMotion="user">
      <main
        className="relative h-[100dvh] w-full overflow-hidden bg-[#080a14] text-foreground"
        style={{ transition: "background-color 2s ease" }}
      >
        {showScene && (
          <div className="absolute inset-0">
            <Suspense fallback={null}>
              <Scene
                selected={activeSection}
                onSelect={selectSection}
                onPreview={previewSection}
                detail={detail}
                onDetail={(kind, id) => setDetail({ kind, id })}
              />
            </Suspense>
          </div>
        )}

        {mounted && phase === "intro" && (
          <Suspense fallback={null}>
            <Intro onDone={() => setPhase("landing")} />
          </Suspense>
        )}

        {mounted && (phase === "warp" || warpFading) && (
          <div
            className={`pointer-events-none absolute inset-0 z-40 transition-opacity duration-500 ${
              phase === "warp" ? "opacity-100" : "opacity-0"
            }`}
          >
            <Suspense fallback={null}>
              <Warp
                onDone={() => {
                  setPhase("earth");
                  window.setTimeout(() => setWarpFading(false), 600);
                }}
              />
            </Suspense>
          </div>
        )}

        <AnimatePresence mode="wait">
          {phase === "landing" ? (
            <motion.section
              key="landing"
              className="absolute inset-0 z-20 flex flex-col items-center justify-center px-6 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.7 }}
            >
              <motion.h1
                className="text-[clamp(2.75rem,11vw,7rem)] leading-[0.95] font-semibold tracking-[-0.03em] text-white"
                style={{ textRendering: "geometricPrecision" }}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              >
                Mithun S
              </motion.h1>
              <motion.p
                className="mt-5 max-w-md text-sm tracking-[0.22em] text-white/60 uppercase sm:text-base"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.25 }}
              >
                Software · Web · Data
              </motion.p>
              <motion.button
                type="button"
                onClick={enter}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="group relative mt-12 min-h-12 overflow-hidden rounded-full border border-white/25 px-10 py-4 font-mono text-xs tracking-[0.35em] text-white uppercase transition-colors duration-300 hover:border-white focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#080a14] focus-visible:outline-none active:scale-[0.98]"
              >
                <span className="relative z-10 transition-colors duration-300 group-hover:text-[#080a14]">
                  Welcome
                </span>
                <span className="absolute inset-0 translate-y-full bg-white transition-transform duration-400 group-hover:translate-y-0" />
              </motion.button>
            </motion.section>
          ) : phase === "earth" ? (
            <motion.div
              key="earth"
              className="pointer-events-none absolute inset-0 z-20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <header className="flex items-start justify-between p-5 md:p-8">
                <button
                  type="button"
                  onClick={() => {
                    setSection(null);
                    setPreview(null);
                    setDetail(null);
                    setPhase("landing");
                  }}
                  className="pointer-events-auto font-mono text-[11px] tracking-[0.3em] text-white/70 uppercase transition-colors hover:text-white"
                >
                  Mithun S
                </button>
                <div className="flex flex-col items-end gap-1">
                  <LocationIndicator section={section} />
                  <span className="hidden font-mono text-[10px] tracking-[0.25em] text-white/40 uppercase sm:block">
                    Hover to discover · drag to rotate
                  </span>
                </div>
              </header>

              <div className="pointer-events-auto absolute top-1/2 left-3 hidden -translate-y-1/2 flex-col gap-2 sm:flex">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Previous destination"
                  onClick={() => {
                    const current = activeSection
                      ? MARKERS.findIndex((marker) => marker.id === activeSection)
                      : 0;
                    const marker = MARKERS[(current - 1 + MARKERS.length) % MARKERS.length];
                    if (marker) selectSection(marker.id);
                  }}
                  className="rounded-full border border-white/15 bg-background/35 text-white/60 backdrop-blur-md hover:text-white"
                >
                  <ChevronLeft />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Next destination"
                  onClick={() => {
                    const current = activeSection
                      ? MARKERS.findIndex((marker) => marker.id === activeSection)
                      : -1;
                    const marker = MARKERS[(current + 1) % MARKERS.length];
                    if (marker) selectSection(marker.id);
                  }}
                  className="rounded-full border border-white/15 bg-background/35 text-white/60 backdrop-blur-md hover:text-white"
                >
                  <ChevronRight />
                </Button>
              </div>

              <div className="pointer-events-auto absolute inset-x-0 bottom-0 overflow-x-auto px-4 pb-4">
                <div className="flex gap-1.5">
                  {MARKERS.map((m) => {
                    const active = section === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        aria-pressed={active}
                        onPointerEnter={() => previewSection(m.id)}
                        onPointerLeave={leavePreview}
                        onFocus={() => previewSection(m.id)}
                        onClick={() => selectSection(m.id)}
                        className="shrink-0 rounded-full border px-3.5 py-2 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#080a14] focus-visible:outline-none motion-reduce:transition-none font-mono text-[10px] tracking-[0.18em] uppercase transition-all duration-[1600ms] hover:border-white/50 hover:text-white"
                        style={
                          active
                            ? {
                                borderColor: theme.accent,
                                background: theme.accent,
                                color: "#080a14",
                              }
                            : {
                                borderColor: "rgba(255,255,255,0.2)",
                                color: "rgba(255,255,255,0.7)",
                              }
                        }
                      >
                        {m.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <AnimatePresence>
          {phase === "earth" && activeSection && (
            <div
              onPointerEnter={() => {
                if (closeTimer.current !== null) window.clearTimeout(closeTimer.current);
              }}
              onPointerLeave={leavePreview}
            >
              <DiscoveryPanel
                section={activeSection}
                detail={detail}
                onClose={() => {
                  setSection(null);
                  setPreview(null);
                  setDetail(null);
                }}
              />
            </div>
          )}
        </AnimatePresence>
      </main>
    </MotionConfig>
  );
}
