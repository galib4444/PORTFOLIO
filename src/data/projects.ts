import { Project } from "@/types";

export const projects: Project[] = [
  // ===== VENTURES =====
  {
    id: "hustler-ai",
    type: "ventures",
    title: "HustlerAI",
    category: "SaaS Platform",
    description:
      "AI-powered career platform generating ATS-compliant resumes in <60s with 100% compliance and 8/10+ keyword coverage. Full-stack with JWT auth, 17+ API endpoints, Chrome extension.",
    techStack: ["Next.js", "MongoDB", "Gemini API", "Chrome Extension"],
    imageUrl: "/images/projects/hustler-ai.jpg",
    link: "https://hustlerai.app",
    size: "tall",
    featured: true,
    impact: "Reduced job search time by 40%",
  },
  {
    id: "gr-iv",
    type: "ventures",
    title: "GR-iV",
    category: "Techwear Startup",
    description:
      "Innovative techwear startup with CyberCloak smart jacket prototype. Conducted market research with GT-Metrix and SEMrush, developed Shopify e-commerce strategy.",
    techStack: ["Shopify", "SEMrush", "GT-Metrix", "Figma"],
    imageUrl: "/images/projects/gr-iv.jpg",
    size: "wide",
    featured: true,
  },
  {
    id: "macro-daily",
    type: "ventures",
    title: "Macro Daily",
    category: "FinTech Automation",
    description:
      "Zero-cost Python pipeline pulling news & official data from APIs, summarizing via AI, and posting 7:15 ET Telegram briefs. Tableau dashboards for jobs, CPI, yields, trade, GDP.",
    techStack: ["Python", "Telegram API", "Tableau", "Various Gov APIs"],
    imageUrl: "/images/projects/macro-daily.jpg",
    size: "square",
  },
  {
    id: "lifereward",
    type: "ventures",
    title: "LifeReward",
    category: "Mobile Rewards App",
    description:
      "Cross-platform rewards app where users earn real money through games/surveys and cash out via PayPal. React Native with Firebase backend.",
    techStack: ["React Native", "Firebase", "PayPal API", "Node.js"],
    imageUrl: "/images/projects/lifereward.jpg",
    size: "square",
  },

  // ===== ENGINEERING =====
  {
    id: "cross",
    type: "engineering",
    title: "CROSS Cryptography",
    category: "Post-Quantum Security",
    description:
      "Research thesis on post-quantum digital signature scheme using code-based cryptography and zero-knowledge proofs. Benchmarked against NIST PQC candidates (LESS, HAWK, UOV).",
    techStack: ["Python", "C", "Cryptography", "ZKP"],
    imageUrl: "/images/projects/cross.jpg",
    github: "https://github.com/galib/cross",
    size: "tall",
    featured: true,
  },
  {
    id: "drone-detection",
    type: "engineering",
    title: "Drone Detection System",
    category: "Computer Vision",
    description:
      "Real-time drone detection with 95%+ accuracy using YOLO & Roboflow. OpenAI API for model classification, 30% false positive reduction, 0.5s latency.",
    techStack: ["Python", "YOLOv5", "Roboflow", "OpenAI API"],
    imageUrl: "/images/projects/drone.jpg",
    size: "wide",
  },
  {
    id: "multi-drone-sim",
    type: "engineering",
    title: "Multi-Drone Simulation",
    category: "Robotics/AI",
    description:
      "MATLAB-based multi-UAV simulation with PID control, wind resistance, and AI-driven obstacle avoidance. Autonomous navigation to target coordinates.",
    techStack: ["MATLAB", "PID Control", "AI Pathfinding"],
    imageUrl: "/images/projects/multi-drone.jpg",
    github: "https://github.com/galib4444/Multi-Drone-Simulation",
    size: "square",
  },
  {
    id: "library-db",
    type: "engineering",
    title: "Library Database System",
    category: "Database Architecture",
    description:
      "Comprehensive database for Georgia Tech Library with ER/EER diagrams, 3NF normalization. Python system with CRUD, filtering, reporting, and auth.",
    techStack: ["Python", "SQL", "Database Design", "ER Modeling"],
    imageUrl: "/images/projects/library.jpg",
    size: "square",
  },
  {
    id: "retail-prediction",
    type: "engineering",
    title: "Retail Sales Prediction",
    category: "ML/Data Science",
    description:
      "Build Fellowship project: predictive models for retail sales using Prophet, ARIMA, XGBoost/LightGBM. Data preprocessing, feature engineering, business recommendations.",
    techStack: ["Python", "Prophet", "XGBoost", "ARIMA"],
    imageUrl: "/images/projects/retail.jpg",
    size: "wide",
  },
];

export const ventureProjects = projects.filter((p) => p.type === "ventures");
export const engineeringProjects = projects.filter(
  (p) => p.type === "engineering"
);
