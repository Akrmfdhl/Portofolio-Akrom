import { useState } from 'react';
import { motion } from 'motion/react';

export default function GooeyNav() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  const menuItems = [
    {
      label: (
        <svg className="w-5 h-5 stroke-current fill-none" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          <polyline points="9 22 9 12 15 12 15 22"></polyline>
        </svg>
      ),
      href: '/#',
      tooltip: 'Home'
    },
    {
      label: (
        <svg className="w-5 h-5 stroke-current fill-none" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </svg>
      ),
      href: '/#about',
      tooltip: 'About'
    },
    {
      label: (
        <svg className="w-5 h-5 stroke-current fill-none" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
          <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
        </svg>
      ),
      href: '/#projects',
      tooltip: 'Projects'
    },
    {
      label: (
        <svg className="w-5 h-5 stroke-current fill-none" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
          <polyline points="22,6 12,13 2,6"></polyline>
        </svg>
      ),
      href: '/#contact',
      tooltip: 'Contact'
    },
  ];

  return (
    <div className="fixed bottom-lg right-lg z-40 nav-collapse:hidden">
      <svg className="hidden">
        <defs>
          <filter id="goo">
            <feGaussianBlur
              in="SourceGraphic"
              stdDeviation="10"
              result="blur"
            />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -8"
              result="gooey"
              / >
            <feComposite
              in="SourceGraphic"
              in2="gooey"
              operator="atop"
            />
          </filter>
        </defs>
      </svg>

      <div
        style={{ filter: 'url(#goo)' }}
        className="relative flex items-center justify-center"
      >
        {menuItems.map((item, index) => {
          const angle = (index * Math.PI) / 2 + Math.PI;
          const radius = 70;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;

          return (
            <motion.a
              key={item.tooltip}
              href={item.href}
              initial={{ x: 0, y: 0, scale: 0.8 }}
              animate={isOpen ? { x, y, scale: 1 } : { x: 0, y: 0, scale: 0.8 }}
              transition={{ type: 'spring', damping: 15, stiffness: 120 }}
              className="absolute w-11 h-11 bg-primary text-on-primary rounded-full flex items-center justify-center border border-hairline/20 shadow-product pointer-events-auto"
            >
              {item.label}
            </motion.a>
          );
        })}

        <button
          onClick={toggleMenu}
          className="relative w-12 h-12 bg-primary text-on-primary rounded-full flex items-center justify-center border border-hairline/20 shadow-product z-10 focus:outline-none pointer-events-auto active:scale-95 transition-transform"
          aria-label="Toggle gooey menu"
        >
          <motion.div
            animate={{ rotate: isOpen ? 135 : 0 }}
            className="flex items-center justify-center"
          >
            <svg className="w-6 h-6 stroke-current fill-none" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </motion.div>
        </button>
      </div>
    </div>
  );
}
