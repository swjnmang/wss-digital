"""
Generiert simple HTML-Seiten mit SVG-basierter Strahlensatz-Visualisierung
Dies sind einfache, wartbare Grafiken ohne externe GeoGebra-Abhängigkeiten
"""

import os
import math

output_dir = os.path.join(os.path.dirname(__file__), 'public', 'geogebra')
os.makedirs(output_dir, exist_ok=True)

def create_strahlensatz_svg(aufgabe_data):
    """Erstellt eine SVG-Visualisierung eines Strahlensatzes"""
    
    # Basis-Koordinaten
    Z = (100, 300)  # Zentrum oben-mitte
    
    # Strahlen berechnen
    ray1_angle = math.radians(aufgabe_data['ray1_angle'])
    ray2_angle = math.radians(aufgabe_data['ray2_angle'])
    ray_length = aufgabe_data['ray_length'] * 15  # Skalierung für SVG
    
    # Strahlen-Endpunkte
    P1_x = Z[0] + ray_length * math.cos(ray1_angle)
    P1_y = Z[1] + ray_length * math.sin(ray1_angle)
    P2_x = Z[0] + ray_length * math.cos(ray2_angle)
    P2_y = Z[1] + ray_length * math.sin(ray2_angle)
    
    # Parallele Gerade Schnittpunkte
    t1 = aufgabe_data['parallel1_t']
    t2 = aufgabe_data['parallel2_t']
    
    A_x = Z[0] + t1 * (P1_x - Z[0])
    A_y = Z[1] + t1 * (P1_y - Z[1])
    A_strich_x = Z[0] + t1 * (P2_x - Z[0])
    A_strich_y = Z[1] + t1 * (P2_y - Z[1])
    
    B_x = Z[0] + t2 * (P1_x - Z[0])
    B_y = Z[1] + t2 * (P1_y - Z[1])
    B_strich_x = Z[0] + t2 * (P2_x - Z[0])
    B_strich_y = Z[1] + t2 * (P2_y - Z[1])
    
    m = aufgabe_data['measurements']
    
    svg = f"""<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Strahlensatz Aufgabe</title>
    <style>
        body {{
            margin: 0;
            padding: 20px;
            background: white;
            font-family: Arial, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
        }}
        svg {{
            border: 2px solid #cccccc;
            border-radius: 8px;
            max-width: 100%;
            height: auto;
        }}
    </style>
</head>
<body>
    <svg width="600" height="600" viewBox="0 0 600 600" xmlns="http://www.w3.org/2000/svg">
        <!-- Hintergrund -->
        <rect width="600" height="600" fill="white"/>
        
        <!-- Gitternetz -->
        <defs>
            <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
                <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#f0f0f0" stroke-width="1"/>
            </pattern>
        </defs>
        <rect width="600" height="600" fill="url(#grid)" />
        
        <!-- Strahlen -->
        <line x1="{Z[0]}" y1="{Z[1]}" x2="{P1_x}" y2="{P1_y}" stroke="black" stroke-width="2"/>
        <line x1="{Z[0]}" y1="{Z[1]}" x2="{P2_x}" y2="{P2_y}" stroke="black" stroke-width="2"/>
        
        <!-- Parallele Geraden (gestrichelt) -->
        <line x1="{A_x}" y1="{A_y}" x2="{A_strich_x}" y2="{A_strich_y}" 
              stroke="blue" stroke-width="2" stroke-dasharray="5,5"/>
        <line x1="{B_x}" y1="{B_y}" x2="{B_strich_x}" y2="{B_strich_y}" 
              stroke="blue" stroke-width="2" stroke-dasharray="5,5"/>
        
        <!-- Punkte -->
        <circle cx="{Z[0]}" cy="{Z[1]}" r="5" fill="black"/>
        <circle cx="{A_x}" cy="{A_y}" r="5" fill="darkblue"/>
        <circle cx="{A_strich_x}" cy="{A_strich_y}" r="5" fill="darkblue"/>
        <circle cx="{B_x}" cy="{B_y}" r="5" fill="darkblue"/>
        <circle cx="{B_strich_x}" cy="{B_strich_y}" r="5" fill="darkblue"/>
        
        <!-- Punkt-Labels -->
        <text x="{Z[0]-20}" y="{Z[1]-15}" font-size="16" font-weight="bold">Z</text>
        <text x="{A_x-20}" y="{A_y-15}" font-size="16" font-weight="bold" fill="darkblue">A</text>
        <text x="{A_strich_x+10}" y="{A_strich_y-15}" font-size="16" font-weight="bold" fill="darkblue">A'</text>
        <text x="{B_x-20}" y="{B_y+25}" font-size="16" font-weight="bold" fill="darkblue">B</text>
        <text x="{B_strich_x+10}" y="{B_strich_y+25}" font-size="16" font-weight="bold" fill="darkblue">B'</text>
        
        <!-- Längenlabels -->
        <text x="{(Z[0]+A_x)/2-40}" y="{(Z[1]+A_y)/2-5}" font-size="13" fill="green">ZA: {m['ZA']} cm</text>
        <text x="{(A_x+B_x)/2-40}" y="{(A_y+B_y)/2+20}" font-size="13" fill="green">AB: {m['AB']} cm</text>
        <text x="{(Z[0]+A_strich_x)/2+20}" y="{(Z[1]+A_strich_y)/2-5}" font-size="13" fill="green">ZA': {m['ZA_strich']} cm</text>
        <text x="{(A_strich_x+B_strich_x)/2+20}" y="{(A_strich_y+B_strich_y)/2+20}" font-size="13" fill="red">
            A'B': {m['AB_strich']} cm
        </text>
    </svg>
</body>
</html>
"""
    return svg

