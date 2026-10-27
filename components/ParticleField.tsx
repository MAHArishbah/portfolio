"use client";

import { useEffect, useRef } from "react";
import { clusterOffset, idleDrift } from "@/content/graph";
import { clusters } from "@/content/profile";

type Particle = {
  /** Normalised 0–1 position within the canvas. */
  x: number;
  y: number;
  r: number;
  alpha: number;
  phase: number;
  speed: number;
  cluster: number;
};

const PER_CLUSTER = 400;
const DUST = 260;

/** Approximate a normal draw by summing uniforms — cheap and good enough. */
function gauss(rand: () => number) {
  return (rand() + rand() + rand() - 1.5) / 1.5;
}

function mulberry(seed: number) {
  let t = seed;
  return () => {
    t += 0x6d2b79f5;
    let x = t;
    x = Math.imul(x ^ (x >>> 15), x | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.trim().replace("#", "");
  const full =
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h;
  const n = parseInt(full, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** Resolve "var(--s1)" against the document. */
function resolve(token: string): [number, number, number] {
  const match = /var\((--[\w-]+)\)/.exec(token);
  if (!match) return hexToRgb(token);
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(match[1])
    .trim();
  return value ? hexToRgb(value) : [160, 160, 160];
}

/**
 * The diffuse cloud behind the knowledge map. Each cluster gets a tinted
 * gaussian blob of dust centred on its node group, so the regions read as
 * density rather than as drawn boundaries.
 */
export default function ParticleField({
  activeCluster,
}: {
  activeCluster: string | null;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const activeRef = useRef(activeCluster);
  activeRef.current = activeCluster;

  useEffect(() => {
    const canvas = canvasRef.current;
    const parent = canvas?.parentElement;
    if (!canvas || !parent) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // ---- build the particle set (stable across resizes) ----
    const rand = mulberry(20260127);
    const particles: Particle[] = [];

    clusters.forEach((c, ci) => {
      for (let i = 0; i < PER_CLUSTER; i += 1) {
        particles.push({
          x: c.x / 100 + gauss(rand) * 0.14,
          y: c.y / 100 + gauss(rand) * 0.18,
          r: 0.4 + rand() * 1.5,
          alpha: 0.12 + rand() * 0.5,
          phase: rand() * Math.PI * 2,
          speed: 0.15 + rand() * 0.5,
          cluster: ci,
        });
      }
    });

    for (let i = 0; i < DUST; i += 1) {
      particles.push({
        x: rand(),
        y: rand(),
        r: 0.3 + rand() * 0.8,
        alpha: 0.06 + rand() * 0.14,
        phase: rand() * Math.PI * 2,
        speed: 0.1 + rand() * 0.3,
        cluster: -1,
      });
    }

    // ---- colours, refreshed when the theme flips ----
    let palette: [number, number, number][] = [];
    let dustColor: [number, number, number] = [160, 160, 160];

    const readPalette = () => {
      palette = clusters.map((c) => resolve(c.color));
      dustColor = resolve("var(--faint)");
    };
    readPalette();

    const themeObserver = new MutationObserver(readPalette);
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    const scheme = window.matchMedia("(prefers-color-scheme: light)");
    scheme.addEventListener("change", readPalette);

    // ---- sizing ----
    let width = 0;
    let height = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = parent.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(parent);

    // ---- draw ----
    // Per-cluster opacity eases toward its target when a filter changes.
    const gain = clusters.map(() => 1);
    // Drift offsets, eased over ~3.5s to match the CSS transition on the chips.
    const drift = clusters.map(() => ({ x: 0, y: 0 }));
    const orbits = clusters.map(() => ({ x: 0, y: 0 }));
    const ZERO = { x: 0, y: 0 };
    const EASE = 0.014;
    let dustGain = 1;
    let raf = 0;
    let t = 0;

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      const active = activeRef.current;
      const now = reduced ? 0 : performance.now() / 1000;

      clusters.forEach((c, i) => {
        const target = !active || c.name === active ? 1 : 0.12;
        gain[i] += (target - gain[i]) * 0.08;

        // Selection push eases in; the idle orbit rides on top of it.
        const { dx, dy } = clusterOffset(active, c.name);
        drift[i].x += (dx / 100 - drift[i].x) * EASE;
        drift[i].y += (dy / 100 - drift[i].y) * EASE;

        const orbit = idleDrift(now, i);
        orbits[i].x = orbit.dx / 100;
        orbits[i].y = orbit.dy / 100;
      });
      dustGain += ((active ? 0.25 : 1) - dustGain) * 0.08;

      for (const p of particles) {
        const g = p.cluster === -1 ? dustGain : gain[p.cluster];
        if (g < 0.02) continue;

        const d = p.cluster === -1 ? ZERO : drift[p.cluster];
        const o = p.cluster === -1 ? ZERO : orbits[p.cluster];
        const wobble = reduced ? 0 : Math.sin(t * p.speed + p.phase) * 0.0035;
        const px = (p.x + wobble + d.x + o.x) * width;
        const py = (p.y + wobble * 0.6 + d.y + o.y) * height;
        if (px < -10 || px > width + 10 || py < -10 || py > height + 10) continue;

        const [r, gr, b] = p.cluster === -1 ? dustColor : palette[p.cluster];
        ctx.fillStyle = `rgba(${r},${gr},${b},${p.alpha * g})`;
        ctx.beginPath();
        ctx.arc(px, py, p.r, 0, Math.PI * 2);
        ctx.fill();
      }

      t += 0.01;
      raf = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      themeObserver.disconnect();
      scheme.removeEventListener("change", readPalette);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 size-full"
      aria-hidden="true"
    />
  );
}
