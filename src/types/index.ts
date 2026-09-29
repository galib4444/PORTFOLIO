export type ProjectType = "engineering" | "business" | "ventures";
export type CardSize = "tall" | "wide" | "square";

export interface Project {
  id: string;
  type: ProjectType;
  title: string;
  category: string;
  description: string;
  techStack: string[];
  imageUrl: string;
  /* Looping TouchDesigner animation; imageUrl doubles as its poster */
  videoUrl?: string;
  link?: string;
  github?: string;
  size: CardSize;
  featured?: boolean;
  impact?: string;
  /* Detail view (shown when a project card is opened) */
  role?: string;
  timeline?: string;
  status?: string;
  context?: string;
  contributions?: string[];
  outcomes?: string[];
}

export interface Job {
  id: string;
  company: string;
  location?: string;
  role: string;
  period: string;
  current?: boolean;
  bullets: string[];
  impact?: string;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface Milestone {
  id: string;
  value: string;
  label: string;
  source?: string;
}

export interface Stat {
  name: string;
  shortName: string;
  value: number;
  skills: string[];
  color: string;
}

export interface NavItem {
  id: string;
  label: string;
  href: string;
}

export interface ContactInfo {
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  github: string;
}
