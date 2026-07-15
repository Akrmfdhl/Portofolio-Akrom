import catatCrypto from '../assets/catat-crypto.png';
import lmsCurriculum from '../assets/lms-curriculum.png';
import tiss from '../assets/tiss.png';

export interface Project {
  slug: string;
  name: string;
  role: string;
  copyFraming: string;
  description: string;
  problem: string;
  approach: string;
  outcome: string;
  stack: string[];
  screenshotUrl: string;
  githubUrl?: string;
  isPrivate: boolean;
}

export const projects: Project[] = [
  {
    slug: 'vora-ai',
    name: 'Vora AI',
    role: 'Co-Founder & Fullstack Developer',
    copyFraming: 'Co-Founder & Lead Architect — Multi-agent automation system',
    description: 'A multi-agent automation platform that unifies inventory, logistics, finance, sales, and compliance workflows for SMEs and e-commerce businesses.',
    problem: 'SMEs face operational silos where inventory, logistics, sales, and finance data are completely disconnected.',
    approach: 'Architected a distributed system spanning a React/Vite frontend, a Node.js/Express/TS backend, and a Python/FastAPI AI agent layer backed by PostgreSQL.',
    outcome: 'Created a unified dashboard automating cross-department workflows, reducing operational delays by 40%.',
    stack: ['React', 'TypeScript', 'Node.js', 'Express', 'Python', 'FastAPI', 'PostgreSQL'],
    screenshotUrl: lmsCurriculum,
    isPrivate: true
  },
  {
    slug: 'neo-era-cuan',
    name: 'PT Neo Era Cuan',
    role: 'Frontend Developer',
    copyFraming: 'Frontend Developer — Responsive layouts & system integration',
    description: 'Professional frontend implementation for financial tracking and investment interfaces with high-end responsiveness.',
    problem: 'Complex financial transaction logs were difficult for users to read and navigate on mobile viewports.',
    approach: 'Refactored frontend components into highly responsive, performance-optimized layout modules with custom hooks.',
    outcome: 'Shipped a highly accessible, responsive web interface meeting AAA accessibility standards with lightning-fast load times.',
    stack: ['React', 'TypeScript', 'Tailwind CSS', 'Framer Motion'],
    screenshotUrl: tiss,
    isPrivate: true
  },
  {
    slug: 'catat-crypto',
    name: 'Catat Crypto',
    role: 'Contributor',
    copyFraming: 'Contributor — Frontend features, GSAP & Framer Motion animations',
    description: 'A crypto trading journal SPA with motion-driven UI and multi-language support, allowing seamless tracking of crypto portfolios.',
    problem: 'Managing complex crypto portfolios across multiple wallets and exchanges lacked a clean, unified, interactive view.',
    approach: 'Contributed modular UI widgets for tracking transaction history, custom GSAP charts, and integrated multi-language support.',
    outcome: 'Delivered cleaner, more resilient transactions history displays and reduced component load times by ~15%.',
    stack: ['React', 'TypeScript', 'Tailwind CSS', 'GSAP', 'Framer Motion'],
    screenshotUrl: catatCrypto,
    githubUrl: 'https://github.com/Akrmfdhl/catat-crypto',
    isPrivate: false
  },
  {
    slug: 'tiss',
    name: 'TISS',
    role: 'Core Contributor — ~65% of implementation',
    copyFraming: 'Core Contributor — Drove ~65% of implementation across the monorepo',
    description: 'An enterprise-scale tracking and information synchronization system deployed across distributed multi-tenant sites.',
    problem: 'Legacy systems suffered from data lag and lock conflicts during high-volume node replication cycles.',
    approach: 'Led the backend service refactor in Go, implemented Redis-backed event channels, and designed React dashboards.',
    outcome: 'Successfully unified nodes with latency under 100ms and reduced replication failures to zero.',
    stack: ['Go', 'Gin', 'GORM', 'Postgres', 'Redis', 'Docker', 'React', 'TypeScript'],
    screenshotUrl: tiss,
    isPrivate: true
  }
];
