"""PDF 3: Streckenlänge mit Sinus, Kosinus und Tangens berechnen."""
import math
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from triangle_draw import draw_triangle, BLACK, RED, GRAY

OUT = '../../mathe-trainer/public/downloads/streckenlaenge-sinus-kosinus-tangens-uebungen.pdf'
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


# Jedes Problem: right_vertex, marked_vertex (Bezugswinkel), angle_deg,
# given_side ('hyp'|'opp'|'adj' relativ zum Bezugswinkel), given_value,
# target_side ('hyp'|'opp'|'adj'), unit
PROBLEMS = [
    dict(right='C', marked='A', angle=40, given_role='hyp', given_value=10.0, target_role='opp'),
    dict(right='B', marked='C', angle=35, given_role='adj', given_value=7.0, target_role='hyp'),
    dict(right='A', marked='B', angle=50, given_role='hyp', given_value=12.0, target_role='adj'),
    dict(right='B', marked='A', angle=42, given_role='adj', given_value=9.0, target_role='opp'),
    dict(right='C', marked='A', angle=28, given_role='adj', given_value=12.0, target_role='opp'),
    dict(right='A', marked='B', angle=55, given_role='opp', given_value=5.0, target_role='hyp'),
]

FN_FOR_ROLES = {
    frozenset(['opp', 'hyp']): 'sin',
    frozenset(['adj', 'hyp']): 'cos',
    frozenset(['opp', 'adj']): 'tan',
}
ROLE_NAME = {'hyp': 'Hypotenuse', 'opp': 'Gegenkathete', 'adj': 'Ankathete'}


def role_to_side(problem, role):
    right_vertex, marked_vertex = problem['right'], problem['marked']
    if role == 'hyp':
        return hyp_side(right_vertex)
    if role == 'opp':
        return opposite_side(marked_vertex)
    return adjacent_side(right_vertex, marked_vertex)


def compute_triangle(problem):
    """Berechnet alle Seiten/Winkel des Dreiecks für die Skizze und die Lösung."""
    angle = problem['angle']
    given_val = problem['given_value']
    given_role, target_role = problem['given_role'], problem['target_role']
    rad = math.radians(angle)

    # Bestimme hyp/opp/adj-Werte ausgehend vom gegebenen Wert
    if given_role == 'hyp':
        hyp = given_val
        opp = hyp * math.sin(rad)
        adj = hyp * math.cos(rad)
    elif given_role == 'opp':
        opp = given_val
        hyp = opp / math.sin(rad)
        adj = hyp * math.cos(rad)
    else:  # adj
        adj = given_val
        hyp = adj / math.cos(rad)
        opp = hyp * math.sin(rad)

    values = {'hyp': hyp, 'opp': opp, 'adj': adj}
    target_val = values[target_role]

    right_vertex, marked_vertex = problem['right'], problem['marked']
    side_val = {
        hyp_side(right_vertex): hyp,
        opposite_side(marked_vertex): opp,
        adjacent_side(right_vertex, marked_vertex): adj,
    }
    return values, side_val, target_val


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
    c.drawCentredString(PAGE_W / 2, 10 * mm, f'WSS-Digital Mathe-Trainer  ·  Seite {page_num}')
    c.setFillColorRGB(*BLACK)


