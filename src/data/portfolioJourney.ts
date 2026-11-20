import catatCrypto from '../assets/catat-crypto.png';
import lmsCurriculum from '../assets/lms-curriculum.png';
import tiss from '../assets/tiss.png';
import blocksim from '../assets/blocksim.png';
import fotoCv from '../assets/FOTO CV.jpeg';
import type { BootStageKey, LocalizedText } from '../lib/i18n';

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
  role: LocalizedText;
  company: string;
  location: LocalizedText;
  period: LocalizedText;
  isCurrent: boolean;
  metricsBadge: LocalizedText;
  sectorCode: string;
  description: { id: string[]; en: string[] };
  technologies: string[];
  liveUrl?: string;
}

export interface SkillCluster {
  id: string;
  title: LocalizedText;
  code: string;
  skills: { id: string[]; en: string[] };
}

export interface ProjectNodeItem {
  id: string;
  slug: string;
  title: string;
  subtitle: LocalizedText;
  planetName: string;
  role: LocalizedText;
  category: 'ai' | 'distributed' | 'fintech' | 'web3' | 'mobile';
  featured: boolean;
  status: 'live' | 'production' | 'open-source';
  summary: LocalizedText;
  problem: LocalizedText;
  approach: LocalizedText;
  outcome: LocalizedText;
  highlights: { id: string[]; en: string[] };
  technologies: string[];
  metric: LocalizedText;
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
  povLabel: LocalizedText;
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
  ground: 0x000000,
  deep: 0x000000,
  surface: 0x121212,
  chalk: 0xffffff,
  dim: 0xa3a3a3,
  faint: 0x525252,
  amber: 0xffffff,
  link: 0xe5e5e5,
  cyan: 0xd4d4d4,
  red: 0xa3a3a3,
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
  if (t < 1.2) return 'Grand Touring Car';
  if (t < 5.15) return 'Mountain Express Train';
  if (t < 8.15) return 'Stratosphere Jet Aircraft';
  return 'Orbital Rocket';
}

export const PROFILE = {
  name: 'Akrom Fadhil',
  fullName: 'Akrom Fadhil M.',
  handle: 'Akrom Fadhil',
  email: 'akromfadhil234@gmail.com',
  phone: '0858-9019-1405',
  whatsapp: 'https://wa.me/6285890191405',
  github: 'https://github.com/Akrmfdhl',
  linkedin: 'https://linkedin.com/in/akrom',
  location: 'Rajeg, Kab. Tangerang, Banten 15540, Indonesia',
  avatarUrl: fotoCv,
  aboutStory: {
    id: [
      'Saya memimpin perancangan aplikasi web React, TypeScript, Node.js, dan Python FastAPI di Vora AI untuk mempercepat alur kerja operasional sebesar 40 persen.',
      'Saya mengembangkan sekitar 65 persen basis kode platform TISS menggunakan bahasa Go, Redis, dan PostgreSQL hingga melayani 10.000 permintaan per detik.',
      'Saya membangun antarmuka keuangan yang responsif dan memenuhi standar aksesibilitas WCAG AAA di PT Neo Era Cuan serta Catat Crypto.',
      'Saya menempuh pendidikan Sarjana Ilmu Komputer di Universitas Sultan Ageng Tirtayasa setelah menamatkan jurusan Rekayasa Perangkat Lunak di SMKN 5 Kabupaten Tangerang.',
    ],
    en: [
      'I lead React, TypeScript, Node.js, and Python FastAPI engineering at Vora AI, accelerating enterprise business operations by 40 percent.',
      'I built approximately 65 percent of the TISS codebase with Go, Redis, and PostgreSQL, sustaining 10,000 updates per second under 100ms.',
      'I delivered responsive financial web interfaces complying with WCAG AAA contrast standards at PT Neo Era Cuan and Catat Crypto.',
      'I pursue a Computer Science degree at Universitas Sultan Ageng Tirtayasa following my Software Engineering diploma at SMKN 5 Kabupaten Tangerang.',
    ],
  },
  stats: [
    {
      value: '< 100ms',
      label: { id: 'Kecepatan Sinkronisasi', en: 'Real-Time Sync' },
      detail: { id: 'Layanan Go dan Redis', en: 'Go and Redis services' },
    },
    {
      value: '65%',
      label: { id: 'Kontribusi Kode', en: 'Codebase Ownership' },
      detail: { id: 'Pengembangan platform TISS', en: 'Full-stack TISS delivery' },
    },
    {
      value: '10k/s',
      label: { id: 'Kapasitas Transaksi', en: 'Processing Capacity' },
      detail: { id: 'Pemrosesan paralel PostgreSQL', en: 'Parallel PostgreSQL writes' },
    },
    {
      value: '-40%',
      label: { id: 'Efisiensi Alur Kerja', en: 'Faster Operations' },
      detail: { id: 'Otomasi bisnis Vora AI', en: 'Vora AI automation' },
    },
  ],
};

