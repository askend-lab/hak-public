#!/bin/bash

#   -f      [sisendtekst utf8-s] 
#   -o      [väljund-wav] 
#   -lex    [analüüsi sõnastik] 
#   -lexd   [ühestaja sõnastik] 
#   -m      [hääle nimi, vt kataloogi htsvoices/]
#   -r      [kõnetempo, double, 0.01-2.76] 

bin/genlab -lex dct/et.dct -lexd dct/et3.dct -o lab/ -f eki_et_rna.data -train -check_wav wav/

