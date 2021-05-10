// See: https://github.com/substack/tape/issues/514
// eslint-disable-next-line no-global-assign,@typescript-eslint/no-var-requires
require = require('esm')(module);

import { Box, ConvexPolyhedron, Cylinder, Shape, Sphere, Trimesh } from 'cannon-es';
import * as test from 'tape';
import { BoxBufferGeometry, BufferGeometry, Group, Matrix4, Mesh, Vector3 } from 'three';
import { Geometry } from 'three/examples/jsm/deprecated/Geometry';
import { ShapeResult, ShapeType, threeToCannon } from '../';

const object = new Mesh(new BoxBufferGeometry(10, 10, 10));

function equalsApprox (a: number, b: number) {
	return Math.abs( a - b ) < 0.0001;
}

test('shape - box', function (t) {
	const {shape: box} = threeToCannon(object, {type: ShapeType.BOX}) as ShapeResult<Box>;

	t.equal( box.type, Shape.types.BOX, 'box.type' );
	t.equal( box.halfExtents.x, 5, 'box.halfExtents.x' );
	t.equal( box.halfExtents.y, 5, 'box.halfExtents.y' );
	t.equal( box.halfExtents.z, 5, 'box.halfExtents.z' );

	t.end();
});

test('shape - sphere', function (t) {
	const {shape: sphere} = threeToCannon(object, {type: ShapeType.SPHERE}) as ShapeResult<Sphere>;

	t.equal( sphere.type, Shape.types.SPHERE, 'sphere.type' );
	t.ok( equalsApprox( sphere.radius, 8.660254 ), 'sphere.radius' );

	t.end();
});

test('shape - cylinder', function (t) {
	const {
		shape: cylinder,
		orientation
	} = threeToCannon(object, {type: ShapeType.CYLINDER}) as ShapeResult<Cylinder>;

	t.equal( cylinder.type, Shape.types.CYLINDER, 'cylinder.type' );
	t.equal( cylinder.radiusTop, 5, 'cylinder.radiusTop' );
	t.equal( cylinder.radiusBottom, 5, 'cylinder.radiusBottom' );
	t.equal( cylinder.height, 10, 'cylinder.height' );

	t.ok( equalsApprox( orientation!.x, 0.707106 ), 'cylinder.orientation.x' );
	t.ok( equalsApprox( orientation!.y, 0 ), 'cylinder.orientation.y' );
	t.ok( equalsApprox( orientation!.z, 0 ), 'cylinder.orientation.z' );
	t.ok( equalsApprox( orientation!.w, 0.707106 ), 'cylinder.orientation.w' );

	t.end();
});

test('shape - hull', function (t) {
	const {shape: hull}
		= threeToCannon(object, {type: ShapeType.HULL}) as ShapeResult<ConvexPolyhedron>;

	t.equal( hull.type, Shape.types.CONVEXPOLYHEDRON, 'hull.type' );
	t.equals( hull.boundingSphereRadius.toFixed( 3 ), '8.660', 'hull.boundingSphereRadius' );

	t.end();
});

test('shape - mesh', function (t) {
	const {shape: mesh} = threeToCannon(object, {type: ShapeType.MESH}) as ShapeResult<Trimesh>;

	t.equal( mesh.type, Shape.types.TRIMESH, 'mesh.type' );
	t.equals( mesh.boundingSphereRadius.toFixed( 3 ), '8.660', 'mesh.boundingSphereRadius' );

	t.end();
});

test('transform - position', function (t) {
	const group = new Group();
	const object = new Mesh(new BoxBufferGeometry(10, 10, 10));
	const matrix = new Matrix4().makeTranslation(0, 50, 0);
	object.geometry.applyMatrix4(matrix);
	group.position.set(100, 0, 0);
	group.add(object);
	group.updateMatrixWorld();

	const {shape: box, offset, orientation} = threeToCannon(object) as ShapeResult<Box>;

	t.equal( box.type, Shape.types.BOX, 'box.type' );
	t.equal( box.halfExtents.x, 5, 'box.halfExtents.x' );
	t.equal( box.halfExtents.y, 5, 'box.halfExtents.y' );
	t.equal( box.halfExtents.z, 5, 'box.halfExtents.z' );

	t.equal( offset!.x, 0, 'box.offset.x' );
	t.equal( offset!.y, 50, 'box.offset.y' );
	t.equal( offset!.z, 0, 'box.offset.z' );
	t.notOk( orientation, 'box.orientation' );

	t.end();
});

test('legacy geometry', function (t) {
	const geometry = new Geometry();
	geometry.vertices.push(
		new Vector3(2, 2, 2),
		new Vector3(0, 0, 0),
		new Vector3(-2, -2, -2),
	);
	const mesh = new Mesh(geometry as unknown as BufferGeometry);

	const {shape: box} = threeToCannon(mesh, {type: ShapeType.BOX}) as ShapeResult<Box>;

	t.equal( box.type, Shape.types.BOX, 'box.type' );
	t.equal( box.halfExtents.x, 2, 'box.halfExtents.x' );
	t.equal( box.halfExtents.y, 2, 'box.halfExtents.y' );
	t.equal( box.halfExtents.z, 2, 'box.halfExtents.z' );

	t.end();
});