export const EXPERIENCES: ExperienceItem[] = [
  {
    id: 'exp-vora',
    role: {
      id: 'Co-Founder & Arsitek Full-Stack',
      en: 'Co-Founder & Fullstack Architect',
    },
    company: 'Vora AI',
    location: { id: 'Indonesia · Hibrida', en: 'Indonesia · Hybrid' },
    period: { id: '2025 – Sekarang', en: '2025 – Present' },
    isCurrent: true,
    metricsBadge: { id: 'Operasional 40% Lebih Cepat', en: '40% Faster Workflows' },
    sectorCode: 'Pengalaman 01',
    description: {
      id: [
        'Saya merancang platform otomasi bisnis AI multi-agen yang menggabungkan dasbor React/TypeScript, gerbang API Node.js/Express, dan layanan agen Python/FastAPI.',
        'Saya menyatukan alur kerja inventaris, logistik, penjualan, keuangan, dan kepatuhan UMKM ke dalam satu basis data PostgreSQL yang terintegrasi.',
        'Saya menerapkan validasi antar-agen AI sehingga keterlambatan proses operasional berkurang sebesar 40 persen.',
      ],
      en: [
        'I designed a multi-agent AI automation platform combining a React and TypeScript dashboard, Node.js API gateway, and Python FastAPI agent runtime.',
        'I unified inventory, logistics, sales, finance, and compliance workflows into a single structured PostgreSQL database.',
        'I built validation guards across collaborating AI agents, reducing operational delays by 40 percent.',
      ],
    },
    technologies: ['React', 'TypeScript', 'Node.js', 'Express', 'Python', 'FastAPI', 'PostgreSQL'],
  },
  {
    id: 'exp-tiss',
    role: {
      id: 'Pengembang Inti Platform (~65% Basis Kode)',
      en: 'Core Monorepo Engineer (~65% Ownership)',
    },
    company: 'TISS Enterprise Platform',
    location: { id: 'Indonesia · Terdistribusi', en: 'Indonesia · Distributed' },
    period: { id: '2024 – 2025', en: '2024 – 2025' },
    isCurrent: false,
    metricsBadge: { id: 'Sinkronisasi < 100ms', en: '< 100ms Synchronization' },
    sectorCode: 'Pengalaman 02',
    description: {
      id: [
        'Saya membangun sekitar 65 persen kode proyek untuk platform pelacakan dan sinkronisasi data multi-lokasi perusahaan.',
        'Saya memperbarui layanan backend menggunakan Go (Gin dan GORM) serta saluran peristiwa Redis untuk mencegah konflik penguncian data.',
        'Saya menyetel partisi penulisan PostgreSQL agar mampu memproses 10.000 permintaan per detik di bawah jeda 100 milidetik.',
      ],
      en: [
        'I delivered roughly 65 percent of the multi-tenant codebase for an enterprise tracking and synchronization platform.',
        'I refactored Go (Gin and GORM) backend services with Redis pub/sub event channels and lock reconciliation workers.',
        'I scaled PostgreSQL write partitioning to sustain 10,000 queries per second below 100ms synchronization latency.',
      ],
    },
    technologies: ['Go', 'Gin', 'GORM', 'PostgreSQL', 'Redis', 'Docker', 'React', 'TypeScript'],
  },
  {
    id: 'exp-neo',
    role: {
      id: 'Pengembang Sistem Antarmuka',
      en: 'Frontend Systems Developer',
    },
    company: 'PT Neo Era Cuan & Catat Crypto',
    location: { id: 'Jarak Jauh · Indonesia', en: 'Remote · Indonesia' },
    period: { id: '2024 – 2025', en: '2024 – 2025' },
    isCurrent: false,
    metricsBadge: { id: 'Pemuatan 15% Lebih Cepat', en: '+15% Faster Load' },
    sectorCode: 'Pengalaman 03',
    description: {
      id: [
        'Saya mengembangkan antarmuka pencatatan keuangan, pemantauan portofolio, dan jurnal perdagangan kripto menggunakan React, TypeScript, Tailwind CSS, dan GSAP.',
        'Saya menyusun modul riwayat transaksi modular, grafik interaktif, serta dukungan dwibahasa Indonesia dan Inggris.',
        'Saya memastikan seluruh antarmuka memenuhi standar kontras WCAG AAA sekaligus mempercepat waktu muat halaman sebesar 15 persen.',
      ],
      en: [
        'I built financial tracking, portfolio analytics, and crypto trading journal interfaces in React, TypeScript, Tailwind CSS, and GSAP.',
        'I crafted modular transaction widgets, interactive portfolio charts, and smooth Indonesian/English localization.',
        'I achieved WCAG AAA contrast compliance while trimming initial component loading times by 15 percent.',
      ],
    },
    technologies: ['React', 'TypeScript', 'Tailwind CSS', 'GSAP', 'Framer Motion', 'FinTech UI'],
    liveUrl: 'https://github.com/Akrmfdhl/catat-crypto',
  },
  {
    id: 'exp-inovindo',
    role: {
      id: 'Magang Front-End, Basis Data & Produksi',
      en: 'Front-End, Database & Operations Internships',
    },
    company: 'PT. INOVINDO Multimedia & PT. Multi Nugraha Kencana',
    location: { id: 'Bandung & Tangerang, Indonesia', en: 'Bandung & Tangerang, Indonesia' },
    period: { id: '2022 – 2023', en: '2022 – 2023' },
    isCurrent: false,
    metricsBadge: { id: 'ERD · Antarmuka · Kualitas', en: 'ERD · UI · Quality' },
    sectorCode: 'Pengalaman 04',
    description: {
      id: [
        'Di PT. INOVINDO Multimedia (Ags–Nov 2022), saya merancang wireframe, tata letak web digital, serta pemodelan ERD basis data relasional untuk aplikasi klien.',
        'Di PT. Multi Nugraha Kencana (Jun–Sep 2023), saya menjalankan proses perakitan pelapis interior dengan ketelitian tinggi dan disiplin kualitas.',
      ],
      en: [
        'At PT. INOVINDO Multimedia (Aug–Nov 2022), I designed wireframes, web layouts, and relational database ERD models for client applications.',
        'At PT. Multi Nugraha Kencana (Jun–Sep 2023), I executed precision upholstery and assembly workflows with strict quality discipline.',
      ],
    },
    technologies: ['HTML5', 'CSS3', 'JavaScript', 'ERD Modeling', 'Wireframing', 'Teamwork'],
  },
];

