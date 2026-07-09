import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-canvas-parchment text-ink-muted-80 px-xl py-xxl border-t border-hairline font-apple-text">
      <div className="max-w-[1440px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-xl">
        <div>
          <h4 className="text-caption-strong text-ink mb-sm">Sitemap</h4>
          <ul className="flex flex-col">
            <li><Link to="/#about" className="text-dense-link hover:underline">About</Link></li>
            <li><Link to="/#projects" className="text-dense-link hover:underline">Projects</Link></li>
            <li><Link to="/#contact" className="text-dense-link hover:underline">Contact</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-caption-strong text-ink mb-sm">Connect</h4>
          <ul className="flex flex-col">
            <li><a href="https://github.com/Akrmfdhl" target="_blank" rel="noopener noreferrer" className="text-dense-link hover:underline">GitHub</a></li>
            <li><a href="https://linkedin.com/in/akrom" target="_blank" rel="noopener noreferrer" className="text-dense-link hover:underline">LinkedIn</a></li>
            <li><a href="mailto:akrom@example.com" className="text-dense-link hover:underline">Email</a></li>
          </ul>
        </div>
        <div className="lg:col-span-1 md:col-span-2">
          <h4 className="text-caption-strong text-ink mb-sm">Akrom</h4>
          <p className="text-caption text-ink-muted-48 leading-relaxed max-w-sm">
            Frontend & Fullstack Developer specializing in premium, photography-first, high-fidelity user interfaces.
          </p>
        </div>
      </div>
      <div className="max-w-[1440px] mx-auto mt-xl pt-lg border-t border-hairline flex flex-col md:flex-row justify-between items-start md:items-center gap-sm">
        <span className="text-fine-print text-ink-muted-48">
          Copyright © 2026 Akrom. All rights reserved.
        </span>
        <span className="text-fine-print text-ink-muted-48">
          Built with React 18, Tailwind CSS v4, Lenis, and GSAP.
        </span>
      </div>
    </footer>
  );
}
