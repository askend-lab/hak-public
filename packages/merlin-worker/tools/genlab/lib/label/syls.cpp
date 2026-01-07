#include <iostream>
#include "../etana/proof.h"
#include "util.h"


bool print_syls = false;

struct pattern_struct {
    CFSWString mall;
    INTPTR pos;
};
const INTPTR patterns_size = 18;

// tel-k:i ja kõi-k:e kõlavad halvasti (esisilbi rõhk ja pikk Q teises tasandavad üksteist ära)
// filsime selle rõhutamise käigus, topeldades laat-t:a ja kõik-k:e

pattern_struct patterns[] = {
    L"V", 1, // ja:

    L"VC", 2, // viga FS sõnastiku pärisnimedega (Ant<onio, Nikol<ajeva, päris mitu)

    L"VLh", 3, // 3	monAR-H:i, monARH:
    L"VLQ", 3, // 3	kAR-T:a, kURT: (aga kUR:D)
    L"VCC", 2, // 2	kUL:M, kAS:T, kAL:-Du, jÕh:v

    //    L"VLss",	3, // 3	mARS:S
    //    L"VLsQ",	3, // 3	kUNS:T (ja kORS:T-Na)
    //    L"VLsC",	3, // 3	vELS:-Ker
    //    L"VLhv",	3, // 3	vURH:V
    //    L"VLhC",	3, // 3	vURH:-Vi
    //    L"VLQL",	3, // 3	pILT:-Lik
    //    L"VLQC",	3, // 3	lONK:S (ja kANT:-SLer, vINT:SK-Lema)
    //    L"VLQQ",	3, // 3	oli lisandusena (pILK:-Lik)

    L"VCCC", 2, // 2	tEK:ST, kAP:S-Lid (ja EK:ST-Ra, gÄN:GST-Rid)

    L"VV", 2, // 2	vÖÖ:
    L"VVV", 2, // 2	[sõi] sAI:A
    L"VVQ", 3, // 3	lAA-T:a, lAAT:
    L"VVC", 2, // 2	vEE:L, krOO:-Ni
    L"VVss", 3, // 3	pOIS:-Se, pOIS:S
    L"VVsQ", 3, // 3	lAA:ST, lAAS:-Tu, sÄÄS:T-Lik	!!! VVsQ# oli 2
    L"VVQs", 3, // 3	lOOT:S, rOOT:S-Lane

    L"VVQL", 3, // 3	kAAT:-Ri
    L"VVQQ", 3, // 3	oli lisandusena, näiteks fOOG:T
    L"VVLQ", 4, // 4	hUULT:, kAAR-T:i (ja kAART:-Lane)
    L"VVCC", 2, // 2	kEE:LD, ja pAA:VST, kEE:L-Du, jUU:RD-Lus, pAA:VST-Lus
    L"VVVC", 2, // 2	lAI:-US
};

Printer PP;

bool can_palat(CFSWString c) {
    if (c.FindOneOf(L"DLNST") > -1) return true;
    return false;
}

bool can_palat1(CFSWString c) {
    if (c.FindOneOf(L"dlnst") > -1) return true;
    return false;
}

bool is_kriips(CFSWString c) {
    if (c.FindOneOf(L"-") > -1) return true;
    return false;
}


bool is_prm(CFSWString c) {
    if (c.FindOneOf(L"<") > -1 || c.FindOneOf(L"?") > -1) return true;
    return false;
}


bool is_koolon(CFSWString c) {
    if (c.FindOneOf(L":") > -1) return true;
    return false;
}

bool is_vokaal(CFSWString c) {
    if (c.FindOneOf(L"aeiouõäöüy") > -1) return true;
    return false;
}

bool js_dift(CFSWString e, CFSWString c) {
    // järgsilpides võõrapäraste diftongide: ia, ie, io, iu, ea, eo, eu, ua, ue, uo, üa, üo tuvastus
    if (e == L'i' && (c == L'a' || c == L'e' || c == L'o' || c == L'u')) return true;
    if (e == L'e' && (c == L'a' || c == L'o' || c == L'u')) return true;
    if (e == L'u' && (c == L'a' || c == L'e' || c == L'o')) return true;
    if (e == L'ü' && (c == L'a' || c == L'o')) return true;
    return false;
}

