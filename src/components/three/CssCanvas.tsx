'use client';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import type { PerspectiveCamera } from 'three';

/**
 * A three.js canvas that projects exactly like a CSS `perspective` container:
 * 1 unit = 1 CSS px on the z=0 plane, vanishing point at (originX, originY) in canvas px.
 */
function CssCamera({ perspective, originX, originY }: { perspective: number; originX?: number; originY?: number }) {
  const camera = useThree((s) => s.camera) as PerspectiveCamera;
  const size = useThree((s) => s.size);
  const invalidate = useThree((s) => s.invalidate);
  useLayoutEffect(() => {
    const { width: w, height: h } = size;
    camera.fov = (2 * Math.atan(h / 2 / perspective) * 180) / Math.PI;
    camera.aspect = w / h;
    camera.near = 1;
    camera.far = perspective * 4;
    camera.position.set(0, 0, perspective);
    camera.lookAt(0, 0, 0);
    const ox = originX ?? w / 2;
    const oy = originY ?? h / 2;
    camera.setViewOffset(w, h, w / 2 - ox, h / 2 - oy, w, h);
    camera.updateProjectionMatrix();
    invalidate();
  }, [camera, size, perspective, originX, originY, invalidate]);
  return null;
}

function Kick({ on }: { on: boolean }) {
  // Keeps 'demand' canvases rendering every frame while active.
  const invalidate = useThree((s) => s.invalidate);
  useFrame(() => { if (on) invalidate(); });
  useEffect(() => { invalidate(); }, [on, invalidate]);
  return null;
}

export function useInView<T extends Element>(margin = '200px') {
  const ref = useRef<T>(null);
  const [inView, set] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => set(e.isIntersecting), { rootMargin: margin });
    io.observe(el);
    return () => io.disconnect();
  }, [margin]);
  return [ref, inView] as const;
}

export function CssCanvas({
  perspective, originX, originY, active = true, style, className, children,
}: {
  perspective: number; originX?: number; originY?: number; active?: boolean;
  style?: CSSProperties; className?: string; children: ReactNode;
}) {
  const [ref, inView] = useInView<HTMLDivElement>();
  const running = active && inView;
  return (
    <div ref={ref} className={className} style={{ position: 'absolute', inset: 0, pointerEvents: 'none', ...style }}>
      <Canvas
        flat
        linear
        dpr={[1, 2]}
        frameloop="demand"
        // Size the canvas from its layout box, not getBoundingClientRect: the stage objects sit inside
        // CSS scale() transforms, and the transformed size made the drawing area smaller than the element.
        resize={{ offsetSize: true }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
        camera={{ position: [0, 0, perspective], fov: 45 }}
      >
        <CssCamera perspective={perspective} originX={originX} originY={originY} />
        <Kick on={running} />
        {children}
      </Canvas>
    </div>
  );
}
