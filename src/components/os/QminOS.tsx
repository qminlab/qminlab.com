'use client';

import { useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { WemingPhone } from '@/components/objects/WemingPhone';
import { boot } from './boot';
import type { OsPayload } from './data';
import { OS_STRINGS, type OsStrings } from './strings';

export type OsData = OsPayload & { T: OsStrings; mountWeming: (el: HTMLElement) => () => void };

// Weming's screen is the same React demo the earlier homepage used, rendered without the phone around it.
// It renders synchronously so the window's opening animation can copy the finished screen.
function mountWeming(el: HTMLElement) {
  const r = createRoot(el);
  flushSync(() => r.render(<WemingPhone screen />));
  return () => queueMicrotask(() => r.unmount());
}

/** The homepage computer. The server renders an empty screen; boot() builds the desktop or iPhone on load. */
export function QminOS({ data }: { data: OsPayload }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const body = document.body.style.background;
    document.body.style.background = '#E9ECEF';
    const stop = boot(el, { ...data, T: OS_STRINGS[data.locale], mountWeming });
    return () => {
      stop();
      document.body.style.background = body;
    };
  }, [data]);
  return <div ref={ref} className="qos" />;
}
