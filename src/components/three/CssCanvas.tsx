'use client';
import { createContext, useContext, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { Group, Renderer } from './gl';
import { useFontsReady } from './textures';

type Stage = { group: Group; invalidate: () => void; onFrame: (cb: () => void) => () => void };
const StageContext = createContext<Stage | null>(null);

function useStage() {
  const s = useContext(StageContext);
  if (!s) throw new Error('3D hooks must be used inside <CssCanvas>');
  return s;
}

/** Meshes added to this group are drawn by the surrounding canvas. */
export const useGroup = () => useStage().group;
/** Request one more frame (the canvas only draws on demand). */
export const useInvalidate = () => useStage().invalidate;
/** Run `cb` before every drawn frame. */
export function useFrame(cb: () => void) {
  const { onFrame } = useStage();
  const ref = useRef(cb);
  ref.current = cb;
  useEffect(() => onFrame(() => ref.current()), [onFrame]);
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

/**
 * A WebGL canvas that projects exactly like a CSS `perspective` container:
 * 1 unit = 1 CSS px on the z=0 plane, vanishing point at (originX, originY) in canvas px.
 * Children mount once the web fonts are usable (textures are painted once, with the right fonts), and
 * `onReady` fires after the first complete frame so callers can drop their loading placeholder.
 */
export function CssCanvas({
  perspective, originX, originY, active = true, onReady, style, className, children,
}: {
  perspective: number; originX?: number; originY?: number; active?: boolean; onReady?: () => void;
  style?: CSSProperties; className?: string; children: ReactNode;
}) {
  const [ref, inView] = useInView<HTMLDivElement>();
  const canvas = useRef<HTMLCanvasElement>(null);
  const fonts = useFontsReady();
  const [stage, setStage] = useState<Stage | null>(null);
  const running = useRef(false);
  running.current = active && inView;
  const view = useRef({ perspective, originX, originY });
  view.current = { perspective, originX, originY };
  const ready = useRef(onReady);
  ready.current = onReady;

  useLayoutEffect(() => {
    const el = canvas.current, box = ref.current;
    if (!el || !box) return;
    let renderer: Renderer;
    try {
      renderer = new Renderer(el);
    } catch {
      ready.current?.();
      return;
    }
    const group = new Group();
    const callbacks = new Set<() => void>();
    let raf = 0, fired = false, alive = true;
    const frame = () => {
      raf = 0;
      callbacks.forEach((cb) => cb());
      const { perspective: p, originX: ox, originY: oy } = view.current;
      renderer.render(group.children, p, ox ?? renderer.width / 2, oy ?? renderer.height / 2);
      if (!fired && group.children.size > 0) { fired = true; ready.current?.(); }
      if (running.current) invalidate();
    };
    const invalidate = () => { if (alive && !raf) raf = requestAnimationFrame(frame); };
    const resize = () => {
      // Layout size, not getBoundingClientRect: the stage objects sit inside CSS scale() transforms.
      renderer.setSize(box.offsetWidth, box.offsetHeight, Math.min(Math.max(1, window.devicePixelRatio || 1), 2));
      invalidate();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(box);
    setStage({ group, invalidate, onFrame: (cb) => { callbacks.add(cb); invalidate(); return () => { callbacks.delete(cb); }; } });
    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      renderer.dispose();
      setStage(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { stage?.invalidate(); }, [stage, active, inView, perspective, originX, originY]);

  return (
    <div ref={ref} className={className} style={{ position: 'absolute', inset: 0, pointerEvents: 'none', ...style }}>
      <canvas ref={canvas} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block', pointerEvents: 'none' }} />
      {stage && fonts && <StageContext.Provider value={stage}>{children}</StageContext.Provider>}
    </div>
  );
}
