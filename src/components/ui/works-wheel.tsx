"use client";

// A portfolio index built as a wheel you turn.
//
// At rest the work sits in a ring around a title, each card tangent to the
// circle. The first notch of scroll blows the ring open into a vertical drum:
// the card at the front lies flat and full size, the ones above and below
// rotate away into hard perspective and run off the top and bottom of the
// frame. Keep turning and the drum carries the next piece round to the front.
//
// The whole thing is one number - `turn` - read by a single rAF pass that writes
// transforms straight to the DOM. 0 is the ring, 1 is the drum with item 0 at
// the front, and every whole number after that is one more item turned past.
import * as React from "react";

import { cn } from "@/lib/utils";

export interface WorksWheelItem {
  /** Project name. Shown beside the front card and in the index. */
  title: string;
  /** Cover art. Any src an <img> takes. */
  image: string;
  /** Where the card links to. Omit for a wheel that only browses. */
  href?: string;
}

export interface WorksWheelProps extends Omit<
  React.ComponentPropsWithoutRef<"section">,
  "children"
> {
  items: WorksWheelItem[];
  /** Sits in the middle of the ring. Newlines break the line. @default undefined */
  label?: string;
  /** Label on the card's hover affordance. Omit to drop it. @default undefined */
  action?: string;
  /** Drive the wheel from outside - usually page scroll through a pinned
      section - instead of capturing the mouse wheel and drags itself. 0 is the
      ring, 1 is the last item at the front. @default undefined */
  progress?: number;
  /** In `progress` mode, called with the progress the index list or arrow keys
      asked for, so the owner can scroll there. */
  onProgressChange?: (progress: number) => void;
}

/* Geometry. The card is measured against the stage; everything else is measured
   against the card, so a narrow stage - where the card is capped by width, not
   height - scales the whole wheel down with it instead of leaving a small card
   swinging on a huge drum. The three that matter are tuned together: STEP
   against DRUM sets how hard the neighbours rotate away, and DRUM against LENS
   decides whether they land inside the frame or run off it. */
const CARD_H = 0.38; // front card height, of the stage
const CARD_MAX_W = 0.34; // ... but never wider than this much of the stage
const CARD_MAX_W_SM = 0.74; // ... below md, where no index shares the stage
const CARD_RATIO = 1.45; // card width / height
const STEP = 40; // degrees between cards on the drum
const DRUM = 2.22; // drum radius, in card heights - and everything below likewise
const LENS = 2.7; // perspective distance
const RING_R = 1.14; // ring radius
/* The drum alone hangs the work on a plumb line. It isn't one: the strip curves
   away round an arc whose centre sits off to the LEFT, so the piece at the front
   is at the arc's near point - dead centre - and its neighbours have already
   swung back left as well as up and down. BOW is that arc's radius; nothing else
   makes the difference between a stack of cards and a wheel seen side on. */
const BOW = 1.82;
const TITLE = 0.124; // front-card title
const LABEL = TITLE * 1.6; // ring label - it doubles as the section heading
const INDEX = 0.056; // the index down the right-hand side
const INDEX_MIN = 11; // ... but never smaller than this, in px
/** Rough advance of one glyph in the display face, in ems - used to shrink a
    title whose longest word would otherwise run into the front card. */
const GLYPH_EM = 0.8;
const MD = 768; // Tailwind's md breakpoint, where the title moves beside the card
/** Items either side of the front still worth drawing. Past this a card is
    edge-on, and further round it would stack up on the vanishing point. */
const CULL = 1.6;

/** How much of a wheel-notch or a dragged pixel counts as one item. */
const WHEEL_UNITS = 900;
const DRAG_UNITS = 420;
/** Quiet time after the last wheel event before the wheel settles on an item. */
const SETTLE = 140;
/** Fraction of the remaining distance closed each frame. 1 = no smoothing. */
const EASE = 0.12;