INTPTR pattern_lookup(CFSWString s) {
    // üldistus: kõik neljased reeglid v.a VLCL (k<indla, j<ärgmine), mis algavad VL-iga on 3, s.h lONKS
    INTPTR res = 3;
    if (s.GetLength() == 4 && s.Left(2) == L"VL") {
        if (s.GetAt(2) == L'C') return res - 1;
        return res;
    }

    res = -1;
    for (INTPTR i = 0; i < patterns_size; i++) {
        if (s == patterns[i].mall) return patterns[i].pos;
    }
    return res;
}

CFSWString tapne_mall(CFSWString s) {
    // varasema shift_pattern asemel

    CFSWString res;
    for (INTPTR i = 0; i < s.GetLength(); i++) {
        CFSWString c = s.GetAt(i);
        if
            (c.FindOneOf(L"jhv") > -1) {
            res += c;
        } else
            if (c.FindOneOf(L"sS") > -1) res += L's';
        else
            if (c.FindOneOf(L"lmnrLN") > -1) res += L'L';
        else
            if (c.FindOneOf(L"kptfšT") > -1) res += L'Q';
        else
            if (is_consonant(c)) res += L'C';
        else
            // esimene peab, teine võib olla V. pikemad vokaaljärjendid (n<eiu, v<iia jms) on malliga VV
            if (is_vowel(s)) {
            if (i < 2) res += L'V';
            else break;
        } else
            // lühem kui 4 või muu vigane jama (<i<i, <i?i vms)
            break;
    }
    return res;
}

CFSWString yldine_mall(CFSWString s) {
    // varasema simplity_pattern asemel (muutusteta)

    CFSWString res;
    for (INTPTR i = 0; i < (s.GetLength()); i++) {
        CFSWString c = s.GetAt(i);
        if (c.FindOneOf(L"jhvsLQ") > -1)
            res += L"C";
        else
            res += c;
    }
    return res;
}

CFSWString sona_foneetiliseks(CFSWString &s) {
    // asendame võõrtähed, soovi korral ć jms, aga vabamorfist tulnud märke ei puudu:
    // ] (palataliseeri), ? (rõhuta) ja < (vältesta) jäävad
    // etapiti, sest varem ei saanud kirjutada näiteks "lic]", sest võrreldi c-d, mitte ts-i

    CFSWString kys, res;

    kys = s.GetAt(s.GetLength() - 1);
    if (kys == L"?") s.Delete(s.GetLength() - 1, 1);

//    wprintf(L"\nsona foneetiliseks\n");
//    for(INTPTR i=0; i < s.GetLength(); i++) wprintf(L"%c", s.GetAt(i));

    for (INTPTR i = 0; i < s.GetLength(); i++) {
        CFSWString c = s.GetAt(i);
        if
            ((c == L'<') || (c == L'?') || (c == L']')) res += c;
        else
            // Exxon -> ekson, XXIII -> ksiii (aga ega ksksiii pole parem)
            if ((c == L'x') && (s.GetAt(i + 1) != L'x')) res += L"ks";
        else
            if (c == L'y') res += L"i";
        else
            if (c == L'w') res += L"v";
        else
            // pizza -> pitsa, piza -> pisa
            if (c == L'z') {
            if (s.GetAt(i + 1) == L'z') res += L"t";
            else res += L"s";
        } else
            if (c == L'c') {
            // sõltub järgnevast vokaalist, < ei piisa (vrd Wis<consin, A le C<oq jms)
            CFSWString cc = s.GetAt(i + 1);
            if (cc == L'<' || cc == L'?') cc = s.GetAt(i + 2);
            if (cc == L'e' || cc == L'i') {
                res += L"ts";
            } else
                res += L"k";
        } else
            // müüa -> müia
            if (c == L'ü' && (is_vowel(s.GetAt(i + 1)) || s.GetAt(i + 1) == L'j') && s.GetAt(i - 1) == L'ü') res += L"i";
        else
            if (c == L'q') {
            // kv kontroll karmimaks kui enne (lihtsalt vokaal oleks viga Quran -> kvran ja Coqi -> kokv puhul)
            res += L"k";
            if ((s.GetAt(i + 1) == L'u') && is_vowel(s.GetAt(i + 2))) s.SetAt(i + 1, L'v');
        } else
            // kustutame kõik muud mittetähed, koos sellega kaob vajadus kutsuda make_char_string
            if (is_char(c)) res += c;
    }
    return res;
}

