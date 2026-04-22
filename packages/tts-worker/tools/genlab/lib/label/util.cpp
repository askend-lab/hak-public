#include <iostream>
#include "../etana/proof.h"
#include "util.h"

// lyhendid parandatud

bool is_lvowel (CFSWString c) {
	if (c.FindOneOf(L"aeiouõäöüy") > -1)	return true;
		return false;
}

bool is_uvowel (CFSWString c) {
	if (c.FindOneOf(L"AEIOUÕÄÖÜY") > -1)	return true;
		return false;
}

bool is_lconsonant (CFSWString c) {
	if (c.FindOneOf(L"bcdfghjklmnpqrsšžtvwxz") > -1)	return true;
		return false;
}

bool is_uconsonant (CFSWString c) {
	if (c.FindOneOf(L"BCDFGHJKLMNPQRSŠŽTVWXZ") > -1) return true;
		return false;
}

bool is_ending (CFSWString c) {
	if (c.FindOneOf(L".?!;") > -1)	return true;
		return false;
}

bool is_palat (CFSWString c) {
	if (c.FindOneOf(L"]") > -1)	return true;
		return false;
}

bool has_palat (CFSWString c) {
	if (c.FindOneOf(L"dlnst") > -1)	return true;
		return false;
}


bool is_tab (CFSWString c) {
	if (c.FindOneOf(L"\t\n") > -1)	return true;
		return false;
}

bool is_break (CFSWString c) {
	if (c.FindOneOf(L"\n") > -1)	return true;
		return false;
}

bool is_space (CFSWString c) {
	if (c.FindOneOf(sp) > -1)	return true;
		return false;
}

bool is_fchar (CFSWString c) {
	if (c.FindOneOf(L"ÀÁÂÃàáâãÈÉÊËèéêëÌÍÎÏŸÝìíîïÿýÒÓÔÅòóôåÙÚÛùúûæÆØŒøœñÑçÇßÐÞðþ") > -1)	return true;
		return false;
}

bool is_underscore (CFSWString c) { //liitsõna värk, selleks lahku
	if (c.FindOneOf(L"_") > -1)	return true;
		return false;
}

bool is_symbol (CFSWString c) {
	if ( (c.FindOneOf(L"-*@#€$£%&/\\=+~<>§αβγδ") > -1) || is_underscore(c)) 	return true;
		return false;
}

bool is_digit (CFSWString c) {
	if (c.FindOneOf(L"0123456789") > -1)	return true;
		return false;
}

bool is_colon (CFSWString c) {
	if (c.FindOneOf(L":") > -1)	return true;
		return false;
}

bool is_semicolon (CFSWString c) {
	if (c.FindOneOf(L";") > -1)	return true;
		return false;
}

bool is_comma (CFSWString c) {
	if (c.FindOneOf(L",") > -1)	return true;
		return false;
}

bool is_dash (CFSWString c) {
	if (c.FindOneOf(L"–") > -1)	return true;
		return false;
}

bool is_hyphen (CFSWString c) {
	if (c.FindOneOf(L"-") > -1)	return true;
		return false;
}

bool is_bbracket (CFSWString c) {
	if (c.FindOneOf(L"([{") > -1)	return true;
		return false;
}

bool is_ebracket (CFSWString c) {
	if (c.FindOneOf(L")]}") > -1)	return true;
		return false;
}

bool is_bhyphen (CFSWString c) {
	if (is_hyphen(c) || is_dash(c)) return true;
		return false;
}


bool is_whitespace (CFSWString c) {
	if (is_tab(c) || is_space(c)) return true;
		return false;
}

bool is_vowel (CFSWString c) {
	if (is_lvowel(c) || is_uvowel(c)) return true;
		return false;
}

bool is_consonant (CFSWString c) {
	if (is_lconsonant(c) || is_uconsonant(c))	return true;
		return false;
}

bool is_upper (CFSWString c) {
	if (is_uconsonant(c) || is_uvowel(c))	return true;
		return false;
}

bool is_char (CFSWString c) {
	if (is_vowel(c) || is_consonant(c))	return true;
		return false;
}

