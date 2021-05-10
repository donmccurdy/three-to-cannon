# three-to-cannon

[![Latest NPM release](https://img.shields.io/npm/v/three-to-cannon.svg)](https://www.npmjs.com/package/three-to-cannon)
[![Minzipped size](https://badgen.net/bundlephobia/minzip/three-to-cannon)](https://bundlephobia.com/result?p=three-to-cannon)
[![License](https://img.shields.io/badge/license-MIT-007ec6.svg)](https://github.com/donmccurdy/three-to-cannon/blob/master/LICENSE)
[![Build Status](https://github.com/donmccurdy/three-to-cannon/workflows/build/badge.svg?branch=master&event=push)](https://github.com/donmccurdy/three-to-cannon/actions?query=workflow%3Abuild)

Convert a [THREE.Mesh](https://threejs.org/docs/?q=mesh#api/en/objects/Mesh) or [THREE.Object3D](https://threejs.org/docs/?q=object3d#api/en/core/Object3D) to a [CANNON.Shape](https://pmndrs.github.io/cannon-es/docs/classes/shape.html), with optimizations to simplified bounding shapes (AABB, sphere, etc.).

## API

Installation:

```js
npm install --save three-to-cannon
```

Use:

```js
/****************************************
 * Import:
 */

// ES6
import { threeToCannon, ShapeType } from 'three-to-cannon';

// CommonJS
const { threeToCannon, ShapeType } = require('three-to-cannon');

/****************************************
 * Generate a CANNON.Shape:
 */

// Automatic.
const result = threeToCannon(object3D);

// Bounding box (AABB).
const result = threeToCannon(object3D, {type: ShapeType.BOX});

// Bounding sphere.
const result = threeToCannon(object3D, {type: ShapeType.SPHERE});

// Cylinder.
const result = threeToCannon(object3D, {type: ShapeType.CYLINDER});

// Convex hull.
const result = threeToCannon(object3D, {type: ShapeType.HULL});

// Mesh (not recommended).
const result = threeToCannon(object3D, {type: ShapeType.MESH});

/****************************************
 * Using the result:
 */

// Result object includes a CANNON.Shape instance, and (optional)
// an offset or quaternion for that shape.
const {shape, offset, quaternion} = result;
```

See further documentation on the [CANNON.Shape](https://pmndrs.github.io/cannon-es/docs/classes/shape.html) class.