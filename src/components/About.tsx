import React from 'react';
import { motion } from 'motion/react';

const skills = [
  'React',
  'TypeScript',
  'Node.js',
  'Go',
  'Python',
  'Postgres',
  'Redis',
  'Docker',
  'Tailwind CSS',
  'Framer Motion',
  'GSAP'
];

function getSkillIcon(name: string) {
  switch (name) {
    case 'React':
      return (
        <svg className="w-4 h-4 text-tech-react" viewBox="-11.5 -10.23174 23 20.46348" fill="none">
          <circle cx="0" cy="0" r="2.05" fill="currentColor"/>
          <g stroke="currentColor" strokeWidth="1">
            <ellipse rx="11" ry="4.2"/>
            <ellipse rx="11" ry="4.2" transform="rotate(60)"/>
            <ellipse rx="11" ry="4.2" transform="rotate(120)"/>
          </g>
        </svg>
      );
    case 'TypeScript':
      return (
        <svg className="w-4 h-4 text-tech-typescript" viewBox="0 0 100 100" fill="currentColor">
          <rect width="100" height="100" rx="15" />
          <path d="M35 70h-8v-30h8v30zm18-24h-10v-6h28v6h-10v24h-8v-24z" fill="white"/>
        </svg>
      );
    case 'Tailwind CSS':
      return (
        <svg className="w-4 h-4 text-tech-tailwind" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 6.096c1.696-2.544 4.522-4.096 7.636-4.096 4.364 0 7.636 3.636 7.636 8s-3.272 8-7.636 8c-3.114 0-5.94-1.552-7.636-4.096-1.696 2.544-4.522 4.096-7.636 4.096-4.364 0-7.636-3.636-7.636-8s3.272-8 7.636-8c3.114 0 5.94 1.552 7.636 4.096z" />
        </svg>
      );
    case 'GSAP':
      return (
        <svg className="w-4 h-4 text-tech-gsap" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      );
    case 'Framer Motion':
      return (
        <svg className="w-4 h-4 text-tech-framer" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 24l-8-8h16l-8 8zm0-24l8 8H4l8-8zm-8 8h16v8H4V8z"/>
        </svg>
      );
    case 'Go':
      return (
        <svg className="w-4 h-4 text-tech-go" viewBox="0 0 24 24" fill="currentColor">
          <path d="M14.28 2.3c-2.4 0-4.38 1.98-4.38 4.38v10.64c0 2.4 1.98 4.38 4.38 4.38s4.38-1.98 4.38-4.38V6.68c0-2.4-1.98-4.38-4.38-4.38zm-6.28 7h-2c-1.1 0-2 .9-2 2v2c0 1.1.9 2 2 2h2v-6z" />
        </svg>
      );
    case 'Postgres':
      return (
        <svg className="w-4 h-4 text-tech-postgres" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
        </svg>
      );
    case 'Redis':
      return (
        <svg className="w-4 h-4 text-tech-redis" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2L2 7l10 5 10-5-10-5zm0 10L2 17l10 5 10-5-10-5z" />
        </svg>
      );
    case 'Docker':
      return (
        <svg className="w-4 h-4 text-tech-docker" viewBox="0 0 24 24" fill="currentColor">
          <path d="M13.9 11.23h2.36v-2.36H13.9v2.36zm-2.82 0h2.36v-2.36H11.08v2.36zm-2.82 0h2.36v-2.36H8.26v2.36zm-2.82 0h2.36v-2.36H5.44v2.36z" />
        </svg>
      );
    default:
      return (
        <svg className="w-4 h-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="16 18 22 12 16 6" />
          <polyline points="8 6 2 12 8 18" />
        </svg>
      );
  }
}

