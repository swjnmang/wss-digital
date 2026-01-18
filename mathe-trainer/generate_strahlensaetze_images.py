import matplotlib.pyplot as plt
import numpy as np
import os

# Erstelle das public/images Verzeichnis im mathe-trainer Verzeichnis
images_dir = os.path.join(os.path.dirname(__file__), 'public', 'images')
os.makedirs(images_dir, exist_ok=True)

def create_aufgabe1():
    """Aufgabe 1: Strahlensätze mit parallelen Linien"""
    fig, ax = plt.subplots(1, 1, figsize=(14, 9))
    
    # Punkt Z (Ursprung)
    Z = np.array([0, 0])
    
    # Zwei Strahlen
    strahl1_end = np.array([10, 16])
    strahl2_end = np.array([12, 8])
    
    # Zeichne Strahlen
    ax.plot([Z[0], strahl1_end[0]], [Z[1], strahl1_end[1]], 'k-', linewidth=3)
    ax.plot([Z[0], strahl2_end[0]], [Z[1], strahl2_end[1]], 'k-', linewidth=3)
    
    # Erste parallele Linie bei t=0.25
    t1 = 0.25
    A = Z + t1 * strahl1_end        # Schnittpunkt oberer Strahl
    A_strich = Z + t1 * strahl2_end  # Schnittpunkt unterer Strahl
    ax.plot([A[0], A_strich[0]], [A[1], A_strich[1]], 'b-', linewidth=6, alpha=0.8)
    
    # Zweite parallele Linie bei t=0.5
    t2 = 0.5
    B = Z + t2 * strahl1_end
    B_strich = Z + t2 * strahl2_end
    ax.plot([B[0], B_strich[0]], [B[1], B_strich[1]], 'b-', linewidth=6, alpha=0.8)
    
    # Strahlendpunkte
    C = strahl1_end
    C_strich = strahl2_end
    
    # Beschriftungen der Strecken (gegeben = schwarz, gesucht = rot)
    # Oberer Strahl: ZA, AB, BC
    mid_ZA = (Z + A) / 2
    mid_AB = (A + B) / 2
    mid_BC = (B + C) / 2
    
    ax.text(mid_ZA[0] - 1.2, mid_ZA[1] + 0.8, '10 cm', fontsize=15, color='black', fontweight='bold',
            bbox=dict(boxstyle='round,pad=0.3', facecolor='white', edgecolor='black', linewidth=1))
    ax.text(mid_AB[0] - 0.5, mid_AB[1] + 1.2, '20 cm', fontsize=15, color='black', fontweight='bold',
            bbox=dict(boxstyle='round,pad=0.3', facecolor='white', edgecolor='black', linewidth=1))
    ax.text(mid_BC[0] + 0.8, mid_BC[1] + 1.2, '60 cm', fontsize=15, color='black', fontweight='bold',
            bbox=dict(boxstyle='round,pad=0.3', facecolor='white', edgecolor='black', linewidth=1))
    
    # Unterer Strahl: ZA', A'B', B'C'
    mid_ZA_s = (Z + A_strich) / 2
    mid_AB_s = (A_strich + B_strich) / 2
    mid_BC_s = (B_strich + C_strich) / 2
    
    ax.text(mid_ZA_s[0] - 1.2, mid_ZA_s[1] - 1.2, '12 cm', fontsize=15, color='black', fontweight='bold',
            bbox=dict(boxstyle='round,pad=0.3', facecolor='white', edgecolor='black', linewidth=1))
    ax.text(mid_AB_s[0] + 0.3, mid_AB_s[1] - 1.2, '50 cm', fontsize=15, color='black', fontweight='bold',
            bbox=dict(boxstyle='round,pad=0.3', facecolor='white', edgecolor='black', linewidth=1))
    ax.text(mid_BC_s[0] + 1.5, mid_BC_s[1] + 0.5, 'x', fontsize=17, color='red', fontweight='bold',
            bbox=dict(boxstyle='round,pad=0.4', facecolor='lightyellow', edgecolor='red', linewidth=2))
    
    # Punkte und Labels
    # Z (Ursprung)
    ax.plot(*Z, 'ko', markersize=10)
    ax.text(Z[0] - 0.8, Z[1] - 0.9, 'Z', fontsize=16, fontweight='bold', ha='right')
    
    # Schnittpunkte
    ax.plot(*A, 'ko', markersize=8)
    ax.text(A[0] - 0.9, A[1] + 0.5, 'A', fontsize=14, fontweight='bold', ha='right', color='darkblue')
    
    ax.plot(*A_strich, 'ko', markersize=8)
    ax.text(A_strich[0] + 0.7, A_strich[1] - 0.6, "A'", fontsize=14, fontweight='bold', color='darkblue')
    
    ax.plot(*B, 'ko', markersize=8)
    ax.text(B[0] - 0.9, B[1] + 0.5, 'B', fontsize=14, fontweight='bold', ha='right', color='darkblue')
    
    ax.plot(*B_strich, 'ko', markersize=8)
    ax.text(B_strich[0] + 0.7, B_strich[1] - 0.6, "B'", fontsize=14, fontweight='bold', color='darkblue')
    
    ax.plot(*C, 'ko', markersize=8)
    ax.text(C[0] - 0.8, C[1] + 0.5, 'C', fontsize=14, fontweight='bold', ha='right')
    
    ax.plot(*C_strich, 'ko', markersize=8)
    ax.text(C_strich[0] + 0.7, C_strich[1] - 0.6, "C'", fontsize=14, fontweight='bold')
    
    ax.set_xlim(-3, 14)
    ax.set_ylim(-2, 18)
    ax.set_aspect('equal')
    ax.axis('off')
    plt.tight_layout()
    plt.savefig(os.path.join(images_dir, 'strahlensaetze_aufgabe1.png'), dpi=150, bbox_inches='tight', facecolor='white')
    plt.close()
    print("✓ Aufgabe 1 erstellt")

