import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { TRIALS, TRIAL_LABELS, TRIAL_SLUGS, TRIALS_AS_OF, type TrialSlug } from '@/content/trials';
import { EMAIL, SITE, ldScript } from '@/lib/identity';
import type { TrialMedia } from '@/content/trials';
import { Demo } from '@/components/trials/Demos';
import '@/styles/trials.css';

/**
 * Trial-and-error pages: one per project, version by version (src/content/trials.ts).
 * Static text only, like the case files, so the whole story is readable and quotable without scripts.
 */
const pick = (locale: string) => (locale === 'ko' ? 'ko' : 'en') as 'ko' | 'en';
const isSlug = (s: string): s is TrialSlug => (TRIAL_SLUGS as string[]).includes(s);

export function generateStaticParams() {
  return routing.locales.flatMap((locale) => TRIAL_SLUGS.map((slug) => ({ locale, slug })));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isSlug(slug)) return {};
  const c = TRIALS[slug][pick(locale)];
  return {
    title: c.meta.title,
    description: c.meta.description,
    alternates: { canonical: `/${locale}/trials/${slug}/`, languages: Object.fromEntries(routing.locales.map((l) => [l, `/${l}/trials/${slug}/`])) },
    openGraph: { title: c.meta.title, description: c.meta.description, url: `/${locale}/trials/${slug}/` },
  };
}

function Figure({ m, l }: { m: TrialMedia; l: 'ko' | 'en' }) {
  if (m.kind === 'demo') {
    return (
      <figure className="tr-fig tr-fig-demo">
        <Demo demo={m.demo} l={l} />
        <figcaption>{m.cap[l]}</figcaption>
      </figure>
    );
  }
  const tall = m.h > m.w;
  return (
    <figure className="tr-fig" data-tall={tall ? '' : undefined} data-phone={m.kind === 'img' && m.phone ? '' : undefined} data-small={m.w <= 400 ? '' : undefined}>
      <div className="tr-frame">
        {m.kind === 'img' ? (
          <img src={m.src} width={m.w} height={m.h} alt={m.alt[l]} loading="lazy" decoding="async" data-pixel={m.pixel ? '' : undefined} />
        ) : (
          <video src={m.src} poster={m.poster} width={m.w} height={m.h} autoPlay muted loop playsInline preload="metadata" aria-label={m.alt[l]} />
        )}
      </div>
      <figcaption>{m.cap[l]}</figcaption>
    </figure>
  );
}

const anchor = (v: string) => `v-${v.toLowerCase().replace(/[^a-z0-9가-힣]+/g, '-').replace(/^-|-$/g, '')}`;

export default async function TrialsPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  if (!isSlug(slug)) notFound();
  const l = pick(locale);
  const c = TRIALS[slug][l];
  const t = TRIAL_LABELS[l];
  const others = TRIAL_SLUGS.filter((s) => s !== slug).map((s) => TRIALS[s][l]);
  const ld = {
    '@type': 'Article',
    '@id': `${SITE}/${l}/trials/${slug}/`,
    headline: c.title,
    description: c.meta.description,
    inLanguage: l,
    dateModified: TRIALS_AS_OF,
    author: { '@id': `${SITE}/#person` },
    publisher: { '@id': `${SITE}/#org` },
  };
  return (
    <div className="tr" data-ko={l === 'ko' ? '' : undefined}>
      <script type="application/ld+json" dangerouslySetInnerHTML={ldScript(ld)} />
      <header className="tr-hero">
        <div className="tr-wrap">
          <a className="tr-back" href="../../">{t.back}</a>
          <p className="tr-eyebrow">{c.eyebrow}</p>
          <h1 className="tr-title">{c.title}</h1>
          <div className="tr-lead">{c.lead.map((p) => <p key={p}>{p}</p>)}</div>
          <dl className="tr-stats">
            {c.stats.map((s) => (
              <div key={s.l}><dt>{s.n}</dt><dd>{s.l}</dd></div>
            ))}
          </dl>
          <p className="tr-asof">{t.updated} <time dateTime={TRIALS_AS_OF}>{TRIALS_AS_OF}</time></p>
        </div>
      </header>

      <nav className="tr-jump" aria-label={t.jump}>
        <div className="tr-wrap">
          <span className="tr-jump-label">{t.jump}</span>
          <ol>
            {c.versions.map((v) => (
              <li key={v.v}><a href={`#${anchor(v.v)}`} data-now={v.now ? '' : undefined}>{v.v}</a></li>
            ))}
          </ol>
        </div>
      </nav>

      <main className="tr-wrap">
        {c.rule && (
          <aside className="tr-rule">
            <h2>{c.rule.title}</h2>
            <p>{c.rule.body}</p>
          </aside>
        )}

        <ol className="tr-vers">
          {c.versions.map((v, i) => (
            <li key={v.v} id={anchor(v.v)} className="tr-ver" data-now={v.now ? '' : undefined}>
              <div className="tr-ver-head">
                <span className="tr-ver-n" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                <span className="tr-ver-v">{v.v}</span>
                <div className="tr-ver-t">
                  <h2>{v.title}</h2>
                  <p className="tr-when">{v.when}{v.now && <span className="tr-now">{t.now}</span>}</p>
                </div>
              </div>
              {v.media && (
                <div className="tr-media" data-n={v.media.length}>
                  {v.media.map((m, j) => <Figure key={j} m={m} l={l} />)}
                </div>
              )}
              <div className="tr-ver-body">
                <section className="tr-block">
                  <h3>{t.tried}</h3>
                  <p>{v.tried}</p>
                </section>
                {v.hit && (
                  <section className="tr-block">
                    <h3>{t.hit}</h3>
                    <ul className="tr-hits">{v.hit.map((h) => <li key={h}>{h}</li>)}</ul>
                  </section>
                )}
                {v.short && (
                  <section className="tr-block tr-short">
                    <h3>{t.short}</h3>
                    <p>{v.short}</p>
                  </section>
                )}
              </div>
              {v.next && (
                <p className="tr-next"><span aria-hidden="true">↓</span><span>{v.next}</span></p>
              )}
            </li>
          ))}
        </ol>

        {[c.limits, c.lessons].filter(Boolean).map((box) => (
          <section key={box!.title} className="tr-box">
            <h2>{box!.title}</h2>
            <ul>{box!.items.map((x) => <li key={x}>{x}</li>)}</ul>
          </section>
        ))}

        <section className="tr-more">
          <div className="tr-links">
            {c.links.map((x) => <a key={x.href} href={x.href}>{x.label} <span aria-hidden="true">→</span></a>)}
          </div>
          <h2>{t.others}</h2>
          <div className="tr-others">
            {others.map((o) => (
              <a key={o.slug} href={`../${o.slug}/`}>
                <span className="tr-o-code">{o.code}</span>
                <span className="tr-o-name">{o.title}</span>
                <span className="tr-o-n">{o.versions.map((v) => v.v).join(' · ')}</span>
              </a>
            ))}
          </div>
        </section>
      </main>

      <footer className="tr-foot">
        <div className="tr-wrap">© 2026 QMINLAB · <a href={`mailto:${EMAIL}`}>{EMAIL}</a></div>
      </footer>
    </div>
  );
}