bool is_conju (CFSWString c) {
	if (c == L"ja" || c == L"ning" || c == L"ega" || c == L"ehk" || c == L"või")	return true;
		return false;
}

bool is_compound_word (CFSWString c) {
		for (INTPTR i = 0; i < c.GetLength(); i++)
			if (is_underscore(c.GetAt(i))) return true;
		return false;
}

bool is_upper_word (CFSWString c) {
		for (INTPTR i = 0; i < c.GetLength(); i++)
			if (!is_upper(c.GetAt(i))) return false;
		return true;
}


bool is_fsymbol (CFSWString c) { //ainult tüübiarray jaoks
	if (is_symbol(c) || is_ending(c) || is_colon(c) || is_dash(c) || is_hyphen(c) || is_comma(c))	return true;
		return false;
}


bool has_vowel(CFSWString s) {
		for (INTPTR i = 0; i < s.GetLength(); i++)	{
			if (is_vowel(s.GetAt(i))) return true;
		}
		return false;
}

INTPTR ctype (CFSWString c) {
	if (is_char(c)) return 1;
		else
	if (is_fsymbol(c)) return 2;
	 else
	if (is_digit(c)) return 3;
	return 0;
}

void make_ctype_array (CFSWString s, CFSArray<CFSWString> &a) {
	for (INTPTR i = 0; i < s.GetLength(); i++)	{
		CFSWString c = s.GetAt(i);
		if (i == 0) {
			a.AddItem(c);
		}
		else {
			INTPTR arr_size = a.GetSize()-1;
			CFSWString lc = a[arr_size];
			lc = lc.GetAt(lc.GetLength()-1);
			if ( ctype(c) == ctype(lc) ) 
					a[arr_size] += c;			
				else 
					a.AddItem(c);
		}
	}
}


void MakeTypeArray (CFSWString s, CFSClassArray<TTypeRecord> &a) {
	TTypeRecord T;
	for (INTPTR i = 0; i < s.GetLength(); i++)	{
		CFSWString c = s.GetAt(i);
		if (i == 0) {
			T.s = c;
			a.AddItem(T);
		}
		else {
			INTPTR arr_size = a.GetSize()-1;
			CFSWString lc = a[arr_size].s;
			lc = lc.GetAt(lc.GetLength()-1);
			if ( ctype(c) == ctype(lc) ) 
					a[arr_size].s += c;			
				else {
				T.s = c;
				a.AddItem(T);
				}
		}
	}
	
	for (INTPTR i = 0; i < a.GetSize(); i++) {		
		a[i].Type = ctype(a[i].s.GetAt(0));
	}
/*	P.prnn(L"MAKE TYPE ARRAYST");
	for (INTPTR i = 0; i < a.GetSize(); i++) {
		P.prn(a[i].s);
		P.prni(a[i].Type);
		P.prnn();
	
	}
*/
}



CFSWString make_char_string (CFSWString c) {
	CFSWString res;
	for (INTPTR i = 0; i < c.GetLength(); i++)	{
		if (is_char(c.GetAt(i))) res += c.GetAt(i);
	}		
	return res;
}
CFSWString make_digit_string (CFSWString c) {
	CFSWString res;
	for (INTPTR i = 0; i < c.GetLength(); i++)	{
		if (is_digit(c.GetAt(i))) res += c.GetAt(i);
	}		
	return res;
}

CFSWString its(INTPTR i) {
    /* kui foneeme on lausungis rohkem, kui 1M - kukub */
    if (i < 0) return L"x";
    CFSWString s = empty_str;
    wchar_t buffer [8];
    swprintf(buffer, 8, L"%i", i);
    s += buffer;
    return s;
}
INTPTR explode(CFSWString s, CFSWString cSplitter, CFSArray<CFSWString> &Array) {
	Array.Cleanup();
	INTPTR ipStart=0;
	for (INTPTR ip=0; ip<s.GetLength(); ip++){
		if (s.GetAt(ip)==cSplitter){
			Array.AddItem(s.Mid(ipStart, ip-ipStart));
			ipStart=ip+1;
		}
		else
		if (cSplitter.GetLength() == 0)
			Array.AddItem(s.GetAt(ip));
	}
	if (cSplitter.GetLength() > 0) 
		Array.AddItem(s.Mid(ipStart));
	return Array.GetSize();
}


