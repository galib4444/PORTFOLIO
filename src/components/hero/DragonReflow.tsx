"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import {
  layoutNextLine,
  prepareWithSegments,
  type LayoutCursor,
  type PreparedTextWithSegments,
} from "@chenglou/pretext";

/**
 * A hand-painted dragon that follows the cursor across the whole page. While it
 * is over the hero, the hero's background text re-flows around its body every
 * step (via Pretext — no DOM measurement). Holding the mouse makes it breathe
 * fire, which scatters nearby letters.
 *
 * Dragon sprites + physics adapted from illustrated-manuscript by dengshu2
 * (ISC): https://github.com/dengshu2/illustrated-manuscript
 *
 * Render inside a `position: relative` container; the reflow text fills that
 * container and the dragon flies on a fixed, full-viewport layer. Any
 * descendant of the container marked `data-reflow-exclude` is kept clear of text.
 */

// Physics constants from illustrated-manuscript/src/config.js
const SEG_COUNT = 20;
const SEG_SPACING = 30;
const SPRITE_SCALE = 0.24;
const WING_SEG = 5;
const SEG_WIDTHS = [221, 130, 203, 223, 285, 299, 281, 224, 192, 174, 191, 156, 155, 122, 126, 125, 107, 101, 101, 81];
// Sprites in /public/dragon-sprites are stored at half the original size.
const SPRITE_STORE_RATIO = 2;

// fire particles still advance in fixed steps; the dragon itself moves every frame
const STEP_MS = 70;
// how long the cursor must rest before the dragon flies off on its idle loop
const IDLE_MS = 1000;
// the idle loop's radii, as fractions of the viewport
const ORBIT_X = 0.33, ORBIT_Y = 0.28, ORBIT_SPEED = 0.00035;
// re-lay out the hero text at most this often while the dragon moves
const LAYOUT_MS = 33;
const FIRE_COLORS = ["#ff3b3b", "#ff6b35", "#ffb347"];
const TEXT_COLOR = "#b4b4b4";
// clicks on these never make the dragon breathe fire
const NO_FIRE = "a, button, input, textarea, select, label, [contenteditable]";

type Seg = { x: number; y: number; angle: number; width: number };
type Spark = {
  x: number; y: number; vx: number; vy: number; size: number;
  life: number; max: number; frame: number; color: number;
};
type Line = { text: string; x: number; y: number };
type Interval = { left: number; right: number };
type Rect = { x: number; y: number; w: number; h: number };

const SPRITE_NAMES = [
  "head", "tongue", "wing-front", "wing-back",
  ...Array.from({ length: 19 }, (_, i) => `body-${i + 1}`),
];

// frame-rate independent easing factor for a time constant of `ms`
function ease(dt: number, ms: number) {
  return 1 - Math.exp(-dt / ms);
}

function hash(seed: number) {
  const t = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return t - Math.floor(t);
}

function wrapAngle(a: number) {
  while (a > Math.PI) a -= Math.PI * 2;
  while (a < -Math.PI) a += Math.PI * 2;
  return a;
}

function circleInterval(cx: number, cy: number, r: number, top: number, bottom: number): Interval | null {
  const gap = Math.max(0, Math.abs(cy - (top + bottom) / 2) - (bottom - top) / 2);
  if (gap >= r) return null;
  const half = Math.sqrt(r * r - gap * gap);
  return { left: cx - half, right: cx + half };
}

function carve(base: Interval, blocked: Interval[]): Interval[] {
  let slots = [base];
  for (const iv of blocked) {
    const next: Interval[] = [];
    for (const s of slots) {
      if (iv.right <= s.left || iv.left >= s.right) { next.push(s); continue; }
      if (iv.left > s.left) next.push({ left: s.left, right: iv.left });
      if (iv.right < s.right) next.push({ left: iv.right, right: s.right });
    }
    slots = next;
  }
  return slots.filter((s) => s.right - s.left >= 28);
}

const noopSubscribe = () => () => {};

