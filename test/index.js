const test = require('tape');
const THREE = global.THREE = require('three');
const mesh2shape = require('../');

const ShapeType = {
  BOX: 4,
  SPHERE: 1,
  CYLINDER: 16,
  HULL: 16, // :/
  MESH: 256
};

const object = new THREE.Mesh(new THREE.BoxGeometry(10, 10, 10));

function equalsApprox ( a, b ) {
  return Math.abs( a - b ) < 0.0001;
}

test('shape - box', function (t) {
  var box = mesh2shape(object, {type: mesh2shape.Type.BOX});

  t.equal( box.type, ShapeType.BOX, 'box.type' );
  t.equal( box.halfExtents.x, 5, 'box.halfExtents.x' );
  t.equal( box.halfExtents.y, 5, 'box.halfExtents.y' );
  t.equal( box.halfExtents.z, 5, 'box.halfExtents.z' );

  t.end();
});

test('shape - sphere', function (t) {
  const sphere = mesh2shape(object, {type: mesh2shape.Type.SPHERE});

  t.equal( sphere.type, ShapeType.SPHERE, 'sphere.type' );
  t.ok( equalsApprox( sphere.radius, 8.660254 ), 'sphere.radius' );

  t.end();
});

test('shape - cylinder', function (t) {
  const cylinder = mesh2shape(object, {type: mesh2shape.Type.CYLINDER});

  t.equal( cylinder.type, ShapeType.CYLINDER, 'cylinder.type' );
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
  const hull = mesh2shape(object, {type: mesh2shape.Type.HULL});

  t.equal( hull.type, ShapeType.HULL, 'hull.type' );

  t.end();
});

test('shape - mesh', function (t) {
  const mesh = mesh2shape(object, {type: mesh2shape.Type.MESH});

  t.equal( mesh.type, ShapeType.MESH, 'mesh.type' );

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

  const box = mesh2shape(object);

  t.equal( box.type, ShapeType.BOX, 'box.type' );
  t.equal( box.halfExtents.x, 5, 'box.halfExtents.x' );
  t.equal( box.halfExtents.y, 5, 'box.halfExtents.y' );
  t.equal( box.halfExtents.z, 5, 'box.halfExtents.z' );
  t.equal( box.offset.x, 0, 'box.offset.x' );
  t.equal( box.offset.y, 50, 'box.offset.y' );
  t.equal( box.offset.z, 0, 'box.offset.z' );
  t.notOk( box.orientation, 'box.orientation' );

  t.end();
});

