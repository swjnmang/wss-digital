"""Wiederverwendbare Hilfsfunktionen zum Zeichnen rechtwinkliger Dreiecke
auf einem reportlab-Canvas (Vektorgrafik, kein Raster)."""
import math

BLACK = (0.12, 0.16, 0.22)
RED = (0.86, 0.15, 0.15)
GRAY = (0.42, 0.45, 0.5)

# Zuordnung: an welcher Ecke liegt der rechte Winkel (Corner),
# welche Ecke ist "oben" (Top, vertikaler Schenkel), welche "rechts" (Right, horizontaler Schenkel),
# und welche Seite (a/b/c) entspricht welcher Kante.
LAYOUT = {
    'C': dict(corner='C', top='A', right='B', corner_top='b', corner_right='a', hyp='c'),
    'A': dict(corner='A', top='B', right='C', corner_top='c', corner_right='b', hyp='a'),
    'B': dict(corner='B', top='C', right='A', corner_top='a', corner_right='c', hyp='b'),
}

ANGLE_AT = {'A': 'alpha', 'B': 'beta', 'C': 'gamma'}
GREEK = {'alpha': 'α', 'beta': 'β', 'gamma': 'γ'}


def _norm(vx, vy):
    length = math.hypot(vx, vy) or 1.0
    return vx / length, vy / length


def _arc_params(vx, vy, p1x, p1y, p2x, p2y):
    a1 = math.degrees(math.atan2(p1y - vy, p1x - vx))
    a2 = math.degrees(math.atan2(p2y - vy, p2x - vx))
    delta = a2 - a1
    while delta <= -180:
        delta += 360
    while delta > 180:
        delta -= 360
    return a1, delta


def draw_triangle(c, box_x, box_y, box_w, box_h, right_vertex,
                   leg_lengths, side_display, angle_display, flip=False):
    """
    box_x, box_y: untere linke Ecke des verfügbaren Zeichenbereichs (PDF-Punkte)
    box_w, box_h: verfügbare Breite/Höhe
    right_vertex: 'A' | 'B' | 'C' -- an dieser Ecke liegt der rechte Winkel
    leg_lengths: dict mit den realen Längen der beiden Schenkel, keyed by side letter (a/b/c),
                 wird genutzt um das Dreieck proportional zu skalieren
    side_display: dict side_letter -> (text, color) für jede der drei Seiten a,b,c
    angle_display: dict angle_key('alpha'/'beta'/'gamma') -> (text, color) oder None (keine Anzeige)
    flip: horizontale Spiegelung für visuelle Abwechslung
    """
    layout = LAYOUT[right_vertex]
    corner_top_len = leg_lengths[layout['corner_top']]
    corner_right_len = leg_lengths[layout['corner_right']]

    margin = 30
    avail_w = box_w - 2 * margin
    avail_h = box_h - 2 * margin
    scale = min(avail_w / corner_right_len, avail_h / corner_top_len)

    w = corner_right_len * scale
    h = corner_top_len * scale

    if flip:
        corner = (box_x + box_w - margin, box_y + margin)
        top = (corner[0], corner[1] + h)
        right = (corner[0] - w, corner[1])
    else:
        corner = (box_x + margin, box_y + margin)
        top = (corner[0], corner[1] + h)
        right = (corner[0] + w, corner[1])

    positions = {layout['corner']: corner, layout['top']: top, layout['right']: right}
    pA, pB, pC = positions['A'], positions['B'], positions['C']

    # Dreieck (Umriss)
    c.setLineWidth(1.3)
    c.setStrokeColorRGB(*BLACK)
    c.setFillColorRGB(*BLACK)
    p = c.beginPath()
    p.moveTo(*pA)
    p.lineTo(*pB)
    p.lineTo(*pC)
    p.close()
    c.drawPath(p, stroke=1, fill=0)

    # Eckpunkte (kleine Punkte)
    for pt in (pA, pB, pC):
        c.circle(pt[0], pt[1], 1.6, stroke=0, fill=1)

    # Punktlabels A/B/C nach außen versetzt (Schwerpunkt-Methode)
    centroid = ((pA[0] + pB[0] + pC[0]) / 3, (pA[1] + pB[1] + pC[1]) / 3)
    c.setFont('Helvetica-Bold', 10)
    for name, pt in (('A', pA), ('B', pB), ('C', pC)):
        dx, dy = pt[0] - centroid[0], pt[1] - centroid[1]
        ux, uy = _norm(dx, dy)
        lx, ly = pt[0] + ux * 15, pt[1] + uy * 15
        if dx > 4:
            c.drawString(lx, ly - 3, name)
        elif dx < -4:
            c.drawRightString(lx, ly - 3, name)
        else:
            c.drawCentredString(lx, ly - 3, name)

    # Rechter-Winkel-Markierung an "corner" (kleines Quadrat)
    sq = 9
    cx, cy = corner
    dir_top = _norm(top[0] - cx, top[1] - cy)
    dir_right = _norm(right[0] - cx, right[1] - cy)
    p1 = (cx + dir_top[0] * sq, cy + dir_top[1] * sq)
    p2 = (cx + dir_top[0] * sq + dir_right[0] * sq, cy + dir_top[1] * sq + dir_right[1] * sq)
    p3 = (cx + dir_right[0] * sq, cy + dir_right[1] * sq)
    c.setLineWidth(1)
    c.setStrokeColorRGB(*GRAY)
    sqpath = c.beginPath()
    sqpath.moveTo(*p1)
    sqpath.lineTo(*p2)
    sqpath.lineTo(*p3)
    c.drawPath(sqpath, stroke=1, fill=0)

    # Seitenlabels (Mittelpunkt + nach außen versetzt, weg vom Schwerpunkt)
    c.setFont('Helvetica', 9.5)
    sides = {
        layout['corner_top']: (corner, top),
        layout['corner_right']: (corner, right),
        layout['hyp']: (top, right),
    }
    for side_letter, (p_start, p_end) in sides.items():
        text, color = side_display[side_letter]
        mid = ((p_start[0] + p_end[0]) / 2, (p_start[1] + p_end[1]) / 2)
        dx, dy = mid[0] - centroid[0], mid[1] - centroid[1]
        ux, uy = _norm(dx, dy)
        lx, ly = mid[0] + ux * 17, mid[1] + uy * 17
        c.setFillColorRGB(*color)
        c.drawCentredString(lx, ly - 3, text)

    # Winkel-Bögen an "top" und "right" (corner hat das rechte-Winkel-Quadrat)
    radius = 16
    for vertex_name in (layout['top'], layout['right']):
        angle_key = ANGLE_AT[vertex_name]
        if angle_display.get(angle_key) is None:
            continue
        text, color = angle_display[angle_key]
        vx, vy = positions[vertex_name]
        others = [positions[v] for v in ('A', 'B', 'C') if v != vertex_name]
        start, extent = _arc_params(vx, vy, others[0][0], others[0][1], others[1][0], others[1][1])
        c.setStrokeColorRGB(*color)
        c.setLineWidth(1.1)
        c.arc(vx - radius, vy - radius, vx + radius, vy + radius, start, extent)
        a1 = math.radians(start)
        a2 = math.radians(start + extent)
        bis_x, bis_y = math.cos((a1 + a2) / 2), math.sin((a1 + a2) / 2)
        lx, ly = vx + bis_x * (radius + 13), vy + bis_y * (radius + 13)
        c.setFillColorRGB(*color)
        c.setFont('Helvetica', 10)
        c.drawCentredString(lx, ly - 3, text)

    c.setFillColorRGB(*BLACK)
    c.setStrokeColorRGB(*BLACK)