CFSWString sona_palataliseeri(CFSWString s) {
    // asendame ] konsonandi järel suurtäheliseks ja kaotame ]
    // sama teeme ümbrusega

    CFSWString res;
    INTPTR pos;
    for (INTPTR i = 0; i < s.GetLength(); i++) {
        CFSWString c = s.GetAt(i);
        if (c == L']') {            // palataliseerime temakese ja selle ette jäävad
            pos = res.GetLength() - 1;
            while (pos >= 0) {
                CFSWString t = CFSWString(res.GetAt(pos)).ToUpper();
                if (can_palat(t)) {
                    res.SetAt(pos, t.GetAt(0));
                    pos--;
                } else break;
            }
            // palataliseerime järgnevad
            pos = i + 1;
            while (pos < s.GetLength()) {
                CFSWString t = CFSWString(s.GetAt(pos)).ToUpper();
                if (can_palat(t)) {
                    s.SetAt(pos, t.GetAt(0));
                    pos++;
                } else break;
            }
        } else res += c;
    }
    return res;
}

CFSWString pikad_foneemid(CFSWString s) {
    // mõnede pikkade foneemide: b:, d:, f:, j:, š:, v: 
    // teisendus b: = b, d: = d, f: = ff, j: = i:, š: = šš, v: = vv

    CFSWString res;
    CFSWString c, p;

    for (INTPTR i = 0; i < s.GetLength(); i++) {
        c = s.GetAt(i);
        if (c == L'j' && s.GetAt(i+1) == L':') {  // j:
            res += L'i';
            continue;
        }
        if (c == L':') {
            p = s.GetAt(i-1);
            if (p == L'b' || p == L'D' || p == L'd') continue;  // b:, d:
            if (p == L'f' || p == L'š' || p == L'v') {  // f:, š:, v:
                res += p;
                continue;
            }
        }
        res += c;
    }
    return res;
}

CFSWString ij_palataliseeri(CFSWString s) {

    //  i- ja j-eelse palatalisatsiooni lisamine
    // 

    CFSWString c;
    CFSWString t;
    INTPTR sp12, pos, pos1, prs;
    CFSWString vok[] = {L"a", L"e", L"i", L"o", L"u", L"õ", L"ä", L"ö", L"ü"};
    CFSWString ptk[] = {L"l", L"n", L"s"};
    bool jp = false;
    bool ip = false;

    if(is_kriips(s)) {

        prs = 0;
        if (is_prm(s)) {  // otsime pearohu asukohta
            for (INTPTR i = 0; i < s.GetLength(); i++) {
                c = s.GetAt(i);
                if (c == L'<' || c == L'?') {
                    prs = i;
                    break;
                }
            }
        }
        else {  // kui pearohulist silpi pole margitud, siis otsime natuke kaugemalt pikka vokaali voi l-l, n-n, s-s  
            for (INTPTR i = 2; i < s.GetLength(); i++) {
                c = s.GetAt(i);
                for (INTPTR j = 0; j < 9; j++) {
                    if (c == vok[j] && s.GetAt(i+1) == vok[j]) {
                        prs = i;
                        break;
                    }
                }
                if (prs > 0) break;
                for (INTPTR j = 0; j < 3; j++) {
                    if (c == ptk[j] && s.GetAt(i+1) == L'-' && s.GetAt(i+2) == ptk[j]) {
                        prs = i;
                        break;
                    }
                }
                if (prs > 0) break;
            }
        }
 
        pos = 1;
        for (INTPTR i = prs; i < s.GetLength(); i++) {
            c = s.GetAt(i);
            if (c == L'-') {
                // leidsime 1. ja 2. silbi piiri
                sp12 = i;    // jätame meelde
                if (s.GetAt(sp12+1) == L'j') jp = true;
                t = s.GetAt(sp12+2);
                if (is_koolon(t) == false) {if (t == L'i') ip = true;}
                else {if (s.GetAt(sp12+3) == L'i') ip = true;}
//                wprintf(L" i - %i   sp12 - %i   t - %c ", i, sp12, t.GetAt(0));
//                if (ip == true) wprintf(L" ip = true ");
//                if (is_koolon(t)) wprintf(L"  %c \n", s.GetAt(sp12+3)); 
                if (jp == false && ip == false) break;
		continue;
            }
		// j-eelne
            if (c == L'j' && jp == true) {
                t = s.GetAt(sp12-1);
		if (t == L':') t = s.GetAt(sp12-2);
                if (can_palat1(t)) {
                    for (pos1=sp12-1; pos1 > 0; pos1--) {
                        t = s.GetAt(pos1);
                        if (is_kriips(t) || is_koolon(t)) continue;
                        if (is_vokaal(t)) {
                            pos = pos1 + 1;
                            break;
                        }
                        if (can_palat1(t) == false) return s;
                   }
                   for (pos1 = pos; pos1 < sp12+2; pos1++) {
                        t = CFSWString(s.GetAt(pos1)).ToUpper();
                        if (can_palat(t)) s.SetAt(pos1, t.GetAt(0));
                   }
                }
                jp = false;
                break;
            }
                // i-eelne
            if (c == L'i' && ip == true) {
                t = s.GetAt(sp12+1);
//                wprintf(L" i - %i   sp12 - %i   t - %c\n", i, sp12, t.GetAt(0));
                if (can_palat1(t)) {
                    for (pos1=sp12-1; pos1 > 0; pos1--) {
                        t = s.GetAt(pos1);
                        if (is_kriips(t) || is_koolon(t)) continue;
                        if (is_vokaal(t)) {
                            pos = pos1 + 1;
                            break;
                        }
                        if (can_palat1(t) == false) return s;
                   }
                   for (pos1 = pos; pos1 < sp12+2; pos1++) {
                        t = CFSWString(s.GetAt(pos1)).ToUpper();
                        if (can_palat(t)) s.SetAt(pos1, t.GetAt(0));
                   }
                }
                ip = false;
                break;
            }
 //           res += c;
        }
    }
    return s;
}

