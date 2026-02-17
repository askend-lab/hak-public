# Audit: Sisulooja / Podcaster

**Vaatenurk:** Sisulooja, kes kasutab platvormi eestikeelse heli genereerimiseks: podcastid, videod, e-õppe materjalid, audioraamatud, sotsiaalmeedia sisu.
**Audiitor:** Luna | **Kuupäev:** 2026-02-17
**Meetod:** Lähtekoodi analüüs — heli kvaliteet, ekspordi võimalused, masstootmine, autoriõigus, brändingu sobivus.

---

## Kasutajaprofiil

Kaarel, 27-aastane, sisulooja ja podcaster. Loob eestikeelseid harivaid videoid YouTube'is ja TikTokis. Tahab kasutada TTS-i jutustajana, sest tema eesti keele hääldus pole perfektne (emakeel vene). Vajab kvaliteetset heli, mitmeid hääleid ja lihtsat eksporti.

---

## Sisulooja teekond

### Etapp 1: Heli kvaliteet ja valik

- [x] **1.1. TTS heli kvaliteet** — platvorm kasutab EKI TTS-i, mis on eesti keele jaoks kõrge kvaliteediga. Hääldus on loomulik ja selge.

- [ ] **1.2. Puudub hääle valik** — ainult üks hääl. Sisulooja vajab mitmeid hääleid: mees, naine, noor, vana, formaalne, mitteformaalne. Backend toetab `voice` parameetrit, aga UI-s pole valikut.
  **Mõju:** Kõrge — sisulooja jaoks on hääle valik põhifunktsioon. Üks hääl piirab loomingulist vabadust.

- [ ] **1.3. Puudub kiiruse ja tooni reguleerija** — backend toetab `speed` ja `pitch` parameetreid. Sisulooja tahab: aeglasemat kõnet selgitusteks, kiiremat kõnet üleminekuteks, kõrgemat tooni rõhutamiseks.
  **Mõju:** Kõrge — prosoodia kontroll on sisulooja põhitööriist. Backend toetab, frontend mitte.

- [ ] **1.4. Puudub pauside kontroll** — sisulooja tahab lisada pause lausete vahele: lühike paus (0.5s), pikk paus (2s), hingamispaus. Pole SSML toetust ega manuaalset pauside kontrolli.
  **Mõju:** Kõrge — ilma pausideta kõlab TTS monotoonselt. Pausid on loomuliku kõne võtmelement.

- [ ] **1.5. Puudub emotsioonide kontroll** — pole viisi muuta kõne emotsionaalset tooni: rõõmus, kurb, üllatunud, tõsine. TTS loeb ette monotoonselt.
  **Mõju:** Keskmine — emotsioonide kontroll on TTS-i edasijõudnud funktsioon. Nõuab spetsiaalset mudelit.

### Etapp 2: Eksport ja formaat

- [x] **2.1. WAV eksport on olemas** — üksiku lause allalaadimine `.wav` formaadis. Kvaliteetne, kadudeta formaat.

- [x] **2.2. ZIP eksport ülesandega** — `downloadTaskAsZip` eksportib kogu ülesande: manifest.json, texts.txt, WAV failid. Sisulooja saab kõik helid korraga alla laadida.

- [ ] **2.3. Puudub MP3 eksport** — sisulooja vajab MP3-d (väiksem, universaalsem). WAV on liiga suur sotsiaalmeediasse laadimiseks. Pole formaadivalikut.
  **Mõju:** Keskmine — sisulooja peab ise WAV-i MP3-ks teisendama (Audacity, ffmpeg). Integreeritud teisendus oleks mugavam.

- [ ] **2.4. Puudub ühendatud audiofail** — sisulooja tahab kogu teksti üheks helifailiks liita (nt 10 lauset = 1 pikk helifail). Praegu on iga lause eraldi fail. Peab ise kokku liitma.
  **Mõju:** Keskmine — sisulooja kasutab audio editeerimise tarkvara, aga automaatne liitmine oleks mugavam.

- [ ] **2.5. Puudub SRT/VTT subtiitrite eksport** — sisulooja tahab genereerida subtiitreid video jaoks. Tekst on olemas, ajatemplid puuduvad. Pole subtiitrite formaadi eksporti.
  **Mõju:** Keskmine — subtiitrid on video sisu jaoks vajalikud. Automaatne genereerimine oleks väärtuslik.

