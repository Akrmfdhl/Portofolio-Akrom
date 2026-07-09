import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface ResumeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ResumeModal({ isOpen, onClose }: ResumeModalProps) {
  const [activeTab, setActiveTab] = useState<'experience' | 'education' | 'skills'>('experience');

  const tabs = [
    { id: 'experience' as const, label: 'Experience' },
    { id: 'education' as const, label: 'Education' },
    { id: 'skills' as const, label: 'Skills & Hobbies' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-md">
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-surface-black/80 backdrop-blur-md cursor-pointer"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="relative bg-surface-tile-2/85 border border-hairline/15 rounded-lg max-w-2xl w-full h-[75vh] flex flex-col overflow-hidden shadow-product z-10"
          >
            {/* Top Bar */}
            <div className="flex items-center justify-between border-b border-hairline/10 px-lg py-md bg-surface-tile-2/40 select-none">
              <h3 className="text-body-strong font-extrabold text-body-on-dark uppercase tracking-wide">Digital Resume</h3>
              <div className="flex items-center gap-xs">
                <a
                  href="/src/assets/FOTO CV.jpeg" // fallback link to assets
                  download="Akrom_Fadhil_CV.jpeg"
                  className="text-fine-print text-primary bg-primary/10 border border-primary/20 hover:bg-primary/25 rounded-pill px-sm py-xs font-semibold mr-8 transition-all flex items-center gap-xs cursor-pointer select-none"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                  </svg>
                  Download CV
                </a>
                <button
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

            {/* Tabs List */}
            <div className="flex border-b border-hairline/10 bg-surface-black/25 px-md py-xs gap-xxs select-none">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
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

            {/* Content Area */}
            <div className="flex-1 p-lg overflow-y-auto scrollbar-none text-left" data-lenis-prevent>
              {activeTab === 'experience' && (
                <div className="flex flex-col gap-lg">
                  {/* Job 1 */}
                  <div className="border border-hairline/10 bg-surface-tile-1/40 p-md rounded-lg flex flex-col gap-xs">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-xxs">
                      <div>
                        <h4 className="text-body-strong font-bold text-body-on-dark">Admin Front-End and Website Content</h4>
                        <span className="text-caption text-primary font-medium">PT. INOVINDO Multimedia (Magang)</span>
                      </div>
                      <span className="text-fine-print text-body-muted uppercase tracking-wider bg-surface-tile-2 border border-hairline/10 px-xs py-xxs rounded-sm">
                        Agu 2022 - Nov 2022
                      </span>
                    </div>
                    <ul className="list-disc pl-sm flex flex-col gap-xxs text-caption text-body-muted leading-relaxed">
                      <li>Membuat kerangka kawat (*wireframe*) dan tata letak awal website.</li>
                      <li>Mendesain struktur konten website dan template visual.</li>
                      <li>Mengembangkan konsep dasar ERD untuk mendukung perencanaan website.</li>
                      <li>Meningkatkan tampilan website agar lebih bersih, teratur, dan ramah pengguna.</li>
                      <li>Membantu dalam mengelola konten digital serta mendukung tugas pengembangan web.</li>
                    </ul>
                  </div>

                  {/* Job 2 */}
                  <div className="border border-hairline/10 bg-surface-tile-1/40 p-md rounded-lg flex flex-col gap-xs">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-xxs">
                      <div>
                        <h4 className="text-body-strong font-bold text-body-on-dark">Production Line Staff</h4>
                        <span className="text-caption text-primary font-medium">PT. Multi Nugraha Kencana (Magang)</span>
                      </div>
                      <span className="text-fine-print text-body-muted uppercase tracking-wider bg-surface-tile-2 border border-hairline/10 px-xs py-xxs rounded-sm">
                        Jun 2023 - Sep 2023
                      </span>
                    </div>
                    <ul className="list-disc pl-sm flex flex-col gap-xxs text-caption text-body-muted leading-relaxed">
                      <li>Membantu proses produksi kursi, khususnya di bagian busa dan pelapis (*upholstery*).</li>
                      <li>Mengikuti prosedur produksi dengan tingkat akurasi dan disiplin yang tinggi.</li>
                      <li>Mengembangkan kemampuan kerja sama tim, tanggung jawab, manajemen waktu, dan perhatian terhadap detail.</li>
                      <li>Beradaptasi dengan lingkungan kerja yang serbacepat dan mendukung target operasional harian.</li>
                    </ul>
                  </div>
                </div>
              )}

              {activeTab === 'education' && (
                <div className="flex flex-col gap-md">
                  {/* Edu 1 */}
                  <div className="border border-hairline/10 bg-surface-tile-1/40 p-md rounded-lg flex justify-between items-center gap-sm">
                    <div className="flex flex-col gap-xxs">
                      <h4 className="text-body-strong font-bold text-body-on-dark">Universitas Sultan Ageng Tirtayasa</h4>
                      <span className="text-caption text-primary">Mahasiswa Ilmu Komputer</span>
                    </div>
                    <span className="text-fine-print text-body-muted bg-surface-tile-2 border border-hairline/10 px-xs py-xxs rounded-sm select-none">
                      Mulai 2025
                    </span>
                  </div>

                  {/* Edu 2 */}
                  <div className="border border-hairline/10 bg-surface-tile-1/40 p-md rounded-lg flex justify-between items-center gap-sm">
                    <div className="flex flex-col gap-xxs">
                      <h4 className="text-body-strong font-bold text-body-on-dark">SMK 5 Kab. Tangerang</h4>
                      <span className="text-caption text-primary">Jurusan Rekayasa Perangkat Lunak (RPL)</span>
                    </div>
                    <span className="text-fine-print text-body-muted bg-surface-tile-2 border border-hairline/10 px-xs py-xxs rounded-sm select-none">
                      2021 - 2024
                    </span>
                  </div>

                  {/* Edu 3 */}
                  <div className="border border-hairline/10 bg-surface-tile-1/40 p-md rounded-lg flex justify-between items-center gap-sm">
                    <div className="flex flex-col gap-xxs">
                      <h4 className="text-body-strong font-bold text-body-on-dark">MTsN 1 Tangerang</h4>
                      <span className="text-caption text-primary">Pendidikan Menengah Pertama</span>
                    </div>
                    <span className="text-fine-print text-body-muted bg-surface-tile-2 border border-hairline/10 px-xs py-xxs rounded-sm select-none">
                      2018 - 2021
                    </span>
                  </div>
                </div>
              )}

              {activeTab === 'skills' && (
                <div className="flex flex-col gap-md">
                  {/* Hard Skills */}
                  <div>
                    <h4 className="text-caption font-bold text-body-on-dark uppercase tracking-wider mb-xs select-none">Technical Skills</h4>
                    <div className="flex flex-wrap gap-xxs">
                      {[
                        'Software Development Basics',
                        'Web Development',
                        'Front-End Development',
                        'UI Layout & Wireframing',
                        'ERD & Database Concept',
                        'HTML, CSS, JavaScript',
                        'React Basics',
                        'Git & GitHub',
                        'Canva & Digital Design Tools',
                      ].map((skill) => (
                        <span key={skill} className="text-caption text-body-muted bg-surface-tile-2 border border-hairline/10 px-xs py-xxs rounded-pill select-none">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Soft Skills */}
                  <div className="mt-sm">
                    <h4 className="text-caption font-bold text-body-on-dark uppercase tracking-wider mb-xs select-none">Soft Skills</h4>
                    <div className="flex flex-wrap gap-xxs">
                      {[
                        'Problem-Solving',
                        'Teamwork',
                        'Communication',
                        'Fast Learner',
                        'Time Management',
                        'Adaptability',
                        'Attention to Detail',
                        'Creativity',
                      ].map((skill) => (
                        <span key={skill} className="text-caption text-body-muted bg-surface-tile-2 border border-hairline/10 px-xs py-xxs rounded-pill select-none">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Hobbies */}
                  <div className="mt-sm">
                    <h4 className="text-caption font-bold text-body-on-dark uppercase tracking-wider mb-xs select-none">Hobbies</h4>
                    <div className="flex flex-wrap gap-xxs">
                      {[
                        'Learning new technologies',
                        'Building simple and useful projects',
                        'Reading non-fiction books',
                        'Exploring creative ideas',
                        'Exercising',
                      ].map((hobby) => (
                        <span key={hobby} className="text-caption text-body-muted bg-surface-tile-2 border border-hairline/10 px-xs py-xxs rounded-pill select-none">
                          {hobby}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
