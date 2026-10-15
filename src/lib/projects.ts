import type { Status } from './tokens';

export type Project = {
  code: string; name: string; type: 'APP' | 'PROGRAM' | 'GAME' | 'TOOL'; st: Status; one: string; desc?: string;
  tip?: string; tipMobile?: string; platform: string; stage: string; stageLine: string; stack: string;
  form: string; formMobile?: string; dims: string;
};
