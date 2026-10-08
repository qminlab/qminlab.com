'use client';
import { CssCanvas } from '../three/CssCanvas';
import { HeroCube } from '../three/HeroCube';

export default function HeroCanvas({ layer, tilt, active, perspective, mobile }: {
  layer: 'shell' | 'xray'; tilt?: { current: { tx: number; ty: number } }; active: boolean; perspective: number; mobile?: boolean;
}) {
  return (
    <CssCanvas perspective={perspective} active={active}>
      <HeroCube layer={layer} tilt={tilt} mobile={mobile} />
    </CssCanvas>
  );
}
