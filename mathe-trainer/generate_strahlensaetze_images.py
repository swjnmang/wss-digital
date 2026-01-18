import matplotlib.pyplot as plt
import numpy as np
from matplotlib.patches import FancyArrowPatch
import os

# Erstelle das public/images Verzeichnis falls nicht vorhanden
os.makedirs('public/images', exist_ok=True)

def create_aufgabe1():
    """Aufgabe 1: Strahlensätze mit parallelen Linien"""
    fig, ax = plt.subplots(1, 1, figsize=(12, 8))
    
    # Punkt Z
    Z = np.array([0, 0])
    
    # Zwei Strahlen
    # Oberer Strahl: von Z durch (5, 8)
    strahl1_end = np.array([10, 16])
    # Unterer Strahl: von Z durch (6, 4)
    strahl2_end = np.array([12, 8])
    
    # Zeichne Strahlen
    ax.plot([Z[0], strahl1_end[0]], [Z[1], strahl1_end[1]], 'k-', linewidth=2.5)
    ax.plot([Z[0], strahl2_end[0]], [Z[1], strahl2_end[1]], 'k-', linewidth=2.5)
    
    # Erste parallele Linie (schneidet Strahlen bei t=0.25)
    # Oberer Strahl: 0.25 * (10, 16) = (2.5, 4)
    # Unterer Strahl: 0.25 * (12, 8) = (3, 2)
    p1_oben = Z + 0.25 * strahl1_end
    p1_unten = Z + 0.25 * strahl2_end
    ax.plot([p1_oben[0], p1_unten[0]], [p1_oben[1], p1_unten[1]], 'b-', linewidth=5)
    
    # Zweite parallele Linie (schneidet Strahlen bei t=0.5)
    p2_oben = Z + 0.5 * strahl1_end
    p2_unten = Z + 0.5 * strahl2_end
    ax.plot([p2_oben[0], p2_unten[0]], [p2_oben[1], p2_unten[1]], 'b-', linewidth=5)
    
    # Beschriftungen
    # Abschnitte auf oberem Strahl
    ax.text((p1_oben[0] + p2_oben[0])/2, (p1_oben[1] + p2_oben[1])/2 + 0.6, '20 cm', fontsize=16, fontweight='bold')
    ax.text((p2_oben[0] + strahl1_end[0])/2, (p2_oben[1] + strahl1_end[1])/2 - 0.8, '60 cm', fontsize=16, fontweight='bold')
    
    # Abschnitte auf unterem Strahl
    ax.text((p1_unten[0] + p2_unten[0])/2, (p1_unten[1] + p2_unten[1])/2 - 0.8, '50 cm', fontsize=16, fontweight='bold')
    ax.text((p2_unten[0] + strahl2_end[0])/2 + 0.5, (p2_unten[1] + strahl2_end[1])/2 + 0.6, 'x', fontsize=18, fontweight='bold', color='red')
    
    # Punkt Z beschriften
    ax.text(Z[0] - 0.5, Z[1] - 0.7, 'Z', fontsize=16, fontweight='bold')
    
    # Punkte zeichnen
    ax.plot(*Z, 'ko', markersize=8)
    ax.plot(*p1_oben, 'bo', markersize=7)
    ax.plot(*p1_unten, 'bo', markersize=7)
    ax.plot(*p2_oben, 'bo', markersize=7)
    ax.plot(*p2_unten, 'bo', markersize=7)
    ax.plot(*strahl1_end, 'ko', markersize=7)
    ax.plot(*strahl2_end, 'ko', markersize=7)
    
    ax.set_xlim(-2, 13)
    ax.set_ylim(-3, 19)
    ax.set_aspect('equal')
    ax.axis('off')
    plt.tight_layout()
    plt.savefig('public/images/strahlensaetze_aufgabe1.png', dpi=150, bbox_inches='tight', facecolor='white')
    plt.close()
    print("✓ Aufgabe 1 erstellt")