CMorphInfo clean_anaroot_output (CMorphInfo MI) {
	CFSWString s;
	for (INTPTR i=0; i < MI.m_szRoot.GetLength(); i++) {
		if (MI.m_szRoot.GetAt(i) != L'=') s += MI.m_szRoot.GetAt(i);
	}	
	MI.m_szRoot = s;
	return MI;
}

bool NumberIsOK(CFSWString s) {
	//return false;
	if (make_digit_string(s).GetLength() == s.GetLength()) return true;
	CFSArray<CFSWString> A;
	s.Replace(L".", L",", 1);
	int x = explode(s, L",", A);
	
	if ( A.GetSize() == 2){ 
		if (A[0].GetLength() == make_digit_string(A[0]).GetLength()
			&&
			A[1].GetLength() == make_digit_string(A[1]).GetLength()
			)       
		{
			
			return true;
		}
	}

	return false;
}


const char* ccstr (CFSWString s) {
    return FSStrWtoA(s, FSCP_UTF8);
}


INTPTR is_abbreviation(CFSWString s, CFSArray<CFSWString> &a) {
    // Lühendid EKRst
    if (s.GetAt(s.GetLength() - 1) == L'.') s.Delete(s.GetLength() - 1, 1);


//    if (s == L"aj") return explode(L"ajutine", sp, a);
    if (s == L"ak") return explode(L"arveldus_konto", sp, a);
    if (s == L"apr") return explode(L"apr<ill", sp, a);
    if (s == L"AS") return explode(L"<aktsia_s<elts", sp, a);
    if (s == L"aug") return explode(L"<august", sp, a);
    if (s == L"aü") return explode(L"ameti_ühing", sp, a);
    if (s == L"ca") return explode(L"tsirka", sp, a);
    if (s == L"dets") return explode(L"dets<ember", sp, a);
  //  if (s == L"dl") return explode(L"dessert_lusika_täis", sp, a);
    if (s == L"dots") return explode(L"dots<ent", sp, a);
    if (s == L"dr") return explode(L"d<oktor", sp, a);
    if (s == L"eKr") return explode(L"<enne Kr<istuse s<ündi", sp, a);
    if (s == L"EL") return explode(L"Eur<oopa L<iit", sp, a);
    if (s == L"e.m.a") return explode(L"<enne meie aja_arvamist", sp, a);
//    if (s == L"end") return explode(L"endine", sp, a);
    if (s == L"FIE") return explode(L"füüsilisest isikust <ette_v<õtja", sp, a);
    //if (s == L"hr") return explode(L"härra", sp, a);
    if (s == L"hrl") return explode(L"harilikult", sp, a);
    if (s == L"ik") return explode(L"isiku_k<ood", sp, a);
  //  if (s == L"ins") return explode(L"insener", sp, a);
  //  if (s == L"it") return explode(L"info_tehnoloogia", sp, a);
    if (s == L"IT") return explode(L"info_tehnol<oogia", sp, a);
    if (s == L"j.a") return explode(L"juures asuv", sp, a);
  //  if (s == L"jaan") return explode(L"jaanuar", sp, a);
  // ?  if (s == L"jj") return explode(L"ja järgmine", sp, a);
  // ?  if (s == L"jm") return explode(L"ja muud", sp, a);
    if (s == L"jms") return explode(L"ja m<uud sellised", sp, a);
    if (s == L"jmt") return explode(L"ja mitmed teised", sp, a);
  // ?  if (s == L"jn") return explode(L"joonis", sp, a);
    if (s == L"jne") return explode(L"ja n<ii edasi", sp, a);
    if (s == L"jpt") return explode(L"ja p<aljud teised", sp, a);
  //  if (s == L"jr") return explode(L"juunior", sp, a);
    if (s == L"jrk") return explode(L"järje_k<ord", sp, a);
    if (s == L"jsk") return explode(L"j<aos_k<ond", sp, a);
    if (s == L"jt") return explode(L"ja teised", sp, a);
    if (s == L"juh") return explode(L"juhataja", sp, a);
    if (s == L"jun") return explode(L"j<uunior", sp, a);
  //  if (s == L"jv") return explode(L"järv", sp, a);
    if (s == L"k.a") return explode(L"k<aasa arvatud", sp, a);
  // ?  if (s == L"kd") return explode(L"köide", sp, a);
    if (s == L"kg") return explode(L"kilo_gr<amm", sp, a);
    if (s == L"khk") return explode(L"kihel_k<ond", sp, a);
 //   if (s == L"kk") return explode(L"kesk_kool", sp, a);
 //   if (s == L"kl") return explode(L"kell", sp, a);
    if (s == L"knd") return explode(L"kandid<aat", sp, a);
    if (s == L"kod") return explode(L"kodanik", sp, a);
  //  if (s == L"kpl") return explode(L"kauplus", sp, a);
  //  if (s == L"kr") return explode(L"kroon", sp, a);
  // ?  if (s == L"kt") return explode(L"kohuse_täitja", sp, a);
  //  if (s == L"kub") return explode(L"kubermang", sp, a);
  //  if (s == L"kv") return explode(L"kvartal", sp, a);
    if (s == L"KÜ") return explode(L"k<orteri_ühistu", sp, a);
    if (s == L"lg") return explode(L"lõige", sp, a);
  //  if (s == L"lj") return explode(L"linna_jagu", sp, a);
    if (s == L"lk") return explode(L"lehe_k<ülg", sp, a);
  //  if (s == L"LK") return explode(L"loodus_kaitse all", sp, a);
  //  if (s == L"lm") return explode(L"liidu_maa", sp, a);
  //  if (s == L"lo") return explode(L"linna_osa", sp, a);
    if (s == L"lp") return explode(L"lugu_p<eetud", sp, a);
    if (s == L"lüh") return explode(L"lühemalt", sp, a); 
  //  if (s == L"M") return explode(L"meestele", sp, a);
    if (s == L"mag") return explode(L"mag<ister", sp, a);
    if (s == L"m.a.j") return explode(L"meie aja_arvamise j<ärgi", sp, a);
    if (s == L"mh") return explode(L"m<uu_hulgas", sp, a);
  //  if (s == L"min") return explode(L"minut", sp, a);
  // ? if (s == L"mk") return explode(L"maa_kond", sp, a);
    if (s == L"mld") return explode(L"m<iljard", sp, a);
    if (s == L"mln") return explode(L"m<iljon", sp, a);
    if (s == L"mnt") return explode(L"m<aantee", sp, a);
    if (s == L"mob") return explode(L"mob<iil_telefon", sp, a);
 //   if (s == L"ms") return explode(L"muu_seas", sp, a);
    if (s == L"MTÜ") return explode(L"m<itte_tulundus_ühing", sp, a);
    if (s == L"nim") return explode(L"nimeline", sp, a);
    if (s == L"nn") return explode(L"n<ii_nimetatud", sp, a);
    if (s == L"nov") return explode(L"nov<ember", sp, a);
    if (s == L"nr") return explode(L"n<umber", sp, a);
    if (s == L"nt") return explode(L"n<äiteks", sp, a);
    if (s == L"nö") return explode(L"n<ii öelda", sp, a);
    if (s == L"okt") return explode(L"okt<oober", sp, a);
    if (s == L"osk") return explode(L"osa_k<ond", sp, a);
    if (s == L"OÜ") return explode(L"osa_ühing", sp, a);
//    if (s == L"pa") return explode(L"pool_aasta", sp, a);
//    if (s == L"pk") return explode(L"post_kast", sp, a);
    if (s == L"pKr") return explode(L"pärast Kr<istuse s<ündi", sp, a);
    if (s == L"pms") return explode(L"p<eamiselt", sp, a);
    if (s == L"p.o") return explode(L"p<eab olema", sp, a);
 //   if (s == L"pr") return explode(L"proua", sp, a);
    if (s == L"prl") return explode(L"preili", sp, a);
    if (s == L"prof") return explode(L"prof<essor", sp, a);
  //  if (s == L"ps") return explode(L"pool_saar", sp, a);
    if (s == L"pst") return explode(L"puies_t<ee", sp, a);
    if (s == L"ptk") return explode(L"p<ea_t<ükk", sp, a);
  //  if (s == L"raj") return explode(L"rajoon", sp, a);
    if (s == L"rbl") return explode(L"rubla", sp, a);
  //  if (s == L"RE") return explode(L"riigi_ettevõte", sp, a);
  //  if (s == L"reg") return explode(L"registreerimis", sp, a);
   // if (s == L"rg") return explode(L"registri", sp, a);
    if (s == L"rmtk") return explode(L"r<aamatu_kogu", sp, a);
  //  if (s == L"rkl") return explode(L"riigi_kogu_liige", sp, a);
    if (s == L"rtj") return explode(L"r<aud_t<ee_j<aam", sp, a);
    if (s == L"SA") return explode(L"s<iht_asutus", sp, a);
    if (s == L"s.a") return explode(L"sel <aastal", sp, a);
    if (s == L"saj") return explode(L"sajand", sp, a);
 //   if (s == L"sh") return explode(L"seal_hulgas", sp, a);
    if (s == L"sen") return explode(L"s<eenior", sp, a);
    if (s == L"sept") return explode(L"sept<ember", sp, a);
    if (s == L"skp") return explode(L"selle k<uu päeval", sp, a);
    if (s == L"spl") return explode(L"supi_lusika_t<äis", sp, a);
    if (s == L"sl") return explode(L"supi_lusika_t<äis", sp, a);
 //   if (s == L"sm") return explode(L"seltsi_mees", sp, a);
    if (s == L"s.o") return explode(L"s<ee on", sp, a);
    if (s == L"s.t") return explode(L"s<ee tähendab", sp, a);
 //   if (s == L"st") return explode(L"see tähendab", sp, a);
    if (s == L"stj") return explode(L"s<aatja", sp, a);
    if (s == L"srn") return explode(L"s<urnud", sp, a);
   // if (s == L"sü") return explode(L"säilitus_üksus", sp, a);
 //   if (s == L"snd") return explode(L"sündinud", sp, a);
 //   if (s == L"tehn") return explode(L"tehniline", sp, a);
    if (s == L"tel") return explode(L"telefon", sp, a);
// ?    if (s == L"tk") return explode(L"tükk", sp, a);
    if (s == L"tl") return explode(L"t<ee_lusika_täis", sp, a);
    if (s == L"tlk") return explode(L"t<õlkija", sp, a);
    if (s == L"Tln") return explode(L"T<allinn", sp, a);
 //   if (s == L"tn") return explode(L"tänav", sp, a);
 //   if (s == L"tr") return explode(L"trükk", sp, a);
    if (s == L"Trt") return explode(L"T<artu", sp, a);
 //   if (s == L"u") return explode(L"umbes", sp, a); 
    if (s == L"ukj") return explode(L"uue kal<endri j<ärgi", sp, a);
    if (s == L"UÜ") return explode(L"usaldus_ühing", sp, a);
 //   if (s == L"v.a") return explode(L"välja arvatud", sp, a);
    if (s == L"van") return explode(L"vananenud", sp, a);
//    if (s == L"VE") return explode(L"väike_ettevõte", sp, a);
    if (s == L"veebr") return explode(L"v<eebruar", sp, a);
    if (s == L"vkj") return explode(L"vana kal<endri j<ärgi", sp, a);
// ?   if (s == L"vm") return explode(L"või muud", sp, a);
    if (s == L"vms") return explode(L"v<õi m<uu s<eesugune", sp, a);
    if (s == L"vrd") return explode(L"v<õrdle", sp, a);
    if (s == L"vt") return explode(L"v<aata", sp, a);
    if (s == L"õa") return explode(L"<õppe_aasta", sp, a);
 //   if (s == L"õp") return explode(L"õpetaja", sp, a);
    if (s == L"õpil") return explode(L"õpilane", sp, a);
    if (s == L"ÄÜ") return explode(L"äri_ühing", sp, a);
    if (s == L"ÜE") return explode(L"ühis_ette_võte", sp, a);
    if (s == L"SEK") return explode(L"Rootsi kr<ooni", sp, a);
    if (s == L"NOK") return explode(L"Norra kr<ooni", sp, a);
    if (s == L"RUR") return explode(L"Vene rubla", sp, a);
    if (s == L"USD") return explode(L"d<ollar", sp, a);
    if (s == L"GBP") return explode(L"n<ael", sp, a);
    if (s == L"LVL") return explode(L"l<att", sp, a);
    if (s == L"LTL") return explode(L"l<itt", sp, a);
    if (s == L"EEK") return explode(L"kr<oon", sp, a);
    
 //   if (s == L"m") return explode(L"meeter", sp, a);
    if (s == L"mm") return explode(L"milli_m<eeter", sp, a);
    if (s == L"cm") return explode(L"senti_m<eeter", sp, a);
    if (s == L"dm") return explode(L"detsi_m<eeter", sp, a);
 //   if (s == L"km") return explode(L"kilo_meeter", sp, a);
  
    if (s == L"cl") return explode(L"senti_l<iiter", sp, a);
    if (s == L"ml") return explode(L"milli_l<iiter", sp, a);
    if (s == L"dl") return explode(L"detsi_l<iiter", sp, a);
  
    if (s == L"gr") return explode(L"gr<amm", sp, a);
    if (s == L"kg") return explode(L"kilo_gr<amm", sp, a);
 // if (s == L"t") return explode(L"tonn", sp, a);
 
 //   if (s == L"h") return explode(L"tund", sp, a);
 //   if (s == L"s") return explode(L"sekund", sp, a);
    if (s == L"m/s") return explode(L"m<eetrit sekundis", sp, a);
    if (s == L"km/h") return explode(L"kilo_m<eetrit tunnis", sp, a);
    if (s == L"km/t") return explode(L"kilo_m<eetrit tunnis", sp, a);
  
    if (s == L"m2") return explode(L"r<uut_m<eeter", sp, a);
    if (s == L"m3") return explode(L"k<uup_m<eeter", sp, a);
    if (s == L"Hz") return explode(L"h<erts", sp, a);
    if (s == L"kW") return explode(L"kilo_v<att", sp, a);
    if (s == L"kWh") return explode(L"kilo_v<att_t<und", sp, a);
    if (s == L"dB") return explode(L"detsi_b<ell", sp, a);
    if (s == L"km2") return explode(L"r<uut_kilo_m<eeter", sp, a);
    if (s == L"mg") return explode(L"milli_gr<amm", sp, a);
    if (s == L"mbar") return explode(L"milli_b<aar", sp, a);
    
	
	return 0;
}


