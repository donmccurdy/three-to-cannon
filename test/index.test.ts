// See: https://github.com/substack/tape/issues/514
// eslint-disable-next-line no-global-assign,@typescript-eslint/no-var-requires
require = require('esm')(module);

import { Box, ConvexPolyhedron, Cylinder, Shape, Sphere, Trimesh } from 'cannon-es';
import * as test from 'tape';
import { BoxBufferGeometry, BufferGeometry, Group, Matrix4, Mesh, Vector3 } from 'three';
import { Geometry } from 'three/examples/jsm/deprecated/Geometry';
import { getShapeParameters, ShapeParameters, ShapeResult, ShapeType, threeToCannon } from '../';

const object = new Mesh(new BoxBufferGeometry(10, 10, 10));

function equalsApprox (a: number, b: number) {
	return Math.abs( a - b ) < 0.0001;
}

test('getShapeParameters - shape - box', function (t) {
	const {type, params} = getShapeParameters(object, {
		type: ShapeType.BOX,
	}) as ShapeParameters<ShapeType.BOX>;

	t.equal( type, ShapeType.BOX, 'type' );
	t.equal( params.x, 5, 'params.x (half extent x)' );
	t.equal( params.y, 5, 'params.y (half extent y)' );
	t.equal( params.z, 5, 'params.z (half extent z)' );

	t.end();
});

test('threeToCannon - shape - box', function (t) {
	const {shape: box} = threeToCannon(object, {
		type: ShapeType.BOX,
	}) as ShapeResult<Box>;

	t.equal( box.type, Shape.types.BOX, 'box.type' );
	t.equal( box.halfExtents.x, 5, 'box.halfExtents.x' );
	t.equal( box.halfExtents.y, 5, 'box.halfExtents.y' );
	t.equal( box.halfExtents.z, 5, 'box.halfExtents.z' );

	t.end();
});

test('getShapeParameters - shape - sphere', function (t) {
	const {type, params} = getShapeParameters(object, {
		type: ShapeType.SPHERE,
	}) as ShapeParameters<ShapeType.SPHERE>;

	t.equal( type, ShapeType.SPHERE, 'type' );
	t.ok( equalsApprox( params.radius, 8.660254 ), 'params.radius' );

	t.end();
});

test('threeToCannon - shape - sphere', function (t) {
	const {shape: sphere} = threeToCannon(object, {
		type: ShapeType.SPHERE,
	}) as ShapeResult<Sphere>;

	t.equal( sphere.type, Shape.types.SPHERE, 'sphere.type' );
	t.ok( equalsApprox( sphere.radius, 8.660254 ), 'sphere.radius' );

	t.end();
});

test('getShapeParameters - shape - cylinder', function (t) {
	const {type, params} = getShapeParameters(object, {
		type: ShapeType.CYLINDER,
	}) as ShapeParameters<ShapeType.CYLINDER>;

	t.equal( type, ShapeType.CYLINDER, 'type' );
	t.equal( params.radiusTop, 5, 'params.radiusTop' );
	t.equal( params.radiusBottom, 5, 'params.radiusBottom' );
	t.equal( params.height, 10, 'params.height' );

	t.end();
});

test('threeToCannon - shape - cylinder', function (t) {
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

test('getShapeParameters - shape - hull', function (t) {
	const {type, params} = getShapeParameters(object, {
		type: ShapeType.HULL,
	}) as ShapeParameters<ShapeType.HULL>;

	t.equal( type, ShapeType.HULL, 'type' );
	t.equal( params.vertices.every((v) => typeof v === 'number'), true, 'params.vertices' )
	t.equal( params.faces.every((f) => f.length === 3), true, 'params.faces' )

	t.end();
});

test('threeToCannon - shape - hull', function (t) {
	const {shape: hull}
		= threeToCannon(object, {type: ShapeType.HULL}) as ShapeResult<ConvexPolyhedron>;

	t.equal( hull.type, Shape.types.CONVEXPOLYHEDRON, 'hull.type' );
	t.equals( hull.boundingSphereRadius.toFixed( 3 ), '8.660', 'hull.boundingSphereRadius' );

	t.end();
});

test('getShapeParameters - shape - mesh', function (t) {
	const {type, params} = getShapeParameters(object, {
		type: ShapeType.MESH
	}) as ShapeParameters<ShapeType.MESH>;

	t.equal( type, ShapeType.MESH, 'type' );
	t.equals( params.vertices.every((v) => typeof v === 'number'), true, 'params.vertices' );
	t.equals( params.indices.every((i) => typeof i === 'number'), true, 'params.indices' );

	t.end();
});


test('threeToCannon - shape - mesh', function (t) {
	const {shape: mesh} = threeToCannon(object, {type: ShapeType.MESH}) as ShapeResult<Trimesh>;

	t.equal( mesh.type, Shape.types.TRIMESH, 'mesh.type' );
	t.equals( mesh.boundingSphereRadius.toFixed( 3 ), '8.660', 'mesh.boundingSphereRadius' );

	t.end();
});

test('threeToCannon - transform - position', function (t) {
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

test('threeToCannon - legacy geometry', function (t) {
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