export const SKILL_CLUSTERS: SkillCluster[] = [
  {
    id: 'cluster-ai',
    title: { id: 'AI Multi-Agen & Data', en: 'Multi-Agent AI & Data' },
    code: 'AI',
    skills: {
      id: [
        'Orkestrasi AI Multi-Agen',
        'Layanan Mikro Python & FastAPI',
        'Pemodelan PostgreSQL & ERD',
        'Otomasi Alur Kerja Bisnis',
      ],
      en: [
        'Multi-Agent Orchestration',
        'Python & FastAPI Microservices',
        'PostgreSQL & ERD Modeling',
        'Automated Business Workflows',
      ],
    },
  },
  {
    id: 'cluster-backend',
    title: { id: 'Backend & Skalabilitas', en: 'Backend & Scalability' },
    code: 'BE',
    skills: {
      id: [
        'Go (Golang), Gin & GORM',
        'Layanan API Node.js & Express',
        'Redis Pub/Sub & Antrean Data',
        'Arsitektur REST API & Partisi',
      ],
      en: [
        'Go (Golang), Gin & GORM',
        'Node.js & Express APIs',
        'Redis Pub/Sub & Caching',
        'REST API Design & Partitioning',
      ],
    },
  },
  {
    id: 'cluster-frontend',
    title: { id: 'Antarmuka & Grafis 3D', en: 'Frontend & 3D Graphics' },
    code: 'FE',
    skills: {
      id: [
        'React, TypeScript & Vite',
        'Three.js, GLSL & Grafis WebGL',
        'Animasi GSAP ScrollTrigger & Lenis',
        'Tailwind CSS & Aksesibilitas AAA',
      ],
      en: [
        'React, TypeScript & Vite',
        'Three.js, GLSL & WebGL',
        'GSAP ScrollTrigger & Lenis',
        'Tailwind CSS & WCAG AAA UI',
      ],
    },
  },
  {
    id: 'cluster-infra',
    title: { id: 'Perkakas & Soft Skill', en: 'Tooling & Core Strengths' },
    code: 'OP',
    skills: {
      id: [
        'Docker, Git & Alur GitHub',
        'Kotlin & Jetpack Compose Android',
        'Pemecahan Masalah & Adaptif',
        'Manajemen Waktu & Ketelitian',
      ],
      en: [
        'Docker, Git & GitHub CI',
        'Kotlin & Jetpack Compose',
        'Problem Solving & Fast Learner',
        'Time Management & Precision',
      ],
    },
  },
];

