"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { engineeringProjects, businessProjects, ventureProjects } from "@/data/projects";
import { Project, ProjectType } from "@/types";
import { cn } from "@/lib/cn";
import { staggerContainer, staggerItem } from "@/lib/animations";
import { ProjectModal } from "./ProjectModal";
import Image from "next/image";

const allProjects = [...engineeringProjects, ...businessProjects, ...ventureProjects];

function ToggleSwitch({
  activeType,
  onToggle,
}: {
  activeType: ProjectType;
  onToggle: (type: ProjectType) => void;
}) {
  const tabs: { type: ProjectType; label: string }[] = [
    { type: "engineering", label: "ENGINEERING" },
    { type: "business", label: "BUSINESS" },
    { type: "ventures", label: "VENTURES" },
  ];

  return (
    <div className="flex items-center justify-center mb-12">
      <div className="inline-flex items-center p-1 rounded-full bg-[var(--bg-tertiary)] border border-[var(--glass-border)]">
        {tabs.map((tab) => (
          <button
            key={tab.type}
            onClick={() => onToggle(tab.type)}
            className={cn(
              "px-6 py-2 rounded-full font-mono text-sm transition-all",
              activeType === tab.type
                ? "bg-[var(--text-primary)] text-[var(--bg-primary)]"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function ProjectCard({
  project,
  onOpen,
}: {
  project: Project;
  onOpen: () => void;
}) {
  const sizeClasses = {
    tall: "md:row-span-2",
    wide: "md:col-span-2",
    square: "",
  };

  return (
    <motion.button
      type="button"
      onClick={onOpen}
      aria-haspopup="dialog"
      variants={staggerItem}
      layout
      className={cn(
        "group relative text-left w-full bg-[var(--bg-secondary)] rounded-2xl overflow-hidden border border-[var(--glass-border)] hover:border-[var(--accent-orange)] transition-all duration-300",
        sizeClasses[project.size]
      )}
    >
      {/* Image */}
      <div
        className={cn(
          "relative",
          project.size === "tall"
            ? "aspect-[4/3] md:aspect-[3/4]"
            : project.size === "square"
            ? "aspect-square"
            : "aspect-video"
        )}
      >
        {project.imageUrl ? (
          <Image
            src={project.imageUrl}
            alt={project.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[var(--bg-tertiary)] to-[var(--bg-secondary)]">
            <span className="font-pixel text-3xl text-[var(--text-muted)] opacity-40">
              {project.title
                .split(/\s+/)
                .slice(0, 2)
                .map((w) => w[0])
                .join("")}
            </span>
          </div>
        )}

        {/* Featured badge */}
        {project.featured && (
          <div className="absolute top-4 left-4 px-3 py-1 bg-[var(--accent-orange)] text-white text-xs font-mono rounded-full">
            FEATURED
          </div>
        )}

        {/* View details affordance */}
        <div className="absolute bottom-4 right-4 px-3 py-1 rounded-full bg-black/70 text-white text-[10px] font-mono opacity-0 group-hover:opacity-100 transition-opacity">
          VIEW DETAILS →
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
    </motion.button>
  );
}

export function ProjectsSection() {
  const [activeType, setActiveType] = useState<ProjectType>("engineering");
  const [selected, setSelected] = useState<Project | null>(null);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const openProject = useCallback((project: Project) => {
    setSelected(project);
    setActiveType(project.type);
    const url = new URL(window.location.href);
    url.searchParams.set("project", project.id);
    window.history.replaceState({}, "", url.toString());
  }, []);

  const closeProject = useCallback(() => {
    setSelected(null);
    const url = new URL(window.location.href);
    url.searchParams.delete("project");
    window.history.replaceState({}, "", url.toString());
  }, []);

  // Open a project directly from a ?project=<id> link (e.g. from the homepage preview).
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("project");
    if (!id) return;
    const match = allProjects.find((p) => p.id === id);
    if (!match) return;
    queueMicrotask(() => {
      setSelected(match);
      setActiveType(match.type);
    });
  }, []);

  const displayedProjects =
    activeType === "engineering"
      ? engineeringProjects
      : activeType === "business"
      ? businessProjects
      : ventureProjects;

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
            From AI-powered platforms to post-quantum cryptography research —
            select any project for the full breakdown
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
              <ProjectCard
                key={project.id}
                project={project}
                onOpen={() => openProject(project)}
              />
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      <ProjectModal project={selected} onClose={closeProject} />
    </section>
  );
}