CFSWString replace_fchar (CFSWString c) {
	if (c == L"À") return L"a";
	if (c == L"Á") return L"a";
	if (c == L"Â") return L"a";
	if (c == L"Ã") return L"a";
	if (c == L"à") return L"a";
	if (c == L"á") return L"a";
	if (c == L"â") return L"a";
	if (c == L"ã") return L"a";
	if (c == L"È") return L"e";
	if (c == L"É") return L"e";
	if (c == L"Ê") return L"e";
	if (c == L"Ë") return L"e";
	if (c == L"è") return L"e";
	if (c == L"é") return L"e";
	if (c == L"ê") return L"e";
	if (c == L"ë") return L"e";
	if (c == L"Ì") return L"i";
	if (c == L"Í") return L"i";
	if (c == L"Î") return L"i";
	if (c == L"Ï") return L"i";
	if (c == L"Ÿ") return L"i";
	if (c == L"Ý") return L"i";
	if (c == L"ì") return L"i";
	if (c == L"í") return L"i";
	if (c == L"î") return L"i";
	if (c == L"ï") return L"i";
	if (c == L"ÿ") return L"ü";
	if (c == L"ý") return L"ü";
	if (c == L"Ò") return L"o";
	if (c == L"Ó") return L"o";
	if (c == L"Ô") return L"o";
	if (c == L"Å") return L"o";
	if (c == L"ò") return L"o";
	if (c == L"ó") return L"o";
	if (c == L"ô") return L"o";
	if (c == L"å") return L"o";
	if (c == L"Ù") return L"u";
	if (c == L"Ú") return L"u";
	if (c == L"Û") return L"u";
	if (c == L"ù") return L"u";
	if (c == L"ú") return L"u";
	if (c == L"û") return L"u";
	if (c == L"æ") return L"ä";
	if (c == L"Æ") return L"ä";
	if (c == L"Ø") return L"ö";
	if (c == L"Œ") return L"ö";
	if (c == L"ø") return L"ö";
	if (c == L"œ") return L"ö";
	if (c == L"ñ") return L"n";
	if (c == L"Ñ") return L"n";
	if (c == L"ç") return L"s";
	if (c == L"Ç") return L"s";
	if (c == L"ß") return L"s";
	if (c == L"Ð") return L"k";
	if (c == L"Þ") return L"k";
	if (c == L"ð") return L"k";
	if (c == L"þ") return L"k";	
        
	return L"a";
}

