var THREE = require('../lib/three/three');

var SAT = require('sat');
var HSHG = require('../lib/hshg');
var satUtils = require('../lib/quads-to-sat');

var createTween = require('../lib/create-tweener');
var Easer = require('functional-easing').Easer;

var inputs = require('../lib/input-aggregator');

var playerMaterial = new THREE.MeshBasicMaterial({ ambient : 0xffffff });

function clamp(val, min, max) {
  return Math.min(Math.max(val, min), max);
};

  // example player entity...
module.exports = function createPlayer(scene){


    var jumpEase = new Easer().using('out-expo');
    var tween = createTween(10, 30);

    //var geometry = new THREE.PlaneBufferGeometry(1, 1);

    var geometry = new THREE.CircleGeometry(0.5);


    var mesh = new THREE.Mesh(geometry, playerMaterial);

    var collider = new SAT.Circle(new SAT.Vector(0,0), 0.5);//satUtils.planeBufferToPolygon(mesh, geometry);
    var box = new THREE.Box3(new THREE.Vector3(0,0,0), new THREE.Vector3(0,0));

    collider.isCircle = true;

    var velocity = new THREE.Vector3(0,0,0);

    var collisionPairs = [];

    setPosition(new THREE.Vector3(0,0,0));
    setVelocity(new THREE.Vector3(0,0,0));

    var down = new SAT.Vector(0,-1);

    // flags...
    var pressedUpAt = false;
    var onGround = false;
    var launched = false;
    var collided = false;

    var previousPosition = new THREE.Vector3();
    var direction = new THREE.Vector3();

    var lineMaterial = new THREE.LineBasicMaterial({
        color: 0xffffff,
        lineWidth : 4
    });

    var lineGeo = new THREE.Geometry();
    lineGeo.vertices.push(new THREE.Vector3(-0.5, 0, 0));
    lineGeo.vertices.push(new THREE.Vector3(0.5,0, 0));

    var line = new THREE.Line(lineGeo, lineMaterial);

    //mesh.add(line);
    line.position.set(0,-0.5,-0.2);

    var entity = {
      collider : collider,
      isPlayer : true,
      box : box,
      mesh : mesh,
      create : function (initialPosition){
        setPosition(initialPosition);
        scene.add(mesh);
      },
      destroy : function (){
        scene.remove(mesh);
      },
      update : function (now, delta){

        // get inputs and update velocity etc.. 
        if (!collided){
          onGround = false;
        }

        previousPosition.copy(mesh.position);

        if ((collided && (inputs.up && now < (onGround + 0.1))) || (inputs.up && launched)){
          if (!pressedUpAt){
            launched = true;
            pressedUpAt = now;
          }
          var progress = Math.min(1, (now - pressedUpAt) / 0.1);
          if (progress === 1){
            launched = false;
            pressedUpAt = false;
          } else {
            velocity.y = tween(jumpEase(progress));
          }
          
        } else if (inputs.down){
          velocity.y -= 0.5;
        }

        // apply gravity..
        velocity.y -= 0.9;
        
        if (inputs.left){
          velocity.x -= 0.5;
        } else if (inputs.right){
          velocity.x += 0.5
        } else {
          if (velocity.x > 0.1){
            velocity.x -= 0.1;
          } else if (velocity.x < -0.1){
            velocity.x += 0.1;
          } else if (velocity.x < 0.1 && velocity.x > -0.1){
            velocity.x = 0;
          }
        }

        // call the velocity setter for clamping..
        setVelocity(velocity);

        // call the position setter to update the bounding box and the SAT polygon as well as the mesh...
        setPosition(new THREE.Vector3(mesh.position.x + (velocity.x * delta * 2), mesh.position.y + (velocity.y * delta * 2), 0));

        // reset the collided flag....
        collided = false;

      },
      resolveCollision : function (entity, response, now){
        if (!entity.resolveCollision){ // is



          // we've collided with an environment...
          mesh.position.x -= (response.overlapV.x);
          mesh.position.y -= (response.overlapV.y);

         // if (!onGround){

            // bounce effect!

         //   direction.copy(velocity); //.normalize();

         //   var perp = new SAT.Vector().copy(response.overlapN); //.perp();
         //   perp = new THREE.Vector3(perp.x, perp.y, 0);

         //   direction.reflect(perp); //.normalize();


        //    setVelocity(direction.multiplyScalar(0.75))

         // } else {

            // subtract the collision from the velocity vector as well.. fixes sticky things...

            velocity.x -= (response.overlapV.x);
            velocity.y -= (response.overlapV.y);

         // }

          var dp = response.overlapN.dot(down)
          if (dp > 0 && Math.acos(dp) < 0.3){
            if (!onGround){

              //console.log('have hit the ground')

            }
              /*
              var perp = new SAT.Vector().copy(response.overlapN).perp();

              var bl = new SAT.Vector(-0.5, -0.5);
              var br = new SAT.Vector(0.5, -0.5);

              bl.projectN(perp);
              br.projectN(perp);

              if(bl.y < 0){
                mesh.geometry.attributes.position.array[7] = -0.5 + (bl.y );
                mesh.geometry.attributes.position.needsUpdate = true;
              }

              if (br.y < 0){

                mesh.geometry.attributes.position.array[10] = -0.5 + (br.y );
                mesh.geometry.attributes.position.needsUpdate = true;
              }
              */
            onGround = now;
          } 

          setPosition(mesh.position);

        }// else {
          // we've collided with an entity... 
          //console.log('collided with entity', entity)
        //}
        collided = true;
      },
      velocity : function (vel){
        if (!vel){
          return velocity;
        } else {
          setVelocity(vel);
        }
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

    box.entity = entity;

    function setPosition (pos){

      mesh.position.x = pos.x;
      mesh.position.y = pos.y;
      mesh.position.z = -0.2;

      // update the detailed collider... (although for a simple plane like this we don't really need to..)
      collider.pos = new SAT.Vector(pos.x, pos.y)

      // update the bounding box top left/bottom right coords.. 
      box.min.x = mesh.position.x - 0.5;
      box.min.y = mesh.position.y - 0.5; 
      box.max.x = mesh.position.x + 0.5;
      box.max.y = mesh.position.y + 0.5;

    };

    function setVelocity (vel){

      velocity.x = vel.x;
      velocity.y = vel.y;
      velocity.z = vel.z;

      // clamp velocity.. 
      velocity.x = clamp(velocity.x, -20, +20);
      velocity.y = clamp(velocity.y, -20, +20);

    };

    return entity;

  }