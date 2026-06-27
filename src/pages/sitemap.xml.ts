import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

// Static XML sitemap of every page, built from the content collections + the
// fixed section routes. `site` comes from astro.config (`site:`), so the URLs
// are absolute. Submit /sitemap.xml in Google Search Console.
export const GET: APIRoute = async ({ site }) => {
  const origin = (site ?? new URL('https://marianfilms.com')).origin;

  const [videos, photos, designs] = await Promise.all([
    getCollection('video'),
    getCollection('photo'),
    getCollection('design'),
  ]);

  const paths = [
    '/',
    '/video',
    '/photo',
    '/design',
    '/about',
    ...videos.map((e) => `/video/${e.id}`),
    ...photos.map((e) => `/photo/${e.id}`),
    ...designs.map((e) => `/design/${e.id}`),
  ];

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${paths.map((p) => `  <url><loc>${origin}${p}</loc></url>`).join('\n')}
</urlset>
`;

  return new Response(body, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
