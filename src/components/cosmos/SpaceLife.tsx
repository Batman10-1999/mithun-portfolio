import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { MARKERS, type SectionId } from "@/lib/portfolio-data";
import type { PlanetTheme } from "@/lib/planet-themes";

/**
 * Environmental details around the globe: one spacecraft, a travel trail,
 * distant satellites, an occasional shooting star and optional signals.
 * Everything runs inside the existing R3F render loop (useFrame).
 */

/** World-space point where each section's "planet" sits, derived from marker order. */
function destinationFor(id: SectionId | null) {
  if (!id || id === "about") return new THREE.Vector3(2.4, 1.2, 3.4);
  const index = Math.max(
    0,
    MARKERS.findIndex((m) => m.id === id),
  );
  const angle = (index / MARKERS.length) * Math.PI * 2 + 0.6;
  return new THREE.Vector3(
    Math.cos(angle) * 6.2,
    1.4 + Math.sin(index) * 1.1,
    Math.sin(angle) * 6.2,
  );
}

function travelCurve(to: THREE.Vector3) {
  const start = to.clone().normalize().multiplyScalar(3.3);
  const mid = start.clone().add(to).multiplyScalar(0.5);
  mid.y += 1.8;
  return new THREE.QuadraticBezierCurve3(start, mid, to);
}

/* ---------------- travel trail + spacecraft ---------------- */

export function TravelPath({
  selected,
  theme,
}: {
  selected: SectionId | null;
  theme: PlanetTheme;
}) {
  const curve = useMemo(() => travelCurve(destinationFor(selected)), [selected]);
  const line = useMemo(() => {
    const geo = new THREE.BufferGeometry().setFromPoints(curve.getPoints(48));
    const mat = new THREE.LineDashedMaterial({
      color: theme.accent,
      dashSize: 0.18,
      gapSize: 0.14,
      transparent: true,
      opacity: 0,
      depthWrite: false,
    });
    const l = new THREE.Line(geo, mat);
    l.computeLineDistances();
    return l;
  }, [curve, theme.accent]);
  const beacon = useRef<THREE.Mesh>(null);
  const showTrail = selected !== null && selected !== "about";

  useEffect(
    () => () => {
      line.geometry.dispose();
      (line.material as THREE.Material).dispose();
    },
    [line],
  );

  useFrame((s, d) => {
    const mat = line.material as THREE.LineDashedMaterial;
    const target = showTrail ? 0.45 : 0;
    mat.opacity += (target - mat.opacity) * (1 - Math.exp(-d * 2));
    line.visible = mat.opacity > 0.01;
    if (beacon.current) {
      beacon.current.visible = line.visible;
      beacon.current.scale.setScalar(1 + Math.sin(s.clock.elapsedTime * 1.5) * 0.15);
    }
  });

  return (
    <>
      <primitive object={line} />
      <mesh ref={beacon} position={curve.v2} visible={false}>
        <sphereGeometry args={[0.09, 12, 12]} />
        <meshBasicMaterial color={theme.accent} transparent opacity={0.8} />
      </mesh>
    </>
  );
}

const ORIENT = new THREE.Vector3();

export function Spacecraft({
  selected,
  theme,
}: {
  selected: SectionId | null;
  theme: PlanetTheme;
}) {
  const ship = useRef<THREE.Group>(null);
  const glow = useRef<THREE.MeshBasicMaterial>(null);
  const curve = useMemo(() => travelCurve(destinationFor(selected)), [selected]);
  const progress = useRef(0);

  useEffect(() => {
    progress.current = 0;
  }, [curve]);

  useFrame((s, d) => {
    const g = ship.current;
    if (!g) return;
    const dt = Math.min(d, 0.05);
    const t = s.clock.elapsedTime;
    if (progress.current < 1) {
      // travel along the navigation path (~4s, eased)
      progress.current = Math.min(1, progress.current + dt / 4);
      const e = 1 - Math.pow(1 - progress.current, 3);
      const p = curve.getPoint(e);
      g.position.copy(p);
      g.lookAt(ORIENT.copy(curve.getPoint(Math.min(1, e + 0.02))));
    } else {
      // slow idle drift around the destination
      const end = curve.v2;
      const a = t * 0.18;
      ORIENT.set(
        end.x + Math.cos(a) * 0.9,
        end.y + Math.sin(t * 0.4) * 0.15,
        end.z + Math.sin(a) * 0.9,
      );
      g.position.lerp(ORIENT, 1 - Math.exp(-dt * 1.5));
      g.lookAt(end.x + Math.cos(a + 0.4) * 0.9, end.y, end.z + Math.sin(a + 0.4) * 0.9);
    }
    if (glow.current) glow.current.color.lerp(TMP.set(theme.accent), 1 - Math.exp(-dt * 2));
  });

  return (
    <group ref={ship} scale={0.11}>
      {/* hull */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.35, 1.4, 8]} />
        <meshStandardMaterial color="#c9d2dc" metalness={0.6} roughness={0.35} />
      </mesh>
      {/* wings */}
      <mesh position={[0, 0, -0.35]}>
        <boxGeometry args={[1.5, 0.05, 0.4]} />
        <meshStandardMaterial color="#8a95a3" metalness={0.5} roughness={0.5} />
      </mesh>
      {/* engine glow */}
      <mesh position={[0, 0, -0.75]}>
        <sphereGeometry args={[0.16, 10, 10]} />
        <meshBasicMaterial ref={glow} color="#5ee7e0" />
      </mesh>
    </group>
  );
}
const TMP = new THREE.Color();

