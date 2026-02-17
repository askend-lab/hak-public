# Agregeeritud leiud: Keeleline täpsus ja TTS

**Deduplikeeritud leiud 51 auditifailist, grupeeritud teemade kaupa.**
**Iga leid näitab, mitu originaalset kirjet sellele viitab.**

---

## 1. Hääle valik puudub UI-s

**Viited: 14 kirjet** — #1, #2, #3, #5, #8, #13, #14, #18, #21, #23, #25, C07, C21, C22

Backend toetab `voice` parameetrit, aga frontendis pole hääle valikut (mees/naine).

- [ ] Hääle valiku dropdown

**Hinnang:** 1–2 päeva | **Prioriteet:** P0
*Vt ka A01 #1*

---

## 2. Kiiruse reguleerija puudub UI-s

**Viited: 10 kirjet** — #1, #2, #5, #8, #13, #18, #23, C07, C21, C22

Backend toetab `speed` parameetrit. Keeleõppija vajab aeglasemat kõnet (0.5x–0.75x).

- [ ] Kiiruse liugur (0.5x – 2.0x)

**Hinnang:** 1 päev | **Prioriteet:** P0
*Vt ka A01 #1*

---

## 3. Foneetiliste märkide selgitused puuduvad

**Viited: 8 kirjet** — #1, #5, #8, #13, #18, C07, C21, C22

Variantide paneel näitab foneetilist märgistust (`<` = Q3, `]` = palatalisatsioon), aga kasutajale pole selgitust, mida need tähendavad. Lingvist mõistab, keeleõppija mitte.

- [ ] Tooltip'id foneetiliste märkide juurde
- [ ] "Mida need märgid tähendavad?" link

**Hinnang:** 1 päev | **Prioriteet:** P1

---

## 4. "Normatiivne hääldus" märge puudub

**Viited: 5 kirjet** — #8, #9, #13, C07, C21

Variantide seas pole selget märget, milline variant on EKI soovituslik/normatiivne.

- [ ] "Soovituslik" märge esimesele variandile
- [ ] Selgitus: "Mõnedel sõnadel on mitu lubatud hääldust"

**Hinnang:** 0.5 päeva | **Prioriteet:** P2

---

## 5. Võõrsõnade ja nimede hääldus

**Viited: 6 kirjet** — #3, #8, #14, #25, C21, C22

Võõrsõnad (JavaScript, Wi-Fi, email), nimed (Žanna, Pokémon) ja lühendid (EKI, HTM) — Vabamorf ei tunne neid. Hääldus võib olla vale.

- [ ] Tundmatute sõnade käsitlus ja kasutajale teade
- [ ] Lühendite hääldusreeglid
- [ ] Võõrsõnade häälduse kohandamine

**Hinnang:** 3–5 päeva | **Prioriteet:** P2

---

## 6. Numbrite ja kuupäevade hääldus

**Viited: 4 kirjet** — #8, #25, C07, C21

"123" → "sada kakskümmend kolm"? "1." → "esimene"? "2026" → "kaks tuhat kakskümmend kuus"?

- [ ] Numbrite hääldusreeglite testimine ja dokumenteerimine
- [ ] Kuupäevade ja rahasummade hääldus

**Hinnang:** 2–3 päeva | **Prioriteet:** P2

---

## 7. Homonüümide eristamine

**Viited: 4 kirjet** — #8, #13, C07, C21

Eesti keeles on homonüümid ("linn" vs "lina omastav"). Kas Vabamorf pakub mõlemat varianti? Kas kasutaja saab valida kontekstipõhiselt?

- [ ] Homonüümide kontekstipõhine eristamine (tulevikus)

**Hinnang:** 5+ päeva | **Prioriteet:** P3

---

## 8. Lauseintonatsioon

**Viited: 3 kirjet** — #8, C07, C21

Kas TTS eristab küsilauset, käsklauset, hüüdlauset? "Tere!" vs "Tere?" vs "Tere."

- [ ] Intonatsiooni testimine eri kirjavahemärkidega

**Hinnang:** 1 päev (testimine) | **Prioriteet:** P2

---

## 9. IPA (International Phonetic Alphabet) väljund puudub

**Viited: 4 kirjet** — #3, #8, #17, C21

Foneetiline kuju kasutab eesti-spetsiifilist märgistust. Rahvusvaheline foneetik (IPA) puudub. Akadeemilised kasutajad ja välismaised uurijad vajavad IPA-d.

- [ ] IPA väljundi lisamine variantide paneelile (valikuline)

**Hinnang:** 3–5 päeva | **Prioriteet:** P3

---

## 10. TTS kvaliteedi hindamine puudub

**Viited: 4 kirjet** — #8, #23, C21, C22

Pole dokumenteeritud MOS (Mean Opinion Score) ega muu kvaliteedimõõdiku tulemust.

- [ ] Kvaliteediuuring: 10 testilauset, 5 hindajat, MOS skaala
- [ ] Dokumenteeri tulemused

**Hinnang:** 2–3 päeva | **Prioriteet:** P2

---

## 11. Erijuhtumite käsitlus (tühi sisend, emojid, segakeel)

**Viited: 5 kirjet** — #3, #16, C14, C18, C21

Mis juhtub: tühi sisend, ainult kirjavahemärgid, emojid, segakeelne tekst, eriti pikk tekst?

- [ ] Edge case testimine ja käsitlus
- [ ] Selged veateated erijuhtumitele

**Hinnang:** 1–2 päeva | **Prioriteet:** P1

---

## 12. Hääle salvestamise ja võrdlemise funktsioon puudub

**Viited: 6 kirjet** — #1, #2, #4, #8, #13, #23

Kasutaja ei saa oma hääldust salvestada ja TTS-iga võrrelda. Keeleõppe kontekstis on see oluline.

- [ ] Mikrofoni-nupp oma häälduse salvestamiseks
- [ ] Kõrvuti kuulamine: TTS vs kasutaja

**Hinnang:** 5–10 päeva | **Prioriteet:** P2

---

## Kokkuvõte

| # | Leid | Viiteid | Prioriteet |
|---|------|---------|-----------|
| 1 | Hääle valik UI-s | 14 | P0 |
| 2 | Kiiruse reguleerija | 10 | P0 |
| 3 | Foneetiliste märkide selgitused | 8 | P1 |
| 4 | "Normatiivne hääldus" märge | 5 | P2 |
| 5 | Võõrsõnade hääldus | 6 | P2 |
| 6 | Numbrite/kuupäevade hääldus | 4 | P2 |
| 7 | Homonüümide eristamine | 4 | P3 |
| 8 | Lauseintonatsioon | 3 | P2 |
| 9 | IPA väljund | 4 | P3 |
| 10 | TTS kvaliteedi hindamine | 4 | P2 |
| 11 | Erijuhtumite käsitlus | 5 | P1 |
| 12 | Hääle salvestamine ja võrdlemine | 6 | P2 |
| **Kokku** | **12 unikaalset leidu** | **73 originaalkirjet** | |
