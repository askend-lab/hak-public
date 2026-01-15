# Estonian Test Phrases - Common Usage

**Purpose:** Curated phrases for testing EKI Hääldusabiline pronunciation synthesis  
**Last Updated:** 2026-01-08

## Quick Reference

### Single Words

| Word | Phonetic Interest | Expected Model |
|------|-------------------|----------------|
| `Tere` | Basic greeting | efm_s |
| `Aitäh` | Contains ä | efm_s |
| `kooli` | Third pitch accent variants | efm_s |
| `peeti` | Third pitch accent + palatalization | efm_s |
| `mees` | Third pitch accent variants | efm_s |
| `kass` | Palatalization options | efm_s |
| `pall` | Short vs long | efm_s |

### Simple Sentences

| Sentence | Words | Expected Model |
|----------|-------|----------------|
| `Tere päevast` | 2 | efm_l |
| `Kuidas läheb` | 2 | efm_l |
| `Aitäh, hästi` | 2 | efm_l |
| `Head aega` | 2 | efm_l |

### Complex Sentences

| Sentence | Notes |
|----------|-------|
| `Noormees läks kooli` | Compound word + variants |
| `Mees peeti kinni` | Palatalization in "kinni" |
| `Viimaks peeti noormees kinni` | Multiple stress patterns |
| `Ta läks kolmapäeval poodi` | Compound word "kolmapäeval" |

---

## Categorized Test Phrases

### 1. Greetings (Tervitused)

```
Tere
Tere hommikust
Tere päevast
Tere õhtust
Head ööd
Head aega
Nägemist
Kohtumiseni
```

### 2. Common Phrases

```
Kuidas läheb
Aitäh, hästi
Palun
Vabandust
Jah
Ei
Ma ei tea
Ma saan aru
```

### 3. Third Pitch Accent (Kolmas Välde)

Words with third pitch accent variants:

| Word | Without | With | Meaning Difference |
|------|---------|------|-------------------|
| kooli | `kooli` | `k<ooli` | school (partitive) vs school (illative) |
| peeti | `peeti` | `p<eeti` | was considered vs was held |
| saada | `saada` | `s<aada` | to get vs send! |
| viia | `viia` | `v<iia` | to take vs fruit jam |

**Test Sentences:**
```
Noormees läks kooli
Mees peeti kinni
Palun saada mulle kiri
```

### 4. Palatalization (Palatalisatsioon)

Words with palatalized consonants (d, l, n, s, t):

| Word | Phonetic | Description |
|------|----------|-------------|
| kinni | `kin]ni` | Soft "n" |
| pall | `pal]l` | Soft "l" |
| kass | `kas]s` | Soft "s" |
| padi | `pad]i` | Soft "d" |

**Test Sentences:**
```
Mees peeti kinni
Laps viskas palli
Kass magab padja peal
```

### 5. Compound Words (Liitsõnad)

| Word | Phonetic | Parts |
|------|----------|-------|
| noormees | `noor_mees` | noor + mees |
| kolmapäev | `kolma_päev` | kolm + päev |
| raamatukogu | `raamatu_kogu` | raamat + kogu |
| autojuht | `auto_juht` | auto + juht |

**Test Sentences:**
```
Noormees läks kolmapäeval kooli
Autojuht sõitis raamatukokku
```

### 6. Irregular Stress (Ebareeglipärane Rõhk)

Words where stress is not on first syllable:

| Word | Phonetic | Stress Position |
|------|----------|-----------------|
| aitäh | `ait?äh` | Second syllable |
| seljanka | `selj?anka` | Second syllable |
| dialektika | `dial?ektika` | Third syllable |

**Test Sentences:**
```
Aitäh väga palju
Mulle meeldib seljanka
```

### 7. Special Characters (Erimärgid)

Estonian specific characters:

```
Üks õun käes
Öö oli külm
Ämblik ehitas võrku
Üle jõe ja läbi metsa
```

### 8. Punctuation Handling

```
Tere! Kuidas läheb?
Kas sa tuled? Jah, tulen.
Oi, kui ilus päev!
Hmm... Ma ei tea.
```

### 9. Numbers

```
Üks
Kaks
Kolm
Kakskümmend üks
Sada kaksteist
```

---

**See also:**
- [Edge Cases & Reference](./estonian-phrases-edge-cases.md) - Edge cases, test accounts, markers
