import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { company } from '../config';
export default function SEO({
  title,
  description,
  jsonLd,
  noindex = false,
}: {
  title: string;
  description: string;
  jsonLd?: object;
  noindex?: boolean;
}) {
  const { pathname } = useLocation();
  const canonical = company.url.replace(/\/$/, '') + pathname;
  return (
    <Helmet>
      <title>{title} | Wyztec</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={`${title} | Wyztec`} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={`${company.url}/images/industrial-hero.webp`} />
      <link rel="canonical" href={canonical} />
      {noindex && <meta name="robots" content="noindex,follow" />}
      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(jsonLd).replace(/</g, '\\u003c')}
        </script>
      )}
    </Helmet>
  );
}
