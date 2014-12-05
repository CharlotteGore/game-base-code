var THREE = require('./three/three.js');
var Easer = require('functional-easing').Easer;
var createTween = require('./create-tweener.js');

module.exports = function cameraMan (fov, aspect, near, far){

  var camera = new THREE.PerspectiveCamera(fov, aspect, near, far);

  var position = new THREE.Vector3();
  var lookAt = new THREE.Vector3(0,0,0);
  var upAngle = 0;

  //var modifiedPosition = new THREE.Vector3(0,1,0);
  //var modifiedLookAt = new THREE.Vector3(0,1,0);
  //var modifiedUp = new THREE.Vector3(0,1,0);

  //var modifiedUp = new THREE.Vector3(0,1,0)

  var movers = [], previousMover = false;

  var dollyEase = new Easer().using('in-out-sine');

  var dolly, pivot, shake;

  /*
    Camera model:
  */

  mode = 0;

  return {

    camera : camera,

    pivot : function (speed, radius, lookAt) {

      if (pivot){
        pivot.complete = true;
      }

      pivot = {
        start : false,
        complete : false,
        fn : pivotMover.bind(null, speed, radius, lookAt)
      }

      movers.push(pivot);

    },
    shake : function (strength, duration){

      if (shake){
        shake.complete = true;
      }

      shake = {
        start : false,
        complete : false,
        fn : shakeMover.bind(null, strength, duration)
      }

      movers.push(shake);

      return;

    },
    zoomTo : function (focalLength, duration){

    },
    pedestalTo : function (y, duration){

    },
    dollyTo : function (z, duration){

      var tween = createTween(position.z, z);

      if (dolly){
        dolly.complete = true;
      }

      dolly = {
        start : false,
        complete : false,
        fn : dollyMover.bind(null, tween, z, duration)
      }

      movers.push(dolly);
    },
    truckTo : function (x, duration){

    },
    update : function (now, elapsedms){

      var toBeDeleted = [];
      var modifiers = [];
      // run the movers...
      for (var i = 0; i < movers.length; i++){
        if (movers[i].complete){
          toBeDeleted.push(movers[i]);
        } else {
          if (!movers[i].start){
            movers[i].start = now;
          }
          var m = movers[i].fn(movers[i].start, now, elapsedms)
          if (m.complete){
            movers[i].complete = true;
          } else {
            modifiers.push(m);
          }

        }
      }

      var modPosition = new THREE.Vector3();
      var modLookAt = new THREE.Vector3();
      var modUp = 0;

      // get any relative modifications...
      for (var i = 0; i < modifiers.length; i++){
        if (modifiers[i].position){
          modPosition.x += modifiers[i].position.x;
          modPosition.y += modifiers[i].position.y;
          modPosition.z += modifiers[i].position.z;
        }
        if (modifiers[i].lookAt){
          modLookAt.x += modifiers[i].lookAt.x;
          modLookAt.y += modifiers[i].lookAt.y;
          modLookAt.z += modifiers[i].lookAt.z;
        }
        if (modifiers[i].up){
          modUp += modifiers[i].up;
        }
      }

      // update the actual camera's position, up vector and lookAt vector...

      camera.position.x = position.x + modPosition.x;
      camera.position.y = position.y + modPosition.y;
      camera.position.z = position.z + modPosition.z;

      // we 
      var angle = upAngle += modUp;
      var upVector = new THREE.Vector3(Math.sin(angle), Math.cos(angle), 0);
      camera.up.x = upVector.x;
      camera.up.y = upVector.y;
      camera.up.z = upVector.z;

      modLookAt.x += lookAt.x;
      modLookAt.y += lookAt.y;
      modLookAt.z += lookAt.z;

      camera.lookAt(modLookAt);

      // clear up finished movers...
      for (var i = 0; i < toBeDeleted.length; i++){
        movers.splice(movers.indexOf(toBeDeleted[i]), 1);
      }

    },
    setPosition : function (newPos){

      camera.position.x = position.x = newPos.x;
      camera.position.y = position.y = newPos.y;
      camera.position.z = position.z = newPos.z;

      // cancel any existing operations...
      movers = [];

    },
    lookAt : function (newLookAt){

      lookAt.x = newLookAt.x;
      lookAt.y = newLookAt.y;
      lookAt.z = newLookAt.z;
      
      camera.lookAt(newLookAt);

      // cancel any existing operations...
      movers = [];
    }

  };

  function shakeMover (strength, duration, started, now, elapsedms){
    // shake modifies only the modified versions
    var progress = Math.min(1, (now - started) / duration);
    var angle;

    if (!shake.angles){
      shake.angles = [];
      angle = Math.random() * Math.PI;
      shake.angles.push(angle);
      shake.angles.push(angle += Math.PI / 16);
      shake.angles.push(angle += Math.PI / 16);
      shake.angles.push(angle += Math.PI / 16);
    }

    if (progress < 0.125){

      strength = strength;
      progress = progress / 0.125
      angle = shake.angles[0];


    } else if (progress < 0.25){

      strength = strength * .5
      progress = (progress - 0.25) / 0.125; //(0.75 - 0.5);
      angle = shake.angles[1];

    } else if (progress < 0.5){

      strength = strength * .25
      progress = (progress - 0.25) / 0.25;//(0.875 - 0.75);
      angle = shake.angles[2];

    } else {
      strength = strength * 0.125;
      progress = Math.min(1,(progress - 0.5) / 0.5); //(1 - 0.875);
      angle = shake.angles[3];

      if (progress === 1){
        return {
          complete : true
        }
      }

    }
    // we want the progress to be from the negative to the positive
    progress = Math.sin((Math.PI * 2) * progress);

    var radius = strength * progress;

    var modPos = new THREE.Vector3(Math.sin(0.5) * radius, Math.cos(0.5) * radius, 0);
    var modLookAt = modPos.clone().multiplyScalar(4);

    return {
      position : modPos,
      lookAt : modLookAt
    }

  }

  function pivotMover (speed, radius, newLookAt, started, now, elapsedms){

    var modPos = new THREE.Vector3();
    var modLook = new THREE.Vector3();

    // pivot operates relatively on the position...
    modPos.y = Math.sin((now) * speed) * radius;
    modPos.x = Math.cos((now) * speed) * radius;
    modPos.z = 0;

    // but absolutely on the lookAt
    lookAt.x = newLookAt.x;
    lookAt.y = newLookAt.y;
    lookAt.z = newLookAt.z;

    return {
      position : modPos,
      complete : false
    }

  }

  function dollyMover (tween, z, duration, started, now, elapsedms){
    // dollyMover updates the base position
    var progress = Math.min(1, (now - started) / duration);
    var z = tween(dollyEase(progress));

    position.z = z;

    return {
      complete : (progress === 1 ? true : false)
    }
  }

  function truckMover (){
    // truckMover updates the base position 
  }

}