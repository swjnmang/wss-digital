"""Mehrere Routen per Headless-Chrome fotografieren und zu einem Übersichtsbild zusammensetzen.
Nutzung: python sheet.py ausgabe.png breite hoehe spalten /route1 /route2 ...
Umgebung: SHOT_DIR (Zielordner), SHOT_PORT (Dev-Server, Standard 5173)."""
import os
import subprocess
import sys
from concurrent.futures import ThreadPoolExecutor
from PIL import Image, ImageDraw

CHROME = r'C:\Program Files\Google\Chrome\Application\chrome.exe'
out, W, H, cols, *routes = sys.argv[1:]
W, H, cols = int(W), int(H), int(cols)
d = os.environ.get('SHOT_DIR', '.')
port = os.environ.get('SHOT_PORT', '5173')


def shot(i_r):
    i, r = i_r
    f = os.path.join(d, f'_s{i}.png')
    subprocess.run([CHROME, '--headless=new', '--disable-gpu', '--hide-scrollbars', '--virtual-time-budget=7000',
                    f'--window-size={W},{H}', f'--screenshot={f}', f'http://localhost:{port}/{r.lstrip("/")}'],
                   stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, timeout=90)
    return f


with ThreadPoolExecutor(4) as ex:
    files = list(ex.map(shot, enumerate(routes)))
scale = 0.5
tw, th = int(W * scale), int(H * scale)
rows = (len(files) + cols - 1) // cols
sheet = Image.new('RGB', (cols * tw, rows * (th + 18)), 'white')
dr = ImageDraw.Draw(sheet)
for i, (f, r) in enumerate(zip(files, routes)):
    x, y = (i % cols) * tw, (i // cols) * (th + 18)
    try:
        im = Image.open(f).resize((tw, th))
        sheet.paste(im, (x, y + 18))
    except Exception:
        pass
    dr.text((x + 4, y + 3), r, fill='black')
sheet.save(os.path.join(d, out))
print(os.path.join(d, out))
