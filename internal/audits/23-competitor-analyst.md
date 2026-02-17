# Audit: Konkurendianalüütik

**Vaatenurk:** Analüütik, kes võrdleb Hääldusabilist konkurentidega: Google TTS, Amazon Polly, Microsoft Azure Speech, Duolingo, Forvo, EKI teised teenused.
**Audiitor:** Luna | **Kuupäev:** 2026-02-17
**Meetod:** Lähtekoodi analüüs — funktsionaalsuse võrdlus, eristumise punktid, puuduvad funktsioonid.

---

## Võrdlusraamistik

### Etapp 1: Tugevused (eristumise punktid)

- [x] **1.1. Eesti keele spetsiifiline foneetiline analüüs** — Vabamorf'i integratsioon annab eesti keele morfoloogilist ja foneetilist analüüsi, mida Google/Amazon/Microsoft TTS ei paku. Kolme välte süsteem, palatalisatsioon, liitsõna piir — need on eesti keele unikaalsed jooned.

- [x] **1.2. Hääldusvariantide valik** — kasutaja saab valida sõna erinevate hääldusvariantide vahel. Google TTS pakub ainult ühte hääldust. See on unikaalne funktsioon.

- [x] **1.3. Haridusele orienteeritud töövoog** — ülesannete loomine, jagamine, onboarding rollide järgi. Google TTS on üldotstarbeline, Hääldusabiline on haridusele kohandatud.

- [x] **1.4. Tasuta ja avatud lähtekood** — MIT litsents. Google TTS, Amazon Polly, Azure Speech on tasulised (pay-per-character). Forvo on piiratud tasuta kasutusega.

- [x] **1.5. Privaatsus** — riigiasutuse platvorm, andmed EL-is, minimaalsed kolmandate osapoolte jälgijad. Google/Amazon/Microsoft koguvad andmeid oma teenuste parandamiseks.

### Etapp 2: Nõrkused (konkurentide ees)

- [ ] **2.1. Ainult üks hääl vs Google 30+ häält** — Google TTS pakub eesti keelele vähemalt 2–3 häält (mees/naine, WaveNet/Standard). Amazon Polly ja Azure pakuvad samuti mitmeid hääleid. Hääldusabiline pakub ainult ühte.
  **Mõju:** Kõrge — hääle valik on TTS-i standard. Üks hääl on oluline puudujääk.

- [ ] **2.2. Puudub SSML tugi** — Google, Amazon ja Azure toetavad SSML-i (Speech Synthesis Markup Language): pausid, rõhud, kiirus, toon, häälemuutused. Hääldusabiline ei toeta SSML-i.
  **Mõju:** Kõrge — SSML on TTS-i tööstusstandard kõne kontrollimiseks.

- [ ] **2.3. Puudub reaalajas kõnesüntees (streaming)** — Google ja Azure pakuvad streaming TTS-i: kõne algab kohe, ilma ootamata kogu faili genereerimist. Hääldusabiline kasutab SQS järjekorda + polling'ut, mis lisab latentsust.
  **Mõju:** Keskmine — lühikeste lausete puhul pole erinevus suur. Pikkade tekstide puhul on streaming oluliselt parem.

- [ ] **2.4. Puudub kõnetuvastus (ASR)** — Duolingo pakub häälduse hindamist: kasutaja ütleb sõna, süsteem hindab. Hääldusabiline pakub ainult mudeli kuulamist, mitte tagasisidet kasutaja kõnele.
  **Mõju:** Kõrge — kõnetuvastus + häälduse hindamine on keeleõppe rakenduste standard (Duolingo, Babbel, Rosetta Stone).

- [ ] **2.5. Puudub gamification** — Duolingo: XP punktid, striigid, tasemed, saavutused, edetabel. Hääldusabiline: pole motivatsioonisüsteemi. Keeleõppe kontekstis on gamification tõestatud motivaator.
  **Mõju:** Keskmine — Hääldusabiline pole otseselt Duolingo konkurent (fookus on TTS, mitte kogu keeleõpe), aga motivatsioonisüsteem oleks kasulik.