def create_aufgabe2():
    """Aufgabe 2: Ähnliche Dreiecke"""
    fig, ax = plt.subplots(1, 1, figsize=(12, 8))
    
    # Großes Dreieck
    A = np.array([0, 0])
    B = np.array([10, 0])
    C = np.array([5, 12])
    
    # Zeichne großes Dreieck
    triangle1 = np.array([A, B, C, A])
    ax.plot(triangle1[:, 0], triangle1[:, 1], 'k-', linewidth=2.5)
    
    # Höhe des großen Dreiecks
    H1 = np.array([5, 0])
    ax.plot([C[0], H1[0]], [C[1], H1[1]], 'k--', linewidth=1, alpha=0.5)
    ax.text(5.5, 6, '20 mm', fontsize=16, fontweight='bold')
    
    # Kleines ähnliches Dreieck (Skalierungsfaktor 0.5)
    A2 = np.array([2.5, 0])
    B2 = np.array([7.5, 0])
    C2 = np.array([5, 6])
    
    triangle2 = np.array([A2, B2, C2, A2])
    ax.plot(triangle2[:, 0], triangle2[:, 1], 'b--', linewidth=2.5)
    
    # Höhe des kleinen Dreiecks
    H2 = np.array([5, 0])
    ax.plot([C2[0], H2[0]], [C2[1], H2[1]], 'b--', linewidth=1, alpha=0.5)
    ax.text(5.5, 3, 'x', fontsize=18, fontweight='bold', color='red')
    
    # Beschriftungen Basen
    ax.text(5, -1.2, '30 mm', fontsize=16, fontweight='bold', ha='center')
    ax.text(5, 0.8, '14 mm', fontsize=14, fontweight='bold', ha='center', color='blue')
    
    # Punkte
    ax.plot(*A, 'ko', markersize=8)
    ax.plot(*B, 'ko', markersize=8)
    ax.plot(*C, 'ko', markersize=8)
    ax.plot(*A2, 'bo', markersize=7)
    ax.plot(*B2, 'bo', markersize=7)
    ax.plot(*C2, 'bo', markersize=7)
    
    ax.set_xlim(-2, 12)
    ax.set_ylim(-2, 14)
    ax.set_aspect('equal')
    ax.axis('off')
    plt.tight_layout()
    plt.savefig('public/images/strahlensaetze_aufgabe2.png', dpi=150, bbox_inches='tight', facecolor='white')
    plt.close()
    print("✓ Aufgabe 2 erstellt")

def create_aufgabe3():
    """Aufgabe 3: Strahlensätze mit Schnittpunkt"""
    fig, ax = plt.subplots(1, 1, figsize=(12, 8))
    
    # Punkt Z
    Z = np.array([0, 0])
    
    # Zwei Strahlen
    strahl1_end = np.array([10, 14])
    strahl2_end = np.array([12, 6])
    
    # Zeichne Strahlen
    ax.plot([Z[0], strahl1_end[0]], [Z[1], strahl1_end[1]], 'k-', linewidth=2.5)
    ax.plot([Z[0], strahl2_end[0]], [Z[1], strahl2_end[1]], 'k-', linewidth=2.5)
    
    # Erste parallele Linie bei t=0.25
    p1_oben = Z + 0.25 * strahl1_end
    p1_unten = Z + 0.25 * strahl2_end
    ax.plot([p1_oben[0], p1_unten[0]], [p1_oben[1], p1_unten[1]], 'b-', linewidth=5)
    
    # Zweite parallele Linie bei t=0.6
    p2_oben = Z + 0.6 * strahl1_end
    p2_unten = Z + 0.6 * strahl2_end
    ax.plot([p2_oben[0], p2_unten[0]], [p2_oben[1], p2_unten[1]], 'b-', linewidth=5)
    
    # Beschriftungen
    ax.text((p1_oben[0] + p2_oben[0])/2, (p1_oben[1] + p2_oben[1])/2 + 0.7, '70 cm', fontsize=16, fontweight='bold')
    ax.text((p2_oben[0] + strahl1_end[0])/2, (p2_oben[1] + strahl1_end[1])/2 - 0.8, '60 cm', fontsize=16, fontweight='bold')
    
    ax.text((p1_unten[0] + p2_unten[0])/2, (p1_unten[1] + p2_unten[1])/2 - 0.8, '50 cm', fontsize=16, fontweight='bold')
    ax.text((p2_unten[0] + strahl2_end[0])/2 + 0.5, (p2_unten[1] + strahl2_end[1])/2 + 0.6, 'x', fontsize=18, fontweight='bold', color='red')
    
    # Punkt Z beschriften
    ax.text(Z[0] - 0.5, Z[1] - 0.7, 'Z', fontsize=16, fontweight='bold')
    
    # Punkte
    ax.plot(*Z, 'ko', markersize=8)
    ax.plot(*p1_oben, 'bo', markersize=7)
    ax.plot(*p1_unten, 'bo', markersize=7)
    ax.plot(*p2_oben, 'bo', markersize=7)
    ax.plot(*p2_unten, 'bo', markersize=7)
    ax.plot(*strahl1_end, 'ko', markersize=7)
    ax.plot(*strahl2_end, 'ko', markersize=7)
    
    ax.set_xlim(-2, 14)
    ax.set_ylim(-2, 16)
    ax.set_aspect('equal')
    ax.axis('off')
    plt.tight_layout()
    plt.savefig('public/images/strahlensaetze_aufgabe3.png', dpi=150, bbox_inches='tight', facecolor='white')
    plt.close()
    print("✓ Aufgabe 3 erstellt")

