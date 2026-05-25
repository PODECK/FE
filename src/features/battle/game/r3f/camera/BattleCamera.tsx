/* eslint-disable react-hooks/immutability */
'use client';

import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useBattleStore } from '@/shared/stores/battleStore';

const DEFAULT_FOV = 60;
const DEFAULT_POS = new THREE.Vector3(0, 0, 5);

export default function BattleCamera() {
  const { camera } = useThree();
  const cameraEvent = useBattleStore((state) => state.cameraEvent);
  const clearCameraEvent = useBattleStore((state) => state.clearCameraEvent);
  const targetFov = useRef(DEFAULT_FOV);
  const targetPos = useRef(DEFAULT_POS.clone());

  useEffect(() => {
    if (!cameraEvent) return;

    switch (cameraEvent.type) {
      case 'zoom-in':
        targetFov.current = 50;
        break;
      case 'faint-zoom':
        targetFov.current = 45;
        setTimeout(() => {
          targetFov.current = DEFAULT_FOV;
        }, 1000);
        break;
      case 'win':
        targetPos.current = new THREE.Vector3(0, -1.5, 4);
        break;
      case 'lose':
        targetPos.current = new THREE.Vector3(0, 1.5, 4);
        break;
      default:
        break;
    }
    clearCameraEvent();
  }, [cameraEvent, clearCameraEvent]);

  useFrame(() => {
    const cam = camera as THREE.PerspectiveCamera;
    cam.fov = THREE.MathUtils.lerp(cam.fov, targetFov.current, 0.05);
    cam.updateProjectionMatrix();
    cam.position.lerp(targetPos.current, 0.04);
  });

  return null;
}
