# Phase 3: Project Detail Template Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a dynamic project detail route (`/projects/:slug`) presenting structured case studies with alternating light/dark Apple-style tiles, conditional repository link structures, and custom deep-dive panels for the TISS project.

**Architecture:** A React routing page component rendering modular structured sections with layout colors dynamically alternating between dark tiles and parchment backgrounds. Custom project metrics and technical deep-dives render conditionally based on the slug.

**Tech Stack:** React 18, React Router v6, Tailwind CSS v4, Framer Motion v12.

## Global Constraints

- No background gradients.
- Exactly one drop-shadow (`rgba(0,0,0,0.22) 3px 5px 30px` mapped as `--shadow-product`) reserved for project screenshots.
- Zero TypeScript errors and ESLint warnings.
- Visible keyboard focus states on all interactive elements using `outline: 2px solid var(--color-primary-focus)`.
- No comments in code.
- No console.log or dead code.

---

### Task 13: Implement Project Detail Page Layout & Navigation

**Files:**
- Create: `src/pages/ProjectDetail.tsx`
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes: `projects` array from `src/data/projects.ts`
- Produces: Dynamic route handler for `/projects/:slug` rendering alternating layout tiles and back-navigation links

- [ ] **Step 1: Create ProjectDetail.tsx template**
  Create: `src/pages/ProjectDetail.tsx`
  Content:
  ```tsx
  import { useParams, Link } from 'react-router-dom';
  import { motion } from 'motion/react';
  import { projects } from '../data/projects';

  export default function ProjectDetail() {
    const { slug } = useParams<{ slug: string }>();
    const project = projects.find((p) => p.slug === slug);

    if (!project) {
      return (
        <section className="bg-canvas text-ink px-xl py-section min-h-screen flex flex-col justify-center items-center font-apple-text">
          <h1 className="text-display-lg mb-md">Project Not Found</h1>
          <Link to="/" className="text-link hover:underline font-semibold">
            &larr; Back to Home
          </Link>
        </section>
      );
    }

    return (
      <article className="min-h-screen bg-canvas font-apple-text">
        <header className="fixed top-[44px] left-0 right-0 z-40 bg-canvas-parchment/80 backdrop-blur-md border-b border-hairline h-[52px] flex items-center px-xl justify-between">
          <Link to="/" className="text-link hover:underline font-semibold flex items-center gap-xxs">
            &larr; Projects
          </Link>
          <span className="text-caption-strong text-ink">{project.name}</span>
        </header>

        <div className="pt-[52px]">
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
                <h2 className="text-caption-strong text-ink-muted-48 uppercase tracking-wider mb-xs">Contribution</h2>
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
  ```

- [ ] **Step 2: Update route mapping in App.tsx**
  Modify: `src/App.tsx`
  Content:
  ```tsx
  import { useEffect } from 'react';
  import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
  import { initLenis } from './utils/lenis';
  import Nav from './components/Nav';
  import Footer from './components/Footer';
  import Landing from './pages/Landing';
  import ProjectDetail from './pages/ProjectDetail';

  function App() {
    useEffect(() => {
      initLenis();
    }, []);

    return (
      <Router>
        <div className="flex flex-col min-h-screen bg-canvas text-ink selection:bg-primary selection:text-on-primary">
          <Nav />
          <main className="flex-grow pt-nav">
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/projects/:slug" element={<ProjectDetail />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    );
  }
  ```

- [ ] **Step 3: Git commit navigation mapping**
  Run: `git add src/pages/ProjectDetail.tsx src/App.tsx && git commit -m "feat: implement dynamic project detail template with alternating sections"`
  Expected: Route renders correctly and files commit without issues.

---

### Task 14: Verify Phase 3 Integration & Scroll Sync

**Files:**
- Modify: `package.json`

**Interfaces:**
- Consumes: TypeScript compiler, validation scripts
- Produces: Verified build pipeline compile and code validation checks

- [ ] **Step 1: Run automated verification checks**
  Run: `npm run verify`
  Expected: Verification passes with zero type errors, zero warnings, and zero token check violations.

- [ ] **Step 2: Verify production build output**
  Run: `npm run build`
  Expected: Bundles static frontend assets without errors.
