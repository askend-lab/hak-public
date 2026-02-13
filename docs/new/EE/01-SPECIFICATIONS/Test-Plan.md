# Testiplaan - EKI Hääldusabilise kasutajaliides

**Viimati uuendatud:** 2026-01-30

---

## 1. Sissejuhatus

### 1.1 Eesmärk

See dokument määratleb EKI Hääldusabiline rakenduse testimise strateegia. See on juhendiks toodangu juurutuse vastuvõtutestimisel funktsionaalsuse vastu.

### 1.2 Ulatus

See testiplaan hõlmab:

- Kõik **9 juurutatud funktsiooni**
- **28 kasutajalugu** koos vastuvõtukriteeriumitega
- **18 testjuhtumit**, mis katavad põhistsenaariumi ja piirjuhud
- **3 täielikku kasutajateekonda**

### 1.3 Viited

| Dokument | Kirjeldus |
|----------|-----------|
| [Funktsioonide kaart](./Feature-Map.md) | Täielik funktsioonide nimekiri |
| [Kasutajalood](./01-USER-STORIES/) | Üksikasjalikud nõuded |
| [Testjuhtumid](./02-TEST-CASES/) | Samm-sammult kontrolliprotseduurid |
| [Kasutajateekonnad](./03-USER-JOURNEYS/) | Täielikud kasutajavood |

---

## 2. Kiirviide

### Testitavad funktsioonid

#### Kriitilised funktsioonid (peavad läbima)

| Funktsioon | Kirjeldus | Testjuhtumid |
|------------|-----------|--------------|
| F01 | Kõnesüntees | TC-01 kuni TC-05 |
| F02 | Hääldusevariandid | TC-06 kuni TC-08 |
| F05 | Ülesannete haldus | TC-12 kuni TC-14 |
| F07 | Autentimine | TC-16 |

#### Kõrge prioriteediga funktsioonid

| Funktsioon | Kirjeldus | Testjuhtumid |
|------------|-----------|--------------|
| F03 | Lause häälduskuju | TC-09 |
| F04 | Esitusloendi haldus | TC-10, TC-11 |
| F06 | Ülesannete jagamine | TC-15 |
| F08 | Sisseelamine | TC-17 |

#### Keskmise prioriteediga funktsioonid

| Funktsioon | Kirjeldus | Testjuhtumid |
|------------|-----------|--------------|
| F10 | Teavitused | TC-19 |

---

## 3. Testimise strateegia

### 3.1 Testimise tasemed

| Tase | Kirjeldus | Katvus |
|------|-----------|--------|
| Funktsionaalne testimine | Kontrollib, et iga funktsioon töötab vastavalt spetsifikatsioonile | Kõik kasutajalood |
| Integratsiooni testimine | Kontrollib, et funktsioonid töötavad koos | Kasutajateekonnad |
| Piirjuhtude testimine | Kontrollib ebatavaliste sisendite käsitlemist | Piirjuhtude testjuhtumid |
| Regressiooni testimine | Kontrollib, et parandused ei riku olemasolevaid funktsioone | Kõik testjuhtumid |

### 3.2 Testi tüübid

| Tüüp | Kirjeldus |
|------|-----------|
| Põhistsenaarium | Standardne edukas kasutajavoog |
| Piirjuht | Piirtingimused ja ebatavalised sisendid |
| Negatiivne | Vigased sisendid ja veakäsitlus |
| Integratsioon | Töövood mitme funktsiooni vahel |

### 3.3 Testi prioriteedid

| Prioriteet | Kirjeldus | Millal käivitada |
|------------|-----------|------------------|
| Kriitiline | Põhifunktsionaalsus peab töötama | Iga ehitusega |
| Kõrge | Olulised funktsioonid | Igapäevaste ehitustega |
| Keskmine | Toetavad funktsioonid | Iganädalaselt / Väljalaskega |

---

## 4. Testitavad funktsioonid

### 4.1 Kriitilised funktsioonid (peavad läbima)

| Funktsioon | Kirjeldus | Kasutajalood | Testjuhtumid |
|------------|-----------|--------------|--------------|
| F01 | Kõnesüntees | [US-01](./01-USER-STORIES/F01-speech-synthesis/US-01-text-input.md), [US-02](./01-USER-STORIES/F01-speech-synthesis/US-02-synthesize-audio.md), [US-03](./01-USER-STORIES/F01-speech-synthesis/US-03-playback-control.md), [US-04](./01-USER-STORIES/F01-speech-synthesis/US-04-download-audio.md) | [TC-01](./02-TEST-CASES/F01-speech-synthesis/TC-01-basic-synthesis.md), [TC-02](./02-TEST-CASES/F01-speech-synthesis/TC-02-input-behaviors.md), [TC-03](./02-TEST-CASES/F01-speech-synthesis/TC-03-audio-states.md), [TC-04](./02-TEST-CASES/F01-speech-synthesis/TC-04-caching.md), [TC-05](./02-TEST-CASES/F01-speech-synthesis/TC-05-edge-cases.md) |
| F02 | Hääldusevariandid | [US-05](./01-USER-STORIES/F02-pronunciation-variants/US-05-view-variants.md), [US-06](./01-USER-STORIES/F02-pronunciation-variants/US-06-preview-variant.md), [US-07](./01-USER-STORIES/F02-pronunciation-variants/US-07-select-variant.md), [US-08](./01-USER-STORIES/F02-pronunciation-variants/US-08-custom-variant.md) | [TC-06](./02-TEST-CASES/F02-pronunciation-variants/TC-06-view-variants.md), [TC-07](./02-TEST-CASES/F02-pronunciation-variants/TC-07-preview-select.md), [TC-08](./02-TEST-CASES/F02-pronunciation-variants/TC-08-custom-variant.md) |
| F05 | Ülesannete haldus | [US-15](./01-USER-STORIES/F05-task-management/US-15-create-task.md), [US-16](./01-USER-STORIES/F05-task-management/US-16-view-tasks.md), [US-17](./01-USER-STORIES/F05-task-management/US-17-edit-task.md), [US-18](./01-USER-STORIES/F05-task-management/US-18-delete-task.md), [US-19](./01-USER-STORIES/F05-task-management/US-19-add-to-task.md) | [TC-12](./02-TEST-CASES/F05-task-management/TC-12-create-task.md), [TC-13](./02-TEST-CASES/F05-task-management/TC-13-task-crud.md), [TC-14](./02-TEST-CASES/F05-task-management/TC-14-add-entries.md) |
| F07 | Autentimine | [US-22](./01-USER-STORIES/F07-authentication/US-22-login.md), [US-23](./01-USER-STORIES/F07-authentication/US-23-profile.md), [US-24](./01-USER-STORIES/F07-authentication/US-24-logout.md) | [TC-16](./02-TEST-CASES/F07-authentication/TC-16-authentication.md) |

