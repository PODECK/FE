'use client';

// 배틀 필드 카드에서 여는 기술 선택 모달
import { useEffect, useState } from 'react';

import SkillMovePanel from './SkillMovePanel';
import SkillPreviewCard from './SkillPreviewCard';
import type { SkillModalData } from './skill-modal-types';

export type { SkillModalData } from './skill-modal-types';

interface Props {
  data: SkillModalData;
  onClose: () => void;
  onConfirmMove?: (moveIndex: number) => void;
}

const CLOSE_ANIMATION_MS = 420;
const BOTTOM_PANEL_DELAY_MS = 60;

export default function SkillModal({ data, onClose, onConfirmMove }: Props) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [cardVisible, setCardVisible] = useState(false);
  const [barVisible, setBarVisible] = useState(false);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    const flightDuration = data.flightDuration;
    const overlayTimer = setTimeout(() => setOverlayVisible(true), flightDuration);
    const cardTimer = setTimeout(() => setCardVisible(true), flightDuration);
    const barTimer = setTimeout(() => setBarVisible(true), flightDuration + BOTTOM_PANEL_DELAY_MS);

    return () => {
      clearTimeout(overlayTimer);
      clearTimeout(cardTimer);
      clearTimeout(barTimer);
    };
  }, [data.flightDuration]);

  useEffect(() => {
    if (!closing) return;

    const closeTimer = setTimeout(() => onClose(), CLOSE_ANIMATION_MS);
    return () => clearTimeout(closeTimer);
  }, [closing, onClose]);

  const handleClose = () => {
    if (closing) return;

    setClosing(true);
    window.dispatchEvent(new CustomEvent('battle:modal-close'));
  };

  const handleConfirmMove = () => {
    if (selectedIndex === null) return;
    if (data.moves[selectedIndex]?.pp === 0) return;

    onConfirmMove?.(selectedIndex);
    handleClose();
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50 }}>
      <div
        onClick={handleClose}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0,0,0,0.6)',
          opacity: closing ? 0 : overlayVisible ? 1 : 0,
          transition: 'opacity 300ms ease',
        }}
      />

      <SkillPreviewCard data={data} isVisible={cardVisible} isClosing={closing} />
      <SkillMovePanel
        moves={data.moves}
        selectedIndex={selectedIndex}
        isVisible={barVisible}
        isClosing={closing}
        onSelectMove={setSelectedIndex}
        onConfirmMove={handleConfirmMove}
      />
    </div>
  );
}