export const PROJECTS: ProjectNodeItem[] = [
  {
    id: 'proj-vora-ai',
    slug: 'vora-ai',
    title: 'Vora AI',
    subtitle: {
      id: 'Platform Otomasi Alur Kerja & ERP Bisnis Berbasis Multi-Agen AI',
      en: 'Multi-Agent Enterprise Workflow & ERP Automation Platform',
    },
    planetName: 'Karya 01 · Vora AI',
    role: {
      id: 'Co-Founder & Lead Fullstack Architect',
      en: 'Co-Founder & Lead Fullstack Architect',
    },
    category: 'ai',
    featured: true,
    status: 'production',
    summary: {
      id: 'Platform AI multi-agen menyatukan pengelolaan inventaris, logistik, keuangan, penjualan, dan kepatuhan bagi UMKM serta e-commerce.',
      en: 'Multi-agent platform unifying inventory, logistics, finance, sales, and compliance workflows for SMEs and e-commerce.',
    },
    problem: {
      id: 'Banyak UMKM menggunakan aplikasi yang terpisah-pisah sehingga data stok, pengiriman, penjualan, dan keuangan sering tidak sinkron.',
      en: 'SMEs often rely on disconnected tools where inventory, logistics, sales, and financial records fall out of sync.',
    },
    approach: {
      id: 'Saya merancang arsitektur tiga lapis dengan frontend React/Vite/TS, gateway Node.js/Express, dan layanan multi-agen Python/FastAPI di atas PostgreSQL.',
      en: 'I architected a three-tier platform with a React/Vite/TS frontend, Node.js/Express gateway, and Python/FastAPI multi-agent orchestration backed by PostgreSQL.',
    },
    outcome: {
      id: 'Tim bisnis memperoleh dasbor kendali terpadu yang memangkas keterlambatan operasional lintas divisi sebesar 40 persen.',
      en: 'Delivered a unified control dashboard that cut cross-department operational delays by 40 percent.',
    },
    highlights: {
      id: [
        'Lima agen AI spesialis berkolaborasi di atas status PostgreSQL terpadu.',
        'Dasbor persetujuan dan pemantauan langsung dibangun dengan React dan TypeScript.',
      ],
      en: [
        'Five domain AI agents coordinating reliably over shared PostgreSQL state.',
        'Real-time React and TypeScript control workspace for approvals and monitoring.',
      ],
    },
    technologies: ['React', 'TypeScript', 'Node.js', 'Express', 'Python', 'FastAPI', 'PostgreSQL'],
    metric: {
      id: 'Efisiensi 40% · 5 Agen AI',
      en: '-40% operational delay · 5 AI agents',
    },
    screenshotUrl: lmsCurriculum,
  },
  {
    id: 'proj-tiss',
    slug: 'tiss',
    title: 'TISS',
    subtitle: {
      id: 'Platform Pelacakan & Sinkronisasi Data Multi-Lokasi Skala Perusahaan',
      en: 'Multi-Tenant Enterprise Tracking & Synchronization Platform',
    },
    planetName: 'Karya 02 · TISS',
    role: {
      id: 'Kontributor Inti (~65% Basis Kode)',
      en: 'Core Contributor (~65% Monorepo Ownership)',
    },
    category: 'distributed',
    featured: true,
    status: 'production',
    summary: {
      id: 'Platform pelacakan perusahaan yang menyinkronkan data antarcabang secara paralel dengan jeda kurang dari 100 milidetik.',
      en: 'Enterprise tracking and synchronization platform operating across distributed locations under 100ms latency.',
    },
    problem: {
      id: 'Layanan sinkronisasi lama kerap mengalami antrean lambat serta benturan kunci baris basis data saat lonjakan transaksi.',
      en: 'Legacy sync services suffered data delays and database lock conflicts during high-volume traffic bursts.',
    },
    approach: {
      id: 'Saya merombak layanan backend ke Go (Gin dan GORM) dengan antrean peristiwa Redis, partisi tabel PostgreSQL, serta dasbor React.',
      en: 'I refactored backend services into Go (Gin and GORM) paired with Redis pub/sub channels, PostgreSQL partitioning, and React dashboards.',
    },
    outcome: {
      id: 'Seluruh cabang perusahaan tetap tersinkron di bawah 100 milidetik pada beban puncak 10.000 kueri per detik.',
      en: 'Kept all locations synchronized below 100ms latency at a sustained 10,000 queries per second.',
    },
    highlights: {
      id: [
        'Mesin replikasi Go + Gin + GORM menangani konkurensi tinggi dengan resolusi kunci otomatis.',
        'Memegang pengembangan ~65% kode penuh lintas Go, Docker, PostgreSQL, dan React.',
      ],
      en: [
        'Go + Gin + GORM high-concurrency replication with automated lock reconciliation.',
        'Built ~65% of the full-stack codebase across Go, Docker, PostgreSQL, and React.',
      ],
    },
    technologies: ['Go', 'Gin', 'GORM', 'PostgreSQL', 'Redis', 'Docker', 'React', 'TypeScript'],
    metric: {
      id: 'Jeda < 100ms · 10rb kueri/dtk',
      en: '< 100ms sync · 10k queries/sec',
    },
    screenshotUrl: tiss,
  },
  {
    id: 'proj-neo-era-cuan',
    slug: 'neo-era-cuan',
    title: 'PT Neo Era Cuan',
    subtitle: {
      id: 'Antarmuka Pemantauan Keuangan & Investasi Berkecepatan Tinggi',
      en: 'High-Responsiveness Financial Tracking & Investment Interface',
    },
    planetName: 'Karya 03 · PT Neo Era Cuan',
    role: {
      id: 'Frontend Systems Developer',
      en: 'Frontend Systems Developer',
    },
    category: 'fintech',
    featured: true,
    status: 'production',
    summary: {
      id: 'Aplikasi web pencatatan keuangan serta portofolio investasi yang dirancang mulus untuk perangkat seluler maupun desktop.',
      en: 'Production financial tracking and investment platform engineered for extreme responsiveness on mobile and desktop.',
    },
    problem: {
      id: 'Tabel catatan transaksi yang padat terasa berat dan sulit ditelusuri oleh pengguna di layar ponsel berukuran kecil.',
      en: 'Dense financial transaction ledgers felt sluggish and difficult to read on compact mobile viewports.',
    },
    approach: {
      id: 'Saya menyusun komponen React/TypeScript yang modular dengan manajemen state ringan serta token warna aksesibel.',
      en: 'I engineered modular React/TypeScript layouts with custom state hooks and accessible typography/contrast tokens.',
    },
    outcome: {
      id: 'Aplikasi mencapai standar aksesibilitas WCAG AAA dengan pergeseran tata letak nol di semua ukuran layar.',
      en: 'Delivered a WCAG AAA-accessible web app with zero layout shift across all screen breakpoints.',
    },
    highlights: {
      id: [
        'Tabel keuangan dan paginasi buku besar adaptif di ponsel dan desktop.',
        'Token desain ketat memenuhi rasio kontras aksesibilitas WCAG AAA.',
      ],
      en: [
        'Responsive multi-viewport financial tables and ledger pagination.',
        'Strict contrast tokens satisfying WCAG AAA accessibility benchmarks.',
      ],
    },
    technologies: ['React', 'TypeScript', 'Tailwind CSS', 'Framer Motion'],
    metric: {
      id: 'Aksesibilitas AAA · UI 60fps',
      en: 'AAA Accessibility · 60fps FinTech UI',
    },
    screenshotUrl: tiss,
  },
  {
    id: 'proj-catat-crypto',
    slug: 'catat-crypto',
    title: 'Catat Crypto',
    subtitle: {
      id: 'Jurnal Perdagangan Aset Digital & Analitik Portofolio Interaktif',
      en: 'Motion-Driven Crypto Trading Journal & Portfolio Analytics SPA',
    },
    planetName: 'Karya 04 · Catat Crypto',
    role: {
      id: 'Kontributor Antarmuka — GSAP & Motion',
      en: 'Frontend Contributor — GSAP & Motion Systems',
    },
    category: 'web3',
    featured: true,
    status: 'open-source',
    summary: {
      id: 'Aplikasi jurnal trading kripto dengan grafik portofolio GSAP, pelacakan banyak dompet, serta dukungan bahasa Indonesia dan Inggris.',
      en: 'Interactive crypto trading journal featuring GSAP portfolio charts, multi-wallet tracking, and EN/ID localization.',
    },
    problem: {
      id: 'Para trader kesulitan menyatukan riwayat untung-rugi dan catatan transaksi dari berbagai bursa maupun dompet.',
      en: 'Traders lacked a unified journal to track profit-and-loss and transaction history across CEX and DEX wallets.',
    },
    approach: {
      id: 'Saya membangun widget transaksi modular, visualisasi grafik GSAP serta Framer Motion, dan pengalih bahasa instan.',
      en: 'I created modular transaction widgets, custom GSAP + Framer Motion charts, and instant localization controls.',
    },
    outcome: {
      id: 'Tampilan portofolio berjalan stabil dan memangkas waktu pemuatan komponen awal sekitar 15 persen.',
      en: 'Delivered resilient portfolio views while trimming initial component loading times by ~15 percent.',
    },
    highlights: {
      id: [
        'Grafik kinerja eksekusi transaksi dengan GSAP dan Framer Motion.',
        'Optimasi kode menurunkan waktu pemuatan komponen hingga 15 persen.',
      ],
      en: [
        'GSAP and Framer Motion telemetry charts for trade execution analysis.',
        'Code optimization trimming initial load latency by ~15 percent.',
      ],
    },
    technologies: ['React', 'TypeScript', 'Tailwind CSS', 'GSAP', 'Framer Motion'],
    metric: {
      id: 'Muat -15% · Sumber Terbuka',
      en: '-15% load time · Open Source',
    },
    screenshotUrl: catatCrypto,
    githubUrl: 'https://github.com/Akrmfdhl/catat-crypto',
  },
  {
    id: 'proj-blocksim',
    slug: 'blocksim',
    title: 'BlockSim Android',
    subtitle: {
      id: 'Aplikasi Simulasi Kriptografi & Konsensus Blockchain',
      en: 'Interactive Blockchain Cryptography & Consensus Simulator',
    },
    planetName: 'Arsip 01 · BlockSim Android',
    role: {
      id: 'Pengembang Aplikasi Seluler & Backend',
      en: 'Fullstack & Mobile Engineer',
    },
    category: 'mobile',
    featured: false,
    status: 'production',
    summary: {
      id: 'Aplikasi Android dengan 7 simulasi interaktif kriptografi SHA-256 dan struktur Merkle bersama backend Go Fiber.',
      en: 'Native Android learning app featuring 7 interactive blockchain simulations, SHA-256 visualizers, and a Go Fiber API.',
    },
    problem: {
      id: 'Pelajar sering kesulitan membayangkan cara kerja hashing kriptografi dan pohon Merkle tanpa simulasi langsung.',
      en: 'Learners struggle to visualize cryptographic hashing and Merkle trees without hands-on visual simulators.',
    },
    approach: {
      id: 'Saya membangun aplikasi Kotlin Jetpack Compose yang terhubung dengan API Go Fiber dan PostgreSQL.',
      en: 'I built a native Kotlin Jetpack Compose app paired with a Go Fiber and PostgreSQL backend.',
    },
    outcome: {
      id: 'Menghasilkan 7 modul praktikum simulasi blockchain lengkap dengan pelacakan progres belajar.',
      en: 'Launched 7 interactive blockchain simulation labs with seamless progress tracking.',
    },
    highlights: {
      id: ['Antarmuka Android asli dengan Kotlin & Jetpack Compose', 'Layanan backend cepat memakai Go Fiber dan PostgreSQL'],
      en: ['Native Android UI in Kotlin & Jetpack Compose', 'Fast Go Fiber & PostgreSQL backend'],
    },
    technologies: ['Kotlin', 'Jetpack Compose', 'Go', 'Fiber', 'PostgreSQL'],
    metric: { id: '7 Lab Interaktif', en: '7 Interactive Labs' },
    screenshotUrl: blocksim,
  },
  {
    id: 'proj-lms-curriculum',
    slug: 'lms-curriculum',
    title: 'Modular LMS & Curriculum Engine',
    subtitle: {
      id: 'Portal Akademik & Sistem Manajemen Pembelajaran Terstruktur',
      en: 'Academic Portal & Structured Learning Management Platform',
    },
    planetName: 'Arsip 02 · Modular LMS',
    role: { id: 'Pengembang Full-Stack', en: 'Fullstack Developer' },
    category: 'distributed',
    featured: false,
    status: 'production',
    summary: {
      id: 'Platform pembelajaran menyeluruh dengan peta kurikulum terstruktur, pengaturan hak akses peran, dan pantauan kemajuan siswa.',
      en: 'End-to-end learning portal featuring structured curriculum graphs, role permissions, and student progress tracking.',
    },
    problem: {
      id: 'Portal akademik konvensional sering tidak memperlihatkan keterkaitan prasyarat mata pelajaran secara jelas.',
      en: 'Traditional learning portals lack clear curriculum dependency paths and unified analytics.',
    },
    approach: {
      id: 'Saya merancang antarmuka React + TypeScript bersama skema basis data relasional yang rapi.',
      en: 'I built a React and TypeScript frontend backed by clean relational database schemas.',
    },
    outcome: {
      id: 'Memudahkan pengajar dan siswa memantau perkembangan materi dalam satu aplikasi terpadu.',
      en: 'Streamlined course delivery and student tracking inside one unified workspace.',
    },
    highlights: {
      id: ['Peta kurikulum berbasis peran pengguna', 'Pembaruan capaian belajar secara langsung'],
      en: ['Role-based curriculum graph', 'Real-time student progress views'],
    },
    technologies: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Tailwind CSS'],
    metric: { id: 'Kurikulum Terpadu', en: 'Unified Academic Graph' },
    screenshotUrl: lmsCurriculum,
  },
  {
    id: 'proj-webgl-grid',
    slug: 'webgl-grid',
    title: 'Portofolio Interaktif 3D Web',
    subtitle: {
      id: 'Visualisasi Perjalanan Kendaraan & Lanskap Pegunungan ke Luar Angkasa',
      en: 'Interactive Car, Train, Aircraft, Rocket & Mountain-to-Space Experience',
    },
    planetName: 'Arsip 03 · Web 3D Portfolio',
    role: { id: 'Pengembang Grafis & Antarmuka Web', en: 'Graphics & Frontend Engineer' },
    category: 'ai',
    featured: false,
    status: 'live',
    summary: {
      id: 'Pengalaman portofolio interaktif berbasis Three.js dan GSAP dengan perjalanan terhubung dari pegunungan, stasiun, bandara, landasan roket, hingga observatorium ruang angkasa dalam.',
      en: 'Interactive portfolio experience crafted with Three.js and GSAP featuring a connected journey across alpine roads, train stations, an airport, a spaceport, and deep space.',
    },
    problem: {
      id: 'Halaman portofolio statis dua dimensi kurang menggambarkan kualitas karya rekayasa perangkat lunak secara langsung.',
      en: 'Static two-dimensional resumes rarely showcase interactive web and graphics engineering craft.',
    },
    approach: {
      id: 'Saya memadukan model Porsche 959, kereta ekspres, pesawat jet, roket, dan planet dalam satu alur gulir yang halus.',
      en: 'I orchestrated a seamless scroll journey combining vehicles, alpine scenery, and celestial bodies in Three.js.',
    },
    outcome: {
      id: 'Pengunjung dapat membaca profil, pengalaman kerja, dan studi kasus sambil menikmati adegan tiga dimensi responsif.',
      en: 'Visitors explore career milestones and case studies seamlessly alongside a responsive 3D canvas.',
    },
    highlights: {
      id: ['Lanskap pegunungan dan atmosfer bertekstur tinggi', 'Navigasi dwibahasa dengan animasi halus'],
      en: ['High-detail mountain valley and planetary visuals', 'Responsive multi-breakpoint typography & cards'],
    },
    technologies: ['Three.js', 'GLSL', 'GSAP ScrollTrigger', 'Lenis', 'React'],
    metric: { id: 'Pengalaman Web 3D', en: 'Interactive 3D Web' },
    screenshotUrl: tiss,
  },
  {
    id: 'proj-redis-mesh',
    slug: 'redis-mesh',
    title: 'Pemroses Kueri Berkapasitas Tinggi',
    subtitle: {
      id: 'Arsitektur Partisi PostgreSQL & Antrean Peristiwa Redis',
      en: 'Parallel PostgreSQL Partitioning & Read-Replica Coordination',
    },
    planetName: 'Arsip 04 · Query Processor',
    role: { id: 'Pengembang Backend', en: 'Backend Engineer' },
    category: 'distributed',
    featured: false,
    status: 'production',
    summary: {
      id: 'Pengatur lalu lintas penulisan basis data dalam bahasa Go dan Gin yang menjaga kestabilan respons pada trafik tinggi.',
      en: 'Dynamic PostgreSQL partitioning and Go/Gin query coordinator ensuring low-latency responses under burst load.',
    },
    problem: {
      id: 'Lonjakan 10.000 permintaan per detik menyebabkan antrean penulisan menumpuk di satu tabel utama.',
      en: 'Burst traffic of 10,000 requests per second caused heavy write contention on monolithic database tables.',
    },
    approach: {
      id: 'Saya memecah jalur penulisan per partisi dan menyalurkan pembaruan status lewat Redis.',
      en: 'I partitioned write streams cleanly and decoupled change notifications via Redis.',
    },
    outcome: {
      id: 'Kapasitas pemrosesan bertahan di angka 10.000 permintaan per detik dengan ketersediaan 99,9 persen.',
      en: 'Sustained 10,000 requests per second at 99.9 percent reliability.',
    },
    highlights: {
      id: ['Distribusi penulisan 10rb/detik tanpa hambatan', 'Pemulihan baca replika secara otomatis'],
      en: ['10k/sec write distribution', 'Automated read-replica recovery'],
    },
    technologies: ['Go', 'Gin', 'PostgreSQL', 'Redis', 'Docker'],
    metric: { id: '10rb/dtk · Andal 99,9%', en: '10k/sec · 99.9% Reliable' },
    screenshotUrl: catatCrypto,
  },
];

