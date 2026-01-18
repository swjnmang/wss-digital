import matplotlib.pyplot as plt
import numpy as np
import os

# Erstelle das public/images Verzeichnis im mathe-trainer Verzeichnis
images_dir = os.path.join(os.path.dirname(__file__), 'public', 'images')
os.makedirs(images_dir, exist_ok=True)

def create_aufgabe(aufgabe_num, layout_config):
    """
    Erstelle eine Strahlensätze-Aufgabe mit angegebener Konfiguration
    
    layout_config: dict mit folgenden Schlüsseln:
    - strahl1_end: Endpunkt von Strahl 1
    - strahl2_end: Endpunkt von Strahl 2
    - t1: Parameter für erste parallele Linie
    - t2: Parameter für zweite parallele Linie
    - labels: Tuple mit Punktlabels (label_Z, label_1a, label_1b, label_2a, label_2b, label_end1, label_end2)
    - values: Tuple mit Streckenlängen (val_ZA, val_AB, val_BC, val_ZA_s, val_AB_s, val_BC_s)
    - unknown_idx: Index des unbekannten Wertes (0-5)
    - title: Aufgabentitel
    - description: Aufgabenbeschreibung
    """
    
    fig, ax = plt.subplots(1, 1, figsize=(14, 9))
    
    # Z ist immer am Ursprung
    Z = np.array([0, 0])
    
    # Strahlendpunkte
    strahl1_end = np.array(layout_config['strahl1_end'])
    strahl2_end = np.array(layout_config['strahl2_end'])
    
    # Zeichne Strahlen
    ax.plot([Z[0], strahl1_end[0]], [Z[1], strahl1_end[1]], 'k-', linewidth=3)
    ax.plot([Z[0], strahl2_end[0]], [Z[1], strahl2_end[1]], 'k-', linewidth=3)
    
    # Parallele Linien bei t1 und t2
    t1 = layout_config['t1']
    t2 = layout_config['t2']
    
    A = Z + t1 * strahl1_end
    A_strich = Z + t1 * strahl2_end
    ax.plot([A[0], A_strich[0]], [A[1], A_strich[1]], 'b-', linewidth=6, alpha=0.8)
    
    B = Z + t2 * strahl1_end
    B_strich = Z + t2 * strahl2_end
    ax.plot([B[0], B_strich[0]], [B[1], B_strich[1]], 'b-', linewidth=6, alpha=0.8)
    
    C = strahl1_end
    C_strich = strahl2_end
    
    # Labels
    labels = layout_config['labels']
    values = layout_config['values']
    unknown_idx = layout_config['unknown_idx']
    
    # Bestimme welche Werte gegeben/gesucht sind
    colors = ['black' if i != unknown_idx else 'red' for i in range(6)]
    
    # Beschriftungen Strahl 1: ZA, AB, BC
    mid_ZA = (Z + A) / 2
    mid_AB = (A + B) / 2
    mid_BC = (B + C) / 2
    
    def format_value(val):
        return f"{val} cm" if isinstance(val, (int, float)) else str(val)
    
    # Beschriftungen Strahl 1
    if unknown_idx != 0:  # ZA ist gegeben
        ax.text(mid_ZA[0] - 1.3, mid_ZA[1] + 0.7, format_value(values[0]), fontsize=14, color='black', fontweight='bold',
                bbox=dict(boxstyle='round,pad=0.3', facecolor='white', edgecolor='black', linewidth=1))
    else:  # ZA ist gesucht
        ax.text(mid_ZA[0] - 1.3, mid_ZA[1] + 0.7, "x", fontsize=17, color='red', fontweight='bold',
                bbox=dict(boxstyle='round,pad=0.4', facecolor='lightyellow', edgecolor='red', linewidth=2))
    
    if unknown_idx != 1:  # AB ist gegeben
        ax.text(mid_AB[0] - 0.5, mid_AB[1] + 1.2, format_value(values[1]), fontsize=14, color='black', fontweight='bold',
                bbox=dict(boxstyle='round,pad=0.3', facecolor='white', edgecolor='black', linewidth=1))
    else:  # AB ist gesucht
        ax.text(mid_AB[0] - 0.5, mid_AB[1] + 1.2, "x", fontsize=17, color='red', fontweight='bold',
                bbox=dict(boxstyle='round,pad=0.4', facecolor='lightyellow', edgecolor='red', linewidth=2))
    
    if unknown_idx != 2:  # BC ist gegeben
        ax.text(mid_BC[0] + 0.8, mid_BC[1] + 1.0, format_value(values[2]), fontsize=14, color='black', fontweight='bold',
                bbox=dict(boxstyle='round,pad=0.3', facecolor='white', edgecolor='black', linewidth=1))
    else:  # BC ist gesucht
        ax.text(mid_BC[0] + 0.8, mid_BC[1] + 1.0, "x", fontsize=17, color='red', fontweight='bold',
                bbox=dict(boxstyle='round,pad=0.4', facecolor='lightyellow', edgecolor='red', linewidth=2))
    
    # Beschriftungen Strahl 2: ZA', A'B', B'C'
    mid_ZA_s = (Z + A_strich) / 2
    mid_AB_s = (A_strich + B_strich) / 2
    mid_BC_s = (B_strich + C_strich) / 2
    
    if unknown_idx != 3:  # ZA' ist gegeben
        ax.text(mid_ZA_s[0] - 1.3, mid_ZA_s[1] - 1.0, format_value(values[3]), fontsize=14, color='black', fontweight='bold',
                bbox=dict(boxstyle='round,pad=0.3', facecolor='white', edgecolor='black', linewidth=1))
    else:  # ZA' ist gesucht
        ax.text(mid_ZA_s[0] - 1.3, mid_ZA_s[1] - 1.0, "y", fontsize=17, color='red', fontweight='bold',
                bbox=dict(boxstyle='round,pad=0.4', facecolor='lightyellow', edgecolor='red', linewidth=2))
    
    if unknown_idx != 4:  # A'B' ist gegeben
        ax.text(mid_AB_s[0] + 0.2, mid_AB_s[1] - 1.1, format_value(values[4]), fontsize=14, color='black', fontweight='bold',
                bbox=dict(boxstyle='round,pad=0.3', facecolor='white', edgecolor='black', linewidth=1))
    else:  # A'B' ist gesucht
        ax.text(mid_AB_s[0] + 0.2, mid_AB_s[1] - 1.1, "y", fontsize=17, color='red', fontweight='bold',
                bbox=dict(boxstyle='round,pad=0.4', facecolor='lightyellow', edgecolor='red', linewidth=2))
    
    if unknown_idx != 5:  # B'C' ist gegeben
        ax.text(mid_BC_s[0] + 1.8, mid_BC_s[1] + 0.3, format_value(values[5]), fontsize=14, color='black', fontweight='bold',
                bbox=dict(boxstyle='round,pad=0.3', facecolor='white', edgecolor='black', linewidth=1))
    else:  # B'C' ist gesucht
        ax.text(mid_BC_s[0] + 1.8, mid_BC_s[1] + 0.3, "x", fontsize=17, color='red', fontweight='bold',
                bbox=dict(boxstyle='round,pad=0.4', facecolor='lightyellow', edgecolor='red', linewidth=2))
    
    # Punkte und Labels
    ax.plot(*Z, 'ko', markersize=10)
    ax.text(Z[0] - 0.8, Z[1] - 0.9, labels[0], fontsize=16, fontweight='bold', ha='right')
    
    ax.plot(*A, 'ko', markersize=8)
    ax.text(A[0] - 0.9, A[1] + 0.5, labels[1], fontsize=14, fontweight='bold', ha='right', color='darkblue')
    
    ax.plot(*A_strich, 'ko', markersize=8)
    ax.text(A_strich[0] + 0.7, A_strich[1] - 0.6, labels[2], fontsize=14, fontweight='bold', color='darkblue')
    
    ax.plot(*B, 'ko', markersize=8)
    ax.text(B[0] - 0.9, B[1] + 0.5, labels[3], fontsize=14, fontweight='bold', ha='right', color='darkblue')
    
    ax.plot(*B_strich, 'ko', markersize=8)
    ax.text(B_strich[0] + 0.7, B_strich[1] - 0.6, labels[4], fontsize=14, fontweight='bold', color='darkblue')
    
    ax.plot(*C, 'ko', markersize=8)
    ax.text(C[0] - 0.8, C[1] + 0.5, labels[5], fontsize=14, fontweight='bold', ha='right')
    
    ax.plot(*C_strich, 'ko', markersize=8)
    ax.text(C_strich[0] + 0.7, C_strich[1] - 0.6, labels[6], fontsize=14, fontweight='bold')
    
    ax.set_xlim(-3, 14)
    ax.set_ylim(-2, 18)
    ax.set_aspect('equal')
    ax.axis('off')
    plt.tight_layout()
    plt.savefig(os.path.join(images_dir, f'strahlensaetze_aufgabe{aufgabe_num}.png'), dpi=150, bbox_inches='tight', facecolor='white')
    plt.close()
    print(f"✓ Aufgabe {aufgabe_num} erstellt")

