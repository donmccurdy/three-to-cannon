// See: https://github.com/substack/tape/issues/514
require = require('esm')(module);

// See: https://github.com/react-spring/cannon-es/issues/23
const {performance} = require('perf_hooks');
global.performance = performance;

const test = require('tape');
const THREE = global.THREE = require('three');
const { Shape } = require('cannon-es');
const { threeToCannon, Type } = require('../');

const object = new THREE.Mesh(new THREE.BoxGeometry(10, 10, 10));

function equalsApprox ( a, b ) {
  return Math.abs( a - b ) < 0.0001;
}

test('shape - box', function (t) {
  var box = threeToCannon(object, {type: Type.BOX});

  t.equal( box.type, Shape.types.BOX, 'box.type' );
  t.equal( box.halfExtents.x, 5, 'box.halfExtents.x' );
  t.equal( box.halfExtents.y, 5, 'box.halfExtents.y' );
  t.equal( box.halfExtents.z, 5, 'box.halfExtents.z' );

  t.end();
});

test('shape - sphere', function (t) {
  const sphere = threeToCannon(object, {type: Type.SPHERE});

  t.equal( sphere.type, Shape.types.SPHERE, 'sphere.type' );
  t.ok( equalsApprox( sphere.radius, 8.660254 ), 'sphere.radius' );

  t.end();
});

test('shape - cylinder', function (t) {
  const cylinder = threeToCannon(object, {type: Type.CYLINDER});

  t.equal( cylinder.type, Shape.types.CYLINDER, 'cylinder.type' );
  t.equal( cylinder.radiusTop, 5, 'cylinder.radiusTop' );
  t.equal( cylinder.radiusBottom, 5, 'cylinder.radiusBottom' );
  t.equal( cylinder.height, 10, 'cylinder.height' );
  t.ok( equalsApprox( cylinder.orientation.x, 0.707106 ), 'cylinder.orientation.x' );
  t.ok( equalsApprox( cylinder.orientation.y, 0 ), 'cylinder.orientation.y' );
  t.ok( equalsApprox( cylinder.orientation.z, 0 ), 'cylinder.orientation.z' );
  t.ok( equalsApprox( cylinder.orientation.w, 0.707106 ), 'cylinder.orientation.w' );

  t.end();
});

test('shape - hull', function (t) {
  const hull = threeToCannon(object, {type: Type.HULL});

  t.equal( hull.type, Shape.types.CONVEXPOLYHEDRON, 'hull.type' );
  t.equals( hull.boundingSphereRadius.toFixed( 3 ), '8.660', 'hull.boundingSphereRadius' );

  t.end();
});

test('shape - mesh', function (t) {
  const mesh = threeToCannon(object, {type: Type.MESH});

  t.equal( mesh.type, Shape.types.TRIMESH, 'mesh.type' );
  t.equals( mesh.boundingSphereRadius.toFixed( 3 ), '8.660', 'mesh.boundingSphereRadius' );

  t.end();
});

test('transform - position', function (t) {
  const group = new THREE.Group();
  const object = new THREE.Mesh(new THREE.BoxGeometry(10, 10, 10));
  const matrix = new THREE.Matrix4().makeTranslation(0, 50, 0);
  object.geometry.applyMatrix(matrix);
  group.position.set(100, 0, 0);
  group.add(object);
  group.updateMatrixWorld();

  const box = threeToCannon(object);

  t.equal( box.type, Shape.types.BOX, 'box.type' );
  t.equal( box.halfExtents.x, 5, 'box.halfExtents.x' );
  t.equal( box.halfExtents.y, 5, 'box.halfExtents.y' );
  t.equal( box.halfExtents.z, 5, 'box.halfExtents.z' );
  t.equal( box.offset.x, 0, 'box.offset.x' );
  t.equal( box.offset.y, 50, 'box.offset.y' );
  t.equal( box.offset.z, 0, 'box.offset.z' );
  t.notOk( box.orientation, 'box.orientation' );

  t.end();
});

