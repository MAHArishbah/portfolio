import { clusters, profile } from "./profile";

export type NodeKind = "project" | "role" | "honour";

export type GraphNode = {
  id: string;
  label: string;
  kind: NodeKind;
  cluster: string;
  /** Index into `clusters` — lets the renderers look up this node's orbit. */
  clusterIndex: number;
  color: string;
  detail: string;
  meta?: string;
  tags: string[];
  links: { label: string; url: string }[];
  /** Percent of canvas width / height. */
  x: number;
  y: number;
  /** Position on the tall, narrow map used on phones. */
  mx: number;
  my: number;
};

export const glyph: Record<NodeKind, string> = {
  project: "◆",
  role: "●",
  honour: "★",
};

/* -------------------------------------------------------------------------
   Deterministic pseudo-randomness
   Layout must be identical on the server and the client, so every offset is
   derived from a hash of the node id rather than Math.random.
   ------------------------------------------------------------------------- */

function hash(str: string) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i += 1) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function rng(seed: number) {
  let t = seed;
  return () => {
    t += 0x6d2b79f5;
    let x = t;
    x = Math.imul(x ^ (x >>> 15), x | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

const clusterByName = new Map(clusters.map((c) => [c.name, c]));

/* -------------------------------------------------------------------------
   Nodes
   ------------------------------------------------------------------------- */

type Raw = Omit<GraphNode, "x" | "y" | "mx" | "my" | "color" | "clusterIndex">;

const raw: Raw[] = [
  ...profile.experience
    .filter((x): x is typeof x & { cluster: string } => Boolean(x.cluster))
    .map((x) => ({
      id: `role:${x.org}`,
      label: x.short,
      kind: "role" as const,
      cluster: x.cluster,
      detail: x.bullets[0],
      meta: `${x.roles[0].title} · ${x.roles[0].period}`,
      tags: x.tags,
      links: [{ label: "see the full record ↓", url: "#extract" }],
    })),
  ...profile.projects.map((p) => ({
    id: `project:${p.name}`,
    label: p.short,
    kind: "project" as const,
    cluster: p.category,
    detail: p.blurb,
    meta: p.name,
    tags: p.tags,
    links: [
      ...(p.repo ? [{ label: "source ↗", url: p.repo }] : []),
      ...(p.demo
        ? [
            {
              label: p.demo.includes("colab.research.google.com")
                ? "open in Colab ↗"
                : "live app ↗",
              url: p.demo,
            },
          ]
        : []),
    ],
  })),
  ...profile.honours.map((h) => ({
    id: `honour:${h.short}`,
    label: h.short,
    kind: "honour" as const,
    cluster: h.cluster,
    detail: h.text,
    tags: h.tags ?? [],
    links: [],
  })),
];

/* -------------------------------------------------------------------------
   Text metrics
   The map is laid out on the server, so nothing can be measured from the DOM.
   These approximate the rendered pills closely enough to keep chips off the
   region label — all in canvas percent.
   ------------------------------------------------------------------------- */

/* Calibrated against the rendered pills at a 1150×680 canvas — a linear fit
   through the measured widths, exact to within 0.1% across every label. */
const LABEL_CHAR = 0.805; // region label: 11px mono at 0.22em tracking
const LABEL_PAD = 2.1; // its pill padding
const CHIP_CHAR = 0.61; // chip label: 11px mono, no extra tracking
const CHIP_PAD = 3.3; // glyph, space and pill padding
const HALF_H = 1.95; // half pill height — both pills are the same height

const labelHalfW = (name: string) => (name.length * LABEL_CHAR + LABEL_PAD) / 2;
const chipHalfW = (label: string) => (label.length * CHIP_CHAR + CHIP_PAD) / 2;

/**
 * Nodes are laid out on a ring around their cluster centre, stepping by index
 * so a cluster's members spread out instead of piling up. The region label
 * stays on the cloud at the centre; any chip that would land on top of it is
 * pushed clear along whichever axis costs less — which is almost always
 * vertical, since both pills are wide and short.
 */
const ringNodes = (() => {
  const byCluster = new Map<string, Raw[]>();
  for (const n of raw) {
    const list = byCluster.get(n.cluster) ?? [];
    list.push(n);
    byCluster.set(n.cluster, list);
  }

  const out: Omit<GraphNode, "mx" | "my">[] = [];

  for (const [name, members] of byCluster) {
    const centre = clusterByName.get(name);
    if (!centre) {
      // A cluster name that matches no region drops its nodes off the map
      // silently, which is a miserable thing to debug. Say so.
      throw new Error(
        `graph: ${members.length} node(s) reference cluster "${name}", which is ` +
          `not in profile.clusters (${clusters.map((c) => c.name).join(", ")}).`,
      );
    }
    const clusterIndex = clusters.findIndex((c) => c.name === name);
    const labelW = labelHalfW(name);

    members.forEach((n, i) => {
      const rand = rng(hash(n.id));

      // Roles anchor their cluster, so they sit close to the centre.
      const pull = n.kind === "role" ? 0.42 : 1;

      const angle =
        (i / members.length) * Math.PI * 2 + (rand() - 0.5) * 0.5 + clusterIndex;

      // Kept just inside one sigma of the cluster's particle cloud, so nodes
      // read as belonging to their region rather than floating off it.
      const rx = (11 + rand() * 5) * pull;
      const ry = (10 + rand() * 5) * pull;

      let dx = Math.cos(angle) * rx;
      let dy = Math.sin(angle) * ry;

      // Keep-out box around the region label. Pushing vertically is nearly
      // always the cheaper move, which is what we want: chips slide above and
      // below the label rather than being flung out to the cluster's edge.
      const needX = labelW + chipHalfW(n.label) + 1.4;
      const needY = HALF_H * 2 + 1.3;

      if (Math.abs(dx) < needX && Math.abs(dy) < needY) {
        const sideways = centre.x + (dx < 0 ? -1 : 1) * needX;
        // A sideways push that runs off the canvas gets clamped straight back
        // onto the label, so only take it when there is room to land.
        const canGoSideways = sideways >= 14 && sideways <= 86;

        if (!canGoSideways || needY - Math.abs(dy) <= needX - Math.abs(dx)) {
          dy = (dy < 0 ? -1 : 1) * needY;
        } else {
          dx = sideways - centre.x;
        }
      }

      // The clamp leaves room for the chip itself, which is centred on the
      // point — tighter bounds and a wide label runs off the canvas.
      out.push({
        ...n,
        clusterIndex,
        color: centre.color,
        x: clamp(centre.x + dx, 14, 86),
        y: clamp(centre.y + dy, 12, 88),
      });
    });
  }

  return out;
})();

/* -------------------------------------------------------------------------
   Phone layout
   At phone width the ring layout piles labels on top of each other. Here the
   regions zig-zag down a tall canvas and each region's chips are packed into
   rows directly above and below its label, so nothing can overlap.
   ------------------------------------------------------------------------- */

/* Sized for the narrowest canvas we expect (~270px, an iPhone SE): chips are
   10px mono, 6px a character, plus glyph, space, padding and border. */
const M_CHAR = 2.25;
const M_PAD = 11.2;
const M_GAP = 1.6;
const M_ROW = 4.1; // row pitch, ~31px on the 760px-tall phone canvas
/** Rows keep clear of the edges so the idle orbit can't push a chip off. */
const M_EDGE = 4;

const mChipW = (label: string) => label.length * M_CHAR + M_PAD;

export const mobileClusters = clusters.map((c, i) => ({
  ...c,
  x: i % 2 === 0 ? 36 : 64,
  y: 10 + i * 19,
}));

const mobileClusterByName = new Map(mobileClusters.map((c) => [c.name, c]));

function placeMobile(list: typeof ringNodes) {
  const pos = new Map<string, { x: number; y: number }>();

  for (const c of mobileClusters) {
    // Greedy row packing, widest first so the short labels fill the gaps.
    const members = list
      .filter((n) => n.cluster === c.name)
      .sort((a, b) => mChipW(b.label) - mChipW(a.label));
    const rows: (typeof members)[] = [];
    const rowW = (r: typeof members) =>
      r.reduce((w, m) => w + mChipW(m.label), 0) + M_GAP * (r.length - 1);

    for (const n of members) {
      const row = rows.find(
        (r) => rowW(r) + M_GAP + mChipW(n.label) <= 100 - 2 * M_EDGE,
      );
      if (row) row.push(n);
      else rows.push([n]);
    }

    // Rows alternate above and below the label: -1, +1, -2, +2, …
    rows.forEach((row, ri) => {
      const slot = (Math.floor(ri / 2) + 1) * (ri % 2 === 0 ? -1 : 1);
      let cursor = clamp(c.x - rowW(row) / 2, M_EDGE, 100 - M_EDGE - rowW(row));
      for (const n of row) {
        const w = mChipW(n.label);
        pos.set(n.id, { x: cursor + w / 2, y: c.y + slot * M_ROW });
        cursor += w + M_GAP;
      }
    });
  }

  return pos;
}

export const nodes: GraphNode[] = (() => {
  const mobile = placeMobile(ringNodes);
  return ringNodes.map((n) => {
    const m = mobile.get(n.id) ?? { x: n.x, y: n.y };
    return { ...n, mx: m.x, my: m.y };
  });
})();

export const nodeById = new Map(nodes.map((n) => [n.id, n]));

/* -------------------------------------------------------------------------
   Re-projection drift
   Selecting a region pushes every other region away from it, so the field
   slowly opens up around the thing you asked for. Returned in canvas percent;
   the canvas, the chips and the region labels all read the same number so
   they travel together.
   ------------------------------------------------------------------------- */

/**
 * Idle motion. Every region rides its own slow Lissajous orbit, so the field
 * keeps breathing when nothing is selected. `t` is seconds — pass
 * `performance.now() / 1000` everywhere so the canvas and the DOM agree.
 */
export function idleDrift(t: number, i: number) {
  return {
    dx: Math.sin(t * (0.085 + i * 0.017) + i * 1.9) * 3.1,
    dy: Math.cos(t * (0.067 + i * 0.013) + i * 2.6) * 2.4,
  };
}

const PUSH = 17;

export function clusterOffset(
  active: string | null,
  name: string,
  narrow = false,
) {
  if (!active || active === name) return { dx: 0, dy: 0 };

  const centres = narrow ? mobileClusterByName : clusterByName;
  const from = centres.get(active);
  const to = centres.get(name);
  if (!from || !to) return { dx: 0, dy: 0 };

  const vx = to.x - from.x;
  const vy = to.y - from.y;
  const len = Math.hypot(vx, vy) || 1;

  return { dx: (vx / len) * PUSH, dy: (vy / len) * PUSH };
}
