# TC-02: Sisestuskäitumised

**Eeltingimused:** Rakendus laetud, sünteesi leht nähtav

## Sildi loomine tühikuga

| # | Tegevus | Oodatav tulemus | Läbitud/Ebaõnn. |
|---|---------|-----------------|-----------------|
| 1 | Sisesta "koer" | "koer" on sisendis nähtav | ☐ |
| 2 | Vajuta tühikut | Silt [koer] luuakse | ☐ |
| 3 | Sisesta "kass" | "kass" on sisendis pärast silti | ☐ |
| 4 | Vajuta tühikut | Teine silt [kass] luuakse | ☐ |

## Sildi kustutamine Backspace'iga

| # | Tegevus | Oodatav tulemus | Läbitud/Ebaõnn. |
|---|---------|-----------------|-----------------|
| 1 | Siltidega [Tere] [koer] nähtav | Kaks silti on kuvatud | ☐ |
| 2 | Kursor tühjas sisendis pärast silte | Kursor pärast viimast silti | ☐ |
| 3 | Vajuta Backspace | [koer] silt kustutatakse | ☐ |
| 4 | Vajuta Backspace uuesti | [Tere] silt kustutatakse | ☐ |

## Sildi muutmine menüü kaudu (Muuda)

| # | Tegevus | Oodatav tulemus | Läbitud/Ebaõnn. |
|---|---------|-----------------|-----------------|
| 1 | Sildiga [koer] nähtav | Silt on kuvatud | ☐ |
| 2 | Klõpsa [koer] sildil | Menüü avaneb | ☐ |
| 3 | Vali "Muuda" | Silt muutub muudetavaks sisendiks tekstiga "koer" | ☐ |
| 4 | Kustuta "r" et saada "koe" | Sisend näitab "koe" | ☐ |
| 5 | Vajuta Enter | Silt näitab "koe" JA audio sünteesitakse | ☐ |
| 6 | Kontrolli sildi väärtuse säilimist | Silt kuvab "koe" (ei taastata) | ☐ |

## Sildi muutmine - tühistamine Escape-iga

| # | Tegevus | Oodatav tulemus | Läbitud/Ebaõnn. |
|---|---------|-----------------|-----------------|
| 1 | Klõpsa sildil ja vali "Muuda" | Silt muutub muudetavaks | ☐ |
| 2 | Muuda "koer" sõnaks "kass" | Sisend näitab "kass" | ☐ |
| 3 | Vajuta Escape | Silt taastub väärtusele "koer" | ☐ |

## Sildi kustutamine menüü kaudu (Kustuta)

| # | Tegevus | Oodatav tulemus | Läbitud/Ebaõnn. |
|---|---------|-----------------|-----------------|
| 1 | Siltidega [Tere] [koer] nähtav | Kaks silti on kuvatud | ☐ |
| 2 | Klõpsa [koer] sildil | Menüü avaneb | ☐ |
| 3 | Vali "Kustuta" | [koer] silt eemaldatakse | ☐ |
| 4 | Kontrolli allesjäänud silte | Ainult [Tere] on nähtav | ☐ |

## Äärjuhtumid

| Juhtum | Läbitud/Ebaõnn. |
|--------|-----------------|
| Tühik tühjas sisendis (ilma siltideta): Tegevust ei toimu | ☐ |
| Backspace tühjas sisendis (ilma siltideta): Tegevust ei toimu | ☐ |
| Mitme tühikuga teksti kleepimine: Üksikud sildid luuakse | ☐ |
| Sildi muutmine tühikuklahviga: Kinnitab muudatuse ilma sünteesita | ☐ |
| Sildi muutmine tühjaks väärtuseks: Silt kustutatakse | ☐ |
| Sildi muutmine mitme sõnaga: Muudatusest luuakse mitu silti | ☐ |
