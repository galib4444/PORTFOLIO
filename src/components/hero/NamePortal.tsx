"use client";

/**
 * Scroll-driven camera through the hero name. Adapted from Glyph Portal
 * © 2026 Christian Katzmann, MIT (https://ktzm.dk) - the ink scan and the
 * clipped-camera maths are theirs. Unlike the original, this draws nothing of
 * its own at rest: it measures the real <h1> and only takes over once the page
 * scrolls, so the hero's first frame is exactly the designed one.
 */
import { useEffect, useId, useRef, type RefObject } from "react";

const clamp = (n: number, a = 0, b = 1) => Math.min(b, Math.max(a, n));
const smooth = (a: number, b: number, n: number) => {
  const t = clamp((n - a) / (b - a));
  return t * t * (3 - 2 * t);
};

/** Share of the scroll spent zooming; the rest holds inside the letter. */
const ZOOM_END = 0.7;
/** Scroll window over which the landing copy fades in, once inside. */
const REVEAL: [number, number] = [0.72, 0.82];
/** How far past the viewport's diagonal the letter's interior has to grow. */
const OVERSHOOT = 1.35;

/** One letter the camera can fly through (panel px). */
type Candidate = {
  /** "line:index" - stable across re-measures, so a hovered choice survives. */
  key: string;
  /** Point inside the ink, and the radius of clear ink around it. */
  x: number;
  y: number;
  r: number;
  /** The letter's box, for hover hit-testing. */
  left: number;
  right: number;
  top: number;
  bottom: number;
};

type Geometry = {
  W: number;
  H: number;
  candidates: Candidate[];
  /** The default: a big letter near the middle, not simply the biggest. */
  fallback: string;
  /** Top-left of the heading's box, where its gradient starts (panel px). */
  nx: number;
  ny: number;
};

/** Largest opaque square in one glyph, in linear time. Units are a 100px font. */
function interior(context: CanvasRenderingContext2D, char: string, font: string) {
  const canvas = context.canvas;
  context.font = font;
  const m = context.measureText(char);
  const pad = 8;
  const left = Math.ceil(m.actualBoundingBoxLeft);
  const ascent = Math.ceil(m.actualBoundingBoxAscent);
  canvas.width = Math.max(1, Math.ceil(m.actualBoundingBoxLeft + m.actualBoundingBoxRight) + pad * 2);
  canvas.height = Math.max(1, Math.ceil(m.actualBoundingBoxAscent + m.actualBoundingBoxDescent) + pad * 2);
  context.font = font;
  context.fontKerning = "none";
  context.fillText(char, pad + left, pad + ascent);
  const { width, height } = canvas;
  const pixels = context.getImageData(0, 0, width, height).data;
  const rows = new Uint16Array(width + 1);
  let size = 0, bx = 0, by = 0;
  for (let y = 0; y < height; y++) {
    let diagonal = 0;
    for (let x = 0; x < width; x++) {
      const above = rows[x + 1];
      rows[x + 1] = pixels[(y * width + x) * 4 + 3] > 245 ? Math.min(above, rows[x], diagonal) + 1 : 0;
      diagonal = above;
      if (rows[x + 1] > size) { size = rows[x + 1]; bx = x; by = y; }
    }
  }
  if (size < 3) return null;
  // Scanned at 3x a 100px font; inscribe a disk with room for raster disagreement.
  return {
    x: (bx + 1 - size / 2 - pad - left) / 3,
    y: (by + 1 - size / 2 - pad - ascent) / 3,
    radius: (size / 2 - 1) / 3,
  };
}

interface NamePortalProps {
  /** The tall section whose scroll drives the zoom. */
  sectionRef: RefObject<HTMLElement | null>;
  /** The sticky, rounded hero panel the camera works inside. */
  panelRef: RefObject<HTMLDivElement | null>;
  /** The real name heading. Each line is a text node followed by a [data-baseline] probe. */
  nameRef: RefObject<HTMLHeadingElement | null>;
  /** Lines of the name, in the same order as the heading's text nodes. */
  lines: string[];
}

