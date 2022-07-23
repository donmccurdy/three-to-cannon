import { Box, Quaternion as CQuaternion, ConvexPolyhedron, Cylinder, Shape, Sphere, Trimesh, Vec3 } from 'cannon-es';
import { Box3, BufferGeometry, CylinderGeometry, MathUtils, Mesh, Object3D, SphereGeometry, Vector3 } from 'three';
import { ConvexHull } from '../lib/ConvexHull.js';
import { getComponent, getGeometry, getVertices } from './utils';

const PI_2 = Math.PI / 2;

export type BoxParameters = { x: number, y: number, z: number };

export type CylinderParameters = { radiusTop: number, radiusBottom: number, height: number, segments: number };

export type SphereParameters = { radius: number };

export type ConvexPolyhedronParameters = { vertices: Float32Array, faces: number[][] };

export type TrimeshParameters = { vertices: Float32Array, indices: Uint32Array };

type ShapeTypeToShapeParameters = {
	Box: BoxParameters,
	Cylinder: CylinderParameters,
	Sphere: SphereParameters,
	ConvexPolyhedron: ConvexPolyhedronParameters,
	Trimesh: TrimeshParameters,
};

export enum ShapeType {
	BOX = 'Box',
	CYLINDER = 'Cylinder',
	SPHERE = 'Sphere',
	HULL = 'ConvexPolyhedron',
	MESH = 'Trimesh',
}

export interface ShapeOptions {
	type?: ShapeType,
	cylinderAxis?: 'x' | 'y' | 'z',
	sphereRadius?: number,
}

export interface ShapeParameters<T extends ShapeType = ShapeType> {
	type: T,
	params: ShapeTypeToShapeParameters[T],
	offset?: Vec3,
	orientation?: CQuaternion,
}

export interface ShapeResult<T extends Shape = Shape> {
	shape: T,
	offset?: Vec3,
	orientation?: CQuaternion,
}

/**
 * Given a THREE.Object3D instance, creates parameters for a CANNON shape.
 */
export const getShapeParameters = function (object: Object3D, options: ShapeOptions = {}): ShapeParameters | null {
	let geometry: BufferGeometry | null;

	if (options.type === ShapeType.BOX) {
		return getBoundingBoxParameters(object);
	} else if (options.type === ShapeType.CYLINDER) {
		return getBoundingCylinderParameters(object, options);
	} else if (options.type === ShapeType.SPHERE) {
		return getBoundingSphereParameters(object, options);
	} else if (options.type === ShapeType.HULL) {
		return getConvexPolyhedronParameters(object);
	} else if (options.type === ShapeType.MESH) {
		geometry = getGeometry(object);
		return geometry ? getTrimeshParameters(geometry) : null;
	} else if (options.type) {
		throw new Error(`[CANNON.getShapeParameters] Invalid type "${options.type}".`);
	}

	geometry = getGeometry(object);
	if (!geometry) return null;

	switch (geometry.type) {
		case 'BoxGeometry':
		case 'BoxBufferGeometry':
			return getBoxParameters(geometry);
		case 'CylinderGeometry':
		case 'CylinderBufferGeometry':
			return getCylinderParameters(geometry as CylinderGeometry);
		case 'PlaneGeometry':
		case 'PlaneBufferGeometry':
			return getPlaneParameters(geometry);
		case 'SphereGeometry':
		case 'SphereBufferGeometry':
			return getSphereParameters(geometry as SphereGeometry);
		case 'TubeGeometry':
		case 'BufferGeometry':
			return getBoundingBoxParameters(object);
		default:
			console.warn(
				'Unrecognized geometry: "%s". Using bounding box as shape.', geometry.type
			);
			return getBoxParameters(geometry);
	}
};

/**
 * Given a THREE.Object3D instance, creates a corresponding CANNON shape.
 */