def create_aufgabe2():
    """Aufgabe 2: Ähnliche Dreiecke"""
    fig, ax = plt.subplots(1, 1, figsize=(14, 9))
    
    # Großes Dreieck
    A = np.array([1, 0])
    B = np.array([11, 0])
    C = np.array([6, 10])
    
    # Zeichne großes Dreieck
    triangle1 = np.array([A, B, C, A])
    ax.plot(triangle1[:, 0], triangle1[:, 1], 'k-', linewidth=3)
    
    # Höhe des großen Dreiecks
    H1 = np.array([6, 0])
    ax.plot([C[0], H1[0]], [C[1], H1[1]], 'k--', linewidth=1.5, alpha=0.6)
    
    # Abstand AB (gegeben)
    ax.text(6, -1.5, '30 mm', fontsize=15, color='black', fontweight='bold', ha='center',
            bbox=dict(boxstyle='round,pad=0.3', facecolor='white', edgecolor='black', linewidth=1))
    
    # Höhe des großen Dreiecks (gegeben)
    ax.text(6.8, 5, '20 mm', fontsize=15, color='black', fontweight='bold',
            bbox=dict(boxstyle='round,pad=0.3', facecolor='white', edgecolor='black', linewidth=1))
    
    # Kleines ähnliches Dreieck (skaliert)
    t = 14 / 30  # Skalierungsfaktor
    A2 = A + t * (B - A) * 0.4  # Positionierung innerhalb
    B2 = A2 + t * (B - A)
    C2 = C - (C - H1) * (1 - t)
    
    A2 = np.array([3.2, 0])
    B2 = np.array([8.8, 0])
    C2 = np.array([6, 5.6])
    
    triangle2 = np.array([A2, B2, C2, A2])
    ax.plot(triangle2[:, 0], triangle2[:, 1], 'b-', linewidth=2.5, alpha=0.8)
    
    # Höhe des kleinen Dreiecks
    H2 = np.array([6, 0])
    ax.plot([C2[0], H2[0]], [C2[1], H2[1]], 'b--', linewidth=1.5, alpha=0.6)
    
    # Abstand A2B2 (gegeben)
    ax.text(6, 0.8, '14 mm', fontsize=14, color='black', fontweight='bold', ha='center',
            bbox=dict(boxstyle='round,pad=0.3', facecolor='lightblue', edgecolor='darkblue', linewidth=1))
    
    # Höhe des kleinen Dreiecks (gesucht)
    ax.text(6.8, 2.8, 'x', fontsize=17, color='red', fontweight='bold',
            bbox=dict(boxstyle='round,pad=0.4', facecolor='lightyellow', edgecolor='red', linewidth=2))
    
    # Punkte und Labels großes Dreieck
    ax.plot(*A, 'ko', markersize=9)
    ax.text(A[0] - 0.6, A[1] - 0.8, 'A', fontsize=14, fontweight='bold')
    
    ax.plot(*B, 'ko', markersize=9)
    ax.text(B[0] + 0.6, B[1] - 0.8, 'B', fontsize=14, fontweight='bold')
    
    ax.plot(*C, 'ko', markersize=9)
    ax.text(C[0] + 0.4, C[1] + 0.5, 'C', fontsize=14, fontweight='bold')
    
    ax.plot(*H1, 'ko', markersize=6, alpha=0.6)
    
    # Punkte und Labels kleines Dreieck
    ax.plot(*A2, 'bo', markersize=8)
    ax.text(A2[0] - 0.6, A2[1] - 0.8, "A'", fontsize=13, fontweight='bold', color='darkblue')
    
    ax.plot(*B2, 'bo', markersize=8)
    ax.text(B2[0] + 0.6, B2[1] - 0.8, "B'", fontsize=13, fontweight='bold', color='darkblue')
    
    ax.plot(*C2, 'bo', markersize=8)
    ax.text(C2[0] + 0.4, C2[1] + 0.5, "C'", fontsize=13, fontweight='bold', color='darkblue')
    
    ax.plot(*H2, 'bo', markersize=6, alpha=0.6)
    
    ax.set_xlim(-0.5, 12.5)
    ax.set_ylim(-2.5, 11)
    ax.set_aspect('equal')
    ax.axis('off')
    plt.tight_layout()
    plt.savefig(os.path.join(images_dir, 'strahlensaetze_aufgabe2.png'), dpi=150, bbox_inches='tight', facecolor='white')
    plt.close()
    print("✓ Aufgabe 2 erstellt")

