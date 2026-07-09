# Design Notes — cyberphysics.ai

Onboarding for whoever (or whatever) works on this next. Everything here reflects
the shipped code; when in doubt, the code wins.

## The theme

**1940s–1960s atomic-age science fiction, in monochrome.** The page is deep space
with film grain, faint CRT scanlines, a vignette, and a thin title-card keyline
fixed around the viewport. The lectures section is the one diegetic object from
an earlier design phase we deliberately kept: a framed **blackboard** with chalk
handwriting, wobbly hand-drawn cards, and a chalk tray. Everything else speaks
the sci-fi dialect: control-panel buttons with double keylines that invert on
hover, typewriter stamps, oscilloscope dividers with a traveling pulse, a
film-sprocket strip above the "The End" footer credits.

The site's motif is **the blockchain and the double helix** (plus golden
Fibonacci spirals and tiny atoms): self-assembling, traveling, expanding across
every screen. The hero atom is modeled on the project logo.

## Color

Grayscale only, defined as CSS custom properties in `:root` (`css/style.css`):

- `--void #0a0b0d` page black · `--ink #0d0e10` panel fill
- `--starlight #eceae4` titles/bright lines · `--silver #b8b6b1` body
- `--gray #8b8985` dimmed · board tones `--board/--chalk/--chalk-dim/--frame/--tray`
- **The single color exception:** `#f29fc5` pink chalk, used *only* for the
  Uniswap unicorn's mane (reads as a stick of colored chalk; Uniswap brand nod).

## Type

Four Google Fonts, each with a job:

| Font | Role |
| --- | --- |
| **Michroma** | Display: masthead, headings, nav, buttons (60s aerospace voice) |
| **Old Standard TT** | Body serif (early-20th-century scientific journal) |
| **Special Elite** | Typewriter: kickers, stamps, captions, footer |
| **Caveat** | Chalk handwriting — only on the blackboard + acquire links |

## Page structure (`index.html`)

1. **Hidden SVG defs** — chalk displacement filters (`#chalk-rough`, `#chalk-fine`),
   marble filter for the notebook cover, gradient kit (`g-star`, `g-electron`,
   `g-halo`, `g-sphere`, `g-disk`, `g-trail`, `g-sheen`), soft blurs.
2. **Ambient field** — fixed, full-viewport, pointer-events none, `z` between the
   grain and content. 20 travelers (see below).
3. **Header** — absolute over the hero stage. Nav ends with the bordered
   `.nav-cta` "Acquire CPHY" pill → `#token` (no separate Token tab — the pill
   covers it). A second, smaller social-glyph row rides beneath the tabs.
4. **Hero** — FIG. 1 fills the whole first viewport (`.hero-board`, 100dvh flex
   column, viewBox `0 0 560 520`); the hand-drawn chalk Octocat "Open-source
   Git suite" link lives *inside* the plate beneath the caption row,
   attribute-styled like the Field Guide; the copy block (kicker → masthead →
   subheader → mission tagline → CTAs) sits below the fold.
5. **Lectures** — the blackboard object: four lecture cards wired to X video
   posts with subject-matched sketches, the chalk Uniswap buy button, the tray.
6. **Transmissions** — Token panel ("Now transmitting", Virtuals acquire link with
   the chalk-traced Virtuals swallow) and Docs panel (still pending).
7. **About** — halftone "Science fact" panel.
8. **Footer** — film strip, "The End … or only the beginning?", Acquire CPHY
   links (Virtuals/Uniswap), contact addresses.

## FIG. 1 anatomy (hero SVG, viewBox `0 0 560 480`)

- **The frame assembles clockwise around the atom**: 9-cube blockchain across the
  top (y=58, x 80→520, assembling left→right), an 11-segment helix growing *down*
  the right flank, a bottom chain assembling right→left (y=412), a helix growing
  *up* the left flank. Group phase offsets via `--gdel` (0s/2s/4s/6s) on a shared
  18s cycle: build → hold → dissolve → rebuild.
- **The atom** (center 300,235) is logo-modeled with a **combination-lock hub**:
  dial labels 0–42 in steps of 6; the `lock-dial` keyframes spin left, pause,
  right, pause, then land at `rotate(45deg)` — which parks **42** under the fixed
  index pointer — and rest there ~24% of a 16s cycle. `.dial-flash` brightens the
  pointer on landing. The whole atom precesses (140s). Electrons are SMIL
  `animateMotion` comets with `rotate="auto"` trails riding the orbit paths.
