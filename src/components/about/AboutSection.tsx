"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { stats, languages, education } from "@/data/stats";
import { staggerContainer, staggerItem } from "@/lib/animations";

function StatBar({ stat, index }: { stat: (typeof stats)[0]; index: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      variants={staggerItem}
      className="space-y-3"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span
            className="font-pixel text-2xl"
            style={{ color: stat.color }}
          >
            {stat.shortName}
          </span>
          <span className="text-sm font-mono text-[var(--text-secondary)]">
            {stat.name}
          </span>
        </div>
        <span className="font-mono text-lg text-[var(--text-primary)]">
          {stat.value}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="h-3 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={isInView ? { width: `${stat.value}%` } : {}}
          transition={{ duration: 1, delay: index * 0.1, ease: "easeOut" }}
          className="h-full rounded-full"
          style={{ backgroundColor: stat.color }}
        />
      </div>

      {/* Skills */}
      <div className="flex flex-wrap gap-2">
        {stat.skills.map((skill) => (
          <span
            key={skill}
            className="px-2 py-1 text-xs font-mono rounded"
            style={{
              backgroundColor: `${stat.color}20`,
              color: stat.color,
            }}
          >
            {skill}
          </span>
        ))}
      </div>
    </motion.div>
  );
}

export function AboutSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      id="about"
      className="py-24 px-4 md:px-8 lg:px-16 bg-[var(--bg-tertiary)]"
      ref={ref}
    >
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-16"
        >
          <h2 className="font-pixel text-3xl md:text-4xl lg:text-5xl text-[var(--text-primary)] mb-4">
            CHARACTER SHEET
          </h2>
          <p className="text-[var(--text-secondary)] font-mono max-w-2xl mx-auto">
            Full-Stack Founder stats and abilities
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Left: Bio Card */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.2 }}
            className="space-y-8"
          >
            {/* Profile Card */}
            <div className="bg-[var(--bg-secondary)] rounded-2xl p-8 border border-[var(--glass-border)]">
              {/* Avatar Placeholder */}
              <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-[var(--accent-orange)] to-[var(--accent-red)] flex items-center justify-center">
                <span className="font-pixel text-4xl text-white">GM</span>
              </div>

              <div className="text-center mb-6">
                <h3 className="font-pixel text-2xl text-[var(--text-primary)] mb-2">
                  GALIB MUKTASIN
                </h3>
                <p className="text-sm font-mono text-[var(--accent-orange)]">
                  AI Engineer & Tech Strategist
                </p>
              </div>

              {/* Education */}
              <div className="pt-6 border-t border-[var(--glass-border)]">
                <h4 className="font-mono text-xs text-[var(--text-muted)] uppercase tracking-wider mb-3">
                  Education
                </h4>
                <p className="font-bold text-[var(--text-primary)]">
                  {education.school}
                </p>
                <p className="text-sm text-[var(--text-secondary)] font-mono">
                  {education.major} • {education.graduationDate}
                </p>
                <div className="mt-2 space-y-1">
                  {education.minors.map((minor) => (
                    <p
                      key={minor}
                      className="text-xs font-mono text-[var(--text-muted)]"
                    >
                      Minor: {minor}
                    </p>
                  ))}
                </div>
              </div>
            </div>

            {/* Languages */}
            <div className="bg-[var(--bg-secondary)] rounded-2xl p-6 border border-[var(--glass-border)]">
              <h4 className="font-mono text-xs text-[var(--text-muted)] uppercase tracking-wider mb-4">
                Languages
              </h4>
              <div className="flex flex-wrap gap-2">
                {languages.map((lang) => (
                  <span
                    key={lang}
                    className="px-3 py-1.5 text-sm font-mono bg-[var(--bg-tertiary)] text-[var(--text-secondary)] rounded-full"
                  >
                    {lang}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right: RPG Stats */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            className="bg-[var(--bg-secondary)] rounded-2xl p-8 border border-[var(--glass-border)]"
          >
            <h4 className="font-mono text-xs text-[var(--text-muted)] uppercase tracking-wider mb-8">
              Ability Scores
            </h4>
            <div className="space-y-8">
              {stats.map((stat, index) => (
                <StatBar key={stat.shortName} stat={stat} index={index} />
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
