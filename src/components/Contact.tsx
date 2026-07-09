import { useState } from 'react';
import type { FormEvent } from 'react';

export default function Contact() {
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
      className="bg-surface-tile-2 text-on-dark px-xl py-section"
    >
      <div className="max-w-content-form mx-auto flex flex-col gap-xl">
        <div className="flex flex-col gap-xs text-center">
          <h2 className="text-display-lg text-body-on-dark">Contact</h2>
          <p className="text-body text-body-muted">Get in touch for projects, collaborations, or inquiries.</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-md"
        >
          <div className="flex flex-col gap-xxs">
            <input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="bg-canvas text-ink text-body border border-hairline rounded-pill px-lg h-nav w-full focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-xxs">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-canvas text-ink text-body border border-hairline rounded-pill px-lg h-nav w-full focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-xxs">
            <textarea
              placeholder="Message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              rows={5}
              className="bg-canvas text-ink text-body border border-hairline rounded-lg p-lg w-full focus:outline-none resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={status === 'loading'}
            className="bg-primary text-on-primary text-button-large rounded-pill px-btn-large-x py-btn-large-y font-apple-text hover:opacity-90 active:scale-95 transition-all self-center disabled:opacity-50"
          >
            {status === 'loading' ? 'Sending...' : 'Send Message'}
          </button>

          {status === 'success' && (
            <p className="text-caption text-primary-on-dark text-center mt-sm">
              Message sent successfully.
            </p>
          )}

          {status === 'error' && (
            <p className="text-caption text-primary-on-dark text-center mt-sm">
              Failed to send message. Please try again.
            </p>
          )}
        </form>
      </div>
    </section>
  );
}
