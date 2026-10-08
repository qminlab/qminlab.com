import type { Status } from './tokens';

export type Project = {
  code: string; name: string; type: 'APP' | 'PROGRAM' | 'GAME'; st: Status; one: string;
  tip?: string; tipMobile?: string; platform: string; stage: string; stageLine: string; stack: string;
  form: string; formMobile?: string; dims: string;
};
