import { useEffect, useRef, useState } from 'react';
import type { FormEvent, KeyboardEvent } from 'react';
import {
  EXPERIENCES,
  PROFILE,
  PROJECTS,
  RAIL_GROUPS,
  SKILL_CLUSTERS,
  engineState,
  getActiveVehicleLabel,
  getFirstStopIndexForRailGroup,
  notifyEngineUi,
  sanitizeTextInput,
} from '../data/portfolioJourney';
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

const HELP_TEXT = [
  'help                     list available commands',
  'akrom --info             engineer profile & contact endpoints',
  'akrom --projects         deployed flagship systems & metrics',
  'akrom --skills           full-stack, AI, Go & WebGL stack',
  'cat journey.json         4-stage vehicle progression & telemetry',
  'diag                     run static WebGL frame & shader diagnostics',
  'goto <1-6>               jump to chapter (1=Earth Car .. 6=Space Dock)',
  'boost                    trigger vehicle boost / afterburner',
  'mode <director|orbit>    switch camera between multi-POV and free orbit',
  'resume                   open Digital Resume modal',
  'clear                    clear terminal output',
  'exit                     close terminal window',
].join('\n');

function formatInfo(): string {
  const current = EXPERIENCES.find((e) => e.isCurrent);
  return [
    `name      ${PROFILE.fullName}`,
    `title     ${PROFILE.title}`,
    current ? `current   ${current.role} @ ${current.company}` : '',
    `location  ${PROFILE.location}`,
    `email     ${PROFILE.email}`,
    `github    ${PROFILE.github}`,
    `linkedin  ${PROFILE.linkedin}`,
  ]
    .filter(Boolean)
    .join('\n');
}

function formatProjects(): string {
  return PROJECTS.map((p) => {
    const tag = p.featured ? 'FLAGSHIP' : 'ARCHIVE ';
    return `${tag}  ${p.title.padEnd(28)} ${p.status.padEnd(12)} ${p.metric}`;
  }).join('\n');
}

function formatSkills(): string {
  return SKILL_CLUSTERS.map(
    (c) => `${c.title}\n  » ${c.skills.join(' · ')}`
  ).join('\n\n');
}

function formatJourneyJson(): string {
  return JSON.stringify(
    {
      activeVehicle: getActiveVehicleLabel(engineState.t),
      cameraMode: engineState.cameraMode,
      stages: [
        'Stage 1: Earth Coastal Highway — Grand Touring Sports Car',
        'Stage 2: Elevated Metro Viaduct — High-Speed Bullet Train',
        'Stage 3: Stratosphere Ascent — Swept-Wing Jet Aircraft',
        'Stage 4: Exosphere & Deep Space — Multi-Stage Orbital Rocket',
      ],
      chapters: RAIL_GROUPS.map((g, i) => `${i + 1}. ${g.label} (${g.host})`),
      stats: PROFILE.stats,
    },
    null,
    2
  );
}

