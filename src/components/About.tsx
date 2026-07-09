import React, { useRef } from 'react';
import { motion } from 'motion/react';
import ProfileCard from './ProfileCard';

const skills = [
  'React',
  'TypeScript',
  'Tailwind CSS',
  'GSAP',
  'Framer Motion',
  'Lenis',
  'React Router',
  'Go',
  'Gin',
  'GORM',
  'Postgres',
  'Redis',
  'Docker',
  'Kotlin',
  'Jetpack Compose'
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
    case 'Lenis':
      return (
        <svg className="w-4 h-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8 3v18M16 3v18M3 8h18M3 16h18"/>
        </svg>
      );
    case 'React Router':
      return (
        <svg className="w-4 h-4 text-tech-router" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zm0 0h10a2 2 0 002-2V9a2 2 0 00-2-2M9 17h6" />
        </svg>
      );
    case 'Go':
      return (
        <svg className="w-4 h-4 text-tech-go" viewBox="0 0 24 24" fill="currentColor">
          <path d="M14.28 2.3c-2.4 0-4.38 1.98-4.38 4.38v10.64c0 2.4 1.98 4.38 4.38 4.38s4.38-1.98 4.38-4.38V6.68c0-2.4-1.98-4.38-4.38-4.38zm-6.28 7h-2c-1.1 0-2 .9-2 2v2c0 1.1.9 2 2 2h2v-6z" />
        </svg>
      );
    case 'Gin':
      return (
        <svg className="w-4 h-4 text-tech-gin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2L2 22h20L12 2zM12 6l6 12H6L12 6z"/>
        </svg>
      );
    case 'GORM':
      return (
        <svg className="w-4 h-4 text-tech-gorm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="9" rx="1"/>
          <rect x="14" y="3" width="7" height="5" rx="1"/>
          <rect x="14" y="12" width="7" height="9" rx="1"/>
          <rect x="3" y="16" width="7" height="5" rx="1"/>
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
    case 'Kotlin':
      return (
        <svg className="w-4 h-4 text-tech-kotlin" viewBox="0 0 24 24" fill="currentColor">
          <path d="M1.5 22.5h21v-21h-21v21zm2.5-2.5V4h16L4 20z" />
        </svg>
      );
    case 'Jetpack Compose':
      return (
        <svg className="w-4 h-4 text-tech-kotlin" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2L2 22h20L12 2zM4 19l8-13 8 13H4z"/>
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

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
}

function TiltCard({ children, className = '' }: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = cardRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const xc = rect.width / 2;
    const yc = rect.height / 2;

    const rotateX = -(y - yc) / 30;
    const rotateY = (x - xc) / 40;

    el.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.015, 1.015, 1.015)`;
  };

  const handleMouseLeave = () => {
    const el = cardRef.current;
    if (!el) return;
    el.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`transition-all duration-200 ease-out origin-center ${className}`}
      style={{ transformStyle: 'preserve-3d' }}
    >
      {children}
    </div>
  );
}

export default function About() {
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: 'easeOut' as const,
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  return (
    <section
      id="about"
      className="bg-surface-tile-1 text-on-dark px-xl py-section flex items-center min-h-screen relative z-10 w-full"
    >
      <div className="max-w-content-max mx-auto w-full flex flex-col gap-xl">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-md items-stretch w-full">
          {/* Main Info Bento Box */}
          <TiltCard className="md:col-span-8 flex">
            <div className="bg-surface-tile-2/45 backdrop-blur-md border border-hairline/10 hover:border-primary/50 rounded-lg p-lg shadow-product hover:shadow-primary/5 transition-all duration-300 flex flex-col justify-between gap-lg h-full w-full">
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-100px' }}
                variants={containerVariants}
                className="flex flex-col gap-lg"
              >
                <motion.h2
                  variants={itemVariants}
                  className="text-display-lg text-body-on-dark"
                >
                  About
                </motion.h2>
                <motion.p
                  variants={itemVariants}
                  className="text-lead-airy text-body-muted leading-relaxed"
                >
                  As a developer, I build premium web applications that prioritize visual excellence, structured aesthetics, and performance. I bridge the gap between architectural precision and fluid interface interaction.
                </motion.p>
              </motion.div>

              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-100px' }}
                variants={containerVariants}
                className="flex flex-col gap-md"
              >
                <motion.h3
                  variants={itemVariants}
                  className="text-caption-strong text-body-on-dark"
                >
                  Technologies & Frameworks
                </motion.h3>
                <motion.div
                  variants={itemVariants}
                  className="flex flex-wrap gap-xs"
                >
                  {skills.map((skill) => (
                    <span
                      key={skill}
                      className="flex items-center gap-xxs bg-surface-tile-1 text-body-muted text-caption border border-hairline/10 rounded-pill px-chip-x py-sm font-apple-text select-none hover:bg-primary/10 hover:border-primary/30 hover:text-body-on-dark transition-all duration-200 cursor-default"
                    >
                      {getSkillIcon(skill)}
                      {skill}
                    </span>
                  ))}
                </motion.div>
              </motion.div>
            </div>
          </TiltCard>

          {/* Profile Card Bento Box */}
          <TiltCard className="md:col-span-4 flex">
            <div className="bg-surface-tile-2/45 backdrop-blur-md border border-hairline/10 hover:border-primary/50 rounded-lg p-lg shadow-product hover:shadow-primary/5 transition-all duration-300 flex items-center justify-center h-full w-full">
              <ProfileCard />
            </div>
          </TiltCard>

          {/* Stat Bento Box 1 - Latency */}
          <TiltCard className="md:col-span-4 flex">
            <div className="bg-surface-tile-2/45 backdrop-blur-md border border-hairline/10 hover:border-primary/50 rounded-lg p-lg shadow-product hover:shadow-primary/5 transition-all duration-300 flex flex-col gap-sm justify-between w-full h-full group">
              <div className="flex flex-col gap-xs">
                <span className="text-display-md font-semibold text-primary leading-none">&lt; 100ms</span>
                <span className="text-caption-strong text-body-on-dark font-semibold mt-xs">Replication Latency</span>
                <p className="text-caption text-body-muted leading-relaxed mt-xxs">
                  High-performance node replication channels deployed across distributed multi-tenant sites.
                </p>
              </div>
              <div className="w-full flex items-center justify-center opacity-75 group-hover:opacity-100 transition-opacity">
                <svg className="w-full h-16 text-primary" viewBox="0 0 200 60" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="latencyGlow" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="rgba(0, 210, 255, 0.8)" />
                      <stop offset="50%" stopColor="rgba(255, 159, 252, 0.8)" />
                      <stop offset="100%" stopColor="rgba(0, 210, 255, 0.8)" />
                    </linearGradient>
                  </defs>
                  <path d="M0,30 L40,30 L50,15 L60,45 L70,30 L80,30 L90,10 L100,50 L110,30 L120,30 L130,20 L140,40 L150,30 L200,30" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1.5" />
                  <path d="M0,30 L40,30 L50,15 L60,45 L70,30 L80,30 L90,10 L100,50 L110,30 L120,30 L130,20 L140,40 L150,30 L200,30" fill="none" stroke="url(#latencyGlow)" strokeWidth="2.5" strokeDasharray="200" strokeDashoffset="200">
                    <animate attributeName="stroke-dashoffset" values="400;0" dur="2.5s" repeatCount="indefinite" />
                  </path>
                </svg>
              </div>
            </div>
          </TiltCard>

          {/* Stat Bento Box 2 - Uptime */}
          <TiltCard className="md:col-span-4 flex">
            <div className="bg-surface-tile-2/45 backdrop-blur-md border border-hairline/10 hover:border-primary/50 rounded-lg p-lg shadow-product hover:shadow-primary/5 transition-all duration-300 flex flex-col gap-sm justify-between w-full h-full group">
              <div className="flex flex-col gap-xs">
                <span className="text-display-md font-semibold text-primary leading-none">99.9%</span>
                <span className="text-caption-strong text-body-on-dark font-semibold mt-xs">Database Sync Uptime</span>
                <p className="text-caption text-body-muted leading-relaxed mt-xxs">
                  Dynamic read-replica routing and custom failover logs designed for large monorepo systems.
                </p>
              </div>
              <div className="w-full flex items-center justify-center opacity-75 group-hover:opacity-100 transition-opacity">
                <div className="relative w-16 h-16 flex items-center justify-center">
                  <svg className="w-full h-full text-primary" viewBox="0 0 100 100">
                    <defs>
                      <linearGradient id="uptimeGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="rgb(0, 210, 255)" />
                        <stop offset="100%" stopColor="rgb(255, 159, 252)" />
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
                  <div className="absolute text-caption font-semibold text-body-on-dark">99.9</div>
                </div>
              </div>
            </div>
          </TiltCard>

          {/* Stat Bento Box 3 - Throughput */}
          <TiltCard className="md:col-span-4 flex">
            <div className="bg-surface-tile-2/45 backdrop-blur-md border border-hairline/10 hover:border-primary/50 rounded-lg p-lg shadow-product hover:shadow-primary/5 transition-all duration-300 flex flex-col gap-sm justify-between w-full h-full group">
              <div className="flex flex-col gap-xs">
                <span className="text-display-md font-semibold text-primary leading-none">10k/sec</span>
                <span className="text-caption-strong text-body-on-dark font-semibold mt-xs">Query Throughput</span>
                <p className="text-caption text-body-muted leading-relaxed mt-xxs">
                  Gin-based backend query routing combined with parallel write partitioning inside Postgres.
                </p>
              </div>
              <div className="w-full flex items-center justify-center opacity-75 group-hover:opacity-100 transition-opacity">
                <svg className="w-full h-16" viewBox="0 0 200 60" xmlns="http://www.w3.org/2000/svg">
                  <line x1="10" y1="15" x2="190" y2="15" stroke="rgba(255,255,255,0.05)" strokeWidth="3" strokeLinecap="round" />
                  <line x1="10" y1="30" x2="190" y2="30" stroke="rgba(255,255,255,0.05)" strokeWidth="3" strokeLinecap="round" />
                  <line x1="10" y1="45" x2="190" y2="45" stroke="rgba(255,255,255,0.05)" strokeWidth="3" strokeLinecap="round" />

                  <circle cx="0" cy="15" r="2.5" fill="rgb(255, 159, 252)">
                    <animate attributeName="cx" values="10;190" dur="1.8s" repeatCount="indefinite" />
                  </circle>
                  <circle cx="0" cy="30" r="2.5" fill="rgb(0, 210, 255)">
                    <animate attributeName="cx" values="10;190" dur="1.2s" repeatCount="indefinite" />
                  </circle>
                  <circle cx="0" cy="45" r="2.5" fill="rgb(168, 85, 247)">
                    <animate attributeName="cx" values="10;190" dur="2s" repeatCount="indefinite" />
                  </circle>
                </svg>
              </div>
            </div>
          </TiltCard>
        </div>
      </div>
    </section>
  );
}
