import { Box, Cylinder, Quaternion, Sphere } from 'cannon-es';
import { BufferGeometry, Geometry, Vector3 } from 'three';

export interface SphereParameters {
    radius: number;
}

export interface CylinderParameters {
    radiusTop: number,
    radiusBottom: number,
    height: number,
    radialSegments: number,
}

export interface PatchedGeometry extends Geometry {
    metadata?: {
        type: string,
        parameters: CylinderParameters | SphereParameters
    };
    parameters?: CylinderParameters | SphereParameters;

    // Exists in Geometry class; missing from types.
    toBufferGeometry: () => BufferGeometry;
}

export interface PatchedBox extends Box {
    offset: Vector3;
    orientation: Quaternion;
}

export interface PatchedSphere extends Sphere {
    offset: Vector3;
    orientation: Quaternion;
}

export interface PatchedCylinder extends Cylinder {
    offset: Vector3;
    orientation: Quaternion;
}
