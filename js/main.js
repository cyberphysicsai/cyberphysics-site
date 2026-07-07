// Cyberphysics — chalk animation conductor (v0.1)

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Prepare every chalk SVG: measure stroke lengths, assign staggered delays
// in DOM order so diagrams draw the way a hand would write them.
function prepareChalk(svg) {
  const marks = svg.querySelectorAll("[data-draw], [data-write]");
  let clock = 0;
  marks.forEach((el) => {
    if (el.hasAttribute("data-draw") && typeof el.getTotalLength === "function") {
      let len = 0;
      try {
        len = el.getTotalLength();
      } catch {
        len = 0;
      }
      el.style.setProperty("--len", `${Math.ceil(len)}`);
      el.style.setProperty("--delay", `${clock.toFixed(2)}s`);
      clock += Math.min(0.3, Math.max(0.06, len / 1600));
    } else {
      el.style.setProperty("--delay", `${clock.toFixed(2)}s`);
      clock += 0.09;
    }
  });
}

// ---- chalk text: split blocks into word/char spans that materialize on scroll ----

const MAT_TARGETS = [
  ".brand-name", ".site-nav a", ".kicker", ".masthead-sub", ".hero-tagline", ".hero-body",
  ".btn-panel", ".section-head h2", ".board-note", ".card-plate",
  ".card h3", ".card p", ".card-link", ".panel-stamp", ".panel h3",
  ".panel p", ".about-stamp", ".about h2", ".about-lede", ".about p",
  ".the-end", ".end-tease", ".footer-brand", ".footer-contact",
];

function wrapTextNodes(node, mode, counter) {
  [...node.childNodes].forEach((child) => {
    if (child.nodeType === Node.TEXT_NODE) {
      const parts =
        mode === "chars" ? child.textContent.split("") : child.textContent.split(/(\s+)/);
      const frag = document.createDocumentFragment();
      parts.forEach((part) => {
        if (!part) return;
        if (/^\s+$/.test(part)) {
          frag.appendChild(document.createTextNode(part));
          return;
        }
        const s = document.createElement("span");
        s.className = "w";
        s.style.setProperty("--wi", counter.i++);
        s.textContent = part;
        frag.appendChild(s);
      });
      child.replaceWith(frag);
    } else if (child.nodeType === Node.ELEMENT_NODE && child.tagName !== "BR") {
      wrapTextNodes(child, mode, counter);
    }
  });
}

function splitForChalk(el, mode) {
  const counter = { i: 0 };
  wrapTextNodes(el, mode, counter);
  if (!counter.i) return;
  const step = Math.max(28, Math.min(mode === "chars" ? 65 : 85, 1500 / counter.i));
  el.style.setProperty("--step", `${Math.round(step)}ms`);
  el.classList.add("txt-mat");
  if (mode === "chars") el.classList.add("txt-mat--chars");
}

const chalkSvgs = document.querySelectorAll("svg.chalk-anim");

if (!reducedMotion) {
  // Hidden initial states (opacity 0) only apply under this class, so
  // no-JS visitors always see the full page.
  document.documentElement.classList.add("js-anim");
  chalkSvgs.forEach(prepareChalk);

  const matSet = new Set(document.querySelectorAll(MAT_TARGETS.join(",")));
  const masthead = document.querySelector(".masthead");
  matSet.delete(masthead);
  matSet.forEach((el) => splitForChalk(el, "words"));
  if (masthead) {
    masthead.setAttribute("aria-label", masthead.textContent.trim());
    splitForChalk(masthead, "chars");
  }
} else {
  // SMIL orbit animations can't be stopped from CSS — remove them instead.
  document.querySelectorAll("animateMotion").forEach((el) => el.remove());
}

// Start drawing when a board enters view; reveal prose the same way.
const observer = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add("on");
        observer.unobserve(entry.target);
      }
    }
  },
  // Low threshold: tall elements (the blackboard) never reach 25% visible at once.
  { threshold: 0.08, rootMargin: "0px 0px -4% 0px" }
);

document.querySelectorAll("svg.chalk-anim, .reveal, .txt-mat").forEach((el) => {
  if (reducedMotion) {
    el.classList.add("on");
  } else {
    observer.observe(el);
  }
});

// Safety net: if the observer never fires (throttled tab, embedded contexts),
// reveal everything rather than leave the page blank.
setTimeout(() => {
  if (!document.querySelector(".on")) {
    document
      .querySelectorAll("svg.chalk-anim, .reveal, .txt-mat")
      .forEach((el) => el.classList.add("on"));
  }
}, 2500);