CFSWString sona_valtesta(CFSWString s) {
    // asendame < vokaali ees :-ga pikendatava hääliku järel

    CFSWString res;
    CFSWString mall;
    INTPTR pos = -1; // sisuliselt boolean

    for (INTPTR i = 0; i < (s.GetLength()); i++) {
        // arvutame uue pos-i
        CFSWString c = s.GetAt(i);
        if (c == L'<') {
            if (print_syls) fprintf(stderr, "sona: %s\n", ccstr(s));
            // malli pikkus on max 4 märki. edasised ? ja < ei koti, need lõpetavad malli niikuinii
            mall = s.Mid(i + 1, 4);
            mall = tapne_mall(mall);
            pos = pattern_lookup(mall);
            // kui ükski spetsiifilisem mall ei klappinud, siis proovime leida V+C+ vaikimisi reeglit
            if (pos < 0) {
                mall = yldine_mall(mall);
                pos = pattern_lookup(mall);
                if (pos < 0) {
                    fprintf(stderr, "\n###\n\n%s <", ccstr(mall));
                    mall = tapne_mall(mall);
                    fprintf(stderr, " %s < %s\n\n###\n", ccstr(mall), ccstr(s));
                }
            }
            pos = i + pos;
        }
        res += c;
        if (i == pos) res += colon; // t<ikt<ak?
    }
    return res;
}

CFSWString sona_silbita(CFSWString s) {
    // lisame kriipse silbivahedesse (NB < ja ? on endiselt sees ja jäägu, lisaks ka :)

    CFSWString c, ees, res, taga;
    bool ij = false;
    bool js = false;

    res = s.GetAt(0);
    // hi: alustame ühest, esimese tähe ette niikuinii silbipiiri ei tule
    for (INTPTR i = 1; i < s.GetLength(); i++) {
        ees = s.GetAt(i - 1);
        if (ees == L':') ees = s.GetAt(i - 2);
        c = s.GetAt(i);
        taga = s.GetAt(i + 1);
        if (taga == L':') taga = s.GetAt(i + 2);

        if (is_consonant(c)) {
            // ka-na, aka-d<eemia, ra-k?eti
            if (is_vowel(ees) && (is_vowel(taga) || taga == L'<' || taga == '?')) {res += d; js = true;}
            // tup-rub, ap-l<omb, aga mitte p-raak
            if ((is_consonant(ees) && (is_vowel(taga) || taga == L'<' || taga == '?')) && has_vowel(res)) {res += d; js = true;}
        }// siia peaks ehk diftongireegleid lisama
            // teeme praegu kolmesed nii, et V-VV siis kui tagumised on samad, muidu VV-V
        else {
            if (is_vowel(ees) && is_vowel(c) && is_vowel(taga)) {
                if (c.ToLower() == taga && ij == false) res += d; // i-ooni, i-Oon, mei-jOos (ij)
                else {
                    if (ees.ToLower() == L'ü' && c == L'ü') {
                        res += L"i-j"; // püüe
                        ij = true;
                        js = true;
                        continue;
                    }
                    else {
                        if (c == L'i') {
                        ij = true;
                        js = true;
                        if (s.GetAt(i+1) == L':') res += L"i:-j"; // sii:a -> sii:-ja 
                        else res += L"i-j"; // saia, sAia
                        continue;
                        }
                    }
                }
            }
            else {
                if (is_vowel(ees) && is_vowel(c)) {
                    ij = false;
                    if (js && js_dift(ees, c)) res += d; // järgsilbis on võõrapärane diftong
                }
                else if ((c == L'<' || c == L'?') && is_vowel(ees)) {res += d; js = true;}
            }
        }
        if (c == L':' && ij == true) continue;
        res += c;
    }
    return res;
}

