import React, { useEffect, useRef } from 'react';

interface OnlyOfficeEditorProps {
  task: any;
  onDataChange?: (data: any) => void;
}

declare global {
  interface Window {
    DocsAPI: any;
  }
}

export const OnlyOfficeEditor: React.FC<OnlyOfficeEditorProps> = ({ task, onDataChange }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const docRef = useRef<any>(null);

  useEffect(() => {
    if (!task) return;

    // Lade OnlyOffice API vom CDN
    const loadScript = () => {
      if (window.DocsAPI) {
        initEditor();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://documentserver.onlyoffice.com/web-apps/apps/api/documents/api.js';
      script.async = true;
      script.onload = () => {
        setTimeout(initEditor, 100);
      };
      script.onerror = () => {
        console.error('OnlyOffice API konnte nicht geladen werden');
      };
      document.head.appendChild(script);
    };

    const initEditor = () => {
      if (!window.DocsAPI || !containerRef.current) return;

      // Nutze /api/excel Endpoint um die Datei zu servieren
      const excelUrl = `/api/excel?data=${encodeURIComponent(JSON.stringify(task.data))}`;

      const config = {
        type: 'cell',
        documentType: 'spreadsheet',
        document: {
          title: task?.title || 'Excel Aufgabe',
          url: excelUrl,
          fileType: 'xlsx',
          key: `${Date.now()}`,
        },
        editorConfig: {
          mode: 'edit',
          lang: 'de',
          user: {
            id: 'student-1',
            name: 'Schüler',
          },
          customization: {
            autosave: true,
            compactToolbar: false,
            zoom: 100,
          },
        },
        events: {
          onDocumentStateChange: () => {
            console.log('Dokument geändert');
            if (onDataChange) {
              onDataChange({ status: 'modified' });
            }
          },
          onError: (error: any) => {
            console.error('OnlyOffice Error:', error);
          },
        },
      };

      if (containerRef.current) {
        containerRef.current.innerHTML = '<div id="onlyoffice-editor"></div>';
        try {
          docRef.current = new window.DocsAPI.DocEditor('onlyoffice-editor', config);
        } catch (e) {
          console.error('OnlyOffice init error:', e);
        }
      }
    };

    loadScript();

    return () => {
      if (docRef.current && typeof docRef.current.destroyEditor === 'function') {
        try {
          docRef.current.destroyEditor();
        } catch (e) {
          console.log('Cleanup');
        }
      }
    };
  }, [task, onDataChange]);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '700px',
        border: '2px solid #ddd',
        borderRadius: '8px',
        overflow: 'hidden',
        background: '#f5f5f5',
      }}
    >
      <div className="flex items-center justify-center h-full text-gray-500">
        OnlyOffice Spreadsheet wird geladen...
      </div>
    </div>
  );
};
