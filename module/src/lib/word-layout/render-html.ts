import type { IParagraphStyle, ITextStyle } from '@univerjs/core';
import { BaselineOffset, BooleanNumber, HorizontalAlign, NamedStyleType, SpacingRule } from '@univerjs/core';
import { hexColor, NAMED_STYLE_LOOK, type ExportBlock, type ExportDocument, type ExportParagraph } from './model';

/**
 * Baut aus dem Exportmodell druckfertige A4-Seiten als HTML (für das PDF).
 * Die Darstellung ist eine Annäherung an den Editor, keine pixelgenaue Kopie.
 */

const ALIGN: Partial<Record<number, string>> = {
  [HorizontalAlign.LEFT]: 'left',
  [HorizontalAlign.CENTER]: 'center',
  [HorizontalAlign.RIGHT]: 'right',
  [HorizontalAlign.JUSTIFIED]: 'justify',
  [HorizontalAlign.BOTH]: 'justify',
};

const FONT_FALLBACK = ', Arial, Helvetica, sans-serif';

interface Ctx {
  defaults: ITextStyle;
  counters: Map<string, number>;
}

function el<K extends keyof HTMLElementTagNameMap>(tag: K, css: Partial<CSSStyleDeclaration> = {}, text?: string) {
  const node = document.createElement(tag);
  Object.assign(node.style, css);
  if (text != null) node.textContent = text;
  return node;
}

function applyTextStyle(node: HTMLElement, ts: ITextStyle, para: IParagraphStyle) {
  const look = NAMED_STYLE_LOOK[para.namedStyleType ?? NamedStyleType.NORMAL_TEXT];
  if (ts.ff) node.style.fontFamily = `"${ts.ff}"${FONT_FALLBACK}`;
  const size = ts.fs ?? look?.fs;
  if (size) node.style.fontSize = `${size}pt`;
  const bold = ts.bl != null ? ts.bl === BooleanNumber.TRUE : look?.bold;
  if (bold) node.style.fontWeight = 'bold';
  if (ts.it === BooleanNumber.TRUE) node.style.fontStyle = 'italic';
  const deco = [ts.ul?.s === BooleanNumber.TRUE ? 'underline' : '', ts.st?.s === BooleanNumber.TRUE ? 'line-through' : ''].filter(Boolean).join(' ');
  if (deco) node.style.textDecoration = deco;
  const color = hexColor(ts.cl?.rgb) ?? look?.color;
  if (color) node.style.color = `#${color}`;
  const bg = hexColor(ts.bg?.rgb);
  if (bg) node.style.backgroundColor = `#${bg}`;
  if (ts.va === BaselineOffset.SUPERSCRIPT || ts.va === BaselineOffset.SUBSCRIPT) {
    node.style.verticalAlign = ts.va === BaselineOffset.SUPERSCRIPT ? 'super' : 'sub';
    node.style.fontSize = `${(size ?? 11) * 0.65}pt`;
    node.style.lineHeight = '0';
  }
}

const num = (v: { v: number } | undefined) => v?.v;

