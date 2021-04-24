import { Box, Cylinder, Quaternion, Sphere } from 'cannon-es';
import { Vector3 } from 'three';

export interface SphereParameters {
	radius: number;
}

export interface CylinderParameters {
	radiusTop: number,
	radiusBottom: number,
	height: number,
	radialSegments: number,
}

export interface PatchedBox extends Box {
	// TODO these should be from the same package...
	offset: Vector3;
	orientation: Quaternion;
}

export interface PatchedSphere extends Sphere {
	// TODO these should be from the same package...
	offset: Vector3;
	orientation: Quaternion;
}

export interface PatchedCylinder extends Cylinder {
	// TODO these should be from the same package...
	offset: Vector3;
	orientation: Quaternion;
}
