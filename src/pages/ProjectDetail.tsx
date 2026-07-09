import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { projects } from '../data/projects';

export default function ProjectDetail() {
  const { slug } = useParams<{ slug: string }>();
  const project = projects.find((p) => p.slug === slug);

  useEffect(() => {
    if (project) {
      document.title = `${project.name} | Akrom Fadhil M.`;
    } else {
      document.title = 'Project Not Found | Akrom Fadhil M.';
    }
  }, [project]);

  if (!project) {
    return (
      <section className="bg-surface-tile-1 text-body-on-dark px-xl py-section min-h-screen flex flex-col justify-center items-center font-apple-text relative">
        <div className="grid-overlay" />
        <h1 className="text-display-lg mb-md relative z-10">Project Not Found</h1>
        <Link
          to="/#projects"
          className="text-primary hover:underline font-semibold relative z-10"
        >
          &larr; Back to Home
        </Link>
      </section>
    );
  }

  return (
    <article className="min-h-screen bg-surface-tile-1 font-apple-text relative">
      <div className="grid-overlay" />

      {/* Header bar */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-surface-tile-2/80 backdrop-blur-md border-b border-hairline/10 h-16 flex items-center px-lg justify-between">
        <Link
          to="/#projects"
          className="text-primary hover:underline font-semibold flex items-center gap-xs text-caption select-none"
        >
          &larr; Back to Projects
        </Link>
        <span className="text-caption font-bold tracking-wide uppercase select-none text-body-on-dark">{project.name}</span>
        <div className="w-20" /> {/* Spacer to center name */}
      </header>

      <div className="pt-16">
        {/* Hero Section */}
        <section className="bg-surface-tile-1 text-on-dark px-lg py-section min-h-[50vh] flex flex-col justify-center items-center text-center relative overflow-hidden">
          <div className="max-w-content-hero mx-auto flex flex-col items-center gap-lg relative z-10">
            <h1 className="text-display-lg text-body-on-dark">{project.name}</h1>
            <p className="text-lead text-body-muted max-w-content-form leading-relaxed">{project.description}</p>
            <div className="mt-lg rounded-lg overflow-hidden bg-surface-tile-2 border border-hairline/15 max-w-content-text shadow-product">
              <img
                src={project.screenshotUrl}
                alt={project.name}
                className="w-full h-auto object-cover rounded-lg shadow-product"
              />
            </div>
          </div>
        </section>

        {/* Info Section */}
        <section className="bg-surface-tile-2 text-on-dark px-lg py-section border-t border-hairline/10">
          <div className="max-w-content-text mx-auto grid grid-cols-1 md:grid-cols-3 gap-xl text-left">
            <div>
              <h2 className="text-caption font-semibold text-primary uppercase tracking-wider mb-xs select-none">Role</h2>
              <p className="text-body-strong text-body-on-dark">{project.role}</p>
            </div>
            <div className="md:col-span-2">
              <h2 className="text-caption font-semibold text-primary uppercase tracking-wider mb-xs select-none">
                Contribution
              </h2>
              <p className="text-body text-body-muted leading-relaxed">{project.copyFraming}</p>
            </div>
          </div>
        </section>

        {/* Narrative Section */}
        <section className="bg-surface-tile-1 text-on-dark px-lg py-section border-t border-hairline/10">
          <div className="max-w-content-text mx-auto grid grid-cols-1 md:grid-cols-2 gap-xl text-left">
            <div>
              <h2 className="text-caption-strong text-body-on-dark mb-xs">Problem</h2>
              <p className="text-body text-body-muted leading-relaxed">{project.problem}</p>
            </div>
            <div>
              <h2 className="text-caption-strong text-body-on-dark mb-xs">Approach</h2>
              <p className="text-body text-body-muted leading-relaxed">{project.approach}</p>
            </div>
          </div>
        </section>

        {/* Custom details for TISS */}
        {project.slug === 'tiss' && (
          <section className="bg-surface-tile-2 text-on-dark px-lg py-section border-t border-hairline/10">
            <div className="max-w-content-text mx-auto flex flex-col gap-lg text-left">
              <h2 className="text-display-md text-body-on-dark">Architectural Decisions & Ownership</h2>
              <p className="text-body text-body-muted leading-relaxed">
                Responsible for the design and implementation of the high-performance node replication channels. Developed a microservice handling Postgres read-replica query routing alongside a distributed GORM event listener that tracks records sync state and schedules lock reconciliation workers inside Postgres.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-lg mt-md">
                <div className="border border-hairline/10 rounded-lg p-lg bg-surface-tile-1/50 backdrop-blur-sm">
                  <h3 className="text-body-strong text-body-on-dark mb-xxs">Monorepo Backend Architecture</h3>
                  <p className="text-caption text-body-muted leading-relaxed">
                    Engineered dynamic query partition routers inside Gin backend modules, scaling transactions to 10k/sec while avoiding deadlocks.
                  </p>
                </div>
                <div className="border border-hairline/10 rounded-lg p-lg bg-surface-tile-1/50 backdrop-blur-sm">
                  <h3 className="text-body-strong text-body-on-dark mb-xxs">Technical Lead & Execution</h3>
                  <p className="text-caption text-body-muted leading-relaxed">
                    Owned over 65% of the monorepo codebase across Go services and React client components, routing distributed transaction logs in under 100ms.
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Tech Stack List */}
        <section className="bg-surface-tile-2 text-on-dark px-lg py-section border-t border-hairline/10">
          <div className="max-w-content-text mx-auto flex flex-col gap-lg text-left">
            <h2 className="text-caption font-semibold text-primary uppercase tracking-wider select-none">Tech Stack</h2>
            <div className="flex flex-wrap gap-xs">
              {project.stack.map((tech) => (
                <span
                  key={tech}
                  className="bg-surface-tile-1 text-body-muted text-caption border border-hairline/10 rounded-pill px-xs py-xxs font-apple-text select-none"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Outcome and CTA */}
        <section className="bg-surface-tile-1 text-on-dark px-lg py-section border-t border-hairline/10">
          <div className="max-w-content-text mx-auto flex flex-col gap-lg items-center text-center">
            <h2 className="text-display-md text-body-on-dark">Project Outcome</h2>
            <p className="text-body text-body-muted max-w-content-form leading-relaxed">{project.outcome}</p>
            <div className="mt-lg">
              {project.isPrivate ? (
                <span className="text-fine-print text-body-muted bg-surface-tile-2 border border-hairline/10 rounded-pill px-lg py-sm font-semibold select-none">
                  Private repository
                </span>
              ) : (
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-primary text-on-primary text-button-large rounded-pill px-btn-large-x py-btn-large-y font-apple-text hover:opacity-90 active:scale-95 transition-all inline-block font-semibold"
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
