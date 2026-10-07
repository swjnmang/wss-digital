# Hinweise für Claude

## Workflow
- Änderungen immer direkt committen, pushen und in `main` mergen. Nicht nachfragen, ob gemerged werden soll und keinen Pull Request anlegen, solange nichts anderes gesagt wird.
- Die Seite wird über GitHub Pages aus `main` veröffentlicht (swjnmang.github.io/wss-digital).
- Den Mathe-Trainer deployt Vercel aus `main` (ws-mathe-trainer.vercel.app). In `main` immer mit eigenem Merge-Commit
  mergen (`git merge --no-ff`) und `main` zuerst pushen: Zeigt `main` per Fast-Forward auf einen Commit, der vorher schon
  als Branch gepusht wurde, legt Vercel nur ein Preview- und kein Production-Deployment an.
