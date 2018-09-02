# three-to-cannon

[![Build Status](https://travis-ci.org/donmccurdy/three-to-cannon.svg?branch=master)](https://travis-ci.org/donmccurdy/three-to-cannon)

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
threeToCannon = require('three-to-cannon').threeToCannon;
```

Use:

```js
// Automatic.
const shape = threeToCannon(object3D);

// Bounding box (AABB).
const shape = threeToCannon(object3D, {type: threeToCannon.Type.BOX});

// Bounding sphere.
const shape = threeToCannon(object3D, {type: threeToCannon.Type.SPHERE});

// Cylinder.
const shape = threeToCannon(object3D, {type: threeToCannon.Type.CYLINDER});

// Convex hull.
const shape = threeToCannon(object3D, {type: threeToCannon.Type.HULL});

// Mesh (not recommended).
const shape = threeToCannon(object3D, {type: threeToCannon.Type.MESH});
```
