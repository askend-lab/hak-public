# Checklist: Õiguslik / Kasutustingimused (Legal / Terms of Service)

**Tüüp:** Õigusliku vastavuse kontrollnimekiri
**Audiitor:** Luna | **Kuupäev:** 2026-02-17
**Meetod:** Lähtekoodi analüüs — olemasolevad õiguslikud lehed, puuduvad dokumendid, litsentsid.

---

## Kasutustingimused (Terms of Service)

- [ ] **1.1. Puudub kasutustingimuste leht** — pole `/terms` ega `/kasutustingimused` lehte. Kasutaja ei tea: mis on lubatud kasutus, mis on keelatud, kes vastutab, mis juhtub rikkumise korral.
  **Soovitus:** Loo kasutustingimuste leht järgmiste lõikudega: teenuse kirjeldus, lubatud kasutus, keelatud kasutus, vastutuse piirangud, intellektuaalomand, muudatuste tegemise õigus.
- [ ] **1.2. Puudub nõustumise mehhanism** — kasutaja ei nõustu kasutustingimustega enne teenuse kasutamist. Pole checkbox'i "Nõustun kasutustingimustega" registreerumisel.
  **Soovitus:** Lisa kasutustingimustega nõustumine registreerimise/esimese sisselogimise voogu.
- [ ] **1.3. Keelatud kasutus pole defineeritud** — pole selget loetelu: pole lubatud genereerida solvavat sisu, kasutada kommertsiaalsel eesmärgil ilma loata, koormata teenust automaatsete päringutega, levitada vale informatsiooni TTS-i abil.
  **Soovitus:** Defineeri keelatud kasutuse loetelu kasutustingimustes.

## Privaatsuspoliitika (olemasolev)

- [x] **2.1. Privaatsuspoliitika on olemas** — `/privacy` leht on põhjalik ja professionaalne.
- [x] **2.2. Andmekaitse kontaktandmed** — eki@eki.ee on olemas.
- [x] **2.3. Kolmandad osapooled on loetletud** — AWS, Google, TARA, Sentry.
- [x] **2.4. Kasutajaõigused on mainitud** — juurdepääs, parandamine, kustutamine, ülekandmine, vastuväited.
- [ ] **2.5. Puudub versiooniajugu** — pole eelmiste privaatsuspoliitika versioonide ajalugu. GDPR ei nõua, aga hea tava.
  **Soovitus:** Lisa "Muudatuste ajalugu" lõik.

## Ligipääsetavuse teatis (olemasolev)

- [x] **3.1. Ligipääsetavuse teatis on olemas** — `/accessibility` leht.
- [ ] **3.2. Teatise sisu vastavus EL-i mudelile** — EL-i veebilehe ligipääsetavuse direktiiv nõuab kindlat formaati: vastavuse staatus, teadaolevad piirangud, tagasiside mehhanism, jõustamisprotseduur.
  **Soovitus:** Kontrolli teatise sisu vastavust EL-i mudelile.

## Intellektuaalomand

- [x] **4.1. MIT litsents koodile** — selge, lubav litsents. Kood on vabalt kasutatav.
- [ ] **4.2. TTS-ga genereeritud sisu õigused pole selged** — kas genereeritud heli on autoriõigusega kaitstud? Kes omab õigusi? Kas kasutaja tohib genereeritud heli levitada, müüa, kasutada kommertsiaalsel eesmärgil?
  **Soovitus:** Lisa selgitus kasutustingimustesse: "Teenusega genereeritud heli kasutusõigused...".
- [ ] **4.3. Kasutaja sisu omandiõigus** — kasutaja loob ülesandeid ja sisestab tekste. Kes omab seda sisu? Kas EKI tohib seda kasutada (nt keelemudelite treenimiseks)?
  **Soovitus:** Selgita kasutustingimustes: "Kasutaja säilitab omandiõiguse oma loodud sisule."
- [ ] **4.4. Vabamorf'i litsents** — Vabamorf'i morfoloogiline analüsaator on EKI toode. Kas selle kasutamine Hääldusabilises on litsentsiga kaetud?
  **Soovitus:** Dokumenteeri Vabamorf'i litsents ja kasutustingimused.

## Vastutus ja garantiid

- [ ] **5.1. Puudub vastutuse piirang** — pole "teenust pakutakse olemasoleval kujul (as-is)" klauslit. Kui TTS hääldab valesti ja kasutaja teeb selle põhjal vale otsuse, kes vastutab?
  **Soovitus:** Lisa vastutuse piirangu klausel kasutustingimustesse.
- [ ] **5.2. Puudub teenuse saadavuse garantii** — pole SLA-d. Pole "teenus võib olla ajutiselt kättesaamatu hoolduse, uuenduste või force majeure tõttu" klauslit.
  **Soovitus:** Lisa teenuse saadavuse klausel.
- [ ] **5.3. Puudub häälduse täpsuse vastutuse piirang** — TTS hääldus ei pruugi olla alati korrektne. Pole hoiatust: "Hääldus on automaatselt genereeritud ja ei pruugi alati vastata normatiivsetele reeglitele."
  **Soovitus:** Lisa hoiatus privaatsuspoliitikas ja/või kasutustingimustes.

## Küpsiste poliitika

- [x] **6.1. Cookie consent banner on olemas** — nõustumise ja keeldumise nuppudega.
- [ ] **6.2. Puudub detailne küpsiste poliitika** — pole eraldi lehte, mis loetleks: küpsise nimi, eesmärk, aegumisaeg, tüüp (vajalik/analüütika/turundus).
  **Soovitus:** Loo detailne küpsiste poliitika leht.

## Kolmandad osapooled

- [x] **7.1. Privaatsuspoliitika loetleb kolmandad osapooled** — AWS, Google, TARA, Sentry koos linkidega nende privaatsuspoliitikatele.
- [ ] **7.2. Google Fonts andmetöötlus** — Google Fonts laetakse välistest serveritest. Google töötleb kasutaja IP-aadressi. Pole privaatsuspoliitikas eraldi mainitud.
  **Soovitus:** Lisa Google Fonts kolmandate osapoolte nimekirja. Või self-host'i fonte.
- [ ] **7.3. Puudub DPA loetelu** — kas on sõlmitud andmetöötluslepingud (DPA) kõigi volitatud töötlejatega (AWS, Sentry)?
  **Soovitus:** Dokumenteeri DPA-de staatus.

---

## Kokkuvõte

| Kategooria | Punktid | ✅ Hea | ⚠️ Puudub |
|------------|---------|--------|-----------|
| Kasutustingimused | 3 | 0 | 3 |
| Privaatsuspoliitika | 5 | 4 | 1 |
| Ligipääsetavuse teatis | 2 | 1 | 1 |
| Intellektuaalomand | 4 | 1 | 3 |
| Vastutus ja garantiid | 3 | 0 | 3 |
| Küpsiste poliitika | 2 | 1 | 1 |
| Kolmandad osapooled | 3 | 1 | 2 |
| **Kokku** | **22** | **8** | **14** |

## Prioriteedid

1. **P0:** Kasutustingimuste leht — õiguslikult hädavajalik (#1.1)
2. **P0:** Keelatud kasutuse defineerimine — kaitse kuritarvituse eest (#1.3)
3. **P1:** TTS heli kasutusõiguste selgitamine (#4.2)
4. **P1:** Vastutuse piirangu klausel (#5.1)
5. **P2:** Detailne küpsiste poliitika (#6.2)
6. **P2:** DPA-de dokumenteerimine (#7.3)
