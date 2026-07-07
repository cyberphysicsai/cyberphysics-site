# cyberphysics.ai

The Cyberphysics website — lessons from the golden age of physics (1940–1965),
presented in glorious black and white.

A monochrome, atomic-age retro-futurist design: a logo-modeled atom with a
combination-lock hub, self-assembling blockchains and DNA double helixes framing
it, golden Fibonacci spirals and tiny spinning atoms drifting across every page,
chalk-materializing typography, and a blackboard lecture hall.

## Stack

Plain HTML / CSS / JS, no framework. [Vite](https://vitejs.dev) for the dev
server and build.

```bash
npm install
npm run dev      # dev server on :5173
npm run build    # static build to dist/
```

## Structure

- `index.html` — the whole page, including the hand-built SVG scenes
- `css/style.css` — design tokens + components + all animation systems
- `js/main.js` — draw-on choreography, scroll reveals, chalk-text splitter

All motion respects `prefers-reduced-motion`, and the page is fully readable
with JavaScript disabled.
