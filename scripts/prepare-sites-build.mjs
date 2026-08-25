#!/usr/bin/env node
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { SERVICE_PAGES } from "../service-pages.mjs";
import { SITE_URL } from "../site.config.mjs";
import { CONTACTS, buildWhatsAppUrl } from "../src/whatsapp.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");
const client = path.join(dist, "client");
const index = path.join(client, "index.html");
const worker = path.join(root, "worker", "index.js");
const hosting = path.join(root, ".openai", "hosting.json");

for (const file of [index, worker, hosting]) {
  if (!existsSync(file)) throw new Error("Missing Sites build input: " + file);
}

const siteUrl = SITE_URL.replace(/\/+$/, "");
const parsedSiteUrl = new URL(siteUrl);

if (parsedSiteUrl.protocol !== "https:") {
  throw new Error("SITE_URL must use HTTPS");
}

const builtHtml = readFileSync(index, "utf8");

if (!builtHtml.includes("__CKF_SITE_URL__")) {
  throw new Error("Missing CKF site URL placeholder in built index.html");
}

const stylesheetMatch = builtHtml.match(/<link rel="stylesheet"[^>]*href="([^"]+)"/);
if (!stylesheetMatch) {
  throw new Error("Missing Vite stylesheet in built index.html");
}

const stylesheetHref = stylesheetMatch[1];

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderServicePage(page) {
  const canonical = `${siteUrl}/servicos/${page.slug}`;
  const whatsapp = buildWhatsAppUrl({ service: page.ctaService });
  const servicesRows = page.services
    .map(([name, description]) => `
              <tr>
                <th scope="row">${escapeHtml(name)}</th>
                <td>${escapeHtml(description)}</td>
              </tr>`)
    .join("");
  const structuredData = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Service",
    name: page.heading,
    description: page.description,
    url: canonical,
    areaServed: {
      "@type": "City",
      name: "Itajaí",
    },
    provider: {
      "@type": "AutoRepair",
      name: "CKF Manutenção",
      url: siteUrl,
      telephone: "+55 47 99121-4232",
      address: {
        "@type": "PostalAddress",
        streetAddress: "Rodovia BR-101, 6780, Galpão 01, Sala 01",
        addressLocality: "Itajaí",
        addressRegion: "SC",
        postalCode: "88317-000",
        addressCountry: "BR",
      },
    },
  });

  return `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#090c0d" />
    <meta name="description" content="${escapeHtml(page.description)}" />
    <meta name="robots" content="index, follow" />
    <link rel="canonical" href="${canonical}" />
    <meta property="og:type" content="website" />
    <meta property="og:locale" content="pt_BR" />
    <meta property="og:site_name" content="CKF Manutenção" />
    <meta property="og:title" content="${escapeHtml(page.title)}" />
    <meta property="og:description" content="${escapeHtml(page.description)}" />
    <meta property="og:url" content="${canonical}" />
    <meta property="og:image" content="${siteUrl}${page.image}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(page.title)}" />
    <meta name="twitter:description" content="${escapeHtml(page.description)}" />
    <meta name="twitter:image" content="${siteUrl}${page.image}" />
    <link rel="icon" href="/assets/favicon.ico" sizes="any" />
    <link rel="icon" type="image/svg+xml" href="/assets/favicon.svg" />
    <link rel="stylesheet" href="${stylesheetHref}" />
    <link rel="stylesheet" href="/service-pages.css" />
    <script type="application/ld+json">${structuredData}</script>
    <title>${escapeHtml(page.title)}</title>
  </head>
  <body class="service-page">
    <main>
      <header class="topbar">
        <a class="brand" href="/" aria-label="CKF Manutenção - Início"><img src="/assets/logo-ckf.png" alt="CKF Manutenção" /></a>
        <nav aria-label="Navegação principal">
          <a class="service-page__nav" href="/#servicos">Serviços</a>
          <a class="service-page__nav" href="/#sobre">Quem somos</a>
          <a class="service-page__nav" href="/#localizacao">Localização</a>
          <a class="service-page__nav" href="/#contato">Contato</a>
        </nav>
        <a class="button button--small" href="${whatsapp}" target="_blank" rel="noreferrer">Pedir orçamento</a>
      </header>

      <section class="hero">
        <img src="${page.image}" alt="${escapeHtml(page.imageAlt)}" fetchpriority="high" />
        <div class="hero__content">
          <p class="eyebrow">${escapeHtml(page.eyebrow)}</p>
          <h1>${escapeHtml(page.heading)}</h1>
          <p>${escapeHtml(page.intro)}</p>
          <a class="button" href="${whatsapp}" target="_blank" rel="noreferrer">Solicitar orçamento</a>
        </div>
      </section>

      <section class="service-list" aria-labelledby="service-detail-title">
        <div class="section-shell service-list__layout">
          <div>
            <p class="eyebrow">Atendimento em Itajaí</p>
            <h2 id="service-detail-title">O que avaliamos no serviço.</h2>
            <p>A necessidade exata é definida depois de entender o equipamento, o problema e a condição encontrada no diagnóstico.</p>
            <p class="service-page__local">CKF Manutenção · Espinheiros · Itajaí/SC</p>
          </div>
          <div class="service-table-wrap service-page__table">
            <table>
              <thead><tr><th scope="col">Frente de serviço</th><th scope="col">Como ajudamos</th></tr></thead>
              <tbody>${servicesRows}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section class="contact">
        <div class="section-shell contact__wrap">
          <div>
            <div>
              <h2>Explique o cenário para a CKF.</h2>
              <p>Envie as informações do equipamento e do problema. A conversa já abre no WhatsApp com este serviço identificado.</p>
            </div>
          </div>
          <a class="button" href="${whatsapp}" target="_blank" rel="noreferrer">Solicitar orçamento</a>
        </div>
      </section>

      <footer>
        <div class="footer__inner section-shell">
          <div>
            <img src="/assets/logo-ckf.png" alt="CKF Manutenção" />
            <p>Manutenção pesada, recuperação e estruturas para operações que precisam continuar.</p>
          </div>
          <div>
            <h3>Fale com a gente</h3>
            <a href="${whatsapp}" target="_blank" rel="noreferrer">${CONTACTS.primary.label}</a>
            <p>Atendimento direto pelo WhatsApp.</p>
          </div>
          <div>
            <h3>Unidade</h3>
            <p>Rodovia BR-101, 6780<br />Galpão 01, Sala 01 · Espinheiros<br />Itajaí · SC · 88317-000</p>
          </div>
        </div>
      </footer>
    </main>
  </body>
</html>
`;
}

