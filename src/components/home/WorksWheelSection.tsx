"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { WorksWheel, type WorksWheelItem } from "@/components/ui/works-wheel";
import { projects } from "@/data/projects";

// Project cover photos only - the wheel deliberately skips the videoUrl clips.
const WORKS: WorksWheelItem[] = projects.map((project) => ({
  title: project.title,
  image: project.imageUrl,
  href: `/projects?project=${project.id}`,
}));

/** Page scroll spent on each turn of the wheel (ring -> drum, then one per project). */
const STEP_VH = 25;

/** Pinned while it turns: the section is tall, the wheel sticks to the viewport,
    and how far the page has scrolled through the section is the wheel's position. */
export function WorksWheelSection() {
  const ref = useRef<HTMLElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let frame = 0;
    const read = () => {
      frame = 0;
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const travel = rect.height - window.innerHeight;
      setProgress(travel > 0 ? Math.min(1, Math.max(0, -rect.top / travel)) : 0);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(read);
    };
    read();
    // capture on document: the site scrolls <body>, whose scroll events never reach window
    document.addEventListener("scroll", onScroll, { passive: true, capture: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("scroll", onScroll, { capture: true });
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  // The index and arrow keys ask for a position; scroll the page to it.
  const scrollTo = useCallback((next: number) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const top = rect.top + next * (rect.height - window.innerHeight);
    // Whichever of <body> / <html> is the scroller moves; the other is a no-op.
    document.body.scrollBy({ top, behavior: "smooth" });
    window.scrollBy({ top, behavior: "smooth" });
  }, []);

  return (
    <section
      ref={ref}
      id="selected-work"
      className="relative bg-[var(--bg-primary)]"
      style={{ height: `calc(100vh + ${WORKS.length * STEP_VH}vh)` }}
    >
      {/* z-45: above the hero dragon's fixed canvas (z-40), so it flies under the
          panel; below the nav dock (z-50). Set on the sticky wrapper, since sticky
          starts its own stacking context. Its padding is transparent, so the
          dragon still shows round the panel going in and coming out. */}
      <div className="sticky top-0 z-[45] h-screen p-4 md:p-6 lg:p-8 pointer-events-none">
        <div className="relative h-full rounded-[2rem] md:rounded-[3rem] overflow-hidden border border-[var(--glass-border)] bg-[var(--bg-primary)] pointer-events-auto">
          <WorksWheel
            items={WORKS}
            label={"SELECTED\nWORK"}
            action="View"
            progress={progress}
            onProgressChange={scrollTo}
          />

          <Link
            href="/projects"
            className="absolute left-6 md:left-8 bottom-6 md:bottom-8 z-10 inline-flex items-center gap-2 text-[var(--accent-orange)] font-mono text-sm hover:gap-3 transition-all"
          >
            View all {projects.length} projects <ArrowRight size={16} />
          </Link>
          <p className="pointer-events-none absolute left-1/2 bottom-6 md:bottom-8 -translate-x-1/2 font-mono text-[11px] tracking-[0.12em] uppercase text-[var(--text-muted)] max-md:hidden">
            Keep scrolling
          </p>
        </div>
      </div>
    </section>
  );
}