function renderParagraph(p: ExportParagraph, ctx: Ctx, runs = p.runs, continuation = false): HTMLElement {
  const s = p.style;
  const node = el('div', {
    margin: '0',
    paddingTop: `${continuation ? 0 : (num(s.spaceAbove) ?? 0)}px`,
    paddingBottom: `${num(s.spaceBelow) ?? 0}px`,
    textAlign: ALIGN[s.horizontalAlign ?? -1] ?? 'left',
    whiteSpace: 'pre-wrap',
    overflowWrap: 'break-word',
    hyphens: 'auto',
  });
  node.lang = 'de';
  if (s.lineSpacing != null && (s.spacingRule ?? SpacingRule.AUTO) !== SpacingRule.AUTO) node.style.lineHeight = `${s.lineSpacing}px`;
  else node.style.lineHeight = String(1.2 * (s.lineSpacing ?? 1));

  const hanging = num(s.hanging);
  const listIndent = p.bullet ? 24 * (p.bullet.level + 1) : 0;
  const left = (num(s.indentStart) ?? 0) + (hanging ?? listIndent);
  if (left) node.style.paddingLeft = `${left}px`;
  if (num(s.indentEnd)) node.style.paddingRight = `${num(s.indentEnd)}px`;
  if (hanging != null || p.bullet) node.style.textIndent = `-${hanging ?? listIndent}px`;
  else if (num(s.indentFirstLine) && !continuation) node.style.textIndent = `${num(s.indentFirstLine)}px`;

  // Grundschrift des Absatzes = Dokumentstandard bzw. Format des ersten Zeichens (für Aufzählungszeichen)
  applyTextStyle(node, { ...ctx.defaults, ...(runs[0]?.style ?? {}) }, s);

  if (p.bullet && !continuation) {
    const isBullet = p.bullet.listType.startsWith('BULLET_LIST');
    let marker = '•';
    if (!isBullet) {
      const key = `${p.bullet.listId}:${p.bullet.level}`;
      const n = (ctx.counters.get(key) ?? 0) + 1;
      ctx.counters.set(key, n);
      marker = `${n}.`;
    }
    const m = el('span', { display: 'inline-block', width: `${hanging ?? listIndent}px`, textIndent: '0', textDecoration: 'none' }, marker);
    node.appendChild(m);
  }

  for (const run of runs) {
    if (!run.text) continue;
    const span = el('span', {}, run.text);
    applyTextStyle(span, { ...ctx.defaults, ...run.style }, s);
    node.appendChild(span);
  }
  if (runs.every((r) => !r.text)) node.appendChild(document.createTextNode('​'));
  return node;
}

// Tabellen als Flex-Zeilen statt <table>: html2canvas stellt Tabellenrahmen und Zelltext sonst versetzt dar
function renderTable(b: Extract<ExportBlock, { type: 'table' }>, ctx: Ctx, width: number): HTMLElement {
  const total = b.columnWidths.reduce((a, w) => a + w, 0) || width;
  const scale = Math.min(total, width) / total;
  const table = el('div', { width: `${Math.min(total, width)}px`, borderTop: '1px solid #000', borderLeft: '1px solid #000', boxSizing: 'border-box' });
  for (const row of b.rows) {
    const tr = el('div', { display: 'flex', alignItems: 'stretch' });
    row.forEach((cell, c) => {
      const w = (b.columnWidths[c] ?? total / row.length) * scale;
      const td = el('div', { width: `${w}px`, flex: 'none', boxSizing: 'border-box', borderRight: '1px solid #000', borderBottom: '1px solid #000', padding: '5px 10px' });
      for (const p of cell) td.appendChild(renderParagraph(p, ctx));
      tr.appendChild(td);
    });
    table.appendChild(tr);
  }
  return table;
}

function renderBlocks(blocks: ExportBlock[], ctx: Ctx, width: number): HTMLElement[] {
  return blocks.map((b) => (b.type === 'table' ? renderTable(b, ctx, width) : renderParagraph(b, ctx)));
}

/** Mehrspaltiger Abschnitt: Inhalt an den manuellen Spaltenumbrüchen aufteilen. */
function renderColumns(section: ExportDocument['sections'][number], ctx: Ctx, width: number): HTMLElement {
  const columns: HTMLElement[][] = [[]];
  for (const b of section.blocks) {
    if (b.type === 'table') {
      columns[columns.length - 1].push(renderTable(b, ctx, width));
      continue;
    }
    let runs: ExportParagraph['runs'] = [];
    let part = 0;
    for (const run of b.runs) {
      if (run.columnBreak) {
        if (runs.length > 0 || part > 0) columns[columns.length - 1].push(renderParagraph(b, ctx, runs, part > 0));
        if (columns.length < section.columns) columns.push([]);
        runs = [];
        part += 1;
      }
      runs.push(run);
    }
    columns[columns.length - 1].push(renderParagraph(b, ctx, runs, part > 0));
  }

  const gap = section.columnGap;
  const colWidth = (width - gap * (section.columns - 1)) / section.columns;
  const wrap = el('div', { display: 'flex', width: `${width}px`, alignItems: 'stretch' });
  // Ohne manuellen Umbruch: Absätze grob gleichmäßig verteilen
  if (columns.length === 1 && section.columns > 1) {
    const all = columns[0];
    columns.length = 0;
    const per = Math.ceil(all.length / section.columns);
    for (let i = 0; i < section.columns; i++) columns.push(all.slice(i * per, (i + 1) * per));
  }
  columns.forEach((nodes, i) => {
    const col = el('div', { width: `${colWidth}px`, flex: 'none', boxSizing: 'border-box' });
    if (i > 0) {
      col.style.marginLeft = section.separator ? `${gap / 2}px` : `${gap}px`;
      if (section.separator) {
        col.style.borderLeft = '1px solid #000';
        col.style.paddingLeft = `${gap / 2}px`;
        col.style.width = `${colWidth + gap / 2}px`;
      }
    }
    nodes.forEach((n) => col.appendChild(n));
    wrap.appendChild(col);
  });
  return wrap;
}

