"""Quadratische Funktionen – Wertetabelle: wie der Pilot (Lineare Funktionen) umstellen."""
import re
from bk import Page, ROOT

p = Page('pages/quadratische_funktionen/Wertetabelle.tsx')
p.sub(r"""    <div className=\{styles\.container\}>
      <div className=\{styles\.header\}>
        <div>
          <h1 className=\{styles\.title\}>Wertetabellen</h1>
          <p className=\{styles\.subtitle\}>([^<]+)</p>
        </div>
        <div className=\{styles\.scoreBox\}>
          <div className=\{styles\.score\}>
            ⭐ \{punkte\} <span className=\{styles\.scoreLabel\}>Punkte</span>
          </div>
        </div>
      </div>
""", lambda m: f"""    <TaskShell
      title="Wertetabellen"
      subtitle="{m.group(1)}"
      width="full"
      actions={{<div className={{styles.score}}><i className="fa-solid fa-star" aria-hidden="true" /> {{punkte}} <span className={{styles.scoreLabel}}>Punkte</span></div>}}
    >
""", count=1)
p.sub(r"\n    </div>\n  \)\n\}\s*$", "\n    </TaskShell>\n  )\n}\n", count=1)
p.no_polyfill()
p.imp_shell()
p.save()

# CSS-Modul: Baukasten-Fassung des Pilots übernehmen (gleiche Klassennamen)
lf = open(ROOT + 'pages/lineare_funktionen/Wertetabelle.module.css', encoding='utf-8').read()
open(ROOT + 'pages/quadratische_funktionen/Wertetabelle.module.css', 'w', encoding='utf-8', newline='').write(lf)
print('CSS übernommen')
