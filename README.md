# three-to-cannon

[![Build Status](https://travis-ci.org/donmccurdy/three-to-cannon.svg?branch=master)](https://travis-ci.org/donmccurdy/three-to-cannon)

Convert a THREE.Mesh to a CANNON.Shape, and optional optimizations with simplified shapes.

## Usage

```javascript
npm install --save three-to-cannon
```

```
mesh2shape = require('three-to-cannon');

// Automatic.
var shape = mesh2shape(object3D);

// Bounding box (AABB).
var shape = mesh2shape(object3D, {type: mesh2shape.Type.BOX});

// Bounding sphere.
var shape = mesh2shape(object3D, {type: mesh2shape.Type.SPHERE});

// Cylinder.
var shape = mesh2shape(object3D, {type: mesh2shape.Type.CYLINDER});

// Convex hull.
var shape = mesh2shape(object3D, {type: mesh2shape.Type.HULL});

// Mesh (not recommended).
var shape = mesh2shape(object3D, {type: mesh2shape.Type.MESH});
```