export default function TerminalModal({
  isOpen,
  onClose,
  onScrollToStop,
  onOpenResume,
}: TerminalModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const historyRef = useRef<string[]>([]);
  const historyIdxRef = useRef<number>(0);

  const [logs, setLogs] = useState<LogEntry[]>([
    {
      kind: 'out',
      text: 'AKROM TELEMETRY SHELL READY.\nType "help" for commands, "cat journey.json" for vehicle state, or "goto 1..6".',
    },
  ]);

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

  const executeCommand = (raw: string) => {
    const sanitized = sanitizeTextInput(raw, 120);
    const cmd = sanitized.replace(/\s+/g, ' ');
    appendLog({ kind: 'in', text: sanitized });
    if (!cmd) return;

    historyRef.current.push(cmd);
    historyIdxRef.current = historyRef.current.length;

    const lower = cmd.toLowerCase();
    if (lower === 'help') {
      appendLog({ kind: 'out', text: HELP_TEXT });
      return;
    }
    if (lower === 'akrom --info' || lower === 'whoami') {
      appendLog({ kind: 'out', text: formatInfo() });
      return;
    }
    if (lower === 'akrom --projects' || lower === 'ls projects') {
      appendLog({ kind: 'out', text: formatProjects() });
      return;
    }
    if (lower === 'akrom --skills' || lower === 'ls skills') {
      appendLog({ kind: 'out', text: formatSkills() });
      return;
    }
    if (lower === 'cat journey.json' || lower === 'cat architecture.json') {
      appendLog({ kind: 'out', text: formatJourneyJson() });
      return;
    }
    if (lower === 'diag' || lower === 'ping' || lower === 'ping server') {
      appendLog({
        kind: 'out',
        text: [
          'STATIC WEBGL PIPELINE DIAGNOSTICS (ZERO-BACKEND MODE)',
          `active_vehicle   ${getActiveVehicleLabel(engineState.t)}`,
          `frame_rate       ${engineState.stats.fps} FPS`,
          `draw_calls       ${engineState.stats.drawCalls} calls`,
          `triangles        ${engineState.stats.triangles} tris`,
          `spline_progress  ${engineState.t.toFixed(2)} / 12.00`,
          'status           OK (100% Static Client Runtime)',
        ].join('\n'),
      });
      return;
    }
    if (lower.startsWith('goto ')) {
      const num = Number.parseInt(lower.slice(5), 10);
      if (num >= 1 && num <= RAIL_GROUPS.length) {
        const stopIdx = getFirstStopIndexForRailGroup(num - 1);
        onScrollToStop(stopIdx);
        appendLog({
          kind: 'out',
          text: `Navigating to Chapter ${num}: ${RAIL_GROUPS[num - 1].label}...`,
        });
        onClose();
      } else {
        appendLog({
          kind: 'err',
          text: `Invalid chapter index. Use goto 1 through goto ${RAIL_GROUPS.length}.`,
        });
      }
      return;
    }
    if (lower === 'boost' || lower === 'pulse') {
      engineState.pulse = 1.0;
      playPulseSfx(540);
      appendLog({
        kind: 'out',
        text: `Vehicle propulsion boost engaged [${getActiveVehicleLabel(engineState.t)}].`,
      });
      return;
    }
    if (lower === 'mode orbit' || lower === 'orbit') {
      engineState.cameraMode = 'orbit';
      notifyEngineUi();
      appendLog({
        kind: 'out',
        text: 'Camera switched to Free 3D Orbit mode.',
      });
      return;
    }
    if (lower === 'mode director' || lower === 'mode rail' || lower === 'rail') {
      engineState.cameraMode = 'rail';
      notifyEngineUi();
      appendLog({
        kind: 'out',
        text: 'Camera locked to Multi-Perspective Director spline.',
      });
      return;
    }
    if (lower === 'resume') {
      onClose();
      onOpenResume();
      return;
    }
    if (lower === 'clear') {
      setLogs([]);
      return;
    }
    if (lower === 'exit') {
      onClose();
      return;
    }

    appendLog({
      kind: 'err',
      text: `${cmd.split(' ')[0]}: command not found. Type "help" to list commands.`,
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
      aria-label="Interactive System Terminal"
      data-lenis-prevent
      onClose={onClose}
      onClick={(e) => {
        if (e.target === dialogRef.current) onClose();
      }}
    >
      <div className="term__bar">
        <span>{PROFILE.handle} — CLI</span>
        <div className="term__bar-actions">
          <button
            type="button"
            className="btn btn--small"
            onClick={() => executeCommand('help')}
          >
            help
          </button>
          <button
            type="button"
            className="btn btn--small"
            onClick={() => executeCommand('cat journey.json')}
          >
            journey.json
          </button>
          <button
            type="button"
            className="btn btn--small"
            onClick={onClose}
          >
            Close
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
            {entry.kind === 'in' ? `$ ${entry.text}` : entry.text}
          </pre>
        ))}
      </div>

      <form className="term__form" onSubmit={handleSubmit}>
        <label htmlFor="term-input">$</label>
        <input
          id="term-input"
          ref={inputRef}
          type="text"
          maxLength={120}
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          placeholder="Type help, akrom --info, cat journey.json, diag, goto 1..6"
          aria-label="Command input"
          onKeyDown={handleKeyDown}
        />
      </form>
    </dialog>
  );
}
