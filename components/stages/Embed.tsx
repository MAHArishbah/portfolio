"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import ParticleField from "../ParticleField";
import Reveal from "../Reveal";
import SectionHeader from "../SectionHeader";
import {
  clusterOffset,
  glyph,
  idleDrift,
  mobileClusters,
  nodeById,
  nodes,
} from "@/content/graph";
import { clusters, stages } from "@/content/profile";

const stage = stages[2];

const kindLabel = {
  project: "project",
  role: "role",
  honour: "realisation",
} as const;

/** Shared easing for the selection re-projection. */
const EASE_POS =
  "left 3.5s cubic-bezier(0.16,1,0.3,1), top 3.5s cubic-bezier(0.16,1,0.3,1)";

/** Below Tailwind's `sm` — phones get the tall layout from `graph.ts`. */
const NARROW = "(max-width: 639.98px)";

function useNarrow() {
  return useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia(NARROW);
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    () => window.matchMedia(NARROW).matches,
    () => false,
  );
}

export default function Embed() {
  const [filter, setFilter] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const narrow = useNarrow();

  /**
   * Idle orbit for the chips and region labels. Written straight to the DOM
   * rather than through state — this runs every frame, and re-rendering 22
   * elements at 60fps would be wasteful. `left`/`top` stay React's, carrying
   * the base position and the selection push; this only sets `translate`,
   * which is a separate CSS property and so never fights the chip's own
   * `transform`.
   */
  useEffect(() => {
    const root = mapRef.current;
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    let w = 0;
    let h = 0;

    const measure = () => {
      const r = root.getBoundingClientRect();
      w = r.width;
      h = r.height;
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(root);

    const tick = () => {
      const t = performance.now() / 1000;
      for (const el of root.querySelectorAll<HTMLElement>("[data-ci]")) {
        const { dx, dy } = idleDrift(t, Number(el.dataset.ci));
        el.style.translate = `${(dx / 100) * w}px ${(dy / 100) * h}px`;
      }
      raf = requestAnimationFrame(tick);
    };

    tick();
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  const counts = useMemo(() => {
    const m = new Map<string, number>();
    for (const n of nodes) m.set(n.cluster, (m.get(n.cluster) ?? 0) + 1);
    return m;
  }, []);

  const focus = hovered ?? selected;
  const detail = selected ? nodeById.get(selected) : null;

  const dimmed = (cluster: string) => Boolean(filter) && cluster !== filter;

  return (
    <section
      id="embed"
      className="relative scroll-mt-20 px-5 py-24 sm:py-32 lg:pl-24"
    >
      <div className="mx-auto max-w-6xl">
        <SectionHeader stage={stage}>
          Roles, projects and the things that went right, grouped by what they
          have in common. Pick a region, or open a node.
        </SectionHeader>

        {/* ------------------- region filters ------------------- */}
        <Reveal className="mb-6 flex flex-wrap items-center gap-2">
          <button
            onClick={() => setFilter(null)}
            aria-pressed={filter === null}
            className={`rounded-full border px-3 py-1.5 font-mono text-[11px] transition-colors ${
              filter === null
                ? "border-transparent bg-fg text-bg"
                : "border-line text-muted hover:border-fg/30 hover:text-fg"
            }`}
          >
            all
          </button>

          {clusters.map((c) => {
            const on = filter === c.name;
            return (
              <button
                key={c.name}
                onClick={() => setFilter(on ? null : c.name)}
                aria-pressed={on}
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 font-mono text-[11px] transition-colors ${
                  on
                    ? "border-transparent bg-fg text-bg"
                    : "border-line text-muted hover:border-fg/30 hover:text-fg"
                }`}
              >
                <span
                  className="size-1.5 rounded-full"
                  style={{ background: c.color }}
                  aria-hidden="true"
                />
                {c.name}
                <span className={on ? "text-bg/60" : "text-faint"}>
                  {counts.get(c.name) ?? 0}
                </span>
              </button>
            );
          })}
        </Reveal>

        {/* ------------------- the map ------------------- */}
        <Reveal
          delay={0.05}
          className="relative overflow-hidden rounded-2xl border border-line bg-bg-deep/50"
        >
          <div
            ref={mapRef}
            className="relative h-[760px] w-full sm:h-[min(74vh,680px)]"
            onMouseLeave={() => setHovered(null)}
          >
            <ParticleField activeCluster={filter} narrow={narrow} />

            {/* cluster labels, sitting behind the chips */}
            {(narrow ? mobileClusters : clusters).map((c, i) => {
              const { dx, dy } = clusterOffset(filter, c.name, narrow);
              return (
                <span
                  key={c.name}
                  data-ci={i}
                  className="pointer-events-none absolute z-20"
                  aria-hidden="true"
                  style={{
                    left: `${c.x + dx}%`,
                    top: `${c.y + dy}%`,
                    transition: EASE_POS,
                  }}
                >
                  {/* Sits on the cloud, above the dust and above the chips, on
                      its own scrim — the hue alone is the same value as the
                      particles behind it and disappears. Chips are laid out
                      around a keep-out box so they rarely reach it anyway. */}
                  <span
                    className="block whitespace-nowrap rounded-full border py-1 pl-3 pr-2 font-mono text-[10px] uppercase tracking-[0.12em] backdrop-blur-[3px] sm:text-[11px] sm:tracking-[0.22em]"
                    style={{
                      transform: "translate(-50%, -50%)",
                      color: c.color,
                      background: "color-mix(in oklab, var(--bg) 76%, transparent)",
                      borderColor: `color-mix(in oklab, ${c.color} 22%, transparent)`,
                      opacity: dimmed(c.name) ? 0.12 : 1,
                      transition: "opacity 0.5s ease",
                    }}
                  >
                    {c.name}
                  </span>
                </span>
              );
            })}

            {/* nodes */}
            {nodes.map((n) => {
              const off = dimmed(n.cluster);
              const isFocus = focus === n.id;
              const isSelected = selected === n.id;
              const { dx, dy } = clusterOffset(filter, n.cluster, narrow);

              return (
                <span
                  key={n.id}
                  data-ci={n.clusterIndex}
                  className="absolute z-10"
                  style={{
                    left: `${(narrow ? n.mx : n.x) + dx}%`,
                    top: `${(narrow ? n.my : n.y) + dy}%`,
                    transition: EASE_POS,
                  }}
                >
                  <button
                    onMouseEnter={() => setHovered(n.id)}
                    onFocus={() => setHovered(n.id)}
                    onBlur={() => setHovered(null)}
                    onClick={() => setSelected(isSelected ? null : n.id)}
                    aria-pressed={isSelected}
                    tabIndex={off ? -1 : 0}
                    className="block whitespace-nowrap rounded-full border px-2 py-1 font-mono text-[10px] backdrop-blur-sm sm:px-2.5 sm:text-[11px]"
                    style={{
                      transform: `translate(-50%, -50%) scale(${isFocus ? 1.06 : 1})`,
                      transition:
                        "opacity 0.4s ease, background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease, box-shadow 0.3s ease, transform 0.3s ease",
                      opacity: off ? 0.12 : focus && !isFocus ? 0.5 : 1,
                      pointerEvents: off ? "none" : "auto",
                      background: isFocus
                        ? `color-mix(in oklab, ${n.color} 18%, var(--bg))`
                        : "color-mix(in oklab, var(--bg) 82%, transparent)",
                      borderColor: isFocus || isSelected ? n.color : "var(--line)",
                      color: isFocus ? "var(--fg)" : "var(--muted)",
                      boxShadow: isFocus
                        ? `0 0 22px color-mix(in oklab, ${n.color} 45%, transparent)`
                        : "none",
                    }}
                  >
                    <span style={{ color: n.color }} aria-hidden="true">
                      {glyph[n.kind]}
                    </span>{" "}
                    {n.label}
                    <span className="sr-only">
                      {" "}
                      — {kindLabel[n.kind]}, {n.cluster}
                    </span>
                  </button>
                </span>
              );
            })}

            {/* legend */}
            <div className="pointer-events-none absolute bottom-4 left-5 flex items-center gap-4 font-mono text-[10px] uppercase tracking-[0.18em] text-faint">
              {(["project", "role", "honour"] as const).map((k) => (
                <span key={k} className="flex items-center gap-1.5">
                  <span aria-hidden="true">{glyph[k]}</span>
                  {kindLabel[k]}
                </span>
              ))}
            </div>

            <div className="pointer-events-none absolute bottom-4 right-5 hidden font-mono text-[10px] sm:block">
              {nodes.length} entities
            </div>
          </div>
        </Reveal>

        {/* ------------------- detail ------------------- */}
        <div className="mt-5">
          {detail ? (
            <article className="rounded-xl border border-line bg-surface/60 p-5 sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="mb-1.5 flex items-center gap-2 font-mono text-[10.5px] uppercase tracking-[0.18em]">
                    <span style={{ color: detail.color }}>
                      {glyph[detail.kind]} {kindLabel[detail.kind]}
                    </span>
                    <span className="text-faint">· {detail.cluster}</span>
                  </div>
                  <h3 className="display text-xl sm:text-2xl">
                    {detail.meta ?? detail.label}
                  </h3>
                </div>

                <button
                  onClick={() => setSelected(null)}
                  className="rounded-lg border border-line px-2 py-1 font-mono text-[11px] text-faint transition-colors hover:text-fg"
                >
                  close
                </button>
              </div>

              <p className="mt-4 max-w-3xl text-[14.5px] leading-relaxed text-muted">
                {detail.detail}
              </p>

              {detail.tags.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {detail.tags.map((t) => (
                    <span
                      key={t}
                      className="rounded-md border px-2 py-0.5 font-mono text-[10.5px]"
                      style={{
                        color: `color-mix(in oklab, ${detail.color} 85%, var(--fg))`,
                        borderColor: `color-mix(in oklab, ${detail.color} 25%, transparent)`,
                        background: `color-mix(in oklab, ${detail.color} 7%, transparent)`,
                      }}
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}

              {detail.links.length > 0 && (
                <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2">
                  {detail.links.map((l) => (
                    <a
                      key={l.url}
                      href={l.url}
                      target={l.url.startsWith("http") ? "_blank" : undefined}
                      rel={l.url.startsWith("http") ? "noreferrer" : undefined}
                      className="inline-flex items-center font-mono text-[12px] transition-opacity hover:opacity-80"
                      style={{ color: detail.color }}
                    >
                      {l.label}
                    </a>
                  ))}
                </div>
              )}
            </article>
          ) : (
            <p className="rounded-xl border border-dashed border-line px-5 py-4 text-center font-mono text-[11px] text-faint">
              <span className="sm:hidden">tap</span>
              <span className="hidden sm:inline">click</span> a node to open it
            </p>
          )}
        </div>

      </div>
    </section>
  );
}
