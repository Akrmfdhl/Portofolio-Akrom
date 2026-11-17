import catatCrypto from '../assets/catat-crypto.png';
import lmsCurriculum from '../assets/lms-curriculum.png';
import tiss from '../assets/tiss.png';
import blocksim from '../assets/blocksim.png';
import fotoCv from '../assets/FOTO CV.jpeg';

export function sanitizeExternalUrl(url?: string): string | undefined {
  if (!url) return undefined;
  const trimmed = url.trim();
  if (
    trimmed.startsWith('https:') ||
    trimmed.startsWith('http:') ||
    trimmed.startsWith('mailto:') ||
    trimmed.startsWith('tel:')
  ) {
    return trimmed;
  }
  return undefined;
}

export function sanitizeTextInput(raw: string, maxLen = 120): string {
  let out = '';
  for (let i = 0; i < raw.length; i++) {
    const code = raw.charCodeAt(i);
    if (code >= 32 && code !== 127) {
      out += raw[i];
    }
  }
  return out.trim().slice(0, maxLen);
}

export interface ExperienceItem {
  id: string;
  role: string;
  company: string;
  location: string;
  period: string;
  isCurrent: boolean;
  metricsBadge: string;
  sectorCode: string;
  description: string[];
  technologies: string[];
  liveUrl?: string;
}

export interface SkillCluster {
  id: string;
  title: string;
  code: string;
  skills: string[];
}

export interface ProjectNodeItem {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  planetName: string;
  role: string;
  category: 'ai' | 'distributed' | 'fintech' | 'web3' | 'mobile';
  featured: boolean;
  status: 'live' | 'production' | 'open-source';
  summary: string;
  problem: string;
  approach: string;
  outcome: string;
  highlights: string[];
  technologies: string[];
  metric: string;
  screenshotUrl: string;
  githubUrl?: string;
  liveUrl?: string;
}

export interface SpatialStop {
  id: string;
  kind: 'edge' | 'proxy' | 'rack' | 'rag' | 'project' | 'archive' | 'delivered';
  label: string;
  sector: string;
  coordinates: string;
  povLabel: string;
  vehicleStage: 'car' | 'train' | 'aircraft' | 'rocket';
  cardSide: 'left' | 'right';
  index: number;
  anchor: [number, number, number];
  cam: [number, number, number];
  look: [number, number, number];
  packet: [number, number, number];
}

export interface RailGroup {
  id: string;
  label: string;
  host: string;
  kinds: SpatialStop['kind'][];
}

export const PALETTE_NUM = {
  ground: 0x0b1628,
  deep: 0x04070e,
  surface: 0x161f30,
  chalk: 0xe2e8f0,
  dim: 0x94a3b8,
  faint: 0x334155,
  amber: 0xea580c,
  link: 0x10b981,
  cyan: 0x38bdf8,
  red: 0xef4444,
};

export interface AtmosphereZone {
  stopIndex: number;
  bg: number;
  fog: number;
  zenith: number;
  horizon: number;
  groundSky: number;
  keyLight: number;
  rimLight: number;
  sunGlow: number;
}

export const ATMOSPHERE_ZONES: AtmosphereZone[] = [
  {
    stopIndex: 0,
    bg: 0x5d8eb8,
    fog: 0x8fb5d4,
    zenith: 0x2f6ba3,
    horizon: 0xb7d1e6,
    groundSky: 0x223229,
    keyLight: 0xfff3de,
    rimLight: 0x7cb0e0,
    sunGlow: 1.0,
  },
  {
    stopIndex: 3,
    bg: 0x4b7ca8,
    fog: 0x7ca3c4,
    zenith: 0x24588a,
    horizon: 0x9cbdd9,
    groundSky: 0x1c2b24,
    keyLight: 0xfff5e4,
    rimLight: 0x6ea2d6,
    sunGlow: 0.9,
  },
  {
    stopIndex: 6,
    bg: 0x274d7a,
    fog: 0x4b77a3,
    zenith: 0x12325e,
    horizon: 0x6f9ec7,
    groundSky: 0x1d354f,
    keyLight: 0xfef9ed,
    rimLight: 0x5ca0dc,
    sunGlow: 0.85,
  },
  {
    stopIndex: 8,
    bg: 0x0e1c38,
    fog: 0x182e52,
    zenith: 0x060d1c,
    horizon: 0x294a7a,
    groundSky: 0x0a1324,
    keyLight: 0xf8fafc,
    rimLight: 0x38bdf8,
    sunGlow: 0.55,
  },
  {
    stopIndex: 10,
    bg: 0x050812,
    fog: 0x050812,
    zenith: 0x03050a,
    horizon: 0x091022,
    groundSky: 0x04060c,
    keyLight: 0xfdf2dc,
    rimLight: 0x60a5fa,
    sunGlow: 0.18,
  },
  {
    stopIndex: 12,
    bg: 0x04070e,
    fog: 0x04070e,
    zenith: 0x020409,
    horizon: 0x07101c,
    groundSky: 0x030509,
    keyLight: 0xecfdf5,
    rimLight: 0x34d399,
    sunGlow: 0.12,
  },
];

