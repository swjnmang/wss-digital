import React, { useEffect, useRef, useState, useMemo } from 'react';

declare global {
  interface Window {
    GGBApplet: any;
  }
}

interface CoordSystem {
  xmin?: number;
  xmax?: number;
  ymin?: number;
  ymax?: number;
}

interface GeoGebraAppletProps {
  id?: string;
  filename?: string;
  width?: number;
  height?: number;
  borderColor?: string;
  showToolBar?: boolean;
  showAlgebraInput?: boolean;
  showMenuBar?: boolean;
  onAppletReady?: (api: any) => void;
  commands?: string[];
  coordSystem?: CoordSystem;
}

export default function GeoGebraApplet({
  id: providedId,
  filename,
  width = 800,
  height = 600,
  borderColor = "cccccc",
  showToolBar = false,
  showAlgebraInput = false,
  showMenuBar = false,
  onAppletReady,
  commands = [],
  coordSystem,
}: GeoGebraAppletProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const appletRef = useRef<any>(null);
  
  // Generate ID once and keep it stable
  const id = useMemo(() => providedId || `ggb-${Math.random().toString(36).substr(2, 9)}`, [providedId]);
  
  const [loading, setLoading] = useState(!filename || filename === '' ? true : false);

  // If filename is provided and not empty, use iframe-based approach
  if (filename && filename !== '') {
    return (
      <div style={{ width: "100%", display: "flex", justifyContent: "center", marginBottom: "20px" }}>
        <iframe
          src={`/geogebra/${filename}.html`}
          width={width}
          height={height}
          style={{
            border: `2px solid #${borderColor}`,
            borderRadius: 8,
            backgroundColor: "white"
          }}
          title={`GeoGebra ${filename}`}
        />
      </div>
    );
  }

  // If onAppletReady is provided or filename is empty, initialize GeoGebra with direct API
  useEffect(() => {
    if (!onAppletReady && !commands.length && !coordSystem) {
      // No API integration requested, and no filename provided - just show nothing
      setLoading(false);
      return;
    }

    const initialize = () => {
      if (!window.GGBApplet) {
        console.error('GeoGebra not loaded yet');
        return;
      }
      
      if (!containerRef.current) {
        console.error('Container not found');
        return;
      }

      const params: any = {
        appName: 'classic',
        id: id,
        width: width,
        height: height,
        showToolBar: showToolBar,
        showAlgebraInput: showAlgebraInput,
        showMenuBar: showMenuBar,
        perspective: 'G',
        useBrowserForJS: true,
        enableShiftDragZoom: true,
        showResetIcon: true,
      };

      // Add coordinate system if provided
      if (coordSystem) {
        if (coordSystem.xmin !== undefined) params.xMin = coordSystem.xmin;
        if (coordSystem.xmax !== undefined) params.xMax = coordSystem.xmax;
        if (coordSystem.ymin !== undefined) params.yMin = coordSystem.ymin;
        if (coordSystem.ymax !== undefined) params.yMax = coordSystem.ymax;
      }

      params.appletOnLoad = (api: any) => {
        appletRef.current = api;
        setLoading(false);
        
        // Execute commands if provided
        if (commands && commands.length > 0) {
          commands.forEach((cmd: string) => {
            try {
              api.evalCommand(cmd);
            } catch (e) {
              console.error('GeoGebra command error:', e, cmd);
            }
          });
        }
        
        if (onAppletReady) {
          onAppletReady(api);
        }
      };

      try {
        const applet = new window.GGBApplet(params, true);
        applet.inject(id);
      } catch (e) {
        console.error('GeoGebra injection error:', e);
        setLoading(false);
      }
    };

    // Load GeoGebra script if not already loaded
    const existing = document.querySelector('script[src="https://www.geogebra.org/apps/deployggb.js"]');
    if (!existing) {
      const script = document.createElement('script');
      script.src = 'https://www.geogebra.org/apps/deployggb.js';
      script.async = true;
      script.onload = () => {
        setTimeout(initialize, 100);
      };
      script.onerror = () => {
        console.error('Failed to load GeoGebra script');
        setLoading(false);
      };
      document.body.appendChild(script);
    } else {
      if (window.GGBApplet) {
        setTimeout(initialize, 100);
      } else {
        // Wait for GGBApplet to be available
        let attempts = 0;
        const checkInterval = setInterval(() => {
          if (window.GGBApplet) {
            clearInterval(checkInterval);
            setTimeout(initialize, 100);
          }
          attempts++;
          if (attempts > 50) {
            clearInterval(checkInterval);
            console.error('GeoGebra took too long to load');
            setLoading(false);
          }
        }, 100);
      }
    }
    
    return () => {
      // Cleanup: try to remove the applet when component unmounts
      if (appletRef.current && typeof appletRef.current.remove === 'function') {
        try {
          appletRef.current.remove();
        } catch (e) {
          // Ignore cleanup errors
        }
      }
    };
  }, [id, width, height, showToolBar, showAlgebraInput, showMenuBar, onAppletReady, commands, coordSystem]);

  return (
    <div
      ref={containerRef}
      id={id}
      style={{
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        marginBottom: '20px',
        minHeight: height + 20,
        position: 'relative'
      }}
    >
      {loading && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f0f0f0',
            borderRadius: 8,
            zIndex: 1
          }}
        >
          <div style={{ color: '#999' }}>GeoGebra wird geladen...</div>
        </div>
      )}
    </div>
  );
}
