var THREE = require('../lib/three/three.js');

module.exports.initEntities = function (container){

  // generate meshes in advance here

}

module.exports.createEntity = function createEntity (){

  var mesh = new THREE.Object3d();

  // setup..

  // flags

  // job done means it has 'succeeded in its mission'... killed the player perhaps
  var jobDone = false;
  // destroyed is when the entity has cleaned itself up..
  var destroyed = false;
  // beenKilled is when the player has destroyed this entity...
  var beenKilled = false;



  // callbacks/events
  var fns = {};

  function on (events){
    for (var event in events){
      if (events.hasOwnProperty(event)) fns[event] = events[event];
    }
  };

  function trigger (event){
    if (fns[event]) fns[event].apply(this, Array.prototype.slice.call(arguments, 1));
  };

  return {

    on : on,

    trigger : trigger,

    update : function (now){

      // called every tick

    },

    resolveCollisions : function (entity, response){


    },

    destroy : function (){

      // when finished with

    },

    die : function (){

      // game engine can tell the entity it is dead?
      beenKilled = true;

    },

    isDead : function (){
      return beenKilled;
    },

    isDestroyed : function (){
      return destroyed;
    },

    isDone : function (){
      return jobDone;
    },

    position : function (pos){
      if (!pos){
        return mesh.position
      } else {
        // update the grid bounding box...
        setPosition(pos);
      }
    }
  

  }



};