### Etapp 3: Masstootmine

- [ ] **3.1. Puudub bulk sisestus** — sisulooja tahab kleepida 50 lauset korraga (nt stsenaarium). Praegu peab iga lause eraldi sisestama.
  **Mõju:** Kõrge — kordab auditi #2 leidu #2.3. Sisulooja jaoks on bulk sisestus kriitiline: stsenaariumid on pikad.

- [ ] **3.2. Puudub API ligipääs** — sisulooja tahab automatiseerida: skript, mis võtab tekstifaili ja genereerib kõik helifailid automaatselt. Pole avalikku API-t ega API-võtmeid.
  **Mõju:** Keskmine — API ligipääs võimaldaks automatiseerimist ja integratsiooni teiste tööriistadega.

- [ ] **3.3. Puudub projektide haldamine** — sisulooja töötab mitme projektiga paralleelselt (podcast episood 1, YouTube video 3, TikTok sari). Pole projektide/kaustade süsteemi. Kõik ülesanded on ühes nimekirjas.
  **Mõju:** Keskmine — kordab auditi #2 leidu #3.5. Sisulooja kontekstis on organisatsioon eriti oluline.

### Etapp 4: Autoriõigus ja kasutustingimused

- [ ] **4.1. Genereeritud heli kasutusõigused pole selged** — kas sisulooja tohib TTS-ga genereeritud heli kasutada kommertsiaalsel eesmärgil? Pole selget teavet kasutustingimustes. MIT litsents katab koodi, aga mitte genereeritud sisu.
  **Mõju:** Kõrge — sisulooja peab teadma, kas ta tohib TTS-heli YouTube'is monetiseerida. Selge teave on hädavajalik.

- [ ] **4.2. Puudub attribution nõude selgitus** — kas sisulooja peab mainima "Genereeritud EKI Hääldusabilisega"? Pole selget juhendit.
  **Mõju:** Madal — avaliku sektori tööriist — tõenäoliselt vaba kasutus. Aga selgus oleks parem.

### Etapp 5: Kvaliteedi kontroll

- [x] **5.1. Eelkuulamine enne eksporti** — sisulooja saab iga lauset kuulata enne allalaadimist. Play-nupp annab kohese tagasiside.

- [x] **5.2. Hääldusvariantide valik** — sisulooja saab valida sõna häälduse variandi. Kasulik, kui standardhääldus ei sobi kontekstiga.

- [ ] **5.3. Puudub A/B võrdluse tööriist** — sisulooja tahab kuulata kahte varianti kõrvuti ja valida parema. Pole "Variant A vs Variant B" liidest.
  **Mõju:** Madal — sisulooja saab variante järjest kuulata, aga kõrvutine kuulamine oleks mugavam.

---

## Kokkuvõte

| Kategooria | Kokku | ✅ Hea | ⚠️ Probleem |
|------------|-------|--------|-------------|
| Heli kvaliteet ja valik | 5 | 1 | 4 |
| Eksport ja formaat | 5 | 2 | 3 |
| Masstootmine | 3 | 0 | 3 |
| Autoriõigus | 2 | 0 | 2 |
| Kvaliteedi kontroll | 3 | 2 | 1 |
| **Kokku** | **18** | **5** | **13** |

## Top-5 probleemid (mõju sisuloojale)

1. **Puudub hääle valik** (#1.2) — üks hääl piirab loomingulist vabadust, backend toetab
2. **Puudub kiiruse/tooni reguleerija** (#1.3) — prosoodia kontroll on kriitiline, backend toetab
3. **Puudub pauside kontroll** (#1.4) — monotoonne kõne ilma pausideta
4. **Puudub bulk sisestus** (#3.1) — stsenaariumide sisestamine on tüütu
5. **Genereeritud heli kasutusõigused pole selged** (#4.1) — kommertsiaalne kasutus on ebaselge

## Mis on hästi tehtud

- Kõrge kvaliteediga eesti keele TTS
- WAV eksport — kadudeta kvaliteet
- ZIP eksport kogu ülesandega
- Eelkuulamine enne eksporti
- Hääldusvariantide valik