export function getActiveVehicleLabel(t: number): string {
  if (t < 1.65) return 'Grand Touring Car';
  if (t < 5.5) return 'Mountain Express Train';
  if (t < 8.5) return 'Stratosphere Jet Aircraft';
  return 'Orbital Rocket';
}

export const PROFILE = {
  name: 'Akrom Fadhil',
  fullName: 'Akrom Fadhil M.',
  handle: 'Akrom Fadhil',
  title: 'Fullstack, Multi-Agent AI & Distributed Systems Engineer',
  email: 'akromfadhil234@gmail.com',
  phone: '0858-9019-1405',
  whatsapp: 'https://wa.me/6285890191405',
  github: 'https://github.com/Akrmfdhl',
  linkedin: 'https://linkedin.com/in/akrom',
  location: 'Rajeg, Kab. Tangerang, Banten 15540, Indonesia',
  avatarUrl: fotoCv,
  bio: 'Software Engineer & Computer Science scholar architecting full-stack web applications, Python/FastAPI multi-agent AI platforms, high-throughput Go backends (< 100ms replication), and interactive React/TypeScript interfaces.',
  aboutStory: [
    'Co-Founder & Fullstack Architect at Vora AI — leading the React/TypeScript, Node.js/Express, and Python/FastAPI multi-agent ERP automation system (-40% ops delay).',
    'Core Contributor (~65% Monorepo Ownership) at TISS Enterprise Platform — driving Go/Gin replication services, Redis pub/sub channels, and PostgreSQL partitioning at 10k/sec.',
    'Frontend Systems Developer at PT Neo Era Cuan & Catat Crypto — shipping WCAG AAA-accessible financial telemetry and GSAP/Framer Motion visualization modules.',
    'Computer Science Student at Universitas Sultan Ageng Tirtayasa (UNTIRTA, 2025–Present) & Software Engineering (RPL) Graduate from SMKN 5 Kab. Tangerang (2021–2024).',
  ],
  stats: [
    { value: '< 100ms', label: 'Node Replication', detail: 'Go + Redis event sync' },
    { value: '65%', label: 'Monorepo Ownership', detail: 'TISS full-stack codebase' },
    { value: '10k/sec', label: 'Query Throughput', detail: 'Parallel Postgres writes' },
    { value: '-40%', label: 'Workflow Latency', detail: 'Vora AI multi-agent ops' },
  ],
};

export const EXPERIENCES: ExperienceItem[] = [
  {
    id: 'exp-vora',
    role: 'Co-Founder & Fullstack Architect',
    company: 'Vora AI',
    location: 'Indonesia · Hybrid',
    period: '2025 – Present',
    isCurrent: true,
    metricsBadge: '40% Faster Workflows',
    sectorCode: 'MOUNTAIN PASS STATION 01',
    description: [
      'Architected a distributed multi-agent automation platform spanning a React/Vite/TypeScript dashboard, Node.js/Express API gateway, and Python/FastAPI agent runtime.',
      'Unified siloed SME inventory, logistics, sales, finance, and compliance workflows into one PostgreSQL state machine.',
      'Designed inter-agent validation guards cutting operational delays by 40%.',
    ],
    technologies: ['React', 'TypeScript', 'Node.js', 'Express', 'Python', 'FastAPI', 'PostgreSQL'],
  },
  {
    id: 'exp-tiss',
    role: 'Core Monorepo Engineer (~65% Ownership)',
    company: 'TISS Enterprise Platform',
    location: 'Indonesia · Distributed',
    period: '2024 – 2025',
    isCurrent: false,
    metricsBadge: '< 100ms Replication',
    sectorCode: 'VALLEY VIADUCT STATION 02',
    description: [
      'Drove ~65% of implementation across the monorepo for a multi-tenant tracking and synchronization system.',
      'Led Go (Gin + GORM) backend refactors with Redis pub/sub event channels and lock reconciliation workers.',
      'Scaled PostgreSQL write partitioning to 10k queries/sec under 100ms cross-node latency.',
    ],
    technologies: ['Go', 'Gin', 'GORM', 'PostgreSQL', 'Redis', 'Docker', 'React', 'TypeScript'],
  },
  {
    id: 'exp-neo',
    role: 'Frontend Systems Developer',
    company: 'PT Neo Era Cuan & Catat Crypto',
    location: 'Remote · Indonesia',
    period: '2024 – 2025',
    isCurrent: false,
    metricsBadge: '+15% Faster Load',
    sectorCode: 'ALPINE EXPRESS STATION 03',
    description: [
      'Engineered financial tracking, portfolio telemetry, and crypto trading journal interfaces in React, TypeScript, Tailwind CSS, and GSAP.',
      'Built modular transaction history widgets, interactive charts, and EN/ID localization.',
      'Delivered WCAG AAA contrast compliance while cutting component load times by 15%.',
    ],
    technologies: ['React', 'TypeScript', 'Tailwind CSS', 'GSAP', 'Framer Motion', 'FinTech UI'],
    liveUrl: 'https://github.com/Akrmfdhl/catat-crypto',
  },
  {
    id: 'exp-inovindo',
    role: 'Front-End, ERD & Production Internships',
    company: 'PT. INOVINDO Multimedia & PT. Multi Nugraha Kencana',
    location: 'Bandung & Tangerang, Indonesia',
    period: '2022 – 2023',
    isCurrent: false,
    metricsBadge: 'ERD · UI · Operations',
    sectorCode: 'AIRFIELD TERMINAL STATION 04',
    description: [
      'PT. INOVINDO Multimedia (Aug–Nov 2022): Designed wireframes, UI layouts, digital web content, and relational ERD models for client web applications.',
      'PT. Multi Nugraha Kencana (Jun–Sep 2023): Executed precision upholstery & assembly workflows on the production line with strict quality accuracy.',
    ],
    technologies: ['HTML5', 'CSS3', 'JavaScript', 'ERD Modeling', 'Wireframing', 'Teamwork'],
  },
];

