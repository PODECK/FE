'use client';

import { useRef, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { useThree } from '@react-three/fiber';
import { useDrag } from '@use-gesture/react';
import * as THREE from 'three';
import { useBattleStore } from '@/shared/stores/battleStore';

interface CardDragControllerProps {
  dexId: number;
  initialPosition: [number, number, number];
  dropZoneCenter: THREE.Vector3;
  dropZoneSize: { width: number; height: number };
  children: (props: { position: [number, number, number]; isDragging: boolean; bind: object }) => ReactNode;
}

export default function CardDragController({
  dexId,
  initialPosition,
  dropZoneCenter,
  dropZoneSize,
  children,
}: CardDragControllerProps) {
  const { camera, gl } = useThree();
  const [position, setPosition] = useState<[number, number, number]>(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const dragPlane = useRef(new THREE.Plane(new THREE.Vector3(0, 0, 1), 0));
  const raycaster = useRef(new THREE.Raycaster());

  const screenToWorld = useCallback(
    (clientX: number, clientY: number): THREE.Vector3 | null => {
      const rect = gl.domElement.getBoundingClientRect();
      const ndc = new THREE.Vector2(
        ((clientX - rect.left) / rect.width) * 2 - 1,
        -((clientY - rect.top) / rect.height) * 2 + 1,
      );
      raycaster.current.setFromCamera(ndc, camera);
      const target = new THREE.Vector3();
      const hit = raycaster.current.ray.intersectPlane(dragPlane.current, target);
      return hit ? target : null;
    },
    [camera, gl],
  );

  const isOverDropZone = useCallback(
    (worldPos: THREE.Vector3): boolean => {
      const dx = Math.abs(worldPos.x - dropZoneCenter.x);
      const dy = Math.abs(worldPos.y - dropZoneCenter.y);
      return dx < dropZoneSize.width / 2 && dy < dropZoneSize.height / 2;
    },
    [dropZoneCenter, dropZoneSize],
  );

  const bind = useDrag(
    ({ event, first, last, xy: [cx, cy] }) => {
      event?.stopPropagation();

      if (first) setIsDragging(true);

      const world = screenToWorld(cx, cy);
      if (world) {
        setPosition([world.x, world.y, initialPosition[2] + 0.5]);
      }

      if (last) {
        setIsDragging(false);
        const world2 = screenToWorld(cx, cy);
        if (world2 && isOverDropZone(world2)) {
          const team = useBattleStore.getState().playerTeam;
          const pokemon = team.find((p) => p.dexId === dexId);
          if (pokemon) {
            useBattleStore.getState().selectMove(-1);
          }
          setPosition(initialPosition);
        } else {
          setPosition(initialPosition);
        }
      }
    },
    { pointer: { capture: false } },
  );

  return <>{children({ position, isDragging, bind })}</>;
}
