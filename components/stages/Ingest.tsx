"use client";

import { useMemo, useState } from "react";
import JsonBlock from "../JsonBlock";
import Reveal from "../Reveal";
import { fullName, profile, stages } from "@/content/profile";

const stage = stages[0];

const emClass: Record<string, string> = {
  s1: "text-s1",
  s2: "text-s2",
  s3: "text-s3",
  s4: "text-s4",
  s5: "text-s5",
};

/**
 * What each detected region "extracts". Built from the same data the rest of
 * the site renders, so the counts in the panel are real — if a project is
 * added, `records` goes up on its own.
 */
function useRegions() {
  return useMemo(() => {
    const current = profile.experience.find((x) =>
      x.roles.some((r) => r.current),
    );

    return {
      title: {
        label: "TITLE",
        conf: "0.99",
        color: "var(--s1)",
        data: {
          name: fullName,
          role: profile.roleLine,
          email: profile.email,
          location: profile.location,
          links: [
            profile.github.replace(/^https?:\/\/(www\.)?/, ""),
            profile.linkedin.replace(/^https?:\/\/(www\.)?/, ""),
          ],
        },
      },
      table: {
        label: "TABLE",
        conf: "0.96",
        color: "var(--s2)",
        data: {
          records: profile.experience.length,
          current: current
            ? `${current.roles[0].title} @ ${current.org}`
            : null,
          since: current?.roles[0].period.split("—")[0].trim() ?? null,
          orgs: profile.experience.map((x) => x.org),
          years_total: 7,
        },
      },
      list: {
        label: "LIST",
        conf: "0.94",
        color: "var(--s3)",
        data: {
          records: profile.projects.length,
          with_source: profile.projects.filter((p) => p.repo).length,
          with_demo: profile.projects.filter((p) => p.demo).length,
          categories: [...new Set(profile.projects.map((p) => p.category))],
          top: profile.projects.slice(0, 3).map((p) => p.name),
        },
      },
      tags: {
        label: "TAGS",
        conf: "0.98",
        color: "var(--s4)",
        data: {
          groups: Object.keys(profile.stack).length,
          terms: Object.values(profile.stack).flat().length,
          sample: Object.values(profile.stack).map((g) => g[0]),
        },
      },
    };
  }, []);
}

/**
 * A detected region on the ingested sheet — a dashed measurement box with a
 * confidence tag, the way a layout model would draw it. Hovering one shows
 * what it extracted.
 */
function Region({
  label,
  conf,
  color,
  delay,
  active,
  onEnter,
  children,
  className = "",
}: {
  label: string;
  conf: string;
  color: string;
  delay: number;
  active: boolean;
  onEnter: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      onMouseEnter={onEnter}
      onFocus={onEnter}
      className={`relative block w-full cursor-default text-left transition-[background-color] duration-200 ${className}`}
      style={{
        background: active
          ? `color-mix(in oklab, ${color} 16%, transparent)`
          : "transparent",
      }}
      aria-label={`Detected region: ${label}, confidence ${conf}`}
    >
      <span
        className="callout"
        aria-hidden="true"
        style={
          {
            "--c": color,
            "--d": `${delay}s`,
            borderStyle: active ? "solid" : "dashed",
          } as React.CSSProperties
        }
      >
        <span className="callout-tag">
          {label} {conf}
        </span>
      </span>
      {children}
    </button>
  );
}

