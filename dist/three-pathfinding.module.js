import{Box as e,ConvexPolyhedron as t,Cylinder as r,Shape as n,Sphere as o,Quaternion as i,Trimesh as s,Vec3 as a}from"cannon-es";var u=function(){var e,t,r,n,o,i,s,a,u,c,m,f,l,d,p,x,E,y,g,h=[],v=[],w=0,b=function(){var e=new THREE.Vector3,t=new THREE.Vector3,r=new THREE.Vector3;return function(n,o,i){return e.subVectors(i,n),t.subVectors(o,n),r.crossVectors(e,t),r.normalize()}}();function T(e,t){if(void 0!==e.normal)return e.normal;var r=t[e[0]],n=t[e[2]];return m.subVectors(t[e[1]],r),f.subVectors(n,r),p.crossVectors(f,m),p.normalize(),e.normal=p.clone()}function R(e,t,r){var n=r[e[0]],o=[],i=T(e,r);t.sort(function(e,t){return o[e.x/3]=void 0!==o[e.x/3]?o[e.x/3]:i.dot(l.subVectors(e,n)),o[t.x/3]=void 0!==o[t.x/3]?o[t.x/3]:i.dot(d.subVectors(t,n)),o[e.x/3]-o[t.x/3]});var s=t.length;for(1===s&&(o[t[0].x/3]=i.dot(l.subVectors(t[0],n)));s-- >0&&o[t[s].x/3]>0;);s+1<t.length&&o[t[s+1].x/3]>0&&(e.visiblePoints=t.splice(s+1))}function V(e,t){for(var r,n=h.length,o=[e],i=t.indexOf(e.visiblePoints.pop());n-- >0;)(r=h[n])!==e&&T(r,t).dot(x.subVectors(t[i],t[r[0]]))>0&&o.push(r);var s,a,u,c,m=n=o.length,f=1===n,l=[],d=0,p=[];if(1===o.length)l=[(r=o[0])[0],r[1],r[1],r[2],r[2],r[0]],v.indexOf(r)>-1&&v.splice(v.indexOf(r),1),r.visiblePoints&&(p=p.concat(r.visiblePoints)),h.splice(h.indexOf(r),1);else for(;n-- >0;){var E;for(v.indexOf(r=o[n])>-1&&v.splice(v.indexOf(r),1),r.visiblePoints&&(p=p.concat(r.visiblePoints)),h.splice(h.indexOf(r),1),cEdgeIndex=0;cEdgeIndex<3;){for(E=!1,m=o.length,u=r[cEdgeIndex],c=r[(cEdgeIndex+1)%3];m-- >0&&!E;)if(d=0,(s=o[m])!==r)for(;d<3&&!E;)a=d+1,E=s[d]===u&&s[a%3]===c||s[d]===c&&s[a%3]===u,d++;E&&!f||(l.push(u),l.push(c)),cEdgeIndex++}}n=0;for(var y,g=l.length/2;n<g;)R(y=[l[2*n+1],i,l[2*n]],p,t),h.push(y),void 0!==y.visiblePoints&&v.push(y),n++}var H=function(){var e=new THREE.Vector3,t=new THREE.Vector3,r=new THREE.Vector3;return function(n,o,i){e.subVectors(o,n),t.subVectors(i,n),r.subVectors(i,o);var s=t.dot(e);if(s<0)return t.dot(t);var a=e.dot(e);return s>=a?r.dot(r):t.dot(t)-s*s/a}}();return function(T){for(m=new THREE.Vector3,f=new THREE.Vector3,new THREE.Vector3,l=new THREE.Vector3,d=new THREE.Vector3,p=new THREE.Vector3,x=new THREE.Vector3,E=new THREE.Vector3,y=new THREE.Vector3,g=new THREE.Vector3,points=T.vertices,h=[],v=[],P=e=points.length,t=points.slice(0,6),w=0;P-- >0;)points[P].x<t[0].x&&(t[0]=points[P]),points[P].x>t[1].x&&(t[1]=points[P]),points[P].y<t[2].y&&(t[2]=points[P]),points[P].y<t[3].y&&(t[3]=points[P]),points[P].z<t[4].z&&(t[4]=points[P]),points[P].z<t[5].z&&(t[5]=points[P]);for(n=P=6;P-- >0;)for(n=P-1;n-- >0;)w<(r=t[P].distanceToSquared(t[n]))&&(w=r,o=t[P],i=t[n]);for(P=6,w=0;P-- >0;)r=H(o,i,t[P]),w<r&&(w=r,s=t[P]);for(u=b(o,i,s),c=u.dot(o),w=0,P=e;P-- >0;)r=Math.abs(points[P].dot(u)-c),w<r&&(w=r,a=points[P]);var B=points.indexOf(o),z=points.indexOf(i),O=points.indexOf(s),G=points.indexOf(a),S=[[O,z,B],[z,G,B],[O,G,z],[B,G,O]];E.subVectors(i,o).normalize(),y.subVectors(s,o).normalize(),g.subVectors(a,o).normalize(),g.dot((new THREE.Vector3).crossVectors(y,E))<0&&(S[0].reverse(),S[1].reverse(),S[2].reverse(),S[3].reverse());var M=points.slice();M.splice(M.indexOf(o),1),M.splice(M.indexOf(i),1),M.splice(M.indexOf(s),1),M.splice(M.indexOf(a),1);for(var P=S.length;P-- >0;)R(S[P],M,points),void 0!==S[P].visiblePoints&&v.push(S[P]),h.push(S[P]);!function(e){for(;v.length>0;)V(v.shift(),e)}(points);for(var C=h.length;C-- >0;)T.faces[C]=new THREE.Face3(h[C][2],h[C][1],h[C][0],h[C].normal);return T.normalsNeedUpdate=!0,T}}(),c=Math.PI/2,m={BOX:"Box",CYLINDER:"Cylinder",SPHERE:"Sphere",HULL:"ConvexPolyhedron",MESH:"Trimesh"},f=function(f,E){var y;if((E=E||{}).type===m.BOX)return d(f);if(E.type===m.CYLINDER)return function(e,t){var o,s,a,u=new THREE.Box3,m=["x","y","z"],f=t.cylinderAxis||"y",l=m.splice(m.indexOf(f),1)&&m;return u.setFromObject(e),isFinite(u.min.lengthSq())?(s=u.max[f]-u.min[f],a=.5*Math.max(u.max[l[0]]-u.min[l[0]],u.max[l[1]]-u.min[l[1]]),(o=new r(a,a,s,12))._type=n.types.CYLINDER,o.radiusTop=a,o.radiusBottom=a,o.height=s,o.numSegments=12,o.orientation=new i,o.orientation.setFromEuler("y"===f?c:0,"z"===f?c:0,0,"XYZ").normalize(),o):null}(f,E);if(E.type===m.SPHERE)return function(e,t){if(t.sphereRadius)return new o(t.sphereRadius);var r=p(e);return r?(r.computeBoundingSphere(),new o(r.boundingSphere.radius)):null}(f,E);if(E.type===m.HULL)return function(e){var r,n,o,i,s=p(e);if(!s||!s.vertices.length)return null;for(r=0;r<s.vertices.length;r++)s.vertices[r].x+=1e-4*(Math.random()-.5),s.vertices[r].y+=1e-4*(Math.random()-.5),s.vertices[r].z+=1e-4*(Math.random()-.5);for(i=u(s),n=new Array(i.vertices.length),r=0;r<i.vertices.length;r++)n[r]=new a(i.vertices[r].x,i.vertices[r].y,i.vertices[r].z);for(o=new Array(i.faces.length),r=0;r<i.faces.length;r++)o[r]=[i.faces[r].a,i.faces[r].b,i.faces[r].c];return new t(n,o)}(f);if(E.type===m.MESH)return(y=p(f))?function(e){var t,r=x(e);return r.length?(t=Object.keys(r).map(Number),new s(r,t)):null}(y):null;if(E.type)throw new Error('[CANNON.threeToCannon] Invalid type "%s".',E.type);if(!(y=p(f)))return null;switch(y.metadata?y.metadata.type:y.type){case"BoxGeometry":case"BoxBufferGeometry":return l(y);case"CylinderGeometry":case"CylinderBufferGeometry":return function(e){var t,o=e.metadata?e.metadata.parameters:e.parameters;return(t=new r(o.radiusTop,o.radiusBottom,o.height,o.radialSegments))._type=n.types.CYLINDER,t.radiusTop=o.radiusTop,t.radiusBottom=o.radiusBottom,t.height=o.height,t.numSegments=o.radialSegments,t.orientation=new i,t.orientation.setFromEuler(THREE.Math.degToRad(90),0,0,"XYZ").normalize(),t}(y);case"PlaneGeometry":case"PlaneBufferGeometry":return function(t){t.computeBoundingBox();var r=t.boundingBox;return new e(new a((r.max.x-r.min.x)/2||.1,(r.max.y-r.min.y)/2||.1,(r.max.z-r.min.z)/2||.1))}(y);case"SphereGeometry":case"SphereBufferGeometry":return function(e){return new o((e.metadata?e.metadata.parameters:e.parameters).radius)}(y);case"TubeGeometry":case"Geometry":case"BufferGeometry":return d(f);default:return console.warn('Unrecognized geometry: "%s". Using bounding box as shape.',y.type),l(y)}};function l(t){if(!x(t).length)return null;t.computeBoundingBox();var r=t.boundingBox;return new e(new a((r.max.x-r.min.x)/2,(r.max.y-r.min.y)/2,(r.max.z-r.min.z)/2))}function d(t){var r,n,o=new THREE.Box3,i=t.clone();return i.quaternion.set(0,0,0,1),i.updateMatrixWorld(),o.setFromObject(i),isFinite(o.min.lengthSq())?(r=new e(new a((o.max.x-o.min.x)/2,(o.max.y-o.min.y)/2,(o.max.z-o.min.z)/2)),(n=o.translate(i.position.negate()).getCenter(new THREE.Vector3)).lengthSq()&&(r.offset=n),r):null}function p(e){var t,r,n=function(e){var t=[];return e.traverse(function(e){"Mesh"===e.type&&t.push(e)}),t}(e),o=new THREE.Geometry,i=new THREE.Geometry;if(0===n.length)return null;if(1===n.length){var s=new THREE.Vector3,a=new THREE.Quaternion,u=new THREE.Vector3;return n[0].geometry.isBufferGeometry?n[0].geometry.attributes.position&&n[0].geometry.attributes.position.itemSize>2&&o.fromBufferGeometry(n[0].geometry):o=n[0].geometry.clone(),o.metadata=n[0].geometry.metadata,n[0].updateMatrixWorld(),n[0].matrixWorld.decompose(s,a,u),o.scale(u.x,u.y,u.z)}for(;r=n.pop();)if(r.updateMatrixWorld(),r.geometry.isBufferGeometry){if(r.geometry.attributes.position&&r.geometry.attributes.position.itemSize>2){var c=new THREE.Geometry;c.fromBufferGeometry(r.geometry),i.merge(c,r.matrixWorld),c.dispose()}}else i.merge(r.geometry,r.matrixWorld);return(t=new THREE.Matrix4).scale(e.scale),i.applyMatrix(t),i}function x(e){return e.attributes||(e=(new THREE.BufferGeometry).fromGeometry(e)),(e.attributes.position||{}).array||[]}f.Type=m;export{f as threeToCannon};
//# sourceMappingURL=three-pathfinding.module.js.map
