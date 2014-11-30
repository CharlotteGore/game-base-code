var THREE = require('./lib/three/three.js');

var tick = require('animation-loops');
var gameTime = {
  now : tick.now(),
  start : tick.now()
};


var Detector = require('./lib/three/detector.js');
var Stats = require('./lib/three/stats.min.js');

var Pipeline = require('./lib/pipeline.js');
var assetLoader = require('./lib/load-all-assets.js');
var inputs = require('./lib/input-aggregator.js');

function WebGLApplication ( element ){

  this.postProcessing = true;

  var stats = new Stats();
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.top = '0px';
  document.body.appendChild( stats.domElement );

  if (! Detector.webgl){
    Detector.addGetWebGLMessage();
    return false;
  }

  document.querySelector('header').style.display = "none";

  element.appendChild(this.initialisePipeline());

  var mode = "loading";

  // load any assets...
  assetLoader((function (err, assets){

    mode = "loaded"; 

  }).bind(this));

  // add a tick handler. This is our 60fps. 
  tick.add((function tickHandler (elapsed){

    stats.update();

    gameTime.now = .00025 * (tick.now() - gameTime.start);

    if (mode === "loading"){
      // update the loader...
    } else if (mode === "loaded"){
      // update the game or whatever
    }

    this.pipe.render(this.postProcessing);

  }).bind(this));

  return this;

}

WebGLApplication.prototype = {

  initialisePipeline : function pipelineInitialiser (element){

    var width = window.innerWidth ;
    var height = (width / 16) * 9 ;

    if (height > window.innerHeight){
      height = window.innerHeight;
      width = (height / 9) * 16;
    }

    // renderer
    this.renderer = new THREE.WebGLRenderer({ antialias : false, devicePixelRatio : 1});
    this.renderer.setSize(width, height);

    // camera...

    this.camera = new THREE.PerspectiveCamera( 25, width / height, 1, 3000 );
    this.camera.position.z = 100;
    this.camera.target = new THREE.Vector3( 0,0,0 );

    if (this.postProcessing){
      this.scene = new THREE.Scene();
      this.glowScene = new THREE.Scene();
    } else {
      this.scene = this.glowScene = new THREE.Scene();
    }

    // create rendering pipeline..
    this.pipe = new Pipeline(this.renderer, this.scene, this.camera, this.glowScene, width, height);

    // disable right click..
    window.oncontextmenu = function (event) {
      event.preventDefault();
      event.stopPropagation();
      return false;
    };

    this.pipe._dims = {
      width: width, 
      height : height
    }

    // add some sort of resize handler here... 

    return this.renderer.domElement;

  }

}

new WebGLApplication(document.getElementById('screen'));


