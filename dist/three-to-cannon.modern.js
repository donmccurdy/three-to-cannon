import{Sphere as e,Box as r,Vec3 as t,ConvexPolyhedron as n,Cylinder as a,Shape as o,Quaternion as i,Trimesh as m}from"cannon-es";import{ConvexHull as u}from"three/examples/jsm/math/ConvexHull.js";import{Box3 as s,Vector3 as l,Mesh as y,Math as f,Geometry as p,Quaternion as d,Matrix4 as c,BufferGeometry as g}from"three";var h=Math.PI/2,x={BOX:"Box",CYLINDER:"Cylinder",SPHERE:"Sphere",HULL:"ConvexPolyhedron",MESH:"Trimesh"};const w=function(l,p){var d;if((p=p||{}).type===x.BOX)return B(l);if(p.type===x.CYLINDER)return function(e,r){var t=["x","y","z"],n=r.cylinderAxis||"y",m=t.splice(t.indexOf(n),1)&&t,u=(new s).setFromObject(e);if(!isFinite(u.min.lengthSq()))return null;var l=u.max[n]-u.min[n],y=.5*Math.max(u.max[m[0]]-u.min[m[0]],u.max[m[1]]-u.min[m[1]]),f=new a(y,y,l,12);return f._type=o.types.CYLINDER,f.radiusTop=y,f.radiusBottom=y,f.height=l,f.numSegments=12,f.orientation=new i,f.orientation.setFromEuler("y"===n?h:0,"z"===n?h:0,0,"XYZ").normalize(),f}(l,p);if(p.type===x.SPHERE)return function(r,t){if(t.sphereRadius)return new e(t.sphereRadius);var n=S(r);return n?(n.computeBoundingSphere(),new e(n.boundingSphere.radius)):null}(l,p);if(p.type===x.HULL)return function(e){var r=S(e);if(!r||!r.vertices.length)return null;for(var a=0;a<r.vertices.length;a++)r.vertices[a].x+=1e-4*(Math.random()-.5),r.vertices[a].y+=1e-4*(Math.random()-.5),r.vertices[a].z+=1e-4*(Math.random()-.5);var o=(new u).setFromObject(new y(r)).faces,i=[],m=[];for(a=0;a<o.length;a++){var s=o[a],l=s.edge;do{var f=l.head().point;i.push(new t(f.x,f.y,f.z)),m.push(new t(s.normal.x,s.normal.y,s.normal.z)),l=l.next}while(l!==s.edge)}return new n({vertices:i,normals:m})}(l);if(p.type===x.MESH)return(d=S(l))?function(e){var r=b(e);if(!r.length)return null;var t=Object.keys(r).map(Number);return new m(r,t)}(d):null;if(p.type)throw new Error('[CANNON.threeToCannon] Invalid type "%s".',p.type);if(!(d=S(l)))return null;switch(d.metadata?d.metadata.type:d.type){case"BoxGeometry":case"BoxBufferGeometry":return v(d);case"CylinderGeometry":case"CylinderBufferGeometry":return function(e){var r=e.metadata?e.metadata.parameters:e.parameters,t=new a(r.radiusTop,r.radiusBottom,r.height,r.radialSegments);return t._type=o.types.CYLINDER,t.radiusTop=r.radiusTop,t.radiusBottom=r.radiusBottom,t.height=r.height,t.numSegments=r.radialSegments,t.orientation=new i,t.orientation.setFromEuler(f.degToRad(90),0,0,"XYZ").normalize(),t}(d);case"PlaneGeometry":case"PlaneBufferGeometry":return function(e){e.computeBoundingBox();var n=e.boundingBox;return new r(new t((n.max.x-n.min.x)/2||.1,(n.max.y-n.min.y)/2||.1,(n.max.z-n.min.z)/2||.1))}(d);case"SphereGeometry":case"SphereBufferGeometry":return function(r){return new e((r.metadata?r.metadata.parameters:r.parameters).radius)}(d);case"TubeGeometry":case"Geometry":case"BufferGeometry":return B(l);default:return console.warn('Unrecognized geometry: "%s". Using bounding box as shape.',d.type),v(d)}};function v(e){if(!b(e).length)return null;e.computeBoundingBox();var n=e.boundingBox;return new r(new t((n.max.x-n.min.x)/2,(n.max.y-n.min.y)/2,(n.max.z-n.min.z)/2))}function B(e){var n=e.clone();n.quaternion.set(0,0,0,1),n.updateMatrixWorld();var a=(new s).setFromObject(n);if(!isFinite(a.min.lengthSq()))return null;var o=new r(new t((a.max.x-a.min.x)/2,(a.max.y-a.min.y)/2,(a.max.z-a.min.z)/2)),i=a.translate(n.position.negate()).getCenter(new l);return i.lengthSq()&&(o.offset=i),o}function S(e){var r,t=function(e){var r=[];return e.traverse(function(e){"Mesh"===e.type&&r.push(e)}),r}(e),n=new p,a=new p;if(0===t.length)return null;if(1===t.length){var o=new l,i=new d,m=new l;return t[0].geometry.isBufferGeometry?t[0].geometry.attributes.position&&t[0].geometry.attributes.position.itemSize>2&&n.fromBufferGeometry(t[0].geometry):n=t[0].geometry.clone(),n.metadata=t[0].geometry.metadata,t[0].updateMatrixWorld(),t[0].matrixWorld.decompose(o,i,m),n.scale(m.x,m.y,m.z)}for(;r=t.pop();)if(r.updateMatrixWorld(),r.geometry.isBufferGeometry){if(r.geometry.attributes.position&&r.geometry.attributes.position.itemSize>2){var u=new p;u.fromBufferGeometry(r.geometry),a.merge(u,r.matrixWorld),u.dispose()}}else a.merge(r.geometry,r.matrixWorld);var s=new c;return s.scale(e.scale),a.applyMatrix(s),a}function b(e){return e.attributes||(e=(new g).fromGeometry(e)),(e.attributes.position||{}).array||[]}w.Type=x;export{w as threeToCannon};
//# sourceMappingURL=three-to-cannon.modern.js.map