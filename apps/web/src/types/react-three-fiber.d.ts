import { Object3DNode } from "@react-three/fiber"
import * as THREE from "three"

declare module "@react-three/fiber" {
  interface ThreeElements {
    mesh: Object3DNode<THREE.Mesh, typeof THREE.Mesh>
    planeGeometry: Object3DNode<THREE.PlaneGeometry, typeof THREE.PlaneGeometry>
    primitive: {
      object: any
      attach?: string
    }
  }
}