export const SKILL_CLUSTERS: SkillCluster[] = [
  {
    id: 'cluster-ai',
    title: 'Multi-Agent AI & Data',
    code: 'AI CORE',
    skills: [
      'Multi-Agent Orchestration',
      'Python & FastAPI Microservices',
      'PostgreSQL & ERD Modeling',
      'Automated Workflow Pipelines',
    ],
  },
  {
    id: 'cluster-backend',
    title: 'Backend & Distributed Systems',
    code: 'SYS MESH',
    skills: [
      'Go (Golang), Gin & GORM',
      'Node.js & Express Gateways',
      'Redis Pub/Sub & Event Bus',
      'RESTful APIs & Partitioning',
    ],
  },
  {
    id: 'cluster-frontend',
    title: 'Frontend & 3D WebGL',
    code: 'FLIGHT UI',
    skills: [
      'React, TypeScript & Vite',
      'Three.js, GLSL & WebGL',
      'GSAP ScrollTrigger & Lenis',
      'Tailwind CSS & WCAG AAA UI',
    ],
  },
  {
    id: 'cluster-infra',
    title: 'Tooling & Core Strengths',
    code: 'OPS BAY',
    skills: [
      'Docker, Git & GitHub CI',
      'Kotlin & Jetpack Compose',
      'Problem Solving & Fast Learner',
      'Time Management & Detail',
    ],
  },
];