/* ---------------- distant satellites ---------------- */

export function Satellites() {
  const refs = useRef<(THREE.Mesh | null)[]>([]);
  const orbits = useMemo(
    () => [
      { r: 11, speed: 0.04, tilt: 0.5, phase: 0 },
      { r: 14, speed: -0.03, tilt: -0.3, phase: 2 },
      { r: 17, speed: 0.022, tilt: 0.9, phase: 4 },
    ],
    [],
  );
  useFrame((s) => {
    const t = s.clock.elapsedTime;
    orbits.forEach((o, i) => {
      const m = refs.current[i];
      if (!m) return;
      const a = o.phase + t * o.speed;
      m.position.set(
        Math.cos(a) * o.r,
        Math.sin(a) * o.r * Math.sin(o.tilt),
        Math.sin(a) * o.r * Math.cos(o.tilt),
      );
    });
  });
  return (
    <>
      {orbits.map((o, i) => (
        <mesh key={o.r} ref={(m) => (refs.current[i] = m)}>
          <boxGeometry args={[0.06, 0.03, 0.03]} />
          <meshBasicMaterial color="#dfe8f0" />
        </mesh>
      ))}
    </>
  );
}

/* ---------------- occasional shooting star ---------------- */

export function ShootingStar() {
  const line = useMemo(() => {
    const geo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(),
      new THREE.Vector3(-1.6, 0.5, 0),
    ]);
    const mat = new THREE.LineBasicMaterial({ color: "#ffffff", transparent: true, opacity: 0 });
    return new THREE.Line(geo, mat);
  }, []);
  const state = useRef({ next: 6, life: -1, dir: new THREE.Vector3() });

  useEffect(
    () => () => {
      line.geometry.dispose();
      (line.material as THREE.Material).dispose();
    },
    [line],
  );

  useFrame((s, d) => {
    const st = state.current;
    const mat = line.material as THREE.LineBasicMaterial;
    const t = s.clock.elapsedTime;
    if (st.life < 0 && t > st.next) {
      st.life = 0;
      line.position.set(10 + Math.random() * 10, 6 + Math.random() * 6, -18 - Math.random() * 10);
      st.dir.set(-1, -0.3, 0).normalize();
    }
    if (st.life >= 0) {
      st.life += Math.min(d, 0.05);
      line.position.addScaledVector(st.dir, Math.min(d, 0.05) * 16);
      mat.opacity = Math.sin(Math.min(st.life / 1.2, 1) * Math.PI) * 0.7;
      if (st.life > 1.2) {
        st.life = -1;
        mat.opacity = 0;
        st.next = t + 9 + Math.random() * 10;
      }
    }
    line.visible = mat.opacity > 0.01;
  });

  return <primitive object={line} />;
}

/* ---------------- discoverable signals ---------------- */

/** Add entries here to create new discoveries. Copy must stay factual. */
const SIGNALS: { id: string; position: [number, number, number]; title: string; text: string }[] = [
  {
    id: "origin",
    position: [-6.5, 2.6, -2],
    title: "Signal 01",
    text: "Every section here is a planet. Hover a marker on the globe to travel.",
  },
  {
    id: "navigation",
    position: [6.8, -2.2, -3],
    title: "Signal 02",
    text: "Arrow keys move between destinations. Escape returns to Earth.",
  },
  {
    id: "projects",
    position: [-4.5, -3, 4],
    title: "Signal 03",
    text: "Five project signals orbit Mars. Each one is a system built around a real problem.",
  },
  {
    id: "observatory",
    position: [3.5, 3.8, -5.5],
    title: "Signal 04",
    text: "The GitHub station on Uranus reads live public data.",
  },
];

function SignalBeacon({ signal }: { signal: (typeof SIGNALS)[number] }) {
  const [open, setOpen] = useState(false);
  const core = useRef<THREE.Mesh>(null);
  useFrame((s) => {
    if (core.current) {
      const m = core.current.material as THREE.MeshBasicMaterial;
      m.opacity = 0.35 + Math.sin(s.clock.elapsedTime * 1.2 + signal.position[0]) * 0.2;
    }
  });
  return (
    <group position={signal.position}>
      <mesh ref={core}>
        <octahedronGeometry args={[0.06, 0]} />
        <meshBasicMaterial color="#cfe8ff" transparent opacity={0.4} />
      </mesh>
      <Html center distanceFactor={10} zIndexRange={[6, 0]}>
        <div className="relative" onPointerLeave={() => setOpen(false)}>
          <button
            type="button"
            aria-label={`Discover ${signal.title}`}
            aria-expanded={open}
            onPointerEnter={() => setOpen(true)}
            onFocus={() => setOpen(true)}
            onBlur={() => setOpen(false)}
            onClick={() => setOpen((v) => !v)}
            className="block h-6 w-6 rounded-full border border-white/10 focus-visible:ring-1 focus-visible:ring-white focus-visible:outline-none"
          />
          {open && (
            <div className="pointer-events-none absolute top-7 left-1/2 w-48 -translate-x-1/2 rounded-lg border border-white/15 bg-black/60 p-2.5 text-left backdrop-blur-md">
              <p className="font-mono text-[9px] tracking-[0.2em] text-white/50 uppercase">
                {signal.title}
              </p>
              <p className="mt-1 text-[11px] leading-snug text-white/85">{signal.text}</p>
            </div>
          )}
        </div>
      </Html>
    </group>
  );
}

export function Signals() {
  return (
    <>
      {SIGNALS.map((s) => (
        <SignalBeacon key={s.id} signal={s} />
      ))}
    </>
  );
}
