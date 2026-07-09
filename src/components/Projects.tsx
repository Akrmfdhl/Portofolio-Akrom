import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { projects } from '../data/projects';

export default function Projects() {
  return (
    <section
      id="projects"
      className="bg-canvas text-ink px-xl py-section"
    >
      <div className="max-w-content-max mx-auto flex flex-col gap-xl">
        <div className="flex flex-col gap-xs">
          <h2 className="text-display-lg text-ink">Projects</h2>
          <p className="text-body text-ink-muted-80">A curated look at visual work and system contributions.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
          {projects.map((project) => (
            <motion.div
              key={project.slug}
              whileHover={
                window.matchMedia('(prefers-reduced-motion: reduce)').matches
                  ? {}
                  : { y: -4, opacity: 0.95 }
              }
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="bg-canvas border border-hairline rounded-lg p-lg flex flex-col gap-md select-none"
            >
              <div className="overflow-hidden rounded-sm bg-canvas-parchment">
                <img
                  src={project.screenshotUrl}
                  alt={project.name}
                  className="w-full h-auto object-cover rounded-sm shadow-product"
                />
              </div>
              <div className="flex flex-col gap-xxs mt-xs">
                <h3 className="text-body-strong text-ink">{project.name}</h3>
                <p className="text-body text-ink-muted-48">{project.copyFraming}</p>
              </div>
              <div className="mt-auto pt-sm flex justify-between items-center">
                <Link
                  to={`/projects/${project.slug}`}
                  className="text-link hover:underline font-semibold font-apple-text"
                >
                  Case Study &rarr;
                </Link>
                {project.isPrivate ? (
                  <span className="text-caption text-ink-muted-48 bg-canvas-parchment border border-hairline rounded-pill px-xs py-xxs font-apple-text">
                    Private repository
                  </span>
                ) : (
                  <span className="text-caption text-primary bg-canvas border border-primary rounded-pill px-xs py-xxs font-apple-text">
                    Public
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