export const PROJECTS: ProjectNodeItem[] = [
  {
    id: 'proj-vora-ai',
    slug: 'vora-ai',
    title: 'Vora AI',
    subtitle: 'Multi-Agent Enterprise Workflow & ERP Automation Platform',
    planetName: 'STRATOSPHERE CORRIDOR · AI COMMAND',
    role: 'Co-Founder & Lead Fullstack Architect',
    category: 'ai',
    featured: true,
    status: 'production',
    summary:
      'Multi-agent platform unifying inventory, logistics, finance, sales, and compliance workflows for SMEs and e-commerce.',
    problem:
      'SMEs face operational silos where inventory, logistics, sales, and finance data live in disconnected tools.',
    approach:
      'Architected a 3-tier system: React/Vite/TS frontend, Node.js/Express gateway, and Python/FastAPI multi-agent orchestration backed by PostgreSQL.',
    outcome:
      'Delivered an autonomous operations dashboard that reduces cross-department operational delays by 40%.',
    highlights: [
      '5 domain AI agents coordinating over shared PostgreSQL state.',
      'Real-time React + TypeScript control plane for approvals and monitoring.',
    ],
    technologies: ['React', 'TypeScript', 'Node.js', 'Express', 'Python', 'FastAPI', 'PostgreSQL'],
    metric: '-40% operational delay · 5 AI agents',
    screenshotUrl: lmsCurriculum,
  },
  {
    id: 'proj-tiss',
    slug: 'tiss',
    title: 'TISS',
    subtitle: 'Distributed Multi-Tenant Synchronization & Replication Engine',
    planetName: 'MESOSPHERE CLIMB · SYNC RELAY',
    role: 'Core Contributor (~65% Monorepo Ownership)',
    category: 'distributed',
    featured: true,
    status: 'production',
    summary:
      'Enterprise tracking and synchronization platform deployed across multi-tenant distributed sites with sub-100ms replication.',
    problem:
      'Legacy sync services suffered data lag and row-lock conflicts during high-volume replication cycles.',
    approach:
      'Refactored backend services in Go (Gin + GORM) with Redis pub/sub event channels, PostgreSQL partitioning, and React dashboards.',
    outcome:
      'Unified multi-tenant nodes under 100ms replication latency and 10k queries/sec throughput.',
    highlights: [
      'Go + Gin + GORM high-concurrency replication engine with lock reconciliation.',
      'Owned ~65% of full-stack monorepo codebase across Go, Docker, and React.',
    ],
    technologies: ['Go', 'Gin', 'GORM', 'PostgreSQL', 'Redis', 'Docker', 'React', 'TypeScript'],
    metric: '< 100ms sync · 10k queries/sec · 99.9% uptime',
    screenshotUrl: tiss,
  },
  {
    id: 'proj-neo-era-cuan',
    slug: 'neo-era-cuan',
    title: 'PT Neo Era Cuan',
    subtitle: 'High-Frequency Financial Telemetry & Investment Interface',
    planetName: 'LUNAR ORBIT · TELEMETRY ARRAY',
    role: 'Frontend Systems Developer',
    category: 'fintech',
    featured: true,
    status: 'production',
    summary:
      'Production financial tracking and investment platform engineered for extreme responsiveness across mobile and desktop viewports.',
    problem:
      'Complex financial transaction logs were sluggish and difficult to navigate on compact mobile screens.',
    approach:
      'Built modular React/TypeScript layout engines with custom hooks and accessible UI tokens.',
    outcome:
      'Shipped a WCAG AAA-accessible web application with zero layout shift across all breakpoints.',
    highlights: [
      'Responsive multi-viewport financial tables and ledger pagination.',
      'Strict design tokens meeting WCAG AAA contrast benchmarks.',
    ],
    technologies: ['React', 'TypeScript', 'Tailwind CSS', 'Framer Motion'],
    metric: 'AAA Accessibility · 60fps FinTech UI',
    screenshotUrl: tiss,
  },
  {
    id: 'proj-catat-crypto',
    slug: 'catat-crypto',
    title: 'Catat Crypto',
    subtitle: 'Motion-Driven Crypto Trading Journal & Portfolio Analytics SPA',
    planetName: 'SATURNIAN ORBIT · RING OBSERVATORY',
    role: 'Frontend Contributor — GSAP & Motion Systems',
    category: 'web3',
    featured: true,
    status: 'open-source',
    summary:
      'Interactive crypto trading journal SPA featuring GSAP portfolio charts, multi-wallet tracking, and EN/ID i18n.',
    problem:
      'Traders lacked a clean, unified journal for PnL and transaction history across CEX and DEX wallets.',
    approach:
      'Built modular transaction widgets, custom GSAP + Framer Motion charts, and localization toggles.',
    outcome:
      'Delivered resilient portfolio displays and reduced initial component load times by ~15%.',
    highlights: [
      'GSAP + Framer Motion telemetry charts for trade execution analysis.',
      'Bundle optimization trimming component load times by ~15%.',
    ],
    technologies: ['React', 'TypeScript', 'Tailwind CSS', 'GSAP', 'Framer Motion'],
    metric: '-15% load time · Open Source',
    screenshotUrl: catatCrypto,
    githubUrl: 'https://github.com/Akrmfdhl/catat-crypto',
  },
  {
    id: 'proj-blocksim',
    slug: 'blocksim',
    title: 'BlockSim Android',
    subtitle: 'Interactive Blockchain Cryptography & Consensus Simulator',
    planetName: 'SATELLITE 01 · CRYPTOGRAPHY LAB',
    role: 'Fullstack & Mobile Engineer',
    category: 'mobile',
    featured: false,
    status: 'production',
    summary:
      'Native Android micro-learning app with 7 interactive blockchain simulations, SHA-256 visualizers, and Go Fiber backend.',
    problem: 'Learners struggle to visualize cryptographic hashing and Merkle trees without interactive tools.',
    approach: 'Built a Kotlin Jetpack Compose app paired with a Go Fiber + PostgreSQL API.',
    outcome: '7 hands-on blockchain simulation labs with completion tracking.',
    highlights: ['Kotlin + Jetpack Compose native UI', 'Go Fiber + PostgreSQL backend'],
    technologies: ['Kotlin', 'Jetpack Compose', 'Go', 'Fiber', 'PostgreSQL'],
    metric: '7 Interactive Labs',
    screenshotUrl: blocksim,
  },
  {
    id: 'proj-lms-curriculum',
    slug: 'lms-curriculum',
    title: 'Modular LMS & Curriculum Engine',
    subtitle: 'Academic Portal & Structured Learning Management System',
    planetName: 'SATELLITE 02 · CURRICULUM GRAPH',
    role: 'Fullstack Developer',
    category: 'distributed',
    featured: false,
    status: 'production',
    summary:
      'End-to-end learning management system with structured curriculum graphs, RBAC, and progress tracking.',
    problem: 'Traditional portals lack clear curriculum dependencies and live telemetry.',
    approach: 'Built a React + TypeScript frontend backed by relational database schemas.',
    outcome: 'Streamlined course delivery and student analytics in one unified UI.',
    highlights: ['Role-based curriculum graph', 'Real-time student progress'],
    technologies: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Tailwind CSS'],
    metric: 'Unified Academic Graph',
    screenshotUrl: lmsCurriculum,
  },
  {
    id: 'proj-webgl-grid',
    slug: 'webgl-grid',
    title: 'Multi-Vehicle 3D WebGL Engine',
    subtitle: 'Procedural Car, Train, Aircraft, Rocket & Mountain Valley Pipeline',
    planetName: 'SATELLITE 03 · WEBGL ENGINE',
    role: 'Graphics & Frontend Engineer',
    category: 'ai',
    featured: false,
    status: 'live',
    summary:
      'Custom Three.js r186 + GLSL storytelling engine with alpine FBM terrain, multi-angle camera director, and WebAudio soundscape.',
    problem: 'Static 2D pages rarely communicate interactive 3D engineering craft.',
    approach: 'Built every vehicle, mountain terrain mesh, and sky shader procedurally with zero external GLBs.',
    outcome: 'Smooth 60fps responsive experience across mobile and desktop screens.',
    highlights: ['Procedural FBM mountains', '4 custom 3D vehicles'],
    technologies: ['Three.js', 'GLSL Shaders', 'GSAP ScrollTrigger', 'Lenis', 'WebAudio API'],
    metric: '60fps WebGL · Zero External Models',
    screenshotUrl: tiss,
  },
  {
    id: 'proj-redis-mesh',
    slug: 'redis-mesh',
    title: 'High-Throughput Query Router',
    subtitle: 'Parallel PostgreSQL Partitioning & Read-Replica Failover',
    planetName: 'SATELLITE 04 · TELEMETRY ROUTER',
    role: 'Backend Systems Architect',
    category: 'distributed',
    featured: false,
    status: 'production',
    summary:
      'Dynamic query partition router in Go/Gin with automated read-replica failover and Redis lock reconciliation.',
    problem: 'Write contention under 10k/sec burst loads caused latency spikes.',
    approach: 'Partitioned write streams and decoupled notifications via Redis event channels.',
    outcome: 'Sustained 10k/sec throughput at 99.9% uptime.',
    highlights: ['10k/sec query routing', 'Automated replica failover'],
    technologies: ['Go', 'Gin', 'PostgreSQL', 'Redis', 'Docker'],
    metric: '10k/sec · 99.9% Uptime',
    screenshotUrl: catatCrypto,
  },
];