const clamp = (v: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

type Stage = { w: number; h: number };

const rad = (deg: number) => (deg * Math.PI) / 180;

/** How far left the arc has carried something that has turned `drumDeg` off the
    front. Zero at the front, so the piece being read stays centred. */
const bowAt = (drumDeg: number, bow: number) =>
  -bow * (1 - Math.cos(rad(drumDeg)));

/** Both states in one chain: the ring terms fall away as `m` reaches the drum,
    and the drum terms are still zero while the ring is up. The bow is applied
    first, in the wheel's own plane, so it slides the card sideways rather than
    turning with it - and perspective still shrinks it with distance. */
function place(
  ringDeg: number,
  drumDeg: number,
  ringR: number,
  drumR: number,
  bow: number,
  m: number,
) {
  return (
    `translateX(${m * bowAt(drumDeg, bow)}px)` +
    ` rotateZ(${(1 - m) * ringDeg}deg) translateY(${-(1 - m) * ringR}px)` +
    ` rotateX(${m * drumDeg}deg) translateZ(${m * drumR}px)`
  );
}

/** The project list - down the side from md up, in the overlay on phones.
    `onPick` gets the turn that brings item i to the front (i + 1). */
function IndexItems({
  items,
  active,
  onPick,
}: {
  items: WorksWheelItem[];
  active: number;
  onPick: (next: number) => void;
}) {
  return items.map((item, i) => (
    <li key={item.title}>
      <button
        type="button"
        data-active={i === active}
        title={item.title}
        onClick={() => onPick(i + 1)}
        className={cn(
          // Long names truncate so the side index can't crowd the wheel; the
          // full name is the front title and the tooltip.
          "focus-visible:outline-foreground max-w-full cursor-pointer truncate transition-colors outline-none focus-visible:outline-1",
          i === active && "text-foreground font-medium",
        )}
      >
        {item.title}
      </button>
    </li>
  ));
}

export function WorksWheel({
  items,
  label = "Works '26",
  action = "View",
  progress,
  onProgressChange,
  className,
  ...props
}: WorksWheelProps) {
  const stageRef = React.useRef<HTMLDivElement>(null);
  const wheelRef = React.useRef<HTMLDivElement>(null);
  const cardRefs = React.useRef<(HTMLElement | null)[]>([]);
  const labelRef = React.useRef<HTMLDivElement>(null);
  const titleRef = React.useRef<HTMLDivElement>(null);

  // The wheel's position, and where it is heading. Only `active` is state -
  // everything else is written to the DOM, so turning the wheel is not a render.
  const turn = React.useRef(0);
  const target = React.useRef(0);
  const [active, setActive] = React.useState(0);
  const [stage, setStage] = React.useState<Stage>({ w: 0, h: 0 });
  // Width of the side index (md up), so the ring and the front card stay clear of it.
  const indexRef = React.useRef<HTMLOListElement>(null);
  const [indexW, setIndexW] = React.useState(0);
  React.useEffect(() => {
    const el = indexRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setIndexW(el.offsetWidth));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const name = label.replace(/\s+/g, " ");
  const count = items.length;
  const last = Math.max(count - 1, 0);

  // Read after mount, not during render: the server has no matchMedia, and
  // branching on it inline is a hydration mismatch. Reduced motion drops the
  // easing, so the wheel lands where it is put instead of gliding there.
  const [reduced, setReduced] = React.useState(false);
  React.useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const read = () => setReduced(query.matches);
    read();
    query.addEventListener("change", read);
    return () => query.removeEventListener("change", read);
  }, []);

  React.useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const read = () => setStage({ w: el.clientWidth, h: el.clientHeight });
    read();
    const ro = new ResizeObserver(read);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const metrics = React.useMemo(() => {
    const { w, h } = stage;
    const narrow = w < MD;
    // Half-width free right of centre before the side index (right-[2.5%], plus a gap).
    const free = narrow || !indexW ? Infinity : w / 2 - indexW - w * 0.025 - 24;
    const cardW = Math.max(
      0,
      Math.min(h * CARD_H * CARD_RATIO, w * (narrow ? CARD_MAX_W_SM : CARD_MAX_W), free * 2),
    );
    const cardH = cardW / CARD_RATIO;
    const drumR = cardH * DRUM;
    // The bigger phone card would push the ring off a narrow stage; keep it
    // inside. From md up, the ring's outer edge (its cards reach roughly
    // 2.6/count of the radius past it) stops short of the index.
    const ringR = Math.max(
      0,
      Math.min(cardH * RING_R, (Math.min(w, h) / 2) * 0.78, free / (1 + 2.6 / Math.max(count, 1))),
    );
    // Shrink the ring's cards until the circle reads as a closed loop rather
    // than beads on a wire, however many pieces the wheel is given.
    const ringScale = count
      ? clamp((((2 * Math.PI * ringR) / count) * 0.82) / (cardW || 1), 0.16, 1)
      : 1;
    return {
      cardW,
      cardH,
      ringR,
      ringScale,
      drumR,
      // Less arc on a narrow stage, so the big card's neighbours stay on screen.
      bow: cardH * BOW * (narrow ? 0.5 : 1),
      depth: cardH * LENS,
      label: cardH * LABEL,
      title: cardH * TITLE,
      // Sized off the height-only card, not cardH: cardH now depends on the
      // index's width, and the index's width on this.
      index: Math.max(INDEX_MIN, h * CARD_H * INDEX),
      // Room for the front title: the gap left of the card from md up, or most
      // of the stage width below it, where the title sits under the card.
      gutter: w >= MD ? (w - cardW) / 2 - w * 0.05 - 16 : w * 0.9,
    };
  }, [stage, count, indexW]);

  // Titles wrap, but a single long word can't - so size down to fit the longest.
  const longest = Math.max(
    1,
    ...(items[active]?.title ?? "").split(/\s+/).map((word) => word.length),
  );
  const titleSize = Math.max(
    0,
    Math.min(metrics.title, metrics.gutter / (longest * GLYPH_EM)),
  );

  // One pass per frame: ease toward the target, then write every transform.
  React.useEffect(() => {
    if (!stage.h) return;
    let frame = 0;
    const { ringR, ringScale, drumR, bow } = metrics;

    const draw = () => {
      frame = requestAnimationFrame(draw);
      const gap = target.current - turn.current;
      if (Math.abs(gap) < 0.0005) turn.current = target.current;
      else turn.current += gap * (reduced ? 1 : EASE);

      const t = turn.current;
      const m = clamp(t, 0, 1);
      const pos = Math.max(0, t - 1);

      // The drum is pulled back so its front face lands on the picture plane.
      // That set-back has to arrive with the drum, or the ring would sit at the
      // far side of the perspective and render at half its size.
      if (wheelRef.current) {
        wheelRef.current.style.transform = `translateZ(${-m * drumR}px)`;
      }

      for (let i = 0; i < count; i++) {
        const d = i - pos;
        const drumDeg = d * STEP;
        const card = cardRefs.current[i];
        if (card) {
          card.style.transform = place(
            d * (360 / count),
            drumDeg,
            ringR,
            drumR,
            bow,
            m,
          );
          // Culled by distance, not by angle: at a full turn the far side comes
          // back round to face us, and everything past the neighbours lands on
          // the vanishing point in a heap.
          card.style.opacity = m > 0.5 && Math.abs(d) > CULL ? "0" : "1";
          card.style.zIndex = String(Math.round(100 - Math.abs(d) * 2));
        }
        const face = card?.firstElementChild as HTMLElement | null;
        if (face) face.style.transform = `scale(${lerp(ringScale, 1, m)})`;
      }

      if (labelRef.current) labelRef.current.style.opacity = String(1 - m);
      if (titleRef.current) titleRef.current.style.opacity = String(m);
      const near = clamp(Math.round(pos), 0, last);
      setActive((prev) => (prev === near ? prev : near));
    };

    frame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frame);
  }, [metrics, stage.h, count, last, reduced]);

  const controlled = progress !== undefined;

  const to = React.useCallback(
    (next: number) => {
      target.current = clamp(next, 0, last + 1);
      if (controlled) onProgressChange?.(target.current / (last + 1));
    },
    [last, controlled, onProgressChange],
  );

  const drag = React.useRef<number | null>(null);
  const settling = React.useRef(0);

  // Controlled: follow the owner's progress, then settle onto the nearest item
  // once it stops moving - the same reason the wheel settles, below.
  React.useEffect(() => {
    if (progress === undefined) return;
    target.current = clamp(progress, 0, 1) * (last + 1);
    window.clearTimeout(settling.current);
    settling.current = window.setTimeout(() => {
      if (target.current > 1) target.current = Math.round(target.current);
    }, SETTLE);
    return () => window.clearTimeout(settling.current);
  }, [progress, last]);

  // Native listener, because the wheel has to be cancellable - and it only
  // cancels while it still has somewhere to go, so the page scrolls on at
  // either end instead of trapping the reader.
  React.useEffect(() => {
    const el = stageRef.current;
    if (!el || controlled) return;
    const onWheel = (event: WheelEvent) => {
      const next = target.current + event.deltaY / WHEEL_UNITS;
      if (next > 0 && next < last + 1) event.preventDefault();
      to(next);
      // A wheel gesture arrives as a burst of events with no end of its own, so
      // the rest position is whatever notch it happened to stop on. Left there
      // the drum sits between two cards - nothing at the front, and the pair
      // either side of the gap both turned half away. Settle onto an item.
      window.clearTimeout(settling.current);
      settling.current = window.setTimeout(
        () => to(Math.round(target.current)),
        SETTLE,
      );
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      el.removeEventListener("wheel", onWheel);
      window.clearTimeout(settling.current);
    };
  }, [to, last, controlled]);

  return (
    <section
      aria-label={name}
      className={cn(
        "bg-background text-foreground relative h-full min-h-[24rem] w-full overflow-hidden select-none",
        className,
      )}
      {...props}
    >
      <div
        ref={stageRef}
        tabIndex={0}
        role="listbox"
        aria-label={name}
        aria-activedescendant={`works-wheel-${active}`}
        className={cn(
          "focus-visible:outline-foreground absolute inset-0 outline-none focus-visible:outline-2 focus-visible:-outline-offset-4",
          !controlled && "cursor-grab touch-pan-x active:cursor-grabbing",
        )}
        style={{ perspective: `${metrics.depth}px` }}
        onPointerDown={(event) => {
          if (controlled) return;
          drag.current = event.clientY;
          event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onPointerMove={(event) => {
          if (drag.current === null) return;
          to(target.current + (drag.current - event.clientY) / DRAG_UNITS);
          drag.current = event.clientY;
        }}
        onPointerUp={() => {
          // Land on an item rather than between two.
          drag.current = null;
          if (target.current > 1) to(Math.round(target.current));
        }}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown") to(Math.round(target.current) + 1);
          else if (event.key === "ArrowUp") to(Math.round(target.current) - 1);
          else return;
          event.preventDefault();
        }}
      >
        <div
          ref={wheelRef}
          className="absolute top-1/2 left-1/2 [transform-style:preserve-3d]"
        >
          {items.map((item, i) => {
            const Tag = (item.href ? "a" : "div") as "a";
            return (
              <React.Fragment key={item.title}>
                <Tag
                  id={`works-wheel-${i}`}
                  role="option"
                  aria-selected={i === active}
                  href={item.href}
                  ref={(node: HTMLElement | null) => {
                    cardRefs.current[i] = node;
                  }}
                  className="group absolute [backface-visibility:hidden]"
                  style={{
                    width: metrics.cardW,
                    height: metrics.cardH,
                    marginLeft: -metrics.cardW / 2,
                    marginTop: -metrics.cardH / 2,
                  }}
                >
                  <span className="bg-muted shadow-foreground/12 relative block size-full overflow-hidden rounded-lg shadow-[0_18px_40px_-18px_var(--tw-shadow-color)]">
                    {/* eslint-disable-next-line @next/next/no-img-element -- transforms are written per frame; next/image adds nothing here */}
                    <img
                      src={item.image}
                      alt={item.title}
                      draggable={false}
                      className="size-full object-cover"
                    />
                    {action && item.href ? (
                      <span className="bg-background/80 text-foreground pointer-events-none absolute right-3 bottom-3 flex translate-y-1 items-center gap-1 rounded-full px-2.5 py-1 text-[0.7rem] opacity-0 backdrop-blur-sm transition group-hover:translate-y-0 group-hover:opacity-100">
                        <svg
                          viewBox="0 0 12 12"
                          className="size-2.5"
                          aria-hidden="true"
                        >
                          <path
                            d="M3 9 9 3M4 3h5v5"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.4"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        {action}
                      </span>
                    ) : null}
                  </span>
                </Tag>
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Ring title and front-card title trade places across the transition.
          The front title wraps in the gutter left of the card so long project
          names don't run over it; on phones it drops below the card instead.
          Type is sized off the measured stage, not vh, so the wheel keeps its
          proportions inside a card as well as at full bleed. */}
      <div
        ref={labelRef}
        className="font-pixel pointer-events-none absolute inset-0 grid place-items-center text-center leading-[0.95] tracking-tight whitespace-pre-line"
        style={{ fontSize: metrics.label }}
      >
        {label}
      </div>
      <div
        ref={titleRef}
        className={cn(
          // Phones: a quiet mono caption at the top of the wheel, across from the
          // count - clear of every card, not a display heading.
          "pointer-events-none absolute top-5 left-5 right-20 font-mono text-sm leading-snug text-balance opacity-0",
          // md up: the display title in the gutter left of the card.
          "md:font-pixel md:top-1/2 md:right-auto md:left-[5%] md:max-w-[24%] md:translate-x-0 md:-translate-y-1/2 md:text-left md:text-(length:--ww-title) md:leading-none md:tracking-tight",
        )}
        style={
          {
            "--ww-title": `${titleSize}px`,
          } as React.CSSProperties
        }
      >
        {items[active]?.title}
      </div>

      {/* text-secondary: this project's theme has no shadcn muted-foreground token */}
      <ol
        ref={indexRef}
        className="text-secondary absolute top-[6%] right-[2.5%] max-w-[22%] text-right leading-[1.75] max-md:hidden"
        style={{ fontSize: metrics.index }}
      >
        <IndexItems items={items} active={active} onPick={to} />
      </ol>

      {/* Phones: just the count - the list itself doesn't fit beside the wheel. */}
      <span
        aria-hidden="true"
        className="text-secondary absolute top-5 right-5 font-mono text-xs tabular-nums md:hidden"
      >
        {String(active + 1).padStart(2, "0")}/{String(count).padStart(2, "0")}
      </span>
    </section>
  );
}

export default WorksWheel;
