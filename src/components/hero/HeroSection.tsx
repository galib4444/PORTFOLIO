"use client";

import { motion } from "framer-motion";
import { LiquidPortrait } from "@/components/webgl/LiquidPortrait";
import { fadeInUp, slideInLeft, slideInRight } from "@/lib/animations";

export function HeroSection() {
  return (
    <section
      id="home"
      className="min-h-screen flex items-center justify-center px-4 md:px-8 lg:px-16 py-20"
    >
      <div className="max-w-7xl w-full">
        {/* Desktop: 3-column layout */}
        <div className="hidden lg:grid lg:grid-cols-3 lg:gap-8 lg:items-center">
          {/* Left: Name & Title */}
          <motion.div
            variants={slideInLeft}
            initial="hidden"
            animate="visible"
            className="space-y-4"
          >
            <h1 className="font-pixel text-6xl xl:text-7xl 2xl:text-8xl leading-[0.9] tracking-tight text-[var(--text-primary)]">
              GALIB
              <br />
              MUKTASIN
            </h1>
            <p className="text-sm font-mono tracking-[0.2em] text-[var(--text-secondary)] uppercase">
              Engineer · Consultant · Designer
            </p>
          </motion.div>

          {/* Center: Portrait */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.2 }}
            className="flex justify-center"
          >
            <div className="w-full max-w-md aspect-[3/4] relative">
              <LiquidPortrait />
            </div>
          </motion.div>

          {/* Right: Manifesto */}
          <motion.div
            variants={slideInRight}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            <blockquote className="text-lg xl:text-xl font-mono leading-relaxed text-[var(--text-primary)]">
              &ldquo;Breaking boundaries to craft designs that stand out and
              deliver results. Blending creativity with strategy, turning bold
              ideas into digital experiences that captivate and inspire.&rdquo;
            </blockquote>
            <div className="flex gap-4">
              <motion.a
                href="/projects"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-6 py-3 bg-[var(--text-primary)] text-[var(--bg-primary)] rounded-full font-mono text-sm tracking-wide"
              >
                VIEW WORK
              </motion.a>
              <motion.a
                href="/#contact"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-6 py-3 border border-[var(--text-primary)] text-[var(--text-primary)] rounded-full font-mono text-sm tracking-wide"
              >
                GET IN TOUCH
              </motion.a>
            </div>
          </motion.div>
        </div>

        {/* Mobile/Tablet: Stacked layout */}
        <div className="lg:hidden flex flex-col items-center text-center space-y-8">
          {/* Portrait */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            className="w-full max-w-xs aspect-[3/4] relative"
          >
            <LiquidPortrait />
          </motion.div>

          {/* Name */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.1 }}
            className="space-y-4"
          >
            <h1 className="font-pixel text-4xl sm:text-5xl md:text-6xl leading-[0.9] tracking-tight text-[var(--text-primary)]">
              GALIB
              <br />
              MUKTASIN
            </h1>
            <p className="text-xs sm:text-sm font-mono tracking-[0.15em] text-[var(--text-secondary)] uppercase">
              Engineer · Consultant · Designer
            </p>
          </motion.div>

          {/* Manifesto */}
          <motion.blockquote
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.2 }}
            className="text-base sm:text-lg font-mono leading-relaxed text-[var(--text-primary)] max-w-md"
          >
            &ldquo;Breaking boundaries to craft designs that stand out and
            deliver results.&rdquo;
          </motion.blockquote>

          {/* CTAs */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <a
              href="/projects"
              className="px-6 py-3 bg-[var(--text-primary)] text-[var(--bg-primary)] rounded-full font-mono text-sm tracking-wide"
            >
              VIEW WORK
            </a>
            <a
              href="/#contact"
              className="px-6 py-3 border border-[var(--text-primary)] text-[var(--text-primary)] rounded-full font-mono text-sm tracking-wide"
            >
              GET IN TOUCH
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