const publicIndexHtml = builtHtml.replaceAll("__CKF_SITE_URL__", siteUrl);
writeFileSync(index, publicIndexHtml);
writeFileSync(
  path.join(client, "robots.txt"),
  `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\n`,
);

for (const page of SERVICE_PAGES) {
  const pageDirectory = path.join(client, "servicos", page.slug);
  mkdirSync(pageDirectory, { recursive: true });
  writeFileSync(path.join(pageDirectory, "index.html"), renderServicePage(page));
}

const sitemapEntries = [
  { loc: siteUrl, priority: "1.0" },
  ...SERVICE_PAGES.map((page) => ({
    loc: `${siteUrl}/servicos/${page.slug}`,
    priority: "0.8",
  })),
]
  .map(({ loc, priority }) => `  <url>\n    <loc>${loc}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>${priority}</priority>\n  </url>`)
  .join("\n");

writeFileSync(
  path.join(client, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapEntries}\n</urlset>\n`,
);

mkdirSync(path.join(dist, "server"), { recursive: true });
mkdirSync(path.join(dist, ".openai"), { recursive: true });
copyFileSync(worker, path.join(dist, "server", "index.js"));
copyFileSync(hosting, path.join(dist, ".openai", "hosting.json"));

console.log(`Prepared Sites build with SEO outputs, ${SERVICE_PAGES.length} service pages and hosting files`);
