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
  t.ok( equalsApprox(box.halfExtents.x, 5), 'box.halfExtents.x' );
  t.ok( equalsApprox(box.halfExtents.y, 5), 'box.halfExtents.y' );
  t.ok( equalsApprox(box.halfExtents.z, 5), 'box.halfExtents.z' );
  t.ok( equalsApprox(box.offset.x, 0), 'box.offset.x' );
  t.ok( equalsApprox(box.offset.y, 50), 'box.offset.y' );
  t.ok( equalsApprox(box.offset.z, 0), 'box.offset.z' );
  t.notOk( box.orientation, 'box.orientation' );

  t.end();
});

test('transform - position and scale', function (t) {
  const parent = new THREE.Group();
  const child = new THREE.Mesh(new THREE.BoxGeometry(10, 10, 10));
  const translation = new THREE.Matrix4().makeTranslation(0, 50, 0);
  child.geometry.applyMatrix(translation);
  parent.position.set(100, 0, 0);
  parent.scale.set(100, 100, 50);
  parent.add(child);
  parent.updateMatrixWorld();

  const box = mesh2shape(child);

  t.equal( box.type, ShapeType.BOX, 'box.type' );
  t.ok( equalsApprox(box.halfExtents.x, 500), 'box.halfExtents.x' );
  t.ok( equalsApprox(box.halfExtents.y, 500), 'box.halfExtents.y' );
  t.ok( equalsApprox(box.halfExtents.z, 250), 'box.halfExtents.z' );
  t.ok( equalsApprox(box.offset.x, 0), 'box.offset.x' );
  t.ok( equalsApprox(box.offset.y, 5000), 'box.offset.y' );
  t.ok( equalsApprox(box.offset.z, 0), 'box.offset.z' );

  t.end();
});

test('transform - position and rotation', function (t) {
  const group = new THREE.Group();
  const object = new THREE.Mesh(new THREE.BoxGeometry(10, 10, 10));
  const matrix = new THREE.Matrix4().makeTranslation(0, 50, 0);
  const rotation = new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(0,1,0), Math.PI/2);
  const rotation2 = new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(1,0,0), Math.PI/2);
  group.applyMatrix(rotation);
  object.applyMatrix(rotation2);
  object.geometry.applyMatrix(matrix);
  group.position.set(100, 0, 0);
  group.add(object);
  group.updateMatrixWorld();

  const box = mesh2shape(object);

  t.equal( box.type, ShapeType.BOX, 'box.type' );
  t.ok( equalsApprox(box.halfExtents.x, 5), 'box.halfExtents.x' );
  t.ok( equalsApprox(box.halfExtents.y, 5), 'box.halfExtents.y' );
  t.ok( equalsApprox(box.halfExtents.z, 5), 'box.halfExtents.z' );
  t.ok( equalsApprox(box.offset.x, 0), 'box.offset.x' );
  t.ok( equalsApprox(box.offset.y, 50), 'box.offset.y' );
  t.ok( equalsApprox(box.offset.z, 0), 'box.offset.z' );
  t.notOk( box.orientation, 'box.orientation' );

  t.end();
});