def create_aufgabe4():
    """Aufgabe 4: Zwei Variablen mit Strahlensatz"""
    fig, ax = plt.subplots(1, 1, figsize=(12, 8))
    
    # Punkt Z
    Z = np.array([0, 0])
    
    # Zwei Strahlen
    strahl1_end = np.array([10, 15])
    strahl2_end = np.array([12, 7])
    
    # Zeichne Strahlen
    ax.plot([Z[0], strahl1_end[0]], [Z[1], strahl1_end[1]], 'k-', linewidth=2.5)
    ax.plot([Z[0], strahl2_end[0]], [Z[1], strahl2_end[1]], 'k-', linewidth=2.5)
    
    # Erste parallele Linie bei t=0.267 (40/150)
    t1 = 0.267
    p1_oben = Z + t1 * strahl1_end
    p1_unten = Z + t1 * strahl2_end
    ax.plot([p1_oben[0], p1_unten[0]], [p1_oben[1], p1_unten[1]], 'b-', linewidth=5)
    
    # Zweite parallele Linie bei t=0.667 (100/150)
    t2 = 0.667
    p2_oben = Z + t2 * strahl1_end
    p2_unten = Z + t2 * strahl2_end
    ax.plot([p2_oben[0], p2_unten[0]], [p2_oben[1], p2_unten[1]], 'b-', linewidth=5)
    
    # Beschriftungen
    ax.text((p1_oben[0] + p2_oben[0])/2 - 0.8, (p1_oben[1] + p2_oben[1])/2 + 0.7, 'x', fontsize=18, fontweight='bold', color='red')
    ax.text((p2_oben[0] + strahl1_end[0])/2, (p2_oben[1] + strahl1_end[1])/2 - 0.8, '50 cm', fontsize=16, fontweight='bold')
    
    ax.text((p1_unten[0] + p2_unten[0])/2, (p1_unten[1] + p2_unten[1])/2 - 0.8, '40 cm', fontsize=16, fontweight='bold')
    ax.text((p2_unten[0] + strahl2_end[0])/2 + 0.5, (p2_unten[1] + strahl2_end[1])/2 + 0.6, 'y', fontsize=18, fontweight='bold', color='red')
    
    # Zusatzbeschriftung für 30 cm
    ax.text((p2_oben[0] + strahl1_end[0])/2 + 0.5, (p2_oben[1] + strahl1_end[1])/2 + 1.2, '30 cm', fontsize=14, fontweight='bold', style='italic')
    
    # Punkt Z beschriften
    ax.text(Z[0] - 0.5, Z[1] - 0.7, 'Z', fontsize=16, fontweight='bold')
    
    # Punkte
    ax.plot(*Z, 'ko', markersize=8)
    ax.plot(*p1_oben, 'bo', markersize=7)
    ax.plot(*p1_unten, 'bo', markersize=7)
    ax.plot(*p2_oben, 'bo', markersize=7)
    ax.plot(*p2_unten, 'bo', markersize=7)
    ax.plot(*strahl1_end, 'ko', markersize=7)
    ax.plot(*strahl2_end, 'ko', markersize=7)
    
    ax.set_xlim(-2, 14)
    ax.set_ylim(-2, 18)
    ax.set_aspect('equal')
    ax.axis('off')
    plt.tight_layout()
    plt.savefig('public/images/strahlensaetze_aufgabe4.png', dpi=150, bbox_inches='tight', facecolor='white')
    plt.close()
    print("✓ Aufgabe 4 erstellt")

if __name__ == '__main__':
    print("Generiere mathematisch korrekte Strahlensätze-Diagramme...")
    create_aufgabe1()
    create_aufgabe2()
    create_aufgabe3()
    create_aufgabe4()
    print("\n✅ Alle Diagramme erfolgreich erstellt!")
