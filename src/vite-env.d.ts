/// <reference types="vite/client" />

// SVG React component import support (vite-plugin-svgr style)
declare module '*.svg?react' {
  import * as React from 'react';
  const ReactComponent: React.FC<React.SVGProps<SVGSVGElement> & { title?: string }>;
  export default ReactComponent;
}