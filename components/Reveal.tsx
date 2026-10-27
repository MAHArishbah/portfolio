"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  /** Seconds of stagger before this element animates in. */
  delay?: number;
  className?: string;
  as?: "div" | "li" | "section" | "header" | "article";
};

/**
 * Fades + lifts its children the first time they cross into view. Elements
 * stay revealed once shown, so scrolling back up doesn't re-trigger.
 */
export default function Reveal({
  children,
  delay = 0,
  className = "",
  as: Tag = "div",
}: Props) {
  const ref = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || shown) return;

    // Without IntersectionObserver there is no trigger, so show immediately
    // rather than leaving the content stuck at opacity 0.
    if (typeof IntersectionObserver === "undefined") {
      setShown(true);
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.08 },
    );

    io.observe(el);
    return () => io.disconnect();
  }, [shown]);

  return (
    <Tag
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ref={ref as any}
      className={`reveal ${className}`}
      data-shown={shown || undefined}
      style={{ "--delay": `${delay}s` } as React.CSSProperties}
    >
      {children}
    </Tag>
  );
}
