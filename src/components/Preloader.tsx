import { useEffect, useState } from 'react';
import { PROFILE, engineState, subscribeEngineUi } from '../data/portfolioJourney';
import { BOOT_STAGE_LABELS, useI18n } from '../lib/i18n';

export default function Preloader() {
  const { locale, copy } = useI18n();
  const [progress, setProgress] = useState(() => engineState.boot.progress);
  const [stageKey, setStageKey] = useState(() => engineState.boot.stageKey);
  const [exiting, setExiting] = useState(false);
  const [unmounted, setUnmounted] = useState(false);

  useEffect(() => {
    let exitTimer: number | undefined;
    let unmountTimer: number | undefined;

    const syncBoot = () => {
      setProgress(engineState.boot.progress);
      setStageKey(engineState.boot.stageKey);
      if (engineState.boot.ready && !exitTimer) {
        const holdMs = engineState.reduced ? 40 : 180;
        const exitMs = engineState.reduced ? 80 : 440;
        exitTimer = window.setTimeout(() => {
          setExiting(true);
          unmountTimer = window.setTimeout(() => {
            setUnmounted(true);
          }, exitMs);
        }, holdMs);
      }
    };

    syncBoot();
    const unsub = subscribeEngineUi(syncBoot);
    return () => {
      unsub();
      if (exitTimer) window.clearTimeout(exitTimer);
      if (unmountTimer) window.clearTimeout(unmountTimer);
    };
  }, []);

  if (unmounted) return null;

  const pct = Math.max(0, Math.min(100, Math.round(progress)));
  const stageLabel = BOOT_STAGE_LABELS[locale][stageKey];

  return (
    <div
      className={`preloader ${exiting ? 'preloader--exiting' : ''}`}
      role="status"
      aria-live="polite"
      aria-label={`${stageLabel} ${pct}%`}
    >
      <div className="preloader__inner">
        <span className="preloader__eyebrow">{copy.preloader.eyebrow}</span>
        <h1 className="preloader__title">{PROFILE.name}</h1>
        <p className="preloader__sub">{copy.preloader.subtitle}</p>

        <div className="preloader__track" aria-hidden="true">
          <span
            className="preloader__fill"
            style={{ transform: `scaleX(${Math.max(0.04, pct / 100)})` }}
          />
        </div>

        <div className="preloader__meta">
          <span className="preloader__stage">{stageLabel}</span>
          <span className="preloader__pct">{pct}%</span>
        </div>
      </div>
    </div>
  );
}
