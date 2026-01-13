/// <reference types="vite/client" />

declare module '*.svg?react' {
  import { FC, SVGProps } from 'react';
  const ReactComponent: FC<SVGProps<SVGElement>>;
  export default ReactComponent;
}