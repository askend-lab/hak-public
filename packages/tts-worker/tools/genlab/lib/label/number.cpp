/*
 * IntToStr by fun2code. http://www.cplusplus.com/forum/lounge/74394/
 * RomanToDecimal by https://www.geeksforgeeks.org/
 */
#include "../etana/proof.h"
#include "util.h"

// numbrid fm

int value(char r) 
{ 
    if (r == 'I') 
        return 1; 
    if (r == 'V') 
        return 5; 
    if (r == 'X') 
        return 10; 
    if (r == 'L') 
        return 50; 
    if (r == 'C') 
        return 100; 
    if (r == 'D') 
        return 500; 
    if (r == 'M') 
        return 1000; 
  
    return -1; 
}

INTPTR RomanToDecimal(CFSWString &str) {
	int res = 0;
	for (int i = 0; i < str.GetLength(); i++) {
		int s1 = value(str[i]);
		if (i + 1 < str.GetLength()) {
			int s2 = value(str[i + 1]);
			if (s1 >= s2) {
				res = res + s1;
			}
			else {
				res = res + s2 - s1;
				i++;
			}
		}
		else {
			res = res + s1;
		}
	}
	return res;
}



void Fill(CFSWString *a, CFSWStringArray &b, INTPTR c) {

	for (INTPTR i = 0; i < c; i++) {
		b.AddItem(a[i]);
	}

}

