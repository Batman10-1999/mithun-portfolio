import type { SectionId } from "./portfolio-data";

export type PlanetTheme = {
  planet: string;
  /** sphere surface */
  surface: string;
  /** wireframe overlay */
  wire: string;
  /** atmosphere shell */
  atmo: string;
  /** key light */
  light: string;
  /** rim light */
  rim: string;
  /** UI accent (cards, buttons, hovers) */
  accent: string;
  /** background tint for stars / dust */
  dust: string;
  rings: boolean;
};

export const EARTH_THEME: PlanetTheme = {
  planet: "Earth",
  surface: "#0d2439",
  wire: "#5ee7e0",
  atmo: "#4fd8ff",
  light: "#9fe9ff",
  rim: "#9b7bff",
  accent: "#5ee7e0",
  dust: "#8fd8ff",
  rings: false,
};

export const PLANET_THEMES: Record<SectionId, PlanetTheme> = {
  about: EARTH_THEME,
  skills: {
    planet: "Mercury",
    surface: "#3a3d42",
    wire: "#c9ced6",
    atmo: "#9aa2ad",
    light: "#dfe4ea",
    rim: "#6c737d",
    accent: "#c9ced6",
    dust: "#b8bec7",
    rings: false,
  },
  education: {
    planet: "Venus",
    surface: "#6b5322",
    wire: "#ffd98a",
    atmo: "#ffb46b",
    light: "#ffe2a8",
    rim: "#ff9d55",
    accent: "#ffd27a",
    dust: "#ffcf94",
    rings: false,
  },
  projects: {
    planet: "Mars",
    surface: "#5a2317",
    wire: "#ff8a5c",
    atmo: "#ff6b3d",
    light: "#ffb08a",
    rim: "#c4442a",
    accent: "#ff7a4d",
    dust: "#ff9b74",
    rings: false,
  },
  experience: {
    planet: "Jupiter",
    surface: "#5b3f28",
    wire: "#e8cba0",
    atmo: "#d9a066",
    light: "#f2dcb8",
    rim: "#a2653a",
    accent: "#e0b184",
    dust: "#e6c79c",
    rings: false,
  },
  certifications: {
    planet: "Saturn",
    surface: "#6a5a33",
    wire: "#f0dfa8",
    atmo: "#e7cf8d",
    light: "#f7ecc6",
    rim: "#b99a54",
    accent: "#efd894",
    dust: "#f0e0ae",
    rings: true,
  },
  github: {
    planet: "Uranus",
    surface: "#173d46",
    wire: "#8debe2",
    atmo: "#63cfd0",
    light: "#cdfcf3",
    rim: "#4a91a0",
    accent: "#87f3d0",
    dust: "#9de9df",
    rings: true,
  },
  contact: {
    planet: "Neptune",
    surface: "#132a6b",
    wire: "#7fb6ff",
    atmo: "#4d7dff",
    light: "#cfe2ff",
    rim: "#3450c7",
    accent: "#7fa8ff",
    dust: "#9dbcff",
    rings: false,
  },
};

export function themeFor(id: SectionId | null): PlanetTheme {
  return id ? PLANET_THEMES[id] : EARTH_THEME;
}
