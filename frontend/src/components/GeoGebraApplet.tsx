import React, { useEffect, useRef } from 'react';

interface GeoGebraAppletProps {
  m: number;
  t: number;
  width?: number;
  height?: number;
}

const DEPLOY_GGB_URL = 'https://www.geogebra.org/apps/deployggb.js';

const GeoGebraApplet: React.FC<GeoGebraAppletProps> = ({ m, t, width = 480, height = 360 }) => {
  const appletRef = useRef<HTMLDivElement>(null);
  const ggbScriptLoaded = useRef(false);
  const appletObj = useRef<any>(null);

  useEffect(() => {
    // Lade deployggb.js nur einmal
    if (!ggbScriptLoaded.current) {
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
  }, [m, t]);

  function renderApplet() {
    if (!window.GGBApplet || !appletRef.current) return;
    // Entferne evtl. alten Inhalt
    appletRef.current.innerHTML = '';
    const params = {
      appName: 'classic',
      width,
      height,
      showToolBar: false,
      showAlgebraInput: false,
      showMenuBar: false,
      perspective: 'G',
      enableShiftDragZoom: true,
      showResetIcon: false,
      useBrowserForJS: true,
      appletOnLoad: (api: any) => {
        appletObj.current = api;
        api.evalCommand(`f(x) = ${m}*x + ${t}`);
        // Panels ausblenden
        try {
          api.setPerspective('G');
          api.setAlgebraVisible(false);
          api.setToolBarVisible(false);
          api.setMenuBarVisible(false);
          api.setInputBarVisible(false);
          api.showResetIcon(false);
        } catch (e) {}
      },
    };
    // @ts-ignore
    const applet = new window.GGBApplet(params, true);
    applet.inject(appletRef.current);
  }

  return <div ref={appletRef} style={{ width, height, margin: '0 auto' }} />;
};

export default GeoGebraApplet;
