import { Box, ConvexPolyhedron, Cylinder, Shape, Sphere, Trimesh } from 'cannon-es';
import test from 'ava';
import { BoxGeometry, Group, Matrix4, Mesh } from 'three';
import { getShapeParameters, ShapeParameters, ShapeResult, ShapeType, threeToCannon } from 'three-to-cannon';

const object = new Mesh(new BoxGeometry(10, 10, 10));

function equalsApprox (a: number, b: number) {
	return Math.abs( a - b ) < 0.0001;
}

test('getShapeParameters - shape - box', function (t) {
	const {type, params} = getShapeParameters(object, {
		type: ShapeType.BOX,
	}) as ShapeParameters<ShapeType.BOX>;

	t.is( type, ShapeType.BOX, 'type' );
	t.is( params.x, 5, 'params.x (half extent x)' );
	t.is( params.y, 5, 'params.y (half extent y)' );
	t.is( params.z, 5, 'params.z (half extent z)' );
});

test('threeToCannon - shape - box', function (t) {
	const {shape: box} = threeToCannon(object, {
		type: ShapeType.BOX,
	}) as ShapeResult<Box>;

	t.is( box.type, Shape.types.BOX, 'box.type' );
	t.is( box.halfExtents.x, 5, 'box.halfExtents.x' );
	t.is( box.halfExtents.y, 5, 'box.halfExtents.y' );
	t.is( box.halfExtents.z, 5, 'box.halfExtents.z' );
});

test('getShapeParameters - shape - sphere', function (t) {
	const {type, params} = getShapeParameters(object, {
		type: ShapeType.SPHERE,
	}) as ShapeParameters<ShapeType.SPHERE>;

	t.is( type, ShapeType.SPHERE, 'type' );
	t.true( equalsApprox( params.radius, 8.660254 ), 'params.radius' );
});

test('threeToCannon - shape - sphere', function (t) {
	const {shape: sphere} = threeToCannon(object, {
		type: ShapeType.SPHERE,
	}) as ShapeResult<Sphere>;

	t.is( sphere.type, Shape.types.SPHERE, 'sphere.type' );
	t.true( equalsApprox( sphere.radius, 8.660254 ), 'sphere.radius' );
});

test('getShapeParameters - shape - cylinder', function (t) {
	const {type, params} = getShapeParameters(object, {
		type: ShapeType.CYLINDER,
	}) as ShapeParameters<ShapeType.CYLINDER>;

	t.is( type, ShapeType.CYLINDER, 'type' );
	t.is( params.radiusTop, 5, 'params.radiusTop' );
	t.is( params.radiusBottom, 5, 'params.radiusBottom' );
	t.is( params.height, 10, 'params.height' );
});

test('threeToCannon - shape - cylinder', function (t) {
	const {
		shape: cylinder,
		orientation
	} = threeToCannon(object, {type: ShapeType.CYLINDER}) as ShapeResult<Cylinder>;

	t.is( cylinder.type, Shape.types.CYLINDER, 'cylinder.type' );
	t.is( cylinder.radiusTop, 5, 'cylinder.radiusTop' );
	t.is( cylinder.radiusBottom, 5, 'cylinder.radiusBottom' );
	t.is( cylinder.height, 10, 'cylinder.height' );

	t.true( equalsApprox( orientation!.x, 0.707106 ), 'cylinder.orientation.x' );
	t.true( equalsApprox( orientation!.y, 0 ), 'cylinder.orientation.y' );
	t.true( equalsApprox( orientation!.z, 0 ), 'cylinder.orientation.z' );
	t.true( equalsApprox( orientation!.w, 0.707106 ), 'cylinder.orientation.w' );
});

test('getShapeParameters - shape - hull', function (t) {
	const {type, params} = getShapeParameters(object, {
		type: ShapeType.HULL,
	}) as ShapeParameters<ShapeType.HULL>;

	t.is( type, ShapeType.HULL, 'type' );
	t.is( params.vertices.every((v) => typeof v === 'number'), true, 'params.vertices' )
	t.is( params.faces.every((f) => f.length === 3), true, 'params.faces' )
});

test('threeToCannon - shape - hull', function (t) {
	const {shape: hull}
		= threeToCannon(object, {type: ShapeType.HULL}) as ShapeResult<ConvexPolyhedron>;

	t.is( hull.type, Shape.types.CONVEXPOLYHEDRON, 'hull.type' );
	t.is( hull.boundingSphereRadius.toFixed( 3 ), '8.660', 'hull.boundingSphereRadius' );
});

test('getShapeParameters - shape - mesh', function (t) {
	const {type, params} = getShapeParameters(object, {
		type: ShapeType.MESH
	}) as ShapeParameters<ShapeType.MESH>;

	t.is( type, ShapeType.MESH, 'type' );
	t.is( params.vertices.every((v) => typeof v === 'number'), true, 'params.vertices' );
	t.is( params.indices.every((i) => typeof i === 'number'), true, 'params.indices' );
});


test('threeToCannon - shape - mesh', function (t) {
	const {shape: mesh} = threeToCannon(object, {type: ShapeType.MESH}) as ShapeResult<Trimesh>;

	t.is( mesh.type, Shape.types.TRIMESH, 'mesh.type' );
	t.is( mesh.boundingSphereRadius.toFixed( 3 ), '8.660', 'mesh.boundingSphereRadius' );
});

test('threeToCannon - transform - position', function (t) {
	const group = new Group();
	const object = new Mesh(new BoxGeometry(10, 10, 10));
	const matrix = new Matrix4().makeTranslation(0, 50, 0);
	object.geometry.applyMatrix4(matrix);
	group.position.set(100, 0, 0);
	group.add(object);
	group.updateMatrixWorld();

	const {shape: box, offset, orientation} = threeToCannon(
		object, {type: ShapeType.BOX}
	) as ShapeResult<Box>;

	t.is( box.type, Shape.types.BOX, 'box.type' );
	t.is( box.halfExtents.x, 5, 'box.halfExtents.x' );
	t.is( box.halfExtents.y, 5, 'box.halfExtents.y' );
	t.is( box.halfExtents.z, 5, 'box.halfExtents.z' );

	t.is( offset?.x, 0, 'box.offset.x' );
	t.is( offset?.y, 50, 'box.offset.y' );
	t.is( offset?.z, 0, 'box.offset.z' );
	t.is( orientation, undefined, 'box.orientation' );
});
