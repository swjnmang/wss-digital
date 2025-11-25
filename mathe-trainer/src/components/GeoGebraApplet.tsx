import React, { useEffect, useRef } from 'react';

interface GeoGebraAppletProps {
  m?: number;
  t?: number;
  width?: number;
  height?: number;
  id?: string;
  showToolBar?: boolean;
  showAlgebraInput?: boolean;
  showMenuBar?: boolean;
  onAppletReady?: (api: any) => void;
  filename?: string;
  commands?: string[];
  coordSystem?: { xmin: number; xmax: number; ymin: number; ymax: number };
}

const DEPLOY_GGB_URL = 'https://www.geogebra.org/apps/deployggb.js';

declare global {
  interface Window {
    GGBApplet: any;
  }
}

const GeoGebraApplet: React.FC<GeoGebraAppletProps> = ({ 
  m, 
  t, 
  width = 480, 
  height = 360,
  id = 'ggb-element',
  showToolBar = false,
  showAlgebraInput = false,
  showMenuBar = false,
  onAppletReady,
  filename,
  commands = [],
  coordSystem
}) => {
  const appletRef = useRef<HTMLDivElement>(null);
  const ggbScriptLoaded = useRef(false);
  const appletObj = useRef<any>(null);
  const onAppletReadyRef = useRef(onAppletReady);

  useEffect(() => {
    onAppletReadyRef.current = onAppletReady;
  }, [onAppletReady]);

  // Handle commands update without full re-render if applet exists
  useEffect(() => {
    if (appletObj.current && commands.length > 0) {
      appletObj.current.reset();
      
      if (coordSystem) {
        appletObj.current.setCoordSystem(coordSystem.xmin, coordSystem.xmax, coordSystem.ymin, coordSystem.ymax);
      } else {
        appletObj.current.setCoordSystem(-5, 5, -5, 5);
      }
      
      appletObj.current.setAxesVisible(true, true);
      appletObj.current.setGridVisible(true);
      commands.forEach(cmd => appletObj.current.evalCommand(cmd));
    }
  }, [commands, coordSystem]);

  useEffect(() => {
    // Lade deployggb.js nur einmal
    if (!ggbScriptLoaded.current && !window.GGBApplet) {
      const script = document.createElement('script');
      script.src = DEPLOY_GGB_URL;
      script.async = true;
      script.onload = () => {
        ggbScriptLoaded.current = true;
        renderApplet();
      };
      document.body.appendChild(script);
    } else {
      renderApplet();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [m, t, width, height, id, showToolBar, showAlgebraInput, showMenuBar, filename]); // Removed commands from here to avoid full reload

  function renderApplet() {
    if (!window.GGBApplet || !appletRef.current) return;
    
    // Unique ID for multiple applets
    const uniqueId = id + '-' + Math.random().toString(36).substr(2, 9);
    // Create a container with this ID inside our ref
    appletRef.current.innerHTML = `<div id="${uniqueId}"></div>`;

    const params = {
      appName: 'classic',
      width,
      height,
      showToolBar,
      showAlgebraInput,
      showMenuBar,
      perspective: 'G',
      enableShiftDragZoom: true,
      showResetIcon: true,
      useBrowserForJS: true,
      ...(filename ? { filename } : {}),
      appletOnLoad: (api: any) => {
        appletObj.current = api;
        
        // Legacy support for m and t props
        if (m !== undefined && t !== undefined) {
             api.reset();
             api.setCoordSystem(-5, 5, -5, 5);
             api.setAxesVisible(true, true);
             api.setGridVisible(true);
             api.evalCommand(`f(x) = ${m}*x + ${t}`);
             api.setColor('f', 0, 0, 255);
             api.setLineThickness('f', 3);
        }

        // Execute commands
        if (commands && commands.length > 0) {
            api.reset();
            
            if (coordSystem) {
                api.setCoordSystem(coordSystem.xmin, coordSystem.xmax, coordSystem.ymin, coordSystem.ymax);
            } else {
                api.setCoordSystem(-5, 5, -5, 5);
            }

            api.setAxesVisible(true, true);
            api.setGridVisible(true);
            commands.forEach((cmd: string) => api.evalCommand(cmd));
        }

        if (onAppletReadyRef.current) {
          onAppletReadyRef.current(api);
        }
      }
    };

    const applet = new window.GGBApplet(params, true);
    applet.inject(uniqueId);
  }

  return <div ref={appletRef} className="flex justify-center" style={{ width: '100%' }}></div>;
};

export default GeoGebraApplet;
