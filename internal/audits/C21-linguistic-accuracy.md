# Checklist: Keeleline täpsus (Linguistic Accuracy)

**Tüüp:** Keeleteaduslik kontrollnimekiri
**Audiitor:** Luna | **Kuupäev:** 2026-02-17
**Meetod:** Lähtekoodi analüüs — Vabamorf'i integratsioon, foneetiline märgistus, TTS kvaliteet, erijuhtumid.

---

## Vabamorf'i integratsioon

- [x] **1.1. Foneetiline analüüs on implementeeritud** — `analyzeText()` saadab teksti `/api/analyze` endpointile, mis tagastab `stressedText` foneetilise märgistusega.
- [x] **1.2. Foneetiliste märkide teisendamine** — `phoneticMarkers.ts` defineerib `MARKER_MAPPING` (Vabamorf → UI) ja `REVERSE_MARKER_MAPPING` (UI → Vabamorf). Kolm väldet, palatalisatsioon, liitsõnapiir on kaetud.
- [x] **1.3. Testid foneetilistele teisendamistele** — `phoneticMarkers.test.ts` sisaldab põhjalikke teste: `transformToUI`, `transformToVabamorf`, `stripPhoneticMarkers`, `isVabamorfMarker`.
- [ ] **1.4. Vabamorf'i tundmatute sõnade käsitlus** — kui Vabamorf ei tunne sõna (võõrsõnad, nimed, neologismid), mis juhtub? Kas kasutajale kuvatakse selge teade? Kas TTS üritab ikkagi sünteesida?
  **Test:** Sisesta: "JavaScript", "TikTok", "Pokémon", "Žanna". Kontrolli tulemust.
- [ ] **1.5. Homonüümide eristamine** — eesti keeles on homonüümid: "linn" (linn vs lina omastav). Kas Vabamorf pakub mõlemat varianti? Kas kasutaja saab valida?
  **Test:** Sisesta homonüüme ja kontrolli hääldusvariantide paneeli.

## Foneetiline süsteem

- [x] **2.1. Kolm väldet** — eesti keele unikaalne joon. Q1 (lühike), Q2 (pikk), Q3 (ülipikk) on märgistuses kaetud.
- [x] **2.2. Palatalisatsioon** — peenendus on märgistuses olemas.
- [x] **2.3. Liitsõnapiir** — liitsõnade komponentide piir on märgistatud.
- [ ] **2.4. Rõhu asukoht** — kas Vabamorf märgib rõhu asukohta? Eesti keeles on rõhk tavaliselt esimesel silbil, aga võõrsõnades mitte (nt "proféssor", "ülikóol").
  **Mõju:** Keskmine — rõhk mõjutab TTS-i intonatsiooni.
- [ ] **2.5. Lauseintonatsioon** — kas TTS eristab küsilauset, käsklauset, hüüdlauset? "Tere!" vs "Tere?" vs "Tere."
  **Test:** Sünteesi sama lause eri kirjavahemärkidega ja võrdle.
- [ ] **2.6. Numbrite hääldus** — "123" → "sada kakskümmend kolm"? "1." → "esimene"? "2026" → "kaks tuhat kakskümmend kuus"?
  **Test:** Sisesta erinevat tüüpi numbreid: kardinaalsed, ordinaalsed, aastad, kuupäevad, rahasummad.
- [ ] **2.7. Lühendite hääldus** — "EKI" → tähthaaval? "HTM" → tähthaaval? "jne" → "ja nii edasi"?
  **Test:** Sisesta levinud lühendeid ja akronüüme.
- [ ] **2.8. Võõrsõnade hääldus** — "email" → "iimeil"? "Wi-Fi" → "vaifai"? Kas TTS kohandab võõrsõnade hääldust eesti fonoloogiale?
  **Test:** Sisesta levinud võõrsõnu.

## Hääldusvariantide paneel

