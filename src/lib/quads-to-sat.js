var THREE = require('./three/three.js');
var SAT = require('sat');

// generate a SAT Polygon from a THREE.PlaneBufferGeometry object
module.exports.planeBufferToPolygon = function planeBufferToPolygon (mesh, planeGeometry){
  var pos = planeGeometry.attributes.position.array;

  return new SAT.Polygon(new SAT.Vector(mesh.position.x, mesh.position.y), [
      new SAT.Vector(pos[0], pos[1]),
      new SAT.Vector(pos[6], pos[7]),
      new SAT.Vector(pos[9], pos[10]),
      new SAT.Vector(pos[3], pos[4])
    ]);
};

  
// generate 
module.exports.generateEnvironmentColliders = function generateEnvironmentColliders (geometry, grid){

  // scene bounding box..
  var bMinX, bMinY, bMaxX, bMaxY = false;

  // quad bounding box...
  var minX, maxX, minY, maxY = false;

  for (var i = 0; i < geometry.faces.length / 2; i++){

    // get the quad top left, bottom left, bottom right, top right...
    var face1 = geometry.faces[i * 2];
    var face2 = geometry.faces[i * 2 + 1];

    var ps = [];

    minX, maxX, minY, maxY = false;

    ps[0] = geometry.vertices[face1.a];
    ps[1] = geometry.vertices[face1.b];
    ps[2] = geometry.vertices[face2.b];
    ps[3] = geometry.vertices[face1.c];

    // now we need to calculate the bounding box for it...

    minX = minY = Infinity;
    maxX = maxY = -Infinity;

    for (var j = 0; j < 4; j++){
      if (!minX || ps[j].x < minX) minX = ps[j].x;
      if (!maxX || ps[j].x > maxX) maxX = ps[j].x;

      if (!minY || ps[j].y < minY) minY = ps[j].y;
      if (!maxY || ps[j].y > maxY) maxY = ps[j].y;
    }

    // generate a bounding box box...
    var box = new THREE.Box3(new THREE.Vector3(minX, minY, 0), new THREE.Vector3(maxX, maxY, 0));

    var size = box.size(), center = box.center();

    // generate a SAT polygon...
    var p = new SAT.Polygon(new SAT.Vector(), [
        new SAT.Vector(ps[0].x, ps[0].y),
        new SAT.Vector(ps[1].x, ps[1].y),
        new SAT.Vector(ps[2].x, ps[2].y),
        new SAT.Vector(ps[3].x, ps[3].y)
      ]);

    // point the box to its more detailed polygon...
    box.entity = {
      collider : p,
      'static' : true
    }

    // static bounding boxes don't collide with other static bounding boxes.. 
    box['static'] = true;

    // add this to the provided grid...
    grid.addObject(box);

    if (!bMinX || minX < bMinX) bMinX = minX;
    if (!bMaxX || maxX > bMaxX) bMaxX = maxX;

    if (!bMinY || minY < bMinY) bMinY = minY;
    if (!bMaxY || maxY > bMaxY) bMaxY = maxY;

  }

  return {
    min : [bMinX, bMinY],
    max : [bMaxX, bMaxY]
  };

} 

