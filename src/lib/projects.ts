import type { Status } from './tokens';

export type Project = {
  code: string; name: string; type: 'APP' | 'PROGRAM' | 'GAME' | 'ANIME' | 'TOOL'; st: Status; one: string; desc?: string;
  tip?: string; tipMobile?: string; platform: string; stage: string; stageLine: string; stack: string;
  form: string; formMobile?: string; dims: string;
  /** Earlier attempts and why each was redone, oldest first (QL-006). */
  versions?: { v: string; title: string; tried: string; why?: string; now?: string }[];
};

/** Hero stat line: total · awaiting release · in progress (dev or making) · paused. */
export const heroCounts = (ps: Project[]) => [
  ps.length,
  ps.filter((p) => p.st === 'ready').length,
  ps.filter((p) => p.st === 'dev' || p.st === 'making').length,
  ps.filter((p) => p.st === 'paused').length,
];
