"use client";

import Link from "next/link";
import { CollectionSurfer, type CollectionItem } from "@/components/ui/collection-surfer";
import { projects } from "@/data/projects";

// Every project that has a thumbnail, pointed at the normalised (375x500)
// copies in /public/images/projects/surf so all cards share one dimension.
const surfItems: CollectionItem[] = projects
  .filter((p) => p.imageUrl)
  .map((p) => ({
    id: p.id,
    title: p.title,
    image: p.imageUrl.replace(
      "/images/projects/",
      "/images/projects/surf/",
    ),
  }));

export function HeroSection() {
  return (
    <section id="home" aria-label="Galib Muktasin — selected work">
      <CollectionSurfer
        items={surfItems}
        variant="magnetic"
        heading={
          <div className="absolute top-[7vh] left-[6vw] right-[6vw] z-20 mix-blend-difference pointer-events-none">
            <p className="font-mono text-[0.7rem] sm:text-xs tracking-[0.32em] uppercase opacity-80">
              Galib Muktasin — Engineer · Consultant · Designer
            </p>

            <h1 className="mt-5 font-pixel leading-[0.85] tracking-tight text-[clamp(2.75rem,10vw,7.5rem)]">
              SELECTED
              <br />
              WORK
              <span className="align-top ml-3 font-mono tabular-nums text-[0.3em] opacity-70">
                ({surfItems.length})
              </span>
            </h1>

            <div className="mt-8 flex flex-wrap gap-4 font-mono text-xs uppercase tracking-[0.2em] pointer-events-auto">
              <Link
                href="/projects"
                className="border border-white/70 px-5 py-2.5 hover:bg-white hover:text-black transition-colors"
              >
                View all work
              </Link>
              <Link
                href="/#contact"
                className="border border-white/70 px-5 py-2.5 hover:bg-white hover:text-black transition-colors"
              >
                Get in touch
              </Link>
            </div>
          </div>
        }
      />
    </section>
  );
}