export function NamePortal({ sectionRef, panelRef, nameRef, lines }: NamePortalProps) {
  const clipId = `name-portal-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const svgRef = useRef<SVGSVGElement>(null);
  const clipRef = useRef<SVGClipPathElement>(null);
  const fieldRef = useRef<HTMLDivElement>(null);
  const nameFillRef = useRef<HTMLDivElement>(null);
  const landingRef = useRef<HTMLDivElement>(null);
  const textRefs = useRef<(SVGTextElement | null)[]>([]);

  useEffect(() => {
    const section = sectionRef.current;
    const panel = panelRef.current;
    const name = nameRef.current;
    const svg = svgRef.current;
    const clip = clipRef.current;
    const field = fieldRef.current;
    const nameFill = nameFillRef.current;
    const landing = landingRef.current;
    if (!section || !panel || !name || !svg || !clip || !field || !nameFill || !landing) return;

    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const context = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
    let geo: Geometry | null = null;
    let stale = true;
    let fontsReady = false;
    let raf = 0;
    /** The letter hovered before scrolling, if any. */
    let chosen: string | null = null;
    const inkCache = new Map<string, ReturnType<typeof interior>>();

    /** Copy the live heading into the clip path and pick the letter to fly through. */
    const measure = (): Geometry | null => {
      if (!context || !fontsReady) return null;
      const box = panel.getBoundingClientRect();
      const cs = getComputedStyle(name);
      const fontSize = parseFloat(cs.fontSize);
      const k = fontSize / 100;
      const scanFont = `${cs.fontWeight} 300px ${cs.fontFamily}`;
      const walker = document.createTreeWalker(name, NodeFilter.SHOW_TEXT);
      const nodes: Text[] = [];
      for (let n = walker.nextNode(); n; n = walker.nextNode()) {
        if ((n as Text).data.trim()) nodes.push(n as Text);
      }
      if (nodes.length !== lines.length) return null;

      const candidates: Candidate[] = [];
      const range = document.createRange();
      nodes.forEach((node, li) => {
        range.selectNodeContents(node);
        const lineRect = range.getBoundingClientRect();
        // A zero-size inline-block sits exactly on the baseline.
        const probe = node.nextElementSibling?.matches("[data-baseline]") ? node.nextElementSibling : null;
        const baseline = probe ? probe.getBoundingClientRect().top : lineRect.bottom - fontSize * 0.2;
        const text = textRefs.current[li];
        if (text) {
          text.setAttribute("x", String(lineRect.left - box.left));
          text.setAttribute("y", String(baseline - box.top));
          Object.assign(text.style, {
            fontFamily: cs.fontFamily,
            fontWeight: cs.fontWeight,
            fontSize: `${fontSize}px`,
            letterSpacing: cs.letterSpacing,
          });
        }
        for (let i = 0; i < node.data.length; i++) {
          const char = node.data[i];
          if (!char.trim()) continue;
          range.setStart(node, i);
          range.setEnd(node, i + 1);
          const charRect = range.getBoundingClientRect();
          const origin = charRect.left - box.left;
          const cacheKey = `${scanFont}|${char}`;
          if (!inkCache.has(cacheKey)) inkCache.set(cacheKey, interior(context, char, scanFont));
          const found = inkCache.get(cacheKey);
          if (!found) continue;
          candidates.push({
            key: `${li}:${i}`,
            x: origin + found.x * k,
            y: baseline - box.top + found.y * k,
            r: found.radius * k,
            left: origin,
            right: charRect.right - box.left,
            top: lineRect.top - box.top,
            bottom: lineRect.bottom - box.top,
          });
        }
      });
      range.detach?.();
      if (!candidates.length) return null;

      // The name's gradient is laid across the heading's own box - match it exactly.
      // It sits at the panel's origin; paint() moves it there with the camera.
      const nameBox = name.getBoundingClientRect();
      nameFill.style.width = `${nameBox.width}px`;
      nameFill.style.height = `${nameBox.height}px`;
      svg.setAttribute("viewBox", `0 0 ${box.width} ${box.height}`);
      const nx = nameBox.left - box.left, ny = nameBox.top - box.top;
      // Any letter with a generous interior will do; take the one nearest the
      // middle of the name, so the default dive isn't pinned to one end.
      const biggest = Math.max(...candidates.map((c) => c.r));
      const cx = nx + nameBox.width / 2, cy = ny + nameBox.height / 2;
      const fallback = candidates
        .filter((c) => c.r >= biggest * 0.75)
        .sort((a, b) => Math.hypot(a.x - cx, a.y - cy) - Math.hypot(b.x - cx, b.y - cy))[0].key;
      return { W: box.width, H: box.height, candidates, fallback, nx, ny };
    };

    const progress = () => {
      const rect = section.getBoundingClientRect();
      const travel = rect.height - window.innerHeight;
      return travel > 0 ? clamp(-rect.top / travel) : 0;
    };

    const rest = () => {
      field.style.opacity = "0";
      name.style.visibility = "";
      panel.style.setProperty("--hero-fade", "1");
      panel.style.setProperty("--hero-hit", "auto");
      panel.style.setProperty("--hero-reveal", "0");
      panel.style.setProperty("--hero-inside-hit", "none");
    };

    const paint = () => {
      raf = 0;
      const p = motion.matches ? 0 : progress();
      // At the very top the real heading shows. Re-measure on the way back in,
      // so the clip copy always matches wherever the layout has settled.
      if (p <= 0) { rest(); stale = true; return; }
      if (stale || !geo) { geo = measure(); stale = false; }
      if (!geo) { rest(); return; }
      const { W, H, nx, ny, candidates, fallback } = geo;
      const target = candidates.find((c) => c.key === chosen) ?? candidates.find((c) => c.key === fallback)!;
      const { x: tx, y: ty, r } = target;

      const t = clamp(p / ZOOM_END);
      const eased = t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2;
      const end = Math.max(1, Math.hypot(W, H) / (r * OVERSHOOT));
      const s = end ** eased;
      // Slide the chosen point to the centre as the camera closes in (the portal's 1/s blend).
      const blend = end === 1 ? 0 : (1 - 1 / s) / (1 - 1 / end);
      const ax = tx + (W / 2 - tx) * blend;
      const ay = ty + (H * 0.46 + H * 0.04 * eased - ty) * blend;
      const roll = -4 * smooth(0.06, 0.5, t) * (1 - smooth(0.62, 0.92, t));
      // Scale lives on the clip; translation on the text, so huge type still paints.
      const rad = (roll * Math.PI) / 180;
      const dx = ax / s, dy = ay / s;
      clip.setAttribute("transform", `scale(${s}) rotate(${roll})`);
      const ux = Math.cos(rad) * dx + Math.sin(rad) * dy - tx;
      const uy = -Math.sin(rad) * dx + Math.cos(rad) * dy - ty;
      for (const text of textRefs.current) text?.setAttribute("transform", `translate(${ux} ${uy})`);
      // For the first moment the letters keep the heading's own gradient, riding
      // the camera so nothing shifts at the handover...
      nameFill.style.opacity = String(1 - smooth(0, 0.15, t));
      nameFill.style.transform =
        `translate(${ax}px, ${ay}px) scale(${s}) rotate(${roll}deg) translate(${nx - tx}px, ${ny - ty}px)`;

      field.style.opacity = "1";
      name.style.visibility = "hidden";
      // Everything else in the hero steps back as the camera moves off it.
      panel.style.setProperty("--hero-fade", String(1 - smooth(0.01, 0.16, p)));
      panel.style.setProperty("--hero-hit", p < 0.08 ? "auto" : "none");
      // ...then they turn into windows onto a scene that holds still behind them
      // and only drifts in slowly - the parallax is what makes the dive read as depth.
      landing.style.transform = `scale(${1 + 0.16 * smooth(0, ZOOM_END * 1.05, p)})`;
      const reveal = smooth(REVEAL[0], REVEAL[1], p);
      panel.style.setProperty("--hero-reveal", String(reveal));
      panel.style.setProperty("--hero-inside-hit", reveal > 0.9 ? "auto" : "none");
    };

    const schedule = () => { if (!raf) raf = requestAnimationFrame(paint); };
    const invalidate = () => { stale = true; schedule(); };

    // Before the dive starts, the letter under the cursor is the way in - as in
    // the original portal. The heading takes no pointer events, so hit-test here.
    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" || motion.matches || progress() > 0.02) return;
      if (stale || !geo) { geo = measure(); stale = false; }
      if (!geo) return;
      const box = panel.getBoundingClientRect();
      const x = event.clientX - box.left, y = event.clientY - box.top;
      const hit = geo.candidates.find((c) => x >= c.left && x <= c.right && y >= c.top && y <= c.bottom);
      if (hit) chosen = hit.key;
    };

    document.fonts.ready.then(() => { fontsReady = true; invalidate(); });
    // capture on document: the site scrolls <body>, whose scroll events never reach window
    document.addEventListener("scroll", schedule, { passive: true, capture: true });
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("resize", invalidate);
    motion.addEventListener("change", invalidate);
    const ro = new ResizeObserver(invalidate);
    ro.observe(panel);
    schedule();

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener("scroll", schedule, { capture: true });
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("resize", invalidate);
      motion.removeEventListener("change", invalidate);
      ro.disconnect();
      rest();
    };
  }, [sectionRef, panelRef, nameRef, lines]);

  return (
    <>
      <svg ref={svgRef} aria-hidden="true" focusable="false" className="absolute inset-0 w-full h-full pointer-events-none">
        <defs>
          <clipPath id={clipId} ref={clipRef} clipPathUnits="userSpaceOnUse">
            {lines.map((line, i) => (
              <text key={line} ref={(node) => { textRefs.current[i] = node; }}>
                {line}
              </text>
            ))}
          </clipPath>
        </defs>
      </svg>
      <div
        ref={fieldRef}
        aria-hidden="true"
        className="absolute inset-0 z-20 pointer-events-none opacity-0"
        style={{ clipPath: `url(#${clipId})` }}
      >
        {/* The scene behind the letters, and where the dive lands */}
        <div
          ref={landingRef}
          className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(255,200,120,0.45),transparent_40%),linear-gradient(135deg,#ff6b35_0%,#ff3b3b_100%)]"
        />
        {/* Same gradient, same box as the heading's .gradient-text */}
        <div ref={nameFillRef} className="absolute left-0 top-0 origin-top-left bg-[linear-gradient(135deg,#ff6b35,#ff3b3b)]" />
      </div>
    </>
  );
}