export const FEATURED_PROJECTS = PROJECTS.filter((p) => p.featured);
export const ARCHIVE_PROJECTS = PROJECTS.filter((p) => !p.featured);

export const EDUCATION = [
  {
    institution: 'Universitas Sultan Ageng Tirtayasa (UNTIRTA)',
    degree: 'S1 Ilmu Komputer (Computer Science)',
    period: '2025 – Present',
    location: 'Banten, Indonesia',
    highlight: 'Focus: Distributed Systems, Algorithms & Artificial Intelligence',
  },
  {
    institution: 'SMKN 5 Kabupaten Tangerang',
    degree: 'Rekayasa Perangkat Lunak (RPL / Software Engineering)',
    period: '2021 – 2024',
    location: 'Tangerang, Indonesia',
    highlight: 'Focus: Fullstack Web Development, ERD & Relational Databases',
  },
  {
    institution: 'MTsN 1 Tangerang',
    degree: 'Sekolah Menengah Pertama',
    period: '2018 – 2021',
    location: 'Tangerang, Indonesia',
    highlight: 'General Secondary Education',
  },
];

export const CERTIFICATIONS = [
  {
    title: 'Co-Founder & Lead Fullstack Architect',
    issuer: 'Vora AI Multi-Agent Platform',
    badge: '2025 – Present',
  },
  {
    title: 'Core Monorepo Ownership (~65%)',
    issuer: 'TISS Distributed Synchronization Engine',
    badge: '2024 – 2025',
  },
  {
    title: 'Front-End & Database ERD Internship',
    issuer: 'PT. INOVINDO Multimedia',
    badge: 'Aug – Nov 2022',
  },
  {
    title: 'Production Assembly & QA Discipline',
    issuer: 'PT. Multi Nugraha Kencana',
    badge: 'Jun – Sep 2023',
  },
];

