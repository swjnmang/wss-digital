"""Findet Klassen, die eine Seite aus ihrem CSS-Modul nutzt, die das Modul aber nicht (mehr) definiert."""
import re, sys, glob, os
from bk import ROOT

folder = sys.argv[1] if len(sys.argv) > 1 else 'pages/lineare_funktionen'
for tsx in sorted(glob.glob(ROOT + folder + '/**/*.tsx', recursive=True)):
    src = open(tsx, encoding='utf-8').read()
    for m in re.finditer(r"import (\w+) from '(\./[^']+\.module\.css)'", src):
        var, rel = m.groups()
        css_path = os.path.normpath(os.path.join(os.path.dirname(tsx), rel))
        css = open(css_path, encoding='utf-8').read()
        defined = set(re.findall(r"\.([A-Za-z_À-ſ][\wÀ-ſ-]*)", css))
        used = set(re.findall(var + r"\.([A-Za-z_À-ſ][\wÀ-ſ]*)", src))
        used |= set(re.findall(var + r"\[['\"]([^'\"]+)['\"]\]", src))
        missing = sorted(used - defined)
        if missing:
            print(os.path.basename(tsx), '->', ', '.join(missing))