- **The caption row**: `EXPLORE AI MANHATTAN PROJECT FILES` + two tiny
  counter-spinning atoms stacked as a trailing colon, then the marbled
  composition notebook (**Architect's Field Guide**) linking to the NotebookLM
  notebook (`6486b26c-946a-4840-a5a7-368c3891a54c`), opening in a new tab.

## Animation architecture

Everything follows one contract: **no JS → full static page; reduced motion →
full static page; JS + motion → things draw, assemble, travel.**

- **Draw-in system**: elements marked `data-draw` (strokes) or `data-write`
  (fills/text) inside an `svg.chalk-anim`. `js/main.js#prepareChalk` measures
  stroke lengths (`--len`) and staggers `--delay`s in DOM order. Reveal happens
  when an `IntersectionObserver` (threshold **0.08** — tall elements never hit
  higher thresholds) adds `.on`. A **2.5s safety net** reveals everything if the
  observer never fires (it can stall in embedded/throttled contexts). Initial
  hidden states are gated behind the `js-anim` class on `<html>`, so no-JS
  visitors see everything. Dimmed elements end at `opacity: var(--fo)` — the
  `chalk-in` keyframes would otherwise force opacity 1.
- **Self-assembly loops** (used in FIG. 1 *and* the ambient field, pure CSS):
  - Blockchains: `.bc-cube` / `.bc-link` with per-element `--ci` index →
    `chain-pop`/`chain-link` keyframes; delays `calc(var(--ci) * var(--cstep) +
    var(--gdel))`. Any chain length works.
  - Helixes: strands are `.helix-grow` with `pathLength="100"` and dash-drawn by
    `draw-grow`; rungs are `.helix-rung` popped in sequence by `rung-pop` with
    `--rstep ≈ 0.55 × duration / rungCount` so they track the growth front.
  - Spirals: golden-spiral quarter-arc paths (Fibonacci radii ×4: 4,4,8,12,20,32,52,
    and one giant ending at **84**), drawn by the same `draw-grow`, spinning via
    `.spiral-spin` (`--sdur`).
  - Mini atoms: `.mini-atom` rosette precesses; each ring carries an **opposed
    pair** of dots in a `.dot-spin` rig — the pair keeps the rig's fill-box
    centered on the atom so `transform-origin: center` rotation works, and the
    rig sits inside a `scale(1, 0.364)` wrapper so circular rotation traces the
    elliptical orbit.
- **Ambient travelers**: `.traveler.t1`–`.t20`, each with its own `travel-N`
  keyframes (route across the 1200×800 viewBox in user units, scale expansion,
  rotation) and a **negative animation-delay** so the fleet is phase-scattered on
  load. Census: 5 helixes (6/8/8/8/10 segments), 5 blockchains (4/6/6/6/8 cubes),
  5 spirals (incl. one mirrored, one radius-84), 5 spinning atoms. Opacities
  .13–.3; solid panels occlude them by design. The ambient SVG has
  `class="chalk-anim on"` hardcoded — its loops run without JS.
- **Text materializer**: `MAT_TARGETS` in `main.js` lists selectors whose text is
  split into `.w` word spans (`--wi` index; the masthead splits into *characters*
  and gets an `aria-label`). `chalk-word` fades each word in with blur + a
  brightness bloom; each word's `::after` is a falling **chalk-dust puff**
  (`chalk-dust`). Per-element `--step` is clamped so long paragraphs finish ≤ ~2s.
- **Misc**: `.drift` (slow float, used on the notebook), `.twinkle` stars,
  oscilloscope `.scope-pulse`, `.reveal` section fades.

## SVG gotchas we learned the hard way

- **CSS `transform` replaces the SVG `transform` attribute.** Never animate an
  element that carries a positioning `transform="translate(…)"` — nest a group:
  outer keeps the attribute, inner gets the CSS animation.
- `transform-box: fill-box; transform-origin: center` is unreliable when the
  box's contents move (electrons) or are asymmetric (single orbiting dot) — use
  explicit view-box origins (`transform-origin: 300px 235px`) or balance the
  bbox (opposed dot pairs).
- Two animations on one element need one combined `animation:` declaration;
  equal-specificity rules are resolved by stylesheet order.
- `pathLength="100"` normalizes dash math for grow/draw loops.
- **Stale-CSS survival**: hosts/CDNs (Hostinger et al.) can serve fresh HTML
  with a cached old `style.css`, so any element depending on *brand-new* CSS
  classes renders unstyled (default blue links, unconstrained SVGs). New
  interactive elements go **inside the hero SVG with presentation attributes**
  (fills, strokes, font attrs) — CSS is enhancement only. That's why the Field
  Guide and Octocat links can't break.

## Integrations (all `target="_blank" rel="noopener"`)

- **NotebookLM**: hero notebook → `notebooklm.google.com/notebook/6486b26c-…`.
- **Virtuals**: `app.virtuals.io/virtuals/37924` — Token panel acquire link with
  the official Virtuals swallow traced as chalk strokes (paths extracted verbatim
  from the brand SVG).
- **Uniswap**: swap on **Base**, output = canonical CPHY
  `0x08Df470d41C11Ba5Cb60242747D76C65Ca52c94c` (the only accepted token address),
  input VIRTUAL `0x0b3e328455c4059EEb9e3f84b5543F74E24e7E1b`. Chalk atom + white
  unicorn with the pink mane on the blackboard; everything illuminates on hover.
- Acquire routes exist in four places: nav pill, Token panel, blackboard, footer.

## Pending / next

- **Lecture cards are real now** — all four wired to X video posts
  (@MuseRhymes) with real titles and subject-matched chalk sketches
  (timechain vectors, modality matrix, token balance scale, ARC grid pair).
  A lecture detail template (board-framed embed + chalk transcript) remains
  a candidate.
- **Docs panel** carries the Architect's Field Guide link; deeper docs pending.
- Candidate: GitHub Pages deploy (static build via `npm run build`).

## Working conventions

- Verify visually in a real browser after changes; the draw-in takes a few
  seconds — screenshot after it settles.
- Keep everything monochrome except the unicorn's mane.
- Honor the no-JS and reduced-motion contracts when adding any new animation:
  gate hidden states behind `.js-anim`/`.on`, add a reduced-motion override.
