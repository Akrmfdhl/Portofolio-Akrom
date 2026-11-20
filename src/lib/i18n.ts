import { useSyncExternalStore } from 'react';

export type Locale = 'id' | 'en';

const STORAGE_KEY = 'akrom-portfolio-locale';

function readInitialLocale(): Locale {
  if (typeof window === 'undefined') return 'id';
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === 'en' || saved === 'id') return saved;
  } catch {
    return 'id';
  }
  return 'id';
}

let currentLocale: Locale = readInitialLocale();
const listeners = new Set<() => void>();

export function getLocale(): Locale {
  return currentLocale;
}

export function setLocale(next: Locale): void {
  if (currentLocale === next) return;
  currentLocale = next;
  if (typeof document !== 'undefined') {
    document.documentElement.lang = next;
  }
  try {
    window.localStorage.setItem(STORAGE_KEY, next);
  } catch {
    return;
  }
  listeners.forEach((fn) => fn());
}

export function subscribeLocale(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useI18n() {
  const locale = useSyncExternalStore(subscribeLocale, getLocale, getLocale);
  return {
    locale,
    setLocale,
    copy: UI_COPY[locale],
  };
}

export interface LocalizedText {
  id: string;
  en: string;
}

export function pickText(locale: Locale, text: LocalizedText): string {
  return text[locale];
}

export type BootStageKey = 'init' | 'models' | 'car' | 'lighting' | 'polish' | 'ready';

export const BOOT_STAGE_LABELS: Record<Locale, Record<BootStageKey, string>> = {
  id: {
    init: 'Ruang portofolio sedang disiapkan...',
    models: 'Aset visual kendaraan sedang dimuat...',
    car: 'Adegan perjalanan sedang diselaraskan...',
    lighting: 'Pencahayaan dan suasana sedang diatur...',
    polish: 'Tampilan pembuka sedang disempurnakan...',
    ready: 'Portofolio siap dijelajahi.',
  },
  en: {
    init: 'Preparing portfolio experience...',
    models: 'Loading vehicle models and scenery...',
    car: 'Aligning interactive scenes...',
    lighting: 'Preparing lighting and atmosphere...',
    polish: 'Polishing opening presentation...',
    ready: 'Portfolio is ready to explore.',
  },
};

export interface PickableTranslation {
  id: { title: string; subtitle: string; detail: string };
  en: { title: string; subtitle: string; detail: string };
}

export const PICKABLE_COPY: Record<string, PickableTranslation> = {
  edge: {
    id: {
      title: 'Profil Utama · Akrom Fadhil',
      subtitle: 'Perjalanan karya dimulai dari jalur pegunungan',
      detail: 'Gulir halaman ke bawah untuk menelusuri portofolio',
    },
    en: {
      title: 'Main Profile · Akrom Fadhil',
      subtitle: 'Portfolio journey begins on the alpine highway',
      detail: 'Scroll down to explore the full portfolio',
    },
  },
  proxy: {
    id: {
      title: 'Stasiun Utama · Ringkasan Karier',
      subtitle: 'Perpindahan kendaraan dari mobil ke kereta ekspres',
      detail: 'Pengalaman penuh di React, Go, Python & AI',
    },
    en: {
      title: 'Grand Station · Career Summary',
      subtitle: 'Hub transfer from mountain highway to express rail',
      detail: 'Full-stack delivery in React, Go, Python & AI',
    },
  },
  'exp-vora': {
    id: {
      title: 'Pengalaman 01 · Vora AI',
      subtitle: 'Co-Founder & Fullstack Architect',
      detail: 'Efisiensi alur kerja bisnis lebih cepat 40%',
    },
    en: {
      title: 'Experience 01 · Vora AI',
      subtitle: 'Co-Founder & Fullstack Architect',
      detail: '40% faster enterprise operations',
    },
  },
  'exp-tiss': {
    id: {
      title: 'Pengalaman 02 · TISS Platform',
      subtitle: 'Core Engineer (~65% Kontribusi)',
      detail: 'Sinkronisasi data di bawah 100ms',
    },
    en: {
      title: 'Experience 02 · TISS Platform',
      subtitle: 'Core Monorepo Engineer (~65% Ownership)',
      detail: 'Sub-100ms multi-tenant synchronization',
    },
  },
  'exp-neo': {
    id: {
      title: 'Pengalaman 03 · PT Neo Era Cuan',
      subtitle: 'Frontend Systems Developer',
      detail: 'Aksesibilitas WCAG AAA & pemuatan 15% lebih cepat',
    },
    en: {
      title: 'Experience 03 · PT Neo Era Cuan',
      subtitle: 'Frontend Systems Developer',
      detail: 'WCAG AAA contrast & 15% faster load speed',
    },
  },
  'exp-inovindo': {
    id: {
      title: 'Bandara 3D · Pengalaman 04',
      subtitle: 'Terminal Kereta Bandara & Landasan Pacu 09L',
      detail: 'Magang Front-End, Pemodelan ERD & Kualitas',
    },
    en: {
      title: '3D Airport Hub · Experience 04',
      subtitle: 'Airport Rail Interchange & Runway 09L',
      detail: 'Front-End, ERD Modeling & Operations QA',
    },
  },
  rag: {
    id: {
      title: 'Keahlian & Teknologi Inti',
      subtitle: '4 Kelompok Kompetensi Teknis',
      detail: 'React · TypeScript · Go · FastAPI · PostgreSQL',
    },
    en: {
      title: 'Skills & Core Technologies',
      subtitle: '4 Core Engineering Pillars',
      detail: 'React · TypeScript · Go · FastAPI · PostgreSQL',
    },
  },
  'proj-vora-ai': {
    id: {
      title: 'Proyek Pilihan · Vora AI',
      subtitle: 'Platform Otomasi Bisnis Multi-Agen',
      detail: 'Mengurangi hambatan operasional hingga 40%',
    },
    en: {
      title: 'Featured Project · Vora AI',
      subtitle: 'Multi-Agent Business Automation Platform',
      detail: '40% reduction in operational delays',
    },
  },
  'proj-tiss': {
    id: {
      title: 'Kompleks Peluncuran · TISS',
      subtitle: 'Bandar Antariksa & Menara Peluncuran Roket',
      detail: '10.000 kueri per detik di bawah 100ms',
    },
    en: {
      title: 'Spaceport Launchpad · TISS',
      subtitle: 'Highland Spaceport Apron & Orbital Launch Tower',
      detail: '10k queries/sec under 100ms latency',
    },
  },
  'proj-neo-era-cuan': {
    id: {
      title: 'Proyek Pilihan · PT Neo Era Cuan',
      subtitle: 'Antarmuka Keuangan & Investasi',
      detail: 'Standar aksesibilitas WCAG AAA yang mulus',
    },
    en: {
      title: 'Featured Project · PT Neo Era Cuan',
      subtitle: 'Financial & Investment Web Platform',
      detail: 'WCAG AAA accessible financial interface',
    },
  },
  'proj-catat-crypto': {
    id: {
      title: 'Proyek Pilihan · Catat Crypto',
      subtitle: 'Jurnal Perdagangan & Analitik Aset',
      detail: 'Proyek sumber terbuka dengan GSAP & React',
    },
    en: {
      title: 'Featured Project · Catat Crypto',
      subtitle: 'Crypto Trading Journal & Portfolio Analytics',
      detail: 'Open-source React & GSAP visualization',
    },
  },
  'proj-blocksim': {
    id: {
      title: 'Karya Tambahan · BlockSim Android',
      subtitle: 'Simulator Kriptografi & Blockchain',
      detail: '7 laboratorium interaktif di Jetpack Compose',
    },
    en: {
      title: 'Additional Work · BlockSim Android',
      subtitle: 'Blockchain Cryptography Simulator',
      detail: '7 interactive labs built in Jetpack Compose',
    },
  },
  'proj-lms-curriculum': {
    id: {
      title: 'Karya Tambahan · Modular LMS',
      subtitle: 'Portal Pembelajaran & Kurikulum Terstruktur',
      detail: 'Pemantauan kemajuan belajar secara langsung',
    },
    en: {
      title: 'Additional Work · Modular LMS',
      subtitle: 'Structured Curriculum & Learning Portal',
      detail: 'Unified student progress management',
    },
  },
  'proj-webgl-grid': {
    id: {
      title: 'Karya Tambahan · Portofolio Web 3D',
      subtitle: 'Pengalaman Visual Interaktif dengan Three.js',
      detail: 'Lanskap bumi hingga orbit dalam satu halaman',
    },
    en: {
      title: 'Additional Work · 3D Web Portfolio',
      subtitle: 'Interactive Visual Experience in Three.js',
      detail: 'Seamless journey from earth to outer space',
    },
  },
  'proj-redis-mesh': {
    id: {
      title: 'Karya Tambahan · Pemrosesan Data Cepat',
      subtitle: 'Arsitektur Partisi PostgreSQL & Redis',
      detail: 'Menangani hingga 10.000 transaksi per detik',
    },
    en: {
      title: 'Additional Work · High-Throughput Router',
      subtitle: 'PostgreSQL Partitioning & Redis Architecture',
      detail: 'Sustains 10,000 transactions per second',
    },
  },
  delivered: {
    id: {
      title: 'Observatorium Ruang Angkasa · Kontak & CV',
      subtitle: 'Titik akhir perjalanan di orbit eksoplanet es',
      detail: 'akromfadhil234@gmail.com',
    },
    en: {
      title: 'Deep-Space Observatory · Contact & CV',
      subtitle: 'Final destination orbiting an ice-giant exoplanet',
      detail: 'akromfadhil234@gmail.com',
    },
  },
};

export interface UiDictionary {
  docTitle: string;
  skip: string;
  preloader: {
    eyebrow: string;
    subtitle: string;
  };
  nav: {
    homeAria: string;
    menu: string;
    soundOn: string;
    soundOff: string;
    soundAria: string;
    cv: string;
    contact: string;
    chaptersHeading: string;
    viewHeading: string;
    cameraMode: string;
    cameraGuided: string;
    cameraOrbit: string;
    cardsToggle: string;
    cardsVisible: string;
    cardsMinimal: string;
    motionBoost: string;
    motionBoostKey: string;
    quickJump: string;
    quickJumpKey: string;
    expandCard: string;
    minimizeCard: string;
  };
  chapters: Array<{ id: string; short: string; label: string; sub: string }>;
  hero: {
    chapterMeta: string;
    role: string;
    bio: string;
    ctaSummary: string;
    ctaCv: string;
    ctaDownload: string;
    cue: string;
  };
  summary: {
    title: string;
    chapterMeta: string;
    educationHeading: string;
    openCv: string;
  };
  experience: {
    groupTitle: string;
    readMore: string;
    readLess: string;
    viewRepo: string;
  };
  skills: {
    title: string;
    chapterMeta: string;
  };
  projects: {
    groupTitle: string;
    showBreakdown: string;
    hideBreakdown: string;
    caseStudy: string;
    sourceGithub: string;
    problemLabel: string;
    approachLabel: string;
    outcomeLabel: string;
    archiveTitle: string;
    archiveMeta: string;
  };
  contact: {
    title: string;
    chapterMeta: string;
    openCv: string;
    formTitle: string;
    nameLabel: string;
    namePlaceholder: string;
    emailLabel: string;
    emailPlaceholder: string;
    messageLabel: string;
    messagePlaceholder: string;
    submitIdle: string;
    submitSending: string;
    ackPrefix: string;
    faqTitle: string;
    educationTitle: string;
    credentialsTitle: string;
    footerNote: string;
  };
  resume: {
    headingSuffix: string;
    download: string;
    closeAria: string;
    tabExperience: string;
    tabEducation: string;
    tabSkills: string;
  };
  projectDetail: {
    notFound: string;
    backHome: string;
    backPortfolio: string;
    role: string;
    scopeImpact: string;
    problem: string;
    approach: string;
    technologies: string;
    outcome: string;
    viewGithub: string;
    privateWork: string;
  };
  quickNav: {
    title: string;
    welcome: string;
    placeholder: string;
    btnHelp: string;
    btnProfile: string;
    btnClose: string;
    helpText: string;
    unknownCmd: string;
    navigating: string;
    invalidChapter: string;
    boostMsg: string;
    orbitMsg: string;
    guidedMsg: string;
  };
}

export const UI_COPY: Record<Locale, UiDictionary> = {
  id: {
    docTitle: 'Akrom Fadhil — Portofolio Pengembang Full-Stack & AI',
    skip: 'Lewati ke konten utama',
    preloader: {
      eyebrow: 'PORTOFOLIO INTERAKTIF · AKROM FADHIL',
      subtitle: 'Perjalanan Karya Rekayasa Perangkat Lunak',
    },
    nav: {
      homeAria: 'Kembali ke bagian awal portofolio',
      menu: 'Jelajah',
      soundOn: 'Musik Hidup',
      soundOff: 'Musik Mati',
      soundAria: 'Atur musik latar portofolio',
      cv: 'CV',
      contact: 'Kontak',
      chaptersHeading: 'Bagian Portofolio',
      viewHeading: 'Pengaturan Tampilan',
      cameraMode: 'Sudut Pandang',
      cameraGuided: 'Terpandu',
      cameraOrbit: 'Bebas 3D',
      cardsToggle: 'Tampilan Kartu',
      cardsVisible: 'Lengkap',
      cardsMinimal: 'Ringkas',
      motionBoost: 'Dorongan Gerak',
      motionBoostKey: 'Spasi',
      quickJump: 'Navigasi Cepat',
      quickJumpKey: 'Tekan `',
      expandCard: 'Perbesar kartu informasi',
      minimizeCard: 'Perkecil kartu untuk melihat adegan 3D',
    },
    chapters: [
      { id: 'edge', short: '01 · Profil', label: '01 · Profil & Ringkasan', sub: 'Tentang Saya' },
      { id: 'services', short: '02 · Pengalaman', label: '02 · Pengalaman Kerja', sub: 'Rekam Jejak' },
      { id: 'ai', short: '03 · Keahlian', label: '03 · Keahlian Teknis', sub: 'Kompetensi' },
      { id: 'racks', short: '04 · Proyek', label: '04 · Proyek Pilihan', sub: 'Hasil Karya' },
      { id: 'delivered', short: '05 · Kontak', label: '05 · Kontak & CV', sub: 'Hubungi Saya' },
    ],
    hero: {
      chapterMeta: 'Bagian 01 · Profil Utama',
      role: 'Pengembang Full-Stack, AI Multi-Agen & Aplikasi Web',
      bio: 'Saya merancang dan membangun aplikasi web full-stack, platform otomasi AI multi-agen menggunakan Python serta FastAPI, layanan backend berkinerja tinggi dengan Go, dan antarmuka React serta TypeScript yang responsif.',
      ctaSummary: 'Baca Ringkasan',
      ctaCv: 'Lihat CV Lengkap',
      ctaDownload: 'Unduh CV',
      cue: 'Gulir halaman ke bawah untuk menelusuri perjalanan karya dari pegunungan hingga luar angkasa.',
    },
    summary: {
      title: 'Profil & Ringkasan Karier',
      chapterMeta: 'Bagian 01 · Perkenalan Singkat',
      educationHeading: 'Riwayat Pendidikan',
      openCv: 'Buka CV Interaktif',
    },
    experience: {
      groupTitle: 'Bagian 02 · Pengalaman Kerja',
      readMore: 'Baca Cakupan Peran',
      readLess: 'Tutup Rincian',
      viewRepo: 'Lihat Repositori',
    },
    skills: {
      title: 'Keahlian Teknis & Kolaborasi',
      chapterMeta: 'Bagian 03 · Kompetensi Utama',
    },
    projects: {
      groupTitle: 'Bagian 04 · Proyek Pilihan & Karya Terpilih',
      showBreakdown: 'Lihat Rincian Proyek',
      hideBreakdown: 'Tutup Rincian',
      caseStudy: 'Studi Kasus',
      sourceGithub: 'Kode di GitHub',
      problemLabel: 'Tantangan Utama',
      approachLabel: 'Pendekatan Solusi',
      outcomeLabel: 'Hasil yang Dicapai',
      archiveTitle: 'Karya & Eksperimen Tambahan',
      archiveMeta: 'Bagian 05 · Arsip Karya',
    },
    contact: {
      title: 'Kontak & Daftar Riwayat Hidup',
      chapterMeta: 'Bagian 06 · Siap Berkolaborasi',
      openCv: 'Buka CV Digital',
      formTitle: 'Kirim Pesan Langsung',
      nameLabel: 'Nama Lengkap',
      namePlaceholder: 'Nama Anda / Perusahaan',
      emailLabel: 'Alamat Email',
      emailPlaceholder: 'nama@perusahaan.com',
      messageLabel: 'Pesan Anda',
      messagePlaceholder: 'Ceritakan kebutuhan proyek, peluang kerja, atau kolaborasi Anda...',
      submitIdle: 'Kirim Pesan',
      submitSending: 'Memproses...',
      ackPrefix: 'Terima kasih. Pesan Anda telah dicatat untuk',
      faqTitle: 'Pertanyaan yang Sering Diajukan',
      educationTitle: 'Pendidikan',
      credentialsTitle: 'Ringkasan Pengalaman',
      footerNote: 'Akrom Fadhil M. · Tangerang, Indonesia. Tekan tombol Spasi untuk dorongan gerak kendaraan.',
    },
    resume: {
      headingSuffix: 'Daftar Riwayat Hidup',
      download: 'Unduh CV',
      closeAria: 'Tutup jendela riwayat hidup',
      tabExperience: 'Pengalaman',
      tabEducation: 'Pendidikan',
      tabSkills: 'Keahlian Teknis',
    },
    projectDetail: {
      notFound: 'Proyek Tidak Ditemukan',
      backHome: 'Kembali ke Beranda',
      backPortfolio: 'Kembali ke Portofolio',
      role: 'Peran',
      scopeImpact: 'Cakupan & Dampak',
      problem: 'Tantangan Utama',
      approach: 'Pendekatan Solusi',
      technologies: 'Teknologi yang Digunakan',
      outcome: 'Hasil Utama',
      viewGithub: 'Lihat di GitHub',
      privateWork: 'Proyek Produksi Privat',
    },
    quickNav: {
      title: 'Navigasi Cepat Portofolio',
      welcome:
        'Navigasi Cepat Portofolio siap digunakan.\nKetik "bantuan" untuk melihat daftar perintah, "profil" untuk ringkasan, atau "buka 1..5" untuk berpindah bagian.',
      placeholder: 'Ketik bantuan, profil, proyek, keahlian, buka 1..5',
      btnHelp: 'Bantuan',
      btnProfile: 'Profil',
      btnClose: 'Tutup',
      helpText: [
        'bantuan            menampilkan daftar perintah yang tersedia',
        'profil             menampilkan informasi kontak dan ringkasan karier',
        'proyek             menampilkan daftar proyek unggulan dan arsip',
        'keahlian           menampilkan daftar keahlian teknis',
        'buka <1-5>         berpindah ke bagian (1=Profil .. 5=Kontak)',
        'cv                 membuka jendela Daftar Riwayat Hidup lengkap',
        'kamera <pandu|bebas> mengatur sudut pandang kamera 3D',
        'bersihkan          menghapus riwayat layar navigasi',
        'keluar             menutup jendela navigasi cepat',
      ].join('\n'),
      unknownCmd: 'Perintah tidak dikenali. Ketik "bantuan" untuk melihat daftar perintah.',
      navigating: 'Berpindah menuju bagian',
      invalidChapter: 'Nomor bagian tidak valid. Gunakan buka 1 hingga buka',
      boostMsg: 'Efek dorongan gerak kendaraan diaktifkan.',
      orbitMsg: 'Kamera beralih ke mode putar bebas 3D.',
      guidedMsg: 'Kamera kembali mengikuti jalur perjalanan terpandu.',
    },
  },
  en: {
    docTitle: 'Akrom Fadhil — Full-Stack, AI & Web Engineering Portfolio',
    skip: 'Skip to main content',
    preloader: {
      eyebrow: 'INTERACTIVE PORTFOLIO · AKROM FADHIL',
      subtitle: 'Software Engineering Portfolio Journey',
    },
    nav: {
      homeAria: 'Return to top of portfolio',
      menu: 'Explore',
      soundOn: 'Sound On',
      soundOff: 'Muted',
      soundAria: 'Toggle portfolio background music',
      cv: 'CV',
      contact: 'Contact',
      chaptersHeading: 'Portfolio Chapters',
      viewHeading: 'View Options',
      cameraMode: 'Camera View',
      cameraGuided: 'Guided Story',
      cameraOrbit: 'Free 3D Orbit',
      cardsToggle: 'Story Cards',
      cardsVisible: 'Expanded',
      cardsMinimal: 'Minimal',
      motionBoost: 'Motion Boost',
      motionBoostKey: 'Space',
      quickJump: 'Quick Navigator',
      quickJumpKey: 'Press `',
      expandCard: 'Expand story card',
      minimizeCard: 'Minimize card to inspect 3D scene',
    },
    chapters: [
      { id: 'edge', short: '01 · Profile', label: '01 · Profile & Summary', sub: 'Introduction' },
      { id: 'services', short: '02 · Experience', label: '02 · Work Experience', sub: 'Career Track' },
      { id: 'ai', short: '03 · Skills', label: '03 · Technical Skills', sub: 'Capabilities' },
      { id: 'racks', short: '04 · Projects', label: '04 · Featured Projects', sub: 'Selected Work' },
      { id: 'delivered', short: '05 · Contact', label: '05 · Contact & CV', sub: 'Get in Touch' },
    ],
    hero: {
      chapterMeta: 'Chapter 01 · Profile Overview',
      role: 'Full-Stack, Multi-Agent AI & Web Engineer',
      bio: 'I design and build full-stack web applications, multi-agent AI automation platforms with Python and FastAPI, high-throughput Go services, and responsive React and TypeScript interfaces.',
      ctaSummary: 'Read Summary',
      ctaCv: 'Open Full CV',
      ctaDownload: 'Download CV',
      cue: 'Scroll down to follow the portfolio journey from alpine roads to outer space.',
    },
    summary: {
      title: 'Profile & Career Summary',
      chapterMeta: 'Chapter 01 · Career Highlights',
      educationHeading: 'Academic Education',
      openCv: 'Open Interactive CV',
    },
    experience: {
      groupTitle: 'Chapter 02 · Work Experience',
      readMore: 'Read Full Scope',
      readLess: 'Show Less',
      viewRepo: 'View Repository',
    },
    skills: {
      title: 'Technical & Soft Skills',
      chapterMeta: 'Chapter 03 · Core Capabilities',
    },
    projects: {
      groupTitle: 'Chapter 04 · Featured Projects & Case Studies',
      showBreakdown: 'Project Breakdown',
      hideBreakdown: 'Hide Breakdown',
      caseStudy: 'Case Study',
      sourceGithub: 'Source on GitHub',
      problemLabel: 'Challenge',
      approachLabel: 'Solution Approach',
      outcomeLabel: 'Measured Outcome',
      archiveTitle: 'Additional Selected Work',
      archiveMeta: 'Chapter 05 · Project Archive',
    },
    contact: {
      title: 'Contact & Curriculum Vitae',
      chapterMeta: 'Chapter 06 · Let us Connect',
      openCv: 'Open Digital CV',
      formTitle: 'Send a Direct Message',
      nameLabel: 'Full Name',
      namePlaceholder: 'Your Name / Organization',
      emailLabel: 'Email Address',
      emailPlaceholder: 'you@company.com',
      messageLabel: 'Message',
      messagePlaceholder: 'Describe your project, collaboration idea, or engineering role...',
      submitIdle: 'Send Message',
      submitSending: 'Sending...',
      ackPrefix: 'Thank you. Your message has been prepared for',
      faqTitle: 'Frequently Asked Questions',
      educationTitle: 'Education',
      credentialsTitle: 'Experience Highlights',
      footerNote: 'Akrom Fadhil M. · Tangerang, Indonesia. Press Space for vehicle motion boost.',
    },
    resume: {
      headingSuffix: 'Curriculum Vitae',
      download: 'Download CV',
      closeAria: 'Close resume modal',
      tabExperience: 'Experience',
      tabEducation: 'Education',
      tabSkills: 'Technical Stack',
    },
    projectDetail: {
      notFound: 'Project Not Found',
      backHome: 'Back to Home',
      backPortfolio: 'Back to Portfolio',
      role: 'Role',
      scopeImpact: 'Scope & Impact',
      problem: 'Challenge',
      approach: 'Solution Approach',
      technologies: 'Technologies Used',
      outcome: 'Outcome',
      viewGithub: 'View on GitHub',
      privateWork: 'Private Production Work',
    },
    quickNav: {
      title: 'Portfolio Quick Navigator',
      welcome:
        'Portfolio Quick Navigator is ready.\nType "help" to list commands, "profile" for a summary, or "goto 1..5" to jump between chapters.',
      placeholder: 'Type help, profile, projects, skills, goto 1..5',
      btnHelp: 'Help',
      btnProfile: 'Profile',
      btnClose: 'Close',
      helpText: [
        'help                 list available commands',
        'profile              display engineer summary & contact details',
        'projects             list featured and archived portfolio projects',
        'skills               list core engineering capabilities',
        'goto <1-5>           jump to chapter (1=Profile .. 5=Contact)',
        'boost                trigger vehicle motion boost',
        'camera <guided|orbit> switch between guided view and free 3D orbit',
        'cv                   open full Digital CV modal',
        'clear                clear navigator output',
        'close                close quick navigator',
      ].join('\n'),
      unknownCmd: 'Unknown command. Type "help" to view available options.',
      navigating: 'Navigating to chapter',
      invalidChapter: 'Invalid chapter number. Use goto 1 through goto',
      boostMsg: 'Vehicle motion boost triggered.',
      orbitMsg: 'Camera switched to free 3D orbit view.',
      guidedMsg: 'Camera returned to guided story perspective.',
    },
  },
};