export const FEATURED_PROJECTS = PROJECTS.filter((p) => p.featured);
export const ARCHIVE_PROJECTS = PROJECTS.filter((p) => !p.featured);

export const EDUCATION = [
  {
    institution: 'Universitas Sultan Ageng Tirtayasa (UNTIRTA)',
    degree: {
      id: 'S1 Ilmu Komputer (Informatika)',
      en: 'B.Sc. in Computer Science',
    },
    period: { id: '2025 – Sekarang', en: '2025 – Present' },
    location: 'Banten, Indonesia',
    highlight: {
      id: 'Fokus: Sistem Terdistribusi, Algoritma & Kecerdasan Buatan',
      en: 'Focus: Distributed Systems, Algorithms & Artificial Intelligence',
    },
  },
  {
    institution: 'SMKN 5 Kabupaten Tangerang',
    degree: {
      id: 'Rekayasa Perangkat Lunak (RPL)',
      en: 'Software Engineering Vocational Diploma',
    },
    period: { id: '2021 – 2024', en: '2021 – 2024' },
    location: 'Tangerang, Indonesia',
    highlight: {
      id: 'Fokus: Pengembangan Web Full-Stack, ERD & Basis Data Relasional',
      en: 'Focus: Full-Stack Web Development, ERD & Relational Databases',
    },
  },
  {
    institution: 'MTsN 1 Tangerang',
    degree: {
      id: 'Sekolah Menengah Pertama',
      en: 'Junior High School',
    },
    period: { id: '2018 – 2021', en: '2018 – 2021' },
    location: 'Tangerang, Indonesia',
    highlight: {
      id: 'Pendidikan Menengah Umum',
      en: 'General Secondary Education',
    },
  },
];

