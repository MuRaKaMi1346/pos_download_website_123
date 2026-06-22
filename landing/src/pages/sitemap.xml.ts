import type { APIRoute } from 'astro'

// Hand-rolled sitemap with hreflang alternates (landing brief §13). Replaces
// @astrojs/sitemap, which is incompatible with Astro 4.16 + i18n here.
const SITE = 'https://smartbrew.app'
const PAGES = ['/', '/en/']

const ALTERNATES = [
  `<xhtml:link rel="alternate" hreflang="th" href="${SITE}/"/>`,
  `<xhtml:link rel="alternate" hreflang="en" href="${SITE}/en/"/>`,
  `<xhtml:link rel="alternate" hreflang="x-default" href="${SITE}/"/>`,
].join('')

export const GET: APIRoute = () => {
  const urls = PAGES.map(
    (path) => `<url><loc>${SITE}${path}</loc>${ALTERNATES}<changefreq>weekly</changefreq></url>`,
  ).join('')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${urls}</urlset>`

  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } })
}
