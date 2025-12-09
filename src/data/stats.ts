import { Stat, ContactInfo } from "@/types";

export const stats: Stat[] = [
  {
    name: "Intelligence",
    shortName: "INT",
    value: 90,
    skills: ["Claude Code", "OpenAI/Gemini API", "Python", "SQL", "PyTorch", "YOLOv5"],
    color: "#3b82f6",
  },
  {
    name: "Strength",
    shortName: "STR",
    value: 85,
    skills: ["React Native", "Next.js", "Node.js", "MongoDB", "Docker", "C++", "Java"],
    color: "#ff3b3b",
  },
  {
    name: "Charisma",
    shortName: "CHA",
    value: 88,
    skills: ["Public Speaking", "Strategy", "Market Research", "Figma", "Adobe Suite"],
    color: "#00ff88",
  },
  {
    name: "Wisdom",
    shortName: "WIS",
    value: 82,
    skills: ["Psychology", "Geopolitics", "Philosophy", "History", "Emerging Tech Trends"],
    color: "#a855f7",
  },
];

export const languages = [
  "English (Native)",
  "Bengali (Fluent)",
  "Hindi (Conversational)",
  "Urdu (Conversational)",
];

export const education = {
  school: "Queens College, CUNY",
  graduationDate: "June 2026",
  major: "Computer Science",
  minors: ["Business & Liberal Arts (Honors)", "Philosophy"],
};

export const contactInfo: ContactInfo = {
  email: "galibmuktasin44@gmail.com",
  phone: "(347)-468-0380",
  location: "Jamaica, NY 11433",
  linkedin: "https://www.linkedin.com/in/galib-muktasin/",
  github: "https://github.com/galib4444",
};