CFSWString replace_schar (CFSWString c) {
    c = c.ToLower();
    if (c == L"a") return L"<aa";
    if (c == L"b") return L"b<ee";
    if (c == L"c") return L"ts<ee";
    if (c == L"d") return L"d<ee";
    if (c == L"e") return L"<ee";
    if (c == L"f") return L"<ef";
    if (c == L"g") return L"g<ee";
    if (c == L"h") return L"h<aa";
    if (c == L"i") return L"<ii";
    if (c == L"j") return L"j<ott";
    if (c == L"k") return L"k<aa";
    if (c == L"l") return L"<ell";
    if (c == L"m") return L"<emm";
    if (c == L"n") return L"<enn";
    if (c == L"o") return L"<oo";
    if (c == L"p") return L"p<ee";
    if (c == L"q") return L"k<uu";
    if (c == L"r") return L"<er";
    if (c == L"s") return L"<ess";
    if (c == L"š") return L"sh<aa";
    if (c == L"ž") return L"sh<ee";
    if (c == L"t") return L"t<ee";
    if (c == L"u") return L"<uu";
    if (c == L"v") return L"v<ee";
    if (c == L"w") return L"kaksisvee";
    if (c == L"õ") return L"<õõ";
    if (c == L"ä") return L"<ää";
    if (c == L"ö") return L"<öö";
    if (c == L"ü") return L"<üü";
    if (c == L"x") return L"<iks";
    if (c == L"y") return L"igrek";
    if (c == L"z") return L"ts<ett";
    if (c == L".") return L"p<unkt";
    if (c == L",") return L"koma";
    if (c == L":") return L"k<oolon";
    if (c == L";") return L"semi_k<oolon";
    if (c == L"-") return L"kr<iips";
    if (c == L"–") return L"m<õtte_kr<iips";
    if (c == L"_") return L"ala_kr<iips";
    if (c == L"*") return L"t<ärn";
    if (c == L"!") return L"hüüu_m<ärk";
    if (c == L"?") return L"küsimärk";
    if (c == L"@") return L"<ätt";
    if (c == L"#") return L"trellid";
    if (c == L"€") return L"eurot";
    if (c == L"$") return L"d<ollarit";
    if (c == L"£") return L"n<aela";
	if (c == L"§") return L"paragr<aaf";
    if (c == L"%") return L"prots<enti";
    if (c == L"°") return L"kr<aadi";
	if (c == L"&") return L"<änd";
    if (c == L"/") return L"k<ald_kr<iips";
    if (c == L"\\") return L"tagurpidi k<ald_kr<iips";
    if (c == L"=") return L"v<õrdub";
    if (c == L"+") return L"pl<uss";
    if (c == L"~") return L"tilde";
    if (c == L">") return L"suurem kui";
    if (c == L"<") return L"väiksem kui";
    if (c == L"(") return L"s<ulgudes";
    if (c == L"[") return L"n<urk_s<ulgudes";
    if (c == L"{") return L"l<oog_s<ulgudes";
    if (c == L"α") return L"alfa";
    if (c == L"β") return L"beeta";
    if (c == L"γ") return L"gamma";
    if (c == L"δ") return L"delta";
	
    
    return L"";
}












