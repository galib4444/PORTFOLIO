"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ArrowRight, ExternalLink } from "lucide-react";
import Image from "next/image";
import { projects } from "@/data/projects";
import Link from "next/link";
import { staggerContainer, staggerItem } from "@/lib/animations";

const featuredProjects = projects.filter((p) => p.featured).slice(0, 3);

export function ProjectsPreview() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      id="projects-preview"
      className="py-24 px-4 md:px-8 lg:px-16 bg-[var(--bg-primary)]"
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
              SELECTED WORK
            </h2>
            <p className="text-[var(--text-secondary)] font-mono">
              Featured projects across AI, SaaS, and research
            </p>
          </div>
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 text-[var(--accent-orange)] font-mono text-sm hover:gap-3 transition-all"
          >
            View all projects <ArrowRight size={16} />
          </Link>
        </motion.div>

        {/* Projects Grid */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid md:grid-cols-3 gap-6"
        >
          {featuredProjects.map((project) => (
            <motion.article
              key={project.id}
              variants={staggerItem}
              className="group relative bg-[var(--bg-secondary)] rounded-2xl overflow-hidden border border-[var(--glass-border)] hover:border-[var(--accent-orange)] transition-all duration-300"
            >
              {/* Image */}
              <div className={`relative ${project.size === "square" ? "aspect-square" : "aspect-video"}`}>
                {project.imageUrl ? (
                  <Image
                    src={project.imageUrl}
                    alt={project.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[var(--bg-tertiary)] to-[var(--bg-secondary)]">
                    <div className="w-16 h-16 rounded-full bg-[var(--text-muted)] opacity-20" />
                  </div>
                )}
                {project.link && (
                  <a
                    href={project.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute top-3 right-3 p-2 bg-white/90 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
                  >
                    <ExternalLink size={14} className="text-[var(--text-primary)]" />
                  </a>
                )}
              </div>

              {/* Content */}
              <div className="p-5">
                <span className="text-xs font-mono text-[var(--accent-orange)] uppercase tracking-wider">
                  {project.category}
                </span>
                <h3 className="font-bold text-lg text-[var(--text-primary)] mt-1 mb-2 group-hover:text-[var(--accent-orange)] transition-colors">
                  {project.title}
                </h3>
                <p className="text-sm text-[var(--text-secondary)] font-mono leading-relaxed line-clamp-2">
                  {project.description}
                </p>

                {/* Tech Stack - condensed */}
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {project.techStack.slice(0, 3).map((tech) => (
                    <span
                      key={tech}
                      className="px-2 py-0.5 text-xs font-mono bg-[var(--bg-tertiary)] text-[var(--text-muted)] rounded"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
