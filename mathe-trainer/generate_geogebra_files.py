"""
Generiert GeoGebra-Dateien für Strahlensatz-Aufgaben
Speichert diese als .ggb-Dateien (gezippte XML)
"""

import xml.etree.ElementTree as ET
import zipfile
import os
import math
from io import BytesIO

# Zielverzeichnis
output_dir = os.path.join(os.path.dirname(__file__), 'public', 'geogebra')
os.makedirs(output_dir, exist_ok=True)

def create_geogebra_xml(title, aufgaben_data):
    """
    Erstellt eine GeoGebra-XML-Struktur für eine Strahlensatz-Aufgabe
    
    aufgaben_data: dict mit:
    - ray1_angle: Winkel von Strahl 1 in Grad
    - ray2_angle: Winkel von Strahl 2 in Grad
    - ray_length: Länge der Strahlen
    - parallel1_t: Parameter t für erste parallele Gerade (0-1)
    - parallel2_t: Parameter t für zweite parallele Gerade (0-1)
    - measurements: dict mit ZA, AB, ZA', A'B' Längen
    """
    
    # Basis-XML-Struktur
    root = ET.Element('geogebra')
    root.set('format', '5.0')
    root.set('version', '5.0')
    
    # Euclidian View (Zeichenfläche)
    euclidian = ET.SubElement(root, 'euclidianView')
    euclidian.set('min', '-5 -5')
    euclidian.set('max', '25 25')
    euclidian.set('scale', '1')
    
    # Construction (Konstruktionsobjekte)
    construction = ET.SubElement(root, 'construction')
    construction.set('title', title)
    
    # Hilfsfunktion zum Erstellen von Objekten
    def add_point(name, x, y, label_visible=True, color='0 0 0', size=5):
        obj = ET.SubElement(construction, 'element')
        obj.set('type', 'point')
        obj.set('label', name)
        
        coords = ET.SubElement(obj, 'coords')
        coords.set('x', str(x))
        coords.set('y', str(y))
        coords.set('z', '1')
        
        if label_visible:
            show = ET.SubElement(obj, 'show')
            show.set('label', 'true')
        
        return obj
    
    def add_line(name, point1, point2, color='0 0 255', thickness=2, dashed=False):
        obj = ET.SubElement(construction, 'element')
        obj.set('type', 'line')
        obj.set('label', name)
        obj.set('color', color)
        
        through = ET.SubElement(obj, 'through')
        through.set('point1', point1)
        through.set('point2', point2)
        
        if dashed:
            style = ET.SubElement(obj, 'style')
            style.set('type', 'dashed')
        
        return obj
    
    def add_segment(name, point1, point2, color='0 0 0', thickness=3):
        obj = ET.SubElement(construction, 'element')
        obj.set('type', 'segment')
        obj.set('label', name)
        obj.set('color', color)
        
        segment = ET.SubElement(obj, 'segment')
        segment.set('start', point1)
        segment.set('end', point2)
        
        return obj
    
    def add_text(name, x, y, text, color='0 0 0', fontsize=16):
        obj = ET.SubElement(construction, 'element')
        obj.set('type', 'text')
        obj.set('label', name)
        
        coords = ET.SubElement(obj, 'coords')
        coords.set('x', str(x))
        coords.set('y', str(y))
        coords.set('z', '1')
        
        content = ET.SubElement(obj, 'content')
        content.text = text
        
        return obj
    
    # Zentrum Z
    Z = (2, 15)
    add_point('Z', Z[0], Z[1], label_visible=True, color='0 0 0')
    
    # Berechne Strahl-Endpunkte basierend auf Winkeln
    ray1_angle_rad = math.radians(aufgaben_data['ray1_angle'])
    ray2_angle_rad = math.radians(aufgaben_data['ray2_angle'])
    ray_length = aufgaben_data['ray_length']
    
    P1 = (Z[0] + ray_length * math.cos(ray1_angle_rad), 
          Z[1] + ray_length * math.sin(ray1_angle_rad))
    P2 = (Z[0] + ray_length * math.cos(ray2_angle_rad), 
          Z[1] + ray_length * math.sin(ray2_angle_rad))
    
    add_point('P1', P1[0], P1[1], label_visible=False)
    add_point('P2', P2[0], P2[1], label_visible=False)
    
    # Strahlen
    add_line('Strahl1', 'Z', 'P1', color='0 0 0', thickness=2)
    add_line('Strahl2', 'Z', 'P2', color='0 0 0', thickness=2)
    
    # Schnittpunkte der parallelen Geraden mit Strahlen
    t1 = aufgaben_data['parallel1_t']
    t2 = aufgaben_data['parallel2_t']
    
    # Parallele 1 Schnittpunkte
    A = (Z[0] + t1 * (P1[0] - Z[0]), Z[1] + t1 * (P1[1] - Z[1]))
    A_strich = (Z[0] + t1 * (P2[0] - Z[0]), Z[1] + t1 * (P2[1] - Z[1]))
    
    # Parallele 2 Schnittpunkte
    B = (Z[0] + t2 * (P1[0] - Z[0]), Z[1] + t2 * (P1[1] - Z[1]))
    B_strich = (Z[0] + t2 * (P2[0] - Z[0]), Z[1] + t2 * (P2[1] - Z[1]))
    
    # Schnittpunkte hinzufügen
    add_point('A', A[0], A[1], label_visible=True, color='0 0 139')
    add_point('A\'', A_strich[0], A_strich[1], label_visible=True, color='0 0 139')
    add_point('B', B[0], B[1], label_visible=True, color='0 0 139')
    add_point('B\'', B_strich[0], B_strich[1], label_visible=True, color='0 0 139')
    
    # Parallele Geraden
    add_line('Parallele1', 'A', 'A\'', color='0 0 255', thickness=2, dashed=True)
    add_line('Parallele2', 'B', 'B\'', color='0 0 255', thickness=2, dashed=True)
    
    # Streckenlängen als Text-Labels
    measurements = aufgaben_data['measurements']
    
    # ZA
    if 'ZA' in measurements:
        mid_za = ((Z[0] + A[0]) / 2, (Z[1] + A[1]) / 2)
        add_text('txtZA', mid_za[0] - 1.5, mid_za[1], f"{measurements['ZA']} cm", color='0 100 0', fontsize=14)
    
    # AB
    if 'AB' in measurements:
        mid_ab = ((A[0] + B[0]) / 2, (A[1] + B[1]) / 2)
        add_text('txtAB', mid_ab[0] - 1.5, mid_ab[1] + 0.8, f"{measurements['AB']} cm", color='0 100 0', fontsize=14)
    
    # ZA'
    if 'ZA_strich' in measurements:
        mid_za_s = ((Z[0] + A_strich[0]) / 2, (Z[1] + A_strich[1]) / 2)
        add_text('txtZA_strich', mid_za_s[0] + 1, mid_za_s[1], f"{measurements['ZA_strich']} cm", color='0 100 0', fontsize=14)
    
    # A'B'
    if 'AB_strich' in measurements:
        mid_ab_s = ((A_strich[0] + B_strich[0]) / 2, (A_strich[1] + B_strich[1]) / 2)
        txt = "x" if measurements['AB_strich'] == 'x' else f"{measurements['AB_strich']} cm"
        color = '255 0 0' if measurements['AB_strich'] == 'x' else '0 100 0'
        add_text('txtAB_strich', mid_ab_s[0] + 1, mid_ab_s[1] + 0.8, txt, color=color, fontsize=14)
    
    return root

