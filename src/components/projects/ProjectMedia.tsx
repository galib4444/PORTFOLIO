"use client";

import Image from "next/image";
import { Project } from "@/types";

interface ProjectMediaProps {
  project: Project;
  className?: string;
}

/* Fills its (relative) parent: looping video if present, else image, else initials */
export function ProjectMedia({ project, className = "object-cover" }: ProjectMediaProps) {
  if (project.videoUrl) {
    return (
      <video
        src={project.videoUrl}
        poster={project.imageUrl || undefined}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        aria-label={project.title}
        className={`absolute inset-0 h-full w-full ${className}`}
      />
    );
  }

  if (project.imageUrl) {
    return <Image src={project.imageUrl} alt={project.title} fill className={className} />;
  }

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[var(--bg-tertiary)] to-[var(--bg-secondary)]">
      <span className="font-pixel text-3xl text-[var(--text-muted)] opacity-40">
        {project.title
          .split(/\s+/)
          .slice(0, 2)
          .map((w) => w[0])
          .join("")}
      </span>
    </div>
  );
}