export const threeToCannon = function (object: Object3D, options: ShapeOptions = {}): ShapeResult | null {
	const shapeParameters = getShapeParameters(object, options);
	if (!shapeParameters) {
		return null;
	}

	const { type, params, offset, orientation } = shapeParameters;

	let shape: Shape;
	if (type === ShapeType.BOX) {
		shape = createBox(params as BoxParameters);
	} else if (type === ShapeType.CYLINDER) {
		shape = createCylinder(params as CylinderParameters);
	} else if (type === ShapeType.SPHERE) {
		shape = createSphere(params as SphereParameters);
	} else if (type === ShapeType.HULL) {
		shape = createConvexPolyhedron(params as ConvexPolyhedronParameters);
	} else {
		shape = createTrimesh(params as TrimeshParameters);
	}

	return {
		shape,
		offset,
		orientation,
	};
};

/******************************************************************************
 * Shape construction
 */

 function createBox (params: BoxParameters): Box {
	const { x, y, z } = params;
	const shape = new Box(new Vec3(x, y, z));
	return shape;
}

function createCylinder (params: CylinderParameters): Cylinder {
	const { radiusTop, radiusBottom, height, segments } = params;

	const shape = new Cylinder(radiusTop, radiusBottom, height, segments);

	// Include metadata for serialization.
	// TODO(cleanup): Is this still necessary?
	shape.radiusTop = radiusBottom;
	shape.radiusBottom = radiusBottom;
	shape.height = height;
	shape.numSegments = segments;

	return shape;
}

function createSphere (params: SphereParameters): Sphere {
	const shape = new Sphere(params.radius);

	return shape;
}

function createConvexPolyhedron (params: ConvexPolyhedronParameters): ConvexPolyhedron {
	const { faces, vertices: verticesArray } = params;

	const vertices: Vec3[] = [];
	for (let i = 0; i < verticesArray.length; i += 3) {
		vertices.push(new Vec3(
			verticesArray[i],
			verticesArray[i + 1],
			verticesArray[i + 2]
		));
	}

	const shape = new ConvexPolyhedron({
		faces,
		vertices
	});

	return shape;
}

function createTrimesh (params: TrimeshParameters): Trimesh {
	const { vertices, indices } = params
	const shape = new Trimesh(
		vertices as unknown as number[],
		indices as unknown as number[],
	);

	return shape;
}

/******************************************************************************
 * Shape parameters
 */

function getBoxParameters (geometry: BufferGeometry): ShapeParameters<ShapeType.BOX> | null {
	const vertices = getVertices(geometry);

	if (!vertices.length) return null;

	geometry.computeBoundingBox();
	const box = geometry.boundingBox!;

	return {
		type: ShapeType.BOX,
		params: {
			x: (box.max.x - box.min.x) / 2,
			y: (box.max.y - box.min.y) / 2,
			z: (box.max.z - box.min.z) / 2,
		},
	};
}

/** Bounding box needs to be computed with the entire subtree, not just geometry. */
function getBoundingBoxParameters (object: Object3D): ShapeParameters<ShapeType.BOX> | null {
	const clone = object.clone();
	clone.quaternion.set(0, 0, 0, 1);
	clone.updateMatrixWorld();

	const box = new Box3().setFromObject(clone);

	if (!isFinite(box.min.lengthSq())) return null;

	const localPosition = box.translate(clone.position.negate()).getCenter(new Vector3());

	return {
		type: ShapeType.BOX,
		params: {
			x: (box.max.x - box.min.x) / 2,
			y: (box.max.y - box.min.y) / 2,
			z: (box.max.z - box.min.z) / 2,
		},
		offset: localPosition.lengthSq()
			? new Vec3(localPosition.x, localPosition.y, localPosition.z)
			: undefined,
	};
}

/** Computes 3D convex hull as a CANNON.ConvexPolyhedron. */
function getConvexPolyhedronParameters (object: Object3D): ShapeParameters<ShapeType.HULL> | null {
	const geometry = getGeometry(object);

	if (!geometry) return null;

	// Perturb.
	const eps = 1e-4;
	for (let i = 0; i < geometry.attributes.position.count; i++) {
		geometry.attributes.position.setXYZ(
			i,
			geometry.attributes.position.getX(i) + (Math.random() - 0.5) * eps,
			geometry.attributes.position.getY(i) + (Math.random() - 0.5) * eps,
			geometry.attributes.position.getZ(i) + (Math.random() - 0.5) * eps,
		);
	}

	// Compute the 3D convex hull.
	const hull = new ConvexHull().setFromObject(new Mesh(geometry));
	const hullFaces = hull.faces;
	const vertices: number[] = [];
	const faces: number[][] = [];

	let currentFaceVertex = 0;
	for (let i = 0; i < hullFaces.length; i++) {
		const hullFace = hullFaces[ i ];
		const face: number[] = [];
		faces.push(face);

		let edge = hullFace.edge;
		do {
			const point = edge.head().point;
			vertices.push(point.x, point.y, point.z);
			face.push(currentFaceVertex);
			currentFaceVertex++;
			edge = edge.next;
		} while ( edge !== hullFace.edge );
	}

	const verticesTypedArray = new Float32Array(vertices.length);
	verticesTypedArray.set(vertices);

	return {
		type: ShapeType.HULL,
		params: { vertices: verticesTypedArray, faces },
	};
}

