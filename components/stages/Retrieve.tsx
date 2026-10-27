"use client";

import { useMemo, useState } from "react";
import Reveal from "../Reveal";
import SectionHeader from "../SectionHeader";
import { nodes } from "@/content/graph";
import { fullName, profile, stages } from "@/content/profile";

const stage = stages[4];

type Doc = {
  label: string;
  value: string;
  href: string;
  kind: string;
  keywords: string;
};

/**
 * Words that carry no signal here. Without this, a natural question like
 * "how do i contact him" scores nothing: "how", "do", "i" and "him" appear in
 * no document, and requiring every term to match throws the whole query away.
 */
const STOP = new Set(
  `a an and are as at be by can could did do does for from get give had has have
   he her him his how i in into is it its me my of on or our should that the
   their them there these they this to was we what when where which who whom
   why will with would you your`.split(/\s+/),
);

/** Terms worth matching on, falling back to the raw words if all are stop. */
function terms(query: string) {
  const words = query.toLowerCase().split(/[^a-z0-9+#.]+/).filter(Boolean);
  const kept = words.filter((w) => w.length > 1 && !STOP.has(w));
  return kept.length ? kept : words;
}

/**
 * Lexical scoring — term frequency over the document's text, not embeddings.
 * A document ranks if it matches ANY meaningful term; matching more of them
 * scores higher, and a title or whole-phrase hit earns a bonus. Returns 0–1,
 * or null when there is nothing to score against, so the UI can show no number
 * rather than a misleading one.
 */
function score(query: string, doc: Doc): number | null {
  const q = query.trim().toLowerCase();
  if (!q) return null;

  const use = terms(q);
  if (use.length === 0) return null;

  const title = doc.label.toLowerCase();
  const hay = `${doc.label} ${doc.value} ${doc.keywords}`.toLowerCase();

  let matched = 0;
  let total = 0;

  for (const term of use) {
    const hits = hay.split(term).length - 1;
    if (hits === 0) continue;
    matched += 1;
    // Diminishing returns, so one long document can't dominate on repeats.
    total += Math.min(1, 0.55 + Math.log2(hits + 1) * 0.2);
    if (title.includes(term)) total += 0.35;
  }

  if (matched === 0) return 0;

  // Covering more of the query outranks a strong hit on one term alone.
  const coverage = matched / use.length;
  let s = (total / matched) * (0.45 + 0.55 * coverage);
  if (use.length > 1 && hay.includes(q)) s += 0.15;

  return Math.max(0, Math.min(1, s));
}

export default function Retrieve() {
  const [query, setQuery] = useState("");

  const contacts = useMemo<Doc[]>(
    () => [
      {
        label: "Email",
        value: profile.email,
        href: `mailto:${profile.email}`,
        kind: "contact",
        keywords:
          "contact reach out hire get in touch mail message write to him",
      },
      {
        label: "GitHub",
        value: profile.github.replace(/^https?:\/\/(www\.)?/, ""),
        href: profile.github,
        kind: "contact",
        keywords:
          "contact code source repos repositories projects commits open source profile",
      },
      {
        label: "LinkedIn",
        value: profile.linkedin.replace(/^https?:\/\/(www\.)?/, ""),
        href: profile.linkedin,
        kind: "contact",
        keywords:
          "contact network professional experience work history connect message hire recruiter",
      },
      {
        label: "Resume",
        value: "PDF, two pages",
        href: profile.resumeFile,
        kind: "contact",
        keywords: "contact cv pdf resume download print hire experience",
      },
    ],
    [],
  );

  /** Contacts plus everything on the stage-03 map, so this searches the site. */
  const docs = useMemo<Doc[]>(
    () => [
      ...contacts,
      ...nodes.map((n) => ({
        label: n.meta ?? n.label,
        value: n.cluster,
        href: n.links[0]?.url ?? "#embed",
        kind: n.kind === "honour" ? "realisation" : n.kind,
        keywords: `${n.label} ${n.detail} ${n.tags.join(" ")}`,
      })),
    ],
    [contacts],
  );

  const hasQuery = query.trim().length > 0;

  const ranked = useMemo(() => {
    if (!hasQuery) return contacts.map((d) => ({ ...d, s: null as number | null }));

    return docs
      .map((d) => ({ ...d, s: score(query, d) }))
      .filter((d) => (d.s ?? 0) > 0)
      .sort((a, b) => (b.s ?? 0) - (a.s ?? 0))
      .slice(0, 6);
  }, [contacts, docs, hasQuery, query]);

  return (
    <section
      id="retrieve"
      className="relative mx-auto max-w-6xl scroll-mt-20 px-5 py-24 sm:py-32 lg:pl-24"
    >
      <SectionHeader stage={stage}>
        End of the pipeline. Search everything on this page — term-frequency
        matching over the text, not embeddings — or just email me.
      </SectionHeader>

      <Reveal className="overflow-hidden rounded-xl border border-line bg-surface/55">
        {/* ---------- query bar ---------- */}
        <div className="flex items-center gap-3 border-b border-line bg-bg-deep/40 px-5 py-3.5 font-mono text-[12.5px]">
          <span style={{ color: stage.color }} aria-hidden="true">
            $
          </span>
          <label htmlFor="retrieve-q" className="sr-only">
            Query the contact index
          </label>
          <input
            id="retrieve-q"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="search — try 'lora', 'diffusion', 'pca'"
            spellCheck={false}
            autoComplete="off"
            className="w-full bg-transparent text-fg outline-none placeholder:text-faint"
          />
          <span className="hidden shrink-0 whitespace-nowrap text-[10.5px] text-faint sm:block">
            {hasQuery ? `top ${ranked.length} of ${docs.length}` : "lexical"}
          </span>
        </div>

        {/* ---------- results ---------- */}
        {ranked.length === 0 && (
          <p className="px-5 py-10 text-center font-mono text-[12px] text-faint">
            0 results for &ldquo;{query.trim()}&rdquo; · the index is this page,
            so try a tool, a model or a technique
          </p>
        )}

        <ol>
          {ranked.map((d, i) => (
            <li key={d.label} className="border-b border-line-soft last:border-0">
              <a
                href={d.href}
                target={d.href.startsWith("http") ? "_blank" : undefined}
                rel={d.href.startsWith("http") ? "noreferrer" : undefined}
                className="group flex items-center gap-4 px-5 py-4 transition-colors hover:bg-surface-2/50"
              >
                <span className="w-6 shrink-0 font-mono text-[11px] tabular text-faint">
                  {i + 1}
                </span>

                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[15px] text-fg">
                    {d.label}
                  </span>
                  <span className="block truncate font-mono text-[11.5px] text-muted">
                    <span className="text-faint">{d.kind}</span> · {d.value}
                  </span>
                </span>

                {/* Lexical match, shown only when there is a query to match. */}
                {d.s !== null && (
                  <span className="hidden w-28 shrink-0 items-center gap-2 sm:flex">
                    <span
                      className="h-[3px] flex-1 overflow-hidden rounded-full"
                      style={{ background: "var(--line)" }}
                      aria-hidden="true"
                    >
                      <span
                        className="block h-full rounded-r-full transition-[width] duration-300"
                        style={{
                          width: `${Math.round(d.s * 100)}%`,
                          background: stage.color,
                        }}
                      />
                    </span>
                    <span className="w-8 font-mono text-[10.5px] tabular text-faint">
                      {d.s.toFixed(2)}
                    </span>
                  </span>
                )}

                <span
                  className="shrink-0 font-mono text-xs text-faint transition-transform group-hover:translate-x-0.5"
                  aria-hidden="true"
                >
                  →
                </span>
              </a>
            </li>
          ))}
        </ol>
      </Reveal>

      {/* ---------- footer ---------- */}
      <footer className="mt-20 flex flex-col gap-4 border-t border-line pt-8 font-mono text-[11px] text-faint sm:flex-row sm:items-center sm:justify-between">
        <span className="flex items-center gap-2">
          <span className="flex gap-1" aria-hidden="true">
            {stages.map((s) => (
              <span
                key={s.id}
                className="size-1.5 rounded-full"
                style={{ background: s.color }}
              />
            ))}
          </span>
          5/5 stages · {fullName}
        </span>

        <span className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <a
            href={profile.github}
            target="_blank"
            rel="noreferrer"
            className="transition-colors hover:text-fg"
          >
            GitHub
          </a>
          <a
            href={profile.linkedin}
            target="_blank"
            rel="noreferrer"
            className="transition-colors hover:text-fg"
          >
            LinkedIn
          </a>
          <a
            href={`mailto:${profile.email}`}
            className="transition-colors hover:text-fg"
          >
            Email
          </a>
          <a
            href={profile.resumeFile}
            target="_blank"
            rel="noreferrer"
            className="transition-colors hover:text-fg"
          >
            Resume
          </a>
        </span>
      </footer>
    </section>
  );
}
