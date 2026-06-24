"""PDF 2: Sinus, Kosinus und Tangens erkennen."""
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from triangle_draw import draw_triangle, BLACK, RED, GRAY

OUT = '../../mathe-trainer/public/downloads/sinus-kosinus-tangens-erkennen-uebungen.pdf'
PAGE_W, PAGE_H = A4

ANGLE_AT = {'A': 'alpha', 'B': 'beta', 'C': 'gamma'}
GREEK = {'alpha': 'α', 'beta': 'β', 'gamma': 'γ'}
LEG_LENGTHS = {
    'C': {'a': 7, 'b': 5},
    'A': {'b': 7, 'c': 5},
    'B': {'a': 5, 'c': 7},
}


def hyp_side(rv):
    return {'C': 'c', 'A': 'a', 'B': 'b'}[rv]


def opposite_side(v):
    return {'A': 'a', 'B': 'b', 'C': 'c'}[v]


def adjacent_side(right_vertex, marked_vertex):
    hyp = hyp_side(right_vertex)
    opp = opposite_side(marked_vertex)
    return [s for s in ('a', 'b', 'c') if s not in (hyp, opp)][0]


# Aufgaben 1-3: Funktion -> Bruch.  Aufgaben 4-6: Bruch -> Funktion.
# Felder: right_vertex, marked_vertex, mode, fn (für mode 'func2ratio'),
#         ratio (num,den side-letter Paar, für mode 'ratio2func')
PROBLEMS = [
    dict(right='C', marked='A', mode='func2ratio', fn='sin'),
    dict(right='C', marked='B', mode='func2ratio', fn='cos'),
    dict(right='A', marked='B', mode='func2ratio', fn='tan'),
    dict(right='B', marked='C', mode='ratio2func', ratio=('a', 'b')),
    dict(right='C', marked='A', mode='ratio2func', ratio=('b', 'a')),
    dict(right='A', marked='B', mode='ratio2func', ratio=('b', 'a')),
    dict(right='B', marked='A', mode='func2ratio', fn='sin'),
    dict(right='A', marked='C', mode='ratio2func', ratio=('c', 'b')),
]

FN_NAME = {'sin': 'Sinus', 'cos': 'Kosinus', 'tan': 'Tangens'}


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
    header(c, 'Sinus, Kosinus und Tangens erkennen', 'Übungsblatt: Seitenverhältnisse im rechtwinkligen Dreieck')
    text = c.beginText(20 * mm, PAGE_H - 45 * mm)
    text.setLeading(15)
    c.setFont('Helvetica', 11)
    lines = [
        'In jedem Dreieck ist der rechte Winkel mit einem Quadrat markiert. Der',
        'rot hervorgehobene Winkel ist der Winkel, auf den sich die Aufgabe bezieht.',
        '',
        'Erinnerung:',
        '   sin(Winkel) = Gegenkathete / Hypotenuse',
        '   cos(Winkel) = Ankathete / Hypotenuse',
        '   tan(Winkel) = Gegenkathete / Ankathete',
        '',
        'Aufgabe 1-3: Schreibe den passenden Bruch aus den Seitenbuchstaben (z.B. a/c) auf.',
        'Aufgabe 4-6: Welche der drei Funktionen beschreibt den gezeigten Bruch -',
        'oder handelt es sich um keine der drei (weil es ein Kehrwert ist)?',
        '',
        'Lösungen mit Begründung stehen auf der letzten Seite.',
    ]
    for line in lines:
        text.textLine(line)
    c.drawText(text)
    footer(c, 1)
    c.showPage()


def triangle_for(problem, idx):
    right_vertex = problem['right']
    marked_vertex = problem['marked']
    marked_key = ANGLE_AT[marked_vertex]
    other_vertex = [v for v in ('A', 'B', 'C') if v not in (right_vertex, marked_vertex)][0]
    other_key = ANGLE_AT[other_vertex]

    side_display = {s: (s, BLACK) for s in ('a', 'b', 'c')}
    angle_display = {marked_key: (GREEK[marked_key], RED), other_key: (GREEK[other_key], GRAY)}
    angle_display[ANGLE_AT[right_vertex]] = None
    return right_vertex, side_display, angle_display, (idx % 2 == 0)


