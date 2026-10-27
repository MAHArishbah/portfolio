"use client";

import { useState } from "react";
import Reveal from "../Reveal";
import SectionHeader from "../SectionHeader";
import { profile, stages } from "@/content/profile";

const stage = stages[1];

const kindColor: Record<string, string> = {
  employment: "var(--s1)",
  research: "var(--s3)",
  internship: "var(--s2)",
};

function JsonView() {
  const payload = {
    schema: "portfolio.v1",
    experience: profile.experience,
    education: profile.education,
    leadership: profile.leadership,
  };

  return (
    <pre className="overflow-x-auto rounded-xl border border-line bg-surface/70 p-5 font-mono text-[11.5px] leading-relaxed text-muted">
      {JSON.stringify(payload, null, 2)}
    </pre>
  );
}

function RecordCard({
  record,
  index,
}: {
  record: (typeof profile.experience)[number];
  index: number;
}) {
  const color = kindColor[record.kind] ?? stage.color;
  const live = record.roles.some((r) => r.current);

  return (
    <Reveal as="li" className="group">
      <article className="lift relative grid gap-x-8 gap-y-4 rounded-xl border border-line bg-surface/50 p-5 sm:p-7 lg:grid-cols-[150px_1fr]">
        {/* accent edge */}
        <span
          className="absolute inset-x-5 top-0 h-px sm:inset-x-7"
          aria-hidden="true"
          style={{ background: `linear-gradient(to right, ${color}, transparent 60%)` }}
        />

        {/* --------- left gutter: when & what kind --------- */}
        <div className="flex flex-col gap-2 font-mono text-[10.5px] uppercase tracking-[0.14em]">
          <span className="text-faint">
            R-{String(index + 1).padStart(2, "0")}
          </span>
          <span style={{ color }}>{record.kind}</span>
          {live && (
            <span
              className="inline-flex w-fit items-center gap-1.5 rounded px-1.5 py-0.5 text-[9.5px] normal-case tracking-wide"
              style={{
                color,
                background: `color-mix(in oklab, ${color} 14%, transparent)`,
              }}
            >
              <span
                className="size-1.5 rounded-full"
                style={{ background: color }}
                aria-hidden="true"
              />
              current
            </span>
          )}
          <span className="mt-1 space-y-0.5 normal-case tracking-normal text-faint">
            {record.roles.map((r) => (
              <span key={r.period} className="block tabular">
                {r.period}
              </span>
            ))}
          </span>
        </div>

        {/* --------- main --------- */}
        <div>
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <h3 className="display text-2xl sm:text-[28px]">
              {record.url ? (
                <a
                  href={record.url}
                  target="_blank"
                  rel="noreferrer"
                  className="transition-colors"
                  style={{ color: "inherit" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = color;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = "inherit";
                  }}
                >
                  {record.org}
                  <span className="ml-1 text-sm align-super text-faint">↗</span>
                </a>
              ) : (
                record.org
              )}
            </h3>
            <span className="font-mono text-[11px] text-faint">
              {record.location}
            </span>
          </div>

          <div className="mt-1.5 flex flex-wrap items-baseline gap-x-3 gap-y-1 text-sm">
            {record.roles.map((r, i) => (
              <span key={r.title} className={i === 0 ? "text-fg" : "text-faint"}>
                {r.title}
                {i > 0 && <span className="text-faint"> (prev.)</span>}
              </span>
            ))}
          </div>

          <ul className="mt-5 space-y-2.5 text-[14.5px] leading-relaxed text-muted">
            {record.bullets.map((b, i) => (
              <li key={i} className="grid grid-cols-[14px_1fr] gap-2">
                <span
                  className="mt-[10px] h-px w-2.5"
                  aria-hidden="true"
                  style={{ background: `color-mix(in oklab, ${color} 65%, transparent)` }}
                />
                {b}
              </li>
            ))}
          </ul>

          {record.tags.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-1.5">
              {record.tags.map((t) => (
                <span
                  key={t}
                  className="rounded-md border px-2 py-0.5 font-mono text-[10.5px]"
                  style={{
                    color: `color-mix(in oklab, ${color} 85%, var(--fg))`,
                    borderColor: `color-mix(in oklab, ${color} 25%, transparent)`,
                    background: `color-mix(in oklab, ${color} 7%, transparent)`,
                  }}
                >
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>
      </article>
    </Reveal>
  );
}

function CredentialList({
  title,
  items,
  color,
}: {
  title: string;
  items: typeof profile.education;
  color: string;
}) {
  if (items.length === 0) return null;

  return (
    <Reveal className="rounded-xl border border-line bg-surface/50 p-5 sm:p-6">
      <h3
        className="mb-4 font-mono text-[10.5px] uppercase tracking-[0.25em]"
        style={{ color }}
      >
        {title}
      </h3>
      <ul className="space-y-4">
        {items.map((item) => (
          <li key={`${item.org}-${item.title}`}>
            <div className="flex flex-wrap items-baseline justify-between gap-x-3">
              <span className="text-[15px] text-fg">{item.title}</span>
              {item.period && (
                <span className="font-mono text-[11px] tabular text-faint">
                  {item.period}
                </span>
              )}
            </div>
            <div className="text-sm text-muted">{item.org}</div>
            {item.detail && (
              <div className="mt-1 text-[13px] leading-relaxed text-faint">
                {item.detail}
              </div>
            )}
          </li>
        ))}
      </ul>
    </Reveal>
  );
}

export default function Extract() {
  const [view, setView] = useState<"rendered" | "json">("rendered");

  return (
    <section
      id="extract"
      className="relative mx-auto max-w-6xl scroll-mt-20 px-5 py-24 sm:py-32 lg:pl-24"
    >
      <SectionHeader stage={stage}>
        Every claim below came off the sheet above — organisation, role, dates,
        and what actually shipped.
      </SectionHeader>

      <div className="mb-8 flex items-center justify-between gap-4">
        <span className="font-mono text-[11px] text-faint">
          {profile.experience.length} record
          {profile.experience.length === 1 ? "" : "s"} extracted
        </span>

        <div
          role="tablist"
          aria-label="View mode"
          className="inline-flex rounded-full border border-line bg-surface p-1 font-mono text-[11px]"
        >
          {(["rendered", "json"] as const).map((mode) => (
            <button
              key={mode}
              role="tab"
              aria-selected={view === mode}
              onClick={() => setView(mode)}
              className={`rounded-full px-3.5 py-1.5 transition-colors ${
                view === mode ? "bg-fg text-bg" : "text-muted hover:text-fg"
              }`}
            >
              {mode === "json" ? "{ } json" : "rendered"}
            </button>
          ))}
        </div>
      </div>

      {view === "json" ? (
        <JsonView />
      ) : profile.experience.length === 0 ? (
        <p className="rounded-xl border border-dashed border-line px-5 py-10 text-center font-mono text-xs text-faint">
          no records yet — awaiting resume
        </p>
      ) : (
        <>
          <ol className="space-y-6">
            {profile.experience.map((record, i) => (
              <RecordCard key={record.org + i} record={record} index={i} />
            ))}
          </ol>

          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            <CredentialList
              title="Education"
              items={profile.education}
              color="var(--s4)"
            />
            <CredentialList
              title="Leadership"
              items={profile.leadership}
              color="var(--s5)"
            />
          </div>
        </>
      )}
    </section>
  );
}
