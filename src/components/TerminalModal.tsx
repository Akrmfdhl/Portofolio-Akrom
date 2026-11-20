import { useEffect, useRef, useState } from 'react';
import type { FormEvent, KeyboardEvent } from 'react';
import {
  EXPERIENCES,
  PROFILE,
  PROJECTS,
  SKILL_CLUSTERS,
  engineState,
  getFirstStopIndexForRailGroup,
  notifyEngineUi,
  sanitizeTextInput,
} from '../data/portfolioJourney';
import { useI18n, pickText } from '../lib/i18n';
import { playPulseSfx } from '../utils/soundEngine';

interface TerminalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScrollToStop: (stopIndex: number) => void;
  onOpenResume: () => void;
}

interface LogEntry {
  kind: 'in' | 'out' | 'err';
  text: string;
}

export default function TerminalModal({
  isOpen,
  onClose,
  onScrollToStop,
  onOpenResume,
}: TerminalModalProps) {
  const { locale, copy } = useI18n();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const historyRef = useRef<string[]>([]);
  const historyIdxRef = useRef<number>(0);

  const [logs, setLogs] = useState<LogEntry[]>([
    {
      kind: 'out',
      text: copy.quickNav.welcome,
    },
  ]);

  useEffect(() => {
    setLogs([{ kind: 'out', text: copy.quickNav.welcome }]);
  }, [copy.quickNav.welcome]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isOpen && !dialog.open) {
      dialog.showModal();
      inputRef.current?.focus();
    } else if (!isOpen && dialog.open) {
      dialog.close();
    }
  }, [isOpen]);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTo({ top: logRef.current.scrollHeight });
    }
  }, [logs]);

  const appendLog = (entry: LogEntry) => {
    setLogs((prev) => [...prev, entry]);
  };

  const formatProfile = () => {
    const current = EXPERIENCES.find((e) => e.isCurrent);
    return [
      `${PROFILE.fullName}`,
      copy.hero.role,
      current ? `${pickText(locale, current.role)} — ${current.company}` : '',
      PROFILE.location,
      PROFILE.email,
      PROFILE.github,
      PROFILE.linkedin,
    ]
      .filter(Boolean)
      .join('\n');
  };

  const formatProjects = () =>
    PROJECTS.map(
      (p) => `${p.title.padEnd(28)} ${pickText(locale, p.metric)}`
    ).join('\n');

  const formatSkills = () =>
    SKILL_CLUSTERS.map(
      (c) => `${pickText(locale, c.title)}\n  · ${c.skills[locale].join(' · ')}`
    ).join('\n\n');

  const executeCommand = (raw: string) => {
    const sanitized = sanitizeTextInput(raw, 120);
    const cmd = sanitized.replace(/\s+/g, ' ');
    appendLog({ kind: 'in', text: sanitized });
    if (!cmd) return;

    historyRef.current.push(cmd);
    historyIdxRef.current = historyRef.current.length;

    const lower = cmd.toLowerCase();
    if (lower === 'help' || lower === 'bantuan') {
      appendLog({ kind: 'out', text: copy.quickNav.helpText });
      return;
    }
    if (lower === 'profile' || lower === 'profil' || lower === 'akrom --info') {
      appendLog({ kind: 'out', text: formatProfile() });
      return;
    }
    if (lower === 'projects' || lower === 'proyek' || lower === 'akrom --projects') {
      appendLog({ kind: 'out', text: formatProjects() });
      return;
    }
    if (lower === 'skills' || lower === 'keahlian' || lower === 'akrom --skills') {
      appendLog({ kind: 'out', text: formatSkills() });
      return;
    }
    if (lower.startsWith('goto ') || lower.startsWith('buka ')) {
      const num = Number.parseInt(lower.slice(5), 10);
      if (num >= 1 && num <= copy.chapters.length) {
        const stopIdx = getFirstStopIndexForRailGroup(num - 1);
        onScrollToStop(stopIdx);
        appendLog({
          kind: 'out',
          text: `${copy.quickNav.navigating} ${copy.chapters[num - 1].label}...`,
        });
        onClose();
      } else {
        appendLog({
          kind: 'err',
          text: `${copy.quickNav.invalidChapter} ${copy.chapters.length}.`,
        });
      }
      return;
    }
    if (lower === 'boost' || lower === 'dorong') {
      engineState.pulse = 1.0;
      playPulseSfx(540);
      appendLog({ kind: 'out', text: copy.quickNav.boostMsg });
      return;
    }
    if (lower === 'camera orbit' || lower === 'kamera bebas' || lower === 'orbit') {
      engineState.cameraMode = 'orbit';
      notifyEngineUi();
      appendLog({ kind: 'out', text: copy.quickNav.orbitMsg });
      return;
    }
    if (
      lower === 'camera guided' ||
      lower === 'kamera pandu' ||
      lower === 'mode rail'
    ) {
      engineState.cameraMode = 'rail';
      notifyEngineUi();
      appendLog({ kind: 'out', text: copy.quickNav.guidedMsg });
      return;
    }
    if (lower === 'cv' || lower === 'resume') {
      onClose();
      onOpenResume();
      return;
    }
    if (lower === 'clear' || lower === 'bersihkan') {
      setLogs([]);
      return;
    }
    if (lower === 'close' || lower === 'exit' || lower === 'keluar' || lower === 'tutup') {
      onClose();
      return;
    }

    appendLog({
      kind: 'err',
      text: `${cmd.split(' ')[0]}: ${copy.quickNav.unknownCmd}`,
    });
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!inputRef.current) return;
    const val = inputRef.current.value;
    inputRef.current.value = '';
    executeCommand(val);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    const hist = historyRef.current;
    if (e.key === 'ArrowUp' && hist.length > 0) {
      e.preventDefault();
      historyIdxRef.current = Math.max(0, historyIdxRef.current - 1);
      e.currentTarget.value = hist[historyIdxRef.current] ?? '';
    } else if (e.key === 'ArrowDown' && hist.length > 0) {
      e.preventDefault();
      historyIdxRef.current = Math.min(hist.length, historyIdxRef.current + 1);
      e.currentTarget.value = hist[historyIdxRef.current] ?? '';
    }
  };

  return (
    <dialog
      ref={dialogRef}
      className="term"
      aria-label={copy.quickNav.title}
      data-lenis-prevent
      onClose={onClose}
      onClick={(e) => {
        if (e.target === dialogRef.current) onClose();
      }}
    >
      <div className="term__bar">
        <span>{copy.quickNav.title}</span>
        <div className="term__bar-actions">
          <button
            type="button"
            className="btn btn--small"
            onClick={() => executeCommand(locale === 'id' ? 'bantuan' : 'help')}
          >
            {copy.quickNav.btnHelp}
          </button>
          <button
            type="button"
            className="btn btn--small"
            onClick={() => executeCommand(locale === 'id' ? 'profil' : 'profile')}
          >
            {copy.quickNav.btnProfile}
          </button>
          <button
            type="button"
            className="btn btn--small"
            onClick={onClose}
          >
            {copy.quickNav.btnClose}
          </button>
        </div>
      </div>

      <div
        ref={logRef}
        className="term__log"
        role="log"
        aria-live="polite"
        onClick={() => inputRef.current?.focus()}
      >
        {logs.map((entry, idx) => (
          <pre key={idx} data-kind={entry.kind}>
            {entry.kind === 'in' ? `> ${entry.text}` : entry.text}
          </pre>
        ))}
      </div>

      <form className="term__form" onSubmit={handleSubmit}>
        <label htmlFor="term-input">&rsaquo;</label>
        <input
          id="term-input"
          ref={inputRef}
          type="text"
          maxLength={120}
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          placeholder={copy.quickNav.placeholder}
          aria-label={copy.quickNav.placeholder}
          onKeyDown={handleKeyDown}
        />
      </form>
    </dialog>
  );
}
