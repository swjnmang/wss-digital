"""PDF 1: Rechtwinklige Dreiecke beschriften - Hypotenuse/Gegenkathete/Ankathete zuordnen."""
import math
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from triangle_draw import draw_triangle, BLACK, RED, GRAY

OUT = '../../mathe-trainer/public/downloads/rechtwinklige-dreiecke-beschriften-uebungen.pdf'
PAGE_W, PAGE_H = A4

# (rightAngle, markedAngleVertex)
PROBLEMS = [
    ('C', 'A'),  # marked = alpha
    ('A', 'B'),  # marked = beta
    ('B', 'C'),  # marked = gamma
    ('C', 'B'),
    ('A', 'C'),
    ('B', 'A'),
]

ANGLE_AT = {'A': 'alpha', 'B': 'beta', 'C': 'gamma'}
GREEK = {'alpha': 'α', 'beta': 'β', 'gamma': 'γ'}

# Leg-Längen pro right_vertex Layout, generisch (nur für hübsche Proportionen, keine echten Werte nötig)
LEG_LENGTHS = {
    'C': {'a': 7, 'b': 5},
    'A': {'b': 7, 'c': 5},
    'B': {'a': 5, 'c': 7},
}


def hyp_side(right_vertex):
    return {'C': 'c', 'A': 'a', 'B': 'b'}[right_vertex]


def opposite_side(vertex):
    return {'A': 'a', 'B': 'b', 'C': 'c'}[vertex]


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
    header(c, 'Rechtwinklige Dreiecke beschriften', 'Übungsblatt: Hypotenuse, Gegenkathete, Ankathete')
    c.setFont('Helvetica', 11)
    text = c.beginText(20 * mm, PAGE_H - 45 * mm)
    text.setLeading(15)
    lines = [
        'In jedem der folgenden rechtwinkligen Dreiecke ist der rechte Winkel mit einem',
        'kleinen Quadrat markiert. Außerdem ist ein weiterer Winkel (α, β oder γ) rot',
        'hervorgehoben - das ist der Winkel, von dem aus du die Seiten betrachten sollst.',
        '',
        'Trage für jede Aufgabe ein, welche Seite (a, b oder c) die Hypotenuse, die',
        'Gegenkathete und die Ankathete des markierten Winkels ist.',
        '',
        'Erinnerung:',
        '  • Hypotenuse: die Seite gegenüber dem rechten Winkel (die längste Seite)',
        '  • Gegenkathete: die Seite gegenüber dem markierten Winkel',
        '  • Ankathete: die verbleibende Seite, die am markierten Winkel anliegt',
        '    (aber nicht die Hypotenuse ist)',
        '',
        'Die Lösungen mit kurzer Begründung findest du auf der letzten Seite.',
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
    rows_y = [PAGE_H - 50 * mm - box_h, PAGE_H - 50 * mm - box_h - 105 * mm]

    for i, (right_vertex, marked_vertex) in enumerate(problems_on_page):
        idx = start_index + i + 1
        col = i % 2
        row = i // 2
        x = cols_x[col]
        y = rows_y[row]
        flip = (idx % 2 == 0)

        marked_key = ANGLE_AT[marked_vertex]
        other_vertex = [v for v in ('A', 'B', 'C') if v not in (right_vertex, marked_vertex)][0]
        other_key = ANGLE_AT[other_vertex]

        side_display = {s: (s, BLACK) for s in ('a', 'b', 'c')}
        angle_display = {marked_key: (f'{GREEK[marked_key]}', RED), other_key: (GREEK[other_key], GRAY)}
        angle_display[ANGLE_AT[right_vertex]] = None

        c.setFont('Helvetica-Bold', 12)
        c.setFillColorRGB(*BLACK)
        c.drawString(x, y + box_h + 8, f'Aufgabe {idx}')

        draw_triangle(c, x, y, box_w, box_h, right_vertex, LEG_LENGTHS[right_vertex],
                       side_display, angle_display, flip=flip)

        ty = y - 8
        c.setFont('Helvetica', 10)
        c.drawString(x, ty, f'Vom Winkel {GREEK[marked_key]} aus:')
        c.drawString(x, ty - 14, 'Hypotenuse = __________')
        c.drawString(x, ty - 28, 'Gegenkathete = __________')
        c.drawString(x, ty - 42, 'Ankathete = __________')

    footer(c, page_num)
    c.showPage()


def solution_text(right_vertex, marked_vertex):
    hyp = hyp_side(right_vertex)
    gegen = opposite_side(marked_vertex)
    anka = [s for s in ('a', 'b', 'c') if s not in (hyp, gegen)][0]
    marked_key = ANGLE_AT[marked_vertex]
    return (
        f'Rechter Winkel liegt bei {right_vertex}  →  Hypotenuse = {hyp}.  '
        f'Markierter Winkel {GREEK[marked_key]} liegt bei {marked_vertex}  →  Gegenkathete '
        f'(gegenüber {marked_vertex}) = {gegen}.  Damit ist Ankathete = {anka}.',
        hyp, gegen, anka,
    )


def draw_solutions(c, page_num):
    header(c, 'Lösungen', 'Hypotenuse, Gegenkathete und Ankathete')
    y = PAGE_H - 45 * mm
    c.setFont('Helvetica', 10.5)
    for i, (right_vertex, marked_vertex) in enumerate(PROBLEMS):
        idx = i + 1
        explanation, hyp, gegen, anka = solution_text(right_vertex, marked_vertex)
        c.setFont('Helvetica-Bold', 11)
        c.drawString(20 * mm, y, f'Aufgabe {idx}: Hypotenuse = {hyp}, Gegenkathete = {gegen}, Ankathete = {anka}')
        y -= 13
        c.setFont('Helvetica', 9.5)
        c.setFillColorRGB(*GRAY)
        # einfacher Zeilenumbruch
        words = explanation.split(' ')
        line = ''
        for word in words:
            test = (line + ' ' + word).strip()
            if c.stringWidth(test, 'Helvetica', 9.5) > 170 * mm:
                c.drawString(22 * mm, y, line)
                y -= 12
                line = word
            else:
                line = test
        if line:
            c.drawString(22 * mm, y, line)
            y -= 12
        c.setFillColorRGB(*BLACK)
        y -= 10
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
