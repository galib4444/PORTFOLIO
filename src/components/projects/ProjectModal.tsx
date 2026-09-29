"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ExternalLink, Github } from "lucide-react";
import { ProjectMedia } from "./ProjectMedia";
import { Project } from "@/types";

export function ProjectModal({
  project,
  onClose,
}: {
  project: Project | null;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!project) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [project, onClose]);

  return (
    <AnimatePresence>
      {project && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 md:p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Panel */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={project.title}
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ type: "spring", damping: 26, stiffness: 260 }}
            className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto bg-[var(--bg-secondary)] rounded-2xl border border-[var(--glass-border)]"
          >
            <button
              onClick={onClose}
              aria-label="Close"
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-[var(--bg-tertiary)] text-[var(--text-primary)] hover:bg-[var(--accent-orange)] hover:text-white transition-colors"
            >
              <X size={18} />
            </button>

            {(project.videoUrl || project.imageUrl) && (
              <div className="relative aspect-video w-full overflow-hidden rounded-t-2xl">
                <ProjectMedia project={project} />
              </div>
            )}

            <div className="p-6 md:p-8">
              <span className="text-xs font-mono text-[var(--accent-orange)] uppercase tracking-wider">
                {project.category}
              </span>
              <h2 className="font-pixel text-2xl md:text-3xl text-[var(--text-primary)] mt-2 mb-3">
                {project.title}
              </h2>

              {/* Meta */}
              {(project.role || project.timeline || project.status) && (
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs font-mono text-[var(--text-muted)] mb-5">
                  {project.role && (
                    <span>
                      Role:{" "}
                      <span className="text-[var(--text-secondary)]">
                        {project.role}
                      </span>
                    </span>
                  )}
                  {project.timeline && <span>{project.timeline}</span>}
                  {project.status && (
                    <span className="text-[var(--text-secondary)]">
                      {project.status}
                    </span>
                  )}
                </div>
              )}

              {project.context && (
                <p className="text-sm font-mono leading-relaxed text-[var(--text-secondary)] mb-6">
                  {project.context}
                </p>
              )}

              {project.contributions && project.contributions.length > 0 ? (
                <div className="mb-6">
                  <h3 className="font-mono text-xs uppercase tracking-wider text-[var(--text-muted)] mb-3">
                    What I did
                  </h3>
                  <ul className="space-y-2">
                    {project.contributions.map((c, i) => (
                      <li
                        key={i}
                        className="flex gap-2 text-sm font-mono text-[var(--text-secondary)] leading-relaxed"
                      >
                        <span className="text-[var(--accent-orange)] mt-0.5 shrink-0">
                          →
                        </span>
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="text-sm font-mono text-[var(--text-secondary)] leading-relaxed mb-6">
                  {project.description}
                </p>
              )}

              {project.outcomes && project.outcomes.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-mono text-xs uppercase tracking-wider text-[var(--text-muted)] mb-3">
                    Outcome
                  </h3>
                  <ul className="space-y-2">
                    {project.outcomes.map((o, i) => (
                      <li
                        key={i}
                        className="flex gap-2 text-sm font-mono text-[var(--accent-green)] leading-relaxed"
                      >
                        <span className="mt-0.5 shrink-0">↗</span>
                        {o}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Tech stack */}
              <div className="flex flex-wrap gap-2">
                {project.techStack.map((tech) => (
                  <span
                    key={tech}
                    className="px-2 py-1 text-xs font-mono bg-[var(--bg-tertiary)] text-[var(--text-secondary)] rounded"
                  >
                    {tech}
                  </span>
                ))}
              </div>

              {/* Links */}
              {(project.link || project.github) && (
                <div className="flex flex-wrap gap-3 mt-6 pt-5 border-t border-[var(--glass-border)]">
                  {project.link && (
                    <a
                      href={project.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--text-primary)] text-[var(--bg-primary)] font-mono text-xs hover:opacity-90 transition-opacity"
                    >
                      <ExternalLink size={14} /> Live
                    </a>
                  )}
                  {project.github && (
                    <a
                      href={project.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[var(--text-primary)] text-[var(--text-primary)] font-mono text-xs hover:bg-[var(--text-primary)] hover:text-[var(--bg-primary)] transition-colors"
                    >
                      <Github size={14} /> GitHub
                    </a>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
