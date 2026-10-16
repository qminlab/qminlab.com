'use client';
import { useEffect, useRef } from 'react';
import type { ShaderMount } from '@paper-design/shaders';

/**
 * Liquid-metal copy of a one-line wordmark (Paper Shaders' LiquidMetal, the shader behind
 * paper-design/liquid-logo). The glyphs are redrawn onto a canvas at the exact spot the DOM
 * text sits, so the metal lines up with the real letters around the lens edge.
 * The shader code is fetched and built only when the wordmark nears the viewport; it only animates
 * while `active` is true.
 */
export function useLiquidWord(source: React.RefObject<HTMLElement | null>, enabled: boolean, ground: string) {
  const mount = useRef<HTMLDivElement>(null);
  const shader = useRef<ShaderMount | null>(null);
  const active = useRef(false);
  const reduce = useRef(false);

  useEffect(() => {
    const host = source.current, box = mount.current;
    if (!enabled || !host || !box) return;
    reduce.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let dead = false;
    let url = '';
    let builtW = 0;
    let again: ReturnType<typeof setTimeout>;
    const build = async () => {
      const [{ ShaderMount, liquidMetalFragmentShader, toProcessedLiquidMetal, getShaderColorFromString, ShaderFitOptions, LiquidMetalShapes }] =
        await Promise.all([import('./liquidMetal'), document.fonts.ready]);
      const text = [...host.childNodes].find((n) => n.nodeType === Node.TEXT_NODE && n.textContent?.trim());
      if (dead || !text) return;
      const hb = host.getBoundingClientRect();
      const range = document.createRange();
      range.selectNodeContents(text);
      const tb = range.getBoundingClientRect();
      const cs = getComputedStyle(host);
      const fs = parseFloat(cs.fontSize);
      const k = 2; // draw at 2x so the edge field stays crisp
      const c = document.createElement('canvas');
      c.width = Math.round(hb.width * k);
      c.height = Math.round(hb.height * k);
      const ctx = c.getContext('2d');
      if (!ctx) return;
      ctx.scale(k, k);
      ctx.font = `${cs.fontWeight} expanded ${fs}px ${cs.fontFamily}`;
      const ls = parseFloat(cs.letterSpacing) || 0;
      const m = ctx.measureText(text.textContent!);
      const baseline = tb.top - hb.top + m.fontBoundingBoxAscent;
      ctx.fillStyle = '#000';
      let x = tb.left - hb.left;
      if ('letterSpacing' in CanvasRenderingContext2D.prototype) {
        ctx.letterSpacing = `${ls}px`;
        ctx.fillText(text.textContent!, x, baseline);
      } else { // older Firefox: no canvas letterSpacing, so place glyphs one by one
        for (const ch of text.textContent!) { ctx.fillText(ch, x, baseline); x += ctx.measureText(ch).width + ls; }
      }
      const blob = await new Promise<Blob | null>((r) => c.toBlob(r));
      if (dead || !blob) return;
      url = URL.createObjectURL(blob);
      const { pngBlob } = await toProcessedLiquidMetal(url);
      URL.revokeObjectURL(url);
      url = URL.createObjectURL(pngBlob);
      const img = new Image();
      img.src = url;
      await img.decode();
      if (dead) return;
      shader.current?.dispose();
      box.replaceChildren();
      builtW = hb.width;
      shader.current = new ShaderMount(box, liquidMetalFragmentShader, {
        u_image: img,
        u_isImage: true,
        u_shape: LiquidMetalShapes.none,
        u_colorBack: getShaderColorFromString(ground),
        u_colorTint: getShaderColorFromString('#FFFFFF'), // plain mercury; the orange lens ring carries the accent
        u_repetition: 3,
        u_softness: 0.35,
        u_shiftRed: 0.25,
        u_shiftBlue: 0.25,
        u_distortion: 0.12,
        u_contour: 0.5,
        u_angle: 70,
        u_fit: ShaderFitOptions.contain,
        u_scale: 1, u_rotation: 0, u_offsetX: 0, u_offsetY: 0, u_originX: 0.5, u_originY: 0.5, u_worldWidth: 0, u_worldHeight: 0,
      }, { premultipliedAlpha: false }, active.current && !reduce.current ? 1 : 0, 0, 2, undefined, ['u_image']);
      box.style.background = ground; // covers the fallback grid letters underneath
    };
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      build().catch(() => { /* metal is decoration; the grid x-ray stays as fallback */ });
    }, { rootMargin: '600px 0px' });
    io.observe(host);
    // The wordmark is sized in vw, so a resize means redrawing the glyph mask.
    const ro = new ResizeObserver(() => {
      if (!builtW || Math.abs(host.getBoundingClientRect().width - builtW) < 2) return;
      clearTimeout(again);
      again = setTimeout(() => build().catch(() => {}), 250);
    });
    ro.observe(host);
    return () => {
      dead = true;
      io.disconnect();
      ro.disconnect();
      clearTimeout(again);
      shader.current?.dispose();
      shader.current = null;
      if (url) URL.revokeObjectURL(url);
    };
  }, [source, enabled, ground]);

  const setActive = (on: boolean) => {
    if (active.current === on) return;
    active.current = on;
    shader.current?.setSpeed(on && !reduce.current ? 1 : 0);
  };
  return { mount, setActive };
}
