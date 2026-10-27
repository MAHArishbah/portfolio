import Chrome from "@/components/Chrome";
import Ingest from "@/components/stages/Ingest";
import Extract from "@/components/stages/Extract";
import Embed from "@/components/stages/Embed";
import Evaluate from "@/components/stages/Evaluate";
import Retrieve from "@/components/stages/Retrieve";
import { stages } from "@/content/profile";

/** A hairline hand-off marker between stages: 02 → 03. */
function Handoff({ from }: { from: number }) {
  const a = stages[from];
  const b = stages[from + 1];

  return (
    <div
      className="mx-auto flex max-w-6xl items-center gap-3 px-5 font-mono text-[10px] uppercase tracking-[0.25em] lg:pl-24"
      aria-hidden="true"
    >
      <span
        className="h-px flex-1"
        style={{
          background: `linear-gradient(to right, transparent, ${a.color})`,
        }}
      />
      <span className="tabular" style={{ color: a.color }}>
        {a.index}
      </span>
      <span className="text-faint">→</span>
      <span className="tabular" style={{ color: b.color }}>
        {b.index}
      </span>
      <span
        className="h-px flex-1"
        style={{ background: `linear-gradient(to left, transparent, ${b.color})` }}
      />
    </div>
  );
}

export default function Home() {
  return (
    <>
      <Chrome />
      <main className="min-h-screen overflow-x-clip">
        <Ingest />
        <Handoff from={0} />
        <Extract />
        <Handoff from={1} />
        <Embed />
        <Handoff from={2} />
        <Evaluate />
        <Handoff from={3} />
        <Retrieve />
      </main>
    </>
  );
}
