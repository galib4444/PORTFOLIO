// Built using Hyperiux Vault: https://vault.hyperiux.com
// Adapted: takes its milestones as props (alternating above / below the line
// in date order) and a lead panel in place of the fixed photo, and measures
// how far to slide instead of assuming seven items.
"use client";

import {
  type CSSProperties,
  type ReactNode,
  useLayoutEffect,
  useRef,
  useSyncExternalStore,
} from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

import { cn } from "@/lib/utils";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, SplitText);
}

/* Inline stand-in for @gsap/react's useGSAP. Mirrors its default
   `revertOnUpdate: false`: one gsap.context lives for the component's
   lifetime, the callback is re-added when dependencies change, and the
   context is reverted only on unmount. A callback may return its own
   cleanup, which runs before the next re-add and on unmount. */
function useGSAP(
  callback: () => void | (() => void),
  options?: {
    dependencies?: unknown[];
    scope?: { current: Element | null } | Element | null;
  },
) {
  const deps = options?.dependencies ?? [];
  const scope = options?.scope;
  const ctxRef = useRef<gsap.Context | null>(null);
  const cleanupRef = useRef<(() => void) | undefined>(undefined);

  useLayoutEffect(() => {
    const el =
      scope && typeof scope === "object" && "current" in scope
        ? scope.current
        : (scope as Element | null);
    ctxRef.current = gsap.context(() => {}, el ?? undefined);
    return () => {
      cleanupRef.current?.();
      cleanupRef.current = undefined;
      ctxRef.current?.revert();
      ctxRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useLayoutEffect(() => {
    if (!ctxRef.current) return;
    cleanupRef.current?.();
    const ret = ctxRef.current.add(callback);
    cleanupRef.current = typeof ret === "function" ? ret : undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

export type TimelineItem = {
  /** Unique, class-name safe (letters, digits, dashes). */
  id: string;
  month: string;
  year: string;
  /** Main line under the date. */
  content: string;
  /** Optional second line - e.g. a company with its logo. */
  meta?: ReactNode;
};

export type TimelineProps = {
  /** Milestones in date order; they alternate above and below the line. */
  items: TimelineItem[];
  title?: ReactNode;
  periodLabel?: ReactNode;
  /** The panel the track opens with. */
  lead?: ReactNode;
  textColor?: string;
  mutedTextColor?: string;
  activeColor?: string;
  backgroundColor?: string;
  /** Reveal animation duration, in seconds. */
  duration?: number;
  className?: string;
  id?: string;
};

const MOBILE = 600;
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeToReducedMotion(callback: () => void) {
  const mediaQueryList = window.matchMedia(REDUCED_MOTION_QUERY);
  mediaQueryList.addEventListener("change", callback);
  return () => mediaQueryList.removeEventListener("change", callback);
}

function usePrefersReducedMotion() {
  return useSyncExternalStore(
    subscribeToReducedMotion,
    () => window.matchMedia(REDUCED_MOTION_QUERY).matches,
    () => false,
  );
}

export default function Timeline({
  items,
  title = "Timeline",
  periodLabel,
  lead,
  textColor = "var(--color-foreground, #000000)",
  mutedTextColor = "var(--color-secondary, #3f3f46)",
  activeColor = "#ff5f00",
  backgroundColor = "var(--color-background, #ffffff)",
  duration = 1.2,
  className,
  id = "journey",
}: TimelineProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const wholeSliderRef = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();
  const normalizedDuration = Math.max(0.2, duration);
  const topItems = items.filter((_, i) => i % 2 === 0);
  const bottomItems = items.filter((_, i) => i % 2 === 1);
  const activeStyle: CSSProperties = { backgroundColor: activeColor };
  const mutedTextStyle: CSSProperties = { color: mutedTextColor };
  const itemKey = items.map((item) => item.id).join("|");

  useGSAP(
    () => {
      const section = sectionRef.current;
      const slider = wholeSliderRef.current;
      if (!section || !slider) return;

      const isMobile = window.innerWidth < MOBILE;
      const lineWidth = isMobile ? "65%" : "98%";
      const lineStart = isMobile ? "top 30%" : "top 25%";
      const slideEnd = isMobile ? "82% 50%" : "92% bottom";
      const lineEnd = isMobile ? "80% 50%" : "92% bottom";

      // Slide until the last milestone sits a little in from the right edge -
      // measured, so any number of items ends in the same place.
      const slideTo = () => {
        const left = slider.getBoundingClientRect().left;
        let right = 0;
        slider.querySelectorAll("[data-tl-item]").forEach((el) => {
          right = Math.max(right, el.getBoundingClientRect().right - left);
        });
        return -Math.max(0, right + window.innerWidth * 0.08 - window.innerWidth);
      };

      gsap
        .timeline({
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: slideEnd,
            scrub: true,
            invalidateOnRefresh: true,
          },
          defaults: { ease: "none" },
        })
        .fromTo(slider, { x: 0 }, { x: slideTo });

      if (reducedMotion) {
        gsap.set(".journey-line", { width: lineWidth });
        return;
      }

      gsap.to(".journey-line", {
        width: lineWidth,
        ease: "none",
        scrollTrigger: { trigger: section, start: lineStart, end: lineEnd, scrub: true },
      });
    },
    { dependencies: [reducedMotion, itemKey], scope: sectionRef },
  );

  useGSAP(
    () => {
      const section = sectionRef.current;
      if (!section) return;

      if (reducedMotion) {
        items.forEach((item) => {
          gsap.set(`.jl-${item.id}`, { scaleY: 1 });
          gsap.set(`.jd-${item.id}`, { scale: 1 });
          gsap.set(`.jm-${item.id}`, { opacity: 1, clearProps: "transform" });
        });
        return;
      }

      const splits: InstanceType<typeof SplitText>[] = [];
      const isMobile = window.innerWidth < MOBILE;
      // Reveal windows, as % of the section scrolled: spread evenly between
      // the first and last of the original seven-item tuning.
      const [first, last, span] = isMobile ? [22, 69, 10] : [6, 65, 20];
      const step = items.length > 1 ? (last - first) / (items.length - 1) : 0;

      items.forEach((item, index) => {
        const isTop = index % 2 === 0;
        gsap.set(`.jl-${item.id}`, {
          scaleY: 0,
          transformOrigin: isTop ? "bottom bottom" : "top top",
        });
        gsap.set(`.jd-${item.id}`, { scale: 0 });

        const title = new SplitText(`.title-${item.id}`, { type: "chars, words, lines", mask: "lines" });
        const description = new SplitText(`.description-${item.id}`, { type: "chars, words, lines", mask: "lines" });
        splits.push(title, description);

        const startPos = first + step * index;
        gsap
          .timeline({
            scrollTrigger: {
              trigger: section,
              start: `${startPos}% 30%`,
              end: `${startPos + span}% 50%`,
              scrub: true,
            },
          })
          .to(`.jl-${item.id}`, { scaleY: 1, duration: normalizedDuration * 0.4 })
          .to(`.jd-${item.id}`, { scale: 1, duration: normalizedDuration * 0.4 }, "<")
          .fromTo(
            title.lines,
            { y: 100 },
            { y: 0, delay: -0.8 * normalizedDuration, duration: normalizedDuration, stagger: 0.02, ease: "power2.out" },
          )
          .fromTo(
            description.lines,
            { y: 100 },
            { y: 0, duration: normalizedDuration, stagger: 0.02, ease: "power2.out" },
            "<",
          )
          .fromTo(
            `.jm-${item.id}`,
            { y: 24, opacity: 0 },
            { y: 0, opacity: 1, duration: normalizedDuration * 0.8, ease: "power2.out" },
            "<0.2",
          );
      });

      const handleResize = () => ScrollTrigger.refresh();
      window.addEventListener("resize", handleResize);
      return () => {
        splits.forEach((split) => split.revert());
        window.removeEventListener("resize", handleResize);
      };
    },
    { dependencies: [normalizedDuration, reducedMotion, itemKey], scope: sectionRef },
  );

  const milestone = (item: TimelineItem) => (
    <>
      <h4 className={`title-${item.id} text-[2.5vw] leading-none max-[600px]:text-[6.4vw]`}>
        {item.month} {item.year}
      </h4>
      <p
        className={`description-${item.id} w-[90%] text-[1.5vw] leading-[1.15] max-[600px]:w-[90%] max-[600px]:text-[4.8vw]`}
        style={mutedTextStyle}
      >
        {item.content}
      </p>
      {item.meta ? <div className={`jm-${item.id}`}>{item.meta}</div> : null}
    </>
  );

  return (
    <section
      ref={sectionRef}
      id={id}
      className={cn("h-[200vw] max-[600px]:h-[400vh] w-full relative", className)}
      style={{ color: textColor, backgroundColor }}
    >
      <div className="h-screen w-screen sticky top-[0%] pt-[10%] overflow-hidden max-[600px]:top-[5%]">
        <div
          ref={wholeSliderRef}
          className="mr-[2vw] flex h-[30vw] w-[240vw] items-center gap-[5vw] px-[5vw] max-[600px]:h-[80vh] max-[600px]:w-[800vw] max-[600px]:px-[7vw]"
        >
          <div className="h-full w-[30vw] shrink-0 overflow-hidden rounded-[1vw] max-[600px]:h-[65vw] max-[600px]:w-[85vw] max-[600px]:rounded-[5vw]">
            {lead}
          </div>

          <div className="relative h-full w-full">
            <div className="w-full absolute left-0 top-[49%] flex items-center h-fit">
              <div className="h-[.8vw] max-[600px]:h-[2vw] max-[600px]:w-[2vw] w-[.8vw] rounded-full" style={activeStyle} />
              <div className="h-px w-[0%] rounded-full journey-line" style={activeStyle} />
              <div className="h-[.8vw] max-[600px]:h-[2vw] max-[600px]:w-[2vw] w-[.8vw] rounded-full" style={activeStyle} />
            </div>

            <div className="flex h-1/2 w-full items-center justify-start gap-[.5vw]">
              <div className="h-full w-[20%] shrink-0 pt-[2vw] max-[600px]:h-fit max-[600px]:pt-[5vw]">
                <h2 className="w-[65%] text-[3vw] leading-[0.95] max-[600px]:text-[8.5vw]">{title}</h2>
              </div>

              <div className="w-full flex h-full gap-x-[15vw] max-[600px]:gap-x-[40vw]">
                {topItems.map((item) => (
                  <div
                    key={`top-${item.id}`}
                    data-tl-item
                    className="relative h-full w-[30vw] shrink-0 px-[3vw] max-[600px]:flex max-[600px]:w-[70vw] max-[600px]:flex-col max-[600px]:px-[7vw]"
                  >
                    <div className="w-full absolute left-0 bottom-0 top-0 h-full">
                      <div
                        className={`size-[1vw] max-[600px]:size-[2.5vw] translate-x-[-50%] relative aspect-square rounded-full jd-${item.id}`}
                        style={activeStyle}
                      />
                      <div className={`h-[94%] w-px origin-bottom rounded-full jl-${item.id}`} style={activeStyle} />
                    </div>
                    <div className="mt-[-1vw] space-y-[1vw] max-[600px]:mt-[-2vw]">{milestone(item)}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="h-1/2 flex items-center justify-start w-full">
              <div className="w-[34%] shrink-0 pt-[2vw] max-[600px]:pt-[5vw] max-[600px]:w-[30%] h-full">
                <p className="text-[1.65vw] leading-none max-[600px]:text-[4.2vw]" style={mutedTextStyle}>
                  {periodLabel}
                </p>
              </div>

              <div className="w-full flex h-full gap-x-[20vw] ml-[7vw] max-[600px]:gap-x-[40vw] max-[600px]:ml-[7vw]">
                {bottomItems.map((item) => (
                  <div
                    key={`bottom-${item.id}`}
                    data-tl-item
                    className="relative h-full w-[25vw] shrink-0 px-[3vw] max-[600px]:w-[70vw] max-[600px]:px-[7vw]"
                  >
                    <div className="w-full absolute left-0 bottom-[-1%] h-full">
                      <div
                        className={`h-[94%] origin-top w-px rounded-full max-[600px]:h-full jl-${item.id}`}
                        style={activeStyle}
                      />
                      <div
                        className={`size-[1vw] max-[600px]:size-[2.5vw] translate-x-[-50%] relative w-auto aspect-square rounded-full jd-${item.id}`}
                        style={activeStyle}
                      />
                    </div>
                    <div className="flex h-full w-full flex-col justify-end space-y-[1vw]">{milestone(item)}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
