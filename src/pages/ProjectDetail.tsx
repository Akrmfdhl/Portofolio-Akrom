import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PROJECTS, sanitizeExternalUrl } from '../data/portfolioJourney';
import { pickText, useI18n } from '../lib/i18n';

export default function ProjectDetail() {
  const { locale, setLocale, copy } = useI18n();
  const { slug } = useParams<{ slug: string }>();
  const project = PROJECTS.find((p) => p.slug === slug);

  useEffect(() => {
    if (project) {
      document.title = `${project.title} — Akrom Fadhil`;
    } else {
      document.title = `${copy.projectDetail.notFound} — Akrom Fadhil`;
    }
  }, [project, copy.projectDetail.notFound]);

  if (!project) {
    return (
      <section className="detail-shell min-h-screen flex flex-col justify-center items-center px-xl py-section">
        <div className="glass-modal p-lg text-center max-w-md w-full flex flex-col gap-md items-center">
          <h1 className="text-display-lg text-body-on-dark">{copy.projectDetail.notFound}</h1>
          <Link to="/" className="btn btn--amber">
            {copy.projectDetail.backHome}
          </Link>
        </div>
      </section>
    );
  }

  const safeGithubUrl = sanitizeExternalUrl(project.githubUrl);

  return (
    <article className="detail-shell min-h-screen relative">
      <header className="nav">
        <div className="nav__left">
          <Link to="/" className="nav__home">
            &larr; {copy.projectDetail.backPortfolio}
          </Link>
        </div>
        <div className="nav__links">
          <span className="nav__pill hidden sm:inline-flex">{project.title}</span>
          <div className="lang-switch" role="group" aria-label="Language">
            <button
              type="button"
              className={`lang-switch__btn ${locale === 'id' ? 'lang-switch__btn--active' : ''}`}
              onClick={() => setLocale('id')}
            >
              ID
            </button>
            <button
              type="button"
              className={`lang-switch__btn ${locale === 'en' ? 'lang-switch__btn--active' : ''}`}
              onClick={() => setLocale('en')}
            >
              EN
            </button>
          </div>
        </div>
      </header>

      <div className="detail-body">
        <section className="detail-hero">
          <div className="max-w-content-hero mx-auto flex flex-col items-center gap-lg">
            <h1 className="text-display-lg text-body-on-dark">{project.title}</h1>
            <p className="text-lead text-body-muted max-w-content-form leading-relaxed">
              {pickText(locale, project.summary)}
            </p>
            <div className="glass-panel mt-sm overflow-hidden max-w-content-text w-full">
              <img
                src={project.screenshotUrl}
                alt={project.title}
                loading="lazy"
                className="w-full h-auto object-cover"
              />
            </div>
          </div>
        </section>

        <section className="detail-section">
          <div className="max-w-content-text mx-auto grid grid-cols-1 md:grid-cols-3 gap-lg text-left">
            <div className="glass-subcard">
              <h2 className="detail-label">{copy.projectDetail.role}</h2>
              <p className="text-body-strong text-body-on-dark">{pickText(locale, project.role)}</p>
            </div>
            <div className="glass-subcard md:col-span-2">
              <h2 className="detail-label">{copy.projectDetail.scopeImpact}</h2>
              <p className="text-body text-ink-muted-80 leading-relaxed">
                {pickText(locale, project.subtitle)} — {pickText(locale, project.metric)}
              </p>
            </div>
          </div>
        </section>

        <section className="detail-section">
          <div className="max-w-content-text mx-auto grid grid-cols-1 md:grid-cols-2 gap-lg text-left">
            <div className="glass-subcard">
              <h2 className="detail-label">{copy.projectDetail.problem}</h2>
              <p className="text-body text-ink-muted-80 leading-relaxed">
                {pickText(locale, project.problem)}
              </p>
            </div>
            <div className="glass-subcard">
              <h2 className="detail-label">{copy.projectDetail.approach}</h2>
              <p className="text-body text-ink-muted-80 leading-relaxed">
                {pickText(locale, project.approach)}
              </p>
            </div>
          </div>
        </section>

        <section className="detail-section">
          <div className="max-w-content-text mx-auto glass-subcard flex flex-col gap-md text-left">
            <h2 className="detail-label">{copy.projectDetail.technologies}</h2>
            <div className="flex flex-wrap gap-xs">
              {project.technologies.map((tech) => (
                <span key={tech} className="glass-chip select-none">
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section className="detail-section">
          <div className="max-w-content-text mx-auto glass-panel p-lg flex flex-col gap-md items-center text-center">
            <h2 className="text-display-md text-body-on-dark">{copy.projectDetail.outcome}</h2>
            <p className="text-body text-ink-muted-80 max-w-content-form leading-relaxed">
              {pickText(locale, project.outcome)}
            </p>
            <div className="mt-sm">
              {safeGithubUrl ? (
                <a
                  href={safeGithubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn--amber"
                >
                  {copy.projectDetail.viewGithub}
                </a>
              ) : (
                <span className="glass-chip select-none">
                  {copy.projectDetail.privateWork}
                </span>
              )}
            </div>
          </div>
        </section>
      </div>
    </article>
  );
}
