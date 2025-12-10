"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { FluidOverlay } from "@/components/webgl/FluidOverlay";
import { fadeInUp, slideInLeft, slideInRight } from "@/lib/animations";

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

        {/* Desktop Layout */}
        <div className="hidden lg:flex h-full items-center justify-between px-8 xl:px-16 2xl:px-24 relative z-10 pointer-events-none">
          {/* Left: Name & Subtitle */}
          <motion.div
            variants={slideInLeft}
            initial="hidden"
            animate="visible"
            className="flex-shrink-0"
          >
            <h1 className="font-pixel text-5xl xl:text-6xl 2xl:text-7xl leading-[0.95] tracking-tight text-[#1a1a1a]">
              GALIB
              <br />
              MUKTASIN
            </h1>
            <p className="mt-6 text-xs xl:text-sm font-mono tracking-[0.25em] text-[#666] uppercase">
              Engineer · Consultant · Designer
            </p>
          </motion.div>

          {/* Center: Portrait Image */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            className="absolute left-1/2 -translate-x-1/2 top-0 h-full flex items-end justify-center pb-8"
            style={{ width: "45%", maxWidth: "550px" }}
          >
            <div className="w-full h-[90%] relative">
              <Image
                src="/images/portrait.png"
                alt="Galib Muktasin"
                fill
                className="object-contain object-bottom"
                style={{ filter: "grayscale(40%) contrast(1.15) brightness(1.05)" }}
                priority
              />
            </div>
          </motion.div>

          {/* Right: Manifesto */}
          <motion.div
            variants={slideInRight}
            initial="hidden"
            animate="visible"
            className="max-w-sm flex-shrink-0"
          >
            <p className="text-base xl:text-lg font-mono leading-relaxed text-[#555]">
              Breaking boundaries to craft designs that stand out and deliver results.
              Blending creativity with strategy, turning bold ideas into digital
              experiences that captivate and inspire.
            </p>
          </motion.div>
        </div>

        {/* Mobile/Tablet Layout */}
        <div className="lg:hidden h-full flex flex-col relative z-10 pointer-events-none">
          {/* Portrait - centered */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            className="flex-1 flex items-end justify-center px-8 pt-8"
          >
            <div className="w-full max-w-sm h-[55%] relative">
              <Image
                src="/images/portrait.png"
                alt="Galib Muktasin"
                fill
                className="object-contain object-bottom"
                style={{ filter: "grayscale(40%) contrast(1.15) brightness(1.05)" }}
                priority
              />
            </div>
          </motion.div>

          {/* Text content at bottom */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.2 }}
            className="px-8 pb-28 pt-6 space-y-4"
          >
            <div className="text-center">
              <h1 className="font-pixel text-4xl sm:text-5xl leading-[0.95] tracking-tight text-[#1a1a1a]">
                GALIB
                <br />
                MUKTASIN
              </h1>
              <p className="mt-4 text-xs sm:text-sm font-mono tracking-[0.2em] text-[#666] uppercase">
                Engineer · Consultant · Designer
              </p>
            </div>

            <p className="text-sm sm:text-base font-mono leading-relaxed text-[#555] text-center max-w-md mx-auto">
              Breaking boundaries to craft designs that stand out and deliver results.
            </p>
          </motion.div>
        </div>

      </div>
    </section>
  );
}
