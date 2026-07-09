import { useState } from 'react';
import type { FormEvent } from 'react';
import GlassIcons from './GlassIcons';

interface ContactProps {
  onOpenResume: () => void;
}

export default function Contact({ onOpenResume }: ContactProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) {
      return;
    }
    setStatus('loading');

    try {
      const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          service_id: 'default_service',
          template_id: 'template_portfolio',
          user_id: 'user_dummy_key',
          template_params: {
            from_name: name,
            reply_to: email,
            message: message,
          },
        }),
      });

      if (response.ok) {
        setStatus('success');
        setName('');
        setEmail('');
        setMessage('');
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  return (
    <section
      id="contact"
      className="bg-surface-tile-1 text-on-dark px-xl py-section relative z-10 w-full"
    >
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-72 h-72 rounded-full bg-primary/5 blur-3xl pointer-events-none" />

      <div className="max-w-content-max mx-auto flex flex-col gap-xl">
        {/* Section title */}
        <div className="flex flex-col gap-xxs items-start text-left max-w-content-hero">
          <span className="text-caption text-primary font-semibold uppercase tracking-wider">Get In Touch</span>
          <h2 className="text-display-lg text-body-on-dark mt-xxs">Let's build something exceptional</h2>
        </div>

        {/* Form and Info Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-xl items-start">
          
          {/* Left Column - Contact Details & Info */}
          <div className="lg:col-span-5 flex flex-col gap-lg text-left">
            <p className="text-lead text-body-muted leading-relaxed">
              Have a project in mind, a job opportunity, or just want to chat about software engineering? Feel free to reach out. I'll get back to you within 24 hours.
            </p>

            <div className="flex flex-col gap-md">
              {/* Contact Item Email */}
              <div className="flex items-center gap-md p-md bg-surface-tile-2/40 border border-hairline/5 rounded-lg select-none">
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-primary/10 border border-primary/20 text-primary">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="flex flex-col gap-none">
                  <span className="text-fine-print text-body-muted">EMAIL ME</span>
                  <a href="mailto:akromfadhil234@gmail.com" className="text-caption-strong text-body-on-dark hover:text-primary transition-colors">akromfadhil234@gmail.com</a>
                </div>
              </div>

              {/* Contact Item Phone */}
              <div className="flex items-center gap-md p-md bg-surface-tile-2/40 border border-hairline/5 rounded-lg select-none">
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-primary/10 border border-primary/20 text-primary">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div className="flex flex-col gap-none">
                  <span className="text-fine-print text-body-muted">CALL OR TEXT</span>
                  <a href="tel:085890191405" className="text-caption-strong text-body-on-dark hover:text-primary transition-colors">0858-9019-1405</a>
                </div>
              </div>

              {/* Contact Item Location */}
              <div className="flex items-center gap-md p-md bg-surface-tile-2/40 border border-hairline/5 rounded-lg select-none">
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-primary/10 border border-primary/20 text-primary">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div className="flex flex-col gap-none">
                  <span className="text-fine-print text-body-muted">LOCATION</span>
                  <span className="text-caption-strong text-body-on-dark">Rajeg, Kab. Tangerang, Indonesia</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Glassmorphic Contact Form */}
          <div className="lg:col-span-7 w-full bg-surface-tile-2/45 border border-hairline/10 rounded-lg p-lg shadow-product relative overflow-hidden">
            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-md relative z-10"
            >
              <div className="flex flex-col gap-xxs text-left">
                <label className="text-fine-print text-body-muted uppercase tracking-wider font-semibold">Your Name</label>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="bg-surface-tile-1 border border-hairline/10 rounded-md px-lg h-nav w-full focus:border-primary/50 focus:outline-none transition-all placeholder:text-body-muted/30 text-body-on-dark text-body mt-xxs"
                />
              </div>

              <div className="flex flex-col gap-xxs text-left">
                <label className="text-fine-print text-body-muted uppercase tracking-wider font-semibold">Your Email</label>
                <input
                  type="email"
                  placeholder="john@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-surface-tile-1 border border-hairline/10 rounded-md px-lg h-nav w-full focus:border-primary/50 focus:outline-none transition-all placeholder:text-body-muted/30 text-body-on-dark text-body mt-xxs"
                />
              </div>

              <div className="flex flex-col gap-xxs text-left">
                <label className="text-fine-print text-body-muted uppercase tracking-wider font-semibold">Your Message</label>
                <textarea
                  placeholder="Tell me about your project..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  rows={5}
                  className="bg-surface-tile-1 border border-hairline/10 rounded-md p-lg w-full focus:border-primary/50 focus:outline-none transition-all resize-none placeholder:text-body-muted/30 text-body-on-dark text-body mt-xxs"
                />
              </div>

              <button
                type="submit"
                disabled={status === 'loading'}
                className="bg-primary text-on-primary text-button-large rounded-pill px-btn-large-x py-btn-large-y font-apple-text hover:opacity-90 active:scale-95 transition-all self-start disabled:opacity-50 font-semibold mt-sm"
              >
                {status === 'loading' ? 'Sending...' : 'Send Message'}
              </button>

              {status === 'success' && (
                <p className="text-caption text-primary-on-dark text-left mt-xs">
                  Message sent successfully. I'll get back to you soon!
                </p>
              )}

              {status === 'error' && (
                <p className="text-caption text-primary-on-dark text-left mt-xs">
                  Failed to send message. Please try again.
                </p>
              )}
            </form>
          </div>

        </div>

        {/* Social Glass Icons Footer */}
        <div className="border-t border-hairline/10 pt-lg mt-md w-full">
          <GlassIcons onOpenResume={onOpenResume} />
        </div>
      </div>
    </section>
  );
}
