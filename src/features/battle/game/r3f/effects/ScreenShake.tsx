/* eslint-disable react-hooks/immutability */
'use client';

import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useBattleStore } from '@/shared/stores/battleStore';

export default function ScreenShake() {
  const { camera } = useThree();
  const cameraEvent = useBattleStore((state) => state.cameraEvent);
  const clearCameraEvent = useBattleStore((state) => state.clearCameraEvent);
  const shakeRef = useRef({ active: false, age: 0, amplitude: 0 });
  const basePos = useRef(camera.position.clone());

  useEffect(() => {
    if (cameraEvent?.type === 'shake') {
      shakeRef.current = { active: true, age: 0, amplitude: 0.1 };
      clearCameraEvent();
    }
  }, [cameraEvent, clearCameraEvent]);

  useFrame((_, delta) => {
    const s = shakeRef.current;
    if (!s.active) return;

    s.age += delta;
    const decay = Math.max(0, 1 - s.age * 5);
    const offsetX = (Math.random() - 0.5) * s.amplitude * decay;
    const offsetY = (Math.random() - 0.5) * s.amplitude * decay;

    const pos = camera.position;
    pos.x = basePos.current.x + offsetX;
    pos.y = basePos.current.y + offsetY;

    if (decay === 0) {
      s.active = false;
      pos.copy(basePos.current);
    }
  });

  return null;
}