bool is_stressed_syl(CFSWString syl) {
    CFSWString c, n;

    bool res = false;
    for (INTPTR i = 0; i < syl.GetLength()-1; i++) {
        c = syl.GetAt(i);
        n = syl.GetAt(i+1);
        if (c == L'<' || c == L'?' || (is_vowel(c) && is_vowel(n) && c == n)) res = true;
    }
    return res;
}

bool IsKPT(CFSWString s) {
    if (s.FindOneOf(L"kptšT")>-1) return true;
    return false;
}

bool IsVoiced(CFSWString s) {
    if (s.FindOneOf(L"gbdfhkptsšST")>-1) return false;
    return true;
}

CFSWString ToGBD(CFSWString s) {
    if (s == L"k") return L"g";
    else
        if (s == L"p") return L"b";
    else
        if (s == L"t") return L"d";
    else
        return s;
}

void AddStress(CFSClassArray<TSyl> &sv, INTPTR wp) {
    /* Kõige radikaalsem rõhutus siiani. 
     * wp = kui on liitsõna esimene liige siis on seal pearõhk.
     */
    INTPTR main_stress;
    if (wp == 0) {
        main_stress = 2;
    } else {
        main_stress = 1;
    }
    INTPTR stress = 1;
    // pearõhk saab olla ainult esimesel osisel liitsõnas

    INTPTR size = sv.GetSize();

    //p.prni(main_stress);

    bool main_applied = false;

    // ühesilbiline
    if (size == 1) {

        sv[0].Syl.Remove(L'<');

        sv[0].Stress = main_stress;

        sv[0].DoQ = 0;

    } else {
        // paneme varasema teadmise järgi algväärtused
        // teadmine on silpidesse jäänud < ja ? ja pika vokaali/diftongiga

        // pearõhk on seal, kus ? (ühtlasi koristame)
        for (INTPTR i = 0; i < size; i++) {

            // liitsõna esimese klusiili parandus


            // eksperimendi korras topeldame pikeneva, aga järgmisesse silpi sattunud laa-t:a -> laat-t:ta
          //  if (i > 0 && sv[i].Syl.GetAt(1) == L':') {
          //      CFSWString c = sv[i].Syl.GetAt(0);
          //      sv[i - 1].Syl += c;
          //  }

            if (sv[i].Syl.Find('?') > -1) {
                sv[i].Stress = main_stress;
                main_applied = true;
                sv[i].Syl.Remove(L'?');
            }
        }

        // või siis seal, kus < (ühtlasi koristame)
        for (INTPTR i = 0; i < size; i++) {
            if (sv[i].Stress > 0) continue; // tsivilisatsi?ooni on is_stressed ja saab muidu uue rõhu
            if (is_stressed_syl(sv[i].Syl)) {
                sv[i].Syl.Remove(L'<');
                if (main_applied) {
                    sv[i].Stress = stress;
                } else {
                    sv[i].Stress = main_stress;
                    main_applied = true;
                }
            }
        }

        // või siis esisilbil, kui polnud ühtki nähtavalt rõhulist
        if (main_applied == false)
            sv[0].Stress = main_stress;

        // kui sõna algusesse jäi rõhutamata silpe, siis rõhutame paarituid
        for (INTPTR i = 0; i < size - 1; i += 2)
            if ((sv[i].Stress == 0) && (sv[i + 1].Stress == 0)) {
                sv[i].Stress = stress;
            } else break;

        // täidame augud (kolm järjestikust rõhutut silpi)
        for (INTPTR i = 0; i < size - 2; i++)
            if ((sv[i].Stress == 0) && (sv[i + 1].Stress == 0) && (sv[i + 2].Stress == 0)) {
                sv[i + 1].Stress = stress;
            }
    }
}

