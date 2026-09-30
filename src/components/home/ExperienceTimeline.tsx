"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Timeline, { type TimelineItem } from "@/components/ui/timeline";
import { experience } from "@/data/experience";

/** Short names and logos for the timeline; the full names live in experience.ts. */
const COMPANIES: Record<string, { name: string; logo: string }> = {
  "tiqc-associate": { name: "TIQC", logo: "/images/logos/tiqc.png" },
  "tiqc-consultant": { name: "TIQC", logo: "/images/logos/tiqc.png" },
  "handshake-ai": { name: "Handshake AI", logo: "/images/logos/handshake.jpg" },
  "code-resolve": { name: "Code Resolve", logo: "/images/logos/code-resolve.jpg" },
  griv: { name: "GR-iV", logo: "/images/logos/gr-iv.jpg" },
  "amoco-bp": { name: "Amoco BP", logo: "/images/logos/bp.jpg" },
};

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/** "February 2025 - Present" -> start month and year. */
function start(period: string) {
  const [month, year] = period.split(" - ")[0].trim().split(/\s+/);
  return { month, year, order: Number(year) * 12 + MONTHS.indexOf(month) };
}

const ITEMS: TimelineItem[] = experience
  .map((job) => ({ job, ...start(job.period) }))
  .sort((a, b) => a.order - b.order)
  .map(({ job, month, year }) => {
    const company = COMPANIES[job.id] ?? { name: job.company, logo: "" };
    return {
      id: job.id,
      month,
      year,
      content: job.role,
      meta: (
        <span className="inline-flex items-center gap-[.6vw] mt-[.6vw] text-[1.25vw] text-[var(--text-primary)] max-[600px]:gap-[2vw] max-[600px]:mt-[1.8vw] max-[600px]:text-[4vw]">
          {company.logo ? (
            // eslint-disable-next-line @next/next/no-img-element -- tiny logo tile, sized in vw
            <img
              src={company.logo}
              alt=""
              className="shrink-0 size-[2.2vw] rounded-[.45vw] object-contain bg-white ring-1 ring-black/10 max-[600px]:size-[7vw] max-[600px]:rounded-[1.6vw]"
            />
          ) : null}
          {company.name}
        </span>
      ),
    };
  });

const years = ITEMS.map((item) => Number(item.year));
const PERIOD = `${Math.min(...years)} — ${new Date().getFullYear()}`;

export function ExperienceTimeline() {
  return (
    <Timeline
      id="experience-preview"
      items={ITEMS}
      title={<span className="font-pixel">EXPERIENCE</span>}
      periodLabel={PERIOD}
      textColor="var(--text-primary)"
      mutedTextColor="var(--text-secondary)"
      activeColor="var(--accent-orange)"
      backgroundColor="var(--bg-tertiary)"
      duration={1.4}
      className="font-mono"
      lead={
        <div className="flex h-full flex-col justify-between p-[2.2vw] text-white bg-[radial-gradient(circle_at_20%_15%,rgba(255,200,120,0.45),transparent_40%),linear-gradient(135deg,#ff6b35_0%,#ff3b3b_100%)] max-[600px]:p-[6vw]">
          <span className="text-[.95vw] tracking-[0.3em] uppercase max-[600px]:text-[3vw]">Galib Muktasin</span>
          <div>
            <p className="font-pixel text-[9vw] leading-[0.85] max-[600px]:text-[26vw]">
              {String(ITEMS.length).padStart(2, "0")}
            </p>
            <p className="font-pixel text-[2.2vw] leading-none mt-[.6vw] max-[600px]:text-[6.5vw] max-[600px]:mt-[2vw]">
              ROLES
            </p>
          </div>
          <Link
            href="/experience"
            className="inline-flex items-center gap-[.5vw] text-[.95vw] tracking-[0.12em] uppercase hover:gap-[.8vw] transition-all max-[600px]:text-[3vw] max-[600px]:gap-[1.5vw]"
          >
            View full timeline <ArrowRight className="size-[1vw] max-[600px]:size-[3.2vw]" />
          </Link>
        </div>
      }
    />
  );
}
