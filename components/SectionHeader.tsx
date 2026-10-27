import Reveal from "./Reveal";
import type { Stage } from "@/content/profile";

/**
 * Editorial stage header: an oversized serif numeral anchored to a rule, the
 * stage name in mono, then the headline. The numeral is the visual landmark —
 * it reads as a page number in a lab notebook.
 */
export default function SectionHeader({
  stage,
  children,
}: {
  stage: Stage;
  children?: React.ReactNode;
}) {
  return (
    <Reveal as="header" className="mb-10 lg:mb-14">
      <div className="flex items-end gap-5">
        <span
          className="display text-[clamp(3.5rem,9vw,7rem)] leading-[0.72] tabular"
          style={{ color: stage.color }}
          aria-hidden="true"
        >
          {stage.index}
        </span>

        <div className="flex-1 pb-2">
          <div className="flex items-center gap-3">
            <span
              className="h-px flex-1"
              aria-hidden="true"
              style={{
                background: `linear-gradient(to right, ${stage.color}, transparent)`,
              }}
            />
            <span
              className="font-mono text-[11px] uppercase tracking-[0.3em]"
              style={{ color: stage.color }}
            >
              {stage.label}
            </span>
          </div>
        </div>
      </div>

      <h2 className="display mt-6 max-w-3xl text-balance text-4xl leading-[1.05] sm:text-5xl lg:text-6xl">
        {stage.headline}
      </h2>

      {children && (
        <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-muted">
          {children}
        </p>
      )}
    </Reveal>
  );
}
