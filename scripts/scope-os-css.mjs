// Scope src/styles/os.src.css under .qos so the Qmin OS home screen never styles the other pages.
// `:root`, `html`, `body` become the .qos root itself; a leading `.ios`/`.mc-on` state class attaches to it.
// Usage: node scripts/scope-os-css.mjs  (writes src/styles/os.css)
import { readFileSync, writeFileSync } from 'node:fs';
import postcss from 'postcss';

const ROOT = '.qos';
const STATES = ['.ios', '.mc-on'];
const src = new URL('../src/styles/os.src.css', import.meta.url);
const out = new URL('../src/styles/os.css', import.meta.url);

function scope(sel) {
  sel = sel.trim();
  if (sel === ':root' || sel === 'html' || sel === 'body') return ROOT;
  if (sel === '*') return `${ROOT}, ${ROOT} *`;
  const state = STATES.find((s) => sel === s || sel.startsWith(s + ' '));
  if (state) return ROOT + sel;
  return `${ROOT} ${sel}`;
}

const root = postcss.parse(readFileSync(src, 'utf8'));
root.walkRules((rule) => {
  if (rule.parent.type === 'atrule' && /keyframes$/.test(rule.parent.name)) return;
  rule.selectors = [...new Set(rule.selectors.flatMap((s) => scope(s).split(', ')))];
});
writeFileSync(out, `/* Generated from os.src.css by scripts/scope-os-css.mjs. Edit the source, then rerun the script. */\n${root.toString()}`);
