import { useEffect, useRef } from "react";

/**
 * Cinematic intro: stars fade in from darkness, drift inward with parallax,
 * assemble into "MITHUN S", hold, then dissolve.
 * Rendered on a DPR-scaled 2D canvas (particles only — the sharp headline is DOM text).
 */

type P = {
  sx: number;
  sy: number;
  dx: number;
  dy: number;
  tx: number;
  ty: number;
  ex: number;
  ey: number;
  depth: number;
  size: number;
  delay: number;
  hue: number;
  isText: boolean;
  jx: number;
  jy: number;
};

const T = {
  fadeIn: 1.4,
  drift: 3.4,
  form: 5.2,
  hold: 7.2,
  dissolve: 8.8,
};

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

function sampleText(w: number, h: number, fontSize: number) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d", { willReadFrequently: true });
  if (!ctx) return [] as { x: number; y: number }[];
  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `600 ${fontSize}px "Space Grotesk", ui-sans-serif, system-ui, sans-serif`;
  ctx.fillText("Mithun S", w / 2, h / 2);
  const data = ctx.getImageData(0, 0, w, h).data;
  const step = Math.max(2, Math.round(fontSize / 34));
  const pts: { x: number; y: number }[] = [];
  for (let y = 0; y < h; y += step) {
    for (let x = 0; x < w; x += step) {
      if ((data[(y * w + x) * 4 + 3] ?? 0) > 128) pts.push({ x, y });
    }
  }
  return pts;
}

export default function Intro({ onDone }: { onDone: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let particles: P[] = [];
    let w = 0;
    let h = 0;
    let dpr = 1;
    let cancelled = false;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const build = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const fontSize = Math.min(w * 0.155, h * 0.3, 168);
      const pts = sampleText(Math.round(w), Math.round(h), fontSize);
      const maxText = w < 640 ? 1400 : 3200;
      const stride = Math.max(1, Math.ceil(pts.length / maxText));
      const text = pts.filter((_, i) => i % stride === 0);

      const cx = w / 2;
      const cy = h / 2;
      const mk = (tx: number, ty: number, isText: boolean): P => {
        const a = Math.random() * Math.PI * 2;
        const r = Math.max(w, h) * (0.45 + Math.random() * 0.75);
        const sx = cx + Math.cos(a) * r;
        const sy = cy + Math.sin(a) * r * 0.8;
        const depth = 0.25 + Math.random() * 0.75;
        return {
          sx,
          sy,
          dx: sx + (cx - sx) * (0.28 + depth * 0.4),
          dy: sy + (cy - sy) * (0.28 + depth * 0.4),
          tx,
          ty,
          ex: tx + Math.cos(a) * 420 * depth,
          ey: ty + Math.sin(a) * 420 * depth,
          depth,
          size: isText ? 0.7 + depth * 0.9 : 0.4 + depth * 1.2,
          delay: Math.random() * 1.6,
          hue: 185 + Math.random() * 60,
          isText,
          jx: Math.random() * Math.PI * 2,
          jy: Math.random() * Math.PI * 2,
        };
      };

      particles = text.map((p) => mk(p.x, p.y, true));
      const bgCount = w < 640 ? 260 : 520;
      for (let i = 0; i < bgCount; i++) {
        const p = mk(Math.random() * w, Math.random() * h, false);
        p.tx = p.dx + (Math.random() - 0.5) * 60;
        p.ty = p.dy + (Math.random() - 0.5) * 60;
        p.ex = p.tx + (p.tx - cx) * 0.5;
        p.ey = p.ty + (p.ty - cy) * 0.5;
        particles.push(p);
      }
    };

    build();
    const onResize = () => build();
    window.addEventListener("resize", onResize);

    const start = performance.now();
    const finish = () => {
      if (cancelled) return;
      cancelled = true;
      doneRef.current();
    };

    if (reduced) {
      finish();
      return () => {
        window.removeEventListener("resize", onResize);
      };
    }

    const frame = (now: number) => {
      const t = (now - start) / 1000;
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";

      for (const p of particles) {
        // opacity
        let alpha = clamp01((t - p.delay) / 1.1);
        if (t > T.hold) {
          alpha *= 1 - clamp01((t - T.hold) / (T.dissolve - T.hold));
        }
        if (alpha <= 0.001) continue;

        let x: number;
        let y: number;
        if (t < T.drift) {
          const k = easeOut(clamp01((t - p.delay) / (T.drift - p.delay)));
          x = p.sx + (p.dx - p.sx) * k;
          y = p.sy + (p.dy - p.sy) * k;
        } else if (t < T.form) {
          const k = easeInOut(clamp01((t - T.drift) / (T.form - T.drift)));
          x = p.dx + (p.tx - p.dx) * k;
          y = p.dy + (p.ty - p.dy) * k;
        } else if (t < T.hold) {
          x = p.tx + Math.sin(t * 1.2 + p.jx) * 0.8 * p.depth;
          y = p.ty + Math.cos(t * 1.1 + p.jy) * 0.8 * p.depth;
        } else {
          const k = easeInOut(clamp01((t - T.hold) / (T.dissolve - T.hold)));
          x = p.tx + (p.ex - p.tx) * k;
          y = p.ty + (p.ey - p.ty) * k;
        }

        const a = p.isText ? alpha * (0.55 + p.depth * 0.45) : alpha * (0.18 + p.depth * 0.45);
        ctx.fillStyle = `hsla(${p.hue}, 85%, ${p.isText ? 82 : 76}%, ${a})`;
        ctx.beginPath();
        ctx.arc(x, y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalCompositeOperation = "source-over";

      if (t >= T.dissolve) {
        finish();
        return;
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    const skip = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "Enter" || e.key === " ") finish();
    };
    window.addEventListener("keydown", skip);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("keydown", skip);
    };
  }, []);

  return (
    <div className="absolute inset-0 z-30 bg-[#080a14]">
      <canvas ref={canvasRef} className="h-full w-full" />
      <button
        type="button"
        onClick={() => doneRef.current()}
        className="absolute right-5 bottom-5 font-mono text-[10px] tracking-[0.3em] text-white/35 uppercase transition-colors hover:text-white/80"
      >
        Skip
      </button>
    </div>
  );
}
