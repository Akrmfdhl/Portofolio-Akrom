import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { EDUCATION, EXPERIENCES, PROFILE, SKILL_CLUSTERS } from '../data/portfolioJourney';
import { pickText, useI18n } from '../lib/i18n';

interface ResumeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ResumeModal({ isOpen, onClose }: ResumeModalProps) {
  const { locale, copy } = useI18n();
  const [activeTab, setActiveTab] = useState<'experience' | 'education' | 'skills'>('experience');

  const tabs = [
    { id: 'experience' as const, label: copy.resume.tabExperience },
    { id: 'education' as const, label: copy.resume.tabEducation },
    { id: 'skills' as const, label: copy.resume.tabSkills },
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
            className="glass-backdrop cursor-pointer"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ type: 'spring', damping: 26, stiffness: 240 }}
            className="glass-modal relative z-10 max-w-2xl w-full h-[78vh] flex flex-col overflow-hidden"
          >
            <div className="glass-modal__head select-none">
              <h3 className="text-body-strong font-extrabold text-body-on-dark tracking-tight">
                {PROFILE.fullName} — {copy.resume.headingSuffix}
              </h3>
              <div className="flex items-center gap-sm">
                <a
                  href={PROFILE.avatarUrl}
                  download="Akrom_Fadhil_CV.jpeg"
                  className="btn btn--small btn--amber flex items-center gap-xs cursor-pointer select-none"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                  </svg>
                  {copy.resume.download}
                </a>
                <button
                  type="button"
                  onClick={onClose}
                  className="glass-close-btn cursor-pointer"
                  aria-label={copy.resume.closeAria}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="glass-modal__tabs select-none">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`glass-tab ${activeTab === tab.id ? 'glass-tab--active' : ''}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex-1 p-lg overflow-y-auto text-left" data-lenis-prevent>
              {activeTab === 'experience' && (
                <div className="flex flex-col gap-md">
                  {EXPERIENCES.map((exp) => (
                    <div key={exp.id} className="glass-subcard flex flex-col gap-xs">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-xxs">
                        <div>
                          <h4 className="text-body-strong font-bold text-body-on-dark">
                            {pickText(locale, exp.role)}
                          </h4>
                          <span className="text-caption text-body-muted font-medium">
                            {exp.company} · {pickText(locale, exp.location)}
                          </span>
                        </div>
                        <span className="text-fine-print text-body-muted">
                          {pickText(locale, exp.period)}
                        </span>
                      </div>
                      <ul className="list-disc pl-sm flex flex-col gap-xxs text-caption text-ink-muted-80 leading-relaxed">
                        {exp.description[locale].map((item) => (
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
                      className="glass-subcard flex flex-col sm:flex-row justify-between sm:items-center gap-sm"
                    >
                      <div className="flex flex-col gap-xxs">
                        <h4 className="text-body-strong font-bold text-body-on-dark">
                          {edu.institution}
                        </h4>
                        <span className="text-caption text-ink-muted-80">
                          {pickText(locale, edu.degree)}
                        </span>
                        <span className="text-fine-print text-body-muted">
                          {pickText(locale, edu.highlight)}
                        </span>
                      </div>
                      <span className="text-fine-print text-body-muted shrink-0">
                        {pickText(locale, edu.period)}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'skills' && (
                <div className="flex flex-col gap-md">
                  {SKILL_CLUSTERS.map((cluster) => (
                    <div key={cluster.id} className="glass-subcard">
                      <h4 className="text-caption font-bold text-body-on-dark uppercase tracking-wider mb-xs select-none">
                        {pickText(locale, cluster.title)}
                      </h4>
                      <div className="flex flex-wrap gap-xxs">
                        {cluster.skills[locale].map((skill) => (
                          <span key={skill} className="glass-chip select-none">
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