def create_ggb_file(filename, xml_root):
    """Speichert XML als .ggb-Datei (gezippte XML)"""
    xml_str = ET.tostring(xml_root, encoding='unicode')
    
    # GeoGebra-Dateien sind ZIP-Archive mit geogebra.xml
    with zipfile.ZipFile(filename, 'w', zipfile.ZIP_DEFLATED) as zf:
        zf.writestr('geogebra.xml', xml_str)

# Definiere 6 verschiedene Aufgaben
aufgaben = [
    {
        'name': 'aufgabe1',
        'title': 'Strahlensätze Aufgabe 1',
        'ray1_angle': 60,
        'ray2_angle': 25,
        'ray_length': 15,
        'parallel1_t': 0.35,
        'parallel2_t': 0.70,
        'measurements': {'ZA': 15, 'AB': 20, 'ZA_strich': 12, 'AB_strich': 'x'}
    },
    {
        'name': 'aufgabe2',
        'title': 'Strahlensätze Aufgabe 2',
        'ray1_angle': 55,
        'ray2_angle': 30,
        'ray_length': 15,
        'parallel1_t': 0.33,
        'parallel2_t': 0.67,
        'measurements': {'ZA': 18, 'AB': 24, 'ZA_strich': 'y', 'AB_strich': 32}
    },
    {
        'name': 'aufgabe3',
        'title': 'Strahlensätze Aufgabe 3',
        'ray1_angle': 65,
        'ray2_angle': 20,
        'ray_length': 15,
        'parallel1_t': 0.30,
        'parallel2_t': 0.65,
        'measurements': {'ZA': 12, 'AB': 28, 'ZA_strich': 10, 'AB_strich': 'x'}
    },
    {
        'name': 'aufgabe4',
        'title': 'Strahlensätze Aufgabe 4',
        'ray1_angle': 50,
        'ray2_angle': 35,
        'ray_length': 15,
        'parallel1_t': 0.40,
        'parallel2_t': 0.75,
        'measurements': {'ZA': 20, 'AB': 25, 'ZA_strich': 16, 'AB_strich': 'x'}
    },
    {
        'name': 'aufgabe5',
        'title': 'Strahlensätze Aufgabe 5',
        'ray1_angle': 58,
        'ray2_angle': 28,
        'ray_length': 15,
        'parallel1_t': 0.25,
        'parallel2_t': 0.60,
        'measurements': {'ZA': 10, 'AB': 30, 'ZA_strich': 'y', 'AB_strich': 36}
    },
    {
        'name': 'aufgabe6',
        'title': 'Strahlensätze Aufgabe 6',
        'ray1_angle': 62,
        'ray2_angle': 22,
        'ray_length': 15,
        'parallel1_t': 0.35,
        'parallel2_t': 0.70,
        'measurements': {'ZA': 21, 'AB': 21, 'ZA_strich': 'y', 'AB_strich': 'x'}
    }
]

# Generiere alle Dateien
print("Generiere GeoGebra-Dateien...")
for aufgabe in aufgaben:
    xml_root = create_geogebra_xml(aufgabe['title'], aufgabe)
    file_path = os.path.join(output_dir, f"{aufgabe['name']}.ggb")
    create_ggb_file(file_path, xml_root)
    print(f"✓ {aufgabe['name']}.ggb erstellt")

print(f"\n✅ Alle {len(aufgaben)} GeoGebra-Dateien erfolgreich erstellt!")
print(f"Speicherort: {output_dir}")