CFSWString word_to_syls(CFSWString word) {
    CFSWString s;
    int i;

    // varasema chars_to_phones_part_I asendus;
    s = sona_foneetiliseks(word);
//    wprintf(L"\nFON_sona pikkus - %i IJ_sona: ", s.GetLength());
//    for(i=0; i < s.GetLength(); i++) wprintf(L"%c", s.GetAt(i));

    s = sona_palataliseeri(s);
//    wprintf(L"\nPALAT_sona pikkus - %i IJ_sona: ", s.GetLength());
//    for(i=0; i < s.GetLength(); i++) wprintf(L"%c", s.GetAt(i));

    // varasema the_shift asendus
    s = sona_valtesta(s);
//    wprintf(L"\nVALDE_sona pikkus - %i IJ_sona: ", s.GetLength());
//    for(i=0; i < s.GetLength(); i++) wprintf(L"%c", s.GetAt(i));

    // osade pikkade foneemide teisendus
    s = pikad_foneemid(s);
//    wprintf(L"\nPIKFON_sona pikkus - %i IJ_sona: ", s.GetLength());
//    for(i=0; i < s.GetLength(); i++) wprintf(L"%c", s.GetAt(i));

    // sõnade silbitus
    s = sona_silbita(s);
//    wprintf(L"\nSILP_sona pikkus - %i IJ_sona: ", s.GetLength());
//    for(i=0; i < s.GetLength(); i++) wprintf(L"%c", s.GetAt(i));

    // ij-eelne palatalisatsioon lisatud
    s = ij_palataliseeri(s);

//    wprintf(L"\nIJ_sona pikkus - %i IJ_sona: ", s.GetLength());
//    for(i=0; i < s.GetLength(); i++) wprintf(L"%c", s.GetAt(i));
//    wprintf(L"\n");


    return s;
}



