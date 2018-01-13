const assert = require('assert');
const THREE = global.THREE = require('three');
const mesh2shape = require('../');

function equalsApprox ( a, b ) {
  return Math.abs( a - b ) < 0.0001;
}

var ShapeType = {
  BOX: 4,
  SPHERE: 1,
  CYLINDER: 16,
  HULL: 16, // :/
  MESH: 256
};

var object = new THREE.Mesh(new THREE.BoxGeometry(10, 10, 10));


var box = mesh2shape(object, {type: mesh2shape.Type.BOX});
assert( box.type === ShapeType.BOX, 'box.type' );
assert( box.halfExtents.x === 5, 'box.halfExtents.x' );
assert( box.halfExtents.y === 5, 'box.halfExtents.y' );
assert( box.halfExtents.z === 5, 'box.halfExtents.z' );

var sphere = mesh2shape(object, {type: mesh2shape.Type.SPHERE});
assert( sphere.type === ShapeType.SPHERE, 'sphere.type' );
assert( equalsApprox( sphere.radius, 8.660254 ), 'sphere.radius' );

var cylinder = mesh2shape(object, {type: mesh2shape.Type.CYLINDER});
assert( cylinder.type === ShapeType.CYLINDER, 'cylinder.type' );
assert( cylinder.radiusTop === 5, 'cylinder.radiusTop' );
assert( cylinder.radiusBottom === 5, 'cylinder.radiusBottom' );
assert( cylinder.height === 10, 'cylinder.height' );
assert( equalsApprox( cylinder.orientation.x, 0.707106 ), 'cylinder.orientation.x' );
assert( equalsApprox( cylinder.orientation.y, 0 ), 'cylinder.orientation.y' );
assert( equalsApprox( cylinder.orientation.z, 0 ), 'cylinder.orientation.z' );
assert( equalsApprox( cylinder.orientation.w, 0.707106 ), 'cylinder.orientation.w' );

var hull = mesh2shape(object, {type: mesh2shape.Type.HULL});
assert( hull.type === ShapeType.HULL, 'hull.type' );

var mesh = mesh2shape(object, {type: mesh2shape.Type.MESH});
assert( mesh.type === ShapeType.MESH, 'mesh.type' );

console.log('Passed.');
