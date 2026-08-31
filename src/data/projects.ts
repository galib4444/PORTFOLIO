import { Project } from "@/types";

export const projects: Project[] = [
  // ===== ENGINEERING =====
  {
    id: "ai-job-platform",
    type: "engineering",
    title: "AI Job Application Platform",
    category: "AI Career Platform",
    description:
      "An AI career platform taken from idea to a working product in a single hackathon weekend: an 8-agent architecture, a 100-point match scorer, and a Chrome extension for form autofill.",
    techStack: ["Next.js", "TypeScript", "MongoDB", "Gemini API", "Chrome Extension", "JWT"],
    imageUrl: "/images/projects/hustler-ai.jpg",
    size: "tall",
    featured: true,
    role: "Full-stack developer (2-person team)",
    timeline: "October 2025 · Hackathon",
    status: "Working product delivered within the weekend",
    context:
      "A hackathon build with Yong, an intern I had previously onboarded on Lease Sync. The goal was to take an AI career platform from idea to a working product in one weekend.",
    contributions: [
      "Took the platform from idea to a working product in a weekend using Next.js, TypeScript, MongoDB, and the Gemini API.",
      "Designed an 8-agent architecture with a 100-point match scorer weighting skills, must-haves, seniority, and evidence.",
      "Built the full workflow: job description analysis, document generation, STAR interview preparation, and an analytics dashboard.",
      "Implemented JWT authentication, MongoDB models, and 17+ API endpoints.",
      "Built a Chrome extension for form autofill.",
    ],
    outcomes: ["Complete working product shipped inside the hackathon weekend."],
  },
  {
    id: "cross",
    type: "engineering",
    title: "CROSS Cryptography System",
    category: "Post-Quantum Cryptography",
    description:
      "A team thesis on a post-quantum digital signature scheme using code-based cryptography and zero-knowledge proofs, benchmarked against NIST PQC candidates.",
    techStack: ["Python", "Code-Based Cryptography", "Zero-Knowledge Proofs", "NIST PQC"],
    imageUrl: "/images/projects/cross.jpg",
    size: "square",
    featured: true,
    role: "Team lead & researcher",
    timeline: "January – May 2025",
    status: "Technical report and presentation delivered",
    context:
      "A team project and thesis on quantum-resistant digital signatures for secure communications and defense applications.",
    contributions: [
      "Led, researched, and developed CROSS, a post-quantum digital signature scheme based on code-based cryptography and zero-knowledge proofs (ZKPs).",
      "Implemented key generation, signing, and verification with parity-check matrices and syndrome decoding.",
      "Benchmarked CROSS against other NIST PQC candidates (LESS, HAWK, UOV) for security, scalability, and efficiency.",
      "Prepared a technical report and presentation on quantum-resistant cryptographic signatures.",
    ],
  },
  {
    id: "lease-sync",
    type: "engineering",
    title: "Lease Sync",
    category: "Cross-Platform App",
    description:
      "A cross-platform lease management app built end to end at TIQC — development, testing, validation, documentation, and a screen-recorded walkthrough — with CI/CD.",
    techStack: ["React Native", "Node.js/Express", "MongoDB", "Redis", "CI/CD"],
    imageUrl: "",
    size: "square",
    role: "Lead developer",
    timeline: "2025 · TIQC client delivery",
    status: "MVP delivered to client, ahead of deadline",
    context:
      "A TIQC client engagement. I owned the MVP end to end and onboarded an intern onto the project mid-build.",
    contributions: [
      "Built the MVP end to end: development, testing, debugging, validation, added functionality, full documentation, and a screen-recorded walkthrough.",
      "Built cross-platform with React Native, Node.js/Express, MongoDB, and Redis, with CI/CD implemented.",
      "Ran a closed AI development loop: ChatGPT wrote the PRD, Claude Code was the primary builder and debugger, Gemini audited the output, and Google Stitch handled design iteration.",
      "Coordinated with client stakeholders across delivery, documentation, and project timelines.",
      "Onboarded Yong, an intern with no software experience, mid-project — hands-on with Cursor and Claude Code, PRD writing, and scoping against a timeline.",
    ],
    outcomes: [
      "Delivered ahead of deadline.",
      "Intern was working independently within days and went on to build a hackathon project with me.",
    ],
  },
  {
    id: "reward-app",
    type: "engineering",
    title: "Reward App",
    category: "Mobile App (MVP)",
    description:
      "A reward-based gaming and survey app MVP built at TIQC — PRD through frontend and backend to a delivered prototype.",
    techStack: ["React Native", "Firebase"],
    imageUrl: "",
    size: "square",
    role: "MVP lead",
    timeline: "2025 · TIQC",
    status: "Prototype delivered to client",
    context:
      "A reward-based gaming and survey app. I led the MVP from specification to a delivered prototype.",
    contributions: [
      "Wrote the PRD and coordinated stakeholders.",
      "Handled frontend and backend development.",
      "Delivered the prototype to the client, built with React Native and Firebase.",
    ],
  },
  {
    id: "drone-detection",
    type: "engineering",
    title: "Drone Detection, Counting & Classification",
    category: "Computer Vision",
    description:
      "A real-time drone detection system using YOLO and Roboflow with 95%+ accuracy, OpenAI API classification, and a pipeline tuned for low latency and fewer false positives.",
    techStack: ["Python", "YOLO", "Roboflow", "OpenAI API"],
    imageUrl: "",
    size: "wide",
    role: "Personal project",
    timeline: "February 2025",
    status: "Working prototype",
    context: "A personal project aimed at security, surveillance, and defense applications.",
    contributions: [
      "Developed a real-time drone detection system using YOLO and Roboflow with 95%+ accuracy.",
      "Integrated the OpenAI API for drone model classification to enhance threat identification.",
      "Optimized the detection pipeline, cutting false positives by 30% with 0.5s latency.",
    ],
    outcomes: ["95%+ detection accuracy", "30% fewer false positives at 0.5s latency"],
  },
  {
    id: "macro-daily",
    type: "engineering",
    title: "Macro Daily",
    category: "Data & Reporting Pipeline",
    description:
      "A zero-cost Python pipeline that pulls news and official data from multiple public APIs, builds an algorithmic summary, and auto-publishes a 7:15 ET Telegram brief.",
    techStack: ["Python", "Public Data APIs", "Telegram Bot API"],
    imageUrl: "/images/projects/macro-daily.jpg",
    size: "square",
    role: "Builder",
    timeline: "July – September 2025",
    status: "Shipped; program later discontinued by the Economics Department",
    context:
      "Built for the Queens College Fed Challenge. The daily summary is algorithmic, not AI-generated.",
    contributions: [
      "Shipped a zero-cost Python pipeline pulling news and official data from multiple public APIs.",
      "Generated an algorithmic summary (not AI-generated) and auto-published a 7:15 ET Telegram brief.",
      "Built it in a closed AI development loop: ChatGPT for concept ideation, Claude Code as the primary builder and debugger, Gemini as the auditor.",
    ],
    outcomes: ["Automated a daily economic brief at zero infrastructure cost."],
  },
  {
    id: "multi-drone-sim",
    type: "engineering",
    title: "Multi-Drone Simulation",
    category: "Robotics / Simulation",
    description:
      "A MATLAB multi-drone AI simulation modeling UAV navigation in a 3D environment with PID altitude control, wind resistance, and AI-driven obstacle avoidance.",
    techStack: ["MATLAB", "PID Control", "AI Path Planning"],
    imageUrl: "",
    github: "https://github.com/galib4444/Multi-Drone-Simulation",
    size: "square",
    role: "Personal project",
    timeline: "February 2025",
    status: "Published on GitHub",
    context: "A personal project modeling real-world UAV navigation.",
    contributions: [
      "Developed a MATLAB multi-drone AI simulation modeling real-world UAV navigation in a 3D environment.",
      "Incorporated PID control for altitude stability, wind resistance effects, and AI-driven obstacle avoidance.",
      "Enabled drones to autonomously navigate from multiple origin points to a shared target coordinate while avoiding collisions.",
    ],
  },
  {
    id: "library-db",
    type: "engineering",
    title: "Library Database System",
    category: "Database Design",
    description:
      "A database system designed and normalized against the Georgia Tech Library data model, with a Python application for records, reporting, and authentication.",
    techStack: ["Python", "SQL", "ER/EER Modeling", "3NF"],
    imageUrl: "",
    size: "square",
    role: "Team project",
    timeline: "January – May 2025 · Coursework",
    context: "A database systems course project modeling books, members, staff, and loan operations.",
    contributions: [
      "Designed and normalized a database against the Georgia Tech Library data model, including ER/EER diagrams, functional dependencies, and 3NF decomposition.",
      "Developed a Python system with record creation, updates, filtering, reporting, and user authentication.",
      "Implemented the frontend interface and backend logic collaboratively, integrating membership management, loan tracking, and admin controls.",
    ],
  },
  {
    id: "webwise",
    type: "engineering",
    title: "WebWise Creators",
    category: "Web Platform",
    description:
      "A team-built web service platform with sticky menus, sliding cards, and tooltips, wireframed for UI optimization and built to SEO best practices.",
    techStack: ["HTML", "CSS", "JavaScript", "SEO"],
    imageUrl: "/images/projects/webwise.jpg",
    github: "https://github.com/VRS-Empty/CS355-Project1",
    size: "square",
    role: "Team lead",
    timeline: "February 2024 · Team project",
    context: "A web technologies course project building a web service platform.",
    contributions: [
      "Led a team to develop and design a web service platform with HTML, CSS, and JavaScript.",
      "Enhanced user engagement with sticky menus, sliding cards, and tooltips.",
      "Used wireframing tools for an optimized UI and applied SEO best practices.",
      "Managed project timelines and collaborated on content strategy.",
    ],
  },

  // ===== BUSINESS =====
  {
    id: "glo-bus",
    type: "business",
    title: "Glo-Bus Business Simulation",
    category: "Business Simulation",
    description:
      "Led my team to 1st place in the Glo-Bus global business simulation — the first and only team in competition history to surpass $1B in revenue.",
    techStack: ["Strategy", "Operations", "Marketing", "Finance"],
    imageUrl: "/images/projects/glo-bus.jpg",
    size: "wide",
    featured: true,
    impact: "First team to surpass $1B revenue",
    role: "Team lead",
    timeline: "Fall 2024",
    status: "1st place",
    context:
      "A semester-long global business simulation run across teams, managing a virtual camera and drone company.",
    contributions: [
      "Led my team to 1st place, becoming the first and only team to surpass $1 billion in revenue in competition history.",
      "Achieved global market dominance with #1 market share in both cameras and drones across all regions.",
      "Spearheaded product design, drone-camera marketing, and operations, optimizing cost efficiency and customer demand.",
    ],
    outcomes: [
      "1st place",
      "First team over $1B revenue in competition history",
      "#1 market share in every region, both product lines",
    ],
  },
  {
    id: "retail-prediction",
    type: "business",
    title: "Predicting Retail Sales with Data Analytics",
    category: "ML / Forecasting",
    description:
      "A Build Fellowship project: predictive models for retail store sales using time-series forecasting and machine learning, translated into business recommendations.",
    techStack: ["Python", "Prophet", "ARIMA", "XGBoost / LightGBM"],
    imageUrl: "/images/projects/retail.jpg",
    size: "wide",
    featured: true,
    role: "Student consultant",
    timeline: "September – December 2025",
    context:
      "A Build Fellowship engagement on a project team led by Build Fellow Nicholas Yuwono, designing predictive models for retail store sales.",
    contributions: [
      "Applied time-series forecasting and machine learning (Prophet, ARIMA, XGBoost/LightGBM) to predict sales trends and inform business strategy.",
      "Conducted data preprocessing, feature engineering, and model evaluation to improve accuracy and reduce forecasting error.",
      "Produced a final deliverable translating predictive insights into recommendations for inventory, staffing, and promotions.",
    ],
  },
  {
    id: "fed-challenge",
    type: "business",
    title: "Queens College Fed Challenge",
    category: "Economic Research",
    description:
      "Turned ongoing macroeconomic research into clear policy scenarios for the Fed Challenge, supported by Tableau dashboards across jobs, CPI, yields, trade, and GDP.",
    techStack: ["Tableau", "Macroeconomic Analysis", "Data Visualization"],
    imageUrl: "/images/projects/fed-challenge.jpg",
    size: "square",
    featured: true,
    impact: "Research and dashboards for the Fed Challenge",
    role: "Researcher",
    timeline: "July – September 2025",
    status: "Program discontinued by the Economics Department",
    context:
      "Queens College's Fed Challenge team. The Macro Daily pipeline is listed as its own project; this entry covers the research and policy work.",
    contributions: [
      "Turned ongoing macroeconomic research into clear policy scenarios for the Fed Challenge.",
      "Created Tableau dashboards for jobs, CPI, yields, trade, and GDP.",
    ],
  },
  {
    id: "qc-enrollment",
    type: "business",
    title: "QC Admission & Enrollment Analysis",
    category: "Data Analysis",
    description:
      "Analyzed a decade of Queens College enrollment data to identify decline drivers and recommended student-support and outreach strategies.",
    techStack: ["Data Analysis", "Marketing Strategy", "Research"],
    imageUrl: "/images/projects/qc-enrollment.jpg",
    size: "wide",
    role: "Team project",
    timeline: "Fall 2022",
    context:
      "A team analysis of Queens College enrollment trends from 2013 to 2022.",
    contributions: [
      "Analyzed enrollment data from 2013 to 2022 to pinpoint declining-enrollment drivers, including under-communicated resources and suboptimal academic advising.",
      "Recommended enhancements for student support and campus life to boost engagement.",
      "Developed targeted marketing strategies: word-of-mouth campaigns, stronger social media presence, and personalized outreach.",
    ],
  },

  // ===== VENTURES =====
  {
    id: "gr-iv",
    type: "ventures",
    title: "GR-iV / CyberCloak",
    category: "Techwear Startup",
    description:
      "A techwear startup built around CyberCloak, a smart jacket taken from concept to a working physical prototype, with a Shopify e-commerce foundation for launch.",
    techStack: ["Shopify", "SEMrush", "GT-Metrix", "Figma"],
    imageUrl: "/images/projects/gr-iv.jpg",
    size: "square",
    featured: true,
    role: "Founder",
    timeline: "November 2023 – March 2026",
    status: "Wound down in March 2026",
    context:
      "A solo-founded venture in the techwear market, with applications in consumer and public safety.",
    contributions: [
      "Took the CyberCloak smart jacket concept from idea to a working physical prototype.",
      "Ran market research with GT-Metrix and SEMrush, including SWOT analysis, to identify opportunities and competitive positioning.",
      "Built the e-commerce foundation for launch, including a Shopify storefront optimized for UX and search visibility.",
    ],
    outcomes: [
      "Wound the venture down in March 2026 after hitting manufacturing cost and sourcing limits as a solo founder.",
    ],
  },
  {
    id: "promptugraphy",
    type: "ventures",
    title: "Promptugraphy",
    category: "Prompt Pack Product",
    description:
      "A prompt pack product for students, freelancers, small businesses, and general users, drawing on ideas from philosophy, neuroscience, and psychology.",
    techStack: ["Prompt Engineering", "Product Design"],
    imageUrl: "",
    size: "square",
    featured: true,
    role: "Founder / creator",
    timeline: "2026",
    status: "Product complete; marketing materials in progress. Not yet listed for sale.",
    context:
      "A packaged prompt product aimed at a broad range of users, grounded in ideas from philosophy, neuroscience, and psychology.",
    contributions: [
      "Built the prompt pack product end to end.",
      "Designed it for students, freelancers, small businesses, and general users.",
    ],
    outcomes: ["Product complete; in pre-launch."],
  },
];

export const engineeringProjects = projects.filter((p) => p.type === "engineering");
export const businessProjects = projects.filter((p) => p.type === "business");
export const ventureProjects = projects.filter((p) => p.type === "ventures");