def create_aufgabe3():
    """Aufgabe 3: Strahlensätze mit Schnittpunkt"""
    fig, ax = plt.subplots(1, 1, figsize=(14, 9))
    
    # Punkt Z (Ursprung)
    Z = np.array([0, 0])
    
    # Zwei Strahlen
    strahl1_end = np.array([10, 14])
    strahl2_end = np.array([12, 6])
    
    # Zeichne Strahlen
    ax.plot([Z[0], strahl1_end[0]], [Z[1], strahl1_end[1]], 'k-', linewidth=3)
    ax.plot([Z[0], strahl2_end[0]], [Z[1], strahl2_end[1]], 'k-', linewidth=3)
    
    # Erste parallele Linie bei t=0.25
    t1 = 0.25
    A = Z + t1 * strahl1_end
    A_strich = Z + t1 * strahl2_end
    ax.plot([A[0], A_strich[0]], [A[1], A_strich[1]], 'b-', linewidth=6, alpha=0.8)
    
    # Zweite parallele Linie bei t=0.6
    t2 = 0.6
    B = Z + t2 * strahl1_end
    B_strich = Z + t2 * strahl2_end
    ax.plot([B[0], B_strich[0]], [B[1], B_strich[1]], 'b-', linewidth=6, alpha=0.8)
    
    # Strahlendpunkte
    C = strahl1_end
    C_strich = strahl2_end
    
    # Beschriftungen der Strecken (gegeben = schwarz, gesucht = rot)
    # Oberer Strahl: ZA, AB, BC
    mid_ZA = (Z + A) / 2
    mid_AB = (A + B) / 2
    mid_BC = (B + C) / 2
    
    ax.text(mid_ZA[0] - 1.3, mid_ZA[1] + 0.7, '3.5 cm', fontsize=15, color='black', fontweight='bold',
            bbox=dict(boxstyle='round,pad=0.3', facecolor='white', edgecolor='black', linewidth=1))
    ax.text(mid_AB[0] - 0.6, mid_AB[1] + 1.3, '70 cm', fontsize=15, color='black', fontweight='bold',
            bbox=dict(boxstyle='round,pad=0.3', facecolor='white', edgecolor='black', linewidth=1))
    ax.text(mid_BC[0] + 1.0, mid_BC[1] + 0.9, '60 cm', fontsize=15, color='black', fontweight='bold',
            bbox=dict(boxstyle='round,pad=0.3', facecolor='white', edgecolor='black', linewidth=1))
    
    # Unterer Strahl: ZA', A'B', B'C'
    mid_ZA_s = (Z + A_strich) / 2
    mid_AB_s = (A_strich + B_strich) / 2
    mid_BC_s = (B_strich + C_strich) / 2
    
    ax.text(mid_ZA_s[0] - 1.3, mid_ZA_s[1] - 1.0, '4.2 cm', fontsize=15, color='black', fontweight='bold',
            bbox=dict(boxstyle='round,pad=0.3', facecolor='white', edgecolor='black', linewidth=1))
    ax.text(mid_AB_s[0] + 0.2, mid_AB_s[1] - 1.2, '50 cm', fontsize=15, color='black', fontweight='bold',
            bbox=dict(boxstyle='round,pad=0.3', facecolor='white', edgecolor='black', linewidth=1))
    ax.text(mid_BC_s[0] + 1.8, mid_BC_s[1] + 0.4, 'x', fontsize=17, color='red', fontweight='bold',
            bbox=dict(boxstyle='round,pad=0.4', facecolor='lightyellow', edgecolor='red', linewidth=2))
    
    # Punkte und Labels
    # Z (Ursprung)
    ax.plot(*Z, 'ko', markersize=10)
    ax.text(Z[0] - 0.8, Z[1] - 0.9, 'Z', fontsize=16, fontweight='bold', ha='right')
    
    # Schnittpunkte
    ax.plot(*A, 'ko', markersize=8)
    ax.text(A[0] - 0.9, A[1] + 0.5, 'A', fontsize=14, fontweight='bold', ha='right', color='darkblue')
    
    ax.plot(*A_strich, 'ko', markersize=8)
    ax.text(A_strich[0] + 0.7, A_strich[1] - 0.6, "A'", fontsize=14, fontweight='bold', color='darkblue')
    
    ax.plot(*B, 'ko', markersize=8)
    ax.text(B[0] - 0.9, B[1] + 0.5, 'B', fontsize=14, fontweight='bold', ha='right', color='darkblue')
    
    ax.plot(*B_strich, 'ko', markersize=8)
    ax.text(B_strich[0] + 0.7, B_strich[1] - 0.6, "B'", fontsize=14, fontweight='bold', color='darkblue')
    
    ax.plot(*C, 'ko', markersize=8)
    ax.text(C[0] - 0.8, C[1] + 0.5, 'C', fontsize=14, fontweight='bold', ha='right')
    
    ax.plot(*C_strich, 'ko', markersize=8)
    ax.text(C_strich[0] + 0.7, C_strich[1] - 0.6, "C'", fontsize=14, fontweight='bold')
    
    ax.set_xlim(-3, 14)
    ax.set_ylim(-2, 16)
    ax.set_aspect('equal')
    ax.axis('off')
    plt.tight_layout()
    plt.savefig(os.path.join(images_dir, 'strahlensaetze_aufgabe3.png'), dpi=150, bbox_inches='tight', facecolor='white')
    plt.close()
    print("✓ Aufgabe 3 erstellt")

