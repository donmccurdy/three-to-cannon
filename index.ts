import { Box, Quaternion as CQuaternion, ConvexPolyhedron, Cylinder, Shape, Sphere, Trimesh, Vec3 } from 'cannon-es';
import { Box3, BufferGeometry, Geometry, MathUtils, Matrix4, Mesh, Object3D, Quaternion, Vector3 } from 'three';
import { ConvexHull } from './lib/ConvexHull.js';
import { CylinderParameters, PatchedBox, PatchedCylinder, PatchedGeometry, SphereParameters } from './src/types.js';

const PI_2 = Math.PI / 2;

export enum Type {
  BOX = 'Box',
  CYLINDER = 'Cylinder',
  SPHERE = 'Sphere',
  HULL = 'ConvexPolyhedron',
  MESH = 'Trimesh',
};

export interface ShapeOptions {
  type?: Type,
  cylinderAxis?: 'x' | 'y' | 'z',
  sphereRadius?: number,
};

/**
 * Given a THREE.Object3D instance, creates a corresponding CANNON shape.
 */
export const threeToCannon = function (object: Object3D, options: ShapeOptions): Shape | null {
  options = options || {};

  let geometry: PatchedGeometry | null;

  if (options.type === Type.BOX) {
    return createBoundingBoxShape(object);
  } else if (options.type === Type.CYLINDER) {
    return createBoundingCylinderShape(object, options);
  } else if (options.type === Type.SPHERE) {
    return createBoundingSphereShape(object, options);
  } else if (options.type === Type.HULL) {
    return createConvexPolyhedron(object);
  } else if (options.type === Type.MESH) {
    geometry = getGeometry(object) as PatchedGeometry;
    return geometry ? createTrimeshShape(geometry) : null;
  } else if (options.type) {
    throw new Error(`[CANNON.threeToCannon] Invalid type "${options.type}".`);
  }

  geometry = getGeometry(object) as PatchedGeometry;
  if (!geometry) return null;

  var type = geometry.metadata
    ? geometry.metadata.type
    : geometry.type;

  switch (type) {
    case 'BoxGeometry':
    case 'BoxBufferGeometry':
      return createBoxShape(geometry);
    case 'CylinderGeometry':
    case 'CylinderBufferGeometry':
      return createCylinderShape(geometry);
    case 'PlaneGeometry':
    case 'PlaneBufferGeometry':
      return createPlaneShape(geometry);
    case 'SphereGeometry':
    case 'SphereBufferGeometry':
      return createSphereShape(geometry);
    case 'TubeGeometry':
    case 'Geometry':
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

function createBoxShape (geometry: Geometry | BufferGeometry): Shape | null {
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

/**
 * Bounding box needs to be computed with the entire mesh, not just geometry.
 * @param  {THREE.Object3D} mesh
 * @return {CANNON.Shape}
 */
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

/**
 * Computes 3D convex hull as a CANNON.ConvexPolyhedron.
 */
function createConvexPolyhedron (object: Object3D): Shape | null {
  const geometry = getGeometry(object);

  if (!geometry || !geometry.vertices.length) return null;

  // Perturb.
  const eps = 1e-4;
  for (let i = 0; i < geometry.vertices.length; i++) {
    geometry.vertices[i].x += (Math.random() - 0.5) * eps;
    geometry.vertices[i].y += (Math.random() - 0.5) * eps;
    geometry.vertices[i].z += (Math.random() - 0.5) * eps;
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

function createCylinderShape (geometry: PatchedGeometry): Shape | null {
  var params: CylinderParameters = geometry.metadata
    ? geometry.metadata.parameters as CylinderParameters
    : geometry.parameters! as CylinderParameters;

  var shape = new Cylinder(
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
  var axes = ['x', 'y', 'z'];
  var majorAxis = options.cylinderAxis || 'y';
  var minorAxes = axes.splice(axes.indexOf(majorAxis), 1) && axes;
  var box = new Box3().setFromObject(object);

  if (!isFinite(box.min.lengthSq())) return null;

  // Compute cylinder dimensions.
  var height = box.max[majorAxis] - box.min[majorAxis];
  var radius = 0.5 * Math.max(
    getComponent(box.max, minorAxes[0]) - getComponent(box.min, minorAxes[0]),
    getComponent(box.max, minorAxes[1]) - getComponent(box.min, minorAxes[1]),
  );

  // Create shape.
  var shape = new Cylinder(radius, radius, height, 12) as PatchedCylinder;

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

function getComponent(v: Vector3, component: string) {
  switch(component) {
    case 'x': return v.x;
    case 'y': return v.y;
    case 'z': return v.z;
  }
  throw new Error(`Unexpected component ${component}`);
}

function createPlaneShape (geometry: Geometry): Shape | null {
  geometry.computeBoundingBox();
  var box = geometry.boundingBox!;
  return new Box(new Vec3(
    (box.max.x - box.min.x) / 2 || 0.1,
    (box.max.y - box.min.y) / 2 || 0.1,
    (box.max.z - box.min.z) / 2 || 0.1
  ));
}

function createSphereShape (geometry: PatchedGeometry): Shape | null {
  var params = geometry.metadata
    ? geometry.metadata.parameters as SphereParameters
    : geometry.parameters! as SphereParameters;
  return new Sphere(params.radius);
}

function createBoundingSphereShape (object: Object3D, options: ShapeOptions): Shape | null {
  if (options.sphereRadius) {
    return new Sphere(options.sphereRadius);
  }
  var geometry = getGeometry(object);
  if (!geometry) return null;
  geometry.computeBoundingSphere();
  return new Sphere(geometry.boundingSphere!.radius);
}

function createTrimeshShape (geometry: Geometry): Shape | null {
  var vertices = getVertices(geometry);

  if (!vertices.length) return null;

  var indices = Object.keys(vertices).map(Number);
  return new Trimesh(vertices as unknown as number[], indices);
}

/******************************************************************************
 * Utils
 */

/**
 * Returns a single geometry for the given object. If the object is compound,
 * its geometries are automatically merged.
 */
function getGeometry (object: Object3D): Geometry | null {
  var mesh,
      meshes = getMeshes(object),
      tmp = new Geometry() as PatchedGeometry,
      combined = new Geometry();

  if (meshes.length === 0) return null;

  // Apply scale  – it can't easily be applied to a CANNON.Shape later.
  if (meshes.length === 1) {
    const position = new Vector3(),
        quaternion = new Quaternion(),
        scale = new Vector3();
    if ((meshes[0].geometry as BufferGeometry).isBufferGeometry) {
      const _g = meshes[0].geometry as BufferGeometry;
      if (_g.attributes.position && _g.attributes.position.itemSize > 2) {
        tmp.fromBufferGeometry(_g);
      }
    } else {
      tmp = meshes[0].geometry.clone() as PatchedGeometry;
    }
    tmp.metadata = (meshes[0].geometry as PatchedGeometry).metadata;
    meshes[0].updateMatrixWorld();
    meshes[0].matrixWorld.decompose(position, quaternion, scale);
    return tmp.scale(scale.x, scale.y, scale.z);
  }

  // Recursively merge geometry, preserving local transforms.
  while ((mesh = meshes.pop())) {
    mesh.updateMatrixWorld();
    if ((mesh.geometry as BufferGeometry).isBufferGeometry) {
      if ((mesh.geometry as BufferGeometry).attributes.position
          && (mesh.geometry as BufferGeometry).attributes.position.itemSize > 2) {
        const tmpGeom = new Geometry();
        tmpGeom.fromBufferGeometry(mesh.geometry as BufferGeometry);
        combined.merge(tmpGeom, mesh.matrixWorld);
        tmpGeom.dispose();
      }
    } else {
      combined.merge(mesh.geometry as Geometry, mesh.matrixWorld);
    }
  }

  const matrix = new Matrix4();
  matrix.scale(object.scale);
  combined.applyMatrix4(matrix);
  return combined;
}

function getVertices (geometry: Geometry | BufferGeometry): Float32Array {
  if ((geometry as BufferGeometry).isBufferGeometry) {
    geometry = geometry as BufferGeometry;
  } else if ((geometry as PatchedGeometry).toBufferGeometry) {
    geometry = (geometry as PatchedGeometry).toBufferGeometry() as BufferGeometry;
  } else {
    geometry = new BufferGeometry().fromGeometry(geometry as PatchedGeometry);
  }

  const position = geometry.attributes.position;
  const vertices = new Float32Array(position.count * 3);
  for (let i = 0; i < position.count; i += 3) {
    vertices[i] = position.getX(i);
    vertices[i + 1] = position.getY(i);
    vertices[i + 2] = position.getZ(i);
  }
  return vertices;
}

/**
 * Returns a flat array of THREE.Mesh instances from the given object. If
 * nested transformations are found, they are applied to child meshes
 * as mesh.userData.matrix, so that each mesh has its position/rotation/scale
 * independently of all of its parents except the top-level object.
 */
function getMeshes (object: Object3D): Mesh[] {
  const meshes: Mesh[] = [];
  object.traverse(function (o) {
    if ((o as Mesh).isMesh) {
      meshes.push(o as Mesh);
    }
  });
  return meshes;
}
