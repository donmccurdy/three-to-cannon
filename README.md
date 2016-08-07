# three-to-cannon

Convert a THREE.Mesh to a CANNON.Shape, and optional optimizations with simplified shapes.

## Usage

```javascript
npm install --save three-to-cannon
```

```
mesh2shape = require('three-to-cannon');

// Automatic.
var shape = mesh2shape(object3D);

// Convex hull.
var shape = mesh2shape(object3D, {type: mesh2shape.HULL});

// Bounding box (AABB).
var shape = mesh2shape(object3D, {type: mesh2shape.BOX});
```