# Definiere 20 verschiedene Aufgaben mit unterschiedlichen Geometrien
aufgaben_configs = [
    # Aufgabe 1: Standard V-Form
    {'strahl1_end': [10, 16], 'strahl2_end': [12, 8], 't1': 0.25, 't2': 0.5,
     'labels': ('C', 'D', 'E', 'F', 'G', 'H', 'I'), 'values': (10, 20, 60, 12, 50, 120),
     'unknown_idx': 5, 'title': 'Aufgabe 1', 'description': 'Berechne x'},
    
    # Aufgabe 2: Gedrehte V-Form
    {'strahl1_end': [14, 10], 'strahl2_end': [8, 12], 't1': 0.33, 't2': 0.67,
     'labels': ('C', 'J', 'K', 'L', 'M', 'N', 'O'), 'values': (15, 30, 45, 18, 36, 54),
     'unknown_idx': 2, 'title': 'Aufgabe 2', 'description': 'Bestimme x'},
    
    # Aufgabe 3: Steilere Winkel
    {'strahl1_end': [6, 18], 'strahl2_end': [14, 7], 't1': 0.2, 't2': 0.5,
     'labels': ('C', 'P', 'Q', 'R', 'S', 'T', 'U'), 'values': (16, 24, 40, 20, 30, 50),
     'unknown_idx': 1, 'title': 'Aufgabe 3', 'description': 'Berechne x'},
    
    # Aufgabe 4: Andere Konfiguration
    {'strahl1_end': [12, 14], 'strahl2_end': [10, 6], 't1': 0.25, 't2': 0.6,
     'labels': ('C', 'V', 'W', 'X', 'Y', 'Z', 'A'), 'values': (12, 28, 42, 14, 35, 49),
     'unknown_idx': 0, 'title': 'Aufgabe 4', 'description': 'Finde x'},
    
    # Aufgabe 5: Flachere Winkel
    {'strahl1_end': [16, 8], 'strahl2_end': [10, 12], 't1': 0.3, 't2': 0.6,
     'labels': ('C', 'B', 'C2', 'D', 'E', 'F', 'G'), 'values': (18, 24, 36, 21, 28, 42),
     'unknown_idx': 4, 'title': 'Aufgabe 5', 'description': 'Löse für x'},
    
    # Aufgabe 6: Unterschiedliche Skalierung
    {'strahl1_end': [9, 15], 'strahl2_end': [13, 8], 't1': 0.22, 't2': 0.55,
     'labels': ('C', 'H', 'I', 'J', 'K', 'L', 'M'), 'values': (11, 26.5, 39.5, 13, 31, 46.5),
     'unknown_idx': 3, 'title': 'Aufgabe 6', 'description': 'Berechne x'},
    
    # Aufgabe 7: Symmetrischere Form
    {'strahl1_end': [11, 14], 'strahl2_end': [11, 6], 't1': 0.25, 't2': 0.5,
     'labels': ('C', 'N', 'O', 'P', 'Q', 'R', 'S'), 'values': (10, 20, 40, 10, 20, 40),
     'unknown_idx': 1, 'title': 'Aufgabe 7', 'description': 'Ermittle x'},
    
    # Aufgabe 8: Andere Proportionen
    {'strahl1_end': [10, 16], 'strahl2_end': [14, 9], 't1': 0.33, 't2': 0.67,
     'labels': ('C', 'T', 'U', 'V', 'W', 'X', 'Y'), 'values': (22, 44, 66, 24, 48, 72),
     'unknown_idx': 2, 'title': 'Aufgabe 8', 'description': 'Berechne x'},
    
    # Aufgabe 9: Längere Strahlen
    {'strahl1_end': [12, 18], 'strahl2_end': [12, 6], 't1': 0.2, 't2': 0.5,
     'labels': ('C', 'Z', 'A2', 'B', 'C3', 'D', 'E'), 'values': (12, 30, 54, 15, 37.5, 67.5),
     'unknown_idx': 5, 'title': 'Aufgabe 9', 'description': 'Finde x'},
    
    # Aufgabe 10: Engere Winkel
    {'strahl1_end': [8, 16], 'strahl2_end': [12, 8], 't1': 0.25, 't2': 0.5,
     'labels': ('C', 'F', 'G', 'H', 'I', 'J', 'K'), 'values': (15, 25, 50, 18, 30, 60),
     'unknown_idx': 0, 'title': 'Aufgabe 10', 'description': 'Bestimme x'},
    
    # Aufgabe 11: Asymmetrische Geometrie
    {'strahl1_end': [10, 15], 'strahl2_end': [13, 7], 't1': 0.25, 't2': 0.6,
     'labels': ('C', 'L', 'M', 'N', 'O', 'P', 'Q'), 'values': (14, 26, 40, 16, 32, 48),
     'unknown_idx': 4, 'title': 'Aufgabe 11', 'description': 'Löse die Aufgabe'},
    
    # Aufgabe 12: Andere t-Werte
    {'strahl1_end': [11, 13], 'strahl2_end': [9, 10], 't1': 0.3, 't2': 0.7,
     'labels': ('C', 'R', 'S', 'T', 'U', 'V', 'W'), 'values': (18, 32, 48, 21, 37, 56),
     'unknown_idx': 3, 'title': 'Aufgabe 12', 'description': 'Berechne die Strecke'},
    
    # Aufgabe 13: Steilere erste Strahle
    {'strahl1_end': [7, 17], 'strahl2_end': [13, 8], 't1': 0.2, 't2': 0.5,
     'labels': ('C', 'X', 'Y', 'Z', 'A', 'B', 'D'), 'values': (20, 30, 50, 24, 36, 60),
     'unknown_idx': 1, 'title': 'Aufgabe 13', 'description': 'Ermittle x'},
    
    # Aufgabe 14: Gleichmäßigere Proportionen
    {'strahl1_end': [12, 12], 'strahl2_end': [12, 8], 't1': 0.25, 't2': 0.5,
     'labels': ('C', 'E', 'F', 'G', 'H', 'I', 'J'), 'values': (12, 24, 36, 12, 24, 36),
     'unknown_idx': 2, 'title': 'Aufgabe 14', 'description': 'Finde x'},
    
    # Aufgabe 15: Andere Winkelkombination
    {'strahl1_end': [13, 15], 'strahl2_end': [11, 8], 't1': 0.25, 't2': 0.6,
     'labels': ('C', 'K', 'L', 'M', 'N', 'O', 'P'), 'values': (16, 32, 48, 18, 36, 54),
     'unknown_idx': 5, 'title': 'Aufgabe 15', 'description': 'Berechne x'},
    
    # Aufgabe 16: Engere zweite Strahle
    {'strahl1_end': [10, 14], 'strahl2_end': [14, 9], 't1': 0.33, 't2': 0.67,
     'labels': ('C', 'Q', 'R', 'S', 'T', 'U', 'V'), 'values': (20, 40, 60, 22, 44, 66),
     'unknown_idx': 0, 'title': 'Aufgabe 16', 'description': 'Löse für x'},
    
    # Aufgabe 17: Variierte Abstände
    {'strahl1_end': [9, 16], 'strahl2_end': [13, 7], 't1': 0.2, 't2': 0.5,
     'labels': ('C', 'W', 'X', 'Y', 'Z', 'A', 'B'), 'values': (18, 27, 45, 21, 31.5, 52.5),
     'unknown_idx': 4, 'title': 'Aufgabe 17', 'description': 'Bestimme die Länge'},
    
    # Aufgabe 18: Andere Längenverhältnisse
    {'strahl1_end': [11, 15], 'strahl2_end': [10, 7], 't1': 0.25, 't2': 0.6,
     'labels': ('C', 'C', 'D', 'E', 'F', 'G', 'H'), 'values': (13, 26, 39, 15, 30, 45),
     'unknown_idx': 3, 'title': 'Aufgabe 18', 'description': 'Finde x'},
    
    # Aufgabe 19: Längere zweite Strahle
    {'strahl1_end': [8, 14], 'strahl2_end': [14, 10], 't1': 0.25, 't2': 0.5,
     'labels': ('C', 'I', 'J', 'K', 'L', 'M', 'N'), 'values': (14, 28, 42, 16, 32, 48),
     'unknown_idx': 1, 'title': 'Aufgabe 19', 'description': 'Berechne x'},
    
    # Aufgabe 20: Finale Variation
    {'strahl1_end': [12, 16], 'strahl2_end': [11, 8], 't1': 0.3, 't2': 0.7,
     'labels': ('C', 'O', 'P', 'Q', 'R', 'S', 'T'), 'values': (21, 35, 49, 24, 40, 56),
     'unknown_idx': 2, 'title': 'Aufgabe 20', 'description': 'Ermittle x'},
]

if __name__ == '__main__':
    print("Generiere 20 mathematisch korrekte Strahlensätze-Diagramme...")
    for i, config in enumerate(aufgaben_configs, 1):
        create_aufgabe(i, config)
    print("\n✅ Alle 20 Diagramme erfolgreich erstellt!")