def create_aufgabe4():
    """Aufgabe 4: Zwei Variablen mit Strahlensatz"""
    fig, ax = plt.subplots(1, 1, figsize=(14, 9))
    
    # Punkt Z (Ursprung)
    Z = np.array([0, 0])
    
    # Zwei Strahlen
    strahl1_end = np.array([10, 15])
    strahl2_end = np.array([12, 7])
    
    # Zeichne Strahlen
    ax.plot([Z[0], strahl1_end[0]], [Z[1], strahl1_end[1]], 'k-', linewidth=3)
    ax.plot([Z[0], strahl2_end[0]], [Z[1], strahl2_end[1]], 'k-', linewidth=3)
    
    # Erste parallele Linie bei t=0.267 (40/150)
    t1 = 0.267
    A = Z + t1 * strahl1_end
    A_strich = Z + t1 * strahl2_end
    ax.plot([A[0], A_strich[0]], [A[1], A_strich[1]], 'b-', linewidth=6, alpha=0.8)
    
    # Zweite parallele Linie bei t=0.667 (100/150)
    t2 = 0.667
    B = Z + t2 * strahl1_end
    B_strich = Z + t2 * strahl2_end
    ax.plot([B[0], B_strich[0]], [B[1], B_strich[1]], 'b-', linewidth=6, alpha=0.8)
    
    # Strahlendpunkte
    C = strahl1_end
    C_strich = strahl2_end
    
    # Beschriftungen der Strecken (gegeben = schwarz, gesucht = rot)
    # Oberer Strahl: ZA (gegeben), AB (gesucht), BC (gegeben)
    mid_ZA = (Z + A) / 2
    mid_AB = (A + B) / 2
    mid_BC = (B + C) / 2
    
    ax.text(mid_ZA[0] - 1.2, mid_ZA[1] + 0.5, '40 cm', fontsize=15, color='black', fontweight='bold',
            bbox=dict(boxstyle='round,pad=0.3', facecolor='white', edgecolor='black', linewidth=1))
    ax.text(mid_AB[0] - 0.5, mid_AB[1] + 1.3, 'x', fontsize=17, color='red', fontweight='bold',
            bbox=dict(boxstyle='round,pad=0.4', facecolor='lightyellow', edgecolor='red', linewidth=2))
    ax.text(mid_BC[0] + 0.9, mid_BC[1] + 0.9, '50 cm', fontsize=15, color='black', fontweight='bold',
            bbox=dict(boxstyle='round,pad=0.3', facecolor='white', edgecolor='black', linewidth=1))
    
    # Unterer Strahl: ZA' (gegeben), A'B' (gegeben), B'C' (gesucht)
    mid_ZA_s = (Z + A_strich) / 2
    mid_AB_s = (A_strich + B_strich) / 2
    mid_BC_s = (B_strich + C_strich) / 2
    
    ax.text(mid_ZA_s[0] - 1.2, mid_ZA_s[1] - 0.9, '30 cm', fontsize=15, color='black', fontweight='bold',
            bbox=dict(boxstyle='round,pad=0.3', facecolor='white', edgecolor='black', linewidth=1))
    ax.text(mid_AB_s[0] + 0.3, mid_AB_s[1] - 1.1, '40 cm', fontsize=15, color='black', fontweight='bold',
            bbox=dict(boxstyle='round,pad=0.3', facecolor='white', edgecolor='black', linewidth=1))
    ax.text(mid_BC_s[0] + 1.8, mid_BC_s[1] + 0.3, 'y', fontsize=17, color='red', fontweight='bold',
            bbox=dict(boxstyle='round,pad=0.4', facecolor='lightyellow', edgecolor='red', linewidth=2))
    
    # Punkte und Labels
    # Z (Ursprung)
    ax.plot(*Z, 'ko', markersize=10)
    ax.text(Z[0] - 0.8, Z[1] - 0.9, 'Z', fontsize=16, fontweight='bold', ha='right')
    
    # Schnittpunkte
    ax.plot(*A, 'ko', markersize=8)
    ax.text(A[0] - 0.9, A[1] + 0.5, 'A', fontsize=14, fontweight='bold', ha='right', color='darkblue')
    
    ax.plot(*A_strich, 'ko', markersize=8)
    ax.text(A_strich[0] + 0.7, A_strich[1] - 0.6, "A'", fontsize=14, fontweight='bold', color='darkblue')
    
    ax.plot(*B, 'ko', markersize=8)
    ax.text(B[0] - 0.9, B[1] + 0.5, 'B', fontsize=14, fontweight='bold', ha='right', color='darkblue')
    
    ax.plot(*B_strich, 'ko', markersize=8)
    ax.text(B_strich[0] + 0.7, B_strich[1] - 0.6, "B'", fontsize=14, fontweight='bold', color='darkblue')
    
    ax.plot(*C, 'ko', markersize=8)
    ax.text(C[0] - 0.8, C[1] + 0.5, 'C', fontsize=14, fontweight='bold', ha='right')
    
    ax.plot(*C_strich, 'ko', markersize=8)
    ax.text(C_strich[0] + 0.7, C_strich[1] - 0.6, "C'", fontsize=14, fontweight='bold')
    
    ax.set_xlim(-3, 14)
    ax.set_ylim(-2, 17)
    ax.set_aspect('equal')
    ax.axis('off')
    plt.tight_layout()
    plt.savefig(os.path.join(images_dir, 'strahlensaetze_aufgabe4.png'), dpi=150, bbox_inches='tight', facecolor='white')
    plt.close()
    print("✓ Aufgabe 4 erstellt")

if __name__ == '__main__':
    print("Generiere mathematisch korrekte Strahlensätze-Diagramme...")
    create_aufgabe1()
    create_aufgabe2()
    create_aufgabe3()
    create_aufgabe4()
    print("\n✅ Alle Diagramme erfolgreich erstellt!")
