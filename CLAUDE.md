# Hinweise für Claude

## Workflow
- Änderungen immer direkt committen, pushen und in `main` mergen. Nicht nachfragen, ob gemerged werden soll und keinen Pull Request anlegen, solange nichts anderes gesagt wird.
- Die Seite wird über GitHub Pages aus `main` veröffentlicht (swjnmang.github.io/wss-digital).
- Den Mathe-Trainer deployt Vercel aus `main` (ws-mathe-trainer.vercel.app). In `main` immer mit eigenem Merge-Commit
  mergen (`git merge --no-ff`) und `main` zuerst pushen: Zeigt `main` per Fast-Forward auf einen Commit, der vorher schon
  als Branch gepusht wurde, legt Vercel nur ein Preview- und kein Production-Deployment an.
- Nach dem Merge den `claude/...`-Branch **nicht** auf den Merge-Commit von `main` vorspulen und erneut pushen:
  Für `claude/**` sind Vercel-Deployments abgeschaltet (`vercel.json`), und landet derselbe Commit auch auf so einem
  Branch, bricht Vercel das Production-Deployment von `main` ab („Canceled by Ignored Build Step“).
