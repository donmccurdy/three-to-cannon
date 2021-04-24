import { BufferAttribute, BufferGeometry, Mesh, Object3D, Quaternion, Vector3 } from 'three';
import { BufferGeometryUtils } from 'three/examples/jsm/utils/BufferGeometryUtils';

/******************************************************************************
 * Utils
 */

 const _v1 = new Vector3();
 const _v2 = new Vector3();
 const _q1 = new Quaternion();

 /**
  * Returns a single geometry for the given object. If the object is compound,
  * its geometries are automatically merged. Bake world scale into each
  * geometry, because we can't easily apply that to the cannonjs shapes later.
  */
 export function getGeometry (object: Object3D): BufferGeometry | null {
   const meshes = getMeshes(object);
   if (meshes.length === 0) return null;

   let mesh: Mesh | undefined;
   const geometries: BufferGeometry[] = [];
   while ((mesh = meshes.pop())) {
     const geometry = mergeVertices(mesh.geometry);
     mesh.updateMatrixWorld();
     mesh.matrixWorld.decompose(_v1, _q1, _v2);
     geometries.push(geometry.scale(_v2.x, _v2.y, _v2.z));
   }
   return BufferGeometryUtils.mergeBufferGeometries(geometries);
 }

 export function getVertices (geometry: BufferGeometry): Float32Array {
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

export function getComponent(v: Vector3, component: string) {
    switch(component) {
      case 'x': return v.x;
      case 'y': return v.y;
      case 'z': return v.z;
    }
    throw new Error(`Unexpected component ${component}`);
}


/**
   * Modified version of BufferGeometryUtils.mergeVertices, ignoring vertex
   * attributes other than position.
   *
   * @param {THREE.BufferGeometry} geometry
   * @param {number} tolerance
   * @return {THREE.BufferGeometry>}
   */
export function mergeVertices (geometry: BufferGeometry, tolerance = 1e-4) {

    tolerance = Math.max( tolerance, Number.EPSILON );

    // Generate an index buffer if the geometry doesn't have one, or optimize it
    // if it's already available.
    var hashToIndex: {[key: string]: number} = {};
    var indices = geometry.getIndex();
    var positions = geometry.getAttribute( 'position' );
    var vertexCount = indices ? indices.count : positions.count;

    // Next value for triangle indices.
    var nextIndex = 0;

    var newIndices = [];
    var newPositions = [];

    // Convert the error tolerance to an amount of decimal places to truncate to.
    var decimalShift = Math.log10( 1 / tolerance );
    var shiftMultiplier = Math.pow( 10, decimalShift );

    for ( var i = 0; i < vertexCount; i ++ ) {

      var index = indices ? indices.getX( i ) : i;

      // Generate a hash for the vertex attributes at the current index 'i'.
      var hash = '';

      // Double tilde truncates the decimal value.
      hash += `${ ~ ~ ( positions.getX( index ) * shiftMultiplier ) },`;
      hash += `${ ~ ~ ( positions.getY( index ) * shiftMultiplier ) },`;
      hash += `${ ~ ~ ( positions.getZ( index ) * shiftMultiplier ) },`;

      // Add another reference to the vertex if it's already
      // used by another index.
      if ( hash in hashToIndex ) {

        newIndices.push( hashToIndex[ hash ] );

      } else {

        newPositions.push( positions.getX( index ) );
        newPositions.push( positions.getY( index ) );
        newPositions.push( positions.getZ( index ) );

        hashToIndex[ hash ] = nextIndex;
        newIndices.push( nextIndex );
        nextIndex ++;

      }

    }

    // Construct merged BufferGeometry.

    const positionAttribute = new BufferAttribute(
      new Float32Array( newPositions ),
      positions.itemSize,
      positions.normalized
    );

    const result = new BufferGeometry();
    result.setAttribute( 'position', positionAttribute );
    result.setIndex( newIndices );

    return result;

}
