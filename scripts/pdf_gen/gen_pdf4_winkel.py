"""PDF 4: Winkel berechnen mit Sinus, Kosinus und Tangens."""
import math
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from triangle_draw import draw_triangle, BLACK, RED, GRAY

OUT = '../../mathe-trainer/public/downloads/winkel-berechnen-sinus-kosinus-tangens-uebungen.pdf'
PAGE_W, PAGE_H = A4

ANGLE_AT = {'A': 'alpha', 'B': 'beta', 'C': 'gamma'}
GREEK = {'alpha': 'α', 'beta': 'β', 'gamma': 'γ'}


def hyp_side(rv):
    return {'C': 'c', 'A': 'a', 'B': 'b'}[rv]


def opposite_side(v):
    return {'A': 'a', 'B': 'b', 'C': 'c'}[v]


def adjacent_side(right_vertex, marked_vertex):
    hyp = hyp_side(right_vertex)
    opp = opposite_side(marked_vertex)
    return [s for s in ('a', 'b', 'c') if s not in (hyp, opp)][0]


def role_to_side(right_vertex, marked_vertex, role):
    if role == 'hyp':
        return hyp_side(right_vertex)
    if role == 'opp':
        return opposite_side(marked_vertex)
    return adjacent_side(right_vertex, marked_vertex)


# right_vertex, marked_vertex (gesuchter Winkel), given side values nach Rolle
# mode 'tan' -> beide Katheten gegeben (opp, adj); mode 'cos' -> adj + hyp gegeben
PROBLEMS = [
    dict(right='C', marked='A', mode='tan', opp=6.0, adj=8.0),
    dict(right='C', marked='B', mode='cos', adj=4.0, hyp=10.0),
    dict(right='B', marked='C', mode='tan', opp=9.0, adj=5.0),
    dict(right='B', marked='A', mode='cos', adj=6.0, hyp=11.0),
    dict(right='A', marked='B', mode='tan', opp=7.0, adj=10.0),
    dict(right='A', marked='C', mode='cos', adj=5.0, hyp=13.0),
    dict(right='C', marked='B', mode='tan', opp=9.5, adj=6.0),
    dict(right='B', marked='C', mode='cos', adj=7.0, hyp=15.0),
]


def compute_triangle(problem):
    right_vertex, marked_vertex, mode = problem['right'], problem['marked'], problem['mode']
    if mode == 'tan':
        opp, adj = problem['opp'], problem['adj']
        angle = math.degrees(math.atan2(opp, adj))
        hyp = math.hypot(opp, adj)
    else:
        adj, hyp = problem['adj'], problem['hyp']
        angle = math.degrees(math.acos(adj / hyp))
        opp = math.sqrt(max(hyp * hyp - adj * adj, 0))

    side_val = {
        hyp_side(right_vertex): hyp,
        opposite_side(marked_vertex): opp,
        adjacent_side(right_vertex, marked_vertex): adj,
    }
    return side_val, angle


def header(c, title, subtitle=None):
    c.setFillColorRGB(*BLACK)
    c.setFont('Helvetica-Bold', 18)
    c.drawString(20 * mm, PAGE_H - 22 * mm, title)
    if subtitle:
        c.setFont('Helvetica', 11)
        c.setFillColorRGB(*GRAY)
        c.drawString(20 * mm, PAGE_H - 28 * mm, subtitle)
    c.setFillColorRGB(*BLACK)


def footer(c, page_num):
    c.setFont('Helvetica', 8)
    c.setFillColorRGB(*GRAY)
    c.drawCentredString(PAGE_W / 2, 10 * mm, f'wss-digital.de - Mathetrainer  ·  Seite {page_num}')
    c.setFillColorRGB(*BLACK)


def draw_cover(c):
    header(c, 'Winkel berechnen', 'Übungsblatt: Sinus, Kosinus und Tangens im rechtwinkligen Dreieck')
    c.setFont('Helvetica', 11)
    text = c.beginText(20 * mm, PAGE_H - 45 * mm)
    text.setLeading(15)
    lines = [
        'In jedem rechtwinkligen Dreieck ist der rechte Winkel mit einem Quadrat',
        'markiert. Gegeben sind jeweils zwei Seitenlängen (schwarz).',
        'Der gesuchte Winkel ist rot markiert und mit "?" beschriftet.',
        '',
        'Berechne den gesuchten Winkel mithilfe von Sinus, Kosinus oder Tangens',
        'und der Umkehrfunktion (arcsin, arccos, arctan). Runde auf eine',
        'Nachkommastelle.',
        '',
        'Erinnerung:',
        '   sin(Winkel) = Gegenkathete / Hypotenuse',
        '   cos(Winkel) = Ankathete / Hypotenuse',
        '   tan(Winkel) = Gegenkathete / Ankathete',
        '',
        'Die vollständigen Rechenwege findest du auf der letzten Seite.',
    ]
    for line in lines:
        text.textLine(line)
    c.drawText(text)
    footer(c, 1)
    c.showPage()