### 4.2 Kõrge prioriteediga funktsioonid

| Funktsioon | Kirjeldus | Kasutajalood | Testjuhtumid |
|------------|-----------|--------------|--------------|
| F03 | Lause häälduskuju | [US-09](./01-USER-STORIES/F03-sentence-phonetic/US-09-view-phonetic.md), [US-10](./01-USER-STORIES/F03-sentence-phonetic/US-10-edit-phonetic.md) | [TC-09](./02-TEST-CASES/F03-sentence-phonetic/TC-09-phonetic-panel.md) |
| F04 | Esitusloendi haldus | [US-11](./01-USER-STORIES/F04-playlist/US-11-add-sentences.md), [US-12](./01-USER-STORIES/F04-playlist/US-12-reorder-sentences.md), [US-13](./01-USER-STORIES/F04-playlist/US-13-play-all.md), [US-14](./01-USER-STORIES/F04-playlist/US-14-manage-sentences.md), [US-15](./01-USER-STORIES/F04-playlist/US-15-session-persistence.md) | [TC-10](./02-TEST-CASES/F04-playlist/TC-10-playlist-management.md), [TC-11](./02-TEST-CASES/F04-playlist/TC-11-play-all.md) |
| F06 | Ülesannete jagamine | [US-20](./01-USER-STORIES/F06-task-sharing/US-20-share-task.md), [US-21](./01-USER-STORIES/F06-task-sharing/US-21-access-shared.md) | [TC-15](./02-TEST-CASES/F06-task-sharing/TC-15-share-task.md) |
| F08 | Sisseelamine | [US-25](./01-USER-STORIES/F08-onboarding/US-25-role-selection.md), [US-26](./01-USER-STORIES/F08-onboarding/US-26-wizard.md) | [TC-17](./02-TEST-CASES/F08-onboarding/TC-17-onboarding.md) |

### 4.3 Keskmise prioriteediga funktsioonid

| Funktsioon | Kirjeldus | Kasutajalood | Testjuhtumid |
|------------|-----------|--------------|--------------|
| F10 | Teavitused | [US-28](./01-USER-STORIES/F10-notifications/US-28-notifications.md) | [TC-19](./02-TEST-CASES/F10-notifications/TC-19-notifications.md) |

---

## 5. Testimise ajakava

### 5.1 Testimise faasid

| Faas | Tegevused | Testjuhtumid |
|------|-----------|--------------|
| 1. Kriitiline | Põhifunktsionaalsuse testimine | TC-01 kuni TC-05, TC-06 kuni TC-08, TC-12 kuni TC-14, TC-16 |
| 2. Kõrge | Täiendavate funktsioonide testimine | TC-09, TC-10, TC-11, TC-15, TC-17 |
| 3. Keskmine | Toetavate funktsioonide testimine | TC-19 |
| 4. Integratsioon | Kasutajateekondade testimine | UJ-01, UJ-02, UJ-03 |

---

## 6. Vastuvõtukriteeriumid

### 6.1 Väljalaske kriteeriumid

| Prioriteet | Nõue |
|------------|------|
| Kriitiline | 100% testjuhtumitest läbitud |
| Kõrge | 100% testjuhtumitest läbitud |
| Keskmine | 90% testjuhtumitest läbitud |

### 6.2 Blokeerivad vead

Järgmised vead blokeerivad väljalaset:

- Kõnesüntees ei tööta
- Autentimine ebaõnnestub
- Ülesannete loomine/salvestamine ebaõnnestub
- Andmete kadu

---

## 7. Riskid ja leevendused

| Risk | Tõenäosus | Mõju | Leevendus |
|------|-----------|------|-----------|
| API kättesaamatus | Keskmine | Kõrge | Taaskäivitusprotseduurid |
| TARA autentimise probleemid | Madal | Kõrge | Testkontod |
| Brauseri ühilduvusprobleemid | Madal | Keskmine | Mitme brauseri testimine |

---

## 8. Lisad

### 8.1 Testjuhtumite kokkuvõte

| Funktsioon | Testjuhtumite arv | Kasutajalugude arv |
|------------|-------------------|-------------------|
| F01 Kõnesüntees | 5 | 4 |
| F02 Hääldusevariandid | 3 | 4 |
| F03 Lause häälduskuju | 1 | 2 |
| F04 Esitusloend | 2 | 5 |
| F05 Ülesannete haldus | 3 | 5 |
| F06 Ülesannete jagamine | 1 | 2 |
| F07 Autentimine | 1 | 3 |
| F08 Sisseelamine | 1 | 2 |
| F10 Teavitused | 1 | 1 |
| **Kokku** | **18** | **28** |
