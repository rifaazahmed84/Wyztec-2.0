import fs from 'node:fs/promises';
for (const name of ['home', 'products', 'marathon-ie4-motor']) {
  const html = await fs.readFile(`.qa/lighthouse-${name}.html`, 'utf8');
  const start = html.indexOf('window.__LIGHTHOUSE_JSON__ = ');
  const end = html.indexOf('</script>', start);
  const source = html
    .slice(start + 'window.__LIGHTHOUSE_JSON__ = '.length, end)
    .trim()
    .replace(/;$/, '');
  try {
    const lhr = JSON.parse(source);
    console.log(
      JSON.stringify(
        {
          name,
          error: lhr.runtimeError?.message,
          warnings: lhr.runWarnings,
          failed: Object.entries(lhr.audits)
            .filter(
              ([, a]) =>
                a.score === 0 &&
                a.scoreDisplayMode !== 'notApplicable' &&
                a.scoreDisplayMode !== 'informative',
            )
            .map(([key, a]) => ({
              key,
              title: a.title,
              displayValue: a.displayValue,
              items: a.details?.items?.slice(0, 2),
            })),
        },
        null,
        2,
      ),
    );
  } catch (error) {
    console.error(error.message, source.slice(0, 100));
  }
}