export const FAQS = [
  {
    question: 'What technology stacks do you specialize in?',
    answer:
      'I build end-to-end systems with React, TypeScript, Tailwind CSS, Three.js, and GSAP on the frontend, paired with Go (Gin/GORM), Node.js/Express, and Python/FastAPI backends over PostgreSQL and Redis.',
  },
  {
    question: 'How is the Earth-to-Space 3D scene constructed?',
    answer:
      'All mountains, alpine valleys, rivers, roads, railway viaducts, 4 vehicles (Sports Car, Bullet Train, Jet Aircraft, Orbital Rocket), and planets are procedurally synthesized in Three.js r186 with FBM textures and custom atmospheric shaders.',
  },
  {
    question: 'What were your key engineering contributions at Vora AI and TISS?',
    answer:
      'At Vora AI I designed the React/Node/FastAPI multi-agent architecture reducing workflow delays by 40%. On TISS I drove ~65% of monorepo development in Go, Postgres, and Redis, scaling to 10k queries/sec under 100ms latency.',
  },
  {
    question: 'Are you open to software engineering roles or project collaborations?',
    answer:
      'Yes! I am available for full-time software engineering, frontend/fullstack, or AI system architecture roles in Tangerang/Jakarta or remote. Use the contact form or open my Curriculum Vitae directly on this page.',
  },
];

