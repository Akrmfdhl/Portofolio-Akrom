import { useParams, Link } from 'react-router-dom';
import { projects } from '../data/projects';

export default function ProjectDetail() {
  const { slug } = useParams<{ slug: string }>();
  const project = projects.find((p) => p.slug === slug);

  if (!project) {
    return (
      <section className="bg-canvas text-ink px-xl py-section min-h-screen flex flex-col justify-center items-center font-apple-text">
        <h1 className="text-display-lg mb-md">Project Not Found</h1>
        <Link
          to="/"
          className="text-link hover:underline font-semibold"
        >
          &larr; Back to Home
        </Link>
      </section>
    );
  }

  return (
    <article className="min-h-screen bg-canvas font-apple-text">
      <header className="fixed top-nav left-0 right-0 z-40 bg-canvas-parchment/80 backdrop-blur-md border-b border-hairline h-sub-nav flex items-center px-xl justify-between">
        <Link
          to="/"
          className="text-link hover:underline font-semibold flex items-center gap-xxs"
        >
          &larr; Projects
        </Link>
        <span className="text-caption-strong text-ink">{project.name}</span>
      </header>

      <div className="pt-sub-nav">
        <section className="bg-surface-tile-1 text-on-dark px-xl py-section min-h-[60vh] flex flex-col justify-center items-center text-center">
          <div className="max-w-content-hero mx-auto flex flex-col items-center gap-lg">
            <h1 className="text-display-lg text-body-on-dark">{project.name}</h1>
            <p className="text-lead text-body-muted max-w-content-form">{project.description}</p>
            <div className="mt-lg rounded-sm overflow-hidden bg-surface-tile-2 max-w-content-text">
              <img
                src={project.screenshotUrl}
                alt={project.name}
                className="w-full h-auto object-cover rounded-sm shadow-product"
              />
            </div>
          </div>
        </section>

        <section className="bg-canvas text-ink px-xl py-section">
          <div className="max-w-content-text mx-auto grid grid-cols-1 md:grid-cols-3 gap-xl">
            <div>
              <h2 className="text-caption-strong text-ink-muted-48 uppercase tracking-wider mb-xs">Role</h2>
              <p className="text-body-strong text-ink">{project.role}</p>
            </div>
            <div className="md:col-span-2">
              <h2 className="text-caption-strong text-ink-muted-48 uppercase tracking-wider mb-xs">
                Contribution
              </h2>
              <p className="text-body text-ink-muted-80 leading-relaxed">{project.copyFraming}</p>
            </div>
          </div>
        </section>

        <section className="bg-canvas-parchment text-ink px-xl py-section">
          <div className="max-w-content-text mx-auto grid grid-cols-1 md:grid-cols-2 gap-xl">
            <div>
              <h2 className="text-caption-strong text-ink mb-xs">Problem</h2>
              <p className="text-body text-ink-muted-80 leading-relaxed">{project.problem}</p>
            </div>
            <div>
              <h2 className="text-caption-strong text-ink mb-xs">Approach</h2>
              <p className="text-body text-ink-muted-80 leading-relaxed">{project.approach}</p>
            </div>
          </div>
        </section>

        {project.slug === 'tiss' && (
          <section className="bg-surface-tile-3 text-on-dark px-xl py-section">
            <div className="max-w-content-text mx-auto flex flex-col gap-lg">
              <h2 className="text-display-md text-body-on-dark">Architectural Decisions & Ownership</h2>
              <p className="text-body text-body-muted leading-relaxed">
                Responsible for the design and implementation of the high-performance node replication channels. Developed a microservice handling Postgres read-replica query routing alongside a distributed GORM event listener that tracks records sync state and schedules lock reconciliation workers inside Postgres.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-lg mt-md">
                <div className="border border-hairline/20 rounded-lg p-lg bg-surface-tile-1">
                  <h3 className="text-body-strong text-body-on-dark mb-xxs">Monorepo Backend Architecture</h3>
                  <p className="text-caption text-body-muted">
                    Engineered dynamic query partition routers inside Gin backend modules, scaling transactions to 10k/sec while avoiding deadlocks.
                  </p>
                </div>
                <div className="border border-hairline/20 rounded-lg p-lg bg-surface-tile-1">
                  <h3 className="text-body-strong text-body-on-dark mb-xxs">Technical Lead & Execution</h3>
                  <p className="text-caption text-body-muted">
                    Owned over 65% of the monorepo codebase across Go services and React client components, routing distributed transaction logs in under 100ms.
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

        <section className="bg-surface-tile-2 text-on-dark px-xl py-section">
          <div className="max-w-content-text mx-auto flex flex-col gap-lg">
            <h2 className="text-caption-strong text-body-muted uppercase tracking-wider">Tech Stack</h2>
            <div className="flex flex-wrap gap-xs">
              {project.stack.map((tech) => (
                <span
                  key={tech}
                  className="bg-surface-tile-1 text-body-on-dark text-caption border border-hairline/20 rounded-pill px-chip-x py-sm select-none"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-canvas text-ink px-xl py-section">
          <div className="max-w-content-text mx-auto flex flex-col gap-lg items-center text-center">
            <h2 className="text-display-md text-ink">Project Outcome</h2>
            <p className="text-body text-ink-muted-80 max-w-content-form leading-relaxed">{project.outcome}</p>
            <div className="mt-lg">
              {project.isPrivate ? (
                <span className="text-body text-ink-muted-48 bg-canvas-parchment border border-hairline rounded-pill px-lg py-sm font-semibold select-none">
                  Private repository
                </span>
              ) : (
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-ink text-on-dark text-button-utility border border-hairline rounded-sm px-btn-large-x py-btn-large-y transition-all hover:opacity-90 active:scale-95 inline-block font-semibold"
                >
                  View on GitHub
                </a>
              )}
            </div>
          </div>
        </section>
      </div>
    </article>
  );
}
