import { Link } from 'react-router-dom';

interface FooterProps {
  onOpenResume?: () => void;
}

export default function Footer({ onOpenResume }: FooterProps) {
  return (
    <footer className="bg-surface-black text-body-muted px-lg py-xl border-t border-hairline/10 font-apple-text select-none relative z-10 w-full">
      <div className="max-w-content-max mx-auto flex flex-col gap-xl">
        
        {/* Top Banner: Subscribe Bar */}
        <div className="border-b border-hairline/10 pb-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-md w-full">
          <p className="text-caption text-body-muted leading-relaxed">
            Subscribe to stay tuned for new web design and latest updates. Let's do it!
          </p>
          <div className="flex items-center gap-sm shrink-0">
            <span className="text-caption font-bold text-body-on-dark whitespace-nowrap">Let's do it —</span>
            <form
              onSubmit={(e) => e.preventDefault()}
              className="flex items-center bg-surface-tile-2/50 border border-hairline/10 rounded-pill overflow-hidden"
            >
              <input
                type="email"
                placeholder="Enter your email Address"
                className="bg-transparent text-body-on-dark text-caption focus:outline-none px-sm py-xs w-52 placeholder:text-body-muted/50"
              />
              <button
                type="submit"
                className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center hover:opacity-90 active:scale-95 transition-all select-none cursor-pointer mr-xxs shrink-0"
                aria-label="Submit subscription"
              >
                <svg className="w-3.5 h-3.5 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </button>
            </form>
          </div>
        </div>

        {/* Middle Section: Columns Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-xl text-left pt-md pb-lg">
          {/* About Summary */}
          <div className="flex flex-col gap-sm">
            <div className="flex flex-col gap-none">
              <span className="text-body-strong font-extrabold text-body-on-dark tracking-tight uppercase">Akrom Fadhil M.</span>
              <span className="text-caption text-primary font-bold uppercase tracking-wider mt-xxs">Software Engineer</span>
            </div>
            <p className="text-caption text-body-muted leading-relaxed">
              High level experience in web development and software engineering knowledge, producing quality work.
            </p>
            <div>
              <a
                href="#contact"
                className="bg-surface-tile-2 border border-hairline/10 hover:border-primary/20 text-body-on-dark text-caption font-semibold rounded-pill px-sm py-xxs inline-block transition-colors select-none"
              >
                Get started
              </a>
            </div>
          </div>

          {/* Sitemap */}
          <div className="flex flex-col gap-sm">
            <h4 className="text-caption font-bold text-body-on-dark uppercase tracking-wider select-none">Sitemap</h4>
            <div className="flex flex-col gap-xxs">
              <Link to="/#about" className="text-caption text-body-muted hover:text-primary transition-colors">About</Link>
              <Link to="/#projects" className="text-caption text-body-muted hover:text-primary transition-colors">Projects</Link>
              <Link to="/#faq" className="text-caption text-body-muted hover:text-primary transition-colors">FAQ</Link>
              <Link to="/#contact" className="text-caption text-body-muted hover:text-primary transition-colors">Contact</Link>
            </div>
          </div>

          {/* Resources */}
          <div className="flex flex-col gap-sm">
            <h4 className="text-caption font-bold text-body-on-dark uppercase tracking-wider select-none">Resources</h4>
            <div className="flex flex-col gap-xxs">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  if (onOpenResume) onOpenResume();
                }}
                className="text-caption text-body-muted hover:text-primary transition-colors text-left cursor-pointer"
              >
                Digital CV / Resume
              </button>
              <a href="https://github.com/Akrmfdhl" target="_blank" rel="noopener noreferrer" className="text-caption text-body-muted hover:text-primary transition-colors">GitHub Profile</a>
              <a href="https://linkedin.com/in/akrom" target="_blank" rel="noopener noreferrer" className="text-caption text-body-muted hover:text-primary transition-colors">LinkedIn Profile</a>
            </div>
          </div>

          {/* Contact Details */}
          <div className="flex flex-col gap-sm">
            <h4 className="text-caption font-bold text-body-on-dark uppercase tracking-wider select-none">Contact Us</h4>
            <div className="flex flex-col gap-xs">
              {/* Location */}
              <div className="flex items-start gap-xs">
                <svg className="w-4 h-4 text-primary shrink-0 mt-xxs" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
                <span className="text-caption text-body-muted leading-relaxed">Rajeg, Kab. Tangerang, Banten 15540</span>
              </div>
              {/* Email */}
              <div className="flex items-start gap-xs">
                <svg className="w-4 h-4 text-primary shrink-0 mt-xxs" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
                <a href="mailto:akromfadhil234@gmail.com" className="text-caption text-body-muted hover:text-primary transition-colors">akromfadhil234@gmail.com</a>
              </div>
              {/* Phone */}
              <div className="flex items-start gap-xs">
                <svg className="w-4 h-4 text-primary shrink-0 mt-xxs" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-2.824-1.502-5.127-3.805-6.63-6.63l1.293-.97c.362-.271.528-.733.417-1.173L6.763 3.51a1.25 1.25 0 00-1.11-1.008H3.82a2.25 2.25 0 00-2.25 2.25v1.75z" />
                </svg>
                <a href="tel:085890191405" className="text-caption text-body-muted hover:text-primary transition-colors">0858-9019-1405</a>
              </div>
            </div>
          </div>
        </div>

        {/* Follow Us Pill Bar (References Combo) */}
        <div className="bg-surface-tile-2/40 border border-hairline/10 rounded-pill p-sm px-lg flex items-center justify-between gap-md w-full backdrop-blur-md">
          <span className="text-caption font-bold text-body-on-dark uppercase tracking-wider">Follow us</span>
          <div className="flex gap-md items-center">
            {/* GitHub */}
            <a 
              href="https://github.com/Akrmfdhl" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-body-muted hover:text-primary transition-colors hover:scale-110 active:scale-95"
              aria-label="GitHub profile link"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
              </svg>
            </a>
            {/* LinkedIn */}
            <a 
              href="https://linkedin.com/in/akrom" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-body-muted hover:text-primary transition-colors hover:scale-110 active:scale-95"
              aria-label="LinkedIn profile link"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            </a>
            {/* Email */}
            <a 
              href="mailto:akromfadhil234@gmail.com" 
              className="text-body-muted hover:text-primary transition-colors hover:scale-110 active:scale-95"
              aria-label="Send direct email"
            >
              <svg className="w-5 h-5 fill-none stroke-current" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
            </a>
          </div>
        </div>

        {/* Bottom copyright details without the "Built with React..." dummy text */}
        <div className="max-w-content-max mx-auto pt-md flex flex-col md:flex-row justify-between items-start md:items-center gap-sm w-full">
          <span className="text-fine-print text-body-muted/40">
            Copyright © 2026 Akrom Fadhil M. All rights reserved.
          </span>
          <div className="flex gap-md text-fine-print text-body-muted/40">
            <span className="hover:text-primary transition-colors cursor-default">Privacy Policy</span>
            <span>·</span>
            <span className="hover:text-primary transition-colors cursor-default">Terms of Use</span>
            <span>·</span>
            <span className="hover:text-primary transition-colors cursor-default">Site Map</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
