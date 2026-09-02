"use client";

import React, { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useMotionValue,
  useReducedMotion,
  MotionValue,
} from "framer-motion";

export interface CollectionItem {
  id: number | string;
  image: string;
  title: string;
}

export type CollectionSurferVariant = "magnetic" | "uplift" | "simple";

interface CollectionSurferProps {
  items: CollectionItem[];
  variant?: CollectionSurferVariant;
  /**
   * Optional full-bleed layer rendered behind the cards inside the pinned
   * viewport (e.g. an animated background). Sits above the solid black base
   * and below the surfing cards and the heading.
   */
  background?: React.ReactNode;
  /** Optional overlay rendered on top of the pinned viewport (e.g. a headline). */
  heading?: React.ReactNode;
  /**
   * How tall the scroll section is, in viewport heights. Controls how much
   * scrolling it takes to surf the whole row. Defaults to a value derived
   * from the item count.
   */
  scrollLengthVh?: number;
}

// Step vector between cards, in px. The camera slides straight along this
// vector so the row stays visually coherent as it passes.
const STEP_X = 240;
const STEP_Y = -84;
const STEP_Z = -288;

// The traverse runs over this slice of the section's scroll progress. The
// head slice (0 -> START) holds card 0 at centre; the tail slice (END -> 1)
// holds the last card at centre while the viewport is still pinned, so the
// final card never gets cut off as the pin releases.
const TRAVERSE_START = 0.06;
const TRAVERSE_END = 0.86;

export function CollectionSurfer({
  items,
  variant = "magnetic",
  background,
  heading,
  scrollLengthVh,
}: CollectionSurferProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const effectiveVariant: CollectionSurferVariant = prefersReducedMotion
    ? "simple"
    : variant;

  const count = items.length;
  const span = Math.max(count - 1, 1);
  const sectionVh = scrollLengthVh ?? Math.round(Math.max(220, count * 34));

  // Drive the 3D traverse from THIS section's scroll progress (0 -> 1),
  // not the window. The section is `sectionVh` tall with a pinned inner
  // viewport, so the whole row surfs past exactly once with no wrap seam.
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    mass: 0.1,
    stiffness: 100,
    damping: 20,
  });
  const progress = prefersReducedMotion ? scrollYProgress : smoothProgress;

  // One shared scalar lerp, multiplied into each axis of the step vector, so
  // the whole row stays collinear with the step vector at every progress.
  const range: [number, number] = [TRAVERSE_START, TRAVERSE_END];
  const x = useTransform(progress, range, [0, -span * STEP_X]);
  const y = useTransform(progress, range, [0, -span * STEP_Y]);
  const z = useTransform(progress, range, [0, -span * STEP_Z]);

  // Mouse position for the magnetic / uplift effect. Start off-screen so no
  // card is affected before the pointer enters.
  const mouseX = useMotionValue(-10000);
  const mouseY = useMotionValue(-10000);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (effectiveVariant === "simple") return;
    mouseX.set(e.clientX);
    mouseY.set(e.clientY);
  };

  const handleMouseLeave = () => {
    if (effectiveVariant === "simple") return;
    mouseX.set(-10000);
    mouseY.set(-10000);
  };

  return (
    <div
      ref={sectionRef}
      className="relative w-full bg-black text-white"
      style={{ height: `${sectionVh}vh` }}
    >
      {/* Pinned viewport */}
      <div
        className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {background ? (
          <div className="absolute inset-0 z-0 pointer-events-none">
            {background}
          </div>
        ) : null}

        {heading}

        <div className="absolute bottom-[3vw] right-[3vw] z-20 font-mono text-[0.65rem] tracking-[0.2em] uppercase opacity-60 pointer-events-none">
          scroll to surf
        </div>

        {/* 3D scene */}
        <div
          className="absolute inset-0 z-10 flex items-center justify-center"
          style={{
            perspective: "2000px",
            perspectiveOrigin: "10% 10%",
          }}
        >
          <motion.div
            className="relative w-0 h-0"
            style={{ x, y, z, transformStyle: "preserve-3d" }}
          >
            {items.map((item, i) => (
              <Card
                key={item.id}
                item={item}
                i={i}
                count={count}
                mouseX={mouseX}
                mouseY={mouseY}
                scrollSignal={progress}
                variant={effectiveVariant}
              />
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function Card({
  item,
  i,
  count,
  mouseX,
  mouseY,
  scrollSignal,
  variant,
}: {
  item: CollectionItem;
  i: number;
  count: number;
  mouseX: MotionValue<number>;
  mouseY: MotionValue<number>;
  scrollSignal: MotionValue<number>;
  variant: CollectionSurferVariant;
}) {
  const ref = useRef<HTMLDivElement>(null);

  // Distance from the pointer to this card's on-screen centre. `scrollSignal`
  // is only in the dependency list so the value recomputes while scrolling.
  const distance = useTransform([mouseX, mouseY, scrollSignal], ([x, y]: number[]) => {
    if (!ref.current || variant === "simple") return 400;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    return Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
  });

  // Magnetic: closer pointer -> larger card.
  const targetScale = useTransform(distance, [0, 400], [1.5, 1]);
  const springScale = useSpring(targetScale, {
    mass: 0.5,
    stiffness: 300,
    damping: 20,
  });

  // Uplift: closer pointer -> card rises.
  const targetUplift = useTransform(distance, [0, 400], [-100, 0]);
  const springUplift = useSpring(targetUplift, {
    mass: 0.5,
    stiffness: 300,
    damping: 20,
  });

  const transform = useTransform([springScale, springUplift], ([s, u]) => {
    let scaleValue = 1;
    let upliftValue = 0;

    if (variant === "magnetic") {
      scaleValue = Number(s);
    } else if (variant === "uplift") {
      upliftValue = Number(u);
    }

    const baseX = i * STEP_X;
    const baseY = i * STEP_Y;
    const baseZ = i * STEP_Z;

    return `translate3d(${baseX}px, ${baseY + upliftValue}px, ${baseZ}px) rotateY(-50deg) scale(${scaleValue})`;
  });

  return (
    <motion.div
      ref={ref}
      className="absolute w-[300px] h-[400px] bg-neutral-900 overflow-hidden shadow-2xl transition-colors duration-500 ease-out group"
      style={{ transform, transformStyle: "preserve-3d" }}
    >
      <div className="absolute -top-6 -left-4 text-white font-mono text-xs opacity-50 transition-opacity group-hover:opacity-100">
        {String((i % count) + 1).padStart(2, "0")}
      </div>

      <div className="relative w-full h-full brightness-75 group-hover:brightness-100 transition-all duration-300">
        <img
          src={item.image}
          alt={item.title}
          loading="lazy"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-3 font-mono text-[0.7rem] tracking-wider uppercase bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        {item.title}
      </div>

      <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-transparent pointer-events-none" />
    </motion.div>
  );
}

export default CollectionSurfer;
