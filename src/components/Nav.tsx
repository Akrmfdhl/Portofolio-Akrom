import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';

export default function Nav() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  const menuVariants = {
    closed: { opacity: 0, height: 0 },
    open: { opacity: 1, height: 'auto', transition: { duration: 0.3, ease: 'easeOut' as const } }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <nav className="h-nav bg-surface-black text-on-dark flex items-center justify-between px-lg text-nav-link relative z-50">
        <div className="flex items-center gap-xl">
          <Link
            to="/"
            onClick={() => setIsOpen(false)}
            className="font-semibold text-body-on-dark hover:opacity-80 transition-opacity"
          >
            AKROM
          </Link>
          <div className="hidden nav-collapse:flex items-center gap-xl">
            <a
              href="/#about"
              className="hover:opacity-80 transition-opacity"
            >
              About
            </a>
            <a
              href="/#projects"
              className="hover:opacity-80 transition-opacity"
            >
              Projects
            </a>
            <a
              href="/#contact"
              className="hover:opacity-80 transition-opacity"
            >
              Contact
            </a>
          </div>
        </div>
        <div className="hidden nav-collapse:flex items-center gap-lg">
          <a
            href="/resume.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-ink hover:opacity-80 rounded-sm px-xs py-xxs text-button-utility transition-all active:scale-95"
          >
            Resume
          </a>
          <a
            href="https://github.com/Akrmfdhl"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:opacity-80 transition-opacity"
          >
            GitHub
          </a>
          <a
            href="https://linkedin.com/in/akrom"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:opacity-80 transition-opacity"
          >
            LinkedIn
          </a>
        </div>
        <button
          onClick={toggleMenu}
          className="flex nav-collapse:hidden flex-col gap-1 justify-center items-center w-11 h-11 hover:opacity-80 active:scale-95 transition-all focus:outline-none"
          aria-label="Toggle navigation menu"
        >
          <span
            className={`w-4.5 h-0.5 bg-body-on-dark transition-all duration-300 ${
              isOpen ? 'rotate-45 translate-y-1.5' : ''
            }`}
          />
          <span
            className={`w-4.5 h-0.5 bg-body-on-dark transition-all duration-300 ${
              isOpen ? 'opacity-0' : ''
            }`}
          />
          <span
            className={`w-4.5 h-0.5 bg-body-on-dark transition-all duration-300 ${
              isOpen ? '-rotate-45 -translate-y-1.5' : ''
            }`}
          />
        </button>
      </nav>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={menuVariants}
            className="absolute top-nav left-0 right-0 bg-surface-black text-on-dark flex flex-col items-start gap-md p-lg border-t border-hairline/10 nav-collapse:hidden overflow-hidden"
          >
            <a
              href="/#about"
              onClick={() => setIsOpen(false)}
              className="w-full text-left py-xs hover:opacity-80 transition-opacity border-b border-hairline/5"
            >
              About
            </a>
            <a
              href="/#projects"
              onClick={() => setIsOpen(false)}
              className="w-full text-left py-xs hover:opacity-80 transition-opacity border-b border-hairline/5"
            >
              Projects
            </a>
            <a
              href="/#contact"
              onClick={() => setIsOpen(false)}
              className="w-full text-left py-xs hover:opacity-80 transition-opacity border-b border-hairline/5"
            >
              Contact
            </a>
            <div className="flex w-full justify-between items-center mt-sm">
              <a
                href="/resume.pdf"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsOpen(false)}
                className="bg-ink hover:opacity-80 rounded-sm px-xs py-xxs text-button-utility transition-all active:scale-95"
              >
                Resume
              </a>
              <div className="flex gap-lg">
                <a
                  href="https://github.com/Akrmfdhl"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setIsOpen(false)}
                  className="hover:opacity-80 transition-opacity"
                >
                  GitHub
                </a>
                <a
                  href="https://linkedin.com/in/akrom"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setIsOpen(false)}
                  className="hover:opacity-80 transition-opacity"
                >
                  LinkedIn
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
