"""
Generiert GeoGebra-Dateien für Strahlensatz-Aufgaben als HTML-Viewer
Diese können direkt im Browser angezeigt werden
"""

import os
import math

# Zielverzeichnis
output_dir = os.path.join(os.path.dirname(__file__), 'public', 'geogebra')
os.makedirs(output_dir, exist_ok=True)

def create_geogebra_html(filename_base, aufgaben_data):
    """
    Erstellt eine HTML-Seite mit GeoGebra AppletJS
    """
    
    # Zentrum Z
    Z = (2, 15)
    
    # Berechne Strahl-Endpunkte basierend auf Winkeln
    ray1_angle_rad = math.radians(aufgaben_data['ray1_angle'])
    ray2_angle_rad = math.radians(aufgaben_data['ray2_angle'])
    ray_length = aufgaben_data['ray_length']
    
    P1_x = Z[0] + ray_length * math.cos(ray1_angle_rad)
    P1_y = Z[1] + ray_length * math.sin(ray1_angle_rad)
    P2_x = Z[0] + ray_length * math.cos(ray2_angle_rad)
    P2_y = Z[1] + ray_length * math.sin(ray2_angle_rad)
    
    # Schnittpunkte der parallelen Geraden mit Strahlen
    t1 = aufgaben_data['parallel1_t']
    t2 = aufgaben_data['parallel2_t']
    
    # Parallele 1 Schnittpunkte (A und A')
    A_x = Z[0] + t1 * (P1_x - Z[0])
    A_y = Z[1] + t1 * (P1_y - Z[1])
    A_strich_x = Z[0] + t1 * (P2_x - Z[0])
    A_strich_y = Z[1] + t1 * (P2_y - Z[1])
    
    # Parallele 2 Schnittpunkte (B und B')
    B_x = Z[0] + t2 * (P1_x - Z[0])
    B_y = Z[1] + t2 * (P1_y - Z[1])
    B_strich_x = Z[0] + t2 * (P2_x - Z[0])
    B_strich_y = Z[1] + t2 * (P2_y - Z[1])
    
    # GeoGebra AppletJS Code
    html = f"""<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Strahlensatz Aufgabe</title>
    <script src="https://www.geogebra.org/apps/deployggb.js"></script>
</head>
<body style="margin: 0; padding: 0; background: white;">
    <div id="applet_container" style="width: 100%; height: 100vh; position: absolute;"></div>
    
    <script>
        const appletDiv = document.getElementById('applet_container');
        
        var parameters = {{
            "id": "ggbApplet",
            "width": Math.min(window.innerWidth - 20, 1000),
            "height": Math.min(window.innerHeight - 20, 700),
            "showToolBar": false,
            "showAlgebraInput": false,
            "showMenuBar": false,
            "showResetIcon": true,
            "enableLabelDrags": false,
            "enableRightClick": true,
            "errorDialogsActive": true,
            "useBrowserForJS": true,
            "allowStyleBar": false,
            "preventFocus": false,
            "showLogging": false,
            "clientID": "strahlensatz",
            "hostStyle": "iframe",
            "scriptingLanguage": "geogebra",
            "language": "de",
            "ggbBase64": ""
        }};
        
        var applet = new GGBApplet(parameters, true);
        applet.inject(appletDiv);
        
        // Nach dem Laden die Konstruktion aufbauen
        window.addEventListener('load', function() {{
            setTimeout(function() {{
                var api = applet.getAppletObject();
                if (api) {{
                    // Ansicht konfigurieren
                    api.setCoordSystem(-2, 18, -2, 25);
                    api.setAxesVisible(true, true);
                    api.setGridVisible(true);
                    
                    // Zentrum Z
                    api.evalCommand("Z = ({Z[0]}, {Z[1]})");
                    api.setColor("Z", 0, 0, 0);
                    api.setPointSize("Z", 6);
                    
                    // Strahleneindpunkte
                    api.evalCommand("P1 = ({P1_x:.2f}, {P1_y:.2f})");
                    api.evalCommand("P2 = ({P2_x:.2f}, {P2_y:.2f})");
                    api.setVisible("P1", false);
                    api.setVisible("P2", false);
                    
                    // Strahlen als Linien
                    api.evalCommand("Strahl1 = Line(Z, P1)");
                    api.evalCommand("Strahl2 = Line(Z, P2)");
                    api.setColor("Strahl1", 0, 0, 0);
                    api.setColor("Strahl2", 0, 0, 0);
                    api.setLineThickness("Strahl1", 2);
                    api.setLineThickness("Strahl2", 2);
                    
                    // Schnittpunkte
                    api.evalCommand("A = ({A_x:.2f}, {A_y:.2f})");
                    api.evalCommand("A' = ({A_strich_x:.2f}, {A_strich_y:.2f})");
                    api.evalCommand("B = ({B_x:.2f}, {B_y:.2f})");
                    api.evalCommand("B' = ({B_strich_x:.2f}, {B_strich_y:.2f})");
                    
                    api.setColor("A", 0, 0, 139);
                    api.setColor("A'", 0, 0, 139);
                    api.setColor("B", 0, 0, 139);
                    api.setColor("B'", 0, 0, 139);
                    api.setPointSize("A", 5);
                    api.setPointSize("A'", 5);
                    api.setPointSize("B", 5);
                    api.setPointSize("B'", 5);
                    
                    // Parallele Geraden
                    api.evalCommand("Parallele1 = Line(A, A')");
                    api.evalCommand("Parallele2 = Line(B, B')");
                    api.setColor("Parallele1", 0, 0, 255);
                    api.setColor("Parallele2", 0, 0, 255);
                    api.setLineThickness("Parallele1", 2);
                    api.setLineThickness("Parallele2", 2);
                    api.setLineStyle("Parallele1", 2); // dashed
                    api.setLineStyle("Parallele2", 2); // dashed
                    
                    // Längenlabels
                    var measurements = {aufgaben_data['measurements']};
                    
                    if (measurements['ZA']) {{
                        var mid_za_x = (Z[0] + A_x) / 2 - 1.5;
                        var mid_za_y = (Z[1] + A_y) / 2;
                        api.evalCommand("txtZA = Text(\\"{measurements['ZA']} cm\\", (" + mid_za_x + ", " + mid_za_y + "))");
                        api.setColor("txtZA", 0, 100, 0);
                    }}
                    
                    if (measurements['AB']) {{
                        var mid_ab_x = (A_x + B_x) / 2 - 1.5;
                        var mid_ab_y = (A_y + B_y) / 2 + 0.8;
                        api.evalCommand("txtAB = Text(\\"{measurements['AB']} cm\\", (" + mid_ab_x + ", " + mid_ab_y + "))");
                        api.setColor("txtAB", 0, 100, 0);
                    }}
                    
                    if (measurements['ZA_strich']) {{
                        var mid_za_s_x = (Z[0] + A_strich_x) / 2 + 1;
                        var mid_za_s_y = (Z[1] + A_strich_y) / 2;
                        api.evalCommand("txtZA_strich = Text(\\"{measurements['ZA_strich']} cm\\", (" + mid_za_s_x + ", " + mid_za_s_y + "))");
                        api.setColor("txtZA_strich", 0, 100, 0);
                    }}
                    
                    if (measurements['AB_strich']) {{
                        var mid_ab_s_x = (A_strich_x + B_strich_x) / 2 + 1;
                        var mid_ab_s_y = (A_strich_y + B_strich_y) / 2 + 0.8;
                        var txt_value = "{measurements['AB_strich']}";
                        var is_var = txt_value === "x" || txt_value === "y";
                        api.evalCommand("txtAB_strich = Text(\\"" + txt_value + " cm\\", (" + mid_ab_s_x + ", " + mid_ab_s_y + "))");
                        api.setColor("txtAB_strich", is_var ? 255 : 0, is_var ? 0 : 100, is_var ? 0 : 0);
                    }}
                }}
            }}, 500);
        }});
    </script>
</body>
</html>
"""
    
    return html

# Definiere 6 verschiedene Aufgaben
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

# Generiere alle Dateien
print("Generiere GeoGebra HTML-Dateien...")
for aufgabe in aufgaben:
    html_content = create_geogebra_html(aufgabe['name'], aufgabe)
    file_path = os.path.join(output_dir, f"{aufgabe['name']}.html")
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(html_content)
    
    print(f"✓ {aufgabe['name']}.html erstellt")

print(f"\n✅ Alle {len(aufgaben)} GeoGebra HTML-Dateien erfolgreich erstellt!")
print(f"Speicherort: {output_dir}")

