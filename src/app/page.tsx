// `/` has no content of its own: send visitors to their language (Korean browsers → /ko, everyone else → /en).
export default function RootPage() {
  const script = `(function(){var l=(navigator.languages&&navigator.languages[0])||navigator.language||'';location.replace(/^ko/i.test(l)?'/ko/':'/en/');})();`;
  return (
    <html lang="en">
      <head>
        <meta httpEquiv="refresh" content="0; url=/en/" />
        <script dangerouslySetInnerHTML={{ __html: script }} />
        <title>Qmin Lab</title>
      </head>
      <body style={{ background: '#0C0D0B' }} />
    </html>
  );
}
