var THREE = require('./lib/three/three.js');
var Pipeline = require('./lib/pipeline.js');
var Detector = require('./lib/three/detector.js');
var Stats = require('./lib/three/stats.min.js');

var tick = require('animation-loops');

var tick = require('tick');
var gameTime = {
  now : tick.now(),
  start : tick.now()
};

function Game (element){

  if ( ! Detector.webgl ) {

    Detector.addGetWebGLMessage();
    return false;

  }

  element.appendChild(this.initialise());

  // create whatever it is that's going to use the scene and the camera..
  // var level = new Level(scene, camera, pipe);

  tick.add((function tickHandler(elapsed, delta, stop){

    // level.update(elapsed, delta);

    this.pipe.render();

  }).bind(this));

}

Game.prototype = {

  initialise : function (){

    var self = this;

    var width = window.innerWidth;
    var height = window.innerHeight;

    // renderer
    this.renderer = new THREE.WebGLRenderer({ antialias : false});
    this.renderer.setSize(width, height);

    // camera...

    this.camera = new THREE.PerspectiveCamera( 30, width / height, 1, 10000 );
    this.camera.position.z = 450;
    this.camera.target = new THREE.Vector3( 0,0,-50);

    // scene..
    this.scene = new THREE.Scene();

    // create rendering pipeline..
    this.pipe = new Pipeline(this.scene, this.camera);

    // disable right click..
    window.oncontextmenu = function(event) {
      event.preventDefault();
      event.stopPropagation();
      return false;
    };

    // add some sort of resize handler here... 

    return this.renderer.domElement;

  }

}

var container = document.createElement('section');
document.body.appendChild(container);

new Game(container);