export const CERTIFICATIONS = [
  {
    title: {
      id: 'Co-Founder & Lead Fullstack Architect',
      en: 'Co-Founder & Lead Fullstack Architect',
    },
    issuer: 'Vora AI Multi-Agent Platform',
    badge: { id: '2025 – Sekarang', en: '2025 – Present' },
  },
  {
    title: {
      id: 'Kontributor Utama Basis Kode (~65%)',
      en: 'Core Monorepo Ownership (~65%)',
    },
    issuer: 'TISS Enterprise Platform',
    badge: { id: '2024 – 2025', en: '2024 – 2025' },
  },
  {
    title: {
      id: 'Magang Front-End & Pemodelan Basis Data ERD',
      en: 'Front-End & Database ERD Internship',
    },
    issuer: 'PT. INOVINDO Multimedia',
    badge: { id: 'Ags – Nov 2022', en: 'Aug – Nov 2022' },
  },
  {
    title: {
      id: 'Pengalaman Perakitan & Kedisiplinan Kualitas',
      en: 'Production Assembly & QA Discipline',
    },
    issuer: 'PT. Multi Nugraha Kencana',
    badge: { id: 'Jun – Sep 2023', en: 'Jun – Sep 2023' },
  },
];

export const FAQS = [
  {
    question: {
      id: 'Teknologi apa saja yang Anda kuasai?',
      en: 'What technology stacks do you specialize in?',
    },
    answer: {
      id: 'Saya membangun aplikasi dari awal hingga siap pakai menggunakan React, TypeScript, Tailwind CSS, Three.js, dan GSAP di sisi frontend, serta Go (Gin/GORM), Node.js/Express, dan Python/FastAPI di sisi backend bersama PostgreSQL serta Redis.',
      en: 'I build complete applications with React, TypeScript, Tailwind CSS, Three.js, and GSAP on the frontend, paired with Go (Gin/GORM), Node.js/Express, and Python/FastAPI backends over PostgreSQL and Redis.',
    },
  },
  {
    question: {
      id: 'Bagaimana tampilan 3D di halaman portofolio ini bekerja?',
      en: 'How is this interactive 3D portfolio constructed?',
    },
    answer: {
      id: 'Seluruh adegan di halaman ini berjalan langsung di peramban menggunakan Three.js dan animasi gulir GSAP tanpa server backend, mulai dari Porsche 959 di jalur berliku, stasiun kereta 3D, bandara, landasan peluncuran roket, hingga observatorium luar angkasa.',
      en: 'The entire visual journey runs directly inside your browser using Three.js and GSAP ScrollTrigger without any external backend server, traversing winding alpine highways, a 3D train station, an airport, a highland spaceport, and deep space.',
    },
  },
  {
    question: {
      id: 'Apa pencapaian utama Anda di Vora AI dan TISS?',
      en: 'What were your key engineering contributions at Vora AI and TISS?',
    },
    answer: {
      id: 'Di Vora AI saya merancang platform AI multi-agen yang mempercepat alur kerja sebesar 40 persen. Di TISS saya mengembangkan sekitar 65 persen kode proyek di Go, Redis, dan PostgreSQL hingga melayani 10.000 kueri per detik di bawah 100ms.',
      en: 'At Vora AI I designed a multi-agent workflow platform cutting operational delays by 40 percent. At TISS I wrote ~65 percent of the codebase in Go, Postgres, and Redis supporting 10k queries/sec under 100ms latency.',
    },
  },
  {
    question: {
      id: 'Apakah Anda terbuka untuk pekerjaan penuh waktu atau kolaborasi proyek?',
      en: 'Are you open to software engineering roles or collaborations?',
    },
    answer: {
      id: 'Ya, saya siap bergabung untuk peran Full-Stack Engineer, Frontend Engineer, atau AI Software Engineer baik di area Jabodetabek maupun kerja jarak jauh. Anda dapat menghubungi saya melalui formulir atau membuka CV langsung di halaman ini.',
      en: 'Yes, I am open to Full-Stack, Frontend, and AI Software Engineering opportunities across Tangerang/Jakarta or remote. Feel free to send a message below or open my CV directly on this page.',
    },
  },
];

