/* eslint-disable @typescript-eslint/no-explicit-any */
// Global JSX type declarations for Three.js elements used in react-three-fiber
// This ensures compatibility across different TypeScript/bundler configurations

import "@react-three/fiber";

declare module "react/jsx-runtime" {
  namespace JSX {
    interface IntrinsicElements {
      mesh: any;
      group: any;
      planeGeometry: any;
      primitive: any;
      ambientLight: any;
      directionalLight: any;
      pointLight: any;
    }
  }
}

declare module "react/jsx-dev-runtime" {
  namespace JSX {
    interface IntrinsicElements {
      mesh: any;
      group: any;
      planeGeometry: any;
      primitive: any;
      ambientLight: any;
      directionalLight: any;
      pointLight: any;
    }
  }
}