CFSWString IntToStr(CFSWString numStr, bool Ordinal, INTPTR decl, bool Sg) {
	CFSWString rs;
	numStr = make_digit_string(numStr);

	CFSWString onesNimetav[] = {
		L"<üks", L"k<aks", L"k<olm", L"neli", L"v<iis", L"k<uus", L"seitse", L"kaheksa", L"üheksa"
	};

	CFSWString teensNimetav[] = {
		L"kümme", L"<üks_t<eist", L"k<aks_t<eist", L"k<olm_t<eist", L"neli_t<eist", L"v<iis_t<eist", L"k<uus_t<eist", L"seitse_t<eist", L"kaheksa_t<eist", L"üheksa_t<eist"
	};

	CFSWString tensNimetav[] = {
		L"k<aks_kümmend", L"k<olm_kümmend", L"neli_kümmend", L"v<iis_kümmend", L"k<uus_kümmend", L"seitse_kümmend", L"kaheksa_kümmend", L"üheksa_kümmend"
	};


	CFSWString onesOmastav[] = {
		L"ühe", L"kahe", L"kolme", L"nelja", L"viie", L"kuue", L"seitsme", L"kaheksa", L"üheksa",
	};

	CFSWString teensOmastav[] = {
		L"k<ümne", L"ühe_t<eist_k<ümne", L"kahe_t<eist_k<ümne", L"kolme_t<eist_k<ümne", L"nelja_t<eist_k<ümne",
		L"viie_t<eist_k<ümne", L"kuue_t<eist_k<ümne", L"seitsme_t<eist_k<ümne", L"kaheksa_t<eist_k<ümne", L"üheksa_t<eist_k<ümne"
	};

	CFSWString tensOmastav[] = {
		L"kahe_k<ümne", L"kolme_k<ümne", L"nelja_k<ümne", L"viie_k<ümne", L"kuue_k<ümne", L"seitsme_k<ümne", L"kaheksa_k<ümne", L"üheksa_k<ümne"
	};

	CFSWString onesNimetavJarg[] = {
		L"esimene", L"teine", L"kolmas", L"neljas", L"viies", L"kuues", L"s<eitsmes", L"kaheksas", L"üheksas"
	};

	CFSWString teensNimetavJarg[] = {
		L"k<ümnes", L"ühe_t<eist_k<ümnes", L"kahe_t<eist_k<ümnes", L"kolme_t<eist_k<ümnes", L"nelja_t<eist_k<ümnes",
		L"viie_t<eist_k<ümnes", L"kuue_t<eist_k<ümnes", L"seitsme_t<eist_k<ümnes", L"kaheksa_t<eist_k<ümnes", L"üheksa_t<eist_k<ümnes"
	};
	CFSWString tensNimetavJarg[] = {
		L"kahe_k<ümnes", L"kolme_k<ümnes", L"nelja_k<ümnes", L"viie_k<ümnes", L"kuue_k<ümnes", L"seitsme_k<ümnes", L"kaheksa_k<ümnes", L"üheksa_k<ümnes"
	};

	CFSWString onesOmastavJarg[] = {
		L"esimese", L"teise", L"kolmanda", L"neljanda", L"viienda", L"kuuenda", L"s<eitsmenda", L"kaheksanda", L"üheksanda",
	};
	CFSWString teensOmastavJarg[] = {
		L"k<ümnenda", L"ühe_t<eist_k<ümnenda", L"kahe_t<eist_k<ümnenda", L"kolme_t<eist_k<ümnenda", L"nelja_t<eist_k<ümnenda",
		L"viie_t<eist_k<ümnenda", L"kuue_t<eist_k<ümnenda", L"seitsme_t<eist_k<ümnenda", L"kaheksa_t<eist_k<ümnenda", L"üheksa_t<eist_k<ümnenda"
	};
	CFSWString tensOmastavJarg[] = {
		L"kahe_k<ümnenda", L"kolme_k<ümnenda", L"nelja_k<ümnenda", L"viie_k<ümnenda", L"kuue_k<ümnenda", L"seitsme_k<ümnenda", L"kaheksa_k<ümnenda", L"üheksa_k<ümnenda"
	};

	CFSWString onesOsastavJarg[] = {
		L"esimest", L"t<eist", L"kolmandat", L"neljandat", L"v<iiendat", L"k<uuendat", L"s<eitsmendat", L"kaheksandat", L"üheksandat"
	};
	CFSWString teensOsastavJarg[] = {
		L"k<ümnendat", L"ühe_t<eist_k<ümnendat", L"kahe_t<eist_k<ümnendat", L"kolme_t<eist_k<ümnendat", L"nelja_t<eist_k<ümnendat",
		L"viie_t<eist_k<ümnendat", L"kuue_t<eist_k<ümnendat", L"seitsme_t<eist_k<ümnendat", L"kaheksa_t<eist_k<ümnendat", L"üheksa_t<eist_k<ümnendat"
	};
	CFSWString tensOsastavJarg[] = {
		L"kahe_k<ümnendat", L"kolme_k<ümnendat", L"nelja_k<ümnendat", L"viie_k<ümnendat", L"kuue_k<ümnendat", L"seitsme_k<ümnendat", L"kaheksa_k<ümnendat", L"üheksa_k<ümnendat"
	};




	CFSWString onesNimetavPL[] = {
		L"ühed", L"kahed", L"kolmed", L"neljad", L"viied", L"kuued",
		L"s<eitsmed",
		L"kaheksad", L"üheksad"
	};

	CFSWString teensNimetavPL[] = {
		L"k<ümned", L"ühe_t<eist_k<ümned", L"kahe_t<eist_k<ümned", L"kolme_t<eist_k<ümned",
		L"nelja_t<eist_k<ümned",
		L"viie_t<eist_k<ümned", L"kuue_t<eist_k<ümned", L"seitsme_t<eist_k<ümned",
		L"kaheksa_t<eist_k<ümned",
		L"üheksa_t<eist_k<ümned"
	};

	CFSWString tensNimetavPL[] = {
		L"kahe_k<ümned", L"kolme_k<ümned", L"nelja_k<ümned", L"viie_k<ümned",
		L"kuue_k<ümned", L"seitsme_k<ümned", L"kaheksa_k<ümned",
		L"üheksa_k<ümned"
	};

	CFSWString onesOmastavPL[] = {
		L"<ühtede", L"k<ahtede", L"k<olmede", L"n<eljade", L"viite", L"kuute",
		L"s<eitsmete",
		L"kaheksate", L"üheksate",
	};

	CFSWString teensOmastavPL[] = {
		L"k<ümnete", L"ühe_t<eist_k<ümnete", L"kahe_t<eist_k<ümnete",
		L"kolme_t<eist_k<ümnete", L"nelja_t<eist_k<ümnete",
		L"viie_t<eist_k<ümnete", L"kuue_t<eist_kümnete", L"seitsme_t<eist_k<ümnete",
		L"kaheksa_t<eist_k<ümnete", L"üheksa_t<eist_k<ümnete"
	};

	CFSWString tensOmastavPL[] = {
		L"kahe_k<ümnete", L"kolme_k<ümnete", L"nelja_k<ümnete", L"viie_k<ümnete",
		L"kuue_k<ümnete", L"seitsme_k<ümnete", L"kaheksa_k<ümnete", L"üheksa_k<ümnete"
	};

	CFSWString onesNimetavJargPL[] = {
		L"esimesed", L"teised", L"kolmandad", L"neljandad", L"viiendad",
		L"kuuendad",
		L"s<eitsmendad", L"kaheksandad", L"üheksandad"
	};

	CFSWString teensNimetavJargPL[] = {
		L"k<ümnendad", L"ühe_t<eist_k<ümnendad", L"kahe_t<eist_k<ümnendad",
		L"kolme_t<eist_k<ümnendad", L"nelja_t<eist_k<ümnendad",
		L"viie_t<eist_k<ümnendad", L"kuue_t<eist_k<ümnendad", L"seitsme_t<eist_k<ümnendad",
		L"kaheksa_t<eist_k<ümnendad", L"üheksa_t<eist_k<ümnendad"
	};
	CFSWString tensNimetavJargPL[] = {
		L"kahe_k<ümnendad", L"kolme_k<ümnendad", L"nelja_k<ümnendad",
		L"viie_k<ümnendad",
		L"kuue_k<ümnendad", L"seitsme_k<ümnendad", L"kaheksa_k<ümnendad",
		L"üheksa_k<ümnendad"
	};

	CFSWString onesOmastavJargPL[] = {
		L"esimeste", L"teiste", L"kolmandate", L"neljandate", L"viiendate",
		L"kuuendate", L"s<eitsmendate", L"kaheksandate", L"üheksandate",
	};
	CFSWString teensOmastavJargPL[] = {
		L"k<ümnendate", L"ühe_t<eist_k<ümnendate", L"kahe_t<eist_k<ümnendate",
		L"kolme_t<eist_k<ümnendate", L"nelja_t<eist_k<ümnendate",
		L"viie_t<eist_k<ümnendate", L"kuue_t<eist_k<ümnendate",
		L"seitsme_t<eist_k<ümnendate", L"kaheksa_t<eist_k<ümnendate",
		L"üheksa_t<eist_k<ümnendate"
	};
	CFSWString tensOmastavJargPL[] = {
		L"kahe_k<ümnendate", L"kolme_k<ümnendate", L"nelja_k<ümnendate",
		L"viie_k<ümnendate", L"kuue_k<ümnendate", L"seitsme_k<ümnendate",
		L"kaheksa_k<ümnendate", L"üheksa_k<ümnendate"
	};




	CFSWString illion_preName[] = {L"m", L"b", L"tr", L"kvadr", L"kv<int", L"s<ekst", L"s<ept", L"<okt", L"non", L"d<ets"};
	CFSWString decillion_preName[] = {L"un", L"duo", L"tre", L"kvattuor", L"kv<in", L"s<eks", L"septen", L"okto", L"novem"};



	CFSWString hndr;


	CFSWStringArray ones, teens, tens;


	if (!Ordinal) {
		if (decl == 1) {
			Fill(onesNimetav, ones, 9);
			Fill(teensNimetav, teens, 10);
			Fill(tensNimetav, tens, 8);
			hndr = L"sada ";
			

		}
		if (decl == 2) {
			Fill(onesOmastav, ones, 9);
			Fill(teensOmastav, teens, 10);
			Fill(tensOmastav, tens, 8);
			hndr = L"saja ";
			

		}
		if (decl == 3) {
			Fill(onesNimetav, ones, 9);
			Fill(teensNimetav, teens, 10);
			Fill(tensNimetav, tens, 8);
			hndr = L"sada ";
			

		}


	} else { // kui on järgarv
		if (decl == 1) {

			Fill(onesNimetavJarg, ones, 9);
			Fill(teensNimetavJarg, teens, 10);
			Fill(tensNimetavJarg, tens, 8);
			hndr = L"saja ";
			


		}

		if (decl == 2) {
			Fill(onesOmastavJarg, ones, 9);
			Fill(teensOmastavJarg, teens, 10);
			Fill(tensOmastavJarg, tens, 8);
			hndr = L"saja ";
			

		}
		if (decl == 3) {
			Fill(onesNimetavJarg, ones, 9);
			Fill(teensNimetavJarg, teens, 10);
			Fill(tensNimetavJarg, tens, 8);
			hndr = L"sada ";
			

		}

	}


	while (numStr.GetAt(0) == L'0') {
		rs += L"n<ul]l ";
		numStr.Delete(0,1);
	}
	
if (numStr.GetLength() == 0) {	
	rs.Trim();
	return rs;
	}




	while (numStr.GetLength() % 3 != 0) numStr = L'0' + numStr;


	INTPTR x = numStr.GetLength() / 3;
	bool Last = false;


	for (unsigned int i = 0; i < numStr.GetLength(); i += 3) {
		x--;
		if (x == 0) Last = true;

		if (numStr.GetAt(i) == L'0' && numStr.GetAt(i + 1) == L'0' && numStr.GetAt(i + 2) == L'0')
			continue;

		if (numStr.GetAt(i + 0) > L'0') {
			//sajad sadade sajandad sajandate
			CFSWString End;
			if (!Last) {

				if (!Ordinal && (decl == 1 || decl == 3)) {
					rs += onesNimetav[ numStr.GetAt(i + 0) - 48 - 1 ] + L"sada ";
				} else {
					rs += onesOmastav[ numStr.GetAt(i + 0) - 48 - 1 ] + L"saja ";
				}


			} else { // kui on viimased 3
				// Kui viimased 3 on x00												
				if (numStr.GetAt(i + 1) == L'0' && numStr.GetAt(i + 2) == L'0') {

					if (!Ordinal) { //ei ole järgarv                            
						//Osastav läheb nimetavas siin. Lihtsalt tundub parem
						if (decl == 1 || decl == 3) 
						
						if (Sg) End = L"sada ";
							else End = L"sajad ";
						
						if (decl == 2) 
							if (Sg) End = L"saja ";
							else End = L"sadade ";

					} else //on järgarv
					{
						if (decl == 1) 
							if (Sg) End = L"sajas "; else End = L"sajandad ";
						if (decl == 2) 
							if (Sg) End = L"sajanda "; else End = L"sajandate ";
						if (decl == 3)
							if (Sg) End = L"sajandat "; else End = L"sajandad ";
					}
					if (decl == 1 && !Ordinal)
						rs += onesNimetav[ numStr.GetAt(i + 0) - 48 - 1 ] + End;
					else
						rs += onesOmastav[ numStr.GetAt(i + 0) - 48 - 1 ] + End;
				} else {
					if ((decl == 1 || decl == 3) && !Ordinal && Sg) {
						rs += onesNimetav[ numStr.GetAt(i + 0) - 48 - 1 ] + L"sada ";
					} else {
						rs += onesOmastav[ numStr.GetAt(i + 0) - 48 - 1 ] + L"saja ";

					}

				}
			}
		}


		
	if (numStr.GetAt(i + 1) == L'0' || numStr.GetAt(i + 1) > L'1') {
		
		
		if (numStr.GetAt(i + 1) > L'1') {				
			
			if (numStr.GetAt(i + 2) > L'0') {
				if((decl == 1 || decl == 3) && !Ordinal && Sg)
					rs += tensNimetav[ numStr.GetAt(i + 1) - 48 - 2 ] + L" ";
				else
					rs += tensOmastav[ numStr.GetAt(i + 1) - 48 - 2 ] + L" ";
			} else
			{
					
				if (Last) {
					if (Sg) {
					if (Ordinal && decl == 3)	
						rs += tensOsastavJarg[ numStr.GetAt(i + 1) - 48 - 2 ] + L" ";
					else
						rs += tens[ numStr.GetAt(i + 1) - 48 - 2 ] + L" ";
					}
					else // mitmuses
					{

						if (decl == 1 || decl == 3) {
							if (Ordinal) {
								rs += tensNimetavJargPL[ numStr.GetAt(i + 1) - 48 - 2 ] + L" ";
							} else {
								rs += tensNimetavPL[ numStr.GetAt(i + 1) - 48 - 2 ] + L" ";
								
							}
						} else //Kui on 2
						{
							if (Ordinal) {
								rs += tensOmastavJargPL[ numStr.GetAt(i + 1) - 48 - 2 ] + L" ";
							} else {
								rs += tensOmastavPL[ numStr.GetAt(i + 1) - 48 - 2 ] + L" ";
							}
						}
						
					}
				}
				else {
				if (decl == 1 && !Ordinal) {
				rs += tensNimetav[ numStr.GetAt(i + 1) - 48 - 2 ] + L" ";	
					}
					else {
				rs += tensOmastav[ numStr.GetAt(i + 1) - 48 - 2 ] + L" ";		
					}
				}
			}
		
		}



			if (numStr.GetAt(i + 2) > L'0') {
				if (Last) {
					if (Sg) {
						if (Ordinal && decl == 3)
						rs += onesOsastavJarg[ numStr.GetAt(i + 2) - 48 - 1 ] + L" ";
						else
						rs += ones[ numStr.GetAt(i + 2) - 48 - 1 ] + L" ";
					} else
						{ // Kui on mitmuses
					if (decl == 1 || decl == 3) {
						if (Ordinal)
							rs += onesNimetavJargPL[ numStr.GetAt(i + 2) - 48 - 1 ] + L" ";
						else
							rs += onesNimetavPL[ numStr.GetAt(i + 2) - 48 - 1 ] + L" ";
					} else
						if (decl == 2) {
						if (Ordinal)
							rs += onesOmastavJargPL[ numStr.GetAt(i + 2) - 48 - 1 ] + L" ";
						else
							rs += onesOmastavPL[ numStr.GetAt(i + 2) - 48 - 1 ] + L" ";

					}
				}

				} else {
					if (!Ordinal && (decl == 1 || decl == 3)) {
						rs += onesNimetav[ numStr.GetAt(i + 2) - 48 - 1 ] + L" ";
					} else {
						rs += onesOmastav[ numStr.GetAt(i + 2) - 48 - 1 ] + L" ";
					}
				}

			}
		} else {

		if (!Ordinal && !Last) {
			if (decl == 1 || decl == 3)
			rs += teensNimetav[ numStr.GetAt(i + 2) - 48 ] + L" ";
			else
			rs += teensOmastav[ numStr.GetAt(i + 2) - 48 ] + L" ";
		}
		else
		if (Ordinal && !Last) {
				rs += teensOmastav[ numStr.GetAt(i + 2) - 48 ] + L" ";
			} else
				if (!Ordinal && !Last && decl == 3) // Mingi viga loendites ei leia praegu
				rs += teensNimetav[ numStr.GetAt(i + 2) - 48 ] + L" ";
			else {
				if (Sg)
					if (Ordinal && decl == 3)
					rs += teensOsastavJarg[ numStr.GetAt(i + 2) - 48 ] + L" ";
					else
					rs += teens[ numStr.GetAt(i + 2) - 48 ] + L" ";
				else { // Kui on mitmuses
					if (decl == 1 || decl == 3) {
						if (Ordinal)
							rs += teensNimetavJargPL[ numStr.GetAt(i + 2) - 48 ] + L" ";
						else
							rs += teensNimetavPL[ numStr.GetAt(i + 2) - 48 ] + L" ";
					} else
						if (decl == 2) {
						if (Ordinal)
							rs += teensOmastavJargPL[ numStr.GetAt(i + 2) - 48 ] + L" ";
						else
							rs += teensOmastavPL[ numStr.GetAt(i + 2) - 48 ] + L" ";

					}
				}

			}
		}


		unsigned int j = (numStr.GetLength() - i) / 3;
		if (j == 2) {
		//kui on X000	
		if (numStr.GetAt(i+3) == L'0' && numStr.GetAt(i+4) == L'0' && numStr.GetAt(i+5) == L'0') {
			
			if (Sg)	{ //Kui on ainsuses
				if (!Ordinal) {
					if (decl == 1 || decl == 3) 
					rs += L"tuhat ";
					else
					rs += L"tuhande ";	
				}
				else
				{ // ON järgarv
					if (decl == 1 || decl == 3) 
					rs += L"tuhandes ";
					else
					rs += L"tuhandenda ";						
				}
			}
			else
			{ //Kui on mitmuses
				if (!Ordinal) {
					if (decl == 1 || decl == 3) 
					rs += L"tuhanded ";
					else
					rs += L"tuhandete ";	
				}
				else
				{ // ON järgarv
					if (decl == 1 || decl == 3) 
					rs += L"tuhandendad ";
					else
					rs += L"tuhandendate ";						
				}
				
			}
		}
		else
		if ((decl == 1 || decl == 3) && !Ordinal && Sg)
				rs += L"tuhat ";
			else
				rs += L"tuhande ";
		} else if (j > 2) {

			if (j <= 12) {
				rs += illion_preName[ j - 3 ];
			} else if (j <= 21) {
				rs += decillion_preName[ j - 13 ] + L"dets";
			} else if (j == 22) {
				rs += L"vigint";
			}
			rs += L"iljonit ";
		}
	}

	rs.Trim();

	return rs;
}

