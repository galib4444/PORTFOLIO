"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { ExternalLink, Github } from "lucide-react";
import { projects, ventureProjects, engineeringProjects } from "@/data/projects";
import { Project, ProjectType } from "@/types";
import { cn } from "@/lib/cn";
import { staggerContainer, staggerItem } from "@/lib/animations";

function ToggleSwitch({
  activeType,
  onToggle,
}: {
  activeType: ProjectType;
  onToggle: (type: ProjectType) => void;
}) {
  return (
    <div className="flex items-center justify-center mb-12">
      <div className="inline-flex items-center p-1 rounded-full bg-[var(--bg-tertiary)] border border-[var(--glass-border)]">
        <button
          onClick={() => onToggle("ventures")}
          className={cn(
            "px-6 py-2 rounded-full font-mono text-sm transition-all",
            activeType === "ventures"
              ? "bg-[var(--text-primary)] text-[var(--bg-primary)]"
              : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          )}
        >
          VENTURES
        </button>
        <button
          onClick={() => onToggle("engineering")}
          className={cn(
            "px-6 py-2 rounded-full font-mono text-sm transition-all",
            activeType === "engineering"
              ? "bg-[var(--text-primary)] text-[var(--bg-primary)]"
              : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          )}
        >
          ENGINEERING
        </button>
      </div>
    </div>
  );
}

function ProjectCard({ project }: { project: Project }) {
  const sizeClasses = {
    tall: "md:row-span-2",
    wide: "md:col-span-2",
    square: "",
  };

  return (
    <motion.article
      variants={staggerItem}
      layout
      className={cn(
        "group relative bg-[var(--bg-secondary)] rounded-2xl overflow-hidden border border-[var(--glass-border)] hover:border-[var(--accent-orange)] transition-all duration-300",
        sizeClasses[project.size]
      )}
    >
      {/* Image Placeholder */}
      <div
        className={cn(
          "relative bg-gradient-to-br from-[var(--bg-tertiary)] to-[var(--bg-secondary)]",
          project.size === "tall" ? "h-48 md:h-64" : "h-48"
        )}
      >
        {/* Placeholder pattern */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-20 h-20 rounded-full bg-[var(--text-muted)] opacity-20" />
        </div>

        {/* Featured badge */}
        {project.featured && (
          <div className="absolute top-4 left-4 px-3 py-1 bg-[var(--accent-orange)] text-white text-xs font-mono rounded-full">
            FEATURED
          </div>
        )}

        {/* Links */}
        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {project.link && (
            <a
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
            >
              <ExternalLink size={16} className="text-[var(--text-primary)]" />
            </a>
          )}
          {project.github && (
            <a
              href={project.github}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
            >
              <Github size={16} className="text-[var(--text-primary)]" />
            </a>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <span className="text-xs font-mono text-[var(--accent-orange)] uppercase tracking-wider">
          {project.category}
        </span>
        <h3 className="font-bold text-xl text-[var(--text-primary)] mt-2 mb-3 group-hover:text-[var(--accent-orange)] transition-colors">
          {project.title}
        </h3>
        <p className="text-sm text-[var(--text-secondary)] font-mono leading-relaxed mb-4 line-clamp-3">
          {project.description}
        </p>

        {/* Tech Stack */}
        <div className="flex flex-wrap gap-2">
          {project.techStack.slice(0, 4).map((tech) => (
            <span
              key={tech}
              className="px-2 py-1 text-xs font-mono bg-[var(--bg-tertiary)] text-[var(--text-secondary)] rounded"
            >
              {tech}
            </span>
          ))}
        </div>

        {/* Impact */}
        {project.impact && (
          <p className="mt-4 text-xs font-mono text-[var(--accent-green)]">
            ↗ {project.impact}
          </p>
        )}
      </div>
    </motion.article>
  );
}

export function ProjectsSection() {
  const [activeType, setActiveType] = useState<ProjectType>("ventures");
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const displayedProjects =
    activeType === "ventures" ? ventureProjects : engineeringProjects;

  return (
    <section
      id="projects"
      className="py-24 px-4 md:px-8 lg:px-16 bg-[var(--bg-tertiary)]"
      ref={ref}
    >
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-8"
        >
          <h2 className="font-pixel text-3xl md:text-4xl lg:text-5xl text-[var(--text-primary)] mb-4">
            PROJECTS
          </h2>
          <p className="text-[var(--text-secondary)] font-mono max-w-2xl mx-auto">
            From AI-powered platforms to post-quantum cryptography research
          </p>
        </motion.div>

        {/* Toggle */}
        <ToggleSwitch activeType={activeType} onToggle={setActiveType} />

        {/* Projects Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeType}
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {displayedProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
