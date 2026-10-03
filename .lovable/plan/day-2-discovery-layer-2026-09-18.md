# Day 2 — Discovery Layer

## Goal
Extend the existing Earth experience into a restrained hover-first discovery interface while preserving the complete Day 1 intro, warp, scene, typography, and planetary theme transitions.

## What will change

### 1. Centralize the real Day 2 content
- Replace project placeholders with the five supplied projects and only their known category, overview, and technology area.
- Expand skills into the supplied categories without experience ratings.
- Add concise identity copy and a sparse journey foundation using only information already present.
- Add GitHub as a discoverable section using the verified `Mithun-hub15` profile.
- Keep education, experience, and certifications available without inventing missing details.

### 2. Extend the existing globe, not replace it
- Keep the current Three.js canvas, Earth mesh, controls, particles, lights, markers, and theme interpolation.
- Make markers react subtly on pointer approach and keyboard/touch selection.
- Add hover-preview callbacks so discovery begins on hover, while click/tap pins a section open.
- Add restrained orbital skill nodes around Mercury and five project signals around Mars only while those sections are active.
- Reuse the existing render loop and geometry patterns; no astronaut or Sun will be added.

### 3. Build the discovery information layer
- Replace the current generic side panel with focused, reusable section views.
- Identity: concise introduction.
- Skills: categorized interactive nodes with a small hovered-skill detail.
- Projects: five interactive project signals and compact project details with a non-navigating “Explore” placeholder.
- GitHub Observatory: a small live station using GitHub’s public API, with graceful loading and rate-limit/error states; no hardcoded live statistics.
- Journey: a minimal spatial progression based on existing education/work material, clearly marking unavailable detail rather than fabricating it.
- Contact: verified GitHub, LinkedIn, and email only; omit Resume because no link exists.

### 4. Preserve clean interaction across devices
- Desktop: hover previews, click to pin, Escape to close, arrow-key section navigation, visible focus states.
- Touch: tap markers and the compact bottom controls.
- Keep the planet visually dominant and panels bounded within mobile and desktop viewports.
- Respect reduced motion and avoid new continuous React state updates.

### 5. Verify the complete experience
- Check the newest build diagnostics, lint, and TypeScript validation available in the project.
- Run the full Day 1 journey in Chromium, then verify Identity, Skills, all five Projects, GitHub, Journey, and Contact.
- Test desktop, Android-sized mobile, keyboard use, touch emulation, reduced motion, console errors, failed requests, and key viewport zoom equivalents.
- Report only checks actually completed, including any GitHub API limitation encountered.

## Technical details
- Primary edits: `src/lib/portfolio-data.ts`, `src/lib/planet-themes.ts`, `src/components/cosmos/Scene.tsx`, and `src/routes/index.tsx`.
- New focused UI modules may be added under `src/components/discovery/` to keep the route and scene readable.
- No new dependency, backend, project detail page, database, CMS, or visual redesign.
