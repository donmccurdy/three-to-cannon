# Changelog

## v4

- Removed dependency on deprecated THREE.Geometry, which was removed in three.js >r125.
- Converted the project to TypeScript.
- Moved type enum from `threeToCannon.Type` to top-level `ShapeType` export.
- Optional `.offset` and `.quaternion` properties are returned with the Shape, not attached to it:

```js
// Before:
const shape = threeToCannon(object);
shape.offset; // → CANNON.Vec3 | undefined
shape.quaternion; // → CANNON.Quaternion | undefined

// After:
const {shape, offset, quaternion} = threeToCannon(object);
```

## v3

...
