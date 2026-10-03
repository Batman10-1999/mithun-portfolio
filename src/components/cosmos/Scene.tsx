import { Canvas, useFrame } from "@react-three/fiber";
import { Html, OrbitControls } from "@react-three/drei";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { MARKERS, PROJECTS, SKILL_GROUPS, type SectionId } from "@/lib/portfolio-data";
import { themeFor, type PlanetTheme } from "@/lib/planet-themes";
import { Satellites, ShootingStar, Signals, Spacecraft, TravelPath } from "./SpaceLife";

/** 0 when the visitor prefers reduced motion: stops idle spins and pulses, keeps theme fades. */
const MOTION =
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ? 0
    : 1;

/** ~2s eased colour transition */
function lerpColor(target: THREE.Color | undefined, hex: string, d: number) {
  if (!target) return;
  target.lerp(TMP.set(hex), 1 - Math.exp(-d * 2.2));
}
const TMP = new THREE.Color();

/* ---------------- starfield ---------------- */

function Starfield({ theme }: { theme: PlanetTheme }) {
  const ref = useRef<THREE.Points>(null);
  const mat = useRef<THREE.PointsMaterial>(null);
  const geo = useMemo(() => {
    const n = 2200;
    const pos = new Float32Array(n * 3);
    const col = new Float32Array(n * 3);
    const c = new THREE.Color();
    for (let i = 0; i < n; i++) {
      const r = 26 + Math.random() * 60;
      const t = Math.random() * Math.PI * 2;
      const p = Math.acos(2 * Math.random() - 1);
      pos[i * 3] = r * Math.sin(p) * Math.cos(t);
      pos[i * 3 + 1] = r * Math.sin(p) * Math.sin(t) * 0.8;
      pos[i * 3 + 2] = r * Math.cos(p);
      c.setHSL(0.5 + Math.random() * 0.22, 0.6, 0.6 + Math.random() * 0.3);
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("color", new THREE.BufferAttribute(col, 3));
    return g;
  }, []);

  useFrame((_, d) => {
    if (ref.current) ref.current.rotation.y += d * 0.006 * MOTION;
    lerpColor(mat.current?.color, theme.dust, d);
  });

  return (
    <points ref={ref} geometry={geo} frustumCulled={false}>
      <pointsMaterial
        ref={mat}
        size={0.16}
        sizeAttenuation
        vertexColors
        transparent
        opacity={0.9}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

/* ---------------- space dust ---------------- */

function Dust({ theme }: { theme: PlanetTheme }) {
  const ref = useRef<THREE.Points>(null);
  const mat = useRef<THREE.PointsMaterial>(null);
  const geo = useMemo(() => {
    const n = 700;
    const pos = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const r = 6 + Math.random() * 14;
      const t = Math.random() * Math.PI * 2;
      const p = Math.acos(2 * Math.random() - 1);
      pos[i * 3] = r * Math.sin(p) * Math.cos(t);
      pos[i * 3 + 1] = r * Math.cos(p) * 0.55;
      pos[i * 3 + 2] = r * Math.sin(p) * Math.sin(t);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return g;
  }, []);

  useFrame((s, d) => {
    if (ref.current) {
      ref.current.rotation.y -= d * 0.02 * MOTION;
      ref.current.rotation.x = Math.sin(s.clock.elapsedTime * 0.05) * 0.08 * MOTION;
    }
    lerpColor(mat.current?.color, theme.atmo, d);
  });

  return (
    <points ref={ref} geometry={geo} frustumCulled={false}>
      <pointsMaterial
        ref={mat}
        size={0.05}
        sizeAttenuation
        transparent
        opacity={0.45}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

/* ---------------- nebula ---------------- */

function Nebula({ theme }: { theme: PlanetTheme }) {
  const mat = useRef<THREE.MeshBasicMaterial>(null);
  useFrame((_, d) => lerpColor(mat.current?.color, theme.rim, d));
  return (
    <mesh scale={40} renderOrder={-1}>
      <sphereGeometry args={[1, 24, 24]} />
      <meshBasicMaterial
        ref={mat}
        transparent
        opacity={0.06}
        side={THREE.BackSide}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

/* ---------------- geo helpers ---------------- */

const R = 3;

function toVec(lat: number, lon: number, radius = R) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  );
}

/* ---------------- marker ---------------- */

function MarkerPin({
  lat,
  lon,
  label,
  color,
  active,
  onSelect,
  onPreview,
}: {
  lat: number;
  lon: number;
  label: string;
  color: string;
  active: boolean;
  onSelect: () => void;
  onPreview: () => void;
}) {
  const pos = useMemo(() => toVec(lat, lon, R + 0.06), [lat, lon]);
  const ring = useRef<THREE.Mesh>(null);
  const core = useRef<THREE.Mesh>(null);
  const hovered = useRef(false);

  useFrame((s) => {
    if (!ring.current) return;
    const k = 1 + Math.sin(s.clock.elapsedTime * 2 + lat) * 0.12 * MOTION;
    ring.current.scale.setScalar(active ? k * 1.5 : hovered.current ? k * 1.3 : k);
    if (core.current) {
      const target = active ? 1.4 : hovered.current ? 1.25 : 1;
      core.current.scale.lerp(TMP_SCALE.setScalar(target), 0.12);
    }
  });

  return (
    <group position={pos}>
      <mesh
        ref={core}
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          hovered.current = true;
          onPreview();
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          hovered.current = false;
          document.body.style.cursor = "";
        }}
      >
        <sphereGeometry args={[0.075, 16, 16]} />
        <meshBasicMaterial color={color} />
      </mesh>
      <mesh ref={ring}>
        <sphereGeometry args={[0.16, 12, 12]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.28}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      <Html center distanceFactor={9} zIndexRange={[10, 0]}>
        <button
          onClick={onSelect}
          onPointerEnter={onPreview}
          onFocus={onPreview}
          aria-label={`Discover ${label}`}
          className="translate-y-6 rounded-full border border-white/15 bg-black/50 px-2.5 py-1 font-mono text-[10px] tracking-[0.18em] whitespace-nowrap text-white/85 uppercase backdrop-blur-sm transition-colors hover:border-white/40 hover:text-white"
          style={active ? { borderColor: color, color } : undefined}
        >
          {label}
        </button>
      </Html>
    </group>
  );
}

const TMP_SCALE = new THREE.Vector3(1, 1, 1);

function OrbitNode({
  position,
  color,
  active,
  onPreview,
  onSelect,
  label,
}: {
  position: [number, number, number];
  color: string;
  active: boolean;
  onPreview: () => void;
  onSelect: () => void;
  label?: string;
}) {
  const ref = useRef<THREE.Mesh>(null);
  const hovered = useRef(false);
  useFrame((state) => {
    if (!ref.current) return;
    const pulse = 1 + Math.sin(state.clock.elapsedTime * 1.7 + position[0]) * 0.08 * MOTION;
    ref.current.scale.lerp(
      TMP_SCALE.setScalar((active || hovered.current ? 1.45 : 1) * pulse),
      0.1,
    );
  });
  return (
    <group position={position}>
      <mesh
        ref={ref}
        onPointerEnter={(event) => {
          event.stopPropagation();
          hovered.current = true;
          onPreview();
          document.body.style.cursor = "pointer";
        }}
        onPointerLeave={() => {
          hovered.current = false;
          document.body.style.cursor = "";
        }}
        onClick={(event) => {
          event.stopPropagation();
          onSelect();
        }}
      >
        <icosahedronGeometry args={[0.07, 1]} />
        <meshBasicMaterial color={color} transparent opacity={0.9} />
      </mesh>
      {label && (
        <Html center distanceFactor={10} zIndexRange={[8, 0]}>
          <button
            type="button"
            onPointerEnter={onPreview}
            onFocus={onPreview}
            onClick={onSelect}
            className="translate-y-5 rounded-full border border-white/15 bg-black/60 px-2 py-1 font-mono text-[9px] tracking-[0.12em] whitespace-nowrap text-white/75 uppercase backdrop-blur-sm focus-visible:ring-1 focus-visible:ring-white focus-visible:outline-none"
          >
            {label}
          </button>
        </Html>
      )}
    </group>
  );
}

function SkillGalaxy({ onDetail }: { onDetail: (id: string) => void }) {
  const group = useRef<THREE.Group>(null);
  const skills = SKILL_GROUPS.flatMap((category) => category.items);
  useFrame((_, delta) => {
    if (group.current) group.current.rotation.y += delta * 0.045 * MOTION;
  });
  return (
    <group ref={group}>
      {skills.map((skill, index) => {
        const angle = (index / skills.length) * Math.PI * 2;
        const radius = 3.75 + (index % 3) * 0.38;
        return (
          <OrbitNode
            key={skill.name}
            position={[
              Math.cos(angle) * radius,
              Math.sin(angle * 2.1) * 1.15,
              Math.sin(angle) * radius,
            ]}
            color={index % 2 ? "#dfe4ea" : "#9aa2ad"}
            active={false}
            onPreview={() => onDetail(skill.name)}
            onSelect={() => onDetail(skill.name)}
          />
        );
      })}
    </group>
  );
}

function ProjectSignals({
  activeProject,
  onDetail,
}: {
  activeProject: string | null;
  onDetail: (id: string) => void;
}) {
  const group = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (group.current) group.current.rotation.y -= delta * 0.025 * MOTION;
  });
  return (
    <group ref={group}>
      {PROJECTS.map((project, index) => {
        const angle = (index / PROJECTS.length) * Math.PI * 2 - 0.5;
        const radius = 4.1;
        return (
          <OrbitNode
            key={project.id}
            position={[
              Math.cos(angle) * radius,
              Math.sin(angle * 1.5) * 0.85,
              Math.sin(angle) * radius,
            ]}
            color={index % 2 ? "#ffb08a" : "#ff6b3d"}
            active={activeProject === project.id}
            onPreview={() => onDetail(project.id)}
            onSelect={() => onDetail(project.id)}
            label={project.signal}
          />
        );
      })}
    </group>
  );
}

/* ---------------- earth ---------------- */

function Earth({
  selected,
  onSelect,
  theme,
  onPreview,
  detail,
  onDetail,
}: {
  selected: SectionId | null;
  onSelect: (id: SectionId) => void;
  theme: PlanetTheme;
  onPreview: (id: SectionId) => void;
  detail: { kind: "skill" | "project"; id: string } | null;
  onDetail: (kind: "skill" | "project", id: string) => void;
}) {
  const g = useRef<THREE.Group>(null);
  const surface = useRef<THREE.MeshStandardMaterial>(null);
  const wire = useRef<THREE.MeshBasicMaterial>(null);
  const atmo = useRef<THREE.MeshBasicMaterial>(null);
  const ringMat = useRef<THREE.MeshBasicMaterial>(null);
  const ring = useRef<THREE.Mesh>(null);

  useFrame((_, d) => {
    if (g.current && !selected) g.current.rotation.y += d * 0.09 * MOTION;
    lerpColor(surface.current?.color, theme.surface, d);
    lerpColor(wire.current?.color, theme.wire, d);
    lerpColor(atmo.current?.color, theme.atmo, d);
    if (ringMat.current) {
      const target = theme.rings ? 0.45 : 0;
      ringMat.current.opacity += (target - ringMat.current.opacity) * (1 - Math.exp(-d * 2.2));
      lerpColor(ringMat.current.color, theme.accent, d);
      if (ring.current) ring.current.visible = ringMat.current.opacity > 0.005;
    }
    if (ring.current) ring.current.rotation.z += d * 0.05 * MOTION;
  });

  return (
    <group ref={g}>
      <mesh>
        <sphereGeometry args={[R, 48, 48]} />
        <meshStandardMaterial ref={surface} color="#0d2439" roughness={0.85} metalness={0.15} />
      </mesh>
      <mesh scale={1.002}>
        <sphereGeometry args={[R, 36, 24]} />
        <meshBasicMaterial ref={wire} color="#5ee7e0" wireframe transparent opacity={0.18} />
      </mesh>
      <mesh scale={1.08}>
        <sphereGeometry args={[R, 32, 32]} />
        <meshBasicMaterial
          ref={atmo}
          color="#4fd8ff"
          transparent
          opacity={0.08}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      <mesh ref={ring} rotation={[Math.PI / 2.35, 0, 0]} visible={false}>
        <ringGeometry args={[R * 1.4, R * 2.05, 96]} />
        <meshBasicMaterial
          ref={ringMat}
          color="#efd894"
          transparent
          opacity={0}
          side={THREE.DoubleSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      {MARKERS.map((m) => (
        <MarkerPin
          key={m.id}
          lat={m.lat}
          lon={m.lon}
          label={m.label}
          color={m.color}
          active={selected === m.id}
          onSelect={() => onSelect(m.id)}
          onPreview={() => onPreview(m.id)}
        />
      ))}
      {selected === "skills" && <SkillGalaxy onDetail={(id) => onDetail("skill", id)} />}
      {selected === "projects" && (
        <ProjectSignals
          activeProject={detail?.kind === "project" ? detail.id : null}
          onDetail={(id) => onDetail("project", id)}
        />
      )}
    </group>
  );
}

/* ---------------- scene ---------------- */

export type SceneProps = {
  selected: SectionId | null;
  onSelect: (id: SectionId) => void;
  onPreview: (id: SectionId) => void;
  detail: { kind: "skill" | "project"; id: string } | null;
  onDetail: (kind: "skill" | "project", id: string) => void;
};

function Lights({ theme }: { theme: PlanetTheme }) {
  const key = useRef<THREE.PointLight>(null);
  const rim = useRef<THREE.PointLight>(null);
  useFrame((_, d) => {
    lerpColor(key.current?.color, theme.light, d);
    lerpColor(rim.current?.color, theme.rim, d);
  });
  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight ref={key} position={[6, 6, 8]} intensity={90} color="#9fe9ff" distance={60} />
      <pointLight ref={rim} position={[-8, -4, -6]} intensity={50} color="#9b7bff" distance={60} />
    </>
  );
}

export default function Scene({ selected, onSelect, onPreview, detail, onDetail }: SceneProps) {
  const dpr = typeof window !== "undefined" ? Math.min(window.devicePixelRatio, 1.75) : 1;
  const theme = themeFor(selected);

  return (
    <Canvas
      dpr={dpr}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      camera={{ position: [0, 1.6, 9], fov: 50 }}
    >
      <color attach="background" args={["#080a14"]} />
      <Lights theme={theme} />

      <Nebula theme={theme} />
      <Starfield theme={theme} />
      <Dust theme={theme} />
      <Earth
        selected={selected}
        onSelect={onSelect}
        onPreview={onPreview}
        theme={theme}
        detail={detail}
        onDetail={onDetail}
      />

      <TravelPath selected={selected} theme={theme} />
      <Signals />
      {MOTION === 1 && (
        <>
          <Spacecraft selected={selected} theme={theme} />
          <Satellites />
          <ShootingStar />
        </>
      )}

      <OrbitControls
        enablePan={false}
        enableDamping
        dampingFactor={0.08}
        rotateSpeed={0.55}
        zoomSpeed={0.6}
        minDistance={5}
        maxDistance={16}
        makeDefault
      />
    </Canvas>
  );
}
