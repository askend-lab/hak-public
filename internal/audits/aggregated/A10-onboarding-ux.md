# Agregeeritud leiud: Onboarding ja kasutajakogemus

**Deduplikeeritud leiud 51 auditifailist, grupeeritud teemade kaupa.**
**Iga leid näitab, mitu originaalset kirjet sellele viitab.**

---

## 1. Onboarding wizard sulgub juhusliku klõpsuga

**Viited: 6 kirjet** — #1, #5, #15, #16, C07, C22

Klõps overlay'l (`wizard__overlay onClick={onSkip}`) sulgeb kogu wizardi. `saveToStorage(true)` kirjutab completed=true. Pole taastamisvõimalust UI-s.

- [ ] Overlay klõps ei sulge wizardi (või küsib kinnitust)
- [ ] "Läbi juhend uuesti" nupp seadetes/abis

**Hinnang:** 0.5 päeva | **Prioriteet:** P1

---

## 2. Onboarding ei selgita "hääldusvariant" mõistet

**Viited: 5 kirjet** — #1, #5, #13, #18, C07

Wizard samm 3 ütleb "Kliki sõnal, et näha erinevaid häälduse variante", kuid algajale pole selge, mida need variandid tähendavad ja milleks neid kasutada.

- [ ] Konteksti lisamine: "Eesti keeles on sõnadel mitu hääldusviisi"
- [ ] Lühike selgitus wizardi sammu juures

**Hinnang:** 0.5 päeva | **Prioriteet:** P1

---

## 3. Progressi jälgimine puudub

**Viited: 10 kirjet** — #1, #2, #4, #5, #9, #13, #23, #24, C07, C22

Pole ühtegi jälgimist: mitu sõna kuulati, kui palju aega kulus, millised sõnad olid rasked. Õppeplatvormil on see põhiline motivatsioonifunktsioon.

- [ ] Kasutusstatistika: sünteeside arv, kuulatud sõnad
- [ ] Progressi dashboard: "Sel nädalal kuulasid 45 sõna"
- [ ] Päevaeesmärgid / järjepidavusloendus (streak)

**Hinnang:** 5–10 päeva | **Prioriteet:** P2

---

## 4. Kasutusanalüütika puudub

**Viited: 7 kirjet** — #9, #19, #24, C03, C06, C13, C22

Pole teada: mitu kasutajat, mitu sünteesi päevas, populaarsed sõnad, katkestamise kohad. Pole analytics pipeline'i.

- [ ] Anonüümsed kasutusstatistikad (sünteeside arv, populaarsed lehed)
- [ ] Funnel analüüs: külastus → süntees → konto → ülesanne

**Hinnang:** 3–5 päeva | **Prioriteet:** P2

---

## 5. Rolli valik segadusetekitav

**Viited: 5 kirjet** — #1, #5, #15, C07, C22

`RoleSelectionPage` pakub 3 rolli: Õppija, Õpetaja, Uurija. Mõnele kasutajale pole selge, miks peab rolli valima. "Uurija" on arusaamatu.

- [ ] Rollide selgituste parandamine
- [ ] Või: rollide eemaldamine ja ühe onboarding voo kasutamine (lihtsustus)

**Hinnang:** 0.5 päeva | **Prioriteet:** P2

---

## 6. Pärast onboardingut pole näidislauseid

**Viited: 5 kirjet** — #1, #5, #13, #18, C07

Pärast wizardi lõpetamist näeb kasutaja tühja ekraani. Demo laused seatakse ainult wizardi ajal, aga pärast wizardi neid ei salvestata.

- [ ] Demo lausete salvestamine wizardi lõpus
- [ ] "Proovi näidislauset" nupp sünteesi lehel

**Hinnang:** 0.5 päeva | **Prioriteet:** P1

---

## 7. Õpetaja→Õppija töövoog on piiratud

**Viited: 7 kirjet** — #2, #4, #9, #13, C07, C22, C25

Õpetaja loob ülesande ja jagab linki. Aga: pole tagasiside mehhanismi, pole "Valmis!" kinnitust, pole tulemuste kogumist. Õpetaja ei tea, kas õpilane tegi ülesande.

- [ ] Ülesande täitmise kinnitus ("Valmis!")
- [ ] Õpetaja dashboard: kes on ülesande teinud
- [ ] Tulemuste kogumine ja tagasiside

**Hinnang:** 5–10 päeva | **Prioriteet:** P2

---

## 8. Spellcheck on välja lülitatud

**Viited: 5 kirjet** — #1, #5, #8, #16, C07

`spellCheck={false}` on seatud sisestusväljale. Trükivigade käsitlus puudub. Pole "Kas mõtlesid?" soovitust.

- [ ] spellCheck lubamine (või: eesti keele spellcheck integratsioon)
- [ ] "Kas mõtlesid: [õige sõna]?" soovitus (Vabamorf'i põhjal)

**Hinnang:** 2–3 päeva | **Prioriteet:** P2

---

## 9. Tagasiside mehhanism pole piisav

**Viited: 5 kirjet** — #12, #14, #15, C07, C23

Ainult eki@eki.ee jaluses. Pole in-app tagasiside vormi, pole "Anna tagasisidet" nuppu. Pole ligipääsetavuse tagasiside mehhanismi.

- [ ] In-app tagasiside nupp (feedback widget)
- [ ] Ligipääsetavuse tagasiside vorm

**Hinnang:** 1–2 päeva | **Prioriteet:** P2

---

## 10. 404 leht on tupik

**Viited: 3 kirjet** — #5, #16, C07

404 leht näitab "Lehekülge ei leitud" koos nupuga "Tagasi avalehele". Aga pole automaatset suunamist ega otsingu võimalust.

- [ ] Automaatne suunamine 10 sekundi pärast
- [ ] Otsingufunktsioon (tulevikus)

**Hinnang:** 0.5 päeva | **Prioriteet:** P3

---

## Kokkuvõte

| # | Leid | Viiteid | Prioriteet |
|---|------|---------|-----------|
| 1 | Wizard sulgub kogemata | 6 | P1 |
| 2 | "Hääldusvariant" selgitus puudub | 5 | P1 |
| 3 | Progressi jälgimine | 10 | P2 |
| 4 | Kasutusanalüütika | 7 | P2 |
| 5 | Rolli valik segadusetekitav | 5 | P2 |
| 6 | Näidislaused pärast onboardingut | 5 | P1 |
| 7 | Õpetaja→Õppija töövoog | 7 | P2 |
| 8 | Spellcheck välja lülitatud | 5 | P2 |
| 9 | Tagasiside mehhanism | 5 | P2 |
| 10 | 404 leht tupik | 3 | P3 |
| **Kokku** | **10 unikaalset leidu** | **58 originaalkirjet** | |
