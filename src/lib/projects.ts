import type { Status } from './tokens';

export type Project = {
  code: string; name: string; type: 'APP' | 'PROGRAM' | 'GAME' | 'ANIME' | 'TOOL'; st: Status; one: string; desc?: string;
  tip?: string; tipMobile?: string; platform: string; stage: string; stageLine: string; stack: string;
  form: string; formMobile?: string; dims: string;
};

/** Hero stat line: total · in review · in progress (dev or making) · paused. */
export const heroCounts = (ps: Project[]) => [
  ps.length,
  ps.filter((p) => p.st === 'review').length,
  ps.filter((p) => p.st === 'dev' || p.st === 'making').length,
  ps.filter((p) => p.st === 'paused').length,
];