- [ ] **2.6. Puudub mobiilirakendus** — Duolingo, Babbel jt on peamiselt mobiilirakendused. Hääldusabiline on veebirakendus ilma PWA toeta. Mobiilne kogemus on piiratud (audit #6).
  **Mõju:** Keskmine — veebirakendus töötab mobiilil, aga native kogemus oleks parem.

### Etapp 3: Turupositsioon

- [x] **3.1. Nišifookus on õige** — Hääldusabiline ei konkureeri Google TTS-iga üldotstarbelise TTS-i turul. Fookus on eesti keele häälduse õppimisel hariduskontekstis. See on kitsas, aga selge nišš.

- [ ] **3.2. Puudub selge positsioneerimise sõnum** — platvormil pole "Miks meie, mitte Google TTS?" sõnumit. Eristumise punktid (Vabamorf, hääldusvariantide valik, hariduse töövoog) pole kommunikeeritud.
  **Mõju:** Keskmine — kasutaja/otsustaja ei pruugi mõista platvormi lisaväärtust.

- [ ] **3.3. Forvo kui kaudne konkurent** — Forvo.com pakub emakeelekõnelejate hääldust. See on "päris" hääldus vs TTS genereeritud. Mõned õpetajad eelistavad Forvo'd. Hääldusabiline peaks selgitama TTS-i eelist: kontrollitavus, järjepidevus, foneetiline analüüs.
  **Mõju:** Madal — erinevad tööriistad erinevatele vajadustele.

### Etapp 4: Puuduvad võimalused (teekaardisoovitused)

- [ ] **4.1. Prioriteet 1: Hääle valik ja kiiruse reguleerija** — backend toetab juba `voice`, `speed`, `pitch` parameetreid. Frontendi UI lisamine oleks suhteliselt lihtne ja annaks koheselt konkurentsieelise.
  **Mõju:** Teekaardisoovitus — madal pingutus, kõrge väärtus.

- [ ] **4.2. Prioriteet 2: Kõnetuvastus ja häälduse hindamine** — nõuab ASR mudelit (nt Whisper fine-tuned eesti keelele). Kõrge väärtus keeleõppes, aga suur arendusmaht.
  **Mõju:** Teekaardisoovitus — kõrge pingutus, kõrge väärtus.

- [ ] **4.3. Prioriteet 3: LTI integratsioon** — haridussektori standard. Võimaldab Moodle/eKool/Google Classroom integratsiooni. Keskmine arendusmaht, kõrge väärtus koolide jaoks.
  **Mõju:** Teekaardisoovitus — keskmine pingutus, kõrge väärtus hariduses.

- [ ] **4.4. Prioriteet 4: Mobiilne PWA** — Service Worker, offline-tugi, "Lisa avakuvale". Keskmine arendusmaht, kõrge väärtus mobiilsetele kasutajatele.
  **Mõju:** Teekaardisoovitus — keskmine pingutus, keskmine väärtus.

---

## Kokkuvõte

| Kategooria | Kokku | ✅ Tugev | ⚠️ Nõrk | 📋 Soovitus |
|------------|-------|---------|---------|-------------|
| Eristumise punktid | 5 | 5 | 0 | 0 |
| Nõrkused | 6 | 0 | 6 | 0 |
| Turupositsioon | 3 | 1 | 2 | 0 |
| Teekaardisoovitused | 4 | 0 | 0 | 4 |
| **Kokku** | **18** | **6** | **8** | **4** |

## Peamised eristumise punktid

1. **Vabamorf'i integratsioon** — eesti keele foneetiline ja morfoloogiline analüüs, mida ükski konkurent ei paku
2. **Hääldusvariantide valik** — unikaalne funktsioon, mida Google/Amazon/Azure ei paku
3. **Tasuta ja avatud lähtekood** — vs Google/Amazon/Azure tasuline API
4. **Haridusele orienteeritud** — ülesanded, jagamine, rollipõhine onboarding
5. **Privaatsus** — riigiasutus, EL-i andmed, minimaalsed jälgijad

## Peamised puudujäägid vs konkurendid

1. **Ainult üks hääl** — Google pakub 30+, backend toetab mitut
2. **Puudub SSML** — tööstusstandard kõne kontrollimiseks
3. **Puudub kõnetuvastus** — Duolingo standard
4. **Puudub gamification** — motivatsioonisüsteem keeleõppes
5. **Puudub streaming TTS** — latentsus SQS + polling tõttu
