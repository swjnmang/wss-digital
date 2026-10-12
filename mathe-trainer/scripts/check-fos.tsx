// Prüft alle Aufgaben-Generatoren der FOS/BOS-Vorbereitung: gültige Werte und fehlerfreies KaTeX.
// Aufruf: npx tsx scripts/check-fos.tsx [Anzahl]
import katex from 'katex';
import { FOS_TOPICS } from '../src/pages/fos/registry';
import type { Task } from '../src/pages/raum_und_form/engine/types';

const N = Number(process.argv[2] ?? 200);
let errors = 0;
const seen = new Map<string, number>();

function texErrors(s: string, where: string) {
  const segs = s.split('$');
  if (segs.length % 2 === 0) {
    errors++;
    if (errors < 60) console.log(`[$-Anzahl ungerade] ${where}: ${s.slice(0, 160)}`);
    return;
  }
  segs.forEach((seg, i) => {
    if (i % 2 === 0) {
      if (/NaN|undefined|Infinity|\[object/.test(seg)) {
        errors++;
        if (errors < 60) console.log(`[Text] ${where}: ${seg.slice(0, 160)}`);
      }
      return;
    }
    try {
      katex.renderToString(seg, { throwOnError: true, strict: (code: string) => (code === 'unknownSymbol' ? 'ignore' : 'error') });
    } catch (e) {
      errors++;
      if (errors < 60) console.log(`[KaTeX] ${where}: ${seg.slice(0, 200)}\n   ${(e as Error).message.slice(0, 160)}`);
    }
    if (/NaN|undefined|Infinity(?!\})|\[object/.test(seg.replace(/\\infty/g, ''))) {
      errors++;
      if (errors < 60) console.log(`[Wert] ${where}: ${seg.slice(0, 160)}`);
    }
  });
}

function checkTask(task: Task, where: string) {
  const w = `${where} „${task.title}“`;
  texErrors(task.text, w + ' text');
  task.solution.forEach((l) => texErrors(l, w + ' lösung'));
  task.parts.forEach((pt) => {
    if (pt.q) texErrors(pt.q, w + ' q');
    if (pt.label) texErrors(pt.label, w + ' label');
    if (pt.kind === 'num') {
      if (!Number.isFinite(pt.value)) {
        errors++;
        if (errors < 60) console.log(`[Zahl] ${w}: ${pt.value}`);
      }
      if (pt.integer && !Number.isInteger(Math.round(pt.value * 1e9) / 1e9)) {
        errors++;
        if (errors < 60) console.log(`[ganzzahlig?] ${w}: ${pt.value}`);
      }
    } else {
      pt.options.forEach((o) => texErrors(o, w + ' option'));
      if (pt.correct < 0 || new Set(pt.options).size !== pt.options.length || pt.options.length < 2) {
        errors++;
        if (errors < 60) console.log(`[Auswahl] ${w}: ${JSON.stringify(pt.options)} correct=${pt.correct}`);
      }
    }
  });
}

for (const topic of FOS_TOPICS) {
  for (const page of topic.pages) {
    const pw = `${topic.slug}/${page.slug}`;
    if (page.intro) texErrors(page.intro, pw + ' intro');
    page.formulas?.forEach((f) => texErrors(`$${f}$`, pw + ' formel'));
    if (page.example) {
      texErrors(page.example.text, pw + ' beispiel');
      page.example.steps.forEach((st) => texErrors(st, pw + ' beispiel'));
      if (page.example.tip) texErrors(page.example.tip, pw + ' tipp');
    }
    const gens = [...page.gens, ...(page.apps ?? []), ...(page.fixed ?? [])];
    gens.forEach((g, gi) => {
      for (let i = 0; i < N; i++) {
        const where = `${topic.slug}/${page.slug}#${gi}`;
        try {
          const task = g();
          checkTask(task, where);
          seen.set(where, (seen.get(where) ?? 0) + 1);
        } catch (e) {
          errors++;
          if (errors < 60) console.log(`[Exception] ${where}: ${(e as Error).message}`);
        }
      }
    });
  }
}
console.log(`${seen.size} Generatoren geprüft, ${errors} Fehler.`);
process.exit(errors ? 1 : 0);
