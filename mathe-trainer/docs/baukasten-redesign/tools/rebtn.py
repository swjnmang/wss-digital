"""buttons()/skin() erneut über ganze Ordner laufen lassen (idempotent). Nutzung: python rebtn.py pages/finanzmathe …"""
import glob
import sys
from bk import ROOT
from legacy import buttons, skin, Page

tot = 0
for folder in sys.argv[1:]:
    for f in sorted(glob.glob(ROOT + folder + '/**/*.tsx', recursive=True)):
        rel = f.replace('\\', '/')[len(ROOT):]
        p = Page(rel)
        if 'TaskShell' not in p.s and 'MenuPage' not in p.s:
            continue
        n = buttons(p) + skin(p)
        if n:
            p.save()
            tot += n
print('ersetzt:', tot)
