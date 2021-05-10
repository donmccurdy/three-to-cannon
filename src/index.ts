import { Box, Quaternion as CQuaternion, ConvexPolyhedron, Cylinder, Shape, Sphere, Trimesh, Vec3 } from 'cannon-es';
import { Box3, BufferGeometry, CylinderGeometry, MathUtils, Mesh, Object3D, SphereGeometry, Vector3 } from 'three';
import { ConvexHull } from '../lib/ConvexHull.js';
import { getComponent, getGeometry, getVertices } from './utils.js';

const PI_2 = Math.PI / 2;

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

export interface ShapeResult<T extends Shape = Shape> {
	shape: T,
	offset?: Vec3,
	orientation?: CQuaternion
}

/**
 * Given a THREE.Object3D instance, creates a corresponding CANNON shape.
 */
export const threeToCannon = function (object: Object3D, options: ShapeOptions = {}): ShapeResult | null {
	let geometry: BufferGeometry | null;

	if (options.type === ShapeType.BOX) {
		return createBoundingBoxShape(object);
	} else if (options.type === ShapeType.CYLINDER) {
		return createBoundingCylinderShape(object, options);
	} else if (options.type === ShapeType.SPHERE) {
		return createBoundingSphereShape(object, options);
	} else if (options.type === ShapeType.HULL) {
		return createConvexPolyhedron(object);
	} else if (options.type === ShapeType.MESH) {
		geometry = getGeometry(object);
		return geometry ? createTrimeshShape(geometry) : null;
	} else if (options.type) {
		throw new Error(`[CANNON.threeToCannon] Invalid type "${options.type}".`);
	}

	geometry = getGeometry(object);
	if (!geometry) return null;

	switch (geometry.type) {
		case 'BoxGeometry':
		case 'BoxBufferGeometry':
			return createBoxShape(geometry);
		case 'CylinderGeometry':
		case 'CylinderBufferGeometry':
			return createCylinderShape(geometry as CylinderGeometry);
		case 'PlaneGeometry':
		case 'PlaneBufferGeometry':
			return createPlaneShape(geometry);
		case 'SphereGeometry':
		case 'SphereBufferGeometry':
			return createSphereShape(geometry as SphereGeometry);
		case 'TubeGeometry':
		case 'BufferGeometry':
			return createBoundingBoxShape(object);
		default:
			console.warn(
				'Unrecognized geometry: "%s". Using bounding box as shape.', geometry.type
			);
			return createBoxShape(geometry);
	}
};

/******************************************************************************
 * Shape construction
 */

function createBoxShape (geometry: BufferGeometry): ShapeResult | null {
	const vertices = getVertices(geometry);

	if (!vertices.length) return null;

	geometry.computeBoundingBox();
	const box = geometry.boundingBox!;
	const shape = new Box(new Vec3(
		(box.max.x - box.min.x) / 2,
		(box.max.y - box.min.y) / 2,
		(box.max.z - box.min.z) / 2
	));
	return {shape};
}

/** Bounding box needs to be computed with the entire subtree, not just geometry. */
function createBoundingBoxShape (object: Object3D): ShapeResult | null {
	const clone = object.clone();
	clone.quaternion.set(0, 0, 0, 1);
	clone.updateMatrixWorld();

	const box = new Box3().setFromObject(clone);

	if (!isFinite(box.min.lengthSq())) return null;

	const shape = new Box(new Vec3(
		(box.max.x - box.min.x) / 2,
		(box.max.y - box.min.y) / 2,
		(box.max.z - box.min.z) / 2
	));

	const localPosition = box.translate(clone.position.negate()).getCenter(new Vector3());

	return {
		shape,
		offset: localPosition.lengthSq()
			? new Vec3(localPosition.x, localPosition.y, localPosition.z)
			: undefined
	};
}

/** Computes 3D convex hull as a CANNON.ConvexPolyhedron. */
function createConvexPolyhedron (object: Object3D): ShapeResult | null {
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
	const vertices = [];
	const faces: number[][] = [];

	for (let i = 0; i < hullFaces.length; i++) {
		const hullFace = hullFaces[ i ];
		const face: number[] = [];
		faces.push(face);

		let edge = hullFace.edge;
		do {
			const point = edge.head().point;
			vertices.push( new Vec3(point.x, point.y, point.z) );
			face.push(vertices.length - 1);
			edge = edge.next;
		} while ( edge !== hullFace.edge );
	}

	const shape = new ConvexPolyhedron({vertices, faces});
	return {shape};
}

function createCylinderShape (geometry: CylinderGeometry): ShapeResult | null {
	const params = geometry.parameters;

	const shape = new Cylinder(
		params.radiusTop,
		params.radiusBottom,
		params.height,
		params.radialSegments
	);

	// Include metadata for serialization.
	// TODO(cleanup): Is this still necessary?
	shape.radiusTop = params.radiusTop;
	shape.radiusBottom = params.radiusBottom;
	shape.height = params.height;
	shape.numSegments = params.radialSegments;

	return {
		shape,
		orientation: new CQuaternion()
			.setFromEuler(MathUtils.degToRad(-90), 0, 0, 'XYZ')
			.normalize()
	}
}

function createBoundingCylinderShape (object: Object3D, options: ShapeOptions): ShapeResult | null {
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

	// Create shape.
	const shape = new Cylinder(radius, radius, height, 12);

	// Include metadata for serialization.
	shape.radiusTop = radius;
	shape.radiusBottom = radius;
	shape.height = height;
	shape.numSegments = 12;

	const eulerX = majorAxis === 'y' ? PI_2 : 0;
	const eulerY = majorAxis === 'z' ? PI_2 : 0;

	return {
		shape,
		orientation: new CQuaternion()
			.setFromEuler(eulerX, eulerY, 0, 'XYZ')
			.normalize()
	};
}

function createPlaneShape (geometry: BufferGeometry): ShapeResult | null {
	geometry.computeBoundingBox();
	const box = geometry.boundingBox!;
	const shape = new Box(new Vec3(
		(box.max.x - box.min.x) / 2 || 0.1,
		(box.max.y - box.min.y) / 2 || 0.1,
		(box.max.z - box.min.z) / 2 || 0.1
	));
	return {shape};
}

function createSphereShape (geometry: SphereGeometry): ShapeResult | null {
	const shape = new Sphere(geometry.parameters.radius);
	return {shape};
}

function createBoundingSphereShape (object: Object3D, options: ShapeOptions): ShapeResult | null {
	if (options.sphereRadius) {
		return {shape: new Sphere(options.sphereRadius)};
	}
	const geometry = getGeometry(object);
	if (!geometry) return null;
	geometry.computeBoundingSphere();
	return {shape: new Sphere(geometry.boundingSphere!.radius)};
}

function createTrimeshShape (geometry: BufferGeometry): ShapeResult | null {
	const vertices = getVertices(geometry);

	if (!vertices.length) return null;

	const indices = Object.keys(vertices).map(Number);
	return {shape: new Trimesh(vertices as unknown as number[], indices)};
}