def draw_cover(c):
    header(c, 'Streckenlänge berechnen', 'Übungsblatt: Sinus, Kosinus und Tangens im rechtwinkligen Dreieck')
    c.setFont('Helvetica', 11)
    text = c.beginText(20 * mm, PAGE_H - 45 * mm)
    text.setLeading(15)
    lines = [
        'In jedem rechtwinkligen Dreieck ist der rechte Winkel mit einem Quadrat',
        'markiert. Gegeben sind jeweils ein Winkel und eine Seitenlänge (schwarz).',
        'Die gesuchte Seite ist rot markiert und mit "?" beschriftet.',
        '',
        'Berechne die gesuchte Seitenlänge mithilfe von Sinus, Kosinus oder Tangens.',
        'Runde dein Ergebnis auf zwei Nachkommastellen.',
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
        _, side_val, _ = compute_triangle(problem)

        given_side = role_to_side(problem, problem['given_role'])
        target_side = role_to_side(problem, problem['target_role'])

        side_display = {}
        for s in ('a', 'b', 'c'):
            if s == target_side:
                side_display[s] = (f'{s} = ?', RED)
            elif s == given_side:
                side_display[s] = (f'{s} = {side_val[s]:.0f} cm' if side_val[s] == int(side_val[s])
                                    else f'{s} = {side_val[s]:.1f} cm', BLACK)
            else:
                side_display[s] = (s, GRAY)

        angle_display = {marked_key: (f"{GREEK[marked_key]} = {problem['angle']}°", BLACK)}
        other_vertex = [v for v in ('A', 'B', 'C') if v not in (right_vertex, marked_vertex)][0]
        angle_display[ANGLE_AT[other_vertex]] = (GREEK[ANGLE_AT[other_vertex]], GRAY)
        angle_display[ANGLE_AT[right_vertex]] = None

        c.setFont('Helvetica-Bold', 12)
        c.setFillColorRGB(*BLACK)
        c.drawString(x, y + box_h + 8, f'Aufgabe {idx}')

        draw_triangle(c, x, y, box_w, box_h, right_vertex,
                       {s: v for s, v in side_val.items()}, side_display, angle_display, flip=flip)

        ty = y - 10
        c.setFont('Helvetica', 10)
        c.drawString(x, ty, f'Berechne die Seite {target_side}.')
        c.drawString(x, ty - 16, f'{target_side} = __________ cm')

    footer(c, page_num)
    c.showPage()


def fn_for(problem):
    pair = frozenset([problem['given_role'], problem['target_role']])
    return FN_FOR_ROLES[pair]


def draw_solutions(c, page_num):
    header(c, 'Lösungen', 'Streckenlänge berechnen - Rechenwege')
    y = PAGE_H - 42 * mm

    for i, problem in enumerate(PROBLEMS):
        idx = i + 1
        marked_key = ANGLE_AT[problem['marked']]
        sym = GREEK[marked_key]
        fn = fn_for(problem)
        _, side_val, target_val = compute_triangle(problem)
        given_side = role_to_side(problem, problem['given_role'])
        target_side = role_to_side(problem, problem['target_role'])
        given_val = problem['given_value']
        angle = problem['angle']

        if fn == 'sin':
            formula = f'sin({sym}) = Gegenkathete / Hypotenuse'
        elif fn == 'cos':
            formula = f'cos({sym}) = Ankathete / Hypotenuse'
        else:
            formula = f'tan({sym}) = Gegenkathete / Ankathete'

        roles = (problem['given_role'], problem['target_role'])
        if roles == ('hyp', 'opp'):
            step = f'{target_side} = {given_side} · sin({sym}) = {given_val:g} · sin({angle}°)'
        elif roles == ('opp', 'hyp'):
            step = f'{target_side} = {given_side} / sin({sym}) = {given_val:g} / sin({angle}°)'
        elif roles == ('hyp', 'adj'):
            step = f'{target_side} = {given_side} · cos({sym}) = {given_val:g} · cos({angle}°)'
        elif roles == ('adj', 'hyp'):
            step = f'{target_side} = {given_side} / cos({sym}) = {given_val:g} / cos({angle}°)'
        elif roles == ('adj', 'opp'):
            step = f'{target_side} = {given_side} · tan({sym}) = {given_val:g} · tan({angle}°)'
        else:  # opp -> adj
            step = f'{target_side} = {given_side} / tan({sym}) = {given_val:g} / tan({angle}°)'

        c.setFont('Helvetica-Bold', 11)
        c.setFillColorRGB(*BLACK)
        c.drawString(20 * mm, y, f'Aufgabe {idx}: {target_side} ≈ {target_val:.2f} cm')
        y -= 13
        c.setFont('Helvetica', 9.5)
        c.setFillColorRGB(*GRAY)
        c.drawString(22 * mm, y, f'Gegeben: {given_side} = {given_val:g} cm, {sym} = {angle}°  →  {formula}')
        y -= 12
        c.drawString(22 * mm, y, f'{step}  ≈  {target_val:.2f} cm')
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
