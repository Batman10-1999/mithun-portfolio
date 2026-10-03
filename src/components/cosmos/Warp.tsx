import { useEffect, useRef } from "react";

/** 2.6s space-journey transition: streaking stars, drifting dust and a single comet. */
export default function Warp({ onDone }: { onDone: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const cx = w / 2;
    const cy = h / 2;
    const N = w < 640 ? 320 : 620;
    const stars = Array.from({ length: N }, () => ({
      a: Math.random() * Math.PI * 2,
      r: Math.random() * Math.max(w, h) * 0.5,
      z: 0.3 + Math.random() * 0.9,
      hue: 190 + Math.random() * 60,
    }));
    const dust = Array.from({ length: w < 640 ? 60 : 120 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      v: 20 + Math.random() * 90,
      s: 0.4 + Math.random() * 1.1,
    }));

    const DUR = 2.6;
    const start = performance.now();
    let raf = 0;
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      doneRef.current();
    };

    const frame = (now: number) => {
      const t = (now - start) / 1000;
      const k = Math.min(t / DUR, 1);
      const accel = Math.sin(k * Math.PI) ** 1.4;

      ctx.fillStyle = "rgba(8,10,20,0.32)";
      ctx.fillRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";

      for (const s of dust) {
        s.y += (s.v * accel) / 60;
        if (s.y > h) s.y -= h;
        ctx.fillStyle = `rgba(180,210,255,${0.12 + accel * 0.18})`;
        ctx.fillRect(s.x, s.y, s.s, s.s * 2);
      }

      for (const s of stars) {
        s.r += (24 + s.z * 420 * accel) / 60;
        if (s.r > Math.max(w, h) * 0.85) {
          s.r = Math.random() * 40;
          s.a = Math.random() * Math.PI * 2;
        }
        const len = 2 + s.z * 90 * accel;
        const x1 = cx + Math.cos(s.a) * s.r;
        const y1 = cy + Math.sin(s.a) * s.r;
        const x2 = cx + Math.cos(s.a) * (s.r - len);
        const y2 = cy + Math.sin(s.a) * (s.r - len);
        ctx.strokeStyle = `hsla(${s.hue},85%,80%,${0.25 + s.z * 0.5})`;
        ctx.lineWidth = 0.6 + s.z * 1.1;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }

      // comet
      const ck = (t - 0.5) / 1.4;
      if (ck > 0 && ck < 1) {
        const px = -0.15 * w + ck * 1.3 * w;
        const py = 0.12 * h + ck * 0.42 * h;
        const g = ctx.createLinearGradient(px - 220, py - 70, px, py);
        g.addColorStop(0, "rgba(160,230,255,0)");
        g.addColorStop(1, "rgba(210,245,255,0.85)");
        ctx.strokeStyle = g;
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        ctx.moveTo(px - 220, py - 70);
        ctx.lineTo(px, py);
        ctx.stroke();
        ctx.fillStyle = "rgba(235,250,255,0.95)";
        ctx.beginPath();
        ctx.arc(px, py, 2.6, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalCompositeOperation = "source-over";
      if (k >= 1) {
        finish();
        return;
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 z-40 bg-[#080a14]">
      <canvas ref={canvasRef} className="h-full w-full" />
    </div>
  );
}
