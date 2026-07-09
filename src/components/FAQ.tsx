import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface FAQItemProps {
  question: string;
  answer: string;
}

function FAQItem({ question, answer }: FAQItemProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-hairline/10 bg-surface-tile-2/45 rounded-lg overflow-hidden transition-all duration-300 hover:border-primary/20">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center p-md text-left select-none cursor-pointer focus:outline-none"
      >
        <span className="text-body-strong font-semibold text-body-on-dark">{question}</span>
        <svg
          className={`w-4 h-4 text-primary transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
          >
            <div className="px-md pb-md text-caption text-body-muted leading-relaxed">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FAQ() {
  const faqs = [
    {
      question: 'What technology stacks do you specialize in?',
      answer: 'I specialize in building React, TypeScript, and Tailwind CSS interfaces on the frontend, combined with robust backend services in Go (Gin/GORM/Postgres) and Kotlin (Android/Jetpack Compose).',
    },
    {
      question: 'What are your current availability details?',
      answer: 'As a Computer Science student at Universitas Sultan Ageng Tirtayasa, I am actively looking for full-time software engineering roles, internship programs, and research collaborations.',
    },
    {
      question: 'Do you have experience working in team environments?',
      answer: 'Yes, I have completed two internship roles. At PT. INOVINDO Multimedia, I designed front-end mockups and structures, and at PT. Multi Nugraha Kencana, I learned team alignment, precision, and operational targets.',
    },
    {
      question: 'Are you open to remote or relocation opportunities?',
      answer: 'Yes, I am fully open to remote software developer positions, and open to relocation opportunities across Jakarta, Tangerang, and surrounding areas.',
    },
  ];

  return (
    <section
      id="faq"
      className="bg-surface-tile-1 text-on-dark px-xl py-section relative z-10 w-full border-t border-hairline/10"
    >
      <div className="max-w-content-max mx-auto flex flex-col gap-xl">
        {/* Title */}
        <div className="flex flex-col gap-xxs items-start text-left max-w-content-hero">
          <span className="text-caption text-primary font-semibold uppercase tracking-wider">Common Questions</span>
          <h2 className="text-display-lg text-body-on-dark mt-xxs">Frequently Asked Questions</h2>
        </div>

        {/* FAQs List */}
        <div className="flex flex-col gap-sm max-w-3xl w-full mx-auto mt-md">
          {faqs.map((faq, index) => (
            <FAQItem key={index} question={faq.question} answer={faq.answer} />
          ))}
        </div>
      </div>
    </section>
  );
}
