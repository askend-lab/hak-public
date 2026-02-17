# Agregeeritud leiud: SEO ja jõudlus

**Deduplikeeritud leiud 51 auditifailist, grupeeritud teemade kaupa.**
**Iga leid näitab, mitu originaalset kirjet sellele viitab.**

---

## 1. `<title>` on staatiline "HAK"

**Viited: 6 kirjet** — #14, #20, C02, C07, C22, C23

`useDocumentTitle` seab lehe pealkirja, aga HTML `<title>` on algselt "HAK". Peaks olema "Hääldusabiline — Eesti keele häälduse harjutamine".

- [ ] `<title>` parandamine index.html-is
- [ ] `useDocumentTitle` väljundite ülevaatus

**Hinnang:** 30 minutit | **Prioriteet:** P0

---

## 2. `<meta name="description">` puudub

**Viited: 6 kirjet** — #14, #20, C02, C07, C22, C23

Google ei saa kuvada kirjeldust otsingutulemustes. Pole Open Graph ega Twitter Card meta tag'e.

- [ ] `<meta name="description" content="...">`
- [ ] Open Graph tag'id: `og:title`, `og:description`, `og:image`
- [ ] Twitter Card tag'id

**Hinnang:** 30 minutit | **Prioriteet:** P0

---

## 3. SPA ei ole otsimootoritele ligipääsetav

**Viited: 5 kirjet** — #14, C02, C08, C22, C25

React SPA ei renderda serveripoolselt. Googlebot suudab SPA-d indekseerida, aga teised otsingumootorid (Bing, Yandex) mitte.

- [ ] Prerendering teenus (prerender.io, rendertron)
- [ ] Või: SSR (Next.js migratsioon — suur maht)

**Hinnang:** 2–3 päeva (prerendering) | **Prioriteet:** P2

---

## 4. robots.txt puudub

**Viited: 3 kirjet** — C02, C22, C25

Pole `robots.txt` faili. Otsingumootorid ei tea, milliseid lehti indekseerida.

- [ ] `public/robots.txt` koos sitemap viitega

**Hinnang:** 15 minutit | **Prioriteet:** P1

---

## 5. sitemap.xml puudub

**Viited: 3 kirjet** — C02, C22, C25

Pole `sitemap.xml` faili. Otsingumootorid ei tea kõiki lehekülgi.

- [ ] `public/sitemap.xml` staatiliste lehtedega

**Hinnang:** 15 minutit | **Prioriteet:** P1

---

## 6. Structured Data (JSON-LD) puudub

**Viited: 3 kirjet** — #14, C02, C22

Pole Schema.org märgistust. Google ei kuva rikkalikke tulemusi (rich snippets).

- [ ] JSON-LD: `WebApplication`, `EducationalApplication`

**Hinnang:** 1 päev | **Prioriteet:** P2

---

## 7. CloudFront audio jaoks puudub

**Viited: 5 kirjet** — #20, C03, C08, C14, C22

Audio serveeritakse otse S3-st (PublicReadGetObject). CloudFront vähendaks latentsust ja data transfer kulu.

- [ ] CloudFront distribution audio bucket'ile
- [ ] S3 public access eemaldamine → OAI kaudu

**Hinnang:** 1 päev | **Prioriteet:** P2

---

## 8. Bundle size pole jälgitud

**Viited: 4 kirjet** — #20, C02, C20, C24

Pole automaatset kontrolli, et frontend bundle ei kasvaks liiga suureks.

- [ ] bundlesize CI kontroll: max 200KB gzipped
- [ ] Code splitting kriitiliste teede jaoks

**Hinnang:** 0.5 päeva | **Prioriteet:** P2

---

## 9. Canonical URL-id puuduvad

**Viited: 2 kirjet** — C02, C22

SPA URL-id (`/synthesis`, `/tasks`) pole canonical link'iga märgistatud. Duplikaatne sisu oht.

- [ ] `<link rel="canonical">` igale lehele

**Hinnang:** 30 minutit | **Prioriteet:** P2

---

## 10. Lambda cold start optimeerimine

**Viited: 4 kirjet** — #20, C03, C08, C09

Lambda cold start lisab ~200-500ms latentsust. Pole provisioned concurrency'd ega muid optimeerimisi.

- [ ] Provisioned concurrency kriitilistele Lambda funktsioonidele (kaaluda)
- [ ] Või: Lambda SnapStart (Java ainult, pole rakendatav)

**Hinnang:** 0.5 päeva | **Prioriteet:** P2

---

## Kokkuvõte

| # | Leid | Viiteid | Prioriteet |
|---|------|---------|-----------|
| 1 | `<title>` parandamine | 6 | P0 |
| 2 | Meta description + OG tags | 6 | P0 |
| 3 | SPA prerendering | 5 | P2 |
| 4 | robots.txt | 3 | P1 |
| 5 | sitemap.xml | 3 | P1 |
| 6 | Structured Data | 3 | P2 |
| 7 | CloudFront audio jaoks | 5 | P2 |
| 8 | Bundle size monitoring | 4 | P2 |
| 9 | Canonical URL-id | 2 | P2 |
| 10 | Lambda cold start | 4 | P2 |
| **Kokku** | **10 unikaalset leidu** | **41 originaalkirjet** | |
