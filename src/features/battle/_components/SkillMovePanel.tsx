// 기술 선택과 확정 버튼 담당 하단 패널
import type { MoveInfo } from './skill-modal-types';

interface Props {
  moves: MoveInfo[];
  selectedIndex: number | null;
  isVisible: boolean;
  isClosing: boolean;
  onSelectMove: (moveIndex: number | null) => void;
  onConfirmMove: () => void;
}

export default function SkillMovePanel({
  moves,
  selectedIndex,
  isVisible,
  isClosing,
  onSelectMove,
  onConfirmMove,
}: Props) {
  const selectedMove = selectedIndex !== null ? moves[selectedIndex] : null;
  const canConfirm = Boolean(selectedMove && selectedMove.pp > 0);

  return (
    <div
      onClick={(event) => event.stopPropagation()}
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: '100%',
        height: 166,
        background: 'rgba(13,16,26,1)',
        borderRadius: '20px 20px 0 0',
        display: 'flex',
        alignItems: 'flex-start',
        padding: '14px 24px',
        gap: 16,
        transform: !isClosing && isVisible ? 'translateY(0)' : 'translateY(calc(100% + 20px))',
        transition: 'transform 380ms cubic-bezier(0.34, 1.56, 0.64, 1)',
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={panelTitleStyle}>기술 선택</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {moves.map((move, index) => (
            <MoveButton
              key={index}
              move={move}
              index={index}
              isSelected={selectedIndex === index}
              onSelectMove={onSelectMove}
            />
          ))}
        </div>
      </div>

      <div style={{ width: 220, flexShrink: 0, display: 'flex', flexDirection: 'column', paddingTop: 20 }}>
        <div style={panelTitleStyle}>선택 확정</div>
        <button
          disabled={!canConfirm}
          onClick={onConfirmMove}
          style={{
            width: '100%',
            height: 48,
            background: canConfirm ? 'white' : 'rgba(255,255,255,0.15)',
            borderRadius: 8,
            border: 'none',
            cursor: canConfirm ? 'pointer' : 'not-allowed',
            fontSize: 15,
            fontWeight: 700,
            fontFamily: 'Roboto, sans-serif',
            color: canConfirm ? '#0c0c16' : 'rgba(255,255,255,0.35)',
          }}
        >
          {selectedMove ? `${selectedMove.koName} 사용` : '기술을 선택하세요'}
        </button>
        <button onClick={() => onSelectMove(null)} style={resetButtonStyle}>
          다시 선택
        </button>
      </div>
    </div>
  );
}

function MoveButton({
  move,
  index,
  isSelected,
  onSelectMove,
}: {
  move: MoveInfo;
  index: number;
  isSelected: boolean;
  onSelectMove: (moveIndex: number) => void;
}) {
  const isUsable = move.pp > 0;

  return (
    <button
      disabled={!isUsable}
      onClick={() => onSelectMove(index)}
      style={{
        height: 44,
        background: isSelected ? 'rgba(13,16,26,1)' : 'rgba(229,231,235,1)',
        border: isSelected ? '1px solid rgba(255,255,255,0.2)' : 'none',
        borderRadius: 4,
        display: 'flex',
        alignItems: 'center',
        padding: '0 10px',
        cursor: isUsable ? 'pointer' : 'not-allowed',
        gap: 10,
        opacity: isUsable ? 1 : 0.45,
      }}
    >
      <div style={moveIndexCircleStyle(isSelected)}>
        <span
          style={{
            fontSize: 9,
            fontWeight: 500,
            fontFamily: 'Inter, sans-serif',
            color: isSelected ? '#0d101a' : 'white',
          }}
        >
          {index + 1}
        </span>
      </div>
      <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={moveNameStyle(isSelected)}>{move.koName}</span>
        <span style={moveMetaStyle(isSelected)}>
          {move.pp}/{move.maxPp}
        </span>
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        {move.power > 0 && <div style={movePowerStyle(isSelected)}>위력 {move.power}</div>}
        <div style={moveMetaStyle(isSelected)}>명중 {move.accuracy}%</div>
      </div>
    </button>
  );
}

const panelTitleStyle = {
  color: 'white',
  fontSize: 12,
  fontWeight: 700,
  fontFamily: 'Inter, sans-serif',
  marginBottom: 8,
} as const;

const resetButtonStyle = {
  background: 'none',
  border: 'none',
  color: 'rgba(255,255,255,0.55)',
  fontSize: 13,
  cursor: 'pointer',
  marginTop: 8,
  fontFamily: 'Roboto, sans-serif',
} as const;

function moveIndexCircleStyle(isSelected: boolean) {
  return {
    width: 18,
    height: 18,
    borderRadius: '50%',
    flexShrink: 0,
    background: isSelected ? 'white' : 'rgba(13,16,26,1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  } as const;
}

function moveNameStyle(isSelected: boolean) {
  return {
    fontSize: 13,
    fontWeight: 700,
    fontFamily: 'Inter, sans-serif',
    color: isSelected ? 'white' : '#0d101a',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  } as const;
}

function moveMetaStyle(isSelected: boolean) {
  return {
    fontSize: 11,
    fontFamily: 'Inter, sans-serif',
    color: isSelected ? 'rgba(209,213,219,1)' : 'rgba(107,114,128,1)',
    flexShrink: 0,
  } as const;
}

function movePowerStyle(isSelected: boolean) {
  return {
    fontSize: 12,
    fontWeight: 500,
    fontFamily: 'Inter, sans-serif',
    color: isSelected ? 'white' : '#0d101a',
  } as const;
}
