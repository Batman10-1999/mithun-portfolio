import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ExternalLink, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ABOUT,
  CERTIFICATIONS,
  CONTACT_EMAIL,
  EDUCATION,
  EXPERIENCE,
  GITHUB_URL,
  JOURNEY_STAGES,
  LINKEDIN_URL,
  MARKERS,
  PROJECTS,
  SKILL_GROUPS,
  type Project,
  type SectionId,
  type Skill,
} from "@/lib/portfolio-data";
import { themeFor } from "@/lib/planet-themes";

export type DiscoveryDetail =
  { kind: "skill"; id: string } | { kind: "project"; id: string } | null;

type GithubProfile = {
  public_repos: number;
  followers: number;
  html_url: string;
};

type GithubRepo = {
  name: string;
  language: string | null;
  pushed_at: string;
};

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-mono text-[10px] tracking-[0.24em] text-foreground/45 uppercase">
      {children}
    </p>
  );
}

function IdentityView() {
  return (
    <div>
      <Eyebrow>{ABOUT.eyebrow}</Eyebrow>
      <h3 className="mt-3 text-3xl font-semibold text-foreground">Mithun S</h3>
      <p className="mt-2 text-sm font-medium text-foreground/80">{ABOUT.focus}</p>
      <p className="mt-6 text-base leading-relaxed text-foreground/90">{ABOUT.lead}</p>
      <div className="mt-3 space-y-2">
        {ABOUT.body.map((line) => (
          <p key={line} className="text-sm leading-relaxed text-foreground/60">
            {line}
          </p>
        ))}
      </div>
    </div>
  );
}

