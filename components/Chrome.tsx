"use client";

import { useEffect, useState } from "react";
import { profile, stages } from "@/content/profile";

type Theme = "dark" | "light";

/**
 * Site chrome: a slim top bar, the vertical stage rail down the left edge, and
 * the ⌘K palette. The rail doubles as the scroll indicator — its spine fills
 * as you move through the pipeline.
 */
export default function Chrome() {
  const [active, setActive] = useState(0);
  const [progress, setProgress] = useState(0);
  const [theme, setTheme] = useState<Theme | null>(null);

  // --- theme -------------------------------------------------------------
  useEffect(() => {
    const stored = localStorage.getItem("theme") as Theme | null;
    if (stored === "dark" || stored === "light") {
      setTheme(stored);
      document.documentElement.dataset.theme = stored;
    }
  }, []);

  const toggleTheme = () => {
    const current: Theme =
      theme ??
      (window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");
    const next: Theme = current === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.dataset.theme = next;
    localStorage.setItem("theme", next);
  };

  // --- scroll tracking ---------------------------------------------------
  useEffect(() => {
    let frame = 0;

    const read = () => {
      frame = 0;

      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - window.innerHeight;
      setProgress(scrollable > 0 ? Math.min(1, window.scrollY / scrollable) : 0);

      // The active stage is the last one whose top has passed the 40% line.
      const line = window.innerHeight * 0.4;
      let current = 0;
      stages.forEach((s, i) => {
        const el = document.getElementById(s.id);
        if (el && el.getBoundingClientRect().top <= line) current = i;
      });
      setActive(current);
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(read);
    };

    read();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  const stage = stages[active];

  return (
    <>
      {/* ---------------- top bar ---------------- */}
      <header className="fixed inset-x-0 top-0 z-50 border-b border-line bg-bg/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-5 lg:pl-24">
          <a
            href="#ingest"
            className="shrink-0 font-mono text-[12.5px] uppercase tracking-[0.16em] text-fg"
          >
            {profile.firstName} {profile.lastName}
            <span style={{ color: stage.color }}>.</span>
          </a>

          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-faint lg:hidden">
            <span className="tabular">{stage.index}</span>
            <span className="mx-1.5">·</span>
            <span style={{ color: stage.color }}>{stage.label}</span>
          </span>

          <div className="flex shrink-0 items-center gap-2">
            <button
              onClick={toggleTheme}
              className="rounded-lg border border-line bg-surface px-2.5 py-1.5 font-mono text-[11px] text-muted transition-colors hover:text-fg"
              aria-label="Toggle colour theme"
            >
              {theme === "light" ? "☾" : "☀"}
            </button>

            <a
              href={profile.resumeFile}
              target="_blank"
              rel="noreferrer"
              className="hidden rounded-lg border border-line px-2.5 py-1.5 text-xs text-muted transition-colors hover:border-fg/30 hover:text-fg sm:block"
            >
              Resume
            </a>
          </div>
        </div>

        {/* Hairline scroll progress, tinted to the live stage. */}
        <div
          className="absolute bottom-0 left-0 h-px origin-left transition-[background-color] duration-500"
          aria-hidden="true"
          style={{
            width: "100%",
            background: stage.color,
            transform: `scaleX(${progress})`,
          }}
        />
      </header>

      {/* ---------------- vertical stage rail ---------------- */}
      <nav
        aria-label="Pipeline stages"
        className="fixed left-0 top-1/2 z-40 hidden -translate-y-1/2 lg:block"
      >
        <div className="relative pl-6 pr-4">
          {/* spine */}
          <div
            className="absolute bottom-3 left-[30px] top-3 w-px bg-line"
            aria-hidden="true"
          />
          <div
            className="absolute left-[30px] top-3 w-px origin-top"
            aria-hidden="true"
            style={{
              height: "calc(100% - 24px)",
              background: `linear-gradient(to bottom, var(--s1), var(--s2), var(--s3), var(--s4), var(--s5))`,
              transform: `scaleY(${progress})`,
            }}
          />

          <ul className="relative space-y-7">
            {stages.map((s, i) => {
              const isActive = i === active;
              const isPast = i < active;
              return (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    aria-current={isActive ? "step" : undefined}
                    className="group flex items-center gap-3"
                  >
                    <span
                      className="grid size-[9px] shrink-0 place-items-center rounded-full border transition-all duration-300"
                      aria-hidden="true"
                      style={{
                        borderColor: isActive || isPast ? s.color : "var(--line)",
                        background: isActive
                          ? s.color
                          : isPast
                            ? `color-mix(in oklab, ${s.color} 40%, transparent)`
                            : "var(--bg)",
                        boxShadow: isActive
                          ? `0 0 14px color-mix(in oklab, ${s.color} 60%, transparent)`
                          : "none",
                        transform: isActive ? "scale(1.45)" : "scale(1)",
                      }}
                    />
                    <span
                      className="flex items-baseline gap-2 whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.2em] transition-all duration-300"
                      style={{
                        color: isActive ? s.color : "var(--faint)",
                        opacity: isActive ? 1 : 0,
                        transform: isActive ? "none" : "translateX(-4px)",
                      }}
                    >
                      <span className="tabular">{s.index}</span>
                      {s.label}
                    </span>
                    {/* Label on hover for the inactive ticks. */}
                    {!isActive && (
                      <span className="pointer-events-none absolute left-11 whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.2em] text-faint opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                        {s.label}
                      </span>
                    )}
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>
    </>
  );
}
