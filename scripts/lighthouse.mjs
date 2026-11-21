import lighthouse from 'lighthouse';
import { launch } from 'chrome-launcher';
import fs from 'node:fs/promises';
await fs.mkdir('.qa', { recursive: true });
const chrome = await launch({
  chromePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  chromeFlags: ['--headless', '--no-first-run', '--disable-extensions'],
});
try {
  const results = [];
  for (const route of process.argv.slice(2).length
    ? process.argv.slice(2)
    : ['/', '/products', '/products/marathon-ie4-motor']) {
    const result = await lighthouse((process.env.QA_URL || 'http://localhost:3001') + route, {
      port: chrome.port,
      output: 'html',
      onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
    });
    if (!result) throw Error('No Lighthouse report');
    const scores = Object.fromEntries(
      Object.entries(result.lhr.categories).map(([key, value]) => [
        key,
        value.score === null ? null : Math.round(value.score * 100),
      ]),
    );
    results.push({
      route,
      scores,
      ...(result.lhr.runtimeError ? { error: result.lhr.runtimeError.message } : {}),
    });
    const name = route === '/' ? 'home' : route.split('/').pop();
    await fs.writeFile(`.qa/lighthouse-${name}.html`, result.report);
    if (result.lhr.runtimeError) {
      const trace = result.artifacts.Trace;
      await fs.writeFile(
        `.qa/trace-summary-${name}.json`,
        JSON.stringify(
          {
            keys: Object.keys(result.artifacts),
            events: trace?.traceEvents
              ?.filter((e) => /navigation|tracingstarted|markload|paint/i.test(e.name))
              .slice(0, 20),
            names: trace ? [...new Set(trace.traceEvents.map((e) => e.name))].slice(0, 100) : [],
          },
          null,
          2,
        ),
      );
    }
    console.log(route, scores, result.lhr.runtimeError?.message || '');
  }
  await fs.writeFile('.qa/lighthouse-results.json', JSON.stringify(results, null, 2));
  if (
    results.some(
      (r) => r.error || Object.values(r.scores).some((score) => score === null || score < 90),
    )
  )
    process.exitCode = 1;
} finally {
  await chrome.kill();
}