# Aufgaben definieren
aufgaben = [
    {
        'name': 'aufgabe1',
        'ray1_angle': 60,
        'ray2_angle': 25,
        'ray_length': 15,
        'parallel1_t': 0.35,
        'parallel2_t': 0.70,
        'measurements': {'ZA': 15, 'AB': 20, 'ZA_strich': 12, 'AB_strich': 'x'}
    },
    {
        'name': 'aufgabe2',
        'ray1_angle': 55,
        'ray2_angle': 30,
        'ray_length': 15,
        'parallel1_t': 0.33,
        'parallel2_t': 0.67,
        'measurements': {'ZA': 18, 'AB': 24, 'ZA_strich': 'y', 'AB_strich': 32}
    },
    {
        'name': 'aufgabe3',
        'ray1_angle': 65,
        'ray2_angle': 20,
        'ray_length': 15,
        'parallel1_t': 0.30,
        'parallel2_t': 0.65,
        'measurements': {'ZA': 12, 'AB': 28, 'ZA_strich': 10, 'AB_strich': 'x'}
    },
    {
        'name': 'aufgabe4',
        'ray1_angle': 50,
        'ray2_angle': 35,
        'ray_length': 15,
        'parallel1_t': 0.40,
        'parallel2_t': 0.75,
        'measurements': {'ZA': 20, 'AB': 25, 'ZA_strich': 16, 'AB_strich': 'x'}
    },
    {
        'name': 'aufgabe5',
        'ray1_angle': 58,
        'ray2_angle': 28,
        'ray_length': 15,
        'parallel1_t': 0.25,
        'parallel2_t': 0.60,
        'measurements': {'ZA': 10, 'AB': 30, 'ZA_strich': 'y', 'AB_strich': 36}
    },
    {
        'name': 'aufgabe6',
        'ray1_angle': 62,
        'ray2_angle': 22,
        'ray_length': 15,
        'parallel1_t': 0.35,
        'parallel2_t': 0.70,
        'measurements': {'ZA': 21, 'AB': 21, 'ZA_strich': 'y', 'AB_strich': 'x'}
    }
]

print("Generiere Strahlensatz SVG-Visualisierungen...")
for aufgabe in aufgaben:
    svg_content = create_strahlensatz_svg(aufgabe)
    file_path = os.path.join(output_dir, f"{aufgabe['name']}.html")
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(svg_content)
    
    print(f"✓ {aufgabe['name']}.html erstellt")

print(f"\n✅ Alle {len(aufgaben)} Visualisierungen erfolgreich erstellt!")
print(f"Speicherort: {output_dir}")
