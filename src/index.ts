import { Box, Quaternion as CQuaternion, ConvexPolyhedron, Cylinder, Shape, Sphere, Trimesh, Vec3 } from 'cannon-es';
import { Box3, BufferGeometry, CylinderGeometry, MathUtils, Mesh, Object3D, SphereGeometry, Vector3 } from 'three';
import { ConvexHull } from '../lib/ConvexHull.js';
import { PatchedBox, PatchedCylinder } from './types.js';
import { getComponent, getGeometry, getVertices } from './utils.js';

const PI_2 = Math.PI / 2;

export enum Type {
  BOX = 'Box',
  CYLINDER = 'Cylinder',
  SPHERE = 'Sphere',
  HULL = 'ConvexPolyhedron',
  MESH = 'Trimesh',
}

export interface ShapeOptions {
  type?: Type,
  cylinderAxis?: 'x' | 'y' | 'z',
  sphereRadius?: number,
}

/**
 * Given a THREE.Object3D instance, creates a corresponding CANNON shape.
 */
export const threeToCannon = function (object: Object3D, options: ShapeOptions = {}): Shape | null {
  let geometry: BufferGeometry | null;

  if (options.type === Type.BOX) {
    return createBoundingBoxShape(object);
  } else if (options.type === Type.CYLINDER) {
    return createBoundingCylinderShape(object, options);
  } else if (options.type === Type.SPHERE) {
    return createBoundingSphereShape(object, options);
  } else if (options.type === Type.HULL) {
    return createConvexPolyhedron(object);
  } else if (options.type === Type.MESH) {
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
      console.warn('Unrecognized geometry: "%s". Using bounding box as shape.', geometry.type);
      return createBoxShape(geometry);
  }
};

/******************************************************************************
 * Shape construction
 */

function createBoxShape (geometry: BufferGeometry): Shape | null {
   const vertices = getVertices(geometry);

   if (!vertices.length) return null;

   geometry.computeBoundingBox();
   const box = geometry.boundingBox!;
   return new Box(new Vec3(
     (box.max.x - box.min.x) / 2,
     (box.max.y - box.min.y) / 2,
     (box.max.z - box.min.z) / 2
   ));
}

/** Bounding box needs to be computed with the entire subtree, not just geometry. */
function createBoundingBoxShape (object: Object3D): Shape | null {
  const clone = object.clone();
  clone.quaternion.set(0, 0, 0, 1);
  clone.updateMatrixWorld();

  const box = new Box3().setFromObject(clone);

  if (!isFinite(box.min.lengthSq())) return null;

  const shape = new Box(new Vec3(
    (box.max.x - box.min.x) / 2,
    (box.max.y - box.min.y) / 2,
    (box.max.z - box.min.z) / 2
  )) as PatchedBox;

  const localPosition = box.translate(clone.position.negate()).getCenter(new Vector3());
  if (localPosition.lengthSq()) {
    shape.offset = localPosition;
  }

  return shape;
}

/** Computes 3D convex hull as a CANNON.ConvexPolyhedron. */
function createConvexPolyhedron (object: Object3D): Shape | null {
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
  const faces = hull.faces;
  const vertices = [];
  const normals = [];

  for (let i = 0; i < faces.length; i++) {
    const face = faces[ i ];
    let edge = face.edge;
    do {
      const point = edge.head().point;
      vertices.push( new Vec3(point.x, point.y, point.z) );
      normals.push( new Vec3(face.normal.x, face.normal.y, face.normal.z) );
      edge = edge.next;
    } while ( edge !== face.edge );
  }

  return new ConvexPolyhedron({vertices, normals});
}

function createCylinderShape (geometry: CylinderGeometry): Shape | null {
  const params = geometry.parameters;

  const shape = new Cylinder(
    params.radiusTop,
    params.radiusBottom,
    params.height,
    params.radialSegments
  ) as unknown as PatchedCylinder;

  // Include metadata for serialization.
  shape.radiusTop = params.radiusTop;
  shape.radiusBottom = params.radiusBottom;
  shape.height = params.height;
  shape.numSegments = params.radialSegments;

  shape.orientation = new CQuaternion();
  shape.orientation.setFromEuler(MathUtils.degToRad(-90), 0, 0, 'XYZ').normalize();
  return shape;
}

function createBoundingCylinderShape (object: Object3D, options: ShapeOptions): Shape | null {
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
  const shape = new Cylinder(radius, radius, height, 12) as PatchedCylinder;

  // Include metadata for serialization.
  shape.radiusTop = radius;
  shape.radiusBottom = radius;
  shape.height = height;
  shape.numSegments = 12;

  shape.orientation = new CQuaternion();
  shape.orientation.setFromEuler(
    majorAxis === 'y' ? PI_2 : 0,
    majorAxis === 'z' ? PI_2 : 0,
    0,
    'XYZ'
  ).normalize();
  return shape;
}

function createPlaneShape (geometry: BufferGeometry): Shape | null {
  geometry.computeBoundingBox();
  const box = geometry.boundingBox!;
  return new Box(new Vec3(
    (box.max.x - box.min.x) / 2 || 0.1,
    (box.max.y - box.min.y) / 2 || 0.1,
    (box.max.z - box.min.z) / 2 || 0.1
  ));
}

function createSphereShape (geometry: SphereGeometry): Shape | null {
  return new Sphere(geometry.parameters.radius);
}

function createBoundingSphereShape (object: Object3D, options: ShapeOptions): Shape | null {
  if (options.sphereRadius) {
    return new Sphere(options.sphereRadius);
  }
  const geometry = getGeometry(object);
  if (!geometry) return null;
  geometry.computeBoundingSphere();
  return new Sphere(geometry.boundingSphere!.radius);
}

function createTrimeshShape (geometry: BufferGeometry): Shape | null {
  const vertices = getVertices(geometry);

  if (!vertices.length) return null;

  const indices = Object.keys(vertices).map(Number);
  return new Trimesh(vertices as unknown as number[], indices);
}