def draw_problem_page(c, page_num, problems_on_page, start_index):
    header(c, 'Übungsaufgaben', f'Aufgaben {start_index + 1}-{start_index + len(problems_on_page)}')
    box_w, box_h = 80 * mm, 55 * mm
    cols_x = [18 * mm, 110 * mm]
    rows_y = [PAGE_H - 50 * mm - box_h, PAGE_H - 50 * mm - box_h - 100 * mm]

    for i, problem in enumerate(problems_on_page):
        idx = start_index + i + 1
        col, row = i % 2, i // 2
        x, y = cols_x[col], rows_y[row]

        right_vertex, side_display, angle_display, flip = triangle_for(problem, idx)
        marked_sym = GREEK[ANGLE_AT[problem['marked']]]

        c.setFont('Helvetica-Bold', 12)
        c.setFillColorRGB(*BLACK)
        c.drawString(x, y + box_h + 8, f'Aufgabe {idx}')

        draw_triangle(c, x, y, box_w, box_h, right_vertex, LEG_LENGTHS[right_vertex],
                       side_display, angle_display, flip=flip)

        ty = y - 10
        c.setFont('Helvetica', 10)
        if problem['mode'] == 'func2ratio':
            fn_name = FN_NAME[problem['fn']]
            c.drawString(x, ty, f'Welcher Bruch entspricht {fn_name}({marked_sym})?')
            c.drawString(x, ty - 16, 'Antwort: __________')
        else:
            num, den = problem['ratio']
            c.drawString(x, ty, f'Welche Funktion beschreibt den Bruch {num}/{den}')
            c.drawString(x, ty - 14, f'bezogen auf {marked_sym}?')
            c.drawString(x, ty - 30, 'Antwort: __________')

    footer(c, page_num)
    c.showPage()


def solution_for(problem, idx):
    right_vertex = problem['right']
    marked_vertex = problem['marked']
    marked_sym = GREEK[ANGLE_AT[marked_vertex]]
    opp = opposite_side(marked_vertex)
    adj = adjacent_side(right_vertex, marked_vertex)
    hyp = hyp_side(right_vertex)

    if problem['mode'] == 'func2ratio':
        fn = problem['fn']
        fn_name = FN_NAME[fn]
        if fn == 'sin':
            answer = f'{opp}/{hyp}'
            why = f'Gegenkathete von {marked_sym} ist {opp}, Hypotenuse ist {hyp}.'
        elif fn == 'cos':
            answer = f'{adj}/{hyp}'
            why = f'Ankathete von {marked_sym} ist {adj}, Hypotenuse ist {hyp}.'
        else:
            answer = f'{opp}/{adj}'
            why = f'Gegenkathete von {marked_sym} ist {opp}, Ankathete ist {adj}.'
        return f'Aufgabe {idx}: {fn_name}({marked_sym}) = {answer}', why

    num, den = problem['ratio']
    if {num, den} == {opp, hyp} and num == opp:
        answer, why = 'Sinus', f'{num}/{den} = Gegenkathete/Hypotenuse = sin({marked_sym}).'
    elif {num, den} == {adj, hyp} and num == adj:
        answer, why = 'Kosinus', f'{num}/{den} = Ankathete/Hypotenuse = cos({marked_sym}).'
    elif {num, den} == {opp, adj} and num == opp:
        answer, why = 'Tangens', f'{num}/{den} = Gegenkathete/Ankathete = tan({marked_sym}).'
    else:
        answer = 'Keine der drei'
        why = f'{num}/{den} ist der Kehrwert eines bekannten Verhältnisses - das ist nicht sin, cos oder tan.'
    return f'Aufgabe {idx}: {num}/{den} = {answer}', why


def draw_solutions(c, page_num):
    header(c, 'Lösungen', 'Sinus, Kosinus und Tangens erkennen')
    y = PAGE_H - 45 * mm
    for i, problem in enumerate(PROBLEMS):
        idx = i + 1
        title, why = solution_for(problem, idx)
        c.setFont('Helvetica-Bold', 11)
        c.setFillColorRGB(*BLACK)
        c.drawString(20 * mm, y, title)
        y -= 13
        c.setFont('Helvetica', 9.5)
        c.setFillColorRGB(*GRAY)
        c.drawString(22 * mm, y, why)
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
