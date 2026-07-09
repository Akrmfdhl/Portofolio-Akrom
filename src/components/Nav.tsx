import { Link } from 'react-router-dom';

export default function Nav() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <nav className="h-nav bg-surface-black text-on-dark flex items-center justify-between px-lg text-nav-link">
        <div className="flex items-center gap-xl">
          <Link to="/" className="font-semibold text-body-on-dark hover:opacity-80 transition-opacity">
            AKROM
          </Link>
          <div className="hidden md:flex items-center gap-xl">
            <a href="/#about" className="hover:opacity-80 transition-opacity">About</a>
            <a href="/#projects" className="hover:opacity-80 transition-opacity">Projects</a>
            <a href="/#contact" className="hover:opacity-80 transition-opacity">Contact</a>
          </div>
        </div>
        <div className="flex items-center gap-lg">
          <a href="/resume.pdf" target="_blank" rel="noopener noreferrer" className="bg-ink hover:opacity-80 rounded-sm px-xs py-xxs text-button-utility transition-all active:scale-95">
            Resume
          </a>
          <a href="https://github.com/Akrmfdhl" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
            GitHub
          </a>
          <a href="https://linkedin.com/in/akrom" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
            LinkedIn
          </a>
        </div>
      </nav>
    </header>
  );
}