export function DragonReflow({ text }: { text: string }) {
  const textRef = useRef<HTMLCanvasElement>(null);
  const dragonRef = useRef<HTMLCanvasElement>(null);
  // The dragon canvas is portalled to <body> once mounted: inside the sticky,
  // rounded hero panel, iOS WebKit clips even a position:fixed child to the panel.
  // (false during SSR and hydration, true on the client after that)
  const mounted = useSyncExternalStore(noopSubscribe, () => true, () => false);

  useEffect(() => {
    const tc = textRef.current;
    const dc = dragonRef.current;
    const box = tc?.parentElement;
    const tctx = tc?.getContext("2d");
    const dctx = dc?.getContext("2d");
    if (!tc || !dc || !box || !tctx || !dctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // W/H: the hero box (text layer); VW/VH: the viewport (dragon layer)
    let W = 0, H = 0, VW = 0, VH = 0, scale = 1, pad = 44;
    let font = "", fontSize = 13, lineH = 22, cornerR = 64;
    let prepared: PreparedTextWithSegments | null = null;
    let lines: Line[] = [];
    let fixed: Rect[] = [];
    let textDirty = true;

    const imgs: Record<string, HTMLImageElement> = {};
    const dim = (name: string) => {
      const im = imgs[name];
      return im
        ? { w: im.naturalWidth * SPRITE_STORE_RATIO * SPRITE_SCALE, h: im.naturalHeight * SPRITE_STORE_RATIO * SPRITE_SCALE }
        : { w: 0, h: 0 };
    };

    const segs: Seg[] = [];
    const fire: Spark[] = [];
    let fireLast = 0, lastSpawn = 0, lastLayout = 0;
    let mouse = { x: 0, y: 0 }, lastMove = -1e9, holding = false, burstUntil = 0;
    // smooth flight: the head steers with a velocity toward a goal point that itself glides,
    // so stopping, starting and switching to idle never snap
    const flight = { vx: 0, vy: 0, gx: 0, gy: 0, idle: false, phase: 0, lastT: 0 };
    let raf = 0, running = false, heroVisible = true, scrolled = false;
    // hero-box origin in viewport coordinates, refreshed before each text layout
    let ox = 0, oy = 0;

    const segWidth = (i: number) => SEG_WIDTHS[i] * SPRITE_SCALE * scale;

    function measure() {
      const r = box!.getBoundingClientRect();
      W = r.width; H = r.height;
      VW = window.innerWidth; VH = window.innerHeight;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      tc!.width = W * dpr; tc!.height = H * dpr;
      dc!.width = VW * dpr; dc!.height = VH * dpr;
      tctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      dctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      scale = Math.max(0.55, Math.min(1.15, VW / 1250));
      // Phones: 60% of that - at the 0.55 floor it filled too much of a narrow screen.
      if (VW < 768) scale *= 0.6;
      pad = W < 640 ? 22 : 44;
      cornerR = parseFloat(getComputedStyle(box!).borderTopLeftRadius) || 0;
      fontSize = W < 640 ? 11 : W < 1100 ? 12 : 13;
      lineH = Math.round(fontSize * 1.75);
      // next/font renames families, so read the real stack off the page
      font = `${fontSize}px ${getComputedStyle(box!).fontFamily}`;
      prepared = prepareWithSegments(text, font);
      textDirty = true;
    }

    function measureFixed() {
      const br = box!.getBoundingClientRect();
      fixed = [];
      box!.querySelectorAll<HTMLElement>("[data-reflow-exclude]").forEach((el) => {
        // measure the glyphs, not the full-width block
        const range = document.createRange();
        range.selectNodeContents(el);
        const r = range.getBoundingClientRect();
        if (r.width === 0) return;
        fixed.push({ x: r.left - br.left - 22, y: r.top - br.top - 12, w: r.width + 44, h: r.height + 24 });
      });
    }

    function resetDragon() {
      segs.length = 0;
      const x = VW * 0.78, y = VH * 0.3;
      for (let i = 0; i < SEG_COUNT; i++) segs.push({ x: x + i * SEG_SPACING * scale, y, angle: Math.PI, width: segWidth(i) });
      // idle = false makes the next idle step join the loop at the point nearest the dragon
      flight.gx = x; flight.gy = y; flight.vx = 0; flight.vy = 0; flight.idle = false;
    }

    // idle flight: an orbit around the middle of the screen
    function idlePoint(t: number) {
      const s = t * ORBIT_SPEED + flight.phase;
      return { x: VW * (0.5 + ORBIT_X * Math.cos(s)), y: VH * (0.5 + ORBIT_Y * Math.sin(s)) };
    }

    function updateDragon(t: number) {
      const dt = Math.min(50, Math.max(1, t - (flight.lastT || t - 16)));
      flight.lastT = t;
      const head = segs[0];
      const idle = t - lastMove > IDLE_MS;
      if (idle && reduced) return false;
      if (idle && !flight.idle) {
        // join the idle loop at its nearest point, so the dragon drifts off instead of lurching across the screen
        const s0 = Math.atan2((head.y / VH - 0.5) / ORBIT_Y, (head.x / VW - 0.5) / ORBIT_X);
        flight.phase = s0 - t * ORBIT_SPEED;
      }
      flight.idle = idle;
      // follow the cursor and settle on it; once it has rested for IDLE_MS, fly off on the idle loop
      const want = idle ? idlePoint(t) : { ...mouse };
      // keep the goal off the walls so the dragon never pins itself into an edge or corner
      const mx = Math.min(VW * 0.12, 140 * scale), my = Math.min(VH * 0.14, 120 * scale);
      want.x = Math.max(mx, Math.min(VW - mx, want.x));
      want.y = Math.max(my, Math.min(VH - my, want.y));
      const g = ease(dt, idle ? 900 : 120);
      flight.gx += (want.x - flight.gx) * g;
      flight.gy += (want.y - flight.gy) * g;
      // steer toward the goal with a capped speed; gain and easing are near critically damped,
      // so it slows into the cursor without overshooting
      const maxV = (idle ? 0.16 : 1.1) * scale; // px per ms
      let dvx = (flight.gx - head.x) * 0.004, dvy = (flight.gy - head.y) * 0.004;
      const dv = Math.hypot(dvx, dvy);
      if (dv > maxV) { dvx *= maxV / dv; dvy *= maxV / dv; }
      const k = ease(dt, idle ? 400 : 80);
      flight.vx += (dvx - flight.vx) * k;
      flight.vy += (dvy - flight.vy) * k;
      head.x += flight.vx * dt;
      head.y += flight.vy * dt;
      const speed = Math.hypot(flight.vx, flight.vy);
      // only turn while actually flying, so a settling dragon keeps its heading instead of spinning in place
      if (speed > 0.04) head.angle += wrapAngle(Math.atan2(flight.vy, flight.vx) - head.angle) * ease(dt, 140);
      head.width = segWidth(0);
      const maxBend = 0.25, sp = SEG_SPACING * scale;
      for (let i = 1; i < SEG_COUNT; i++) {
        const prev = segs[i - 1], seg = segs[i];
        let a = Math.atan2(prev.y - seg.y, prev.x - seg.x);
        const diff = wrapAngle(a - prev.angle);
        if (diff > maxBend) a = prev.angle + maxBend;
        else if (diff < -maxBend) a = prev.angle - maxBend;
        seg.angle = a;
        seg.x = prev.x - Math.cos(a) * sp;
        seg.y = prev.y - Math.sin(a) * sp;
        seg.width = segWidth(i);
      }
      return speed > 0.005;
    }

    function spawnFire() {
      const h = segs[0], mouth = dim("head").w * 0.55 * scale;
      const fx = h.x + Math.cos(h.angle) * mouth, fy = h.y + Math.sin(h.angle) * mouth;
      const n = 3 + Math.floor(Math.random() * 3);
      for (let i = 0; i < n; i++) {
        const a = h.angle + (Math.random() - 0.5) * 0.25, v = (35 + Math.random() * 20) * scale;
        fire.push({
          x: fx, y: fy, vx: Math.cos(a) * v, vy: Math.sin(a) * v, size: (8 + Math.random() * 12) * scale,
          life: 1, max: 12 + Math.floor(Math.random() * 6), frame: 0, color: Math.floor(Math.random() * 3),
        });
      }
    }

    function updateFire(t: number) {
      if (t - fireLast < STEP_MS) return false;
      fireLast = t;
      for (let i = fire.length - 1; i >= 0; i--) {
        const p = fire[i];
        p.frame++;
        p.life = 1 - p.frame / p.max;
        p.x += p.vx; p.y += p.vy;
        p.vx *= 0.95; p.vy *= 0.95;
        p.vy -= Math.max(0, (p.frame - 4) / p.max) * 1.5;
        if (p.life < 0.25) p.size *= 0.75;
        else if (p.frame < 3) p.size *= 1.15;
        if (p.life <= 0 || p.size < 1.5) fire.splice(i, 1);
      }
      return true;
    }

    function fireInfluence(x: number, y: number) {
      let dx = 0, dy = 0, total = 0;
      for (const p of fire) {
        const ex = x - (p.x - ox), ey = y - (p.y - oy), d = Math.hypot(ex, ey);
        if (d > 60 || d < 0.1) continue;
        const f = 1 - d / 60, w = f * f * p.life;
        dx += (ex / d) * w; dy += (ey / d) * w; total += w;
      }
      if (total < 0.001) return null;
      const m = Math.hypot(dx, dy) || 1;
      return { dx: dx / m, dy: dy / m, s: Math.min(total, 1.5) };
    }

    function layoutText() {
      if (!prepared) return;
      lines = [];
      let cursor: LayoutCursor = { segmentIndex: 0, graphemeIndex: 0 };
      const segPad = 10 * scale;
      for (let y = pad; y + lineH <= H - pad; y += lineH) {
        const blocked: Interval[] = [];
        for (const s of segs) {
          const iv = circleInterval(s.x - ox, s.y - oy, s.width / 2 + segPad, y, y + lineH);
          if (iv) blocked.push(iv);
        }
        for (const p of fire) {
          const iv = circleInterval(p.x - ox, p.y - oy, p.size / 2 + 6, y, y + lineH);
          if (iv) blocked.push(iv);
        }
        for (const f of fixed) if (y + lineH > f.y && y < f.y + f.h) blocked.push({ left: f.x, right: f.x + f.w });
        // follow the container's rounded corners
        const edge = Math.min(y, H - y - lineH);
        const inset = edge < cornerR ? cornerR - Math.sqrt(cornerR * cornerR - (cornerR - edge) ** 2) : 0;
        for (const s of carve({ left: pad + inset, right: W - pad - inset }, blocked)) {
          let line = layoutNextLine(prepared, cursor, s.right - s.left);
          if (!line) {
            cursor = { segmentIndex: 0, graphemeIndex: 0 };
            line = layoutNextLine(prepared, cursor, s.right - s.left);
          }
          if (!line) break;
          lines.push({ text: line.text, x: s.left, y });
          cursor = line.end;
        }
      }
    }

    function drawText() {
      const ctx = tctx!;
      ctx.clearRect(0, 0, W, H);
      ctx.font = font;
      ctx.textBaseline = "top";
      ctx.fillStyle = TEXT_COLOR;
      let fy0 = Infinity, fy1 = -Infinity;
      for (const p of fire) { fy0 = Math.min(fy0, p.y - oy - 70); fy1 = Math.max(fy1, p.y - oy + 70); }
      const halfAsc = fontSize * 0.43;
      for (const ln of lines) {
        const y = ln.y + (lineH - fontSize) / 2;
        if (!fire.length || ln.y > fy1 || ln.y + lineH < fy0) { ctx.fillText(ln.text, ln.x, y); continue; }
        // fire scatters and scorches nearby characters
        let sx = ln.x;
        for (const ch of ln.text) {
          const cw = ctx.measureText(ch).width;
          const f = fireInfluence(sx + cw / 2, y + halfAsc);
          if (!f) ctx.fillText(ch, sx, y);
          else {
            ctx.save();
            ctx.translate(sx + cw / 2 + f.dx * f.s * 45, y + halfAsc + f.dy * f.s * 45);
            ctx.rotate(f.s * (f.dx > 0 ? 1 : -1) * 1.2);
            ctx.globalAlpha = Math.max(0, 1 - f.s * 0.6);
            ctx.fillStyle = f.s > 0.5 ? "#ff3b3b" : "#ff6b35";
            ctx.fillText(ch, -cw / 2, -halfAsc);
            ctx.restore();
          }
          sx += cw;
        }
      }
    }

    function drawFire() {
      const ctx = dctx!;
      for (const p of fire) {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(Math.atan2(p.vy, p.vx));
        ctx.globalAlpha = Math.min(1, p.life * 1.5);
        const decay = 1 - p.life;
        ctx.fillStyle = FIRE_COLORS[decay < 0.33 ? 0 : decay < 0.66 ? 1 : 2];
        const r = p.size / 2, sb = p.color * 31 + p.frame * 0.3;
        const jf = (n: number) => (hash(sb + n * 17) - 0.5) * r * 0.4;
        const c = [[r * 1.2 + jf(0), jf(1)], [jf(2), -r * 0.7 + jf(3)], [-r + jf(4), jf(5)], [jf(6), r * 0.7 + jf(7)]];
        ctx.beginPath();
        ctx.moveTo(c[0][0], c[0][1]);
        for (let k = 0; k < 4; k++) {
          const [x1, y1] = c[k], [x2, y2] = c[(k + 1) % 4], js = sb + k * 100;
          for (let s = 1; s <= 4; s++) {
            const t = s / 4;
            ctx.lineTo(x1 + (x2 - x1) * t + (hash(js + s * 13) - 0.5) * r * 0.35, y1 + (y2 - y1) * t + (hash(js + s * 29) - 0.5) * r * 0.35);
          }
        }
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
    }

    function drawDragon(t: number) {
      const ctx = dctx!, time = t / 1000;
      // a slow, continuous hand-drawn sway instead of a fresh random shake every step
      const jit = (i: number) => [
        Math.sin(time * 2.1 + i * 0.9) * 0.6,
        Math.cos(time * 1.7 + i * 1.3) * 0.6,
        Math.sin(time * 1.3 + i * 0.7) * 0.015,
      ];
      if (imgs["wing-back"]) {
        const s = segs[WING_SEG], [jx, jy, jr] = jit(WING_SEG), { w, h } = dim("wing-back");
        ctx.save();
        ctx.translate(s.x + jx, s.y + jy);
        ctx.rotate(s.angle + jr + Math.sin(time * 3) * 0.4);
        ctx.scale(scale, scale);
        ctx.drawImage(imgs["wing-back"], -w, -h, w, h);
        ctx.restore();
      }
      for (let i = segs.length - 1; i >= 0; i--) {
        const s = segs[i], [jx, jy, jr] = jit(i);
        ctx.save();
        ctx.translate(s.x + jx, s.y + jy);
        ctx.rotate(s.angle + jr);
        ctx.scale(scale, scale);
        if (i === 0) {
          const hd = dim("head"), tg = dim("tongue");
          if (imgs.tongue) ctx.drawImage(imgs.tongue, hd.w * 0.3, -tg.h / 2, tg.w, tg.h);
          if (imgs.head) ctx.drawImage(imgs.head, -hd.w * 0.45, -hd.h / 2, hd.w, hd.h);
        } else {
          const key = `body-${i}`, d = dim(key);
          if (imgs[key]) ctx.drawImage(imgs[key], -d.w / 2, -d.h / 2, d.w, d.h);
          if (i === WING_SEG && imgs["wing-front"]) {
            const { w, h } = dim("wing-front");
            ctx.save();
            ctx.rotate(-Math.sin(time * 3 + 0.5) * 0.4);
            ctx.drawImage(imgs["wing-front"], -w, -h, w, h);
            ctx.restore();
          }
        }
        ctx.restore();
      }
    }

    function frame(t: number) {
      const moved = updateDragon(t);
      if ((holding || t < burstUntil) && t - lastSpawn > 60) { spawnFire(); lastSpawn = t; }
      const fired = updateFire(t);
      if (heroVisible && ((moved && t - lastLayout > LAYOUT_MS) || fired || textDirty || scrolled)) {
        lastLayout = t;
        const r = box!.getBoundingClientRect();
        ox = r.left; oy = r.top;
        // the centre content fades/scales in, so keep its exclusion boxes current
        measureFixed();
        layoutText();
        drawText();
        textDirty = false;
        scrolled = false;
      }
      dctx!.clearRect(0, 0, VW, VH);
      drawFire();
      drawDragon(t);
      raf = requestAnimationFrame(frame);
    }

    function start() {
      if (running || document.hidden) return;
      running = true;
      raf = requestAnimationFrame(frame);
    }
    function stop() {
      running = false;
      cancelAnimationFrame(raf);
    }

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      mouse = { x: e.clientX, y: e.clientY };
      lastMove = performance.now();
    };
    const onDown = (e: PointerEvent) => {
      if ((e.target as HTMLElement).closest(NO_FIRE)) return;
      mouse = { x: e.clientX, y: e.clientY };
      lastMove = performance.now();
      // touch keeps page scrolling: a tap steers + gives a short burst instead of hold-to-breathe
      if (e.pointerType === "mouse") holding = true;
      else burstUntil = performance.now() + 450;
    };
    const onUp = () => { holding = false; };
    const onScroll = () => { scrolled = true; };
    // cursor left the window: start drifting now instead of hugging the edge it left from
    const onOut = (e: PointerEvent) => {
      if (e.relatedTarget) return;
      lastMove = -1e9;
      holding = false;
    };
    const onVisibility = () => (document.hidden ? stop() : start());

    let resizeTimer: ReturnType<typeof setTimeout>;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        const prevW = VW;
        measure();
        // Only a width change (rotation, real window resize) restarts the flight.
        // Height-only changes are the mobile address bar sliding in and out -
        // keep the dragon where it is; its flight steers it back inside anyway.
        if (Math.abs(VW - prevW) > 1) resetDragon();
      }, 120);
    };
    const ro = new ResizeObserver(() => {
      const r = box.getBoundingClientRect();
      if (Math.abs(r.width - W) < 1 && Math.abs(r.height - H) < 1) return;
      onResize();
    });
    // the dragon flies everywhere; only the hero's text layout pauses off-screen
    const io = new IntersectionObserver(([entry]) => {
      heroVisible = entry.isIntersecting;
      if (heroVisible) textDirty = true;
    });

    let cancelled = false;
    const loadSprites = Promise.all(
      SPRITE_NAMES.map(
        (name) =>
          new Promise<void>((resolve) => {
            const im = new Image();
            im.onload = () => { imgs[name] = im; resolve(); };
            im.onerror = () => resolve();
            im.src = `/dragon-sprites/${name}.png`;
          }),
      ),
    );

    // fonts must be ready before prepare(), or every width is measured with the fallback face
    Promise.all([document.fonts.ready, loadSprites]).then(() => {
      if (cancelled) return;
      measure();
      resetDragon();
      // pre-roll the idle flight so the dragon is already mid-page on first paint
      const now = performance.now();
      for (let k = 0; k < 240; k++) updateDragon(now - (240 - k) * 16);
      flight.lastT = 0;
      window.addEventListener("pointermove", onMove);
      document.addEventListener("pointerout", onOut);
      window.addEventListener("pointerdown", onDown);
      window.addEventListener("pointerup", onUp);
      window.addEventListener("pointercancel", onUp);
      window.addEventListener("blur", onUp);
      // capture on document: the site scrolls <body>, whose scroll events never reach window
      document.addEventListener("scroll", onScroll, { passive: true, capture: true });
      window.addEventListener("resize", onResize);
      document.addEventListener("visibilitychange", onVisibility);
      ro.observe(box);
      io.observe(box);
      start();
    });

    return () => {
      cancelled = true;
      stop();
      clearTimeout(resizeTimer);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerout", onOut);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      window.removeEventListener("blur", onUp);
      document.removeEventListener("scroll", onScroll, { capture: true });
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [text, mounted]);

  return (
    <>
      <canvas ref={textRef} aria-hidden="true" className="absolute inset-0 w-full h-full pointer-events-none z-10 opacity-(--hero-fade,1)" />
      {/* fixed to the viewport so the dragon can follow the cursor down the whole page; sits under the nav dock (z-50)
          and the works wheel panel (z-45), so it flies behind that */}
      {mounted && createPortal(
        <canvas ref={dragonRef} aria-hidden="true" className="fixed inset-0 w-screen h-screen pointer-events-none z-40" />,
        document.body,
      )}
    </>
  );
}
