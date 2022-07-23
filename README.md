# three-to-cannon

[![Latest NPM release](https://img.shields.io/npm/v/three-to-cannon.svg)](https://www.npmjs.com/package/three-to-cannon)
[![Minzipped size](https://badgen.net/bundlephobia/minzip/three-to-cannon)](https://bundlephobia.com/result?p=three-to-cannon)
[![License](https://img.shields.io/badge/license-MIT-007ec6.svg)](https://github.com/donmccurdy/three-to-cannon/blob/master/LICENSE)
[![Build Status](https://github.com/donmccurdy/three-to-cannon/workflows/build/badge.svg?branch=main&event=push)](https://github.com/donmccurdy/three-to-cannon/actions?query=workflow%3Abuild)
[![Coverage](https://codecov.io/gh/donmccurdy/three-to-cannon/branch/main/graph/badge.svg?token=S30LCC3L04)](https://codecov.io/gh/donmccurdy/three-to-cannon)

Convert a [THREE.Mesh](https://threejs.org/docs/?q=mesh#api/en/objects/Mesh) or [THREE.Object3D](https://threejs.org/docs/?q=object3d#api/en/core/Object3D) to a [CANNON.Shape](https://pmndrs.github.io/cannon-es/docs/classes/Shape.html), with optimizations to simplified bounding shapes (AABB, sphere, etc.).

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

// Automatic (Usually an AABB, except obvious cases like THREE.SphereGeometry).
const result = threeToCannon(object3D);

// Bounding box (AABB).
const result = threeToCannon(object3D, {type: ShapeType.BOX});

// Bounding sphere.
const result = threeToCannon(object3D, {type: ShapeType.SPHERE});

// Cylinder.
const result = threeToCannon(object3D, {type: ShapeType.CYLINDER});

// Convex hull. 
const result = threeToCannon(object3D, {type: ShapeType.HULL});

// Mesh (Not recommended — limitations: https://github.com/pmndrs/cannon-es/issues/21).
const result = threeToCannon(object3D, {type: ShapeType.MESH});

/****************************************
 * Using the result:
 */

// Result object includes a CANNON.Shape instance, and (optional)
// an offset or quaternion for that shape.
const {shape, offset, quaternion} = result;

// Add the shape to a CANNON.Body.
body.addShape(shape, offset, orientation);
```

See further documentation on the [CANNON.Shape](https://pmndrs.github.io/cannon-es/docs/classes/Shape.html) class.