const rawStops: Omit<SpatialStop, 'index'>[] = [
  {
    id: 'edge',
    kind: 'edge',
    label: 'Mountain Pass Highway · Sports Car',
    sector: 'STAGE 01 · ALPINE HIGHWAY PASS',
    coordinates: 'GROUND LEVEL · ELEV 850M',
    povLabel: 'Left Highway Chase POV',
    vehicleStage: 'car',
    cardSide: 'left',
    anchor: [4.0, 0.0, -2],
    cam: [-2.7, 1.35, 10.6],
    look: [0.4, 0.72, -1],
    packet: [0.0, 0.225, 4.2],
  },
  {
    id: 'proxy',
    kind: 'proxy',
    label: 'Curriculum Vitae & Tunnel Interchange',
    sector: 'STAGE 01 · MOUNTAIN TUNNEL OVERPASS',
    coordinates: 'MILE 14 · ELEV 1,120M',
    povLabel: 'Right Valley Pan POV',
    vehicleStage: 'car',
    cardSide: 'right',
    anchor: [-4.0, 0.0, -35],
    cam: [3.2, 1.65, -24.5],
    look: [-0.45, 0.78, -35],
    packet: [0.0, 0.225, -30.0],
  },
  {
    id: 'exp-vora',
    kind: 'rack',
    label: `${EXPERIENCES[0].role} @ ${EXPERIENCES[0].company}`,
    sector: 'STAGE 02 · MOUNTAIN GORGE VIADUCT',
    coordinates: 'STATION 01 · SHINKANSEN EXPRESS',
    povLabel: 'Left Viaduct Profile POV',
    vehicleStage: 'train',
    cardSide: 'left',
    anchor: [4.2, 2.15, -60],
    cam: [-3.6, 3.25, -51.5],
    look: [0.45, 2.38, -60],
    packet: [0.0, 2.4, -57.2],
  },
  {
    id: 'exp-tiss',
    kind: 'rack',
    label: `${EXPERIENCES[1].role} @ ${EXPERIENCES[1].company}`,
    sector: 'STAGE 02 · RIVER CANYON BRIDGE',
    coordinates: 'STATION 02 · SHINKANSEN EXPRESS',
    povLabel: 'Top-Down Valley River POV',
    vehicleStage: 'train',
    cardSide: 'right',
    anchor: [-4.2, 2.15, -74],
    cam: [2.8, 7.6, -65.5],
    look: [-0.35, 2.38, -74],
    packet: [0.0, 2.4, -71.2],
  },
  {
    id: 'exp-neo',
    kind: 'rack',
    label: `${EXPERIENCES[2].role} @ ${EXPERIENCES[2].company}`,
    sector: 'STAGE 02 · ALPINE TRESTLE BRIDGE',
    coordinates: 'STATION 03 · SHINKANSEN EXPRESS',
    povLabel: 'Low Under-Viaduct Arch POV',
    vehicleStage: 'train',
    cardSide: 'left',
    anchor: [4.2, 2.15, -88],
    cam: [-2.8, 1.25, -80.0],
    look: [0.45, 2.4, -88],
    packet: [0.0, 2.4, -85.2],
  },
  {
    id: 'exp-inovindo',
    kind: 'rack',
    label: `${EXPERIENCES[3].role} @ ${EXPERIENCES[3].company}`,
    sector: 'STAGE 02 · ALPINE AIRFIELD TERMINAL',
    coordinates: 'STATION 04 · RUNWAY INTERCHANGE',
    povLabel: 'Right Airfield Approach POV',
    vehicleStage: 'train',
    cardSide: 'right',
    anchor: [-4.2, 2.15, -102],
    cam: [3.6, 3.85, -94.0],
    look: [-0.4, 2.65, -102],
    packet: [0.0, 2.6, -99.2],
  },
  {
    id: 'rag',
    kind: 'rag',
    label: 'Alpine Peak Ascent · Jet Aircraft',
    sector: 'STAGE 03 · TROPOSPHERE CLIMB',
    coordinates: 'ALT 34,000 FT · SWEPT-WING JET',
    povLabel: 'Left Wingman Ridge POV',
    vehicleStage: 'aircraft',
    cardSide: 'left',
    anchor: [4.4, 7.8, -130],
    cam: [-3.4, 9.2, -118.5],
    look: [0.5, 8.2, -130],
    packet: [0.0, 8.2, -125.5],
  },
  {
    id: 'proj-vora-ai',
    kind: 'project',
    label: 'Vora AI · High-Altitude Cloud Deck',
    sector: 'STAGE 03 · STRATOSPHERE CORRIDOR',
    coordinates: 'ALT 48,000 FT · SWEPT-WING JET',
    povLabel: 'Overhead Satellite Wing POV',
    vehicleStage: 'aircraft',
    cardSide: 'right',
    anchor: [-4.4, 11.4, -162],
    cam: [2.9, 16.4, -150.5],
    look: [-0.5, 11.6, -162],
    packet: [0.0, 11.6, -157.5],
  },
  {
    id: 'proj-tiss',
    kind: 'project',
    label: 'TISS · Karman Line Supersonic Climb',
    sector: 'STAGE 03 · MESOSPHERE HORIZON',
    coordinates: 'ALT 92,000 FT · SWEPT-WING JET',
    povLabel: 'Low Belly-Up Climb POV',
    vehicleStage: 'aircraft',
    cardSide: 'left',
    anchor: [4.4, 15.0, -194],
    cam: [-2.9, 12.1, -182.5],
    look: [0.55, 15.0, -194],
    packet: [0.0, 15.0, -189.5],
  },
  {
    id: 'proj-neo-era-cuan',
    kind: 'project',
    label: 'PT Neo Era Cuan · Lunar Orbital Insertion',
    sector: 'STAGE 04 · CISLUNAR SPACE',
    coordinates: 'DIST 384,400 KM · ORBITAL ROCKET',
    povLabel: 'Right Orbital Insertion POV',
    vehicleStage: 'rocket',
    cardSide: 'right',
    anchor: [-4.5, 21.2, -226],
    cam: [3.2, 22.6, -214.2],
    look: [-0.5, 21.2, -226],
    packet: [0.0, 21.2, -221.2],
  },
  {
    id: 'proj-catat-crypto',
    kind: 'project',
    label: 'Catat Crypto · Saturnian Ring Flyby',
    sector: 'STAGE 04 · SATURNIAN SYSTEM',
    coordinates: 'CASSINI DIVISION · ORBITAL ROCKET',
    povLabel: 'Left Planetary Flyby POV',
    vehicleStage: 'rocket',
    cardSide: 'left',
    anchor: [4.8, 23.8, -258],
    cam: [-3.4, 25.2, -246.2],
    look: [0.6, 23.8, -258],
    packet: [0.0, 23.8, -253.2],
  },
  {
    id: 'archive',
    kind: 'archive',
    label: 'Martian Orbit & Satellite Payload Bay',
    sector: 'STAGE 04 · MARTIAN FRONTIER',
    coordinates: 'ARES TERRA · ORBITAL ROCKET',
    povLabel: 'Top-Down Deep-Space Survey POV',
    vehicleStage: 'rocket',
    cardSide: 'right',
    anchor: [-4.5, 26.0, -288],
    cam: [2.6, 30.8, -276.2],
    look: [-0.5, 26.0, -288],
    packet: [0.0, 26.0, -283.2],
  },
  {
    id: 'delivered',
    kind: 'delivered',
    label: 'Orbital Space Station · Final Contact',
    sector: 'STAGE 04 · ORBITAL SANCTUARY',
    coordinates: 'DOCKING COMPLETE · 200 OK',
    povLabel: 'Final Orbital Docking POV',
    vehicleStage: 'rocket',
    cardSide: 'left',
    anchor: [4.4, 27.8, -320],
    cam: [-2.9, 28.8, -307.5],
    look: [0.55, 27.8, -320],
    packet: [0.0, 27.8, -315.5],
  },
];

