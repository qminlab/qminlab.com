import { Archivo, IBM_Plex_Mono, IBM_Plex_Sans_KR } from 'next/font/google';
// Korean comes in ~90 unicode-range slices per weight; preloading them all stalls first paint, so the browser fetches only the slices a page uses.

export const archivo = Archivo({ subsets: ['latin'], axes: ['wdth'], variable: '--font-archivo', display: 'swap' });
export const plexMono = IBM_Plex_Mono({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--font-mono', display: 'swap' });
export const plexKr = IBM_Plex_Sans_KR({ subsets: ['latin'], weight: ['300', '400', '500', '600', '700'], variable: '--font-kr', display: 'swap', preload: false });
