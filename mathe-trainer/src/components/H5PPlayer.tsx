import React, { useEffect, useRef } from 'react';

interface H5PPlayerProps {
  /** Pfad zum H5P-Inhaltsordner unter public/, z.B. "/h5p-content/escaperoom-zinseszins" */
  contentPath: string;
  minHeight?: number;
}

export default function H5PPlayer({ contentPath, minHeight = 700 }: H5PPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;

    import('h5p-standalone').then(({ H5P }) => {
      if (cancelled || !containerRef.current) return;
      containerRef.current.innerHTML = '';

      new H5P(containerRef.current, {
        h5pJsonPath: contentPath,
        librariesPath: `${contentPath}/libraries`,
        frameJs: '/h5p-standalone/frame.bundle.js',
        frameCss: '/h5p-standalone/styles/h5p.css',
        frame: true,
        copyright: true,
        fullScreen: true,
      });
    });

    return () => {
      cancelled = true;
      if (containerRef.current) containerRef.current.innerHTML = '';
    };
  }, [contentPath]);

  return <div ref={containerRef} style={{ width: '100%', minHeight }} />;
}
