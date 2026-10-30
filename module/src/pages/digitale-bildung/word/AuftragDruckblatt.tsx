import { Fragment, forwardRef } from 'react';
import type { Arbeitsauftrag, AuftragItem } from '../../../lib/word-layout/arbeitsauftraege';

// Kompaktes A4-Druckblatt (794 px Breite = 210 mm bei 96 dpi). Wird zum Drucken
// (window.print) und für den PDF-Export (html2canvas) verwendet.
export const SHEET_W = 794;
export const SHEET_PAD = 45; // ≈ 12 mm Seitenrand

const BASE = '/word-layout';
const RED = '#dc2626';

function Rich({ text }: { text: string }) {
  const parts = text.split(/(\*\*.+?\*\*|\{\{.+?\}\}|~~.+?~~|__.+?__)/g).filter(Boolean);
  return (
    <>
      {parts.map((p, i) => {
        if (p.startsWith('**')) return <strong key={i}>{p.slice(2, -2)}</strong>;
        if (p.startsWith('~~')) return <em key={i}>{p.slice(2, -2)}</em>;
        if (p.startsWith('__')) return <u key={i}>{p.slice(2, -2)}</u>;
        if (p.startsWith('{{'))
          return (
            <span key={i} style={{ color: RED }}>
              {p.slice(2, -2).split('>').map((s, j) => (
                <Fragment key={j}>{j > 0 && ' ➔ '}{s.trim()}</Fragment>
              ))}
            </span>
          );
        return <Fragment key={i}>{p}</Fragment>;
      })}
    </>
  );
}

function Item({ item, slug }: { item: AuftragItem; slug: string }) {
  const line = { display: 'flex', gap: 5, marginTop: 1 } as const;
  if ('t' in item) return <div style={{ marginTop: 1 }}><Rich text={item.t} /></div>;
  if ('b' in item) return <div style={line}><span>•</span><span><Rich text={item.b} /></span></div>;
  if ('s' in item) return <div style={{ ...line, paddingLeft: 14 }}><span style={{ color: RED }}>➔</span><span><Rich text={item.s} /></span></div>;
  if ('tipp' in item)
    return (
      <div style={{ marginTop: 2, background: '#fff7d6', borderLeft: '3px solid #f2b400', padding: '1px 5px' }}>
        <strong>Tipp: </strong><Rich text={item.tipp} />
      </div>
    );
  if ('img' in item)
    return <img src={`${BASE}/${slug}/img/${item.img}`} alt="" style={{ display: 'block', maxHeight: 78, maxWidth: '55%', marginTop: 3, border: '1px solid #ddd' }} />;
  if ('beispiel' in item)
    return (
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, width: 220, fontFamily: 'Verdana, sans-serif', marginTop: 2, paddingLeft: 10 }}>
        <span>{item.beispiel[0]}</span>
        <span style={{ flex: 1, borderBottom: '2px dotted #888', marginBottom: 3 }} />
        <span>{item.beispiel[1]}</span>
      </div>
    );
  return null;
}

const AuftragDruckblatt = forwardRef<HTMLDivElement, { a: Arbeitsauftrag }>(function AuftragDruckblatt({ a }, ref) {
  return (
    <div
      ref={ref}
      className="druckblatt"
      style={{ width: SHEET_W, padding: SHEET_PAD, background: '#fff', color: '#111', fontFamily: 'Arial, Helvetica, sans-serif', fontSize: 11, lineHeight: 1.3 }}
    >
      <div data-block style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 14 }}>Digitale Bildung – Klasse 10 – Layout – {a.thema}</div>
          <div style={{ fontWeight: 700, fontSize: 13, marginTop: 2 }}>{a.titel}</div>
        </div>
        <div style={{ fontSize: 10, whiteSpace: 'nowrap', marginTop: 2 }}>Name: ____________________ Klasse: ______</div>
      </div>
      <div data-block style={{ fontStyle: 'italic', margin: '5px 0 7px' }}>{a.szenario}</div>
      <div style={{ border: '1px solid #000', borderBottom: 'none' }}>
        {a.rows.map((row, i) => (
          <div key={i} data-block style={{ display: 'flex', borderBottom: '1px solid #000', breakInside: 'avoid' }}>
            <div style={{ width: 26, flexShrink: 0, background: '#1F497D', color: '#fff', textAlign: 'center', paddingTop: 3, fontSize: 10, printColorAdjust: 'exact', WebkitPrintColorAdjust: 'exact' }}>
              {a.start + i}
            </div>
            <div style={{ flex: 1, padding: '3px 6px 4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                <span style={{ fontWeight: 700, fontSize: 11.5 }}><Rich text={row.titel} /></span>
                <span style={{ width: 11, height: 11, border: '1.2px solid #333', flexShrink: 0, marginTop: 2 }} title="erledigt" />
              </div>
              {row.inhalt.map((item, j) => <Item key={j} item={item} slug={a.slug} />)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

export default AuftragDruckblatt;
