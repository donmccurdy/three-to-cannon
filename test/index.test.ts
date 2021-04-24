// See: https://github.com/substack/tape/issues/514
// eslint-disable-next-line no-global-assign,@typescript-eslint/no-var-requires
require = require('esm')(module);

import { Box, ConvexPolyhedron, Cylinder, Quaternion, Shape, Sphere, Trimesh } from 'cannon-es';
import * as test from 'tape';
import * as THREE from 'three';
import { Type, threeToCannon } from '../';

const object = new THREE.Mesh(new THREE.BoxGeometry(10, 10, 10));

function equalsApprox ( a: number, b: number ) {
	return Math.abs( a - b ) < 0.0001;
}

interface PatchedShape {
	// TODO these should be from the same package...
	orientation: Quaternion;
	offset: THREE.Vector3;
}

test('shape - box', function (t) {
	const box = threeToCannon(object, {type: Type.BOX}) as Box;

	t.equal( box.type, Shape.types.BOX, 'box.type' );
	t.equal( box.halfExtents.x, 5, 'box.halfExtents.x' );
	t.equal( box.halfExtents.y, 5, 'box.halfExtents.y' );
	t.equal( box.halfExtents.z, 5, 'box.halfExtents.z' );

	t.end();
});

test('shape - sphere', function (t) {
	const sphere = threeToCannon(object, {type: Type.SPHERE}) as Sphere;

	t.equal( sphere.type, Shape.types.SPHERE, 'sphere.type' );
	t.ok( equalsApprox( sphere.radius, 8.660254 ), 'sphere.radius' );

	t.end();
});

test('shape - cylinder', function (t) {
	const cylinder = threeToCannon(object, {type: Type.CYLINDER}) as Cylinder;

	t.equal( cylinder.type, Shape.types.CYLINDER, 'cylinder.type' );
	t.equal( cylinder.radiusTop, 5, 'cylinder.radiusTop' );
	t.equal( cylinder.radiusBottom, 5, 'cylinder.radiusBottom' );
	t.equal( cylinder.height, 10, 'cylinder.height' );

	const orientation = (cylinder as unknown as PatchedShape).orientation;
	t.ok( equalsApprox( orientation.x, 0.707106 ), 'cylinder.orientation.x' );
	t.ok( equalsApprox( orientation.y, 0 ), 'cylinder.orientation.y' );
	t.ok( equalsApprox( orientation.z, 0 ), 'cylinder.orientation.z' );
	t.ok( equalsApprox( orientation.w, 0.707106 ), 'cylinder.orientation.w' );

	t.end();
});

test('shape - hull', function (t) {
	const hull = threeToCannon(object, {type: Type.HULL}) as ConvexPolyhedron;

	t.equal( hull.type, Shape.types.CONVEXPOLYHEDRON, 'hull.type' );
	t.equals( hull.boundingSphereRadius.toFixed( 3 ), '8.660', 'hull.boundingSphereRadius' );

	t.end();
});

test('shape - mesh', function (t) {
	const mesh = threeToCannon(object, {type: Type.MESH}) as Trimesh;

	t.equal( mesh.type, Shape.types.TRIMESH, 'mesh.type' );
	t.equals( mesh.boundingSphereRadius.toFixed( 3 ), '8.660', 'mesh.boundingSphereRadius' );

	t.end();
});

test('transform - position', function (t) {
	const group = new THREE.Group();
	const object = new THREE.Mesh(new THREE.BoxGeometry(10, 10, 10));
	const matrix = new THREE.Matrix4().makeTranslation(0, 50, 0);
	object.geometry.applyMatrix4(matrix);
	group.position.set(100, 0, 0);
	group.add(object);
	group.updateMatrixWorld();

	const box = threeToCannon(object) as Box;

	t.equal( box.type, Shape.types.BOX, 'box.type' );
	t.equal( box.halfExtents.x, 5, 'box.halfExtents.x' );
	t.equal( box.halfExtents.y, 5, 'box.halfExtents.y' );
	t.equal( box.halfExtents.z, 5, 'box.halfExtents.z' );

	const offset = (box as unknown as PatchedShape).offset;
	const orientation = (box as unknown as PatchedShape).orientation;
	t.equal( offset.x, 0, 'box.offset.x' );
	t.equal( offset.y, 50, 'box.offset.y' );
	t.equal( offset.z, 0, 'box.offset.z' );
	t.notOk( orientation, 'box.orientation' );

	t.end();
});

