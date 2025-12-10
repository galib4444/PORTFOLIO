"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { FluidOverlay } from "@/components/webgl/FluidOverlay";
import { fadeInUp } from "@/lib/animations";

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
  return (
    <section
      id="home"
      className="min-h-screen relative p-4 md:p-6 lg:p-8"
    >
      {/* Large rounded container */}
      <div className="w-full h-[calc(100vh-2rem)] md:h-[calc(100vh-3rem)] lg:h-[calc(100vh-4rem)] bg-[#e8e8e8] rounded-[2rem] md:rounded-[3rem] lg:rounded-[4rem] relative overflow-hidden">

        {/* Fluid Distortion Overlay - covers entire container */}
        <FluidOverlay />

        {/* Centered Content */}
        <div className="h-full flex flex-col items-center justify-center px-6 md:px-8 lg:px-16 relative z-30 pointer-events-none">

          {/* Name - Large Gradient Text */}
          <motion.h1
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            className="font-pixel text-6xl sm:text-7xl md:text-8xl lg:text-9xl leading-[0.9] tracking-tight text-center gradient-text"
          >
            GALIB
            <br />
            MUKTASIN
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mt-6 md:mt-8 text-xs sm:text-sm md:text-base font-mono tracking-[0.2em] md:tracking-[0.3em] text-[#666] uppercase text-center"
          >
            Engineer · Consultant · Designer
          </motion.p>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
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
    </section>
  );
}
