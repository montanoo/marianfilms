// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  // Canonical apex domain — drives every canonical/OG/sitemap URL. www redirects
  // here (Cloudflare redirect rule), so SEO consolidates to one host.
  site: 'https://marianfilms.com',
  image: {
    layout: 'constrained',
    responsiveStyles: false,
  },
  vite: {
    plugins: [tailwindcss()]
  }
});