- [x] **3.1. Variantide valik on olemas** — kasutaja saab valida erinevate hääldusvariantide vahel. Unikaalne funktsioon.
- [ ] **3.2. Variandid pole selgitatud** — kasutajale kuvatakse foneetiline märgistus, aga pole selgitust, mida märgid tähendavad. Keeleõppija ei mõista `<` (Q3) ega `]` (palatalisatsioon) tähendust.
  **Soovitus:** Lisa tooltip'id foneetiliste märkide juurde: "< = ülipikk hääldus (III välde)".
- [ ] **3.3. Puudub "Normatiivne hääldus" märge** — variantide seas pole selget märget, milline on EKI soovituslik/normatiivne hääldus.
  **Soovitus:** Lisa "Soovituslik" märge esimesele/normatiivusele variandile.
- [ ] **3.4. Puudub hääldusreeglite selgitus** — pole "Miks on mitu varianti?" selgitust. Lingvist mõistab, aga keeleõppija mitte.
  **Soovitus:** Lisa lühike selgitus: "Mõnedel sõnadel on mitu lubatud hääldust. Vali see, mida õpetaja soovitab."

## TTS kvaliteet

- [ ] **4.1. TTS hääle kvaliteet pole hinnatud** — pole dokumenteeritud TTS-i MOS (Mean Opinion Score) ega muu kvaliteedimõõdiku tulemust. Kas hääl on loomuliku kõlaga?
  **Soovitus:** Tee kvaliteediuuring: 10 testilauset, 5 hindajat, MOS skaala.
- [ ] **4.2. Ainult üks hääl** — pole mees/naine, noor/vana, dialekti valikut. Backend toetab `voice` parameetrit, aga frontendis pole valikut.
  **Soovitus:** Lisa hääle valik UI-sse (kui backend toetab mitut häält).
- [ ] **4.3. Kiiruse reguleerija puudub** — backend toetab `speed` parameetrit. Keeleõppija vajab aeglasemat kõnet. Frontendis pole liugurit.
  **Soovitus:** Lisa kiiruse liugur (0.5x – 2.0x).
- [x] **4.4. Audio on WAV formaadis** — lossless kvaliteet. Hea keeleõppe kontekstis.

## Erijuhtumid

- [ ] **5.1. Tühja sisendi käsitlus** — mis juhtub, kui kasutaja vajutab Enter tühja sisendiga? Kas kuvatakse veateade?
  **Test:** Vajuta Enter tühja väljaga.
- [ ] **5.2. Ainult kirjavahemärgid** — "..." → kas TTS üritab sünteesida? Kas kuvatakse veateade?
  **Test:** Sisesta ainult kirjavahemärke.
- [ ] **5.3. Segakeelne tekst** — "I want to say tere in Estonian" → kas TTS sünteesib kõik eesti keele fonoloogiaga?
  **Test:** Sisesta segakeelset teksti.
- [ ] **5.4. Eriti pikk tekst** — 1000+ sõna → kas TTS käsitleb? Kas on timeout?
  **Test:** Sisesta pikk tekst ja kontrolli käitumist.
- [ ] **5.5. Unicode erimärgid** — emojid 😊, matemaatilised sümbolid ∑, CJK tähemärgid 你好 → kuidas TTS käsitleb?
  **Test:** Sisesta erinevaid Unicode märke.

---

## Kokkuvõte

| Kategooria | Punktid | ✅ Hea | ⚠️ Puudub |
|------------|---------|--------|-----------|
| Vabamorf'i integratsioon | 5 | 3 | 2 |
| Foneetiline süsteem | 8 | 3 | 5 |
| Hääldusvariantide paneel | 4 | 1 | 3 |
| TTS kvaliteet | 4 | 1 | 3 |
| Erijuhtumid | 5 | 0 | 5 |
| **Kokku** | **26** | **8** | **18** |

## Prioriteedid

1. **P0:** Kiiruse reguleerija UI-sse — backend toetab juba (#4.3)
2. **P0:** Hääle valik UI-sse — backend toetab juba (#4.2)
3. **P1:** Foneetiliste märkide tooltip'id — kasutajasõbralikkus (#3.2)
4. **P1:** Numbrite ja lühendite häälduse testimine (#2.6, #2.7)
5. **P2:** "Normatiivne hääldus" märge (#3.3)
6. **P2:** TTS kvaliteediuuring (#4.1)
