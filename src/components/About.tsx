import { motion } from 'motion/react';

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
      className="bg-canvas-parchment text-ink px-xl py-section"
    >
      <div className="max-w-content-text mx-auto flex flex-col gap-xl">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={containerVariants}
          className="flex flex-col gap-lg"
        >
          <motion.h2
            variants={itemVariants}
            className="text-display-lg"
          >
            About
          </motion.h2>
          <motion.p
            variants={itemVariants}
            className="text-lead-airy text-ink leading-relaxed"
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
            className="text-caption-strong text-ink"
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
                className="bg-canvas text-ink text-caption border border-hairline rounded-pill px-chip-x py-sm font-apple-text select-none"
              >
                {skill}
              </span>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
