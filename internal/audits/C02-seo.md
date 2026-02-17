# Checklist: SEO (Otsingumootori optimeerimine)

**Tüüp:** Tehniline kontrollnimekiri
**Audiitor:** Luna | **Kuupäev:** 2026-02-17
**Meetod:** Lähtekoodi analüüs — index.html, meta-tag'id, marsruutimine, SPA renderdamine.

---

## HTML ja meta-tag'id

- [x] **1.1. `lang="et"` atribuut** — `<html lang="et">` on olemas. Otsingumootorid tunnevad keele.
- [ ] **1.2. `<title>` on staatiline "HAK"** — `index.html` seab `<title>HAK</title>`. JavaScript uuendab seda `useDocumentTitle` hook'iga, aga otsingumootorite robotid (ilma JS-ita) näevad ainult "HAK". Peaks olema kirjeldav: "Hääldusabiline — Eesti keele häälduse harjutamine".
  **Soovitus:** Muuda `index.html` title kirjeldavamaks. Või kasuta prerendering'ut.
- [ ] **1.3. Puudub `<meta name="description">`** — pole meta-kirjeldust. Otsingumootorid genereerivad kirjelduse ise lehe sisust. SPA-l pole sisu ilma JS-ita.
  **Soovitus:** Lisa `<meta name="description" content="Hääldusabiline on EKI tasuta veebirakendus eesti keele häälduse harjutamiseks ja kõnesünteesiks.">`.
- [ ] **1.4. Puuduvad Open Graph meta-tag'id** — pole `og:title`, `og:description`, `og:image`, `og:url`. Jagamisel (Facebook, LinkedIn, Slack) pole eelvaadet.
  **Soovitus:** Lisa OG tag'id `index.html` head'i.
- [ ] **1.5. Puuduvad Twitter Card meta-tag'id** — pole `twitter:card`, `twitter:title`, `twitter:description`.
  **Soovitus:** Lisa Twitter Card tag'id.
- [x] **1.6. Viewport meta** — `<meta name="viewport" content="width=device-width, initial-scale=1.0">` on olemas.
- [x] **1.7. Charset** — `<meta charset="UTF-8">` on olemas.

## Marsruutimine ja dünaamilised title'd

- [x] **2.1. useDocumentTitle hook** — igal lehel on oma `document.title`: "Hääldusabiline – Tekst kõneks", "– Ülesanded", "– Privaatsuspoliitika" jne. Hea JS-põhisele SEO-le.
- [x] **2.2. Nested route title'd** — `/tasks/:id` saab "Hääldusabiline – Ülesanne". Dünaamiline title töötab.
- [ ] **2.3. Puudub canonical URL** — pole `<link rel="canonical">` tag'i. Duplikaadilehe oht on madal (SPA), aga canonical on hea tava.
  **Soovitus:** Lisa `<link rel="canonical" href="https://haaldusabiline.ee/">` (dünaamiliselt marsruudi järgi).

## SPA ja renderdamine

- [ ] **3.1. SPA pole otsingumootorite jaoks renderdatud** — React SPA nõuab JavaScript'i sisu renderdamiseks. Googlebot suudab JS-i renderdada, aga teised otsingumootorid (Bing, Yandex) ei pruugi. Puudub SSR (Server-Side Rendering) ja prerendering.
  **Soovitus:** Kaaluda prerendering teenust (prerender.io, Rendertron) CloudFront'i taga. Või kasutada meta-tag'ide renderdamiseks lihtsat prerender'it.
- [ ] **3.2. Puudub `robots.txt`** — pole `public/robots.txt` faili. Otsingumootorid ei tea, milliseid lehti indekseerida.
  **Soovitus:** Lisa `public/robots.txt`:
  ```
  User-agent: *
  Allow: /
  Disallow: /auth/
  Disallow: /dashboard
  Sitemap: https://haaldusabiline.ee/sitemap.xml
  ```
- [ ] **3.3. Puudub `sitemap.xml`** — pole saidikaardi faili. Otsingumootorid ei tea kõiki lehti.
  **Soovitus:** Lisa staatiline `sitemap.xml` põhilehtedega: /, /synthesis, /tasks, /privacy, /accessibility.
- [ ] **3.4. Puudub `manifest.json` (PWA)** — pole Web App Manifest'i. "Lisa avakuvale" ei tööta. Pole PWA metaandmeid.
  **Soovitus:** Lisa `manifest.json` PWA toetuseks.

## Struktuurne andmed (Structured Data)

- [ ] **4.1. Puudub Schema.org märgistus** — pole JSON-LD struktureeritud andmeid. Otsingumootorid ei saa aru, et see on haridusplatvorm.
  **Soovitus:** Lisa `<script type="application/ld+json">` koos `WebApplication` ja `EducationalOrganization` schema'ga.
- [ ] **4.2. Puudub breadcrumb schema** — pole navigatsiooni struktuuriandmeid.
  **Soovitus:** Lisa `BreadcrumbList` schema ülesannete detailvaatele.

## Jõudlus (Core Web Vitals)

- [x] **5.1. Lazy loading komponentidele** — `React.lazy()` vähendab esmast bundle'it. LCP peaks olema hea.
- [ ] **5.2. Google Fonts blokeerib renderdamist** — `<link href="https://fonts.googleapis.com/...">` on render-blocking. Pole `preload` ega `font-display: swap`.
  **Soovitus:** Lisa `rel="preload"` ja `font-display=swap` fondi URL-ile. Või self-host'i fonti.
- [ ] **5.3. CSP meta-tag on pikk** — pikk CSP string `<meta>` tag'is. Pole jõudlusprobleem, aga HTTP header oleks parem SEO jaoks (väiksem HTML).
  **Soovitus:** Liiguta CSP CloudFront'i response header'isse.

## Ligipääsetavus (SEO boonused)

- [x] **6.1. Semantiline HTML** — `<nav>`, `<main>`, `<footer>`, `<h1>`–`<h4>`, `<button>`, `role` atribuudid. Otsingumootorid mõistavad sisu struktuuri.
- [x] **6.2. Skip link** — `<a href="#main-content">Liigu põhisisu juurde</a>`. Ligipääsetavuse boonuspunkt.
- [x] **6.3. Alt-tekst logol** — `alt="EKI Logo"` on olemas.

---

## Kokkuvõte

| Kategooria | Punktid | ✅ Hea | ⚠️ Puudub |
|------------|---------|--------|-----------|
| HTML ja meta-tag'id | 7 | 3 | 4 |
| Marsruutimine | 3 | 2 | 1 |
| SPA renderdamine | 4 | 0 | 4 |
| Struktuurne andmed | 2 | 0 | 2 |
| Jõudlus (CWV) | 3 | 1 | 2 |
| Ligipääsetavus | 3 | 3 | 0 |
| **Kokku** | **22** | **9** | **13** |

## Prioriteedid

1. **P0:** `<meta name="description">` ja `<title>` parandamine — 30 minutit
2. **P0:** Open Graph tag'id — 30 minutit
3. **P1:** `robots.txt` ja `sitemap.xml` — 1 tund
4. **P1:** Google Fonts preload/self-host — 1 tund
5. **P2:** Prerendering teenus — 2–3 päeva
6. **P2:** Schema.org märgistus — 2 tundi
