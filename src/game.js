var THREE = require('../lib/three/three.js');


// hidden away deep inside a closure.

module.exports.initialiseGame = function initialiseGame (scene, camera, glowScene, pipe, gameTime, assets, postProcessing){


  // scenes!
  var gameScene = new THREE.Object3D();
  var gameGlowScene = new THREE.Object3D();

  // callback containers
  var fns = {};

  return {

    on : on,

    trigger : trigger,

    create : function (difficulty, arcade, standingHighScore){
      /*
        This is to be called when the Game now begins to control the screen.
      */

    },

    newSession : newSession,

    suicide : function (){
      /*
        This is called when a session is in progress and is aborted by the user.
      */
    },

    update : function (time, elapsedms){
      /*
          main game loop goes here
      */

    },

    destroy : destroy
  }

  function destroy (){
      /*
        This is to be called when the Game gives up control of the screen.
      */

  };

  function newSession (){

    // this is called externally or whenever the user chooses to start a new session after dying

  };

  function endSession (){

    // this is called when the player quits or dies.

  };

  function on (events){
    for (var event in events){
      if (events.hasOwnProperty(event)) fns[event] = events[event];
    }
  };

  function trigger (event){
    if (fns[event]) fns[event].apply(this, Array.prototype.slice.call(arguments, 1));
  };

}