function getCylinderParameters (
	geometry: CylinderGeometry
): ShapeParameters<ShapeType.CYLINDER> | null {
	const params = geometry.parameters;

	return {
		type: ShapeType.CYLINDER,
		params: {
			radiusTop: params.radiusTop,
			radiusBottom: params.radiusBottom,
			height: params.height,
			segments: params.radialSegments,
		},
		orientation: new CQuaternion()
			.setFromEuler(MathUtils.degToRad(-90), 0, 0, 'XYZ')
			.normalize(),
	}
}

function getBoundingCylinderParameters (
	object: Object3D,
	options: ShapeOptions
): ShapeParameters<ShapeType.CYLINDER> | null {
	const axes = ['x', 'y', 'z'];
	const majorAxis = options.cylinderAxis || 'y';
	const minorAxes = axes.splice(axes.indexOf(majorAxis), 1) && axes;
	const box = new Box3().setFromObject(object);

	if (!isFinite(box.min.lengthSq())) return null;

	// Compute cylinder dimensions.
	const height = box.max[majorAxis] - box.min[majorAxis];
	const radius = 0.5 * Math.max(
		getComponent(box.max, minorAxes[0]) - getComponent(box.min, minorAxes[0]),
		getComponent(box.max, minorAxes[1]) - getComponent(box.min, minorAxes[1]),
	);

	const eulerX = majorAxis === 'y' ? PI_2 : 0;
	const eulerY = majorAxis === 'z' ? PI_2 : 0;

	return {
		type: ShapeType.CYLINDER,
		params: {
			radiusTop: radius,
			radiusBottom: radius,
			height,
			segments: 12,
		},
		orientation: new CQuaternion()
			.setFromEuler(eulerX, eulerY, 0, 'XYZ')
			.normalize(),
	};
}

function getPlaneParameters (geometry: BufferGeometry): ShapeParameters<ShapeType.BOX> | null {
	geometry.computeBoundingBox();
	const box = geometry.boundingBox!;

	return {
		type: ShapeType.BOX,
		params: {
			x: (box.max.x - box.min.x) / 2 || 0.1,
			y: (box.max.y - box.min.y) / 2 || 0.1,
			z: (box.max.z - box.min.z) / 2 || 0.1,
		},
	};
}

function getSphereParameters (geometry: SphereGeometry): ShapeParameters<ShapeType.SPHERE> | null {
	return {
		type: ShapeType.SPHERE,
		params: { radius: geometry.parameters.radius },
	};
}

function getBoundingSphereParameters (
	object: Object3D,
	options: ShapeOptions
): ShapeParameters<ShapeType.SPHERE> | null {
	if (options.sphereRadius) {
		return {
			type: ShapeType.SPHERE,
			params: { radius: options.sphereRadius },
		};
	}
	const geometry = getGeometry(object);
	if (!geometry) return null;
	geometry.computeBoundingSphere();

	return {
		type: ShapeType.SPHERE,
		params: { radius: geometry.boundingSphere!.radius },
	};
}

function getTrimeshParameters (geometry: BufferGeometry): ShapeParameters<ShapeType.MESH> | null {
	const vertices = getVertices(geometry);

	if (!vertices.length) return null;

	const indices = new Uint32Array(vertices.length);
	for (let i = 0; i < vertices.length; i++) {
		indices[i] = i;
	}

	return {
		type: ShapeType.MESH,
		params: {
			vertices,
			indices,
		},
	};
}
