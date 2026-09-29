"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { DragonReflow } from "@/components/hero/DragonReflow";
import { NamePortal } from "@/components/hero/NamePortal";
import { projects } from "@/data/projects";
import { fadeInUp } from "@/lib/animations";

// Background copy the dragon flies through: every project blurb, looped.
const reflowText = projects.map((p) => p.description).join("  ◆  ");

const NAME_LINES = ["GALIB", "MUKTASIN"];

interface ElectricButtonProps {
  href: string;
  variant: "primary" | "secondary";
  children: React.ReactNode;
}

function ElectricButton({ href, variant, children }: ElectricButtonProps) {
  const isPrimary = variant === "primary";

  return (
    <div className="electric-border rounded-full p-[2px] relative z-30 pointer-events-auto">
      <Link
        href={href}
        className={`block px-8 py-3 rounded-full font-mono text-sm tracking-wide transition-colors text-center relative cursor-pointer ${
          isPrimary
            ? "bg-[#1a1a1a] text-white hover:bg-[#333]"
            : "bg-[#e8e8e8] border-2 border-[#1a1a1a] text-[#1a1a1a] hover:bg-[#1a1a1a] hover:text-white"
        }`}
      >
        {children}
      </Link>
    </div>
  );
}

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLHeadingElement>(null);

  return (
    // Tall so the hero can stay pinned while scrolling zooms through a letter of
    // the name (NamePortal); with reduced motion it is just one screen again.
    <section
      ref={sectionRef}
      id="home"
      className="relative h-[300vh] motion-reduce:h-auto"
    >
      <div className="sticky top-0 h-screen p-4 md:p-6 lg:p-8">
      {/* Large rounded container */}
      <div ref={panelRef} className="w-full h-full bg-[#e8e8e8] rounded-[2rem] md:rounded-[3rem] lg:rounded-[4rem] relative overflow-hidden">

        {/* Dragon + project text that re-flows around it (Pretext) */}
        <DragonReflow text={reflowText} />

        {/* The zoom through the name - invisible until the page scrolls */}
        <NamePortal sectionRef={sectionRef} panelRef={panelRef} nameRef={nameRef} lines={NAME_LINES} />

        {/* Inside the letter: what the zoom lands on (NamePortal drives --hero-reveal) */}
        <div
          aria-hidden="true"
          className="absolute inset-0 z-30 flex flex-col justify-center gap-7 px-7 sm:px-[8vw] lg:px-[120px] py-[12vh] text-white opacity-(--hero-reveal,0) pointer-events-none"
        >
          <p className="font-mono text-xs md:text-[13px] tracking-[0.3em] uppercase opacity-85">
            Galib Muktasin
          </p>
          <h2 className="font-pixel text-[clamp(30px,5vw,60px)] leading-[1.02] max-w-[760px] text-balance">
            Engineer · Consultant · Designer
          </h2>
          <p className="font-mono text-[15px] md:text-base lg:text-lg leading-[1.7] max-w-[56ch]">
            Breaking boundaries to craft designs that stand out and deliver results.
            Blending creativity with strategy, turning bold ideas into digital
            experiences that captivate and inspire.
          </p>
          <div className="flex flex-wrap gap-4 [&_a]:[pointer-events:var(--hero-inside-hit,none)]">
            <Link
              href="/projects"
              tabIndex={-1}
              className="rounded-full border-2 border-white bg-white px-7 py-3 font-mono text-[13px] tracking-[0.06em] text-[#ff3b3b] hover:bg-transparent hover:text-white transition-colors"
            >
              VIEW WORK
            </Link>
            <Link
              href="/contact"
              tabIndex={-1}
              className="rounded-full border-2 border-white px-7 py-3 font-mono text-[13px] tracking-[0.06em] text-white hover:bg-white hover:text-[#ff3b3b] transition-colors"
            >
              GET IN TOUCH
            </Link>
          </div>
        </div>

        {/* Centered Content - fades, and stops taking clicks, as the camera moves into the name */}
        <div className="h-full flex flex-col items-center justify-center px-6 md:px-8 lg:px-16 relative z-30 pointer-events-none opacity-(--hero-fade,1) [&_a]:[pointer-events:var(--hero-hit,auto)]">

          {/* Name - Large Gradient Text */}
          <motion.h1
            ref={nameRef}
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            data-reflow-exclude
            className="font-pixel text-6xl sm:text-7xl md:text-8xl lg:text-9xl leading-[0.9] tracking-tight text-center gradient-text"
          >
            {/* zero-size probes mark each line's baseline for NamePortal */}
            GALIB<span data-baseline aria-hidden="true" className="inline-block w-0 h-0" />
            <br />
            MUKTASIN<span data-baseline aria-hidden="true" className="inline-block w-0 h-0" />
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            data-reflow-exclude
            className="mt-6 md:mt-8 text-xs sm:text-sm md:text-base font-mono tracking-[0.2em] md:tracking-[0.3em] text-[#666] uppercase text-center"
          >
            Engineer · Consultant · Designer
          </motion.p>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            data-reflow-exclude
            className="mt-6 md:mt-8 text-sm sm:text-base md:text-lg font-mono leading-relaxed text-[#555] text-center max-w-xl lg:max-w-2xl"
          >
            Breaking boundaries to craft designs that stand out and deliver results.
            Blending creativity with strategy, turning bold ideas into digital
            experiences that captivate and inspire.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.7, duration: 0.4 }}
            data-reflow-exclude
            className="mt-8 md:mt-10 flex flex-col sm:flex-row gap-6 pointer-events-auto"
          >
            <ElectricButton href="/projects" variant="secondary">
              VIEW WORK
            </ElectricButton>
            <ElectricButton href="/contact" variant="secondary">
              GET IN TOUCH
            </ElectricButton>
          </motion.div>

        </div>

      </div>
      </div>
    </section>
  );
}
