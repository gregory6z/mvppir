/* eslint-disable @typescript-eslint/no-explicit-any */
import type { MeshProps, GroupProps } from "@react-three/fiber";

// Global JSX type declarations for Three.js elements used in react-three-fiber
// This ensures compatibility across different TypeScript/bundler configurations
declare global {
  namespace JSX {
    interface IntrinsicElements {
      mesh: MeshProps & { ref?: any; children?: any };
      group: GroupProps & { ref?: any; children?: any };
      planeGeometry: any;
      primitive: { object: any; attach?: string; [key: string]: any };
      ambientLight: { color?: any; intensity?: number; [key: string]: any };
      directionalLight: { color?: any; position?: any; intensity?: number; [key: string]: any };
      pointLight: { color?: any; position?: any; intensity?: number; [key: string]: any };
    }
  }
}

export {};
