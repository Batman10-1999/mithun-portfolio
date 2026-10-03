export const GITHUB_URL = "https://github.com/Mithun-hub15";
export const LINKEDIN_URL = "https://www.linkedin.com/in/mithun-s07/";
export const CONTACT_EMAIL = "mithun.hub15@gmail.com";

export type SectionId =
  | "about"
  | "skills"
  | "projects"
  | "education"
  | "experience"
  | "certifications"
  | "github"
  | "contact";

export type Marker = {
  id: SectionId;
  label: string;
  /** degrees */
  lat: number;
  lon: number;
  color: string;
};

export const MARKERS: Marker[] = [
  { id: "about", label: "Identity", lat: 34, lon: -20, color: "#5ee7e0" },
  { id: "skills", label: "Skills", lat: 8, lon: 46, color: "#8b7bff" },
  { id: "projects", label: "Projects", lat: -18, lon: 110, color: "#ffd27a" },
  { id: "education", label: "Journey", lat: 46, lon: 152, color: "#7fe9ff" },
  { id: "experience", label: "Experience", lat: -38, lon: -78, color: "#ff7ac6" },
  { id: "certifications", label: "Achievements", lat: 18, lon: -132, color: "#9bffb0" },
  { id: "github", label: "GitHub", lat: -31, lon: 8, color: "#87f3d0" },
  { id: "contact", label: "Contact", lat: -8, lon: -170, color: "#ffa46b" },
];

export const ABOUT = {
  eyebrow: "The person behind the systems",
  title: "Mithun",
  focus: "Data • Technology • Problem Solving",
  lead: "Building systems that turn difficult problems into usable tools.",
  body: [
    "My work moves between software, data, and applied AI.",
    "I care about clear logic, useful interfaces, and results people can understand.",
  ],
};

export type Skill = { name: string; usedFor: string };
export type SkillGroup = { id: string; group: string; items: Skill[] };

export const SKILL_GROUPS: SkillGroup[] = [
  {
    id: "data",
    group: "Data",
    items: [
      { name: "Excel", usedFor: "analysis • structured reporting" },
      { name: "SQL", usedFor: "querying • data structure" },
      { name: "Tableau", usedFor: "visual analysis • dashboards" },
      { name: "Power BI", usedFor: "reporting • data visualization" },
      { name: "Data Analysis", usedFor: "patterns • decisions" },
      { name: "Data Visualization", usedFor: "clear visual communication" },
      { name: "Statistics", usedFor: "reasoning • quantitative analysis" },
    ],
  },
  {
    id: "programming",
    group: "Programming",
    items: [
      { name: "Python", usedFor: "data analysis • automation • AI/ML" },
      { name: "Java", usedFor: "programming • application logic" },
      { name: "JavaScript", usedFor: "interactive web applications" },
      { name: "HTML", usedFor: "web structure" },
      { name: "CSS", usedFor: "responsive interfaces" },
    ],
  },
  {
    id: "ai-ml",
    group: "AI / ML",
    items: [
      { name: "Machine Learning", usedFor: "models • applied prediction" },
      { name: "NLP", usedFor: "language-focused systems" },
      { name: "Computer Vision", usedFor: "image and video analysis" },
      { name: "AI Fundamentals", usedFor: "intelligent system foundations" },
    ],
  },
  {
    id: "development",
    group: "Development / Tools",
    items: [
      { name: "Git", usedFor: "version control" },
      { name: "GitHub", usedFor: "code collaboration" },
      { name: "VS Code", usedFor: "development workflow" },
      { name: "Jupyter Notebook", usedFor: "analysis • experimentation" },
      { name: "Database Fundamentals", usedFor: "structured data systems" },
      { name: "Web Development Fundamentals", usedFor: "usable web experiences" },
      { name: "Problem Solving", usedFor: "breaking down complex tasks" },
    ],
  },
];

export type Project = {
  id: string;
  name: string;
  category: string;
  overview: string;
  technologyArea: string;
  signal: string;
};

export const PROJECTS: Project[] = [
  {
    id: "smart-road",
    name: "Smart Road Management System",
    category: "Civic Technology",
    overview:
      "AI-powered platform for reporting, tracking, and analyzing road defects to support smarter urban infrastructure maintenance.",
    technologyArea: "AI • Infrastructure • Data",
    signal: "SR",
  },
  {
    id: "sentinel-ai",
    name: "Sentinel AI",
    category: "AI / Public Safety",
    overview:
      "AI-based public safety and threat monitoring system designed around incident detection and response.",
    technologyArea: "AI • Monitoring • Response",
    signal: "SA",
  },
  {
    id: "krishi-samrudhi",
    name: "Krishi-Samrudhi",
    category: "AI / Agriculture",
    overview:
      "Smart agriculture platform designed to help farmers make informed decisions using AI-driven insights and digital services.",
    technologyArea: "AI • Agriculture • Digital Services",
    signal: "KS",
  },
  {
    id: "trustlens-ai",
    name: "TrustLens AI",
    category: "AI / Media Verification",
    overview:
      "AI-powered deepfake detection and media verification system for identifying manipulated images and videos.",
    technologyArea: "AI • Computer Vision • Verification",
    signal: "TL",
  },
  {
    id: "cs-chat",
    name: "CS Chat",
    category: "Networking / Communication",
    overview:
      "Secure LAN-based chat application designed for local teams operating without internet connectivity.",
    technologyArea: "Networking • Security • Communication",
    signal: "CS",
  },
];

export const JOURNEY_STAGES = [
  { name: "Beginning", note: "Foundations in programming and structured problem solving." },
  { name: "Learning", note: "Working across software, web, and data." },
  { name: "Building", note: "Turning practical problems into usable systems." },
  { name: "Experimenting", note: "Applying machine learning and data analysis." },
  { name: "Exploring", note: "Deepening work in applied AI and analysis." },
];

export type TimelineItem = { title: string; org: string; period: string; note?: string };

export const EDUCATION: TimelineItem[] = [
  {
    title: "Bachelor's Degree — programme details to be added",
    org: "Institution to be added",
    period: "Ongoing",
    note: "Coursework in programming, data structures and data analysis.",
  },
  {
    title: "Higher Secondary Education",
    org: "School details to be added",
    period: "Completed",
  },
];

export const EXPERIENCE: TimelineItem[] = [
  {
    title: "Experience entry — to be added",
    org: "Organisation to be added",
    period: "—",
    note: "Role details will be published once confirmed.",
  },
];

export const CERTIFICATIONS: TimelineItem[] = [
  { title: "Certification — to be added", org: "Issuer to be added", period: "—" },
];
