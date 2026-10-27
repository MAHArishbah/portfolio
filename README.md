# Portfolio — pipeline edition

A personal site built around a five-stage data-pipeline conceit: a résumé is
ingested, extracted into records, embedded into a filterable map of work,
evaluated against numbers, and finally retrieved as contact details.

Next.js 16 (App Router, static export) · React 19 · Tailwind CSS v4 ·
Fraunces / Inter Tight / JetBrains Mono.

## Running it

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # static export into ./out
npm run typecheck
```

`next.config.ts` sets `output: "export"`, so `npm run build` produces a plain
static `out/` directory — drag it onto Netlify, or point any static host at it.

## Editing the content

**Everything the site shows lives in [`content/profile.ts`](content/profile.ts).**
There is no CMS and no other place to look. The shape is typed, so the editor
will tell you if a field is missing.

| Field | Shows up in |
| --- | --- |
| `firstName`, `lastName`, `handle` | hero, top bar, résumé header |
| `location`, `email`, `github`, `linkedin` | hero sheet, retrieve, footer, résumé |
| `headline` | the large serif line in the hero — `em: "s1".."s5"` tints a fragment |
| `roleLine`, `blurb` | hero copy, page metadata, résumé subtitle |
| `log` | the terminal block in the hero |
| `experience` | stage 02, the ingested sheet, résumé, stage-03 map |
| `education`, `leadership` | stage 02, résumé |
| `projects` | stage 03 map, ⌘K palette, résumé |
| `metrics`, `honours`, `stack` | stage 04, résumé |
| `honours` | also stage-03 map nodes |

Stage names, numbers, colours, and headlines live in the `stages` array in the
same file.

### The stage-03 map

`clusters` (also in `profile.ts`) defines the map's regions: name, colour, and
centre as a percentage of the canvas. Anything with a `cluster` (roles,
honours) or a `category` (projects) matching a region name becomes a node in
it. **Omit `cluster` on an experience entry to keep that role off the map** —
Infosys is set up that way, since it had one node and nothing to sit near.

`short` is the chip label; `meta` and the full blurb show in the panel below.
Node positions are derived in [`content/graph.ts`](content/graph.ts).

## Structure

```
app/
  layout.tsx          fonts, metadata, grain overlay
  globals.css         design tokens, texture, motion, print rules
  page.tsx            assembles the five stages
  resume/page.tsx     one-page printable résumé from the same data
components/
  Chrome.tsx          top bar, vertical stage rail, scroll tracking, theme
  ParticleField.tsx   the canvas dust cloud behind the stage-03 map
  Reveal.tsx          scroll-triggered fade + lift
  SectionHeader.tsx   oversized serif stage numeral
  stages/             Ingest, Extract, Embed, Evaluate, Retrieve
content/
  profile.ts          all content
  graph.ts            map layout — node positions and the drift offsets
```

## About the map

It is a **hand-authored layout, not a computed embedding.** No embedding model
runs, and nothing is projected with UMAP or t-SNE. Regions are placed by hand
in `clusters`, and each node sits on a jittered ring around its region's
centre, with the jitter drawn from a hash of the node's id so the server and
the client render identical positions. It is a diagram that borrows the look
of a latent space.

To make it real, you would embed each node's text with a sentence model,
reduce to 2-D, normalise to percentages, and write the result into
`graph.ts` as static coordinates at build time — the rendering layer would not
have to change.

## About the stage-05 search

Also **not embeddings** — the name "retrieve" invites the assumption, so it says
so on the page. `score()` in `Retrieve.tsx` is term-frequency matching over each
document's title, value and keywords: every query term must appear for a
document to rank at all, repeats give diminishing returns, and a title hit or a
whole-phrase hit earns a bonus. It returns `null` for an empty query, so the
list shows the contact links with **no scores** rather than a row of
meaningless 1.00s. The index is the contact links plus every node on the
stage-03 map.

## Design notes

- **Palette.** A warm "tungsten lab" base rather than neon-on-black. The five
  stage accents run warm to cool (`--s1` ochre → `--s5` slate blue) so the
  pipeline reads as cooling down as data resolves.
- **Dark by default**, with a warm-paper light mode. Light applies when the OS
  asks for it, and the ☀/☾ button pins a choice in `localStorage` via
  `data-theme` on `<html>`.
- **The rail is the scrollbar.** The vertical ticks on the left both navigate
  and show progress — the spine fills through the ramp as you scroll.
- **The ingested sheet** is annotated with dashed layout-detection boxes and
  confidence tags, pulling real names off `profile.experience` and
  `profile.projects`. Hovering a region fills the readout beneath it with the
  JSON that region "extracted" — and those objects are *derived from the same
  content the site renders*, so `records`, `with_source` and `terms` are real
  counts that move on their own when you edit `profile.ts`.
- **Region labels sit on their cloud, and chips get out of the way.** The map
  is laid out server-side, so nothing can be measured from the DOM; `graph.ts`
  carries a linear fit of the rendered pill widths (calibrated against the real
  thing, exact to ~0.1%) and pushes any chip that would land on the label out
  of a keep-out box — vertically where it can, sideways only when that lands
  on canvas. A chip pushed sideways into the clamp would come straight back
  onto the label, so that case falls through to a vertical push.
- **The map never sits still.** Each region rides its own slow Lissajous orbit
  (`idleDrift` in `graph.ts`), so the field keeps breathing with nothing
  selected. The canvas animates it in its own rAF loop; the chips and labels
  get it from a second loop in `Embed.tsx` that writes `style.translate`
  straight to the DOM — re-rendering 22 elements at 60fps through React would
  be waste. `translate` is a separate CSS property from `transform`, so it
  never fights a chip's hover scale. Both loops read
  `performance.now() / 1000`, so they stay in phase.
- **Selecting a region re-projects the field.** Every other region eases away
  from the selected one over 3.5s (`clusterOffset`), so the space opens up
  around what you asked for. That push rides on `left`/`top` with a CSS
  transition, underneath the idle orbit; the canvas eases at a matched rate.
- **The meters are honest about their axes.** Stage 04 carries project numbers
  only. The metrics are not mutually comparable, so each row declares its own
  scale and prints it under the bar, and the fill is always oriented so that
  *longer is better* — including the two rows where lower is the good
  direction. There is no shared x-axis and no baseline column.
- **Both modes clear AA for the coloured values.** Every stage hue sits at
  ≥6:1 on the dark card and ≥4.9:1 on the light one, so the metric values can
  wear their series colour and stay readable.
- **Motion respects `prefers-reduced-motion`** — every animation collapses to
  its final state.

## Accessibility

Stage rail is a labelled `<nav>` with `aria-current="step"`. Map chips are real
buttons, so the map is tabbable, and each carries a screen-reader suffix naming
its kind and region. The metrics table is a real `<table>` with a caption and
row headers, and the caption states how to read the bars. Decorative texture,
markers and the particle canvas are `aria-hidden`. Every animation —
reveals, the idle orbit, the re-projection — collapses under
`prefers-reduced-motion`.
