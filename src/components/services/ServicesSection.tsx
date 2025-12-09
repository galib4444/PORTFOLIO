"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Brain, Code, Target, BarChart3 } from "lucide-react";
import { services } from "@/data/services";
import { milestones } from "@/data/milestones";
import { staggerContainer, staggerItem } from "@/lib/animations";

const iconMap: Record<string, React.ReactNode> = {
  Brain: <Brain size={32} />,
  Code: <Code size={32} />,
  Target: <Target size={32} />,
  BarChart3: <BarChart3 size={32} />,
};

function ServiceCard({
  service,
  index,
}: {
  service: (typeof services)[0];
  index: number;
}) {
  return (
    <motion.div
      variants={staggerItem}
      whileHover={{ scale: 1.02, y: -5 }}
      className="group relative bg-[var(--bg-secondary)] rounded-2xl p-6 border border-[var(--glass-border)] hover:border-[var(--accent-orange)] transition-colors"
      style={{
        transform: `translateY(${index * -10}px)`,
        zIndex: services.length - index,
      }}
    >
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-xl bg-[var(--bg-tertiary)] text-[var(--accent-orange)] group-hover:bg-[var(--accent-orange)] group-hover:text-white transition-colors">
          {iconMap[service.icon]}
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-lg text-[var(--text-primary)] mb-2">
            {service.title}
          </h3>
          <p className="text-sm text-[var(--text-secondary)] font-mono">
            {service.description}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

function MilestoneCounter({
  milestone,
}: {
  milestone: (typeof milestones)[0];
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5 }}
      className="text-center"
    >
      <motion.div
        initial={{ scale: 0.5 }}
        animate={isInView ? { scale: 1 } : {}}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="font-pixel text-4xl md:text-5xl lg:text-6xl text-[var(--text-primary)] mb-2"
      >
        {milestone.value}
      </motion.div>
      <p className="text-sm font-mono text-[var(--text-secondary)] mb-1">
        {milestone.label}
      </p>
      {milestone.source && (
        <p className="text-xs font-mono text-[var(--text-muted)]">
          {milestone.source}
        </p>
      )}
    </motion.div>
  );
}

export function ServicesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      id="services"
      className="py-24 px-4 md:px-8 lg:px-16 bg-[var(--bg-primary)]"
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
            WHAT I DO
          </h2>
          <p className="text-[var(--text-secondary)] font-mono max-w-2xl mx-auto">
            Bridging the gap between technical engineering excellence and
            entrepreneurial vision
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Services Stack */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            className="space-y-4 relative"
          >
            {services.map((service, index) => (
              <ServiceCard key={service.id} service={service} index={index} />
            ))}
          </motion.div>

          {/* Milestones Grid */}
          <div className="grid grid-cols-2 gap-8 content-center">
            {milestones.map((milestone) => (
              <MilestoneCounter key={milestone.id} milestone={milestone} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
