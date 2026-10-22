// `/` has no content of its own. On Cloudflare Pages functions/index.js redirects it at the edge;
// this page is the fallback (local `npm start`, or if the function is ever skipped).
export default function RootPage() {
  const script = `(function(){var m=/(?:^|; )lang=(en|ko)/.exec(document.cookie),l=m?m[1]:((navigator.languages&&navigator.languages[0])||navigator.language||'');location.replace(/^ko/i.test(l)?'/ko/':'/en/');})();`;
  return (
    <html lang="en">
      <head>
        <script dangerouslySetInnerHTML={{ __html: script }} />
        {/* Only without JavaScript, so it never races the language check above. */}
        <noscript><meta httpEquiv="refresh" content="0; url=/en/" /></noscript>
        <title>qminlab</title>
      </head>
      <body style={{ background: '#0C0D0B' }} />
    </html>
  );
}