void TUtterance::DoSyls(TWord& TW) {



    CFSArray<CFSWString> temp_arr, c_words;
    CFSClassArray<TSyl> TSA;
    CFSClassArray<TSyl> TSA_temp;

    INTPTR k, klas, slpp;

    //Kuna siin tulevad DLNST märgentitena siis:
    TW.TWMInfo.m_szRoot = TW.TWMInfo.m_szRoot.ToLower();

    explode(TW.TWMInfo.m_szRoot, L"_", c_words);
    CFSWString s;

    for (INTPTR cw = 0; cw < c_words.GetSize(); cw++) {

        s = word_to_syls(c_words[cw]);
//        PP.prnn(L"DoSyls: " + s);
        explode(s, d, temp_arr);
        TSA_temp.Cleanup();
        for (INTPTR i = 0; i < temp_arr.GetSize(); i++) {
            TSyl T;
            T.Syl = temp_arr[i];
            T.Stress = 0;
            //T.DoPhones(T);
            TSA_temp.AddItem(T);

        }

        AddStress(TSA_temp, cw);

//        for (int x = 0; x < TSA_temp.GetSize(); x ++ ) {
//            PP.prnn(L"peale Addstress "+TSA_temp[x].Syl);
//        }

        INTPTR size = TSA_temp.GetSize();


        for (INTPTR j = 0; j < size; j++) {
            TSyl T = TSA_temp[j];
//            PP.prn(T.Syl);
//            PP.prn(TW.TWMInfo.m_cPOS);
//            PP.prni(T.Stress);
//            PP.prni(T.DoQ);
//            PP.prnn();
//            PP.prnn(T.Syl);
            if (T.Syl.Find(L":", 0) > -1) {
                T.DoQ = 1;
                //T.Syl.Remove(L':');
				//T.Syl = T.Syl + L"w";

            }

            if (size == 1) {
                if (TW.TWMInfo.m_cPOS == L'J' || T.Syl == L"ei" ||
                        T.Syl == L"on" || T.Syl.GetLength() < 4) {

                    if (cw == 0) {
                        T.DoQ = 0;
                        T.Stress = 2;
                    }
                    else {
                        T.Stress = 1;
                    }
                }
            }

            else

                if (j > 0) { //Mitmesilbilise esimest ei vaata, ainult järgnevaid


                CFSWString P, C, N;


                TSyl TPrev = TW.TSA[TW.TSA.GetSize() - 1];

                P = TPrev.Syl.GetAt(TPrev.Syl.GetLength() - 1);
                C = T.Syl.GetAt(0);
                N = T.Syl.GetAt(1);

  //             wprintf(L"\tSilbipiir: %c-%c%c\t", P.GetAt(0), C.GetAt(0), N.GetAt(0));

                if (IsKPT(T.Syl.GetAt(0))) {
  //                  wprintf(L"KPTSaa: %c%c%c\n", P.GetAt(0), C.GetAt(0), N.GetAt(0));
                    if (IsVoiced(P) && IsVoiced(N)) {
                        if (TW.TSA[TW.TSA.GetSize() - 1].DoQ == 0) {
                            TW.TSA[TW.TSA.GetSize() - 1].Syl = TW.TSA[TW.TSA.GetSize() - 1].Syl + C;
                            if (is_koolon(N)) {
                                TW.TSA[TW.TSA.GetSize() - 1].Syl = TW.TSA[TW.TSA.GetSize() - 1].Syl + L":";
                                slpp = T.Syl.GetLength();
                                for (k = 0; k < slpp; k++) {
                                    if (T.Syl.GetAt(k) == L':') {
                                        klas = k;
                                        break;
                                    }
                                }
                                for (k = klas; k < slpp-1; k++) T.Syl.SetAt(k, T.Syl.GetAt(k+1));
                                T.Syl.SetAt(slpp-1, 0);
 //                               wprintf(L"Silbi pikkus = %i\n", slpp);
                            }

                            // Pööran välte tagasi õigeks
                            if (T.DoQ == 1) {
                                T.DoQ = 0;
                                TW.TSA[TW.TSA.GetSize() - 1].DoQ = 1;
                            }

                        }
                    }
                } // KPTlõpp Kiisselil

                else { // lisatud, et kopli => kop:p-li, putru => put:t-ru
                    if (IsVoiced(C)) {
                        if (is_koolon(P)) {
                            C = TPrev.Syl.GetAt(TPrev.Syl.GetLength() - 2);
                            P = TPrev.Syl.GetAt(TPrev.Syl.GetLength() - 3);
                        }
                        else {
                            C = P;
                            P = TPrev.Syl.GetAt(TPrev.Syl.GetLength() - 2);
                        }
                        if (IsKPT(C) && IsVoiced(P)) TW.TSA[TW.TSA.GetSize() - 1].Syl = TW.TSA[TW.TSA.GetSize() - 1].Syl + C;
                    }
                } // kpt lõpp minu lisatud

                if (C == L"j" && P == L"j" ) {
                    TPrev.Syl[TPrev.Syl.GetLength()-1] = L'i';
                    TW.TSA[TW.TSA.GetSize() - 1] = TPrev;
                }

                if ( P == L"i" && C == L"j" && N == L"a" && T.DoQ == 1) {
   //                 PP.prnn(L"\t[" + P + L" " + C + L" " + N + L"] " + TPrev.Syl + L" " + T.Syl);
                    T.DoQ = 0;
                    TW.TSA[TW.TSA.GetSize() - 1].DoQ = 1;

                }

            }


 //           PP.prn(T.Syl);
 //           PP.prn(TW.TWMInfo.m_cPOS);
 //           PP.prni(T.Stress);
 //           PP.prni(T.DoQ);
 //           PP.prnn();


            TW.TSA.AddItem(T);
        }

    }



    TW.e2 = TW.TSA.GetSize();
    // Välde on ikka silbi, mitte foneemi omadus :)

    for (INTPTR i = 0; i < TW.TSA.GetSize(); i++) {

        //PP.pr(TW.TSA[i].Syl);
        //PP.prni(TW.TSA[i].Stress);
        //PP.prni(TW.TSA[i].DoQ);


        TW.TSA[i].DoPhones(TW.TSA[i]);
    }

    //PP.prnn();
    //PP.prnn();
}

