"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { experience } from "@/data/experience";
import Link from "next/link";
import { staggerContainer, staggerItem } from "@/lib/animations";

export function ExperiencePreview() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      id="experience-preview"
      className="py-24 px-4 md:px-8 lg:px-16 bg-[var(--bg-tertiary)]"
      ref={ref}
    >
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12"
        >
          <div>
            <h2 className="font-pixel text-3xl md:text-4xl text-[var(--text-primary)] mb-2">
              EXPERIENCE
            </h2>
            <p className="text-[var(--text-secondary)] font-mono">
              Building products and advising startups
            </p>
          </div>
          <Link
            href="/experience"
            className="inline-flex items-center gap-2 text-[var(--accent-orange)] font-mono text-sm hover:gap-3 transition-all"
          >
            View full timeline <ArrowRight size={16} />
          </Link>
        </motion.div>

        {/* Experience Cards - Horizontal Layout */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid md:grid-cols-3 gap-6"
        >
          {experience.map((job) => (
            <motion.div
              key={job.id}
              variants={staggerItem}
              className="bg-[var(--bg-secondary)] rounded-2xl p-6 border border-[var(--glass-border)] hover:border-[var(--accent-orange)] transition-colors"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-[var(--text-primary)]">
                      {job.role}
                    </h3>
                    {job.current && (
                      <span className="px-1.5 py-0.5 text-[10px] font-mono bg-[var(--accent-green)] text-white rounded">
                        NOW
                      </span>
                    )}
                  </div>
                  <p className="text-[var(--accent-orange)] font-mono text-sm">
                    {job.company}
                  </p>
                </div>
              </div>

              {/* Period */}
              <p className="text-xs font-mono text-[var(--text-muted)] mb-4">
                {job.period}
              </p>

              {/* Key highlight - just first bullet */}
              <p className="text-sm font-mono text-[var(--text-secondary)] leading-relaxed line-clamp-2">
                {job.bullets[0]}
              </p>

              {/* Impact */}
              <div className="mt-4 pt-4 border-t border-[var(--glass-border)]">
                <p className="text-xs font-mono text-[var(--accent-green)]">
                  {job.impact}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
