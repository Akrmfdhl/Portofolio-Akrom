import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';

interface NavProps {
  onOpenResume: () => void;
}

export default function Nav({ onOpenResume }: NavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);

      const about = document.getElementById('about');
      const projects = document.getElementById('projects');
      const faq = document.getElementById('faq');
      const contact = document.getElementById('contact');

      const scrollPos = window.scrollY + window.innerHeight / 3;

      let currentSec = '';
      if (contact && scrollPos >= contact.offsetTop) {
        currentSec = 'contact';
      } else if (faq && scrollPos >= faq.offsetTop) {
        currentSec = 'faq';
      } else if (projects && scrollPos >= projects.offsetTop) {
        currentSec = 'projects';
      } else if (about && scrollPos >= about.offsetTop) {
        currentSec = 'about';
      }

      setActiveSection(currentSec);

      if (currentSec) {
        window.history.replaceState(null, '', `/#${currentSec}`);
      } else {
        window.history.replaceState(null, '', window.location.pathname);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => setIsOpen(!isOpen);

  const menuVariants = {
    closed: { opacity: 0, height: 0, transition: { duration: 0.25 } },
    open: { opacity: 1, height: 'auto', transition: { duration: 0.3, ease: 'easeOut' as const } },
  };

  const navLinks = [
    { id: 'about', label: 'About' },
    { id: 'projects', label: 'Projects' },
    { id: 'faq', label: 'FAQ' },
    { id: 'contact', label: 'Contact' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex justify-center pointer-events-none">
      <motion.nav
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className={`pointer-events-auto mt-sm mx-lg rounded-pill border transition-all duration-300 ${
          scrolled
            ? 'bg-surface-black/70 backdrop-blur-xl border-hairline/15 shadow-product'
            : 'bg-surface-black/40 backdrop-blur-md border-hairline/10'
        }`}
      >
        <div className="h-nav flex items-center justify-between px-lg text-nav-link gap-xl">
          <Link
            to="/"
            onClick={() => setIsOpen(false)}
            className="font-semibold text-body-on-dark hover:opacity-80 transition-opacity whitespace-nowrap"
          >
            AKROM
          </Link>

          <div className="hidden nav-collapse:flex items-center gap-md">
            {navLinks.map((item) => (
              <Link
                key={item.id}
                to={`/#${item.id}`}
                className={`relative px-sm py-xxs transition-colors text-caption font-medium rounded-pill ${
                  activeSection === item.id ? 'text-on-primary' : 'text-on-dark/80 hover:text-on-dark'
                }`}
              >
                {activeSection === item.id && (
                  <motion.div
                    layoutId="navActiveBg"
                    className="absolute inset-0 bg-primary rounded-pill -z-10"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                {item.label}
              </Link>
            ))}
            <div className="w-px h-4 bg-on-dark/20 ml-xs" />
            
            {/* Connect Dropdown Menu */}
            <div
              className="relative"
              onMouseEnter={() => setIsDropdownOpen(true)}
              onMouseLeave={() => setIsDropdownOpen(false)}
            >
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="bg-on-dark/10 text-body-on-dark border border-hairline/10 hover:border-primary/30 rounded-pill px-sm py-xxs text-caption font-semibold flex items-center gap-xs hover:bg-on-dark/20 active:scale-95 transition-all cursor-pointer select-none"
              >
                Connect
                <svg className={`w-3 h-3 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </button>

              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-xs w-44 bg-surface-tile-2/95 backdrop-blur-xl border border-hairline/15 rounded-md p-xs shadow-product flex flex-col z-50 text-left select-none"
                  >
                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        onOpenResume();
                      }}
                      className="px-sm py-xs text-caption text-body-on-dark hover:text-primary hover:bg-surface-tile-1/50 rounded transition-colors text-left font-medium cursor-pointer"
                    >
                      Digital Resume
                    </button>
                    <a
                      href="https://github.com/Akrmfdhl"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setIsDropdownOpen(false)}
                      className="px-sm py-xs text-caption text-body-on-dark hover:text-primary hover:bg-surface-tile-1/50 rounded transition-colors block text-left font-medium"
                    >
                      GitHub Profile
                    </a>
                    <a
                      href="https://linkedin.com/in/akrom"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setIsDropdownOpen(false)}
                      className="px-sm py-xs text-caption text-body-on-dark hover:text-primary hover:bg-surface-tile-1/50 rounded transition-colors block text-left font-medium"
                    >
                      LinkedIn Profile
                    </a>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <button
            onClick={toggleMenu}
            className="flex nav-collapse:hidden flex-col gap-1 justify-center items-center w-10 h-10 hover:opacity-80 active:scale-95 transition-all focus:outline-none rounded-full"
            aria-label="Toggle navigation menu"
          >
            <span
              className={`w-4 h-0.5 bg-body-on-dark rounded-full transition-all duration-300 ${
                isOpen ? 'rotate-45 translate-y-1.5' : ''
              }`}
            />
            <span
              className={`w-4 h-0.5 bg-body-on-dark rounded-full transition-all duration-300 ${
                isOpen ? 'opacity-0' : ''
              }`}
            />
            <span
              className={`w-4 h-0.5 bg-body-on-dark rounded-full transition-all duration-300 ${
                isOpen ? '-rotate-45 -translate-y-1.5' : ''
              }`}
            />
          </button>
        </div>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial="closed"
              animate="open"
              exit="closed"
              variants={menuVariants}
              className="border-t border-on-dark/10 flex flex-col items-start gap-sm px-lg pb-lg pt-sm nav-collapse:hidden overflow-hidden"
            >
              {navLinks.map((item) => (
                <Link
                  key={item.id}
                  to={`/#${item.id}`}
                  onClick={() => setIsOpen(false)}
                  className={`w-full text-left py-xxs transition-colors text-caption ${
                    activeSection === item.id ? 'text-primary-on-dark font-semibold' : 'text-on-dark/80 hover:text-on-dark'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              <div className="flex w-full justify-between items-center mt-xs pt-xs border-t border-on-dark/10">
                <button
                  onClick={() => {
                    setIsOpen(false);
                    onOpenResume();
                  }}
                  className="bg-on-dark/10 text-body-on-dark border border-hairline/10 rounded-pill px-sm py-xxs text-caption font-semibold hover:bg-on-dark/20 active:scale-95 transition-all cursor-pointer"
                >
                  Resume
                </button>
                <div className="flex gap-md">
                  <a
                    href="https://github.com/Akrmfdhl"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setIsOpen(false)}
                    className="text-on-dark/60 hover:text-on-dark transition-colors text-caption"
                  >
                    GitHub
                  </a>
                  <a
                    href="https://linkedin.com/in/akrom"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setIsOpen(false)}
                    className="text-on-dark/60 hover:text-on-dark transition-colors text-caption"
                  >
                    LinkedIn
                  </a>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </header>
  );
}
