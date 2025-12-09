"use client";

import { useRef } from "react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { experience } from "@/data/experience";
import { staggerItem } from "@/lib/animations";

function TimelineItem({
  job,
  index,
}: {
  job: (typeof experience)[0];
  index: number;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      variants={staggerItem}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      className="relative pl-8 pb-12 last:pb-0"
    >
      {/* Timeline line */}
      <div className="absolute left-0 top-0 bottom-0 w-px bg-[var(--bg-tertiary)]">
        <motion.div
          initial={{ height: 0 }}
          animate={isInView ? { height: "100%" } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="w-full bg-[var(--accent-orange)]"
        />
      </div>

      {/* Timeline dot */}
      <motion.div
        initial={{ scale: 0 }}
        animate={isInView ? { scale: 1 } : {}}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="absolute left-0 top-0 -translate-x-1/2 w-4 h-4 rounded-full bg-[var(--accent-orange)] border-4 border-[var(--bg-primary)]"
      />

      {/* Content */}
      <div className="bg-[var(--bg-secondary)] rounded-2xl p-6 border border-[var(--glass-border)] hover:border-[var(--accent-orange)] transition-colors">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h3 className="font-bold text-lg text-[var(--text-primary)]">
                {job.role}
              </h3>
              {job.current && (
                <span className="px-2 py-0.5 text-xs font-mono bg-[var(--accent-green)] text-white rounded-full">
                  CURRENT
                </span>
              )}
            </div>
            <p className="text-[var(--accent-orange)] font-mono text-sm">
              {job.company}
            </p>
            {job.location && (
              <p className="text-[var(--text-muted)] font-mono text-xs mt-1">
                {job.location}
              </p>
            )}
          </div>
          <span className="text-sm font-mono text-[var(--text-secondary)] whitespace-nowrap">
            {job.period}
          </span>
        </div>

        {/* Bullets */}
        <ul className="space-y-2 mb-4">
          {job.bullets.map((bullet, i) => (
            <li
              key={i}
              className="flex items-start gap-2 text-sm font-mono text-[var(--text-secondary)]"
            >
              <span className="text-[var(--accent-orange)] mt-1">→</span>
              {bullet}
            </li>
          ))}
        </ul>

        {/* Impact */}
        <div className="pt-4 border-t border-[var(--glass-border)]">
          <p className="text-xs font-mono text-[var(--accent-green)]">
            <span className="text-[var(--text-muted)]">Impact:</span>{" "}
            {job.impact}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export function ExperienceSection() {
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const lineHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <section
      id="experience"
      className="py-24 px-4 md:px-8 lg:px-16 bg-[var(--bg-primary)]"
      ref={containerRef}
    >
      <div className="max-w-4xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-16"
        >
          <h2 className="font-pixel text-3xl md:text-4xl lg:text-5xl text-[var(--text-primary)] mb-4">
            EXPERIENCE
          </h2>
          <p className="text-[var(--text-secondary)] font-mono max-w-2xl mx-auto">
            Building production software and advising startups
          </p>
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          {experience.map((job, index) => (
            <TimelineItem key={job.id} job={job} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
