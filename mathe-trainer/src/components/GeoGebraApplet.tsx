import React, { useEffect, useRef } from 'react';

interface GeoGebraAppletProps {
  // Für Online-Material IDs (GeoGebra Cloud)
  materialId?: string;
  
  // Für lokale .ggb-Dateien
  filename?: string;
  
  width?: number;
  height?: number;
  borderColor?: string;
  showMenuBar?: boolean;
  showToolBar?: boolean;
  showToolBarHelp?: boolean;
  showResetIcon?: boolean;
  enableRightClick?: boolean;
  language?: string;
  
  // Für dynamische API-basierte Erstellung
  onAppletReady?: (api: any) => void;
}

const DEPLOY_GGB_URL = 'https://www.geogebra.org/apps/deployggb.js';

declare global {
  interface Window {
    GGBApplet: any;
  }
}

export default function GeoGebraApplet({
  materialId,
  filename,
  width = 800,
  height = 600,
  borderColor = "888888",
  showMenuBar = true,
  showToolBar = true,
  showToolBarHelp = false,
  showResetIcon = true,
  enableRightClick = true,
  language = "de",
  onAppletReady,
}: GeoGebraAppletProps) {
  const appletRef = useRef<HTMLDivElement>(null);
  const ggbScriptLoaded = useRef(false);
  const appletObj = useRef<any>(null);

  // Fallback: Nutze GeoGebra Online-Embed über iframe
  if (materialId && !filename) {
    const url = `https://www.geogebra.org/material/iframe/id/${materialId}/width/${width}/height/${height}/border/${borderColor}/smb/${showMenuBar}/stb/${showToolBar}/stbh/${showToolBarHelp}/sri/${showResetIcon}/rc/${enableRightClick}/lang/${language}`;

    return (
      <div style={{ width: "100%", display: "flex", justifyContent: "center" }}>
        <iframe
          title={`GeoGebra ${materialId}`}
          src={url}
          width={width}
          height={height}
          style={{ border: `1px solid #${borderColor}`, borderRadius: 8 }}
          allow="fullscreen"
        />
      </div>
    );
  }

  // Für lokale .ggb-Dateien mit GeoGebra API
  useEffect(() => {
    if (!filename || !appletRef.current) return;

    // Lade GeoGebra deployggb.js Script wenn noch nicht geladen
    if (!ggbScriptLoaded.current && !window.GGBApplet) {
      const script = document.createElement('script');
      script.src = DEPLOY_GGB_URL;
      script.async = true;
      script.onload = () => {
        ggbScriptLoaded.current = true;
        initializeApplet();
      };
      document.body.appendChild(script);
    } else if (window.GGBApplet && ggbScriptLoaded.current) {
      initializeApplet();
    }

    const initializeApplet = () => {
      if (!appletRef.current) return;

      const parameters = {
        filename: `/geogebra/${filename}`,
        width,
        height,
        showMenuBar,
        showToolBar,
        showToolBarHelp,
        showResetIcon,
        enableRightClick,
        language,
        showAlgebraInput: false,
        showSpreadsheet: false,
        showCAS: false,
        border: 2,
        borderColor: borderColor,
        rounding: "10 places",
      };

      appletRef.current!.innerHTML = '';
      appletObj.current = new window.GGBApplet(parameters, '5.0');
      appletObj.current.setHTML5Codebase('/geogebra/', true);
      appletObj.current.inject(appletRef.current!.id);

      // Callback wenn verfügbar
      if (onAppletReady) {
        setTimeout(() => {
          if (appletObj.current && appletObj.current.getAppletObject) {
            try {
              const api = appletObj.current.getAppletObject();
              onAppletReady(api);
            } catch (e) {
              console.warn('GeoGebra API nicht verfügbar:', e);
            }
          }
        }, 1000);
      }
    };
  }, [filename, width, height, showMenuBar, showToolBar, showToolBarHelp, showResetIcon, enableRightClick, language, borderColor, onAppletReady]);

  // Für .ggb-Dateien mit GeoGebra API
  if (filename) {
    return (
      <div style={{ width: "100%", display: "flex", justifyContent: "center" }}>
        <div
          ref={appletRef}
          id={`ggb-applet-${filename}`}
          style={{
            border: `2px solid #${borderColor}`,
            borderRadius: 8,
            overflow: 'hidden',
          }}
        />
      </div>
    );
  }

  // Fallback wenn keine Props gegeben
  return (
    <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
      Keine GeoGebra-Material angegeben (materialId oder filename erforderlich)
    </div>
  );
}