function SkillsView({ detail }: { detail: DiscoveryDetail }) {
  const [focused, setFocused] = useState<Skill | null>(null);
  const selected = useMemo(() => {
    if (detail?.kind !== "skill") return focused;
    return (
      SKILL_GROUPS.flatMap((group) => group.items).find((skill) => skill.name === detail.id) ??
      focused
    );
  }, [detail, focused]);

  return (
    <div>
      <p className="text-sm text-foreground/65">Tools I use to make ideas work.</p>
      <AnimatePresence mode="wait">
        {selected && (
          <motion.div
            key={selected.name}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-4 border-l border-current pl-3"
          >
            <h3 className="text-sm font-semibold text-foreground">{selected.name}</h3>
            <p className="mt-1 text-xs leading-relaxed text-foreground/60">{selected.usedFor}</p>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="mt-5 space-y-4">
        {SKILL_GROUPS.map((group) => (
          <div key={group.id}>
            <Eyebrow>{group.group}</Eyebrow>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {group.items.map((skill) => (
                <button
                  key={skill.name}
                  type="button"
                  onPointerEnter={() => setFocused(skill)}
                  onFocus={() => setFocused(skill)}
                  onClick={() => setFocused(skill)}
                  className="rounded-full border border-foreground/15 px-2.5 py-1 text-xs text-foreground/75 transition-colors hover:border-foreground/45 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                >
                  {skill.name}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProjectsView({ detail }: { detail: DiscoveryDetail }) {
  const [focused, setFocused] = useState<Project>(() => PROJECTS[0]!);
  const selected = useMemo(() => {
    if (detail?.kind !== "project") return focused;
    return PROJECTS.find((project) => project.id === detail.id) ?? focused;
  }, [detail, focused]);

  return (
    <div>
      <p className="text-sm text-foreground/65">Systems built around real problems.</p>
      <AnimatePresence mode="wait">
        <motion.div
          key={selected.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          className="mt-5 border-l border-current pl-4"
        >
          <Eyebrow>{selected.category}</Eyebrow>
          <h3 className="mt-2 text-lg font-semibold text-foreground">{selected.name}</h3>
          <p className="mt-2 text-sm leading-relaxed text-foreground/65">{selected.overview}</p>
          <p className="mt-3 font-mono text-[10px] tracking-[0.12em] text-foreground/45 uppercase">
            {selected.technologyArea}
          </p>
          <span className="mt-4 inline-flex items-center gap-1.5 font-mono text-[10px] tracking-[0.24em] text-foreground/75 uppercase">
            Explore <span aria-hidden="true">→</span>
          </span>
        </motion.div>
      </AnimatePresence>
      <div className="mt-5 grid grid-cols-5 gap-1.5" aria-label="Project signals">
        {PROJECTS.map((project, index) => (
          <button
            key={project.id}
            type="button"
            aria-label={`View ${project.name}`}
            aria-pressed={selected.id === project.id}
            onPointerEnter={() => setFocused(project)}
            onFocus={() => setFocused(project)}
            onClick={() => setFocused(project)}
            className="aspect-square rounded-full border border-foreground/20 font-mono text-[10px] text-foreground/60 transition-colors hover:border-foreground/60 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none aria-pressed:border-foreground/70 aria-pressed:text-foreground"
          >
            {String(index + 1).padStart(2, "0")}
          </button>
        ))}
      </div>
    </div>
  );
}

function TimelineView({ id }: { id: "education" | "experience" | "certifications" }) {
  const items = id === "education" ? EDUCATION : id === "experience" ? EXPERIENCE : CERTIFICATIONS;
  return (
    <div>
      <p className="mb-5 text-sm text-foreground/65">
        {id === "education"
          ? "A path still taking shape."
          : id === "experience"
            ? "Verified work details will be added here."
            : "Verified achievements will be added here."}
      </p>
      <ol className="space-y-4 border-l border-foreground/15 pl-4">
        {items.map((item) => (
          <li key={`${item.title}-${item.org}`} className="relative">
            <span className="absolute top-2 -left-[19px] h-1.5 w-1.5 rounded-full bg-foreground/55" />
            <Eyebrow>{item.period}</Eyebrow>
            <h3 className="mt-1 text-sm font-medium text-foreground">{item.title}</h3>
            <p className="text-sm text-foreground/55">{item.org}</p>
            {item.note && (
              <p className="mt-1 text-xs leading-relaxed text-foreground/45">{item.note}</p>
            )}
          </li>
        ))}
      </ol>
      {id === "education" && (
        <div className="mt-7">
          <Eyebrow>Journey</Eyebrow>
          <ol className="mt-3 flex items-start justify-between gap-1" aria-label="Journey stages">
            {JOURNEY_STAGES.map((stage, index) => (
              <li key={stage.name} className="min-w-0 flex-1 text-center">
                <span className="mx-auto block h-1.5 w-1.5 rounded-full bg-foreground/60" />
                <span className="mt-2 block truncate font-mono text-[8px] text-foreground/50 uppercase">
                  {index + 1}
                </span>
                <span className="mt-1 block text-[9px] leading-tight text-foreground/70 uppercase">
                  {stage.name}
                </span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}

function GithubView() {
  const [profile, setProfile] = useState<GithubProfile | null>(null);
  const [repos, setRepos] = useState<GithubRepo[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      try {
        const [profileResponse, reposResponse] = await Promise.all([
          fetch("https://api.github.com/users/Mithun-hub15", { signal: controller.signal }),
          fetch("https://api.github.com/users/Mithun-hub15/repos?sort=pushed&per_page=8", {
            signal: controller.signal,
          }),
        ]);
        if (!profileResponse.ok || !reposResponse.ok) throw new Error("GitHub unavailable");
        setProfile((await profileResponse.json()) as GithubProfile);
        setRepos((await reposResponse.json()) as GithubRepo[]);
        setStatus("ready");
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setStatus("error");
      }
    };
    void load();
    return () => controller.abort();
  }, []);

  const languages = [
    ...new Set(
      repos.map((repo) => repo.language).filter((value): value is string => Boolean(value)),
    ),
  ].slice(0, 4);
  const latest = repos[0];

  return (
    <div>
      <p className="text-sm text-foreground/65">Live signals from Mithun-hub15.</p>
      {status === "loading" && (
        <p className="mt-6 font-mono text-xs text-foreground/50">Receiving public activity…</p>
      )}
      {status === "error" && (
        <p className="mt-6 text-sm text-foreground/55">
          Live data is temporarily unavailable. The profile remains accessible.
        </p>
      )}
      {status === "ready" && profile && (
        <div className="mt-5">
          <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-md border border-foreground/10 bg-foreground/10">
            <div className="bg-background/80 p-3">
              <dt className="font-mono text-[9px] text-foreground/45 uppercase">Repositories</dt>
              <dd className="mt-1 text-xl text-foreground">{profile.public_repos}</dd>
            </div>
            <div className="bg-background/80 p-3">
              <dt className="font-mono text-[9px] text-foreground/45 uppercase">Followers</dt>
              <dd className="mt-1 text-xl text-foreground">{profile.followers}</dd>
            </div>
          </dl>
          {languages.length > 0 && (
            <p className="mt-4 text-xs text-foreground/60">
              <span className="font-mono text-[9px] tracking-[0.18em] text-foreground/40 uppercase">
                Languages
              </span>
              <br />
              {languages.join(" · ")}
            </p>
          )}
          {latest && (
            <p className="mt-4 text-xs leading-relaxed text-foreground/60">
              <span className="font-mono text-[9px] tracking-[0.18em] text-foreground/40 uppercase">
                Recent activity
              </span>
              <br />
              {latest.name} · {new Date(latest.pushed_at).toLocaleDateString()}
            </p>
          )}
        </div>
      )}
      <a
        href={GITHUB_URL}
        target="_blank"
        rel="noreferrer noopener"
        className="mt-5 inline-flex items-center gap-2 font-mono text-[10px] tracking-[0.2em] text-foreground/75 uppercase hover:text-foreground"
      >
        Open GitHub <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
      </a>
    </div>
  );
}

function ContactView() {
  const links = [
    { label: "LinkedIn", value: "mithun-s07", href: LINKEDIN_URL },
    { label: "GitHub", value: "Mithun-hub15", href: GITHUB_URL },
    { label: "Email", value: CONTACT_EMAIL, href: `mailto:${CONTACT_EMAIL}` },
  ];
  return (
    <div>
      <p className="text-base text-foreground/85">Let's connect.</p>
      <div className="mt-5 divide-y divide-foreground/10 border-y border-foreground/10">
        {links.map((link) => (
          <a
            key={link.label}
            href={link.href}
            target={link.href.startsWith("mailto:") ? undefined : "_blank"}
            rel="noreferrer noopener"
            className="flex items-center justify-between gap-4 py-3 text-sm text-foreground/70 transition-colors hover:text-foreground"
          >
            <span>{link.label}</span>
            <ExternalLink className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          </a>
        ))}
      </div>
    </div>
  );
}

export function DiscoveryPanel({
  section,
  detail,
  onClose,
}: {
  section: SectionId;
  detail: DiscoveryDetail;
  onClose: () => void;
}) {
  const theme = themeFor(section);
  const marker = MARKERS.find((item) => item.id === section);
  return (
    <motion.aside
      key={section}
      initial={{ opacity: 0, x: 18 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 18 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      style={{ borderColor: `${theme.accent}55`, boxShadow: `0 0 56px -34px ${theme.accent}` }}
      className="pointer-events-auto absolute inset-x-3 bottom-20 z-30 max-h-[62dvh] overflow-y-auto rounded-md border bg-background/80 p-5 backdrop-blur-xl sm:inset-x-auto sm:top-1/2 sm:right-6 sm:bottom-auto sm:w-[23rem] sm:-translate-y-1/2 md:w-[26rem] md:p-6"
      aria-label={`${marker?.label ?? section} discovery panel`}
    >
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p
            className="font-mono text-[10px] tracking-[0.3em] uppercase"
            style={{ color: theme.accent }}
          >
            {theme.planet}
          </p>
          <h2 className="mt-1 text-xl font-semibold text-foreground">{marker?.label}</h2>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onClose}
          aria-label="Close discovery panel"
          className="h-8 w-8 rounded-full border border-foreground/15 text-foreground/65 hover:text-foreground"
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>
      {section === "about" && <IdentityView />}
      {section === "skills" && <SkillsView detail={detail} />}
      {section === "projects" && <ProjectsView detail={detail} />}
      {(section === "education" || section === "experience" || section === "certifications") && (
        <TimelineView id={section} />
      )}
      {section === "github" && <GithubView />}
      {section === "contact" && <ContactView />}
    </motion.aside>
  );
}