export default function About() {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const aboutText = "Fullstack developer with hands-on experience across frontend, backend, and infrastructure. Core stack: React, TypeScript, Node.js, Go, and Python, with database work in PostgreSQL and MySQL. Currently Co-Founder & Fullstack Developer at Vora AI, building a multi-agent automation platform that unifies workflows for SMEs.";

  const words = aboutText.split(' ');

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: prefersReducedMotion ? 0 : 0.015
      }
    }
  };

  const wordVariants = {
    hidden: { opacity: prefersReducedMotion ? 1 : 0.15, y: prefersReducedMotion ? 0 : 4 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.2, ease: 'easeOut' as const } }
  };

  return (
    <section
      id="about"
      className="bg-canvas text-on-dark px-xl py-section flex items-center min-h-screen relative z-10 w-full"
    >
      <div className="max-w-content-max mx-auto w-full flex flex-col gap-xl">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-md items-stretch w-full">
          <div className="md:col-span-12 flex">
            <div className="bg-surface-tile-2 border border-hairline/10 hover:border-primary/50 rounded-lg p-lg shadow-product hover:shadow-primary/5 transition-all duration-300 flex flex-col justify-between gap-lg h-full w-full">
              <div className="flex flex-col gap-lg">
                <h2 className="text-display-lg text-white font-extrabold font-apple-display">About</h2>
                <motion.p
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: '-100px' }}
                  variants={containerVariants}
                  className="text-lead-airy text-body-muted leading-relaxed font-apple-text"
                >
                  {words.map((word, i) => (
                    <motion.span
                      key={i}
                      variants={wordVariants}
                      className="inline-block mr-1.5"
                    >
                      {word}
                    </motion.span>
                  ))}
                </motion.p>
              </div>

              <div className="flex flex-col gap-md">
                <h3 className="text-caption-strong text-white font-semibold font-apple-text">
                  Technologies & Frameworks
                </h3>
                <div className="flex flex-wrap gap-xs">
                  {skills.map((skill) => (
                    <span
                      key={skill}
                      className="flex items-center gap-xxs bg-[#1B1035] text-body-muted text-caption border border-hairline/10 rounded-pill px-chip-x py-sm font-apple-text select-none hover:bg-primary/10 hover:border-primary/30 hover:text-white transition-all duration-200 cursor-default"
                    >
                      {getSkillIcon(skill)}
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="md:col-span-4 flex">
            <div className="bg-surface-tile-2 border border-hairline/10 hover:border-primary/50 rounded-lg p-lg shadow-product hover:shadow-primary/5 transition-all duration-300 flex flex-col gap-sm justify-between w-full h-full group">
              <div className="flex flex-col gap-xs">
                <span className="text-display-md font-extrabold text-primary leading-none">&lt; 100ms</span>
                <span className="text-caption-strong text-white font-semibold mt-xs font-apple-text">Replication Latency</span>
                <p className="text-caption text-body-muted leading-relaxed mt-xxs font-apple-text">
                  High-performance node replication channels deployed across distributed multi-tenant sites.
                </p>
              </div>
              <div className="w-full flex items-center justify-center opacity-75 group-hover:opacity-100 transition-opacity">
                <svg className="w-full h-16 text-primary" viewBox="0 0 200 60" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="latencyGlow" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="rgba(245, 158, 11, 0.8)" />
                      <stop offset="50%" stopColor="rgba(245, 158, 11, 0.3)" />
                      <stop offset="100%" stopColor="rgba(245, 158, 11, 0.8)" />
                    </linearGradient>
                  </defs>
                  <path d="M0,30 L40,30 L50,15 L60,45 L70,30 L80,30 L90,10 L100,50 L110,30 L120,30 L130,20 L140,40 L150,30 L200,30" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1.5" />
                  <path d="M0,30 L40,30 L50,15 L60,45 L70,30 L80,30 L90,10 L100,50 L110,30 L120,30 L130,20 L140,40 L150,30 L200,30" fill="none" stroke="url(#latencyGlow)" strokeWidth="2.5" strokeDasharray="200" strokeDashoffset="200">
                    <animate attributeName="stroke-dashoffset" values="400;0" dur="2.5s" repeatCount="indefinite" />
                  </path>
                </svg>
              </div>
            </div>
          </div>

          <div className="md:col-span-4 flex">
            <div className="bg-surface-tile-2 border border-hairline/10 hover:border-primary/50 rounded-lg p-lg shadow-product hover:shadow-primary/5 transition-all duration-300 flex flex-col gap-sm justify-between w-full h-full group">
              <div className="flex flex-col gap-xs">
                <span className="text-display-md font-extrabold text-primary leading-none">99.9%</span>
                <span className="text-caption-strong text-white font-semibold mt-xs font-apple-text">Database Sync Uptime</span>
                <p className="text-caption text-body-muted leading-relaxed mt-xxs font-apple-text">
                  Dynamic read-replica routing and custom failover logs designed for large monorepo systems.
                </p>
              </div>
              <div className="w-full flex items-center justify-center opacity-75 group-hover:opacity-100 transition-opacity">
                <div className="relative w-16 h-16 flex items-center justify-center">
                  <svg className="w-full h-full text-primary" viewBox="0 0 100 100">
                    <defs>
                      <linearGradient id="uptimeGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="rgb(245, 158, 11)" />
                        <stop offset="100%" stopColor="rgba(245, 158, 11, 0.4)" />
                      </linearGradient>
                    </defs>
                    <circle cx="50" cy="50" r="38" stroke="rgba(255,255,255,0.05)" strokeWidth="6" fill="none" />
                    <circle
                      cx="50"
                      cy="50"
                      r="38"
                      stroke="url(#uptimeGlow)"
                      strokeWidth="6"
                      fill="none"
                      strokeDasharray="238"
                      strokeDashoffset="24"
                      strokeLinecap="round"
                      className="origin-center animate-[spin_4s_linear_infinite]"
                    />
                  </svg>
                  <div className="absolute text-caption font-semibold text-white">99.9</div>
                </div>
              </div>
            </div>
          </div>

          <div className="md:col-span-4 flex">
            <div className="bg-surface-tile-2 border border-hairline/10 hover:border-primary/50 rounded-lg p-lg shadow-product hover:shadow-primary/5 transition-all duration-300 flex flex-col gap-sm justify-between w-full h-full group">
              <div className="flex flex-col gap-xs">
                <span className="text-display-md font-extrabold text-primary leading-none">10k/sec</span>
                <span className="text-caption-strong text-white font-semibold mt-xs font-apple-text">Query Throughput</span>
                <p className="text-caption text-body-muted leading-relaxed mt-xxs font-apple-text">
                  Gin-based backend query routing combined with parallel write partitioning inside Postgres.
                </p>
              </div>
              <div className="w-full flex items-center justify-center opacity-75 group-hover:opacity-100 transition-opacity">
                <svg className="w-full h-16" viewBox="0 0 200 60" xmlns="http://www.w3.org/2000/svg">
                  <line x1="10" y1="15" x2="190" y2="15" stroke="rgba(255,255,255,0.05)" strokeWidth="3" strokeLinecap="round" />
                  <line x1="10" y1="30" x2="190" y2="30" stroke="rgba(255,255,255,0.05)" strokeWidth="3" strokeLinecap="round" />
                  <line x1="10" y1="45" x2="190" y2="45" stroke="rgba(255,255,255,0.05)" strokeWidth="3" strokeLinecap="round" />

                  <circle cx="0" cy="15" r="2.5" fill="rgb(245, 158, 11)">
                    <animate attributeName="cx" values="10;190" dur="1.8s" repeatCount="indefinite" />
                  </circle>
                  <circle cx="0" cy="30" r="2.5" fill="rgb(245, 158, 11)">
                    <animate attributeName="cx" values="10;190" dur="1.2s" repeatCount="indefinite" />
                  </circle>
                  <circle cx="0" cy="45" r="2.5" fill="rgb(245, 158, 11)">
                    <animate attributeName="cx" values="10;190" dur="2s" repeatCount="indefinite" />
                  </circle>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
