'use client';

import { useTexture } from '@react-three/drei';
import { useThree } from '@react-three/fiber';

export default function BattleField() {
  const texture = useTexture('/images/battle/trainer-tower-field.png');
  const { viewport } = useThree();

  const aspect = texture.image
    ? (texture.image as HTMLImageElement).width / (texture.image as HTMLImageElement).height
    : 16 / 9;
  const w = Math.max(viewport.width, viewport.height * aspect);
  const h = w / aspect;

  return (
    <mesh position={[0, 0, -1]}>
      <planeGeometry args={[w, h]} />
      <meshBasicMaterial map={texture} />
    </mesh>
  );
}
