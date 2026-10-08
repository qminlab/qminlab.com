'use client';
import { CssCanvas } from '../three/CssCanvas';
import { HeroCube } from '../three/HeroCube';

export default function HeroCanvas({ layer, tilt, active, perspective, mobile, onReady }: {
  layer: 'shell' | 'xray'; tilt?: { current: { tx: number; ty: number } }; active: boolean; perspective: number; mobile?: boolean; onReady?: () => void;
}) {
  return (
    <CssCanvas perspective={perspective} active={active} onReady={onReady}>
      <HeroCube layer={layer} tilt={tilt} mobile={mobile} />
    </CssCanvas>
  );
}