def draw_problem_page(c, page_num, problems_on_page, start_index):
    header(c, 'Übungsaufgaben', f'Aufgaben {start_index + 1}-{start_index + len(problems_on_page)}')
    box_w, box_h = 80 * mm, 55 * mm
    cols_x = [18 * mm, 110 * mm]
    rows_y = [PAGE_H - 50 * mm - box_h, PAGE_H - 50 * mm - box_h - 100 * mm]

    for i, problem in enumerate(problems_on_page):
        idx = start_index + i + 1
        col, row = i % 2, i // 2
        x, y = cols_x[col], rows_y[row]
        flip = (idx % 2 == 0)

        right_vertex, marked_vertex = problem['right'], problem['marked']
        marked_key = ANGLE_AT[marked_vertex]
        side_val, _ = compute_triangle(problem)

        given_roles = ['opp', 'adj'] if problem['mode'] == 'tan' else ['adj', 'hyp']
        given_sides = {role_to_side(right_vertex, marked_vertex, r) for r in given_roles}

        side_display = {}
        for s in ('a', 'b', 'c'):
            if s in given_sides:
                val = side_val[s]
                txt = f'{s} = {val:.0f} cm' if val == int(val) else f'{s} = {val:.1f} cm'
                side_display[s] = (txt, BLACK)
            else:
                side_display[s] = (s, GRAY)

        angle_display = {marked_key: (f'{GREEK[marked_key]} = ?', RED)}
        other_vertex = [v for v in ('A', 'B', 'C') if v not in (right_vertex, marked_vertex)][0]
        angle_display[ANGLE_AT[other_vertex]] = (GREEK[ANGLE_AT[other_vertex]], GRAY)
        angle_display[ANGLE_AT[right_vertex]] = None

        c.setFont('Helvetica-Bold', 12)
        c.setFillColorRGB(*BLACK)
        c.drawString(x, y + box_h + 8, f'Aufgabe {idx}')

        draw_triangle(c, x, y, box_w, box_h, right_vertex, side_val, side_display, angle_display, flip=flip)

        ty = y - 10
        c.setFont('Helvetica', 10)
        c.drawString(x, ty, f'Berechne den Winkel {GREEK[marked_key]}.')
        c.drawString(x, ty - 16, f'{GREEK[marked_key]} = __________ °')

    footer(c, page_num)
    c.showPage()


def draw_solutions(c, page_num):
    header(c, 'Lösungen', 'Winkel berechnen - Rechenwege')
    y = PAGE_H - 42 * mm

    for i, problem in enumerate(PROBLEMS):
        idx = i + 1
        right_vertex, marked_vertex, mode = problem['right'], problem['marked'], problem['mode']
        sym = GREEK[ANGLE_AT[marked_vertex]]
        opp_side = opposite_side(marked_vertex)
        adj_side = adjacent_side(right_vertex, marked_vertex)
        hyp_s = hyp_side(right_vertex)
        _, angle = compute_triangle(problem)

        c.setFont('Helvetica-Bold', 11)
        c.setFillColorRGB(*BLACK)
        c.drawString(20 * mm, y, f'Aufgabe {idx}: {sym} ≈ {angle:.1f}°')
        y -= 13
        c.setFont('Helvetica', 9.5)
        c.setFillColorRGB(*GRAY)

        if mode == 'tan':
            opp_v, adj_v = problem['opp'], problem['adj']
            c.drawString(22 * mm, y, f'Gegeben: {opp_side} = {opp_v:g} cm, {adj_side} = {adj_v:g} cm  →  tan({sym}) = Gegenkathete / Ankathete')
            y -= 12
            ratio = opp_v / adj_v
            c.drawString(22 * mm, y, f'tan({sym}) = {opp_side}/{adj_side} = {opp_v:g}/{adj_v:g} = {ratio:.3f}  →  {sym} = arctan({ratio:.3f}) ≈ {angle:.1f}°')
        else:
            adj_v, hyp_v = problem['adj'], problem['hyp']
            c.drawString(22 * mm, y, f'Gegeben: {adj_side} = {adj_v:g} cm, {hyp_s} = {hyp_v:g} cm  →  cos({sym}) = Ankathete / Hypotenuse')
            y -= 12
            ratio = adj_v / hyp_v
            c.drawString(22 * mm, y, f'cos({sym}) = {adj_side}/{hyp_s} = {adj_v:g}/{hyp_v:g} = {ratio:.3f}  →  {sym} = arccos({ratio:.3f}) ≈ {angle:.1f}°')

        c.setFillColorRGB(*BLACK)
        y -= 22

    footer(c, page_num)
    c.showPage()


def main():
    c = canvas.Canvas(OUT, pagesize=A4)
    draw_cover(c)
    page = 2
    for start in range(0, len(PROBLEMS), 4):
        draw_problem_page(c, page, PROBLEMS[start:start + 4], start)
        page += 1
    draw_solutions(c, page)
    c.save()
    print('PDF erstellt:', OUT)


if __name__ == '__main__':
    main()
