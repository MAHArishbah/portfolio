/**
 * Renders a value as syntax-coloured JSON. Deliberately tiny: the shapes here
 * are flat objects of strings, numbers and string arrays, so a split on the
 * token kinds is enough — no parser, no dependency.
 */
export default function JsonBlock({ value }: { value: unknown }) {
  const text = JSON.stringify(value, null, 2);

  // Capture, in order: a key (quoted string followed by a colon), any other
  // quoted string, a number, or a literal.
  const parts = text.split(
    /("(?:\\.|[^"\\])*"\s*:|"(?:\\.|[^"\\])*"|-?\d+(?:\.\d+)?|\btrue\b|\bfalse\b|\bnull\b)/g,
  );

  return (
    <pre className="overflow-x-auto whitespace-pre font-mono text-[11px] leading-[1.7] text-faint">
      {parts.map((part, i) => {
        if (!part) return null;

        // Odd indices are the captured tokens.
        if (i % 2 === 0) return <span key={i}>{part}</span>;

        if (part.endsWith(":")) {
          const name = part.slice(0, part.lastIndexOf('"') + 1);
          return (
            <span key={i}>
              <span className="text-s5">{name}</span>
              <span>{part.slice(name.length)}</span>
            </span>
          );
        }

        if (part.startsWith('"')) {
          return (
            <span key={i} className="text-s4">
              {part}
            </span>
          );
        }

        return (
          <span key={i} className="text-s1">
            {part}
          </span>
        );
      })}
    </pre>
  );
}
