'use client';
import { useLocale } from 'next-intl';
import { useMedia, MOBILE_QUERY } from '@/lib/useMedia';
import { BONE, INK, MONO, MONO_KR } from '@/lib/tokens';
import { HeaderDesktop, HeaderMobile } from './Header';
import { HeroDesktop } from './hero/HeroDesktop';
import { SpecimensDesktop } from './specimens/SpecimensDesktop';
import { HeroMobile } from './hero/HeroMobile';
import { SpecimensMobile } from './specimens/SpecimensMobile';
import { RegistryDesktop, RegistryMobile } from './Registry';
import { ProtocolDesktop, ProtocolMobile } from './Protocol';
import { FooterDesktop, FooterMobile } from './Footer';
import { SmoothScroll } from './SmoothScroll';
import { Marquee } from './Marquee';

/** Both boards render to HTML (no layout flash); only the visible one mounts its 3D canvases. */
export function Site() {
  const ko = useLocale() === 'ko';
  const mobile = useMedia(MOBILE_QUERY, false);
  const hydrated = useMedia('(min-width: 0px)', false);
  const font = ko ? MONO_KR : MONO;
  return (
    <>
      <SmoothScroll />
      <div className="qlgrain" aria-hidden="true" />
      <div id="top" className="d-only" style={{ fontFamily: font, color: BONE, background: INK, minWidth: 0, wordBreak: ko ? 'keep-all' : undefined }}>
        <HeaderDesktop ko={ko} />
        <HeroDesktop ko={ko} enabled={hydrated && !mobile} />
        <Marquee />
        <SpecimensDesktop ko={ko} enabled={hydrated && !mobile} />
        <RegistryDesktop ko={ko} />
        <ProtocolDesktop ko={ko} />
        <FooterDesktop ko={ko} enabled={hydrated && !mobile} />
      </div>
      <div id="mtop" className="m-only" style={{ fontFamily: font, color: BONE, background: INK, overflowX: 'clip', wordBreak: ko ? 'keep-all' : undefined }}>
        <HeaderMobile />
        <HeroMobile ko={ko} enabled={hydrated && mobile} />
        <Marquee />
        <SpecimensMobile ko={ko} enabled={hydrated && mobile} />
        <RegistryMobile ko={ko} />
        <ProtocolMobile ko={ko} />
        <FooterMobile ko={ko} enabled={hydrated && mobile} />
      </div>
    </>
  );
}