export default function Ingest() {
  const regions = useRegions();
  // Sticky on purpose: the readout keeps showing the last region you pointed
  // at, so you can move the cursor off the sheet and into the panel to scroll
  // it. Clearing on mouse-leave made the panel impossible to reach.
  const [active, setActive] = useState<keyof typeof regions>("title");
  const shown = regions[active];

  return (
    <section
      id="ingest"
      className="bloom relative flex min-h-[100svh] items-center overflow-hidden px-5 pb-24 pt-28 lg:pl-24"
    >
      <div
        className="blueprint pointer-events-none absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_75%_65%_at_55%_40%,#000_25%,transparent_100%)]"
        aria-hidden="true"
      />

      <div className="mx-auto grid w-full max-w-6xl items-center gap-16 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
        {/* ------------------------- copy ------------------------- */}
        <Reveal>
          <div className="mb-8 inline-flex items-center gap-2.5 rounded-full border border-line bg-surface/70 px-3 py-1 font-mono text-[11px] text-muted backdrop-blur">
            <span className="relative flex size-2">
              <span
                className="pulse-ring absolute inline-flex size-full rounded-full"
                style={{ background: stage.color }}
              />
              <span
                className="relative inline-flex size-2 rounded-full"
                style={{ background: stage.color }}
              />
            </span>
            stage {stage.index} · ingest · {profile.handle}.pdf
          </div>

          <h1 className="display text-[clamp(3rem,11vw,6.5rem)] leading-[0.86]">
            {profile.firstName}
            <br />
            {profile.lastName}
            <span style={{ color: stage.color }}>.</span>
          </h1>

          <p className="mt-7 max-w-xl text-2xl leading-[1.3] text-fg/90 sm:text-3xl">
            {profile.headline.map((part, i) =>
              part.em ? (
                <em
                  key={i}
                  className={`display not-italic ${emClass[part.em] ?? "text-accent"}`}
                >
                  {part.text}
                </em>
              ) : (
                <span key={i}>{part.text}</span>
              ),
            )}
          </p>

          <p className="mt-6 max-w-md text-[15px] leading-relaxed text-muted">
            {profile.blurb}
          </p>

          <div className="mt-9 flex flex-wrap gap-3">
            <a
              href="#extract"
              className="group inline-flex items-center gap-2 rounded-full bg-fg px-5 py-3 text-sm font-medium text-bg transition-transform hover:scale-[1.03]"
            >
              Run the pipeline
              <span className="transition-transform group-hover:translate-y-0.5">
                ↓
              </span>
            </a>
            <a
              href={profile.resumeFile}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-line bg-surface/60 px-5 py-3 text-sm backdrop-blur transition-colors hover:border-fg/30"
            >
              Resume
            </a>
          </div>

          {/* terminal log */}
          <div className="mt-11 max-w-md rounded-xl border border-line bg-surface/70 p-4 font-mono text-[11.5px] leading-6 backdrop-blur">
            {profile.log.map((line, i) => (
              <div
                key={i}
                className={`logline whitespace-pre ${
                  i === 0
                    ? "text-fg"
                    : i === profile.log.length - 1
                      ? ""
                      : "text-muted"
                }`}
                style={
                  {
                    "--d": `${0.9 + i * 0.28}s`,
                    ...(i === profile.log.length - 1
                      ? { color: stage.color }
                      : {}),
                  } as React.CSSProperties
                }
              >
                {line}
              </div>
            ))}
            <span
              className="caret inline-block"
              style={{ color: stage.color }}
              aria-hidden="true"
            >
              ▌
            </span>
          </div>
        </Reveal>

        {/* ------------------- ingested document ------------------- */}
        <Reveal delay={0.15} className="relative mx-auto w-full max-w-[420px]">
          <div
            className="blueprint-fine pointer-events-none absolute -inset-8 -z-10 rounded-xl opacity-60 [mask-image:radial-gradient(ellipse_at_center,#000,transparent_75%)]"
            aria-hidden="true"
          />

          <div className="sheet relative rounded-[3px] px-7 pb-8 pt-9 sm:px-9">
            {/* corner registration marks */}
            {[
              "left-2 top-2 border-l border-t",
              "right-2 top-2 border-r border-t",
              "left-2 bottom-2 border-b border-l",
              "right-2 bottom-2 border-b border-r",
            ].map((pos) => (
              <span
                key={pos}
                className={`absolute size-3 border-paper-ink/25 ${pos}`}
                aria-hidden="true"
              />
            ))}

            <Region
              {...regions.title}
              delay={1.5}
              active={active === "title"}
              onEnter={() => setActive("title")}
              className="mb-7 text-center"
            >
              <div className="display text-[32px] leading-none">{fullName}</div>
              <div className="mt-2.5 font-mono text-[8.5px] tracking-wide text-paper-ink/60">
                {profile.email} · {profile.location}
              </div>
            </Region>

            <div className="mb-2 border-b border-paper-ink/25 pb-1 font-mono text-[9px] font-semibold uppercase tracking-[0.18em] text-paper-ink/70">
              Experience
            </div>

            <Region
              {...regions.table}
              delay={1.9}
              active={active === "table"}
              onEnter={() => setActive("table")}
              className="mb-6 space-y-2.5"
            >
              {profile.experience.slice(0, 3).map((x, i) => (
                <div key={i}>
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="text-[11.5px] font-semibold text-paper-ink">
                      {x.org}
                    </span>
                    <span className="font-mono text-[8px] text-paper-ink/55">
                      {x.roles[0]?.period}
                    </span>
                  </div>
                  <div className="text-[10.5px] italic text-paper-ink/70">
                    {x.roles[0]?.title}
                  </div>
                </div>
              ))}
            </Region>

            <div className="mb-2 border-b border-paper-ink/25 pb-1 font-mono text-[9px] font-semibold uppercase tracking-[0.18em] text-paper-ink/70">
              Projects
            </div>

            <Region
              {...regions.list}
              delay={2.25}
              active={active === "list"}
              onEnter={() => setActive("list")}
              className="mb-6 space-y-1.5"
            >
              {profile.projects.slice(0, 3).map((p, i) => (
                <div
                  key={i}
                  className="grid grid-cols-[8px_1fr] gap-1.5 text-[10.5px] text-paper-ink/80"
                >
                  <span
                    className="mt-[7px] h-px w-2 bg-paper-ink/40"
                    aria-hidden="true"
                  />
                  <span className="truncate">{p.name}</span>
                </div>
              ))}
            </Region>

            <div className="mb-2 border-b border-paper-ink/25 pb-1 font-mono text-[9px] font-semibold uppercase tracking-[0.18em] text-paper-ink/70">
              Skills
            </div>

            <Region
              {...regions.tags}
              delay={2.6}
              active={active === "tags"}
              onEnter={() => setActive("tags")}
            >
              <div className="flex flex-wrap gap-1">
                {Object.values(profile.stack)
                  .flat()
                  .slice(0, 10)
                  .map((s, i) => (
                    <span
                      key={i}
                      className="rounded-sm bg-paper-ink/[0.07] px-1.5 py-0.5 font-mono text-[8.5px] text-paper-ink/75"
                    >
                      {s}
                    </span>
                  ))}
              </div>
            </Region>
          </div>

          {/* ---------------- extraction readout ---------------- */}
          <div className="mt-4 overflow-hidden rounded-xl border border-line bg-bg-deep/80 backdrop-blur">
            <div
              className="flex items-center justify-between border-b border-line px-4 py-2 font-mono text-[10px] uppercase tracking-[0.18em]"
              style={{ color: shown.color }}
            >
              <span>extracted · {shown.label}</span>
              <span className="text-faint">conf {shown.conf}</span>
            </div>

            <div className="max-h-[260px] overflow-y-auto px-4 py-3">
              <JsonBlock value={shown.data} />
            </div>

            <p className="border-t border-line px-4 py-1.5 text-center font-mono text-[9.5px] text-faint">
              hover a region on the sheet to switch
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
