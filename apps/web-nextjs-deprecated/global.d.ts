/// <reference types="react" />
/// <reference types="react-dom" />

declare global {
  namespace JSX {
    interface IntrinsicElements {
      mesh: any
      planeGeometry: any
      primitive: any
      group: any
      perspectiveCamera: any
      ambientLight: any
      pointLight: any
      directionalLight: any
    }
  }
}

export {}