/** Erzeugt die A4-Seiten; muss im Dokument eingehängt werden, damit Höhen messbar sind. */
export function renderPages(doc: ExportDocument, host: HTMLElement): HTMLElement[] {
  const ctx: Ctx = { defaults: doc.defaults, counters: new Map() };
  const base = doc.sections[0]?.margins ?? { top: 94.5, bottom: 75.6, left: 94.5, right: 94.5 };
  const contentHeight = doc.pageHeight - base.top - base.bottom;

  // 1) Inhaltseinheiten bauen und messen
  const measure = el('div', { position: 'absolute', left: '0', top: '0', width: `${doc.pageWidth}px`, background: '#fff' });
  host.appendChild(measure);
  const units: { node: HTMLElement; left: number; height: number; newPage: boolean }[] = [];
  for (const section of doc.sections) {
    const width = doc.pageWidth - section.margins.left - section.margins.right;
    const nodes = section.columns > 1 ? [renderColumns(section, ctx, width)] : renderBlocks(section.blocks, ctx, width);
    nodes.forEach((node, n) => {
      const box = el('div', { width: `${width}px`, display: 'flow-root' });
      box.appendChild(node);
      measure.appendChild(box);
      units.push({ node: box, left: section.margins.left, height: 0, newPage: n === 0 && section.newPage });
    });
  }
  for (const u of units) u.height = u.node.getBoundingClientRect().height;
  measure.remove();

  // 2) Auf Seiten verteilen
  const pages: (typeof units)[] = [[]];
  let used = 0;
  for (const u of units) {
    if ((u.newPage || used + u.height > contentHeight) && pages[pages.length - 1].length > 0) {
      pages.push([]);
      used = 0;
    }
    pages[pages.length - 1].push(u);
    used += u.height;
  }

  // 3) Seiten mit Kopf- und Fußzeile zusammensetzen
  return pages.map((content) => {
    const page = el('div', {
      position: 'relative',
      width: `${doc.pageWidth}px`,
      height: `${doc.pageHeight}px`,
      background: '#fff',
      color: '#000',
      overflow: 'hidden',
      fontFamily: `"${doc.defaults.ff ?? 'Arial'}"${FONT_FALLBACK}`,
      fontSize: `${doc.defaults.fs ?? 11}pt`,
    });
    const hfCtx: Ctx = { defaults: doc.defaults, counters: new Map() };
    const hfWidth = doc.pageWidth - base.left - base.right;
    if (doc.header.length > 0) {
      const header = el('div', { position: 'absolute', top: `${doc.marginHeader}px`, left: `${base.left}px`, width: `${hfWidth}px` });
      renderBlocks(doc.header, hfCtx, hfWidth).forEach((n) => header.appendChild(n));
      page.appendChild(header);
    }
    if (doc.footer.length > 0) {
      const footer = el('div', { position: 'absolute', bottom: `${doc.marginFooter}px`, left: `${base.left}px`, width: `${hfWidth}px` });
      renderBlocks(doc.footer, hfCtx, hfWidth).forEach((n) => footer.appendChild(n));
      page.appendChild(footer);
    }
    const body = el('div', { position: 'absolute', top: `${base.top}px`, left: '0', width: '100%' });
    for (const u of content) {
      u.node.style.marginLeft = `${u.left}px`;
      body.appendChild(u.node);
    }
    page.appendChild(body);
    host.appendChild(page);
    return page;
  });
}
