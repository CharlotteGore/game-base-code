var THREE = require('../lib/three/three');

var SAT = require('sat');
var HSHG = require('../lib/hshg');
var satUtils = require('../lib/quads-to-sat');

var createTween = require('../lib/create-tweener');
var Easer = require('functional-easing').Easer;

var createText = require('../lib/text-to-tex').createTextMesh;

var dummyMaterial = new THREE.MeshBasicMaterial({
    color: 0x00ff00,
    wireframe: true
});

var entityConfigs = {
  "1" : {
    teleportTo : (new THREE.Vector3(-2,5,0))
  }
}
  // example player entity...

module.exports = function createDummy(scene, id){


    var jumpEase = new Easer().using('out-expo');
    var tween = createTween(10, 30);

    var geometry = new THREE.PlaneBufferGeometry(1, 1);
    var mesh = new THREE.Mesh(geometry, dummyMaterial);

    var collider = satUtils.planeBufferToPolygon(mesh, geometry);
    var box = new THREE.Box3(new THREE.Vector3(0,0,0), new THREE.Vector3(0,0));

    box['static'] = true;

    var sign = createText('Hello You', 20, 'pt Lucida Grande', '#FFFFFF');
    sign.position.set(-3,6, 0);
    sign.scale.set(0.02, 0.02, 1);

    setPosition(new THREE.Vector3(0,0,0));

    var collided = false;
    var inCollisionWithPlayer = false;

    // flags...
    var entity = {
      collider : collider,
      isPlayer : false,
      box : box,
      id : 'dummy' + id,
      create : function (initialPosition){
        setPosition(initialPosition);
        scene.add(mesh);
        scene.add(sign);
      },
      destroy : function (){
        scene.remove(mesh);
      },
      update : function (now, delta){

        // this is how you debounce collisions... 
        // no collisions since we last ran update?
        // well, we can't be collided with the player...
        if (!collided){
          inCollisionWithPlayer = false;
        }
        // reset the collision flag
        collided = false;

      },
      resolveCollision : function (entity, response, now){
        if (entity.isPlayer){
          // are we not current collided with the player? 
          if (!inCollisionWithPlayer){
            inCollisionWithPlayer = true;
            entity.position(entityConfigs[id].teleportTo)
          }
        }
        // 
        collided = true;

      },
      position : function (pos){
        if (!pos){
          return mesh.position
        } else {
          // update the grid bounding box...
          setPosition(pos);
        }
      },

    }

    box.entity = entity;

    function setPosition (pos){

      mesh.position.x = pos.x;
      mesh.position.y = pos.y;
      mesh.position.z = pos.z;

      // update the detailed collider... (although for a simple plane like this we don't really need to..)
      collider.pos = new SAT.Vector(pos.x, pos.y);

      // update the bounding box top left/bottom right coords.. 
      box.min.x = mesh.position.x - 0.5;
      box.min.y = mesh.position.y - 0.5; 
      box.max.x = mesh.position.x + 0.5;
      box.max.y = mesh.position.y + 0.5;

    };

    return entity;

  }