export const STOPS: SpatialStop[] = rawStops.map((s, index) => ({
  ...s,
  index,
}));

export const RAIL_GROUPS: RailGroup[] = [
  { id: 'edge', label: '01 · Mountain Highway (Car)', host: 'CV & Profile', kinds: ['edge', 'proxy'] },
  { id: 'services', label: '02 · Valley Viaduct (Train)', host: 'Experience', kinds: ['rack'] },
  { id: 'ai', label: '03 · Alpine Sky (Aircraft)', host: 'Skills Stack', kinds: ['rag'] },
  { id: 'racks', label: '04 · Deep Space (Rocket)', host: 'Projects', kinds: ['project', 'archive'] },
  { id: 'delivered', label: '05 · Station Dock (Contact)', host: 'Direct CV', kinds: ['delivered'] },
];

export function findStopIndex(id: string): number {
  return STOPS.findIndex((s) => s.id === id);
}

export function findStopsByKind(kind: SpatialStop['kind']): SpatialStop[] {
  return STOPS.filter((s) => s.kind === kind);
}

export function getRailGroupIndexForStop(stopIndex: number): number {
  const clamped = Math.max(0, Math.min(STOPS.length - 1, stopIndex));
  const kind = STOPS[clamped].kind;
  return RAIL_GROUPS.findIndex((g) => g.kinds.includes(kind));
}

export function getFirstStopIndexForRailGroup(groupIndex: number): number {
  const group = RAIL_GROUPS[groupIndex];
  if (!group) return 0;
  return STOPS.findIndex((s) => group.kinds.includes(s.kind));
}

export interface HoveredNodeTelemetry {
  name: string;
  category: string;
  metric: string;
  screenX: number;
  screenY: number;
  stopIndex: number;
}

export interface EngineLiveState {
  t: number;
  target: number;
  velocity: number;
  time: number;
  reduced: boolean;
  pulse: number;
  activeStop: number;
  lo: number;
  hi: number;
  quality: 'epic' | 'performance';
  cameraMode: 'rail' | 'orbit';
  audioEnabled: boolean;
  pointer: {
    x: number;
    y: number;
    clientX: number;
    clientY: number;
    active: boolean;
  };
  spectrum: {
    bands: Float32Array;
    level: number;
  };
  stats: {
    fps: number;
    drawCalls: number;
    triangles: number;
    camZ: number;
  };
  hovered: HoveredNodeTelemetry | null;
}

export const engineState: EngineLiveState = {
  t: 0,
  target: 0,
  velocity: 0,
  time: 0,
  reduced: false,
  pulse: 0,
  activeStop: 0,
  lo: 0,
  hi: 2,
  quality: 'epic',
  cameraMode: 'rail',
  audioEnabled: true,
  pointer: {
    x: 0,
    y: 0,
    clientX: 0,
    clientY: 0,
    active: false,
  },
  spectrum: {
    bands: new Float32Array(32),
    level: 0.2,
  },
  stats: {
    fps: 60,
    drawCalls: 48,
    triangles: 28400,
    camZ: 10.6,
  },
  hovered: null,
};

type Listener = () => void;
const listeners = new Set<Listener>();

export function subscribeEngineUi(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function notifyEngineUi(): void {
  listeners.forEach((fn) => fn());
}

export function stopOpenProgress(stopIndex: number): number {
  const d = Math.abs(engineState.t - stopIndex);
  if (d >= 1.35) return 0;
  const x = Math.max(0, Math.min(1, 1 - d / 1.35));
  return x * x * (3 - 2 * x);
}

export function stopPassProgress(stopIndex: number): number {
  const x = Math.max(0, Math.min(1, (engineState.t - (stopIndex - 0.85)) / 1.2));
  return x * x * (3 - 2 * x);
}

export function updateSpectrumBands(): void {
  const t = engineState.time;
  const bands = engineState.spectrum.bands;
  const len = bands.length;
  if (engineState.reduced) {
    for (let i = 0; i < len; i++) {
      bands[i] = 0.25 + 0.2 * Math.sin(i * 0.9);
    }
    engineState.spectrum.level = 0.15;
    return;
  }
  const beat = Math.pow(1 - ((t * 1.87) % 1), 3);
  const boost = engineState.pulse * 0.45;
  let sum = 0;
  for (let i = 0; i < len; i++) {
    const wave = 0.5 + 0.5 * Math.sin(t * (1.3 + i * 0.37) + i * 1.7);
    bands[i] = Math.min(1, (0.12 + 0.55 * beat * Math.exp(-i * 0.14) + 0.24 * wave * wave + boost) * 0.85);
    sum += bands[i];
  }
  engineState.spectrum.level = (sum / len) * 0.4;
}