const rawStops: Omit<SpatialStop, 'index'>[] = [
  {
    id: 'edge',
    kind: 'edge',
    label: 'Bagian 01 · Profil',
    sector: 'Bagian 01',
    coordinates: '',
    povLabel: { id: 'Jalur Pegunungan Berliku', en: 'Winding Alpine Highway' },
    vehicleStage: 'car',
    cardSide: 'left',
    anchor: [1.6, 0.0, -3.5],
    cam: [-4.2, 1.55, 10.6],
    look: [0.6, 0.72, -1.8],
    packet: [-0.8, 0.2, 4.0],
  },
  {
    id: 'proxy',
    kind: 'proxy',
    label: 'Bagian 01 · Ringkasan',
    sector: 'Bagian 01',
    coordinates: '',
    povLabel: { id: 'Stasiun Utama Pegunungan', en: 'Grand Mountain Station' },
    vehicleStage: 'car',
    cardSide: 'right',
    anchor: [0.4, 0.0, -53.8],
    cam: [2.6, 3.15, -36.8],
    look: [-0.4, 1.15, -51.5],
    packet: [-2.2, 0.2, -48.5],
  },
  {
    id: 'exp-vora',
    kind: 'rack',
    label: 'Bagian 02 · Vora AI',
    sector: 'Bagian 02',
    coordinates: '',
    povLabel: { id: 'Jembatan Layang Berliku', en: 'Curved Mountain Viaduct' },
    vehicleStage: 'train',
    cardSide: 'left',
    anchor: [7.0, 1.15, -70.5],
    cam: [0.6, 2.55, -60.2],
    look: [5.0, 1.2, -70.8],
    packet: [4.5, 0.9, -68.5],
  },
  {
    id: 'exp-tiss',
    kind: 'rack',
    label: 'Bagian 02 · TISS',
    sector: 'Bagian 02',
    coordinates: '',
    povLabel: { id: 'Jembatan Sungai Ngarai', en: 'Canyon River Viaduct' },
    vehicleStage: 'train',
    cardSide: 'right',
    anchor: [-3.4, 1.85, -88.0],
    cam: [3.8, 4.45, -78.8],
    look: [-1.4, 1.9, -88.0],
    packet: [-1.0, 1.84, -87.4],
  },
  {
    id: 'exp-neo',
    kind: 'rack',
    label: 'Bagian 02 · Neo Era Cuan',
    sector: 'Bagian 02',
    coordinates: '',
    povLabel: { id: 'Tikungan Stasiun Lembah', en: 'Valley Station Curve' },
    vehicleStage: 'train',
    cardSide: 'left',
    anchor: [-3.8, 1.5, -106.5],
    cam: [-9.8, 3.35, -97.8],
    look: [-5.4, 1.55, -107.2],
    packet: [-5.6, 1.5, -107.0],
  },
  {
    id: 'exp-inovindo',
    kind: 'rack',
    label: 'Bagian 02 · Pengalaman Awal',
    sector: 'Bagian 02',
    coordinates: '',
    povLabel: { id: 'Terminal Bandara & Landasan', en: 'Airport Terminal & Runway' },
    vehicleStage: 'train',
    cardSide: 'right',
    anchor: [-5.6, 0.2, -139.0],
    cam: [6.4, 3.85, -120.5],
    look: [-0.2, 1.35, -136.5],
    packet: [-0.6, 0.35, -128.0],
  },
  {
    id: 'rag',
    kind: 'rag',
    label: 'Bagian 03 · Keahlian',
    sector: 'Bagian 03',
    coordinates: '',
    povLabel: { id: 'Lepas Landas & Balon Udara', en: 'Runway Takeoff & Alpine Sky' },
    vehicleStage: 'aircraft',
    cardSide: 'left',
    anchor: [-1.8, 6.4, -174.5],
    cam: [-2.4, 5.2, -160.2],
    look: [0.8, 4.9, -172.5],
    packet: [2.3, 3.8, -169.5],
  },
  {
    id: 'proj-vora-ai',
    kind: 'project',
    label: 'Bagian 04 · Vora AI',
    sector: 'Bagian 04',
    coordinates: '',
    povLabel: { id: 'Pelayaran Langit & Awan Kota', en: 'Above the City Clouds' },
    vehicleStage: 'aircraft',
    cardSide: 'right',
    anchor: [-0.2, 13.8, -210.5],
    cam: [8.8, 16.2, -197.0],
    look: [3.2, 13.6, -209.5],
    packet: [4.8, 13.5, -208.5],
  },
  {
    id: 'proj-tiss',
    kind: 'project',
    label: 'Bagian 04 · TISS',
    sector: 'Bagian 04',
    coordinates: '',
    povLabel: { id: 'Kompleks Peluncuran Roket', en: 'Highland Spaceport & Launchpad' },
    vehicleStage: 'aircraft',
    cardSide: 'left',
    anchor: [3.6, 7.2, -261.0],
    cam: [-6.0, 9.5, -242.0],
    look: [1.2, 8.2, -258.0],
    packet: [-2.8, 6.2, -250.5],
  },
  {
    id: 'proj-neo-era-cuan',
    kind: 'project',
    label: 'Bagian 04 · Neo Era Cuan',
    sector: 'Bagian 04',
    coordinates: '',
    povLabel: { id: 'Lintasan Bulan', en: 'Lunar Trajectory' },
    vehicleStage: 'rocket',
    cardSide: 'right',
    anchor: [-3.8, 24.8, -282.0],
    cam: [5.4, 26.2, -268.5],
    look: [-0.6, 24.8, -280.5],
    packet: [1.5, 24.4, -277.8],
  },
  {
    id: 'proj-catat-crypto',
    kind: 'project',
    label: 'Bagian 04 · Catat Crypto',
    sector: 'Bagian 04',
    coordinates: '',
    povLabel: { id: 'Lintasan Mars & Jupiter', en: 'Mars & Jupiter Flyby' },
    vehicleStage: 'rocket',
    cardSide: 'left',
    anchor: [3.4, 28.9, -315.5],
    cam: [-6.4, 30.4, -301.2],
    look: [0.2, 29.0, -314.5],
    packet: [-2.0, 28.9, -311.2],
  },
  {
    id: 'archive',
    kind: 'archive',
    label: 'Bagian 05 · Arsip Karya',
    sector: 'Bagian 05',
    coordinates: '',
    povLabel: { id: 'Cincin Saturnus & Satelit', en: 'Saturn Rings & Satellites' },
    vehicleStage: 'rocket',
    cardSide: 'right',
    anchor: [-3.8, 32.8, -349.0],
    cam: [5.4, 35.4, -334.5],
    look: [-0.8, 32.8, -347.5],
    packet: [1.7, 32.6, -344.5],
  },
  {
    id: 'delivered',
    kind: 'delivered',
    label: 'Bagian 06 · Kontak & CV',
    sector: 'Bagian 06',
    coordinates: '',
    povLabel: { id: 'Observatorium Ruang Angkasa Dalam', en: 'Deep-Space Observatory' },
    vehicleStage: 'rocket',
    cardSide: 'left',
    anchor: [1.5, 36.2, -382.5],
    cam: [-5.2, 37.8, -367.5],
    look: [1.8, 36.4, -384.0],
    packet: [-0.6, 36.2, -378.0],
  },
];

export const STOPS: SpatialStop[] = rawStops.map((s, index) => ({
  ...s,
  index,
}));

export const RAIL_GROUPS: RailGroup[] = [
  { id: 'edge', label: '01 · Profil', host: 'Ringkasan', kinds: ['edge', 'proxy'] },
  { id: 'services', label: '02 · Pengalaman', host: 'Karier', kinds: ['rack'] },
  { id: 'ai', label: '03 · Keahlian', host: 'Kompetensi', kinds: ['rag'] },
  { id: 'racks', label: '04 · Proyek', host: 'Karya', kinds: ['project', 'archive'] },
  { id: 'delivered', label: '05 · Kontak', host: 'Hubungi', kinds: ['delivered'] },
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
  hoverKey: string;
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
  boot: {
    progress: number;
    stageKey: BootStageKey;
    ready: boolean;
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
  boot: {
    progress: 10,
    stageKey: 'init',
    ready: false,
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
