import { Mesh, Vector3 } from 'three';

declare class HalfEdge {
    next: HalfEdge;
    head: () => {point: Vector3};
}

declare class Face {
    edge: HalfEdge;
    normal: Vector3;
}

declare class ConvexHull {
    public faces: Face[];
    setFromObject(mesh: Mesh): this;
}
