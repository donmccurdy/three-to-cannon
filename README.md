# three-to-cannon

[![Latest NPM release](https://img.shields.io/npm/v/three-to-cannon.svg)](https://www.npmjs.com/package/three-to-cannon)
[![Minzipped size](https://badgen.net/bundlephobia/minzip/three-to-cannon)](https://bundlephobia.com/result?p=three-to-cannon)
[![License](https://img.shields.io/badge/license-MIT-007ec6.svg)](https://github.com/donmccurdy/three-to-cannon/blob/master/LICENSE)
[![Build Status](https://github.com/donmccurdy/three-to-cannon/workflows/build/badge.svg?branch=master&event=push)](https://github.com/donmccurdy/three-to-cannon/actions?query=workflow%3Abuild)

Convert a THREE.Mesh to a CANNON.Shape, and optional optimizations with simplified shapes.

## Usage

Installation:

```js
npm install --save three-to-cannon
```

Import:

```js
// ES6
import { threeToCannon } from 'three-to-cannon';

// CommonJS
const { threeToCannon } = require('three-to-cannon');
```

Use:

```js
import { threeToCannon, ShapeType } from 'three-to-cannon';

// Automatic.
const shape = threeToCannon(object3D);

// Bounding box (AABB).
const shape = threeToCannon(object3D, {type: ShapeType.BOX});

// Bounding sphere.
const shape = threeToCannon(object3D, {type: ShapeType.SPHERE});

// Cylinder.
const shape = threeToCannon(object3D, {type: ShapeType.CYLINDER});

// Convex hull.
const shape = threeToCannon(object3D, {type: ShapeType.HULL});

// Mesh (not recommended).
const shape = threeToCannon(object3D, {type: ShapeType.MESH});
```
