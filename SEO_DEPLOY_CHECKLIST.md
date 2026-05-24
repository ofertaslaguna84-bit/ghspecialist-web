# Checklist SEO post-deploy — ghspecialist.com

Ejecutar después de cada deploy significativo del blog o cambios SEO.

## Google Search Console

- [ ] Verificar propiedad `https://ghspecialist.com` (DNS o archivo HTML)
- [ ] Enviar sitemap: `https://ghspecialist.com/sitemap.xml`
- [ ] Inspección de URL → Solicitar indexación:
  - [ ] `https://ghspecialist.com/`
  - [ ] `https://ghspecialist.com/blog/`
  - [ ] `https://ghspecialist.com/blog/como-automatizar-negocio-inteligencia-artificial.html`
  - [ ] Cada artículo nuevo publicado

## Validación técnica

- [ ] [Rich Results Test](https://search.google.com/test/rich-results) — validar Article, FAQPage, LocalBusiness en home
- [ ] [PageSpeed Insights](https://pagespeed.web.dev/) — home y 1–2 artículos del blog
- [ ] Verificar `https://ghspecialist.com/robots.txt` accesible
- [ ] Verificar `https://ghspecialist.com/blog/feed.xml` accesible (RSS)
- [ ] Probar compartir en WhatsApp/LinkedIn — preview OG correcto

## Analytics

- [ ] GA4 (`G-76XN5538Y8`) — confirmar pageviews en `/blog/` y artículos nuevos
- [ ] Revisar en 7 días: impresiones y clics en Search Console por URL del blog

## Mantenimiento al publicar artículo

1. Crear `blog/[slug].html` desde `blog/_template.html`
2. Añadir card en `blog/index.html`
3. `node scripts/generate-seo.mjs`
4. Push a `main`
5. Solicitar indexación del URL nuevo en Search Console
