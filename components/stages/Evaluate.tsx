import Reveal from "../Reveal";
import SectionHeader from "../SectionHeader";
import { profile, stages } from "@/content/profile";

const stage = stages[3];

function Metrics() {
  if (profile.metrics.length === 0) return null;

  return (
    <Reveal className="overflow-hidden rounded-xl border border-line bg-surface/55">
      <div className="grid grid-cols-[1fr_auto] items-center gap-5 border-b border-line bg-bg-deep/40 px-5 py-3 font-mono text-[10.5px] uppercase tracking-[0.18em] text-faint sm:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_7rem]">
        <span>metric</span>
        <span className="hidden sm:block">scale</span>
        <span className="text-right">result</span>
      </div>

      <table className="w-full table-fixed text-left">
        <caption className="sr-only">
          Measured results from personal projects. Each bar is drawn on its own
          scale, printed beneath it; a longer bar always means a better result.
        </caption>
        <tbody>
          {profile.metrics.map((m) => (
            <tr key={m.name} className="border-b border-line-soft last:border-0">
              <th
                scope="row"
                className="w-[46%] px-5 py-5 align-top text-[14.5px] font-normal text-fg"
              >
                {m.name}
                <span className="mt-1 block text-[12.5px] font-normal leading-relaxed text-faint">
                  {m.note}
                </span>
              </th>

              {/* The meter. Track is a tone-on-tone step of the row's own hue,
                  so the unfilled part still reads as part of the mark. */}
              <td className="hidden px-5 py-5 align-middle sm:table-cell">
                <span
                  className="block h-[6px] w-full overflow-hidden rounded-full"
                  style={{
                    background: `color-mix(in oklab, ${m.color} 16%, transparent)`,
                  }}
                >
                  <span
                    className="block h-full rounded-r-[4px]"
                    style={{
                      width: `${Math.round(m.fill * 100)}%`,
                      background: m.color,
                    }}
                  />
                </span>
                <span className="mt-2 block font-mono text-[10px] tracking-wide text-faint">
                  {m.scale}
                </span>
              </td>

              <td className="w-[7.5rem] whitespace-nowrap px-5 py-5 align-middle text-right">
                <span
                  className="font-mono text-[17px] font-medium"
                  style={{ color: m.color }}
                >
                  {m.value}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Reveal>
  );
}

function Honours() {
  if (profile.honours.length === 0) return null;

  return (
    <Reveal delay={0.08} className="rounded-xl border border-line bg-surface/55 p-5 sm:p-6">
      <h3 className="mb-4 font-mono text-[10.5px] uppercase tracking-[0.25em] text-faint">
        realisations along the way
      </h3>
      <ul className="space-y-3">
        {profile.honours.map((h) => (
          <li
            key={h.short}
            className="grid grid-cols-[16px_1fr] gap-2.5 text-[14.5px] leading-relaxed text-muted"
          >
            <span
              className="mt-[9px] h-1.5 w-1.5 rounded-full"
              aria-hidden="true"
              style={{
                background: `color-mix(in oklab, ${stage.color} 70%, transparent)`,
              }}
            />
            {h.text}
          </li>
        ))}
      </ul>
    </Reveal>
  );
}

function Stack() {
  const groups = Object.entries(profile.stack);
  if (groups.length === 0) return null;

  return (
    <Reveal
      delay={0.12}
      className="overflow-hidden rounded-xl border border-line bg-surface/55"
    >
      <div className="flex items-center gap-2 border-b border-line bg-bg-deep/40 px-5 py-2.5 font-mono text-[10.5px] text-faint">
        <span className="flex gap-1.5" aria-hidden="true">
          <span className="size-2 rounded-full bg-s2/70" />
          <span className="size-2 rounded-full bg-s1/70" />
          <span className="size-2 rounded-full bg-s4/70" />
        </span>
        <span className="ml-1">requirements.txt</span>
      </div>

      <div className="p-5 font-mono text-[12px] leading-relaxed">
        {groups.map(([group, items]) => (
          <div key={group} className="mb-4 last:mb-0">
            <div className="text-faint"># {group}</div>
            <div className="flex flex-wrap gap-x-3 gap-y-1 text-muted">
              {items.map((item) => (
                <span key={item} className="transition-colors hover:text-fg">
                  {item}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Reveal>
  );
}

export default function Evaluate() {
  const empty =
    profile.metrics.length === 0 &&
    profile.honours.length === 0 &&
    Object.keys(profile.stack).length === 0;

  return (
    <section
      id="evaluate"
      className="relative mx-auto max-w-6xl scroll-mt-20 px-5 py-24 sm:py-32 lg:pl-24"
    >
      <SectionHeader stage={stage}>
        Numbers from the projects, not from work I can&apos;t show you. Each bar
        sits on its own scale, printed underneath — longer is always better.
      </SectionHeader>

      {empty ? (
        <p className="rounded-xl border border-dashed border-line px-5 py-10 text-center font-mono text-xs text-faint">
          no metrics recorded yet — awaiting resume
        </p>
      ) : (
        <div className="space-y-6">
          <Metrics />
          <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
            <Stack />
            <Honours />
          </div>
        </div>
      )}
    </section>
  );
}
