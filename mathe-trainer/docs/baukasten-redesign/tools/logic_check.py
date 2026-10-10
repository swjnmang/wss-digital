"""Zeigt entfernte/geänderte Zeilen im Diff, die nicht nur Darstellung sind (className, Rahmen, h1, Importe).
Nutzung: python logic_check.py [git-diff-argumente…]   (Standard: Arbeitskopie gegen HEAD, nur src/pages)"""
import re
import subprocess
import sys

args = sys.argv[1:] or ['HEAD', '--', 'src/pages']
out = subprocess.run(['git', 'diff', '-U0', *args], capture_output=True, text=True, encoding='utf-8',
                     cwd=r'C:\Users\mailt\OneDrive\KI Programme\wss-digital\mathe-trainer').stdout
IGNORE = re.compile(r'className=|<h1|</h1>|min-h-screen|^\s*</?div>?\s*$|^\s*<div\b[^>]*>\s*$|^\s*import |^\s*$|'
                    r'^\s*\}?\)?;?\s*$|<iframe|allowFullScreen|allow=|src=|title=|loading=|referrerPolicy|frameBorder|/>\s*$')
cur = None
for line in out.splitlines():
    if line.startswith('+++ '):
        cur = line[6:]
    elif line.startswith('-') and not line.startswith('---'):
        body = line[1:]
        if not IGNORE.search(body):
            print(f'{cur}: {body.strip()[:160]}')
