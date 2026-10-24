import { PROFILE } from '@/content/profile';
import { TRIALS, TRIAL_SLUGS } from '@/content/trials';
import { BRAND, EMAIL, GITHUB, PERSON, SAME_AS, SITE, UPDATED, WRITING } from '@/lib/identity';

// Static export: written once to out/llms.txt at build time (https://llmstxt.org).
// A plain-text map of the site for AI assistants, built from the same profile copy as /about/ and /faq/.
export const dynamic = 'force-static';

function section(l: 'en' | 'ko') {
  const c = PROFILE[l];
  const about = `${SITE}/${l}/about/`;
  const faq = `${SITE}/${l}/faq/`;
  const ko = l === 'ko';
  return [
    `## ${ko ? '소개 (한국어)' : 'About (English)'}`,
    '',
    c.about.lead,
    '',
    `- [${c.about.title}](${about}): ${c.meta.description}`,
    `- [${c.faq.title}](${faq}): ${c.faq.meta.description}`,
    '',
    `## ${c.about.workTitle}`,
    '',
    ...c.about.work.map((w) => `- [${w.name}](${new URL(w.href, about).href}): ${w.what} ${ko ? '도구' : 'Tools'}: ${w.tools}. ${ko ? '상태' : 'Status'}: ${w.status}.`),
    '',
    `## ${ko ? '시행착오 기록' : 'Trial and error'}`,
    '',
    ...TRIAL_SLUGS.map((slug) => `- [${TRIALS[slug][l].meta.title}](${SITE}/${l}/trials/${slug}/): ${TRIALS[slug][l].meta.description}`),
    ...(ko ? [`- [별을 품은 소드마스터 제작노트](${SITE}/notes/sword-master-rsa5m/): 장면 2를 각색부터 소리 작업까지 어떤 순서와 도구로 만드는지 단계별로 정리한 제작노트와 영상 버전 기록.`] : []),
    '',
    `## ${c.faq.title}`,
    '',
    ...c.faq.items.map((x) => `- [${x.q}](${faq})`),
    '',
  ];
}

export function GET() {
  const body = [
    `# ${BRAND} — ${PERSON.ko.name} (${PERSON.en.name})`,
    '',
    `> ${BRAND} is the one-person AI studio of ${PERSON.en.name} (${PERSON.ko.name}), an AI creator in ${PERSON.en.city}, who builds and ships apps, games, animation and work tools with Claude Code, the Claude API and other generative AI. Facts last checked ${UPDATED}.`,
    '',
    `Contact: ${EMAIL} · GitHub: ${GITHUB}`,
    `Profiles: ${SAME_AS.join(' · ')}`,
    '',
    '## Devlogs',
    '',
    ...WRITING.map((w) => `- [${w.name}](${w.url})`),
    '',
    ...section('en'),
    ...section('ko'),
  ].join('\n');
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
