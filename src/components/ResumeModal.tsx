import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { EDUCATION, EXPERIENCES, PROFILE, SKILL_CLUSTERS } from '../data/portfolioJourney';

interface ResumeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ResumeModal({ isOpen, onClose }: ResumeModalProps) {
  const [activeTab, setActiveTab] = useState<'experience' | 'education' | 'skills'>('experience');

  const tabs = [
    { id: 'experience' as const, label: 'Experience' },
    { id: 'education' as const, label: 'Education' },
    { id: 'skills' as const, label: 'Technical Stack' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-md">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-surface-black/80 backdrop-blur-md cursor-pointer"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="relative bg-surface-tile-2/95 border border-hairline/20 rounded-lg max-w-2xl w-full h-[75vh] flex flex-col overflow-hidden shadow-product z-10"
          >
            <div className="flex items-center justify-between border-b border-hairline/15 px-lg py-md bg-surface-tile-2/60 select-none">
              <h3 className="text-body-strong font-extrabold text-body-on-dark tracking-wide">
                {PROFILE.fullName} — Curriculum Vitae
              </h3>
              <div className="flex items-center gap-sm">
                <a
                  href={PROFILE.avatarUrl}
                  download="Akrom_Fadhil_CV.jpeg"
                  className="text-fine-print text-primary bg-primary/10 border border-primary/25 hover:bg-primary/25 rounded-pill px-sm py-xs font-semibold transition-all flex items-center gap-xs cursor-pointer select-none"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                  </svg>
                  Download CV
                </a>
                <button
                  type="button"
                  onClick={onClose}
                  className="text-body-muted hover:text-body-on-dark transition-colors cursor-pointer"
                  aria-label="Close modal"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="flex border-b border-hairline/15 bg-surface-black/25 px-md py-xs gap-xxs select-none">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-sm py-xxs rounded-pill text-caption font-medium transition-all cursor-pointer relative ${
                    activeTab === tab.id ? 'text-on-primary' : 'text-body-muted hover:text-body-on-dark'
                  }`}
                >
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="modalTabActiveBg"
                      className="absolute inset-0 bg-primary rounded-pill -z-10"
                      transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                    />
                  )}
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex-1 p-lg overflow-y-auto text-left" data-lenis-prevent>
              {activeTab === 'experience' && (
                <div className="flex flex-col gap-md">
                  {EXPERIENCES.map((exp) => (
                    <div
                      key={exp.id}
                      className="border border-hairline/15 bg-surface-tile-1/50 p-md rounded-lg flex flex-col gap-xs"
                    >
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-xxs">
                        <div>
                          <h4 className="text-body-strong font-bold text-body-on-dark">{exp.role}</h4>
                          <span className="text-caption text-primary font-medium">
                            {exp.company} · {exp.location}
                          </span>
                        </div>
                        <span className="text-fine-print text-body-muted">
                          {exp.period}
                        </span>
                      </div>
                      <ul className="list-disc pl-sm flex flex-col gap-xxs text-caption text-body-muted leading-relaxed">
                        {exp.description.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'education' && (
                <div className="flex flex-col gap-md">
                  {EDUCATION.map((edu) => (
                    <div
                      key={edu.institution}
                      className="border border-hairline/15 bg-surface-tile-1/50 p-md rounded-lg flex justify-between items-center gap-sm"
                    >
                      <div className="flex flex-col gap-xxs">
                        <h4 className="text-body-strong font-bold text-body-on-dark">
                          {edu.institution}
                        </h4>
                        <span className="text-caption text-primary">{edu.degree}</span>
                        <span className="text-fine-print text-body-muted">{edu.highlight}</span>
                      </div>
                      <span className="text-fine-print text-body-muted shrink-0">
                        {edu.period}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'skills' && (
                <div className="flex flex-col gap-md">
                  {SKILL_CLUSTERS.map((cluster) => (
                    <div key={cluster.id}>
                      <h4 className="text-caption font-bold text-body-on-dark uppercase tracking-wider mb-xs select-none">
                        {cluster.title}
                      </h4>
                      <div className="flex flex-wrap gap-xxs">
                        {cluster.skills.map((skill) => (
                          <span
                            key={skill}
                            className="text-caption text-body-muted bg-surface-tile-2 border border-hairline/15 px-xs py-xxs rounded-pill select-none"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
