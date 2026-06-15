'use client';

import {
  HOME_TOUR_STORAGE_KEY,
  homeTourSteps,
  type HomeTourPlacement,
} from '@/app/(main)/home/_constants/homeTourSteps';
import { useCallback, useEffect, useState, useSyncExternalStore, type CSSProperties } from 'react';

type Rect = {
  top: number;
  left: number;
  width: number;
  height: number;
};

type TooltipPosition = {
  top: number;
  left: number;
};

const PADDING = 10;
const TOOLTIP_WIDTH = 320;
const TOOLTIP_HEIGHT = 180;
const VIEWPORT_MARGIN = 16;
const TOOLTIP_GAP = 16;

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), Math.max(min, max));

const isSameRect = (previous: Rect | null, next: Rect) =>
  previous?.top === next.top &&
  previous.left === next.left &&
  previous.width === next.width &&
  previous.height === next.height;

const isSameTooltipPosition = (previous: CSSProperties | null, next: TooltipPosition) =>
  previous?.top === next.top && previous.left === next.left;

const subscribeHomeTourStorage = () => () => {};

const getHomeTourServerSnapshot = () => false;

interface HomeOnboardingGuideProps {
  userId: string;
}

export default function HomeOnboardingGuide({ userId }: HomeOnboardingGuideProps) {
  const storageKey = `${HOME_TOUR_STORAGE_KEY}.${userId}`;
  const getHomeTourSnapshot = useCallback(() => {
    try {
      return !window.localStorage.getItem(storageKey);
    } catch {
      return true;
    }
  }, [storageKey]);
  const shouldShowTour = useSyncExternalStore(subscribeHomeTourStorage, getHomeTourSnapshot, getHomeTourServerSnapshot);
  const [isDismissed, setIsDismissed] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<Rect | null>(null);
  const [tooltipStyle, setTooltipStyle] = useState<CSSProperties | null>(null);

  const isOpen = shouldShowTour && !isDismissed;
  const currentStep = homeTourSteps[stepIndex];
  const isLastStep = stepIndex === homeTourSteps.length - 1;

  const closeTour = useCallback(() => {
    try {
      window.localStorage.setItem(storageKey, 'true');
    } finally {
      setIsDismissed(true);
    }
  }, [storageKey]);

  const moveNext = useCallback(() => {
    if (isLastStep) {
      closeTour();
      return;
    }

    setStepIndex((current) => current + 1);
  }, [closeTour, isLastStep]);

  useEffect(() => {
    if (!isOpen || !currentStep) return;

    let animationFrameId = 0;

    const getTarget = () => document.querySelector<HTMLElement>(`[data-tour-id="${currentStep.targetId}"]`);

    const updateTargetState = () => {
      const target = getTarget();

      if (!target) {
        moveNext();
        return;
      }

      const rect = target.getBoundingClientRect();

      if (rect.width === 0 || rect.height === 0) {
        moveNext();
        return;
      }

      const nextTargetRect = {
        top: Math.max(rect.top - PADDING, 0),
        left: Math.max(rect.left - PADDING, 0),
        width: rect.width + PADDING * 2,
        height: rect.height + PADDING * 2,
      };

      const centeredTop = nextTargetRect.top + nextTargetRect.height / 2 - TOOLTIP_HEIGHT / 2;
      const centeredLeft = nextTargetRect.left + nextTargetRect.width / 2 - TOOLTIP_WIDTH / 2;

      const maxTop = window.innerHeight - TOOLTIP_HEIGHT - VIEWPORT_MARGIN;
      const maxLeft = window.innerWidth - TOOLTIP_WIDTH - VIEWPORT_MARGIN;
      const fallbackTop = nextTargetRect.top + nextTargetRect.height + TOOLTIP_GAP;

      const placementStyle: Record<HomeTourPlacement, CSSProperties> = {
        top: {
          top: nextTargetRect.top - TOOLTIP_HEIGHT - TOOLTIP_GAP,
          left: centeredLeft,
        },
        bottom: {
          top: fallbackTop,
          left: centeredLeft,
        },
        left: {
          top: centeredTop,
          left: nextTargetRect.left - TOOLTIP_WIDTH - TOOLTIP_GAP,
        },
        right: {
          top: centeredTop,
          left: nextTargetRect.left + nextTargetRect.width + TOOLTIP_GAP,
        },
      };

      const nextTooltipStyle = placementStyle[currentStep.placement];
      const nextTooltipPosition = {
        top: clamp(Number(nextTooltipStyle.top), VIEWPORT_MARGIN, maxTop),
        left: clamp(Number(nextTooltipStyle.left), VIEWPORT_MARGIN, maxLeft),
      };

      setTargetRect((previous) => (isSameRect(previous, nextTargetRect) ? previous : nextTargetRect));
      setTooltipStyle((previous) =>
        isSameTooltipPosition(previous, nextTooltipPosition) ? previous : nextTooltipPosition,
      );
    };

    const scheduleUpdate = () => {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = requestAnimationFrame(updateTargetState);
    };

    const target = getTarget();

    target?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
      inline: 'nearest',
    });

    scheduleUpdate();

    window.addEventListener('resize', scheduleUpdate);
    window.addEventListener('scroll', scheduleUpdate, true);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', scheduleUpdate);
      window.removeEventListener('scroll', scheduleUpdate, true);
    };
  }, [currentStep, isOpen, moveNext]);

  useEffect(() => {
    if (!isOpen) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeTour();
      }
    };

    window.addEventListener('keydown', closeOnEscape);

    return () => {
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [closeTour, isOpen]);

  if (!isOpen || !currentStep || !targetRect || !tooltipStyle) return null;

  return (
    <div className="fixed inset-0 z-[9999]" role="dialog" aria-modal="true" aria-labelledby="home-tour-title">
      <div className="absolute right-0 left-0 bg-[var(--color-base-0)]/45" style={{ top: 0, height: targetRect.top }} />
      <div
        className="absolute left-0 bg-[var(--color-base-0)]/45"
        style={{
          top: targetRect.top,
          width: targetRect.left,
          height: targetRect.height,
        }}
      />
      <div
        className="absolute right-0 bg-[var(--color-base-0)]/45"
        style={{
          top: targetRect.top,
          left: targetRect.left + targetRect.width,
          height: targetRect.height,
        }}
      />
      <div
        className="absolute right-0 left-0 bg-[var(--color-base-0)]/45"
        style={{ top: targetRect.top + targetRect.height, bottom: 0 }}
      />

      <div
        className="absolute shadow-[0_0_0_1px_rgba(255,178,26,0.6)] ring-4 ring-[var(--color-base-3)]"
        style={targetRect}
      />

      <div
        className="pointer-events-auto absolute w-[320px] rounded-[16px] bg-[var(--color-base-3)] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.22)]"
        style={tooltipStyle}
      >
        <p className="text-xs font-extrabold text-[var(--color-primary)]">
          {stepIndex + 1} / {homeTourSteps.length}
        </p>
        <h2 id="home-tour-title" className="mt-2 text-xl font-extrabold text-[var(--color-base-0)]">
          {currentStep.title}
        </h2>
        <p className="mt-2 text-[12px] leading-relaxed font-medium text-[var(--color-base-1)]">
          {currentStep.description}
        </p>

        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={closeTour}
            className="h-10 flex-1 cursor-pointer rounded-[10px] border border-[#E5E5E5] text-sm font-extrabold text-[var(--color-base-1)]"
          >
            건너뛰기
          </button>
          <button
            type="button"
            onClick={moveNext}
            className="h-10 flex-1 cursor-pointer rounded-[10px] bg-[var(--color-primary)] text-sm font-extrabold text-[var(--color-base-3)]"
          >
            {isLastStep ? '시작하기' : '다음'}
          </button>
        </div>
      </div>
    </div>
  );
}
