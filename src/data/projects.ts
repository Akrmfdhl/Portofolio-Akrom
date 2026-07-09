import catatCrypto from '../assets/catat-crypto.png';
import lmsCurriculum from '../assets/lms-curriculum.png';
import blocksim from '../assets/blocksim.png';
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
    slug: 'catat-crypto',
    name: 'Catat Crypto',
    role: 'Contributor',
    copyFraming: 'Contributor — frontend features & bug fixes via fork/PRs to staging',
    description: 'A cryptocurrency ledger and transaction tracking system built with React and TypeScript.',
    problem: 'Managing complex crypto portfolios across multiple wallets and exchanges lacked a clean, unified view.',
    approach: 'Contributed modular UI widgets for tracking transaction history and integrated wallet APIs to sync balances.',
    outcome: 'Delivered cleaner, more resilient transactions history displays and reduced component load times by ~15%.',
    stack: ['React', 'TypeScript', 'Tailwind CSS', 'Framer Motion'],
    screenshotUrl: catatCrypto,
    githubUrl: 'https://github.com/Akrmfdhl/catat-crypto',
    isPrivate: false
  },
  {
    slug: 'lms-curriculum',
    name: 'LMS Curriculum UI',
    role: 'Contributor',
    copyFraming: 'Contributor — feature branch, curriculum UI',
    description: 'An advanced curriculum manager for learning management systems facilitating dynamic module drag-and-drop.',
    problem: 'Curriculum layout tools were rigid, frustrating teachers when organizing complex course flows.',
    approach: 'Owned the implementation of the drag-and-drop course-builder interface and course outline preview panels.',
    outcome: 'Shipped modular layout interfaces supporting nesting levels up to four courses deep.',
    stack: ['React', 'TypeScript', 'Tailwind CSS', 'Dnd Kit'],
    screenshotUrl: lmsCurriculum,
    githubUrl: 'https://github.com/Akrmfdhl/lms-curriculum-ui',
    isPrivate: false
  },
  {
    slug: 'blocksim',
    name: 'BlockSim',
    role: 'Contributor',
    copyFraming: 'Contributor — Android app (Kotlin/Jetpack Compose + Go backend)',
    description: 'A visual simulator for blockchain nodes demonstrating consensus algorithms under variable network latency.',
    problem: 'Simulating consensus mechanisms visually in mobile environments was slow and difficult to debug.',
    approach: 'Contributed Android frontend client logic in Kotlin and Jetpack Compose to display node logs in real time.',
    outcome: 'Successfully visualized node transitions under latency ranges of 50ms to 2000ms.',
    stack: ['Kotlin', 'Jetpack Compose', 'Go', 'gRPC'],
    screenshotUrl: blocksim,
    isPrivate: true
  },
  {
    slug: 'tiss',
    name: 'TISS',
    role: 'Core Contributor — ~65% of implementation',
    copyFraming: 'Core Contributor — drove ~65% of implementation across the monorepo',
    description: 'An enterprise-scale tracking and information synchronization system deployed across distributed multi-tenant sites.',
    problem: 'Legacy systems suffered from data lag and lock conflicts during high-volume node replication cycles.',
    approach: 'Led the backend service refactor in Go, implemented Redis-backed event channels, and designed React dashboards.',
    outcome: 'Successfully unified nodes with latency under 100ms and reduced replication failures to zero.',
    stack: ['Go', 'Gin', 'GORM', 'Postgres', 'Redis', 'Docker', 'React', 'TypeScript'],
    screenshotUrl: tiss,
    isPrivate: true
  }
];
